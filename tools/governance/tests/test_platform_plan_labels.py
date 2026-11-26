"""Opt-in MySQL regression checks; never targets a shared schema."""
import json
import os
import re
import subprocess
import unittest
from pathlib import Path


FIXTURE = Path(__file__).parent / 'fixtures/platform_plan_labels.json'
MIGRATIONS = Path(__file__).resolve().parents[3] / 'yuheng-server/src/main/resources/db/changelog/yuheng-core/mysql'
SCHEMA = os.environ.get('YUHENG_SEED_TEST_SCHEMA', '')


def mysql(sql):
    if not re.fullmatch(r'yuheng_t3_remaining_[0-9]{8}', SCHEMA):
        raise ValueError('Only the dedicated remaining-page verification schema is allowed')
    result = subprocess.run(
        ['docker', 'exec', '-i', 'mysql8', 'sh', '-c',
         'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot --default-character-set=utf8mb4 -N -B -D ' + SCHEMA],
        input=sql, text=True, capture_output=True, check=True,
    )
    return result.stdout.strip().splitlines()


def literal(value):
    return 'CONVERT(0x' + value.encode().hex().upper() + ' USING utf8mb4)'


def assertion_sql(items):
    return '\n'.join(
        f"SELECT BINARY `{item['column']}` = BINARY {literal(item['new'])} "
        f"FROM `{item['table']}` WHERE id = {item['id']};"
        for item in items
    )


def sql_blocks():
    text = (MIGRATIONS / '009-fix-platform-plan-labels.yaml').read_text()
    # Liquibase validates the YAML. Extract only its literal SQL blocks.
    blocks = re.findall(r'(?m)^            sql: \|\n((?:              .*\n)+)', text)
    if len(blocks) != 2:
        raise AssertionError('Expected forward and rollback SQL blocks')
    return ['\n'.join(line[14:] for line in block.splitlines()) for block in blocks]


class PlanLabelsRegistrationTests(unittest.TestCase):
    def test_registered_repair_has_exact_fixture_scope(self):
        items = json.loads(FIXTURE.read_text())
        self.assertEqual(len(items), 43)
        self.assertIn('file: 009-fix-platform-plan-labels.yaml',
                      (MIGRATIONS / 'changelog.yaml').read_text())
        forward, backward = sql_blocks()
        for sql, source, target in ((forward, 'old', 'new'), (backward, 'new', 'old')):
            updates = [line for line in sql.splitlines() if line.startswith('UPDATE ')]
            self.assertEqual(len(updates), len(items))
            for item, update in zip(items, updates):
                self.assertTrue(update.startswith(
                    f"UPDATE `{item['table']}` SET `{item['column']}` = {literal(item[target])},"))
                self.assertIn(f"WHERE `id` = {item['id']} AND ", update)
                self.assertIn(f"BINARY `{item['column']}` = BINARY {literal(item[source])};", update)
                self.assertIn('`update_time` = `update_time`', update)


@unittest.skipUnless(SCHEMA, 'Requires explicit dedicated MySQL verification schema')
class PlatformPlanLabelsTests(unittest.TestCase):
    def test_labels_match_audited_source(self):
        items = json.loads(FIXTURE.read_text())
        self.assertEqual(len(items), 43)
        self.assertEqual(mysql(assertion_sql(items)), ['1'] * len(items),
                         'Platform labels must match their original snapshot values')

    def test_guarded_repair_and_rollback_preserve_custom_values(self):
        forward, backward = sql_blocks()
        items = json.loads(FIXTURE.read_text())
        custom = items[0]
        resets = '\n'.join(
            f"UPDATE `{i['table']}` SET `{i['column']}`={literal(i['old'])}, update_time=update_time WHERE id={i['id']};"
            for i in items
        )
        # Entire experiment is one connection/transaction; even failed assertions
        # cannot commit its fixture edits. No production migration is run here.
        probe = (
            'START TRANSACTION;\n'
            'SET SESSION group_concat_max_len=1048576;\n'
            "SET @before_time=(SELECT update_time FROM infra_config WHERE id=21);\n"
            "SET @before_users=(SELECT SHA2(GROUP_CONCAT(CONCAT(id, ':', password) ORDER BY id SEPARATOR '|'),256) FROM system_users);\n"
            + resets + '\n'
            + f"UPDATE `{custom['table']}` SET `{custom['column']}`='用户自定义计划', update_time=update_time WHERE id={custom['id']};\n"
            + forward + '\n' + forward + '\n'
            + assertion_sql(items[1:]) + '\n'
            + f"SELECT BINARY `{custom['column']}`=BINARY '用户自定义计划' FROM `{custom['table']}` WHERE id={custom['id']};\n"
            + "SELECT update_time=@before_time FROM infra_config WHERE id=21;\n"
            + "SELECT SHA2(GROUP_CONCAT(CONCAT(id, ':', password) ORDER BY id SEPARATOR '|'),256)=@before_users FROM system_users;\n"
            + backward + '\n'
            + '\n'.join(
                f"SELECT BINARY `{i['column']}`=BINARY {literal(i['old'])} FROM `{i['table']}` WHERE id={i['id']};"
                for i in items[1:]
            ) + '\n'
            + f"SELECT BINARY `{custom['column']}`=BINARY '用户自定义计划' FROM `{custom['table']}` WHERE id={custom['id']};\n"
            + 'ROLLBACK;'
        )
        self.assertEqual(mysql(probe), ['1'] * (len(items[1:]) * 2 + 4))
        self.assertEqual(mysql(assertion_sql(items)), ['1'] * len(items))
