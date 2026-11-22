import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SKILL = ROOT / "governance/skills/yuheng-business-template-migration/SKILL.md"


class TemplateMigrationUiRegistrationTests(unittest.TestCase):
    def test_skill_requires_registered_dynamic_views_and_informs_menus(self):
        text = SKILL.read_text()
        self.assertIn("businessViewComponents", text)
        self.assertIn("import.meta.glob", text)
        self.assertIn("动态菜单组件解析", text)
        self.assertIn("显式业务路由", text)


if __name__ == "__main__":
    unittest.main()
