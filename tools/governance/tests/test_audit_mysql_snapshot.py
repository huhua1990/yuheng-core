import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from audit_mysql_snapshot import audit_snapshot


class AuditMysqlSnapshotTests(unittest.TestCase):
    def test_extracts_tables_columns_indexes_and_insert_counts(self):
        sql = """
CREATE TABLE `system_example` (
  `id` bigint NOT NULL,
  `tenant_id` bigint NOT NULL DEFAULT 0,
  `name` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  INDEX `idx_tenant` (`tenant_id`)
) ENGINE=InnoDB;
INSERT INTO `system_example` (`id`) VALUES (1);
INSERT INTO `system_example` (`id`) VALUES (2);
"""
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "snapshot.sql"
            source.write_text(sql)
            result = audit_snapshot(source)

        self.assertEqual(len(result), 1)
        table = result[0]
        self.assertEqual(table.name, "system_example")
        self.assertEqual(table.columns, ["id", "tenant_id", "name"])
        self.assertEqual(table.primary_key, ["id"])
        self.assertEqual(table.indexes, ["uk_name", "idx_tenant"])
        self.assertEqual(table.insert_statements, 2)
        self.assertEqual(table.insert_rows, 2)
        self.assertFalse(table.parse_warnings)

    def test_reports_unparsed_create_blocks_without_dropping_them(self):
        sql = "CREATE TABLE `odd` (\n  id bigint\n);"
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "snapshot.sql"
            source.write_text(sql)
            result = audit_snapshot(source)

        self.assertEqual([table.name for table in result], ["odd"])
        self.assertIn("no recognized column definitions", result[0].parse_warnings)

    def test_counts_multi_value_inserts_as_rows_and_flags_legacy_runtime_markers(self):
        sql = """
CREATE TABLE `QRTZ_JOB_DETAILS` (
  `JOB_NAME` varchar(80) NOT NULL,
  PRIMARY KEY (`JOB_NAME`)
) ENGINE=InnoDB;
INSERT INTO `QRTZ_JOB_DETAILS` (`JOB_NAME`, `JOB_CLASS_NAME`) VALUES
  ('jobA', 'cn.iocoder.yudao.OldHandler'),
  ('jobB', 'cn.iocoder.yudao.OldHandler');
"""
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "quartz.sql"
            source.write_text(sql)
            result = audit_snapshot(source)

        self.assertEqual(result[0].insert_statements, 1)
        self.assertEqual(result[0].insert_rows, 2)
        self.assertTrue(any("legacy Java namespace cn.iocoder.yudao" in warning for warning in result[0].content_warnings))

    def test_ignores_comments_and_parentheses_or_semicolons_in_values(self):
        sql = """
-- INSERT INTO `example` (`id`) VALUES (99);
CREATE TABLE `example` (
  `id` bigint NOT NULL,
  `note` varchar(80),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
INSERT INTO `example` (`id`, `note`) VALUES
  (1, 'literal (parentheses); and it\\'s escaped'),
  (2, 'doubled '' quote )'); /* fake INSERT INTO `example` (`id`) VALUES (3); */
"""
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "snapshot.sql"
            source.write_text(sql)
            result = audit_snapshot(source)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].insert_statements, 1)
        self.assertEqual(result[0].insert_rows, 2)

    def test_does_not_flag_legacy_namespace_inside_comments(self):
        sql = """
CREATE TABLE `example` (`id` bigint, PRIMARY KEY (`id`)) ENGINE=InnoDB;
-- cn.iocoder.yudao is only a historical note
INSERT INTO `example` (`id`) VALUES (1);
"""
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "snapshot.sql"
            source.write_text(sql)
            result = audit_snapshot(source)

        self.assertFalse(result[0].content_warnings)


if __name__ == "__main__":
    unittest.main()
