# Session report — 2026-09-28 #04 (phase 3 begins: first port units verified)

**Scope:** the first F# core units + oracle-04 completion. **The port now exists, runs
headless, and its first verified results are bit-identical to the original game.**

## Units completed

| unit | result |
|---|---|
| oracle-04 | `oracle/runner/fs-runner` — .NET console host compiling the SAME `kittens_land/src/Game/*.fs` sources the Fable app uses (single source of truth). Emits orig-driver-shaped snapshot JSON. `diff-snapshots.js` v2: order-insensitive keys, `--include` subtree filters, scenario+seed header check. F# self-check identical. |
| resources-01 | 60-resource definition catalog in `Game.Catalog.Resources.fs`, GENERATED from an orig catalog dump (`orig-driver --dump-catalog` → `tools/gen-resource-catalog.js`) — zero hand transcription. Verified: `diff-json /catalog` **IDENTICAL, 60/60 defs bit-exact** (all flags incl. the antimatter refundable-function dispatch). |
| resources-02+03 | ResPool registry + `addRes`/`addResEvent`/`addResPerTick` pipeline in `Game.Resources.fs` (+ `getUnlimitedDR`/`getInverseUnlimitedDR`/`jsRound` in `Game.Math.fs` for the karma branch). Verified via `unit-resources.cat` resop scenario: **IDENTICAL to orig on resources + actionLog** — including the float `catnip = 1000006.4999999999`. |

## What the unit scenario proved (orig quirks now pinned in the port)

- Paradox gate: `calendar.day` is **0** (not -1) after resetState — `addRes` is NOT
  gated at tick 0 (measured against the fixture; my initial -1 assumption was wrong).
- Unset caps: `maxValue || Number.MAX_VALUE` — with maxValue 0, `addResEvent catnip
  1000000` grows unclamped.
- void → `floor`; values < 1e-10 → 0; the returned delta returns `addedValue` verbatim
  when unclamped (avoiding double rounding — orig's own comment).
- karma: `jsRound(getInverseUnlimitedDR(v, 5))` → `getUnlimitedDR` roundtrip = 100 from
  input 100, exactly (sqrt(40401) = 201 exact in FP).
- Missing resource (`energy`): orig `get()` returns `false`; property writes on the
  primitive no-op and `addRes` returns NaN (JSON `null`) — reproduced in the F# runner.

## Files changed

- new: `kittens_land/src/Game/{Game.Types,Game.Math,Game.Catalog.Resources,Game.Resources}.fs`
  (catalog generated, rest hand-ported), `oracle/runner/fs-runner/{fs-runner.fsproj,Program.fs}`,
  `oracle/scenarios/unit-resources.cat`, `oracle/fixtures/{resource-catalog-orig,unit-resources}.json`,
  `tools/{gen-resource-catalog,diff-json}.js`; updated `kittens_land.fsproj` (Game sources
  included — Fable build still green), `oracle/runner/{orig-driver,scenario}.js`
  (dump-catalog + resop), `tools/diff-snapshots.js` (v2).
- orig touched: nothing.

## Verification status

- `dotnet build kittens_land`: 0w/0e; `elmish-land build` (Fable): green with the new
  Game sources included.
- Ledger: oracle-04, resources-01, resources-02, resources-03 → verified (30 verified
  total). Phase 3 verification model working end-to-end: implement → build → resop
  scenario → bit-exact diff → ledger.

## Notes / limitations

- Snapshot comparison is scoped via `--include resources actionLog` until more core
  exists; scope grows with the port (D014). Golden player scenarios unchanged.
- Cap clamping with REAL limits is deferred to resources-06's own verification (the
  unset-cap path is what unit-resources exercises).
- Harness gotchas fixed along the way: `dotnet run` cwd = project dir (absolute paths);
  Git Bash mangles leading-slash tool args (`/catalog` → use `catalog`).

## Next session suggestion

`resources-04..06` (stock-ratio helper, per-tick update loop, cap computation) — then
`fresh-100-ticks` should verify bit-exact on the full resources subtree including caps,
and `gather-hut-field` resource behavior follows with buildings-01 price/payment units.
