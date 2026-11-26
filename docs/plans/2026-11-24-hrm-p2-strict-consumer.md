# HRM P2 strict consumer gate

workId: `2026-11-24-hrm-p2-strict-consumer`

PHASE_GATE: delivery/verification; specification and plan FROZEN under the user's authorization to finish P2 HRM strict consumer verification after BPM/OA. Prototype NOT_REQUIRED: existing component behavior is preserved. Implementation allowed for the confirmed compatibility defects below. Core code/governance/knowledge revision: `c3c6d64`; Demo baseline: `cb9f770`; Templates revision recorded in the consumer evidence.

## Scope and acceptance

- REQ-1 / AC-1: Check the complete Skill-initialized HRM consumer, all retained Demo pages, and actual package exports with strict TypeScript. No broad compatibility shims, business-page exclusion, or diagnostic filtering may establish PASS.
- REQ-2 / AC-2: Fix the shared IconSelect strict contract at its Core source, without changing icon selection/search/pagination behavior. First reproduce with the existing strict package-consumer test, then pass that test and relevant Core tests.
- REQ-3 / AC-3: Record the exact Core archive digest and package-install outcome. A local archive check is not registry release verification. Preserve existing Demo/Templates changes and prior runtime/API/SQL evidence; do not repeat HRM business acceptance.

## Tasks

- [x] T-1 Reproduce registry-package and Demo shim differences; compare archive/source hashes.
- [x] T-2 Extend Core strict-consumer contract to import public Icon exports; observed 12 expected IconSelect type diagnostics, then implemented the smallest typed fix.
- [x] T-3 Build/package Core, install only into the disposable consumer, use real automatic/global/component declarations, and run the entire consumer typecheck without compatibility shims. Full typecheck passed with 0 diagnostics.
- [x] T-4 Reconcile the already-fixed Member baseline line selectively without excluding the page. No additional package resolver adaptation was needed after real package declarations were loaded correctly.
- [x] T-5 Run relevant regressions, review diff, and persist evidence and limitations under Templates docs/verification.

Only Modify: Core IconSelect and its strict consumer test; task evidence; disposable consumer configuration/dependencies and already-fixed Member line. Do Not Modify: production databases, prior migrations, public business behavior, governance snapshots, unrelated source, formal Demo product files. Rollback: discard only this task's focused diff and disposable consumer files. No release/publish is part of this task.
