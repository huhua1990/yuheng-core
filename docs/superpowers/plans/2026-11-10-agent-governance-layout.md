---
workId: YH-20261110-agent-governance-layout
spec: docs/superpowers/specs/2026-11-10-agent-governance-layout-design.md
status: COMPLETE
codeVersion: 0.1.0-SNAPSHOT
governanceVersion: 0.2.0
knowledgeVersion: 0.1.0
approval: 用户确认设计并选择在当前会话执行
---

# 多编码工具治理入口实施计划

> **For agentic workers:** Execute this plan task by task. Keep the tasks in order because the installer tests define the migration boundary before links are changed.

**Goal:** Make `governance/` the sole source for shared rules and skills while exposing the same skills through Codex, Claude Code, and Qoder native discovery paths.

**Architecture:** Keep `AGENTS.md` as the shared project entry and `CLAUDE.md` as a thin import. Extend the existing guarded symlink installer to manage skill directories in `.agents/skills/`, `.claude/skills/`, and `.qoder/skills/`; remove legacy shared-rule links from `.claude/rules/` only through a dedicated explicit option that unlinks verified symlinks and preserves regular files and unrelated links. Tool-specific rule files remain owned by their native directories.

**Tech Stack:** Python 3 standard library (`pathlib`, `unittest`), Markdown, GitHub Actions, relative symbolic links.

---

## File Map

- `tools/governance/sync_agent_assets.py`: expected skill discovery targets, preflight, legacy shared-rule link detection, and explicit cleanup option.
- `tools/governance/tests/test_sync_agent_assets.py`: unit coverage for three skill surfaces, check mode, conflicts, cleanup boundaries, and idempotency.
- `AGENTS.md`, `CLAUDE.md`, `.claude/CLAUDE.md`: shared source and tool-entry responsibilities.
- `docs/development/sdd-workflow.md`: maintainer and user guidance for shared governance and checks.
- `.github/workflows/governance-bundle.yml`: run checks when Qoder discovery assets change.
- `.claude/rules/`: remove only old symlinks whose resolved targets are files beneath this repository's `governance/rules/`; preserve regular files and unrelated links.
- `.qoder/skills/`: generated relative directory links to all standard skills.

No Java, TypeScript, Vue, consumer snapshot, or skill workflow content changes are included.

## Task 1: Specify the Installer Contract With Tests

**Files:**
- Modify: `tools/governance/tests/test_sync_agent_assets.py`

- [x] **Step 1: Expand the existing discovery-surface test**

In `test_installs_relative_links_and_is_idempotent`, assert links in all three surfaces:

```python
for surface in (".agents", ".claude", ".qoder"):
    target = root / surface / "skills/yuheng-workflow-router"
    self.assertTrue(target.is_symlink())
    self.assertTrue((target / "SKILL.md").is_file())
```

Also assert that a shared rule is not installed under `.claude/rules/` and that a pre-existing `.claude/rules/local-rule.md` regular file remains byte-identical after sync.

Update the existing `test_conflict_prevents_all_writes` to put a conflicting file or unrelated symlink at `.qoder/skills/yuheng-workflow-router`; assert preflight fails before creating links in `.agents/` or `.claude/`. Replace `test_identical_existing_rule_can_be_adopted` with the local-rule-preservation assertion above because rules are no longer managed links.

- [x] **Step 2: Add a read-only legacy-link detection test**

Create `.claude/rules/entry.md` as a symlink to `governance/rules/entry.md`. Assert default check reports drift, leaves the symlink in place, and does not create `.qoder/skills/`.

- [x] **Step 3: Add cleanup-boundary tests**

With the explicit cleanup option, assert the verified legacy symlink is removed while a regular local rule and an unrelated symlink remain unchanged. Assert a symlink resolving outside `governance/rules/` is preserved and does not prevent skill installation.

Adapt rule-specific safety tests to the new ownership boundary: use a symlinked `.agents/skills/` or `.qoder/skills/` parent for destination containment, keep `.claude` external-parent validation for `.claude/skills/`, and change stale-managed-link coverage to create a link beneath one of the three skill discovery directories that points into the governance skill tree but is absent from the expected skill set. Remove the old test that treats a governance rule source symlink as an installer input; the installer no longer installs or resolves shared rule files.

- [x] **Step 4: Run focused tests to confirm the new contract fails**

Run: `python3 -m unittest tools.governance.tests.test_sync_agent_assets -v`

Expected: failures show that `.qoder/skills/` is not installed, shared rules are still installed, and explicit cleanup is unavailable. Existing safety tests should continue to pass.

## Task 2: Implement Three-Surface Skill Sync and Explicit Legacy Cleanup

**Files:**
- Modify: `tools/governance/sync_agent_assets.py`
- Test: `tools/governance/tests/test_sync_agent_assets.py`

- [x] **Step 1: Limit desired links to skills and add Qoder**

Build desired link pairs only from each `governance/skills/<name>` source to `.agents/skills/<name>`, `.claude/skills/<name>`, and `.qoder/skills/<name>`. Do not add `governance/rules/*.md` to desired links.

- [x] **Step 2: Detect obsolete shared-rule links without deleting by default**

Inspect direct children of `.claude/rules/`. A legacy shared-rule link is a symlink whose resolved target is a regular file inside this repository's `governance/rules/`. In check mode, report these as drift and do not change them. In normal mode without cleanup, fail with a message naming the first link and the cleanup option. Do not classify regular files, directories, dangling symlinks, or links resolving outside that governance directory as managed legacy links.

- [x] **Step 3: Add an explicit cleanup option with whole-operation preflight**

Add `remove_legacy_rule_links: bool = False` to `sync_assets` and CLI flag `--remove-legacy-rule-links`. With the flag, include only verified legacy links in planned removals. Validate every destination and removal candidate before mutation. If preflight succeeds, unlink only those symlinks and install/update skill links on all three surfaces. Leave unrelated symlinks, including links resolving outside `governance/rules/`, untouched. Never recursively remove files or directories. Include removed paths in the command report.

- [x] **Step 4: Run focused tests**

Run: `python3 -m unittest tools.governance.tests.test_sync_agent_assets -v`

Expected: all focused tests pass, including all-or-nothing conflict protection, path containment, three-surface idempotency, read-only check, and symlink-only cleanup.

## Task 3: Migrate the Current Repository Entrypoints

**Files:**
- Generate links under `.agents/skills/`, `.claude/skills/`, and `.qoder/skills/` using the installer.
- Remove verified legacy shared-rule links under `.claude/rules/` using the installer.

- [x] **Step 1: Preview the repository migration**

Run: `python3 tools/governance/sync_agent_assets.py --check`

Expected: nonzero drift output lists missing `.qoder/skills/` links and legacy `.claude/rules/` links; no files change.

- [x] **Step 2: Apply the explicit migration**

Run: `python3 tools/governance/sync_agent_assets.py --remove-legacy-rule-links`

Expected: each standard skill is linked from all three discovery directories, and only `.claude/rules/` symlinks targeting files in `governance/rules/` are removed. Regular files and unrelated symlinks remain untouched. A conflicting managed-skill destination causes preflight failure before mutation.

- [x] **Step 3: Verify the migrated repository is stable**

Run: `python3 tools/governance/sync_agent_assets.py --check`

Expected: `PASS: 0 asset link(s) need updating`; `.qoder/skills/` links resolve to `governance/skills/`, and `.claude/rules/` contains no generated shared-rule links.

## Task 4: Align Entrypoint Documentation and CI

**Files:**
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Modify: `.claude/CLAUDE.md`
- Modify: `docs/development/sdd-workflow.md`
- Modify: `.github/workflows/governance-bundle.yml`

- [x] **Step 1: Clarify shared and native responsibilities**

Update `AGENTS.md` to list `governance/` as the sole shared source, `.agents/skills/`, `.claude/skills/`, and `.qoder/skills/` as discovery links, and `.claude/rules/` / `.qoder/rules/` as optional tool-specific adapters only. State that project-wide Codex guidance belongs in `AGENTS.md`, not in a duplicate `.codex/rules/` tree. Keep `CLAUDE.md` importing `AGENTS.md`; clarify that `.claude/rules/` contains only Claude-specific loading adapters.

- [x] **Step 2: Document checks and migration behavior**

Update `docs/development/sdd-workflow.md` to explain that shared rule details are loaded on demand from `governance/rules/`, shared skills are linked to three native discovery paths, and tool-specific metadata stays in native rule directories. Document `--remove-legacy-rule-links` as a one-time migration command; normal checks use `--check` and never prune links.

- [x] **Step 3: Include Qoder paths in CI triggers**

Add `'.qoder/**'` to both `push.paths` and `pull_request.paths` in `.github/workflows/governance-bundle.yml`. Keep the existing governance unit tests and `sync_agent_assets.py --check` as the validation commands.

## Task 5: Run Final Governance Verification

**Files:**
- Verify all files listed above and the final working-tree diff.

- [x] **Step 1: Run governance unit tests**

Run: `python3 -m unittest discover -s tools/governance/tests -v`

Expected: all tests pass.

- [x] **Step 2: Run bundle and entrypoint checks**

Run:

```bash
python3 tools/governance/verify_bundle.py . --json
python3 tools/governance/sync_agent_assets.py --check
git diff --check
```

Expected: bundle reports `PASS` with no issues; asset sync reports `PASS: 0 asset link(s) need updating`; diff check exits 0 for task files.

- [x] **Step 3: Review migration scope**

Run: `git status --short` and inspect the task diff. Expected: only governance tooling/tests, agent entrypoint documentation, the Qoder skill links, and verified legacy `.claude/rules/` link removals change. Do not refresh consumer snapshots or alter unrelated user modifications.

## Requirements Coverage

- REQ-001: Tasks 2 and 4 preserve `governance/` as the only shared content source.
- REQ-002: Tasks 2 and 3 install and verify all three native skill discovery paths.
- REQ-003: Tasks 2 and 3 stop installing shared rules and safely migrate only verified generated links; Task 4 documents tool adapters.
- REQ-004: Tasks 1, 2, 3, and 5 verify idempotency, no-write check mode, conflicts, and migration safety.
- REQ-005: Task 4 updates project guidance and CI triggers.

## Execution Result

Implemented in the current session. `docs/verification/YH-20261110-agent-governance-layout/verification.md` records the commands, outcomes, and verification limits. Existing unrelated workspace modifications were preserved.
