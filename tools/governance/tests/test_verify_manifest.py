import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from verify_manifest import validate_manifest


def valid_manifest():
    return {
        "schemaVersion": 1,
        "project": {"id": "yuheng-demo", "kind": "consumer"},
        "codeVersion": "1.0.0",
        "artifacts": {
            "server": "com.yuheng:yuheng-server:1.0.0",
            "ui": "yuheng-ui@1.0.0",
        },
        "governanceVersion": "1.0.0",
        "knowledgeVersion": "1.0.0",
        "overlayVersion": "product-2026.10.25",
        "compatibility": {
            "code": ">=1.0.0 <2.0.0",
            "governance": ">=1.0.0 <2.0.0",
            "knowledge": ">=1.0.0 <2.0.0",
        },
        "knowledgeTracks": ["server", "ui", "data"],
        "sourceCommit": "9f3e8c1",
        "generatedAt": "2026-10-25T12:00:00+08:00",
        "overlays": [
            {"id": "consumer-domain", "path": "consumer-overlay"},
        ],
    }


class VerifyManifestTests(unittest.TestCase):
    def assert_blocked(self, manifest, expected):
        report = validate_manifest(manifest)
        self.assertEqual(report["status"], "BLOCKED")
        self.assertTrue(
            any(expected in issue["message"] for issue in report["issues"]),
            report,
        )

    def test_missing_code_version_is_blocked(self):
        manifest = valid_manifest()
        del manifest["codeVersion"]
        self.assert_blocked(manifest, "codeVersion")

    def test_missing_governance_version_is_blocked(self):
        manifest = valid_manifest()
        del manifest["governanceVersion"]
        self.assert_blocked(manifest, "governanceVersion")

    def test_duplicate_overlay_id_is_blocked(self):
        manifest = valid_manifest()
        manifest["overlays"].append(
            {"id": "consumer-domain", "path": "another-overlay"}
        )
        self.assert_blocked(manifest, "duplicate overlay id")

    def test_version_outside_compatibility_range_is_blocked(self):
        manifest = valid_manifest()
        manifest["codeVersion"] = "2.0.0"
        self.assert_blocked(manifest, "codeVersion 2.0.0")

    def test_valid_manifest_passes(self):
        report = validate_manifest(valid_manifest())
        self.assertEqual(report["status"], "PASS", report)
        self.assertEqual(report["issues"], [])
        self.assertEqual(report["versions"]["codeVersion"], "1.0.0")

    def test_declared_warning_is_reported_as_warn(self):
        manifest = valid_manifest()
        manifest["warnings"] = ["frontend dependencies are not installed"]
        report = validate_manifest(manifest)
        self.assertEqual(report["status"], "WARN", report)
        self.assertEqual(report["warnings"], manifest["warnings"])

    def test_declared_waiver_is_reported_as_waived(self):
        manifest = valid_manifest()
        manifest["waivers"] = [{"waiverId": "YH-W-001", "expiresAt": "2026-11-30"}]
        report = validate_manifest(manifest)
        self.assertEqual(report["status"], "WAIVED", report)
        self.assertEqual(report["waivers"], manifest["waivers"])


if __name__ == "__main__":
    unittest.main()
