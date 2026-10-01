# Plan — a solver for "fastest path to a Temple" (2026-10-01)

## The target, grounded in orig data

From `oracle/fixtures/defs-orig.json` (the real orig objects):

```
Temple  = { gold 50, slab 25, plate 15, manuscript 10 }, unlocked by tech philosophy
philosophy = { science 9500 }
slab        = craft(minerals 250)
plate       = craft(iron 125)
manuscript  = craft(culture 400, parchment 25)
iron        = needs mining tech + mineral production
gold        = hunting drops: binominal(squads, 0.25) x irwinHall — 25% of squad
             容量 per hunt wave, ~5-40 gold per hunt early
parchment   = craft(furs 50)  (furs from hunting)
culture     = amphitheatre base production
```

So the critical path is roughly:
`catnip → kittens → (woodcutters | farmers) → science → mining/philosophy chain`
with four parallel resource pushes (gold via hunters, slabs via miners+geologists,
plates via miners+metal techs, manuscripts via furs+culture), plus the tech tree
that unlocks the crafters and hunting.

This is a **resource-constrained scheduling problem with exponential growth**:
continuous state (resource stockpiles), discrete decisions (what to buy/assign/
craft when), and unlock events that change the production rates.

## Why this is unusually tractable *for us*

1. **We own a byte-exact, deterministic forward simulator.** The oracle already
   runs the full game headless and diffable. A solver doesn't need to guess how
   the game works — it can *execute the verified model* millions of times.
2. **The F# library compiles for plain .NET.** The same `Game.*` sources that
   the browser (Fable) and the oracle use can be referenced by a plain console
   host: no DOM, no snapshots, just `tick` + actions at millions of ticks/sec.
3. **The output is re-verifiable.** A solver's plan can be emitted as a `.cat`
   scenario and run through both oracle drivers. Solver proposes, oracle
   disposes — every "fastest path" claim is checkable against orig itself.

## Design

### Solver host (new project `solver/`, net11, references the Game sources)

- A pure, seeded port of the oracle RNG (splitmix32 → sfc32, ~30 lines of F#)
  so hunts/rolls are reproducible across runs.
- `step`: one game tick = the same pipeline the browser uses (production,
  village sim, engineer crafts, calendar), minus console/toasts.
- `act`: the same verified actions (build, assign, research, craft, hunt,
  praise, trade). Actions are only issued at tick boundaries — orig's UI does
  the same.
- Cost function: `ticks` until `temple.Val ≥ 1` (or infinity/timeout 5 game years).

### Level 0 — dependency extractor (one-shot script, do first)

Compute the *actual* prerequisite DAG of the temple from the fixture: walk
unlock edges (tech philosophy → temple; compedium → architecture), craft
ingredients (slab←minerals, plate←iron, manuscript←furs+culture+parchment),
and production sources (gold←hunts; iron←miners; parchment←furs). This gives
the critical-path lower bound and the action vocabulary the solver needs —
no hand-waving about what "matters". (Skipped subtleties like gold from
festival luck are flagged, not guessed.)

### Level 1 — parametric greedy policy + local search (the workhorse)

A fixed **policy** encodes human strategy as threshold rules:
`build hut when kittens = maxKittens`, `keep woodcutter:farmer ratio r`,
`craft slab when minerals ≥ 250 × batch`, `hunt when manpower full`,
`research next in fixed order`, etc. The policy has ~15–25 parameters θ.

- **Fitness(θ) = game-ticks until temple**, evaluated by running the simulator.
- Search: coordinate descent, then (25+1)-ES / CMA-ES over θ.
- Cost: one 2000-tick sim ≈ a few ms; 10k evaluations ≈ minutes. This lands
  within a few percent of human-optimized orders almost immediately and gives
  a strong baseline for everything else.

### Level 2 — event-driven A*/beam search over decision points

The key observation: between purchases, the only optimal "move" is **wait** —
resources accumulate deterministically (hunts are the exception; see §RNG).
So collapse time: a search node is a *decision state* (buildings, techs, jobs,
resource levels); edges are `(wait until affordable → execute action)` with
cost = elapsed ticks.

- **A\*** with an admissible heuristic: remaining critical-path length computed
  from the level-0 DAG (min ticks to produce each missing ingredient given
  current production, ignoring competition between them).
- Or **beam search** (width ~500–2000) with the greedy rollout value as the
  ranking function — robust, no admissibility proof needed, and empirically
  very strong for idle games.
- State dedup: hash on (building counts, techs, job counts, resource buckets)
  where resource values are bucketed to 3 significant digits — waiting an extra
  tick makes two states equivalent, so dedup is essential for termination.

### Level 3 — RNG-aware refinement (only if we chase the last few %)

Hunts and kitten births draw RNG. Two options:
- **Seed sweep**: for the best plan found, re-plan with the solver's own RNG
  and take the best-of-N seeds (the browser uses real randomness anyway).
- **Expectation planning**: plan against E[loot] (the binominal/irwinHall
  means are closed-form) and accept variance. Recommended: expectation
  planning is simpler and the variance at 50-gold scale is small.

Deliberately out of scope for v1: MILP lower bounds (nice for proving
optimality, painful with exponential growth) and policy-space genetic
programming (overkill).

## Deliverables

1. `tools/temple-chain.js` — level-0 DAG extractor (fixture → printed chain).
2. `solver/` — console host: seeded RNG, pure tick, policy evaluator, search
   (level 1 first; level 2 behind a flag).
3. `oracle/scenarios/temple-solver.cat` — the winning plan emitted as a
   scenario; **must run IDENTICAL through both oracle drivers** (the same
   bar everything else here is held to).
4. Report: ticks-to-temple for baseline human order vs. solver optimum, and
   the θ/plan that achieves it.

## Risks / notes

- The solver host duplicates the tick glue that currently lives in the browser
  page (KittensState). Acceptable for the solver (it needs a stripped, pure
  version anyway); long-term the glue should move into the library so browser,
  oracle and solver share one tick.
- Kitten births use seeded RNG in the solver vs real randomness in the browser;
  plans are robust to this because births are near-deterministic at fixed
  housing (the variance is in hunt loot, handled above).
- The 5-year timeout must be generous — early runs WILL time out before the
  search finds philosophy timing.
