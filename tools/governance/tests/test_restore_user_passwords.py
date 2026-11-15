import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from restore_user_passwords import make_update


class RestoreUserPasswordsTests(unittest.TestCase):
    def test_restores_only_matching_empty_user_password(self):
        statement = "INSERT INTO `system_users` (`id`, `username`, `password`, `tenant_id`) VALUES (7, 'alice', 'hash', 2)"
        result = make_update(statement)
        self.assertEqual(result, "UPDATE `system_users` SET `password` = 'hash' WHERE `id` = 7 AND `username` = 'alice' AND `tenant_id` = 2 AND `password` = '';")

    def test_rejects_missing_identity_and_nonliteral_values(self):
        with self.assertRaises(ValueError):
            make_update("INSERT INTO `system_users` (`id`, `password`) VALUES (7, 'hash')")
        with self.assertRaises(ValueError):
            make_update("INSERT INTO `system_users` (`id`, `username`, `password`, `tenant_id`) VALUES (7, NOW(), 'hash', 2)")
