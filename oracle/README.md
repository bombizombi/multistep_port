# oracle/ — the differential testing rig

```
scenario (deterministic script)
        │ same seed, same scenario, same checkpoint ticks
        ├──▶ orig in Node (headless, injected fakes)      → snapshot A
        └──▶ F# core (console runner, .NET)               → snapshot B
                                   │
                          diff-snapshots A vs B  (bit-exact floats)
                                   │
                        identical → PASS   |   diverged → reports/discrepancies.md
```

## Why this is feasible (evidence already in hand)

1. **Orig already runs headless in Node.** `orig_project/kittensgame/test/setup.js`
   (jest bootloader) loads the real game with a portable `dojo.declare`
   (`test/declare.js`), mocked dojo namespace, React/jQuery from `lib/`, and fake
   globals. `test/game.test.js` then constructs `new com.nuclearunicorn.game.ui.GamePage()`,
   calls `game.setUI(...)`, `game.resetState()`, drives buying through controllers
   (`classes.ui.btn.BuildingBtnModernController`). Our orig-side runner reuses exactly
   this approach.
2. **The tick is explicit.** `game.js` registers `setInterval(dojo.hitch(this, this.tick), 1000 / ticksPerSecond)`
   (also a Web-Worker variant). Headless, we never start the timer — we call
   `game.tick()` ourselves once per scenario tick. Logical time, no wall clock.
3. **Nondeterminism is small and patchable.** Census (`analysis/nondeterminism.json`):
   23 `Math.random` + 42 `Date` hits in game code, plus localStorage saves, plus KGNet
   (orig ships `tools/mock-kgnet` proving the network surface is mockable). All
   interceptable by global injection in the harness — orig stays pristine (D001).

## Harness plan (oracle-01)

- `oracle/runner/orig-driver.js` — Node script:
  - globals: `React`, `$`, mocked `dojo` namespace (per `test/setup.js`), `LCstorage`
    (in-memory), seeded `Math.random` (xoshiro128** or sfc32 — pick one, record in
    D006), `Date` fixed clock that advances +1000 ms per `tick()` call, KGNet stub.
  - loads orig managers the same way jest does, `resetState()`.
  - reads a scenario, executes actions at their ticks (through the same UI controllers
    jest tests use — no private-state poking), calls `game.tick()` otherwise.
  - at checkpoint ticks writes a snapshot (below) to `oracle/recordings/<run>/`.
- `oracle/runner/fs-runner/` — F# console host executing the same scenario against the
  port's core, emitting the same snapshot shape (oracle-04).
- `tools/diff-snapshots.js` — exact JSON diff; first divergence printed with tick,
  JSON pointer, both values, and the last 3 matching pointers (localization aid).

## Scenario format (oracle-02 pins it exactly)

```
# name: fresh-100-ticks        # comment lines start with #
# seed: 20260927
# checkpoints: 0, 10, 50, 100
0   gather
70  buy field
104 gather
150 buy hut
337 craft wood 10
642 assign woodcutter 1
```

Vocabulary (expanded only via a decision entry): `gather | buy <bld>[.stage] |
craft <res> [n] | assign <job> <n> | unassign <job> <n> | research <tech> |
upgrade <name> | hunt | praise | observe | save | load | assert <pointer> <value>`.
`../strategies/temple-baseline.txt` (3549 moves → temple at tick 626,976, produced by
the first port's sim) is the seed corpus — adapt after the vocabulary mapping is proven.

## Snapshot format (oracle-03 pins it exactly)

JSON, one object per checkpoint tick:

```json
{
  "scenario": "fresh-100-ticks", "seed": 20260927,
  "tick": 50,
  "rngDraws": 3,
  "calendar": { "year": 0, "day": 250, "season": "spring", "weather": "warm" },
  "resources": { "catnip": { "amount": 123.456, "max": 1000, "perTick": 0.987 } },
  "buildings": { "field": { "count": 3, "on": 3, "unlocked": true, "unlockable": true } },
  "jobs": { "woodcutter": 1 }, "jobUnlocks": ["farmer", "woodcutter"],
  "techs": ["agriculture"], "upgrades": [], "crafts": { "wood": { "unlocked": true } },
  "log": { "count": 4, "last": ["Kittens are meowing"] },
  "effectsSample": { "catnipPerTickBase": 0.987 }
}
```

Rules: floats printed with full double precision (`%.17g` / `String(Math.fround)`-safe);
`rngDraws` = total PRNG calls so far (catches draw-order drift immediately);
`effectsSample` = a fixed list of ~20 interesting computed effects, same list both sides.

## Pass/fail discipline

- Orig must be deterministic *against itself* first (same scenario twice → identical
  snapshots) before any port comparison happens. If that fails, the harness is broken.
- A port-side mismatch is **not** fixed by editing the fixture. Fix the port, or record
  a deliberate divergence in `ledger/decisions.md` + `reports/discrepancies.md` (resolved).
- Checkpoint early and often during initial bring-up (every 10–50 ticks) so the first
  divergence localizes fast; widen once stable.
