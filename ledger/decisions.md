# Decisions log (ADR-lite)

Every deliberate divergence from orig, every convention that constrains future units,
every "we chose X over Y" — recorded here, newest at the bottom. Referenced by id
(`D001`) from ledger entries and code comments.

---

## D001 — Orig is immutable; determinism via harness injection, not a fork (2026-09-27)

`orig_project/kittensgame` is never modified. We will NOT create an `orig-deterministic/`
fork with `runtime.clock`/`runtime.random` facettes injected. Instead the oracle harness
monkey-patches `Math.random`, `Date`, and `localStorage` at runtime in Node.

**Why:** a fork doubles maintenance and drifts from the snapshot; injection has already
been proven feasible by orig's own jest bootloader (`test/setup.js`); census
(`analysis/nondeterminism.json`) shows ~23 `Math.random` + ~42 `Date` call sites in game
code, all reachable by global patching.

**Revisit if:** a call site is found that global patching cannot intercept (e.g. captured
before patch time in a closure).

## D002 — Work unit is a symbol-sized slice, files are orientation (2026-09-27)

Ledger ids are `<area>-NN` tied to symbols; line ranges in `analysis/files.json` are for
orientation and will drift. Units carry a `layer` (`core|shell|data|infra`); core units
are oracle-diffable, shells are verified by build + browser smoke, never claimed
"oracle-verified".

## D003 — Conversion patterns adopted from the first port (2026-09-27)

The 7 rules from `../elmishKittens/PORT_PLAN.md` are adopted (PLAN.md §6), plus numeric
discipline: preserve JS float operation order exactly; `Math.floor`→`floor`, `|0`→`int`;
no algebraic simplification while porting. Any reorder = a decision entry here first.

## D004 — Port coverage excludes orig's lib/, test/, tools/ (2026-09-27)

- `lib/` (babel helpers, react/jquery bundles) — browser/runtime plumbing, replaced by
  Fable/Feliz.
- `test/` — orig's own tests; not ported. BUT `test/declare.js` + `test/setup.js`
  approach is *reused by our oracle harness* (oracle-01) and `test/res/save.js` becomes
  a save-load fixture.
- `tools/mock-kgnet` — not ported; KGNet gets stubbed in the harness.

## D005 — Fresh code in `kittens_land/`; specs re-derived, not copied (2026-09-27)

No code is copied from `../elmishKittens/src/`. The old project remains as reference and
its `specs/*.fs.md` as *candidate* data, promoted into `analysis/specs/` only after
mechanical verification against orig (verify-01). Project name: `kittens_land`.

## D006 — Scenario & snapshot formats (2026-09-27)

Scenario: text, `#` comments, lines `<tick> <action>`, action vocabulary fixed in
oracle-02's contract (gather/buy/craft/assign/research/upgrade/hunt/praise/save/load/assert).
This matches the existing `../strategies/temple-baseline.txt` trace format (3549 moves,
ends "626976 buy temple"), which will be adapted as a long-run scenario once the
vocabulary mapping is pinned.

Snapshot: JSON per checkpoint tick — resources (amount/max/perTick), buildings
(count/on/unlocked/unlockable), jobs, techs/upgrades/crafts state, calendar
(year/day/season/weather), log event count, RNG draw count. Floats bit-exact.

## D007 — Single-page app; tabs are internal state (2026-09-27)

Elmish.Land hash routing is kept for the root page only; the 12 game tabs are internal
`Msg`-driven state (orig behavior), not routes. All 12 tabs live in one page module set
under `kittens_land/src/Pages/` + `Game/`.

## D008 — Toolchain pins (2026-09-27)

.NET SDK `11.0.100-rc.1.26425.128` (rollForward latestPatch, allowPrerelease — fixed
`global.json` inside kittens_land, matching repo root), fable `5.17.0`
(`.config/dotnet-tools.json`), Elmish.Land `2.0.0`, React 19 / vite 8 (template defaults).
These are the versions proven by the first port; do not bump mid-migration.

## D009 — Recon reports are per-file; inventory.md is a generated index (2026-09-28)

Semantic file descriptions live in `analysis/recon/<stem>.md` (one file per recon unit,
with Description / Functionality / Proposed work units / Dependencies / State &
determinism / Port notes sections). `analysis/inventory.md` is a generated index
(`node tools/gen-inventory.js`) linking them; statuses stay in the ledger. This replaces
the original plan of one monolithic `inventory.md` — per-file reports avoid merge
conflicts between recon sessions and keep reports reviewable in isolation.

## D010 — Oracle scenario semantics & snapshot v1 pinned (2026-09-28)

- Moves at tick T execute BEFORE tick T's `game.tick()`; snapshot at tick T is taken
  AFTER that tick; tick 0 = fresh state + tick-0 moves, snapshotted first.
- Snapshot fields (bit-exact floats via JSON): per-resource `v`/`m`(axValue)/`u`(nlocked)/`p`(erTickCached);
  per-building `val/on/unlocked/unlockable/stage`; per-job `value/unlocked`; crafts
  `unlocked/value`; sorted techs/upgrades/policies name lists; calendar
  year/day/season/weather/cycle/cycleYear; kitten count+free; `rngDraws` (total PRNG
  calls); effects sample (`catnipPerTickBase`, `catnipDemandRatio`, `maxKittensRatio`,
  `woodPerTick` when numeric).
- Fake clock: fixed base `1759000000000` + tick×1000 ms. PRNG: splitmix32-seeded sfc32.
  Seed convention: scenario header `# seed:` (default 20260927).
- Failed actions are recorded with deterministic reason strings in `actionLog` — never
  silently dropped (a silently-failed action would make a scenario vacuous).
- Scenario vocabulary v1 implemented: gather/buy/craft/assign/research/upgrade/policy/
  hunt/praise/observe/save/load. `unassign` deferred (needs kitten-level targeting).

## D011 — Harness quirks that mirror jest exactly (2026-09-28)

- `dojo.hitch` mock keeps jest's quirky `method.bind(ctx, arguments)` semantics.
- `$I` mock (`"$"+key+"$"`) is installed between i18n and core loads, jest-style.
- jsdom window gets mirrored globals (`classes/com/mixin/dojo/React/$/LZString`) because
  GamePage looks managers up on `window["classes"]["managers"]` — in jest window IS the
  global; in plain Node they must be the same object references.
- GamePage internals note: modern building controller's `build()` returns `undefined`
  on ALL paths — success detection must use state delta (`metadata.val`), see
  `oracle/runner/orig-driver.js` buy case.

## D012 — Harness mirrors the UI render side effect for job unlocks (2026-09-28)

In orig, job modifiers (`scholar → {science: 0.035}` etc.) live in `calculateEffects`
on the job def, populated by `game.upgrade({jobs})` — which in the browser runs as part
of the UI render pass after a building unlocks jobs. Headless (no render), modifiers
stay `{}` and all job production is 0 (see discrepancies OBS-1). The harness therefore
calls `game.upgrade({jobs: …})` after a successful building purchase whose def has
`unlocks.jobs` — orig source untouched; the F# port must instead call job
`calculateEffects` at unlock time directly (recorded in village-04's contract).

## D013 — Numeric traps census (2026-09-28, from recon)

Beyond D003's general float-order rule, recon found these concrete traps every
arithmetic port must respect:

1. **`Math.round` is half-up** (x.5 → away from zero); F# `round` is banker's rounding.
   Port must use a custom `jsRound` (floor(x + 0.5) is NOT equivalent for negatives).
2. **`Math.floor` vs truncation**: JS `x|0` truncates toward zero, `Math.floor` floors.
   Port each with the exact F# counterpart (`floor`, `int`).
3. **Box-Muller in `js/math.js` draws only the cos variate but still consumes both RNG
   draws** (2 draws/call) — draw-order fidelity in hunt loot depends on this.
4. `game.math` distributions (binomial/geometric/irwin-hall) are hand-rolled loops over
   `game.rand` — port loop-for-loop, count draws identically.
5. Dormant bug: core.js `adjustPrice` has an argument-shift bug — deprecated, do not
   port (core-NN notes).
6. `i18n.js` has a `_deffered`/`_deferred` typo silently disabling a re-init guard —
   reproduce the OBSERVED behavior, not the intended one (or record divergence).

## D014 — resop test hook, dump canonicalization, cross-implementation diff (2026-09-28)

1. **`resop` test-hook action** (`addRes`/`addResEvent`/`addResPerTick`): direct resPool
   calls, mirroring how orig's own jest tests manipulate state directly. Used ONLY by
   `unit-*` verification scenarios for modules whose behavior is not yet reachable
   through player actions; golden player scenarios stay player-action-only.
2. **Catalog dump canonicalization**: JS-undefined bool flags dump as `false` (their
   truthy semantics), string optionals as `null`; `hasCustomIsRefundable` marks the one
   function-valued override (antimatter).
3. **Cross-implementation diffing**: `diff-snapshots.js` compares object keys
   order-insensitively (JS vs F# emit different orders), checks only
   scenario+seed in the header, and accepts `--include <subtree>` prefixes so a
   partially-ported core is compared exactly on the subtrees it owns. Fixture files
   are NEVER edited; scope grows as the port grows.
4. **F# runner notes:** `dotnet run` executes with the project dir as cwd — use
   absolute paths for scenario/output. `calendarDay` is threaded into the core until
   calendar-01 owns it (verified: day = 0 after resetState).
