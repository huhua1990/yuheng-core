# IM P2 file upload callback type repair

workId: `YH-20261111-full-source-migration`

The user authorized P2 clean consumer verification including the BPM/Core compatibility boundary and IM. A fresh IM consumer imports the public Core file API and exposes a strict TypeScript error: `updateFile` accepts `Function`, but the shared request contract requires an Axios upload progress callback. Runtime forwarding is already correct.

PHASE_GATE: PASS. The existing P2 execution instruction authorizes this narrow compatibility repair. Specification and plan are FROZEN for this scope. UI design is NOT_REQUIRED; no interaction changes. Only Modify: the Core file API callback annotation, existing strict consumer regression, local package artifact and verification evidence. Preserve all prior IconSelect work and unrelated changes. No publication.

REQ-IM-TYPE-1 / AC-IM-TYPE-1: A strict consumer can import and call the real public file upload API using an Axios progress callback without shims or filtered diagnostics.

- [x] T-1: Extend the real strict consumer regression with the file API, observe TS2322.
- [x] T-2: Derive the callback parameter type from the shared request upload contract. The matching IM helper derives its return type from the public file API; its DOM `ProgressEvent` annotation reproduced two TS2345 consumer diagnostics.
- [x] T-3: Run focused and full Core UI tests, rebuild and pack locally, reinstall in the disposable IM consumer, and rerun its full strict check.

Verification: Core UI 38 files / 141 tests passed, including the strict consumer and source/archive parity regression. Build/declarations and import boundary passed. IM full strict check: 0 diagnostics; consumer 20 tests, Vite build and relational runtime/desktop checks passed. Local tarball SHA-256 `98233183a721ddf1eed174488df5a295faf507d0eb7c59bc220c1a10c5056150`. No registry publication.

Code/governance/knowledge baseline: Core `c3c6d648239171e5c4db65a41d7bc611d4fe73f9` (exact current SHA is recorded with the IM verification versions). Evidence: Templates `docs/verification/2026-11-24-im-p2-consumer/`. Rollback is removal of this narrow annotation and test addition; preserve historical migration changesets and existing repository modifications.
