import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from prepare_mysql_seed import sanitize_insert


class SeedSanitizationTests(unittest.TestCase):
    def test_clears_password_without_damaging_other_values(self):
        result = sanitize_insert("INSERT INTO `system_users` (`id`, `password`, `nickname`) VALUES (1, 'oldhash', 'a,b')")
        self.assertEqual(result, "INSERT INTO `system_users` (`id`, `password`, `nickname`) VALUES (1, '', 'a,b')")

    def test_scrubs_embedded_file_config_and_updates_class(self):
        source = '''INSERT INTO `infra_file_config` (`id`, `config`) VALUES (1, '{"@class":"cn.iocoder.yudao.module.infra.X","accessKey":"key","accessSecret":"secret","domain":"example"}')'''
        result = sanitize_insert(source)
        self.assertNotIn('"key"', result)
        self.assertNotIn('"secret"', result)
        self.assertIn('com.yuheng.platform.module.infra.X', result)
        self.assertIn('"domain":"example"', result)

    def test_rejects_unsupported_multivalue_input(self):
        with self.assertRaises(ValueError):
            sanitize_insert("INSERT INTO `system_users` (`id`) VALUES (1), (2)")

    def test_scrubs_mysql_escaped_json_credentials(self):
        source = r'''INSERT INTO `infra_file_config` (`config`) VALUES ('{\"@class\":\"cn.iocoder.yudao.module.infra.X\",\"accessKey\":\"examplekey\",\"accessSecret\":\"examplesecret\"}')'''
        result = sanitize_insert(source)
        self.assertNotIn('examplekey', result)
        self.assertNotIn('examplesecret', result)
        self.assertIn('com.yuheng.platform.module.infra.X', result)
