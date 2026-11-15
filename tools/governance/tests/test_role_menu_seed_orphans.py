"""Regression checks for the platform role-menu seed referential integrity fix."""
import re
import unittest
from pathlib import Path


MIGRATIONS = Path(__file__).resolve().parents[3] / \
    'yuheng-server/src/main/resources/db/changelog/yuheng-core/mysql'
SEED = MIGRATIONS / '005-platform-seed.sql'
MIGRATION = MIGRATIONS / '010-clean-orphan-platform-role-menus.yaml'


def rows(sql, table):
    pattern = rf"INSERT INTO `{table}` .*?VALUES \(([^;]+)\);"
    return re.findall(pattern, sql)


class PlatformRoleMenuSeedTests(unittest.TestCase):
    def test_migration_is_registered_and_targets_only_seed_orphan_rows(self):
        changelog = (MIGRATIONS / 'changelog.yaml').read_text()
        migration = MIGRATION.read_text() if MIGRATION.exists() else ''
        seed = SEED.read_text()

        self.assertIn('file: 010-clean-orphan-platform-role-menus.yaml', changelog)
        self.assertIn('yuheng-mysql-010-clean-orphan-platform-role-menus', migration)
        menu_ids = {
            int(values.split(',', 1)[0])
            for values in rows(seed, 'system_menu')
        }
        seeded_role_rows = []
        for values in rows(seed, 'system_role_menu'):
            fields = [field.strip() for field in values.split(',')]
            row = tuple(int(fields[index]) for index in (0, 1, 2, 8))
            if row[1] in (1, 2) and row[3] == 1 and row[2] not in menu_ids:
                seeded_role_rows.append(row)

        self.assertEqual(len(seeded_role_rows), 56)
        blocks = re.findall(r'(?m)^            sql: \|\n((?:              .*\n)+)', migration)
        self.assertEqual(len(blocks), 2)
        statements = ['\n'.join(line[14:] for line in block.splitlines()) for block in blocks]
        for statement, deleted in zip(statements, ("b'1'", "b'0'")):
            self.assertIn(f"SET `deleted` = {deleted}", statement)
            self.assertIn("AND `deleted` = " + ("b'0'" if deleted == "b'1'" else "b'1'"), statement)
            self.assertIn('AND NOT EXISTS (', statement)
            self.assertIn('FROM `system_menu`', statement)
            id_block = re.search(r'WHERE `id` IN \((.*?)\)', statement, re.S)
            self.assertIsNotNone(id_block)
            migration_ids = [int(value) for value in re.findall(r'\d+', id_block.group(1))]
            self.assertEqual(migration_ids, [row[0] for row in seeded_role_rows])
            for _, role_id, menu_id, tenant_id in seeded_role_rows:
                self.assertIn(f"`role_id` IN (1, 2)", statement)
                self.assertIn(f"`tenant_id` = {tenant_id}", statement)
                self.assertIn(f"`system_menu`.`id` = `system_role_menu`.`menu_id`", statement)


if __name__ == '__main__':
    unittest.main()
