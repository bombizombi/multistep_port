# Solver approach — replacing theta-guessing with graph search

**Status:** design. The old `Solver.fs` stays as the reference implementation
of "play the game forward"; this document is what replaces it.

---

## 1. Why the old solver failed

`Solver.fs` searched over a 13-dimensional hand-guessed policy `θ`
(job ratios, craft thresholds, build triggers) with coordinate descent. It
never produced a Temple, in 600,000 ticks (150 game-years):

```
libraries=29  sciMax=7500  sci=7500 (pinned at cap)  goldOre=true  smelters=10  gold=0.0
```

Four independent causes, all of them *missing knowledge*, not bad tuning:

| Cause | Evidence | Fix now available |
|---|---|---|
| Manuscript chain dead in code | `Solver.fs:282` computes `sC2` and drops it — compiler flagged it (`FS0020`) | Rule: never discard a craft result |
| Never knew an **academy** exists | 29 libraries, 0 academies — academies give **+500** scienceMax vs **+250** | `catalog/GRAPH.md` lists every building |
| Never knew **gold needs Iron Will + goldOre** | `gold=0.0` after 150 years | `Game.Village.fs:62` |
| Never knew **storage caps** | gold caps at **10**, minerals at **250** | `Game.Catalog.BaseEffects.fs:13-19` |
| 2 of 13 search dims were no-ops | `CraftManuscriptAt`, `BuildMineAt` only touched by `jitterTheta` | — |
| L1 was computationally hopeless | 466 ticks/s → one fitness eval ≈ 10.7 min → one L1 pass ≈ 7.2 h | see §5 |

The lesson generalises: **the search was never the weak part. The model was.**

---

## 2. What we now have

| Artifact | What it gives us |
|---|---|
| `catalog/graph.json` | 571 nodes, 1446 edges: every resource, building, tech, upgrade, craft, policy, job, and the relations between them |
| `catalog/GRAPH.md` | the same, readable — costs with ratios, unlock gates, per-tick effects |
| `catalog/RULES.md` | exact population/job/production formulas with `file:line` citations |
| `catalog/DEPS.mmd` | the Temple's prerequisite subgraph |
| `oracle/` | the verification rig — any plan can be proven against the original game |

The port's catalog was diffed against the original: **60/60 resources and 9/9
jobs identical**. The graph is the real game's graph.

### What the graph does *not* tell us

The closure answers *"what must exist"*, not *"what is fastest"*. The Temple
closure is 89 nodes and includes the whole ziggurat route (blueprint →
compedium → microchip → antimatter) purely because it is *a* valid path. A
human would never build a ziggurat to get a Temple. **Choosing among valid
branches is the solver's job** — that is exactly what separates it from a table.

---

## 3. Model a plan as a graph path, not a parameter vector

A plan is a sequence of decisions. Because resource accumulation between
purchases is deterministic, the only useful moves are *buy / research /
craft / assign / hunt / wait*. That collapses time: a node is a **decision
state**, an edge is **(wait until affordable → execute)**, cost = elapsed ticks.

```
node   = (stock, buildings, techs, jobs, upgrades, …)
action = the frontier of the graph: every node that is
         (a) unlocked  ∧  (b) affordable  ∧  (c) on a path to the goal
edge   = wait → execute
```

The action set is **derived from the graph**, not hand-listed. That is the
single biggest change: the old solver had `candidateActions` hardcoded to nine
building names and four crafts (`Solver.fs:387-404`).

---

## 4. Proposed algorithm

### Level 0 — feasibility (replaces "guess θ and hope")

1. Compute the goal closure from `graph.json` → the legal action set.
2. Topologically layer it (`layers()` in `build-graph.cjs`) → a **build-order
   skeleton** where layer *n* depends only on layers `< n`.
3. That skeleton alone is already a valid human strategy (it is the recipe).

### Level 1 — best-first search over the frontier

**Ranking function:** lower bound on remaining ticks, computed from the graph.

For each unmet ingredient, estimate time-to-afford from current production:
`t ≈ deficit / perTickRate`, where the rate comes from `RULES.md` §7 applied to
the current building set. The bound is the max over the four temple inputs and
the science cap — a *max*, not a sum, because the trains run in parallel.

**Why this beats the old policy:** the old fitness was "run 60,000 ticks and
see". The new one is arithmetic on the current state, ~free, so the search can
be deep. Validate it against full rollouts: whenever the bound and a full
rollout disagree by more than X, log it — a systematically wrong bound is
itself a bug signal.

**Pruning:**
- **Storage feasibility**: never let the search plan a craft whose output exceeds
  the current cap (this alone invalidates a lot of naive plans).
- **Catnip feasibility**: reject any edge that makes
  `1.0·farmers + 0.125·fields < 0.85 × kittens`.
- **Dedup**: hash on (building counts bucketed to 3 significant digits, techs,
  jobs, resource levels bucketed). Waiting an extra tick makes states
  equivalent — without dedup this never terminates.

### Level 2 — stochastic refinement

Hunting is the only stochastic ingredient and it gates gold. Handle it in two
passes:
1. Search with **expected values** (closed-form: `E[IH(n)] = n/2`, so
   `E[furs] = 18.125/hunter/hunt`, `E[gold] = 0.3125/hunter/hunt`).
2. Re-run the winning plan over **N seeds** and keep the best. Report the
   distribution, not just the mean — the honest answer to "how fast is this".

### Level 3 — verification (non-negotiable)

Every plan is emitted as a `.cat` and run through **both** oracle drivers.
`IDENTICAL` or it is not a result. This is the discipline the whole project is
built on and the solver gets no exemption from it.

---

## 5. Performance is a first-class problem

The current tick runs at **466 ticks/s** (measured: 30,000 ticks in 64 s),
because it threads an immutable record through every pool.

| Use | Requirement | Approach |
|---|---|---|
| Search (millions of evaluations) | ≥ 10⁵ ticks/s | **Analytic model** from `RULES.md` — closed-form rates, no RNG, no allocation. Verify it against the real tick on N sampled states. |
| Plan verification | exact | existing `fs-runner` / `KittensState.tick` at 466 ticks/s |
| Reporting | — | emit `.cat`, diff against orig |

Do **not** build the analytic model and trust it: assert
`|analytic − exact| < 1e-9` per resource over sampled states, and fail loudly.
A fast wrong model is worse than a slow right one.

---

## 6. What to keep from the old solver

- `emitCat` (`.cat` writer) — correct and re-verified against the drivers.
- `initSeeded` / the seeded RNG plumbing — already bit-exact with orig.
- The `temple` / `probe` / `debug` diagnostic modes — they are how the gold bug
  was found; keep them, they are cheap and they are honest about stalling.
- The oracle round-trip as the definition of correct.

## What to delete

- `Theta`, `defaultTheta`, `jitterTheta`, `level1`, `fitness` — the search space
  they encode is already expressed in `graph.json`, better and verifiably.
- The dead `sC2` branch, the `traceIt` debug print, the unused `changed()`.

---

## 7. Open questions worth deciding before coding

1. **Gold route.** Iron Will is on by default and huts switch it off. Is the
   best plan "farm gold first, then build housing", or "build housing, then
   re-enable Iron Will for the final push"? The search should answer this
   rather than us guessing — but it needs the toggle modelled as an action.
2. **Compendium timing.** `scienceMax = min(compedium × 10, Σ scienceMax)`
   means compendia only help *after* you already have the building cap. Worth a
   dedicated experiment rather than an assumption.
3. **Skill investment.** Job output scales with skill XP in steps up to
   ×1.1875 (`RULES.md` §6.4). Whether long play beats short play depends on
   whether kitten XP keeps paying after the Temple — probably a phase-2 goal.
4. **Is the Temple even the right goal?** It is the one the old solver aimed
   at, but `philosophy` itself may be the more interesting landmark.