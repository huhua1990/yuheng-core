import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from verify_bundle import format_report, validate_bundle


def manifest():
    return {
        "schemaVersion": 1,
        "project": {"id": "yuheng-core", "kind": "framework"},
        "codeVersion": "1.0.0",
        "artifacts": {
            "server": "com.yuheng:yuheng-server:1.0.0",
            "ui": "yuheng-ui@1.0.0",
        },
        "governanceVersion": "1.0.0",
        "knowledgeVersion": "1.0.0",
        "overlayVersion": "core-2026.10.25",
        "compatibility": {
            "code": ">=1.0.0 <2.0.0",
            "governance": ">=1.0.0 <2.0.0",
            "knowledge": ">=1.0.0 <2.0.0",
        },
        "knowledgeTracks": ["server", "ui"],
        "sourceCommit": "9f3e8c1",
        "generatedAt": "2026-10-25T12:00:00+08:00",
    }


class VerifyBundleTests(unittest.TestCase):
    def write_bundle(self, root, duplicate_rule=False, broken_link=False):
        governance = root / "governance"
        rules = governance / "rules"
        skill_root = governance / "skills"
        skills = skill_root / "yuheng-full-workflow"
        knowledge = root / "ai-knowledge-core"
        rules.mkdir(parents=True)
        skills.mkdir(parents=True)
        (knowledge / "server").mkdir(parents=True)
        (knowledge / "ui").mkdir(parents=True)

        (rules / "principles.md").write_text(
            "---\nid: yuheng-ai-operating-principles\nversion: 1.0.0\n---\n\n"
            "[server](../../ai-knowledge-core/server/overview.md)\n",
            encoding="utf-8",
        )
        if duplicate_rule:
            (rules / "duplicate.md").write_text(
                "---\nid: yuheng-ai-operating-principles\nversion: 1.0.0\n---\n",
                encoding="utf-8",
            )
        (skills / "SKILL.md").write_text(
            "---\nname: yuheng-full-workflow\ndescription: Use when delivering a feature.\n---\n\n"
            + (
                "[missing](../../missing.md)\n"
                if broken_link
                else "[server](../../../ai-knowledge-core/server/overview.md)\n"
            ),
            encoding="utf-8",
        )
        (knowledge / "server" / "overview.md").write_text(
            "# Server\n", encoding="utf-8"
        )
        (knowledge / "ui" / "overview.md").write_text("# UI\n", encoding="utf-8")
        (governance / "metadata.json").write_text(
            json.dumps({"governanceVersion": "1.0.0"}),
            encoding="utf-8",
        )
        (knowledge / "metadata.json").write_text(
            json.dumps({"knowledgeVersion": "1.0.0"}),
            encoding="utf-8",
        )

    def test_bundle_passes_with_unique_assets_and_existing_links(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root)
            report = validate_bundle(root, manifest())
            self.assertEqual(report["status"], "PASS", report)
            self.assertEqual(report["issues"], [])

    def test_duplicate_rule_id_is_blocked(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root, duplicate_rule=True)
            report = validate_bundle(root, manifest())
            self.assertEqual(report["status"], "BLOCKED")
            self.assertTrue(
                any("duplicate asset id" in issue["message"] for issue in report["issues"]),
                report,
            )

    def test_broken_markdown_reference_is_blocked(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root, broken_link=True)
            report = validate_bundle(root, manifest())
            self.assertEqual(report["status"], "BLOCKED")
            self.assertTrue(
                any("reference path does not exist" in issue["message"] for issue in report["issues"]),
                report,
            )

    def test_report_has_json_and_human_readable_forms(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root)
            report = validate_bundle(root, manifest())
            encoded = json.loads(report["json"])
            self.assertEqual(encoded["status"], "PASS")
            self.assertIn("PASS", format_report(report))

    def test_standard_skill_names_are_distinct_asset_ids(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root)
            for name in ("yuheng-api-verification", "yuheng-ui-verification"):
                skill = root / "governance/skills" / name
                skill.mkdir()
                (skill / "SKILL.md").write_text(
                    "---\nname: " + name + "\ndescription: Use when verifying delivery.\n---\n",
                    encoding="utf-8",
                )
            self.assertEqual(validate_bundle(root, manifest())["status"], "PASS")

    def test_skill_without_discovery_metadata_is_blocked(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root)
            skill = root / "governance/skills/yuheng-full-workflow/SKILL.md"
            skill.write_text("---\nid: yuheng-full-workflow\n---\n# Workflow\n")
            report = validate_bundle(root, manifest())
            self.assertEqual(report["status"], "BLOCKED")
            self.assertTrue(any(i["code"] == "bundle.skill.metadata" for i in report["issues"]))

    def test_duplicate_skill_names_are_blocked(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root)
            for folder in ("first", "second"):
                skill = root / "governance/skills" / folder
                skill.mkdir()
                (skill / "SKILL.md").write_text(
                    "---\nname: yuheng-shared\ndescription: Use when verifying.\n---\n"
                )
            report = validate_bundle(root, manifest())
            self.assertEqual(report["status"], "BLOCKED")
            self.assertTrue(any("duplicate asset id" in i["message"] for i in report["issues"]))

    def test_block_scalar_description_is_supported(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root)
            skill = root / "governance/skills/yuheng-full-workflow/SKILL.md"
            skill.write_text(
                "---\nname: yuheng-full-workflow\ndescription: |\n  Use when delivering.\n"
                "metadata:\n  version: 0.2.0\n---\n"
            )
            self.assertEqual(validate_bundle(root, manifest())["status"], "PASS")

    def test_empty_skill_directory_is_blocked(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root)
            (root / "governance/skills/empty").mkdir()
            self.assertEqual(validate_bundle(root, manifest())["status"], "BLOCKED")

    def test_broken_template_reference_is_blocked(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root)
            skill = root / "governance/skills/yuheng-full-workflow/SKILL.md"
            with skill.open("a") as stream:
                stream.write("\n[template](assets/spec.md)\n")
            report = validate_bundle(root, manifest())
            self.assertTrue(any(i["code"] == "bundle.reference" for i in report["issues"]))

    def test_unclosed_skill_frontmatter_is_blocked(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root)
            skill = root / "governance/skills/yuheng-full-workflow/SKILL.md"
            skill.write_text(
                "---\nname: yuheng-full-workflow\ndescription: Use when delivering.\n# No closing delimiter\n"
            )
            report = validate_bundle(root, manifest())
            self.assertEqual(report["status"], "BLOCKED")

    def test_nested_metadata_does_not_replace_skill_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root)
            skill = root / "governance/skills/yuheng-full-workflow/SKILL.md"
            skill.write_text(
                "---\nname: yuheng-full-workflow\ndescription: Use when delivering.\n"
                "metadata:\n  name: legacy-internal-label\n---\n# Workflow\n"
            )
            self.assertEqual(validate_bundle(root, manifest())["status"], "PASS")

    def test_invalid_or_empty_yaml_descriptions_are_blocked(self):
        for value in ("[]", "|", "[unterminated", "null", "false", "123", "'   '"):
            with self.subTest(value=value), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                self.write_bundle(root)
                skill = root / "governance/skills/yuheng-full-workflow/SKILL.md"
                skill.write_text(
                    "---\nname: yuheng-full-workflow\ndescription: " + value + "\n---\n"
                )
                self.assertEqual(validate_bundle(root, manifest())["status"], "BLOCKED")

    def test_nested_skill_layout_is_blocked(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root)
            nested = root / "governance/skills/extra/nested"
            nested.mkdir(parents=True)
            (nested / "SKILL.md").write_text("---\nname: nested\ndescription: Use when testing.\n---\n")
            report = validate_bundle(root, manifest())
            self.assertEqual(report["status"], "BLOCKED")
            self.assertTrue(any(i["code"] == "bundle.skill.layout" for i in report["issues"]))

    def test_frontmatter_scalars_with_colons_are_parsed_without_truncation(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.write_bundle(root)
            skill = root / "governance/skills/yuheng-full-workflow/SKILL.md"
            skill.write_text(
                "---\nname: yuheng-full-workflow\n"
                "description: Use when a path has value: other/path.md\n---\n"
            )
            self.assertEqual(validate_bundle(root, manifest())["status"], "PASS")


if __name__ == "__main__":
    unittest.main()
