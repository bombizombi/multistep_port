# Recon: js/prestige.js (715 lines) — recon unit recon-13

## Description
Implements the prestige (paragon/metaphysics) subsystem. `classes.managers.PrestigeManager` (extends `com.nuclearunicorn.core.TabManager`) holds one static table of 35 perk definitions: a paragon `prices` entry, an `unlocked`/`defaultUnlocked` visibility flag, a `researched` purchase flag, an `unlocks` graph (keys: `perks`, `zigguratUpgrades`, `jobs`, `tabs`), optional `upgrades` (policies/jobs/zigguratUpgrades), and generic effect dicts (`priceRatio`, `paragonRatio`, craft ratios, `kittenGrowthRatio`, `queueCap`, `standingRatio`, embassy effects). Two defs embed behavior: `diplomacy` has a purchase `handler` calling `science.unlockRelations()`, and `treaties` has `calculateEffects` that rewrites its own description. Manager logic covers lifecycle (`registerMeta("research", perks)`, effects caching, `resetState` restoring `defaultUnlocked`, save/load with re-unlock) and the paragon economy math: production/storage ratios derived from current paragon and burnedParagon via `getLimitedDR`/`getUnlimitedDR`, plus `getResetBonusBreakdown` for the marginal-gain reset preview (used by time.js). The UI half is `PrestigeBtnController` (buys gated on the `metaphysics` science), two small button controllers (burn paragon, turn holy genocide off), and `PrestigePanel` rendering perk buttons plus those two buttons and a hide-researched checkbox. The actual reset payout (paragon/karma awarding) and `discardParagon` (paragon → burnedParagon conversion) live in game.js, not here.

## Functionality
1. Perk defs A — economy/craft chain: `engeneering` (sic), codexVox/codexLogos/codexAgrum manuscript/compedium/blueprint craft ratios, megalomania/blackCodex (zigguratUpgrades), goldenRatio..renaissance priceRatio/queueCap (lines 4-143).
2. Perk defs B — diplomacy chain: `diplomacy` (purchase handler → `science.unlockRelations`, upgrades policy `lizardRelationsEcologists`), zebraDiplomacy/zebraCovenant/navigationDiplomacy, `ambassadors` (unlocks ambassador job), `treaties` (self-mutating `calculateEffects` description) (lines 144-220).
3. Perk defs C — *mancy & growth: chronomancy/astromancy/unicornmancy/alicornmancy/anachronomancy, carnivals, willenfluff/pawgan `kittenGrowthRatio`, numerology/numeromancy (lines 221-323).
4. Perk defs D — sephirot chain malkuth→…→keter: ten chained perks each +5% `paragonRatio`, prices 500→60000 (lines 325-458).
5. Perk defs E — void/challenge: `voidOrder`, `adjustmentBureau` (unlocks `tabs: ["challenges"]`), `ascoh` (lines 461-488).
6. Lifecycle: constructor `registerMeta("research", perks)` + `setEffectsCachedExisting`; `resetState` resets `unlocked`→`defaultUnlocked`, `researched`=false, `hideResearched`=false (lines 492-505).
7. Save/load: `saveData.prestige {perks (name/unlocked/researched), hideResearched}`; on load re-fires `game.unlock(perk.unlocks)` for researched perks (lines 507-528).
8. Lookups/spend: `getPerk`, `getSpentParagon` (sums `perk.paragon` — a field nothing ever sets, see risks), empty `update()` (lines 530-547).
9. Paragon economy math: `getParagonRatio` (1 + paragonRatio effect), `getBurnedParagonRatio` (unlimitedDR 500), `getParagonProductionRatio` (limitedDR 2×ratio; burnedParagon cap ×4 in dark future), `getParagonStorageRatio` (paragon/1000; burnedParagon /500 dark-future vs /2000) (lines 549-579).
10. `getResetBonusBreakdown(extraParagon, extraKarma)` — marginal happiness/storage/production deltas of a hypothetical reset payout (lines 581-597).
11. Button controllers: `PrestigeBtnController` (cached metadata, buy gated on `metaphysics`, visibility incl. `hideResearched`), `BurnParagonBtnController`, `turnHGOffButtonController` (lines 608-647).
12. `PrestigePanel` render: hide-researched checkbox, one `BuildingResearchBtn` per perk, burn-paragon button → `game.discardParagon()`, turn-HG-off button → `game.religion.turnHGOff()` (lines 649-715).

## Proposed work units
| id | title | symbols | lines (orientation) | layer | depends on |
|---|---|---|---|---|---|
| prestige-01 | Perk definition table (35 defs) | `perks` array, prices, `unlocks`, effects dicts, `defaultUnlocked` | 4-488 (data table) | data | i18n ($I), effect-system keys |
| prestige-02 | Behavioral perk defs + unlock taxonomy | `diplomacy.handler`, `treaties.calculateEffects`, `upgrades` (policies/jobs/zigguratUpgrades), `tabs` unlock | 144-163, 202-220, 252-261, 469-480 | core | prestige-01; science, game.unlock |
| prestige-03 | Manager lifecycle: register, reset, save/load | constructor, `resetState`, `save`, `load`, `getPerk`, `unlockAll` | 492-536, 599-604 | core | prestige-01; TabManager helpers |
| prestige-04 | Paragon economy math | `getParagonRatio`, `getBurnedParagonRatio`, `getParagonProductionRatio`, `getParagonStorageRatio` | 549-579 | core | prestige-01; resPool, calendar.darkFutureYears, DR helpers |
| prestige-05 | Reset bonus preview | `getResetBonusBreakdown` | 581-597 | core | prestige-04; consumed by time.js:1949 |
| prestige-06 | Cross-module perk gating integration | `getPerk(...).researched` read sites (calendar, diplomacy, religion, space, village, challenges, science, workshop, ui, time) | call sites: challenges.js:1019,1118; calendar.js (×12); diplomacy.js:588-669; religion.js:629-865; village.js:333-5764; etc. | core | prestige-01, prestige-03 |
| prestige-07 | Prestige button controllers | `PrestigeBtnController`, `BurnParagonBtnController`, `turnHGOffButtonController` | 608-647 | shell | prestige-03; science metaphysics |
| prestige-08 | Prestige panel UI + burn/HG actions | `PrestigePanel`, `hideResearched` checkbox, burn-paragon → `game.discardParagon` | 649-715; game.js:5437-5461 (discardParagon impl) | shell | prestige-07 |

## Dependencies
- Called by: game.js registers the manager (`{id:"prestige", class:"PrestigeManager"}`, game.js:2494) and owns the payout side — `getResetPrestige`/`_resetInternal` (game.js:5534+) award paragon/karma on reset and `discardParagon` (game.js:5437-5461) converts paragon into burnedParagon; ratio consumers: buildings.js:2550 (`getParagonProductionRatio`), resources.js:937 (`getParagonStorageRatio`), village.js:242, diplomacy.js:1399, time.js:1735 (`getBurnedParagonRatio`), time.js:1949 (`getResetBonusBreakdown`); ~25 call sites poll `getPerk(...).researched` across calendar/diplomacy/religion/space/village/challenges/science/workshop/ui.
- Calls into: `game.science.get("metaphysics")` and `science.unlockRelations`, `game.unlock` (fan-out of `unlocks`/`upgrades` to perks, zigguratUpgrades, jobs, tabs, policies), `game.resPool.get("paragon"/"burnedParagon")`, `game.calendar.darkFutureYears`, `game.getEffect`/`getLimitedDR`/`getUnlimitedDR`/`getDisplayValueExt`, `game.religion.turnHGOff`/`activeHolyGenocide`/`getTU("holyGenocide")`, TabManager helpers (`registerMeta`, `setEffectsCachedExisting`, `getMeta`, `filterMetadata`, `loadMetadata`), `game.msg`.

## State & determinism
- Mutable state: `perk.unlocked`/`perk.researched` flags, `hideResearched`, the panel-side cached `model.metaCached` per button model, and `treaties.description` mutated by its `calculateEffects`; reset restores `defaultUnlocked` and clears `researched`.
- No randomness anywhere in the file (confirmed: no `Math.random`, no `game.rand`); only clock-derived input is `game.calendar.darkFutureYears()` (deterministic given game state), used to branch burned-paragon potency.
- Purchase flow is idempotent-through-controller (stackable=false `BuildingNotStackableBtnController`); effects are cached at construction (`setEffectsCachedExisting`) and after purchases by the shared meta framework, so recomputation timing is delegated to TabManager.
- Latent dead code: `getSpentParagon()` sums `perk.paragon`, which is never assigned anywhere in the project (verified by grep), so it always returns 0; it also has no callers.

## Port notes / risks
- The reset payout itself is NOT here: paragon/karma awarding (`getResetPrestige`, `_resetInternal`) and `discardParagon` live in game.js — keep the F# PrestigeManager scoped to defs + ratios + flags, and port payout with the game reset logic, not this file.
- Identifier spellings are load-bearing save/lookup keys: perk name `engeneering` (sic) and effect keys `compediumCraftRatio`/`compediumGlobalCraftRatio` (sic) must be preserved exactly, as must every def `name` referenced by ~25 external `.researched` checks.
- Effects flow through the generic effect system (`priceRatio`, `paragonRatio`, `kittenGrowthRatio`, `queueCap`, `standingRatio`, `embassiesPerAmbassadorSlot`, `ambassadorBoostPerRank`, craft ratios); the F# port needs the same key vocabulary in its effects aggregation.
- Diminishing-returns details are subtle: production paragon bonus capped at `2 * paragonRatio` via `getLimitedDR`, burned-paragon production cap ×4 and storage divisor 500 vs 2000 in dark future, and `getUnlimitedDR(burnedParagon, 500)` for the time-cost discount (time.js:1735) — replicate exact formulas and ordering.
- `treaties.calculateEffects` mutates its own `description` with a formatted display value — replace with a derived/computed display string in F# rather than mutable def state.
- Buy gating is two-layered: `PrestigeBtnController.buyItem` blocks purchases until `metaphysics` science is researched, and `updateVisible` hides un-unlocked perks and optionally hides researched ones (`hideResearched`, persisted in save).
- `PrestigePanel.render` leaks a global `self = this` (line 659, no `var`) before shadowing it at line 683 — harmless accident in the original, do not replicate.
- `unlocks`/`upgrades` graph strings (`perks`, `zigguratUpgrades`, `jobs`, `tabs`, `policies`) target different subsystems re-fired on load (`load` re-calls `game.unlock` for researched perks); the F# port must preserve re-apply-on-load semantics and the fan-out dispatch.
