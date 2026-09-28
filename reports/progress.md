# Progress dashboard

Human-readable view. **Ledger (`ledger/migration.yaml`) is the source of truth** — update
that first, then this. Last synced: 2026-09-28 (sessions 2026-09-28-02, -03).

## Phase status

| Phase | Status | Notes |
|---|---|---|
| 0 Bootstrap | **done** | structure + scan + scaffold (both builds green) |
| 1 Reconnaissance | **done** | 33/33 files described (100%); 244 port units defined with layers+deps |
| 2 Deterministic oracle | **core done** | orig runs headless + deterministic; 3 golden fixtures bit-exact self-checked; F# port-side runner pending (phase 3) |
| 3 Incremental migration | **in progress** | 11/244 units verified (resources core complete except shell unit); all bit-exact vs orig incl. RNG-stream parity |
| 4 Closure | not started | |

## Unit counts (from ledger)

| Status | count |
|---|---|
| verified | 37 (bootstrap×3, oracle×4, recon×20, resources×10) |
| in-progress | 0 |
| translated | 0 |
| not-started | 233 ported units + verify-01 |
| blocked | 0 |

## Next available units (dependencies satisfied)

- **Next port units:** `game-10` first slice (calcResourcePerTick fresh state) +
  `resources-11` — then `fresh-100-ticks` verifies the full resources subtree on a
  live tick pipeline, retiring the injected-production seams.
- Recon is complete (20/20); remaining recon slots only matter for late-phase files.
- `verify-01` (mechanical spec verification) — no deps; workshop recon already found
  the first spec discrepancy (143 upgrades / 23 crafts vs spec's 142/20).

## Open observations

- none open — OBS-1 (science gate) resolved 2026-09-28 via D012; OBS-2 (assignJob
  over-count) is expected orig behavior, captured in the port's contract.

## Milestones

- [x] Orig runs headless, deterministic (self-check identical)
- [x] Golden fixtures captured (3 scenarios, bit-exact ×2 runs)
- [x] First core units (resources-01..03) verified bit-exact against orig
- [ ] First 1000-tick scenario agrees bit-exact (port vs orig)
- [ ] Temple-baseline scenario (627k ticks) agrees
- [ ] All 12 tabs render in kittens_land from ported core
