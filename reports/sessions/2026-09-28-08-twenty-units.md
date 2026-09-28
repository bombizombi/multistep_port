# Session report — 2026-09-28 #08 (twenty units: buildings, science, workshop, village, end-to-end)

**Scope:** twenty units — the building/science/workshop data + logic core, the village
sim core, and full player-action wiring. **The port now plays the early game through
player actions and matches the original bit-exactly on FULL unfiltered snapshot
diffs** — 900-tick gather-hut-field and 3000-tick first-research (agriculture
researched end-to-end) both IDENTICAL.

## Units completed (20)

| unit | result |
|---|---|
| buildings-01 | stage-aware metadata access (activeEffects: stage table overrides def table) |
| buildings-02 | manager registry + effect dispatch: provider port (Max ×val / rest ×on, coalRatioGlobal raw, library exemption) + manager aggregation groups |
| buildings-03..07 | ALL 40 building defs **generated from a runtime dump** (`--dump-defs` → Game.Catalog.Defs.fs): prices, ratios, effects (calculateEffects verified val-CONSTANT en masse — baked as data), stages, unlocks, unlockSchemes |
| buildings-08 | price math: ratio^val × CostReduction LDR chain — bit-exact field purchases |
| buildings-09 | per-tick unlock evaluation (unlockRatio 0.3 + un-flip) — unlock flags bit-exact |
| buildings-11 | gatherCatnip player action (catnip.value++) |
| science-01/02 | 62 tech defs generated (old spec's 61 was WRONG) + research with unlock fan-out |
| science-04 | 64 policy defs generated + policy research |
| workshop-01..03 | 143 upgrade defs (old spec: 142 — wrong) + 23 crafts generated; researched-raw aggregation; craft execution (craftRatio, ceil, pay+gain) |
| village-02 | kitten sim: births (0.01/tick progress), kitten-seed LCG (ONE global draw + private Lehmer for all attributes) — birth timing bit-exact |
| village-04 | job production (calculated scholar/geologist/priest/ambassador modifiers) + consumption (−0.85 catnip/kitten) wired into the production formula — catnip perTick bit-exact |
| village-09 | assignJob with free/limit capping + OBS-2 counter/kitten divergence logging — bit-exact |
| game-07 | DR math (getLimitedDR/getUnlimitedDR/getInverseUnlimitedDR/jsRound/jsOr0) |

## The three orig behaviors the oracle forced into the open

1. **The onNewDay "policy hack"** (js/calendar.js:730): every new day ends with
   `game.upgrade({policies:["authocracy"]})` — and game.upgrade unconditionally runs
   `updateCaches` + `updateResources`. The daily cache refresh is driven by the
   CALENDAR, not the 5-tick timer — discovered by bisecting a 0.85-catnip drift to
   tick 560 with a stack trace into calendar.onNewDay.
2. **`upgrades` ≠ `unlocks`**: library's `upgrades.buildings = ["biolab","observatory"]`
   triggers effect recalculation ONLY — my first port treated it as unlock fan-out and
   wrongly marked biolab unlockable. `game.unlock` and `game.upgrade` are different
   verbs; the defs dump distinguishes them.
3. **AssignJob caps internally** (`min(amt, freeKittens, jobLimit−value)`) while the
   kitten-level assignment can assign fewer — the counter/kitten divergence (OBS-2)
   is bounded by the cap, and the warning-string format is now reproduced exactly.

## Verification state

- **8 of 9 scenarios IDENTICAL (FULL unfiltered diffs)**: fresh-100-ticks,
  gather-hut-field, first-research, unit-resources, unit-res-caps, unit-res-misc,
  unit-tick, unit-math. First-hunt differs ONLY in hunt loot (village-07, not yet
  ported — expected, documented).
- Fixtures promoted: 8 golden fixtures, all bit-exact vs both implementations.
- Ledger: **67 verified** (of ~246). dotnet + Fable builds green.

## Next session suggestion

`village-05` (happiness model — happiness > 1 consumption terms engage), then
`village-07` (hunting loot — closes first-hunt), then `buildings-10` (pollution) and
`game-10` remaining slices (steamworks/magneto/reactor terms) — at which point
`first-research`'s full 3000-tick economy including winter starvation checks verifies.
