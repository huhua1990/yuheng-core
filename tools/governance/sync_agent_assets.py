#!/usr/bin/env python3
"""Install repository-local skill discovery links, or check them without writing."""

import argparse
import os
from pathlib import Path
from typing import Any, Dict


def _same_content(source: Path, target: Path) -> bool:
    if source.is_file() and target.is_file():
        return source.read_bytes() == target.read_bytes()
    if source.is_dir() and target.is_dir():
        source_files = {p.relative_to(source) for p in source.rglob("*") if p.is_file()}
        target_files = {p.relative_to(target) for p in target.rglob("*") if p.is_file()}
        return source_files == target_files and all(
            (source / name).read_bytes() == (target / name).read_bytes()
            for name in source_files
        )
    return False


def _resolve_path(path: Path) -> Path:
    try:
        return path.resolve()
    except (OSError, RuntimeError) as exc:
        raise ValueError("cannot safely resolve path: {} ({})".format(path, exc)) from exc


def _legacy_rule_links(root: Path) -> list:
    rules_dir = root / ".claude/rules"
    if not rules_dir.exists() and not rules_dir.is_symlink():
        return []
    if rules_dir.is_symlink() or not rules_dir.is_dir():
        raise ValueError("asset conflict; Claude rules directory must be a regular directory: " + str(rules_dir))

    governance_rules = _resolve_path(root / "governance/rules")
    legacy = []
    for candidate in sorted(rules_dir.iterdir()):
        if not candidate.is_symlink():
            continue
        resolved = _resolve_path(candidate)
        try:
            resolved.relative_to(governance_rules)
        except ValueError:
            continue
        if resolved.is_file():
            legacy.append(candidate)
    return legacy


def sync_assets(root: Path, check: bool = False,
                remove_legacy_rule_links: bool = False) -> Dict[str, Any]:
    root = _resolve_path(Path(root))
    skills = root / "governance/skills"
    if not skills.is_dir():
        raise ValueError("missing governance/skills")
    sources = sorted(p.parent for p in skills.glob("*/SKILL.md"))
    if not sources:
        raise ValueError("governance skills must not be empty")
    unexpected_skills = [path for path in skills.rglob("SKILL.md") if path.parent.parent != skills]
    if unexpected_skills:
        raise ValueError("unsupported nested skill layout: " + str(unexpected_skills[0]))
    empty_skill = next(
        (path for path in skills.iterdir() if path.is_dir() and not (path / "SKILL.md").is_file()),
        None,
    )
    if empty_skill:
        raise ValueError("active skill directory is missing SKILL.md: " + str(empty_skill))
    pairs = [
        (source, root / surface / "skills" / source.name)
        for source in sources
        for surface in (".agents", ".claude", ".qoder")
    ]
    for source, _ in pairs:
        if root not in _resolve_path(source).parents:
            raise ValueError("governance source resolves outside repository: " + str(source))
    expected_targets = {target for _, target in pairs}
    for _, target in pairs:
        for parent in (target.parent, *target.parent.parents):
            if parent == root:
                break
            if root not in parent.parents:
                raise ValueError("destination resolves outside repository: " + str(parent))
            if parent.exists() and not parent.is_dir():
                raise ValueError("asset conflict; destination parent is not a directory: " + str(parent))
            if parent.is_symlink():
                resolved = _resolve_path(parent)
                if resolved == root or root not in resolved.parents:
                    raise ValueError("destination resolves outside repository: " + str(parent))
                raise ValueError("asset conflict; destination parent must not be a symlink: " + str(parent))
    for directory in (
        root / ".agents/skills",
        root / ".claude/skills",
        root / ".qoder/skills",
    ):
        if root not in _resolve_path(directory).parents:
            raise ValueError("destination resolves outside repository: " + str(directory))
        for installed in directory.glob("*"):
            if (
                installed.is_symlink()
                and root / "governance" in _resolve_path(installed).parents
                and installed not in expected_targets
            ):
                raise ValueError("stale managed link; review before removing: " + str(installed))
    legacy_links = _legacy_rule_links(root)
    changes = [str(path.relative_to(root)) for path in legacy_links]
    pending = []
    # Preflight the complete operation before touching any destination.
    for source, target in pairs:
        if target.is_symlink() and _resolve_path(target) == _resolve_path(source):
            continue
        if root not in _resolve_path(target.parent).parents:
            raise ValueError("destination resolves outside repository: " + str(target))
        if target.is_symlink() or (target.exists() and not _same_content(source, target)):
            raise ValueError("asset conflict; preserve and reconcile file first: " + str(target))
        # Existing directories are left intact; only matching regular rules can
        # be adopted without deleting a user's directory or untracked files.
        if target.is_dir():
            raise ValueError("directory conflict; preserve directory first: " + str(target))
        changes.append(str(target.relative_to(root)))
        pending.append((source, target))

    if check:
        return {"status": "DRIFT" if changes else "PASS", "changes": changes, "removed": []}
    if legacy_links and not remove_legacy_rule_links:
        raise ValueError(
            "legacy shared-rule links require explicit migration; rerun with --remove-legacy-rule-links: "
            + str(legacy_links[0])
        )

    removed = []
    if not check:
        for link in legacy_links:
            link.unlink()
            removed.append(str(link.relative_to(root)))
        for source, target in pending:
            target.parent.mkdir(parents=True, exist_ok=True)
            if target.exists():
                target.unlink()
            target.symlink_to(os.path.relpath(source, target.parent), target_is_directory=source.is_dir())
    return {"status": "PASS", "changes": changes, "removed": removed}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--check", action="store_true")
    parser.add_argument(
        "--remove-legacy-rule-links",
        action="store_true",
        help="remove verified Claude rule symlinks into governance/rules during skill-link sync",
    )
    args = parser.parse_args()
    try:
        report = sync_assets(
            args.root,
            check=args.check,
            remove_legacy_rule_links=args.remove_legacy_rule_links,
        )
    except (ValueError, OSError) as exc:
        print("BLOCKED: " + str(exc))
        return 1
    if args.check:
        print("{}: {} asset link(s) need updating".format(report["status"], len(report["changes"])))
    else:
        print("{}: {} asset link(s) updated, {} legacy link(s) removed".format(
            report["status"], len(report["changes"]) - len(report["removed"]), len(report["removed"])
        ))
    for path in report["removed"]:
        print("- removed " + path)
    for path in report["changes"]:
        print("- " + path)
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
