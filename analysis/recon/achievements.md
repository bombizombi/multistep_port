# Recon: js/achievements.js (883 lines) — recon unit recon-14

## Description
Implements the achievements subsystem as a single dojo module with four classes. `classes.managers.Achievements` (extends `com.nuclearunicorn.core.TabManager`) holds two static definition tables: 32 achievement defs (i18n title/description, a `condition` closure polled each tick, optional `starCondition` for "star" achievements, and `hidden`/`unethical` flags) and 22 badge defs (hardcoded English titles, a `difficulty` letter, optional `condition`, `fullyHidden` flag). The manager's `update()` is called from the game loop and one-way-unlocks any def whose condition returns true; explicit grant helpers (`unlockAchievement`/`unlockStarAchievement`/`unlockBadge`) are called from other modules for awards that cannot be expressed as a polled condition. Only the `unlocked`/`starUnlocked` flags are saved/loaded, via TabManager `filterMetadata`/`loadMetadata` under two save keys (`achievements` and legacy `ach`). The UI half consists of `AchievementsPanel` and `BadgesPanel` (DOM-diffing render/update of achievement spans and star glyphs, completion counters excluding unethical entries) plus `AchTab`, the shell tab that hosts both panels.

## Functionality
1. Achievement definition table (32 defs): unicorn/iron-will/village/space/challenge conditions; `theElderLegacy` checks the real wall-clock date (lines 5-273).
2. Badge definition table (22 defs): title/description/difficulty; 8 badges have no `condition` (awarded only via cross-module `unlockBadge`); `beta` reads `window.location.href` (lines 275-435).
3. Lookup + unlock API: `get`/`getBadge` (TabManager `getMeta`), `_unlockBadge`, `_unlockAchievement`, `_unlockStarAchievement` (idempotent, message + makes `achievementTab` visible), public wrappers `unlockBadge`/`unlockAchievement`/`unlockStarAchievement` (lines 441-475).
4. `hasUnlocked()` — any achievement unlocked; game.js uses it to set tab visibility (lines 477-484).
5. `update()` condition polling: iterates achievements then badges, calls `condition.call(this)`/`starCondition.call(this)`; cosmetic 10% `game.rand(100)` flip of the `lostDates` badge title to hourglass glyphs (lines 486-512).
6. `resetState()` — clears all `unlocked`/`starUnlocked`/`badgesUnlocked` flags (lines 514-526).
7. `save`/`load` — achievements under `saveData.achievements` (name/unlocked/starUnlocked), badges plus `badgesUnlocked` under legacy `saveData.ach` (lines 528-544).
8. `unlockAll()` dev cheat (lines 546-551).
9. `AchievementsPanel`: render/update with incremental DOM diffing, hidden-achievement handling, ethical completion counters, filled/empty star glyph header (`&#9733;`/`&#9734;`), `refreshNextTick` full-rebuild mechanism (lines 554-754).
10. `BadgesPanel`: render/update with per-tick diff; `generateBadgeCSSClass` styles the `fantasticFurColor` badge from the leader's fur color/variety, honoring `fractured` pacts + `MAUSOLEUM_PACTS` feature flag (lines 756-851).
11. `AchTab` shell: constructs both panels bound to `game.achievements`, delegates update (lines 853-883).

## Proposed work units
| id | title | symbols | lines (orientation) | layer | depends on |
|---|---|---|---|---|---|
| achievements-01 | Achievement definition table (32 defs + conditions) | `achievements` array, `condition`/`starCondition` closures, `hidden`/`unethical` flags | 5-273 (data table) | data | i18n ($I), typed game-state facade |
| achievements-02 | Badge definition table (22 defs) | `badges` array, `difficulty`, `fullyHidden`, badge `condition`s | 275-435 (data table) | data | achievements-01 (shared facade) |
| achievements-03 | Manager core: lookup, unlock, polling, reset | `get`, `getBadge`, `_unlock*`/`unlock*`, `hasUnlocked`, `update`, `resetState`, `unlockAll` | 437-526, 546-551 | core | achievements-01, achievements-02 |
| achievements-04 | Save/load of unlock metadata (dual-key format) | `save`, `load`, `badgesUnlocked` | 528-544 | core | achievements-01, achievements-02; TabManager metadata helpers |
| achievements-05 | Cross-module grant wiring + tab visibility | external `unlockBadge`/`unlockAchievement`/`unlockStarAchievement` call sites; `game.achievementTab.visible` | 449-475 (origin), call sites in challenges.js:184,311; time.js:1397,1406; workshop.js:3037-3039; village.js:3602 | core | achievements-03 |
| achievements-06 | Achievements panel UI | `classes.ui.AchievementsPanel`, `renderAchievementItem`, `updateAchievementItem`, `generateStarText` | 554-754 | shell | achievements-01, achievements-03 |
| achievements-07 | Badges panel UI incl. fur-color CSS | `classes.ui.BadgesPanel`, `generateBadgeCSSClass` | 756-851 | shell | achievements-02, achievements-03; village leader colors; feature flags |
| achievements-08 | Achievements tab shell + game.js registration | `com.nuclearunicorn.game.ui.tab.AchTab` | 853-883 (tab); game.js:2560-2563, 3178 (registration) | shell | achievements-06, achievements-07 |

## Dependencies
- Calls into (from conditions/UI): `game.resPool.get`, `game.bld.get`, `game.space.getProgram/getPlanet`, `game.religion.faith`/`getPact`, `game.village` (leader, getKittens, happiness, maxKittens, getOverpopulation, colors/varieties), `game.calendar` (year, trueYear, darkFutureBeginning, festivalDays, daysPerSeason, seasonsPerYear), `game.challenges.getCountUniqueCompletions/getCountCompletions`, `game.stats.getStat`, `game.time.flux`, `game.diplomacy.get("leviathans").energy`, `game.workshop.get("seti")`, `game.server.motdContent`, `game.getEffect`, `game.getFeatureFlag`, `game.rand`, `game.msg`.
- Called by: game loop (`update`), game.js (manager registration, `achievementTab` prop wiring game.js:2560-2563, `achievementTab.visible = hasUnlocked()` game.js:3178), external grant sites (see unit achievements-05), save/load pipeline.

## State & determinism
- Mutable state: `unlocked`/`starUnlocked` flags on achievement defs, `unlocked` on badges, `badgesUnlocked`, panel-side `achievementsMap`/`badgesMap`/`achievementsHeader`/`refreshNextTick`; all unlock transitions are one-way until `resetState`.
- Randomness: one cosmetic use — `game.rand(100) < 10` retitles the `lostDates` badge in `update()` (line 505); unlock logic itself is deterministic.
- Time/environment: `theElderLegacy` condition reads `new Date()` (real wall clock, Jan 2017); `beta` badge reads `window.location.href`; several conditions read the game calendar. No other clock/random use.
- Conditions have no side effects (except the lostDates title mutation) and unlock checks are idempotent, so polling order does not matter.

## Port notes / risks
- Conditions are 32+22 `this`-bound closures reaching deep into game state; in F# model them as a discriminated union of predicates (or pure functions over a context record) — do not port the closure-per-def shape literally.
- `$I` i18n strings are evaluated at declaration time; achievement text is i18n but badge text is hardcoded English — preserve the split (or normalize deliberately) and keep exact def `name` keys, which are save-data identifiers.
- Save format is split across two keys: `saveData.achievements` (array) and legacy `saveData.ach {badgesUnlocked, badges}` — both must round-trip for save compatibility.
- `betterSafeThanSorry` achievement auto-grants from the legacy badge's unlock flag (migration bridge, lines 263-266); its star is awarded manually in workshop.js:3037-3039 while its own `starCondition` is a permanent `false` placeholder — a def with a defined-but-false star condition still renders a star slot in UI.
- Eight badges have no `condition` and are only unlocked by cross-module calls (`ivoryTower`, `evergreen`, `ghostInTheMachine`, `abOwo`, `cleanPaws`, `whatYearIsIt`, `tardis`, `wheredThisComeFrom`); the F# port needs the same explicit grant hooks in challenges/time/workshop/village.
- Panel logic is heavily DOM-diff oriented (HTML-entity vs `String.fromCharCode` comparisons for star glyphs, firstChild nodeValue patching); port to the F# UI layer as declarative render-from-state, not as a line-by-line translation.
- Counting rules matter: hidden-and-locked defs are excluded from render and maps; `unethical` defs render but are excluded from completion and star counters; `fullyHidden` badges are excluded entirely.
- Relies on TabManager helpers (`getMeta`, `filterMetadata`, `loadMetadata`) — port those generically once for both this and prestige.
