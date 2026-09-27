# Progress dashboard

Human-readable view. **Ledger (`ledger/migration.yaml`) is the source of truth** — update
that first, then this. Last synced: 2026-09-28 (sessions 2026-09-28-02, -03).

## Phase status

| Phase | Status | Notes |
|---|---|---|
| 0 Bootstrap | **done** | structure + scan + scaffold (both builds green) |
| 1 Reconnaissance | **in progress** | 7/33 port-relevant files described (80% of lines); 107 port units defined; religion/time recon running |
| 2 Deterministic oracle | **core done** | orig runs headless + deterministic; 3 golden fixtures bit-exact self-checked; F# port-side runner pending (phase 3) |
| 3 Incremental migration | **ready to start** | first targets: resources-01..03 against captured fixtures |
| 4 Closure | not started | |

## Unit counts (from ledger)

| Status | count |
|---|---|
| verified | 13 (bootstrap×3, oracle×3, recon×7) |
| in-progress | 1 (oracle-04 — F# runner half) |
| translated | 0 |
| not-started | 107 ported units + 13 recon + verify-01 |
| blocked | 0 |

## Next available units (dependencies satisfied)

- **First port units (phase 3 start):** `resources-01` (resource defs data) →
  `resources-02` (per-tick calc core) — verified against `fresh-100-ticks` +
  `gather-hut-field` fixtures via the F# runner (oracle-04 completion).
- Recon batch 2: `recon-04` (workshop), `recon-05` (science) running; then
  `recon-08` religion, `recon-09` time, `recon-10` diplomacy.
- `verify-01` (mechanical spec verification) — no deps, high value before data porting.

## Open observations

- OBS-1: science production gate not yet identified (see `reports/discrepancies.md`) —
  resolve during village-04/resources-05 porting.

## Milestones

- [x] Orig runs headless, deterministic (self-check identical)
- [x] Golden fixtures captured (3 scenarios, bit-exact ×2 runs)
- [ ] First core unit (resources-01/02) verified against orig fixtures
- [ ] First 1000-tick scenario agrees bit-exact (port vs orig)
- [ ] Temple-baseline scenario (627k ticks) agrees
- [ ] All 12 tabs render in kittens_land from ported core
