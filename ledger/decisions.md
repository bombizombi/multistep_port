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
