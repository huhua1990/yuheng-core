# Role-menu seed orphan repair plan

**workId:** YH-20261111-full-source-migration  
**Spec:** `docs/superpowers/specs/2026-11-16-role-menu-seed-orphans-design.md`  
**Core version:** workspace version `0.1.0-SNAPSHOT`; retain all existing uncommitted work.  
**Authorization:** Existing full-source migration implementation authorization plus the user's instruction to continue until complete.

## PHASE_GATE

- Stage: implement and verify a Core SQL initialization defect found during T3 role-menu acceptance.
- Spec: FROZEN at the linked spec; based on direct query/source reconciliation.
- Plan: FROZEN here; technology is additive MySQL Liquibase only.
- Prototype: NOT_REQUIRED; data-only repair with no UI behavior change.
- Only Modify: Core MySQL changelog include, new 010 changeset, focused governance regression test, this plan/spec, and Demo migration evidence.
- Do Not Modify: executed 001-009 changesets, shared schemas, passwords, UI/API, business modules, and other workspace changes.
- Consumption impact: new Core release consumers receive corrected clean-install role grants; existing consumers need Liquibase to apply 010. No prior checksum changes.
- implementationAllowed: true; the user authorized full migration and repeated continuation, and this fix is within the SQL-governance acceptance scope.

## Tasks

1. Add a source-derived regression test for the exact 56 orphan seed relations and observe RED before adding the migration. **Done:** initial test failed because changeset 010 was not registered.
2. Add changeset 010 with exact-ID, active-state, tenant/role and missing-menu guards; provide same-row guarded rollback. **Done;** target-specific test passes.
3. Use a dedicated MySQL schema and restricted user to cold-run full Liquibase, verify affected and unaffected role grants/password hashes, run Liquibase again, and test rollback in a rolled-back transaction.
4. Stop only this run's processes and remove only its schema/user/cache resources; verify cleanup.
5. Run focused governance tests, applicable Core tests/build, compare existing changeset checksums/files, update the Demo evidence and open-item ledger, then run diff checks.

## Risks and recovery

The migration is DML against a protected `system_*` base table, but it is narrowly limited to exact rows proved to be present in the shipped Core seed and is explicitly authorized as Core SQL governance work. Keep a dedicated schema for execution. Rollback restores the same seed relations only if the target menu remains absent; if a later module supplies such a menu, it leaves the grant inactive to avoid resurrecting a potentially unintended permission. No shared database is touched.
