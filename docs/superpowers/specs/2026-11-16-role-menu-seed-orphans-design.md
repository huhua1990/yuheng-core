# Platform role-menu seed orphan repair

**workId:** YH-20261111-full-source-migration  
**Date:** 2026-11-16  
**Authorization:** The user has authorized completion of the full-source migration and continued follow-up. This is a Core SQL-governance defect directly found while completing its role-menu verification.

## Finding

Core's registered MySQL seed inserts 56 active `system_role_menu` rows for tenant 1 roles 1 and 2, but the referenced 28 `system_menu` IDs are absent from the same seed. The active relation set is returned by role-menu GET. Saving a role submits only IDs represented by the current simple-menu tree; the service then soft-deletes omitted relations. A clean installation therefore exposes dangling platform grants and silently removes them on the first role-menu save. The affected menu IDs are 1679, 1684, 1703, 1704, 1706, 1707, 1724-1732 (excluding 1733), 1734, and 1842-1847, 1849-1854.

The 28 IDs are absent from `system_menu`, not hidden by ordinary-tenant package filtering. The reproduction used system tenant 1, whose contract returns all seeded menus. Existing changeset 005 has already been executed in consumers and must remain immutable.

## Design

Add one MySQL Liquibase changeset after 009. It soft-deletes only the 56 audited seed rows by exact relation primary keys, role IDs 1/2, tenant 1, active state, and a `NOT EXISTS` check for the referenced menu. This avoids changing schema and avoids touching consumer-created grants or a menu that a later module may supply. Rollback restores only the same exact rows and only while their menu is still absent. Changeset 005 and prior checksums remain untouched.

## Acceptance

- **AC-1:** A source-derived test proves exactly the 56 orphan seed relations are targeted and the changeset is registered.
- **AC-2:** A fresh isolated MySQL installation executes the complete current changelog; the 56 target relations are inactive, all legitimate menu relations remain active, and historical password hashes remain populated.
- **AC-3:** Re-running Liquibase makes no data change and reports no pending changesets.
- **AC-4:** The guarded rollback SQL reactivates exactly the same seed rows in a transaction-level isolated verification; the experiment rolls itself back and leaves no fixture change.
- **AC-5:** Existing 001-009 files/checksums are unchanged; module tests, package, changelog diff and `git diff --check` pass.

## Boundaries

Only Core changelog registration, new changeset, regression test, this spec/plan and the full-migration evidence may change for this finding. Do not modify shared schemas, historical passwords, UI/API behavior, prior changesets, or unrelated consumer edits. Verification uses a dedicated temporary schema and least-scope account, with exact cleanup after all dependent tests finish.
