#!/usr/bin/env python3
"""Validate Yuheng governance assets without reading application source code."""

import argparse
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Mapping, Optional

from verify_manifest import load_document, validate_manifest


LINK_PATTERN = re.compile(r"\[[^\]]*\]\(([^)]+)\)")


def _issue(code: str, message: str, path: Optional[str] = None) -> Dict[str, Any]:
    result: Dict[str, Any] = {"code": code, "message": message}
    if path:
        result["path"] = path
    return result


def _frontmatter(path: Path) -> Dict[str, str]:
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0].strip() != "---":
        return {}
    values: Dict[str, str] = {}
    for line in lines[1:]:
        if line.strip() == "---":
            break
        if ":" in line:
            key, value = line.split(":", 1)
            values[key.strip()] = value.strip().strip("'\"")
    return values


def _asset_id(path: Path, metadata: Mapping[str, str]) -> str:
    return metadata.get("id") or path.stem


def _check_links(path: Path, root: Path, issues: List[Dict[str, Any]]) -> None:
    content = path.read_text(encoding="utf-8")
    for raw_target in LINK_PATTERN.findall(content):
        target = raw_target.strip().strip("<>")
        target = target.split("#", 1)[0].split("?", 1)[0]
        if not target or target.startswith(("http://", "https://", "mailto:", "#")):
            continue
        candidate = (path.parent / target).resolve()
        if not candidate.exists():
            issues.append(
                _issue(
                    "bundle.reference",
                    "reference path does not exist: " + target,
                    str(path.relative_to(root)),
                )
            )


def _read_metadata(path: Path, issues: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not path.exists():
        issues.append(
            _issue(
                "bundle.metadata",
                "missing directory metadata: " + str(path),
                str(path),
            )
        )
        return {}
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        issues.append(
            _issue(
                "bundle.metadata",
                "invalid directory metadata: {} ({})".format(path, exc),
                str(path),
            )
        )
        return {}
    if not isinstance(value, Mapping):
        issues.append(
            _issue(
                "bundle.metadata",
                "directory metadata must be an object: " + str(path),
                str(path),
            )
        )
        return {}
    return dict(value)


def validate_bundle(root: Path, manifest: Optional[Mapping[str, Any]] = None) -> Dict[str, Any]:
    root = Path(root).resolve()
    issues: List[Dict[str, Any]] = []
    evidence: List[str] = []
    manifest_value: Mapping[str, Any] = manifest or {}

    if manifest is None:
        manifest_path = root / "release" / "yuheng-manifest.yaml"
        if not manifest_path.exists():
            issues.append(
                _issue(
                    "bundle.manifest",
                    "manifest file does not exist: " + str(manifest_path),
                    str(manifest_path),
                )
            )
        else:
            loaded = load_document(manifest_path)
            if isinstance(loaded, Mapping):
                manifest_value = loaded
            else:
                issues.append(
                    _issue(
                        "bundle.manifest",
                        "manifest must be a mapping",
                        str(manifest_path),
                    )
                )

    manifest_report = validate_manifest(manifest_value)
    issues.extend(manifest_report["issues"])
    evidence.append(str(root))

    asset_paths = sorted(
        list((root / "governance" / "rules").rglob("*.md"))
        if (root / "governance" / "rules").exists()
        else []
    )
    skill_root = root / "governance" / "skills"
    if skill_root.exists():
        asset_paths.extend(sorted(skill_root.rglob("SKILL.md")))
    if not asset_paths:
        issues.append(
            _issue(
                "bundle.assets",
                "no governance rules or skills found",
                "governance",
            )
        )

    seen_ids: Dict[str, Path] = {}
    versions: Dict[str, str] = {}
    for asset_path in asset_paths:
        metadata = _frontmatter(asset_path)
        asset_id = _asset_id(asset_path, metadata)
        if asset_id in seen_ids:
            issues.append(
                _issue(
                    "bundle.asset.duplicate",
                    "duplicate asset id: {} ({} and {})".format(
                        asset_id,
                        seen_ids[asset_id].relative_to(root),
                        asset_path.relative_to(root),
                    ),
                    str(asset_path.relative_to(root)),
                )
            )
        seen_ids[asset_id] = asset_path
        if metadata.get("version"):
            versions[asset_id] = metadata["version"]
        _check_links(asset_path, root, issues)

    required_tracks = manifest_value.get("knowledgeTracks", [])
    if not isinstance(required_tracks, list):
        required_tracks = []
    for track in required_tracks:
        track_path = root / "ai-knowledge-core" / str(track)
        if not track_path.is_dir() or not any(track_path.iterdir()):
            issues.append(
                _issue(
                    "bundle.knowledge",
                    "required knowledge track is missing: " + str(track),
                    str(track_path),
                )
            )

    governance_metadata = _read_metadata(
        root / "governance" / "metadata.json", issues
    )
    knowledge_metadata = _read_metadata(
        root / "ai-knowledge-core" / "metadata.json", issues
    )
    expected_governance = manifest_value.get("governanceVersion")
    expected_knowledge = manifest_value.get("knowledgeVersion")
    if expected_governance and governance_metadata.get("governanceVersion") != expected_governance:
        issues.append(
            _issue(
                "bundle.metadata.version",
                "governance metadata version does not match manifest",
                "governance/metadata.json",
            )
        )
    if expected_knowledge and knowledge_metadata.get("knowledgeVersion") != expected_knowledge:
        issues.append(
            _issue(
                "bundle.metadata.version",
                "knowledge metadata version does not match manifest",
                "ai-knowledge-core/metadata.json",
            )
        )

    report: Dict[str, Any] = {
        "status": (
            "BLOCKED"
            if issues
            else "WARN"
            if manifest_report.get("warnings")
            else "WAIVED"
            if manifest_report.get("waivers")
            else "PASS"
        ),
        "issues": issues,
        "warnings": manifest_report.get("warnings", []),
        "waivers": manifest_report.get("waivers", []),
        "evidence": evidence,
        "versions": {
            "codeVersion": manifest_value.get("codeVersion"),
            "governanceVersion": manifest_value.get("governanceVersion"),
            "knowledgeVersion": manifest_value.get("knowledgeVersion"),
        },
    }
    report["json"] = json.dumps(report, ensure_ascii=False, indent=2)
    return report


def format_report(report: Mapping[str, Any]) -> str:
    lines = ["status: " + str(report.get("status", "BLOCKED"))]
    for issue in report.get("issues", []):
        lines.append("- {}: {}".format(issue.get("code", "error"), issue["message"]))
    for warning in report.get("warnings", []):
        lines.append("- warning: " + str(warning))
    for waiver in report.get("waivers", []):
        lines.append("- waiver: " + str(waiver))
    return "\n".join(lines)


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", type=Path)
    parser.add_argument("--manifest", type=Path)
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args(argv)
    manifest = load_document(args.manifest) if args.manifest else None
    report = validate_bundle(args.root, manifest)
    print(
        report["json"] if args.as_json else format_report(report)
    )
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
