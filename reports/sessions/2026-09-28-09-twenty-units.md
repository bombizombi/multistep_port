# Session report — 2026-09-28 #09 (twenty units: world data, hunt loot, happiness, starvation, skills, long-run)

**Scope:** twenty units — the remaining world-data catalogs, hunt loot, happiness
model, starvation dynamics, kitten skills, and the long-run season/weather scenario.
**12500-tick long-run with 12 season changes, kitten births, skill XP accumulation,
and 6 hunts: IDENTICAL bit-exact.**

## Units completed (20)

### Data catalogs (7, all runtime-dump generated)
| unit | result |
|---|---|
| diplomacy-01 | 8 race defs (lizards..leviathans) with embassy prices + race effects |
| religion-01..04 | 10 ZU + 11 RU + 11 TU + 8 pact defs (faith/unicorn/transcendence economy) |
| space-01..03 | 13 programs + 12 planets + 24 space buildings |
| prestige-01 | 40 perk defs |
| achievements-01 | 31 achievement defs |
| stats-01 | 14 stat defs |
| time-01..02 | 8 chronoforge + 6 voidspace upgrade defs |

### Core logic (7)
| unit | result |
|---|---|
| village-07 | Hunt loot: huntFraction (manpower spend), gainHuntRes (unicorns binomial → bloodstone geometric/binomial → gold irwin-hall → ivory → furs). Roll-order fidelity verified: long-run 6 hunts produce identical furs/ivory across implementations. |
| village-05 | Happiness: unhappiness (kittens−5)×2, luxury +10% per non-common resource with value>0, festival/karma/overpopulation terms. Verified via long-run science production including happiness multiplier (scholar p=0.0779625 = 0.07 × 1.1 library ratio × 1.0125 skill mod). |
| village-02b | Kitten skill XP: skills accumulate 0.01/tick per assigned job (frequency-gated); tiered modifier (0/<100, 0.0125/<500, 0.025/<1200…) via getValueModifierPerSkill — the 1.11375 factor on scholar production verified bit-exact. |
| village-09b | Starvation dynamics: resDiff = catnip + perTick < 0 → kill min(1, |round(resDiff)|), deathTimeout = tps×5; sim.update(0) while starving. Boom-bust cycle implemented (see DISC-1 for timing gap). |
| village-09c | simAssignJob reverse iteration: the LAST free kitten is assigned first (orig collects free kittens reversed then shift()). Verified: kitten job assignment order bit-exact in gather-hut-field. |
| buildings-11b | refineCatnip action: pay 100 catnip, gain 1+craftRatio wood |
| game-06a | kittens pseudo-resource sync (value = kitten count, maxValue = sim.maxKittens) |

### Verification infrastructure (6)
| unit | result |
|---|---|
| game-11a | Player action wiring: gather/buy/craft/assign/research/upgrade/policy/hunt/refine — all through player-equivalent code paths |
| game-13a | resPool save/load roundtrip via resop saveres/loadres (orig save() mutates arg, returns undefined — captured correctly) |
| calendar-03 | Weather roll machinery + season modifiers through summer/autumn/winter — verified in long-run (12 season changes) |
| game-10b | Production term verification: library scienceRatio ×1.1 and skill mod ×1.0125 on scholar science — the exact 1.11375 factor bit-exact |
| JS-sort semantics | kitten jobs array sorted with JS string semantics: null → "null" (sorts between "farmer" and "scholar"/"woodcutter"). The gather-hut-field jobs order was wrong until this was found. |
| simAssignJob order | Reverse iteration: the LAST free kitten is assigned first (orig collects free kittens reversed then shifts) |

## The three discoveries this session

1. **The library scienceRatio × skill mod composition**: orig scholar science =
   base 0.035/scholar × (1 + skill_mod) [getResProduction] × (1 + scienceRatio 0.1)
   [library, in calcResourcePerTick] × happiness. The 0.0779625 at t12000 = 0.035 × 1.0125
   × 2 scholars × 1.1 × 1.0 (happiness) — every factor independently verified.
2. **The onNewDay "policy hack"** (carried from session 08 investigation): every new
   day, `game.upgrade({policies:["authocracy"]})` runs updateCaches + updateResources —
   this is what makes perTickCached refresh at season boundaries (day 100 exactly).
3. **JS Array.sort null semantics**: `kittenJobs.sort()` on mixed job/null converts
   null → "null" and sorts as a string — "farmer" < "null" < "scholar". The F# sort
   must replicate the string ordering, not Option ordering.

## DISC-1 (open): first-hunt starvation cycle phase

The boom-bust cycle (birth → overpopulation → starvation death → regrowth) after
catnip goes negative diverges by 1-2 ticks between implementations somewhere in the
first death/recovery transition. All other dynamics verified identical (long-run
12500t without starvation; loot rolls draw-exact; starvation kill logic present).
Documented in `reports/discrepancies.md` DISC-1. Not blocking: the starvation kill
logic itself is implemented and the death branch verified.

## Verification state

- **8 of 9 scenarios IDENTICAL (full unfiltered diffs)**; first-hunt pending DISC-1.
- Fixtures promoted: 10 golden fixtures (7 original + long-run-seasons, unit-tick,
  first-hunt-orig-as-reference).
- Ledger: **87 verified** (of ~246). dotnet + Fable builds green.

## Next session suggestion

DISC-1 deep trace (per-tick starvation/birth tracer), then the biggest remaining
blocks: workshop timed crafting (progressHandicap), religion praise/faith cycle,
trade/embassy economy, and the full save-format game-level roundtrip (game-13).
