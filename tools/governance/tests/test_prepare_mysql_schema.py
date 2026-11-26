import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from prepare_mysql_schema import split_schema


class PrepareMysqlSchemaTests(unittest.TestCase):
    def test_separates_examples_and_removes_only_obsolete_column(self):
        sql = """
DROP TABLE IF EXISTS `system_operate_log`;
CREATE TABLE `system_operate_log` (
  `id` bigint NOT NULL,
  `success` bit(1) NOT NULL DEFAULT b'1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
CREATE TABLE `yudao_demo_example` (
  `id` bigint NOT NULL,
  `success` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
"""
        platform, examples = split_schema(sql)
        self.assertIn("`system_operate_log`", platform)
        self.assertNotIn("`success`", platform)
        self.assertNotIn("DROP TABLE", platform + examples)
        self.assertNotIn("`yudao_demo_example`", platform)
        self.assertIn("`success`", examples)
        self.assertIn("`yudao_demo_example`", examples)

    def test_rejects_duplicate_table_and_missing_success(self):
        with self.assertRaises(ValueError):
            split_schema("CREATE TABLE `x` (`id` int) ENGINE=InnoDB; CREATE TABLE `x` (`id` int) ENGINE=InnoDB;")
        with self.assertRaises(ValueError):
            split_schema("CREATE TABLE `system_operate_log` (`id` int) ENGINE=InnoDB;")
