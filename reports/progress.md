# Progress dashboard

Human-readable view. **Ledger (`ledger/migration.yaml`) is the source of truth** — update
that first, then this. Last synced: 2026-09-27 (session 2026-09-27-01).

## Phase status

| Phase | Status | Notes |
|---|---|---|
| 0 Bootstrap | **done** | structure + scan + scaffold (both builds green) |
| 1 Reconnaissance | **ready to start** | mechanical half done (`analysis/files.json`, `inventory.md` skeleton); recon-01..20 defined, 0/20 described |
| 2 Deterministic oracle | **ready to start** (oracle-01..04 defined) | design in `oracle/README.md` |
| 3 Incremental migration | not started | starts after first recon batches + oracle-03 |
| 4 Closure | not started | |

## Unit counts (from ledger)

| Status | count |
|---|---|
| verified | 3 (bootstrap-01..03) |
| in-progress | 0 |
| translated | 0 |
| not-started | 27 (oracle-01..04, verify-01, recon-01..20) |
| blocked | 0 |

## Next available units (dependencies satisfied)

- `oracle-02` (scenario format + parser) — no deps
- `verify-01` (spec verification) — no deps
- `recon-01`, `recon-02`, `recon-03` … — recon has no hard deps; do 2–3 per session

## Blocked / waiting

- `oracle-01`, `oracle-03`, `oracle-04` — depend on oracle-02 / oracle-01

## Milestones

- [ ] First scenario runs twice-identically on orig (determinism self-check)
- [ ] First core unit (data: resource defs) verified against orig fixtures
- [ ] First 1000-tick scenario agrees bit-exact
- [ ] Temple-baseline scenario (627k ticks) agrees
- [ ] All 12 tabs render in kittens_land from ported core
