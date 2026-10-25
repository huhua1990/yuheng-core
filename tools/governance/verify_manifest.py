#!/usr/bin/env python3
"""Validate the small, explicit contract shared by Yuheng consumers."""

import argparse
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping, Optional, Tuple


SEMVER_PATTERN = re.compile(
    r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)"
    r"(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$"
)


def _issue(code: str, message: str, path: Optional[str] = None) -> Dict[str, Any]:
    result: Dict[str, Any] = {"code": code, "message": message}
    if path:
        result["path"] = path
    return result


def _parse_version(value: Any) -> Optional[Tuple[int, int, int, str]]:
    if not isinstance(value, str):
        return None
    match = SEMVER_PATTERN.fullmatch(value.strip())
    if not match:
        return None
    return int(match.group(1)), int(match.group(2)), int(match.group(3)), value


def _compare(left: Tuple[int, int, int, str], right: Tuple[int, int, int, str]) -> int:
    left_core = left[:3]
    right_core = right[:3]
    return (left_core > right_core) - (left_core < right_core)


def _satisfies(version: str, expression: str) -> bool:
    parsed = _parse_version(version)
    if parsed is None or not isinstance(expression, str) or not expression.strip():
        return False
    for token in expression.split():
        match = re.fullmatch(r"(>=|<=|>|<|=)?\s*(\d+\.\d+\.\d+)", token)
        if not match:
            return False
        target = _parse_version(match.group(2))
        if target is None:
            return False
        comparison = _compare(parsed, target)
        operator = match.group(1) or "="
        if operator == ">=" and comparison < 0:
            return False
        if operator == ">" and comparison <= 0:
            return False
        if operator == "<=" and comparison > 0:
            return False
        if operator == "<" and comparison >= 0:
            return False
        if operator == "=" and comparison != 0:
            return False
    return True


def _report(
    issues: List[Dict[str, Any]],
    evidence: Optional[Iterable[str]] = None,
    versions: Optional[Mapping[str, Any]] = None,
    warnings: Optional[Iterable[Any]] = None,
    waivers: Optional[Iterable[Any]] = None,
) -> Dict[str, Any]:
    warning_values = list(warnings or [])
    waiver_values = list(waivers or [])
    if issues:
        status = "BLOCKED"
    elif warning_values:
        status = "WARN"
    elif waiver_values:
        status = "WAIVED"
    else:
        status = "PASS"
    return {
        "status": status,
        "issues": issues,
        "warnings": warning_values,
        "waivers": waiver_values,
        "evidence": list(evidence or []),
        "versions": dict(versions or {}),
    }


def validate_manifest(
    manifest: Mapping[str, Any],
    actual_versions: Optional[Mapping[str, str]] = None,
) -> Dict[str, Any]:
    """Return a deterministic PASS/BLOCKED report for a manifest mapping."""

    if not isinstance(manifest, Mapping):
        return _report([_issue("manifest.type", "manifest must be a mapping")])

    issues: List[Dict[str, Any]] = []
    required = (
        "schemaVersion",
        "project",
        "codeVersion",
        "artifacts",
        "governanceVersion",
        "knowledgeVersion",
        "overlayVersion",
        "compatibility",
        "sourceCommit",
        "generatedAt",
    )
    for field in required:
        if field not in manifest or manifest[field] in (None, ""):
            issues.append(
                _issue(
                    "manifest.required",
                    "missing required field: " + field,
                    field,
                )
            )

    project = manifest.get("project")
    if project is not None and (
        not isinstance(project, Mapping)
        or not project.get("id")
        or not project.get("kind")
    ):
        issues.append(
            _issue(
                "manifest.project",
                "project must contain id and kind",
                "project",
            )
        )

    artifacts = manifest.get("artifacts")
    if artifacts is not None and (
        not isinstance(artifacts, Mapping)
        or not artifacts.get("server")
        or not artifacts.get("ui")
    ):
        issues.append(
            _issue(
                "manifest.artifacts",
                "artifacts must contain server and ui",
                "artifacts",
            )
        )

    versions = {
        name: manifest.get(name)
        for name in ("codeVersion", "governanceVersion", "knowledgeVersion")
    }
    for name, value in versions.items():
        if value is not None and _parse_version(value) is None:
            issues.append(
                _issue(
                    "manifest.version",
                    name + " must use semantic versioning: " + str(value),
                    name,
                )
            )

    compatibility = manifest.get("compatibility")
    if not isinstance(compatibility, Mapping):
        issues.append(
            _issue(
                "manifest.compatibility",
                "compatibility must contain code, governance and knowledge ranges",
                "compatibility",
            )
        )
    else:
        for name, version_key in (
            ("code", "codeVersion"),
            ("governance", "governanceVersion"),
            ("knowledge", "knowledgeVersion"),
        ):
            expression = compatibility.get(name)
            version = manifest.get(version_key)
            if not isinstance(expression, str) or not expression.strip():
                issues.append(
                    _issue(
                        "manifest.compatibility",
                        "missing compatibility range: " + name,
                        "compatibility." + name,
                    )
                )
            elif _parse_version(version) and not _satisfies(version, expression):
                issues.append(
                    _issue(
                        "manifest.compatibility",
                        "{} {} is outside compatibility range {}".format(
                            version_key, version, expression
                        ),
                        "compatibility." + name,
                    )
                )

    if actual_versions:
        for name, version in actual_versions.items():
            expected = versions.get(name)
            if expected and version != expected:
                issues.append(
                    _issue(
                        "manifest.actual_version",
                        "{} {} does not match manifest {}".format(
                            name, version, expected
                        ),
                        name,
                    )
                )

    overlays = manifest.get("overlays", [])
    if overlays is not None and not isinstance(overlays, list):
        issues.append(_issue("manifest.overlays", "overlays must be a list", "overlays"))
    else:
        seen = set()
        for index, overlay in enumerate(overlays or []):
            overlay_id = overlay.get("id") if isinstance(overlay, Mapping) else None
            if not overlay_id:
                issues.append(
                    _issue(
                        "manifest.overlay",
                        "overlay must contain id",
                        "overlays[{}]".format(index),
                    )
                )
                continue
            if overlay_id in seen:
                issues.append(
                    _issue(
                        "manifest.overlay.duplicate",
                        "duplicate overlay id: " + overlay_id,
                        "overlays[{}]".format(index),
                    )
                )
            seen.add(overlay_id)

    generated_at = manifest.get("generatedAt")
    if generated_at:
        try:
            datetime.fromisoformat(str(generated_at).replace("Z", "+00:00"))
        except ValueError:
            issues.append(
                _issue(
                    "manifest.generated_at",
                    "generatedAt must be an ISO-8601 timestamp",
                    "generatedAt",
                )
            )

    if manifest.get("sourceCommit") is not None and not str(
        manifest.get("sourceCommit")
    ).strip():
        issues.append(
            _issue(
                "manifest.source_commit",
                "sourceCommit must not be empty",
                "sourceCommit",
            )
        )

    tracks = manifest.get("knowledgeTracks")
    if tracks is not None and (
        not isinstance(tracks, list) or any(not isinstance(track, str) for track in tracks)
    ):
        issues.append(
            _issue(
                "manifest.knowledge_tracks",
                "knowledgeTracks must be a list of strings",
                "knowledgeTracks",
            )
        )

    return _report(
        issues,
        versions=versions,
        warnings=manifest.get("warnings", []),
        waivers=manifest.get("waivers", []),
    )


def _parse_scalar(value: str) -> Any:
    value = value.strip()
    if not value:
        return {}
    if value in ("true", "false"):
        return value == "true"
    if value in ("null", "~"):
        return None
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        return value[1:-1]
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return value


def _simple_yaml(text: str) -> Any:
    """Parse the small mapping/list subset used by Yuheng manifests.

    JSON is valid YAML and is preferred when available. This fallback keeps the
    governance verifier dependency-free for clean Python environments.
    """

    lines = [
        (len(line) - len(line.lstrip(" ")), line.strip())
        for line in text.splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]
    if not lines:
        return {}

    def parse_block(index: int, indent: int) -> Tuple[Any, int]:
        is_list = lines[index][1].startswith("- ")
        container: Any = [] if is_list else {}
        while index < len(lines):
            current_indent, content = lines[index]
            if current_indent < indent:
                break
            if current_indent > indent:
                raise ValueError("unsupported YAML indentation")
            if is_list:
                if not content.startswith("- "):
                    raise ValueError("mixed YAML list and mapping")
                item = content[2:].strip()
                if not item:
                    if index + 1 >= len(lines):
                        container.append(None)
                        index += 1
                        continue
                    child, index = parse_block(index + 1, lines[index + 1][0])
                    container.append(child)
                    continue
                if ":" in item and not item.startswith(("'", '"')):
                    key, raw = item.split(":", 1)
                    item_map = {key.strip(): _parse_scalar(raw)}
                    index += 1
                    if index < len(lines) and lines[index][0] > indent:
                        child, index = parse_block(index, lines[index][0])
                        if isinstance(child, Mapping):
                            item_map.update(child)
                    container.append(item_map)
                else:
                    container.append(_parse_scalar(item))
                    index += 1
            else:
                if ":" not in content:
                    raise ValueError("expected YAML mapping entry")
                key, raw = content.split(":", 1)
                key = key.strip()
                raw = raw.strip()
                index += 1
                if raw:
                    container[key] = _parse_scalar(raw)
                elif index < len(lines) and lines[index][0] > indent:
                    child, index = parse_block(index, lines[index][0])
                    container[key] = child
                else:
                    container[key] = {}
        return container, index

    result, _ = parse_block(0, lines[0][0])
    return result


def load_document(path: Path) -> Any:
    text = path.read_text(encoding="utf-8")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return _simple_yaml(text)


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
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args(argv)
    report = validate_manifest(load_document(args.manifest))
    if args.as_json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(format_report(report))
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
