# Core role-menu seed orphan verification

**workId:** YH-20261111-full-source-migration  
**Spec:** `docs/superpowers/specs/2026-11-16-role-menu-seed-orphans-design.md`  
**Plan:** `docs/superpowers/plans/2026-11-16-role-menu-seed-orphans.md`  
**Date:** 2026-11-16  
**Versions:** Core `0.1.0-SNAPSHOT`; governance `0.2.0`; knowledge `0.1.0`.

## Finding and scope

The same-schema API evidence in Demo `docs/verification/2026-11-11-full-source-migration/role-menu-20261116/api-delta.json` shows role 2 menu GET returning 655 IDs, then 628 after POST with the prior set plus WebSocket ID 565. All 28 removed IDs are absent from Core `005-platform-seed.sql`'s `system_menu` rows, but present as active tenant 1 role 1 and role 2 rows in `system_role_menu`. Thus the seed contains 56 dangling role-menu grants. The API run used system tenant 1; `TenantServiceImpl.handleTenantMenu` returns all menus for this tenant, so package filtering is not the cause. GET returns role-menu relation IDs; save diffs requested accessible IDs against current relations and soft-deletes omitted entries.

Only this Core data-governance defect was changed. Changeset 005 remains untouched because it is already executed; new changeset 010 is registered after 009 and targets only exact seed relation IDs, role 1/2, tenant 1, active state, and rows whose menu remains absent. Rollback restores the same identities only while their menu remains absent.

## Test-first and packaging

`python3 -m unittest tools.governance.tests.test_role_menu_seed_orphans -v` first failed because the 010 include was missing (expected RED). After adding the changeset and registration, it passed. The existing `test_platform_plan_labels` suite passed its registration test; two real-MySQL cases were skipped because they target an unrelated explicitly named schema.

`mvn -o -pl yuheng-server -am -DskipTests -Dexec.skip=true package` completed with `BUILD SUCCESS`. The resulting Core server JAR contains both `010-clean-orphan-platform-role-menus.yaml` and the updated MySQL changelog.

## Isolated MySQL evidence

The temporary outer Demo JAR was repackaged outside the repositories, replacing only its nested Core `yuheng-server` resource JAR with the current Core build. SHA-256: `0b65a3ad81159c7ff969ba91dd957172f6d4b4a838f537c989d8dd0d607a175f`. Target schema `yuheng_role_orphan_20261116`, restricted MySQL user `yh_role_orphan_16`, backend port 48138, Redis DB 15. DB15 started at zero with no DB15 client. No shared schema was used.

The first launch attempt failed before Liquibase because the temporary MySQL user creation command was malformed by shell quoting. Inspection showed the user and grant had not been created. The corrected user was created for only the isolated schema, direct authentication was tested, and the run continued. The failed attempt created no schema objects, Redis keys, or running process.

Successful cold start applied 56/56 changesets. SQL evidence:

- `databasechangelog`: 56 rows; 010 present exactly once.
- `system_role_menu`: 1,552 rows before/after the new data repair; target 56 seed rows are retained but soft-deleted.
- Active orphan count for the exact target set: 0.
- Other active role 1/2 tenant 1 relations joining to existing menus: 851.
- Seed admin password remains a non-empty 60-character hash; no password was read or changed.

Restart of the same isolated schema kept the changelog at 56 rows and the 010 changeset at one execution, with zero active target orphans. To verify rollback behavior without leaving a changed baseline, the corresponding guarded rollback UPDATE was run inside a MySQL transaction: it affected 56 rows and the active target count became 56; `ROLLBACK` returned the count to zero.

## Cleanup and integrity

The isolated backend was gracefully stopped. Schema and account were dropped and queried absent; schema privilege count was zero. Redis DB15 was zero with no DB15 client after shutdown and cleanup. Port 48138 had no listener. Shared schemas, users, passwords, Redis databases and existing application PIDs were not changed.

SHA-256 was recorded for existing 001-009 Core MySQL changelog files; their contents were not edited. `git diff --check` passed after implementation. Overall T1/T3/T4 remain open; this closes only the Core role-menu seed dangling-reference defect. Historical UI save-schema reopen and global migration acceptance remain outstanding.
