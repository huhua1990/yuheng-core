import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sync_agent_assets import sync_assets


class SyncAgentAssetsTests(unittest.TestCase):
    def make_source(self, root):
        skill = root / "governance/skills/yuheng-workflow-router"
        skill.mkdir(parents=True)
        (skill / "SKILL.md").write_text(
            "---\nname: yuheng-workflow-router\ndescription: Use when routing tasks.\n---\n",
            encoding="utf-8",
        )
        rules = root / "governance/rules"
        rules.mkdir(parents=True)
        (rules / "entry.md").write_text("# Entry\n", encoding="utf-8")

    def test_installs_relative_links_and_is_idempotent(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            self.assertTrue(sync_assets(root)["changes"])
            self.assertEqual(sync_assets(root, check=True)["changes"], [])
            self.assertEqual(sync_assets(root)["changes"], [])
            for surface in (".agents", ".claude", ".qoder"):
                target = root / surface / "skills/yuheng-workflow-router"
                self.assertTrue(target.is_symlink())
                self.assertTrue((target / "SKILL.md").is_file())
            self.assertFalse((root / ".claude/rules/entry.md").exists())

    def test_check_does_not_write(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            self.assertTrue(sync_assets(root, check=True)["changes"])
            self.assertFalse((root / ".agents").exists())

    def test_conflict_prevents_all_writes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            skills = root / ".qoder/skills"
            skills.mkdir(parents=True)
            target = skills / "yuheng-workflow-router"
            target.write_text("user changes\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "conflict"):
                sync_assets(root)
            self.assertEqual(target.read_text(), "user changes\n")
            self.assertFalse((root / ".agents").exists())
            self.assertFalse((root / ".claude/skills").exists())

    def test_preserves_tool_specific_rule_files(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            rules = root / ".claude/rules"
            rules.mkdir(parents=True)
            target = rules / "local-rule.md"
            target.write_text("user rule\n", encoding="utf-8")
            sync_assets(root)
            self.assertEqual(target.read_text(encoding="utf-8"), "user rule\n")
            self.assertFalse(target.is_symlink())

    def test_does_not_follow_external_skill_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / "repo"
            root.mkdir()
            self.make_source(root)
            outside = Path(directory) / "outside"
            outside.mkdir()
            (root / ".qoder").symlink_to(outside, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, "outside"):
                sync_assets(root)
            self.assertFalse((outside / "skills").exists())

    def test_check_reports_stale_managed_links_without_deleting_them(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            (root / "governance/skills/other").mkdir()
            (root / "governance/skills/other/SKILL.md").write_text(
                "---\nname: other\ndescription: Use when testing.\n---\n"
            )
            sync_assets(root)
            (root / "governance/skills/other/SKILL.md").unlink()
            (root / "governance/skills/other").rmdir()
            target = root / ".qoder/skills/other"
            with self.assertRaisesRegex(ValueError, "stale"):
                sync_assets(root, check=True)
            self.assertTrue(target.is_symlink())

    def test_linked_skill_parent_cannot_mutate_source(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            (root / ".claude").mkdir()
            (root / ".qoder").mkdir()
            (root / ".qoder/skills").symlink_to("../governance/skills", target_is_directory=True)
            source = root / "governance/skills/yuheng-workflow-router/SKILL.md"
            with self.assertRaisesRegex(ValueError, "conflict"):
                sync_assets(root)
            self.assertTrue(source.is_file())
            self.assertFalse((root / ".agents").exists())

    def test_file_parent_preflight_prevents_partial_install(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            (root / ".claude").mkdir()
            (root / ".qoder").mkdir()
            (root / ".qoder/skills").write_text("user file\n")
            with self.assertRaisesRegex(ValueError, "conflict"):
                sync_assets(root)
            self.assertFalse((root / ".agents").exists())
            self.assertEqual((root / ".qoder/skills").read_text(), "user file\n")

    def test_nested_skill_layout_is_rejected_before_writing(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            nested = root / "governance/skills/extra/nested"
            nested.mkdir(parents=True)
            (nested / "SKILL.md").write_text("---\nname: nested\ndescription: Use when testing.\n---\n")
            with self.assertRaisesRegex(ValueError, "layout"):
                sync_assets(root)
            self.assertFalse((root / ".agents").exists())

    def test_parent_directory_symlink_is_blocked_without_mutation(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            for surface in (".agents", ".claude", ".qoder"):
                path = root / surface
                path.mkdir()
            (root / ".agents/skills").symlink_to("../governance/skills", target_is_directory=True)
            with self.assertRaisesRegex(ValueError, "symlink"):
                sync_assets(root)
            source = root / "governance/skills/yuheng-workflow-router/SKILL.md"
            self.assertTrue(source.is_file())

    def test_symlink_loop_is_reported_without_crashing(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            (root / ".agents/skills").mkdir(parents=True)
            loop = root / ".agents/skills/loop"
            loop.symlink_to("loop")
            with self.assertRaisesRegex(ValueError, "cannot safely resolve"):
                sync_assets(root)
            self.assertTrue(loop.is_symlink())

    def test_skill_source_symlink_outside_repository_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / "repo"
            root.mkdir()
            self.make_source(root)
            external = Path(directory) / "external-skill"
            external.mkdir()
            (external / "SKILL.md").write_text(
                "---\nname: yuheng-workflow-router\ndescription: Use when routing tasks.\n---\n"
            )
            source = root / "governance/skills/yuheng-workflow-router"
            (source / "SKILL.md").unlink()
            source.rmdir()
            source.symlink_to(external, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, "source resolves outside"):
                sync_assets(root)
            self.assertTrue((external / "SKILL.md").is_file())

    def test_check_reports_legacy_rule_links_without_removing_or_installing(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            rules = root / ".claude/rules"
            rules.mkdir(parents=True)
            legacy = rules / "entry.md"
            legacy.symlink_to("../../governance/rules/entry.md")

            report = sync_assets(root, check=True)

            self.assertEqual(report["status"], "DRIFT")
            self.assertIn(".claude/rules/entry.md", report["changes"])
            self.assertTrue(legacy.is_symlink())
            self.assertFalse((root / ".qoder").exists())

    def test_explicit_cleanup_removes_only_legacy_rule_links(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            rules = root / ".claude/rules"
            rules.mkdir(parents=True)
            legacy = rules / "entry.md"
            legacy.symlink_to("../../governance/rules/entry.md")
            local = rules / "local-rule.md"
            local.write_text("local\n", encoding="utf-8")
            external_target = root / "outside.md"
            external_target.write_text("outside\n", encoding="utf-8")
            unrelated = rules / "unrelated.md"
            unrelated.symlink_to("../../outside.md")

            report = sync_assets(root, remove_legacy_rule_links=True)

            self.assertFalse(legacy.is_symlink())
            self.assertEqual(local.read_text(encoding="utf-8"), "local\n")
            self.assertTrue(unrelated.is_symlink())
            self.assertEqual(report["removed"], [".claude/rules/entry.md"])
            self.assertTrue((root / ".qoder/skills/yuheng-workflow-router/SKILL.md").is_file())

    def test_default_apply_refuses_legacy_rule_links_without_partial_install(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            rules = root / ".claude/rules"
            rules.mkdir(parents=True)
            legacy = rules / "entry.md"
            legacy.symlink_to("../../governance/rules/entry.md")

            with self.assertRaisesRegex(ValueError, "remove-legacy-rule-links"):
                sync_assets(root)

            self.assertTrue(legacy.is_symlink())
            self.assertFalse((root / ".agents").exists())

    def test_unrelated_rule_symlink_is_preserved_during_legacy_cleanup(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_source(root)
            rules = root / ".claude/rules"
            rules.mkdir(parents=True)
            external_target = root / "outside.md"
            external_target.write_text("outside\n", encoding="utf-8")
            unrelated = rules / "unrelated.md"
            unrelated.symlink_to("../../outside.md")

            sync_assets(root, remove_legacy_rule_links=True)

            self.assertTrue(unrelated.is_symlink())
            self.assertEqual(unrelated.resolve(), external_target.resolve())


if __name__ == "__main__":
    unittest.main()
