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
        skills = governance / "skills" / "yuheng-full-workflow"
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
            "---\nid: yuheng-full-workflow\nversion: 1.0.0\n---\n\n"
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


if __name__ == "__main__":
    unittest.main()
