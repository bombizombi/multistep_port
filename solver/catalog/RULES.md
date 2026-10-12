# Village simulation — exact rules

Extracted from the port sources by a read-only recon pass; every rule cites `file:line`.
**PORT** = `multistep_port/kittens_land/src/...`, **ORIG** = `orig_project/kittensgame/...`.
This file is the ground truth the solver's model must match. Where it disagrees with
the solver, the solver is wrong.

---

# VILLAGE SIMULATION — EXACT SPECIFICATION

All line refs are `file:line`. **PORT** = `multistep_port/kittens_land/src/...`; **ORIG** = `orig_project/kittensgame/...`. Where a behaviour is a faithful quirk of the original JS, the ORIG line is given alongside.

Notation: `eff(n)` = `Game.Effects.getEffect cache n` (0 when the key is absent, `Game.Effects.fs:19-22`). All floating point is IEEE double. `jsRound(x) = floor(x + 0.5)` (`Game.Math.fs:23`).

---

## 1. Population / housing — MaxKittens

### 1.1 The raw housing effect

`maxKittens` is **not** a hardcoded table; it is the sum of the `maxKittens` effect contributions of every manager, assembled by `Game.Effects.updateCaches` (`Game.Effects.fs:78-95`) and read via `Game.Effects.getEffect cache "maxKittens"`.

**Base value: there is none.** `"maxKittens"` does not appear in `Game.Catalog.BaseEffects.bldBase` (`Game.Catalog.BaseEffects.fs:11-27`), so at fresh state `eff("maxKittens") = 0` and **MaxKittens = 0** — a new game has no housing and cannot spawn a kitten. ORIG agrees: `village.maxKittens: 0` (`village.js:5`).

### 1.2 Housing buildings

| Building | `maxKittens` per unit | PORT def | ORIG def | Scales with |
|---|---|---|---|---|
| hut | **2** | `Game.Catalog.Defs.fs:55` | `buildings.js:502` | `on` |
| logHouse | **1** | `Game.Catalog.Defs.fs:64` | `buildings.js:520` | `on` |
| mansion | **1** | `Game.Catalog.Defs.fs:73` | `buildings.js:543` | `on` |

`maxKittens` does **not** end in `"Max"` and the building is not `library`, so `Game.Buildings.providerEffect` (`Game.Buildings.fs:255-262`) returns `effectValue * float b.On` — i.e. **ON count, not VAL count**. (The `manpowerMax` sibling in the same tables *does* end in `Max` and scales with VAL; the housing term does not.) ORIG: `buildings.js:169-174`, same branch.

Note `almostLimited: false` on all three (`buildings.js:505,529,552`; PORT has no such field) — **there is no soft/limited housing cap**.

### 1.3 Non-building housing sources

Summing into the same `maxKittens` key (`Game.Effects.fs:85-95` sums every group):
- Liberty policy: `+1` unless ironWill (`Game.Managers.fs:45`; ORIG `science.js:872-874`) — via `calculateEffects`, PORT represents it as `maxKittens: 0` + the dynamic override at `Game.Managers.fs:45`.
- spaceStation (Cath): `+2` (`Game.Catalog.World.fs:192` / `:315` in the calculated table; ORIG `space.js:308-316`).
- terraformingStation (Yarn): `+1 + eff("terraformingMaxKittensRatio")` (`Game.Catalog.World.fs:206`; ORIG `space.js:751-756`).
- cryochambers VSU: `+1` (`Game.Catalog.World.fs:360`; ORIG `time.js:543-545`).
- `hutFakeBought` / `logHouseFakeBought` / `mansionFakeBought` (`buildings.js:2404-2406`) affect **prices only**, never housing.

### 1.4 The two-stage cap (and a real port/orig divergence)

ORIG has two distinct values:
1. `village.maxKittens = Math.floor(this.getEffect("maxKittens"))` — set in `updateModel` (`game.js:4514`).
2. `village.sim.maxKittens = village.calculateSimMaxKittens()` — the value births are gated on (`village.js:425`), computed at `village.js:394-405`:

```
if eff("maxKittensRatio") == 0:   simMax = villageMax                      # village.js:396-397
else:                             simMax = jsRound( villageMax * (1 + getLimitedDR(eff("maxKittensRatio"), 1)) )   # village.js:399
```

`maxKittensRatio = -0.01` comes only from holyGenocide (`religion.js:1441`; PORT `Game.Catalog.World.fs:139`). `getLimitedDR(x,1)` is the hyperbolic DR at `Game.Math.fs:31-40`.

**The PORT collapses these into one number.** `Game.Managers.calculateMaxKittens` (`Game.Managers.fs:591-593`):

```fsharp
let calculateMaxKittens (cache) (pool) : int =
    let maxKittens = Game.Effects.getEffect cache "maxKittens"
    int (floor maxKittens)
```

and the runner writes that single value into `Vpool.MaxKittens` (`Program.fs:1803-1804`), which is then used for *both* the birth gate and the happiness overpopulation term. **Consequence: the `maxKittensRatio` / holyGenocide housing reduction is NOT modelled in the port.** With `maxKittensRatio == 0` (every non-HG game) the two are identical. Flagging as a genuine divergence, not a seam.

### 1.5 Where the cap is enforced

The housing cap gates births only, at `Game.Managers.simUpdate` (`Game.Managers.fs:726`):

```fsharp
if pool.Kittens.Length < maxKittens then
    pool <- { pool with NextKittenProgress = pool.NextKittenProgress + float times * kittensPerTick }
    if pool.NextKittenProgress >= 1.0 then
        let kittensToAdd = floor pool.NextKittenProgress |> int
        pool <- { pool with NextKittenProgress = pool.NextKittenProgress - float kittensToAdd }
        for _ in 1..kittensToAdd do
            if pool.Kittens.Length < maxKittens then
                pool <- addKitten rand pool
        if pool.Kittens.Length >= maxKittens then
            pool <- { pool with NextKittenProgress = 0.0 }
```
(`Game.Managers.fs:724-738`; ORIG `village.js:3234-3251`.)

Two enforcement points: the outer `if` (no progress accrual at all when full) and the inner per-kitten `if` (partial batch). The trailing reset **zeroes the fractional progress** when the cap is reached — so leftover progress is destroyed, not banked.

**The cap is NEVER enforced downwards.** Population is never culled to the cap; `clearJobs` / culling on HG upgrade is explicitly commented as a TODO in ORIG (`village.js:427-428`). Overpopulation is real and permanent, and is punished only through happiness (§8).

The `kittens` pseudo-resource mirrors the cap for UI only: `Value = Kittens.Length`, `MaxValue = float MaxKittens` (`Program.fs:1858-1859`; ORIG `game.js:4537-4538`). It is a display mirror — `kittens` has `CalculatePerTick = false` (`Game.Catalog.Resources.fs:30`, ORIG `resources.js:152-155` transient) and is **skipped entirely by the per-tick accrual loop**, so it never feeds back.

---

## 2. Birth

### 2.1 The birth rate

There is **no RNG draw and no probability in the birth rule.** Births are a deterministic fractional accumulator. The "interval" is emergent: at base rate 0.01/tick, one kitten per **100 ticks (20 s)**.

`kittensPerTick` (`Program.fs:1805-1811`; ORIG `village.js:406-419`):

```
kittensPerTick = 0.01 * (1 + eff("kittenGrowthRatio"))                        # kittensPerTickBase = 0.01
if arr1 = pollutionEffects["pollutionArrivalSlowdown"] + eff("arrivalSlowdown") > 1:
    kittensPerTick = kittensPerTick / arr1
if calendar.festivalDays > 0:
    kittensPerTick = kittensPerTick * (2 + eff("festivalArrivalRatio"))
```

- `kittensPerTickBase = 0.01` — ORIG `village.js:7`. PORT hardcodes the literal `0.01` at `Program.fs:1805` (and `KittensState.fs:954`); there is no named constant in F#.
- `kittenGrowthRatio`: perk **willenfluff `+0.75`** (`Game.Catalog.World.fs:241`; ORIG `workshop.js`) and perk **pawgan `+1.5`** (`Game.Catalog.World.fs:242`). Both are prestige perks; 0 in a normal run.
- `pollutionArrivalSlowdown` levels (ORIG `buildings.js:2408-2412`, PORT `Program.fs:340-370`): level ≥ 4 → `log10(pollution)*1.2` (L4) / `*1.11` (L3); level 2 → `1 + 1.68e-8*(pollution - base*100/2)`; levels 0-1 → `0`.
- `arrivalSlowdown = 10` when postApocalypse is active (`Game.Challenges.fs:203`; ORIG `challenges.js:469`).
- `festivalArrivalRatio = 0.001` from the brewery (`Game.Catalog.Defs.fs:277`, ORIG `buildings.js` brewery effects); `+0.3` from policy carnivale (`Game.Catalog.Policies.fs:57`).

**Ordering note (port/orig divergence, harmless):** ORIG applies festival *then* pollution division (`village.js:411-418`); the port applies pollution division *then* festival (`Program.fs:1807-1811`). Multiplication/division are commutative on exact doubles, so results are bit-identical except in the last ULP. The port matches the ORIG source order in `KittensState.fs:954-956` (festival only, no pollution term — that path drops the pollution tail entirely; it is the browser build, not the oracle).

### 2.2 Conditions that must hold

1. `Kittens.Length < maxKittens` — else **no progress accrues at all** (`Game.Managers.fs:726`).
2. Births must be running at a non-zero rate. On a starving tick the runner passes `growthRate = 0.0` (`Program.fs:1837`), so `NextKittenProgress` is unchanged but the loop still executes (and `simUpdate(0)` still runs the skill half in ORIG — `village.js:456`). With `kittensPerTick = 0`, `progress >= 1.0` is false, so nothing happens.

### 2.3 The accumulator

```
NextKittenProgress += times * kittensPerTick
if NextKittenProgress >= 1.0:
    kittensToAdd = floor(NextKittenProgress)
    NextKittenProgress -= kittensToAdd
    repeat kittensToAdd times: if Kittens.Length < maxKittens: addKitten()
    if Kittens.Length >= maxKittens: NextKittenProgress = 0.0
```
(`Game.Managers.fs:726-735`; ORIG `village.js:3234-3251`.) `times = 1` for a normal tick (`Program.fs:1839`), `times = daysOffset * ticksPerDay` for fastforward (`Program.fs:1639`). `ticksPerDay = 10` (`Game.Calendar.fs:33`).

### 2.4 Where the RNG draw happens

**Exactly one global RNG draw per newborn**, at `Game.Managers.generateKittenSeed` (`Game.Managers.fs:599-600`):

```fsharp
let generateKittenSeed (rand: unit -> float) : int =
    uniformRandomInteger rand 0.0 1000000.0 |> int
```

`uniformRandomInteger` (`Game.Math.fs:46-49`) = `jsRound(min) + floor(rand() * (jsRound(max) - jsRound(min)))` — **one** `Math.random()` draw. So the seed is uniform in `[0, 999999]`. ORIG: `generateKittenSeed` at `village.js:3448`.

All identity attributes (name, surname, trait, age, colour, variety, rarity) are then rolled on a **private per-kitten Lehmer LCG** seeded from that one value — `kittenLcg` (`Game.Managers.fs:603-608`, multiplier 16807, mod 2147483647) driving `generateIdentity` (`Game.Managers.fs:615-632`). **These LCG draws do not touch the global stream.** Order: name, surname, trait, `age = 5 + rand(10)` with `rand(100) < 30` → `age += rand(30)`, then `rand(100) <= 10` → colour `rand(6)+1` with `rand(100) <= 10` → variety `rand(4)+1`, then `rand(100) <= 5` → rarity `rand(2)+1` with `rand(100) <= 10` → `+1`. ORIG `village.js:1494-1517`.

So: **birth consumes exactly 1 global draw, and only when a kitten is actually born.**

---

## 3. Death

### 3.0 (a) Natural death from old age — DOES NOT EXIST

**There is no age-based or probabilistic death in this game.** Age (`Kitten.Age`, `Game.Managers.fs:568`, generated at `Game.Managers.fs:619-621`) is written once at birth, never incremented, and read only for the census display (`village.js:5392`). Exhaustive search of ORIG for any second `killKittens` call site returns exactly one (`village.js:443`), and the only `kittens.splice` is inside `killKittens` itself (`village.js:3366`). **Undetermined/nonexistent: there is no other death source.** The only two ways a kitten dies are (b) starvation and (b') freezing — both routed through the single code path below.

### 3.1 (b) Starvation death

All of it lives in `Game.Managers.starvationStep` (`Game.Managers.fs:779-804`); ORIG `village.js:430-462`. Called from `Program.fs:1830` with `ticksPerSecond = 5.0` (`game.js:2289`).

```
if Kittens.Length = 0: return pool unchanged                              # L787-788, L804
resDiff = catnipValue + catnipPerTick                                       # L789
starving = resDiff < 0 || (winterIsComingActive && kittens > maxKittens)     # L790
if not starving: return pool unchanged (deathTimeout untouched)            # L802-803
starved = int(abs(jsRound(resDiff)))                                        # L792
if starved > 1: starved = 1                                                # L793
if starved > 0 && DeathTimeout <= 0:                                       # L794
    pool' = killKittens(starved, pool)                                     # L795
    DeathTimeout = int(ticksPerSecond * 5.0) = 25                          # L796
else:
    DeathTimeout = DeathTimeout - 1                                        # L801
```

Key points:
- **No RNG draw whatsoever.** Starvation is fully deterministic given the state. Every death in the game is deterministic.
- `catnipValue` = the catnip resource's stored value; `catnipPerTick` = its cached per-tick (`Program.fs:1821-1825`, reading `PerTickCached`, **not** `+ getResourcePerTickConvertion` — that seam is 0 in the port).
- `deathTimeout` initial value **0** (`Game.Managers.fs:585`, ORIG `village.js:217`).
- Cooldown = `ticksPerSecond * 5` = **25 ticks = 5 seconds** (`Program.fs:1830` passes `5.0`; ORIG `game.js:2289` × `village.js:451`).
- **The decrement runs on every starving non-kill tick and can drive `deathTimeout` negative** (`Game.Managers.fs:797-801`). It is *not* clamped and *not* reset on recovery. `starved == 0` (i.e. `resDiff` rounds to 0, only possible on the freeze branch) still decrements. **Non-starving ticks never touch `deathTimeout` at all** — this is the corrected behaviour noted in `reports/sessions/2026-09-28-10.md:13`.
- Max 1 death per kill event regardless of deficit size (the `>1 → 1` clamp, `Game.Managers.fs:793`; ORIG `village.js:438-440`).
- `int(ticksPerSecond * 5.0)` truncates: `5.0*5.0 = 25.0 → 25`.

### 3.2 (b′) Freezing death (winterIsComing challenge)

Same function, same code path, different trigger. ORIG `village.js:435`:

```
resDiff < 0  ||  (challenges.isActive("winterIsComing") && kittens > sim.maxKittens && calendar.weather == "cold")
```

The PORT folds the weather gate away: `starving = resDiff < 0 || (winterIsComingActive && kittens > maxKittens)` (`Game.Managers.fs:790`), and the runner passes `winterIsComingActive = false` hardcoded (`Program.fs:1830`). **Divergence: the port does not model the freezing branch at all.** Note that when freezing, `resDiff >= 0`, so `starved = |jsRound(resDiff)|` is normally `0` → no death, only the timeout decrement. Deaths by freezing therefore require `|jsRound(resDiff)| >= 1`.

### 3.3 `killKittens`

`Game.Managers.killKittens` (`Game.Managers.fs:753-776`); ORIG `village.js:3358-3393`:

```
amount = min(amount, Kittens.Length)
survivors = take (Length - amount) Kittens          # the LAST n kittens die
for each dead kitten k:
    if k.Job = Some j: JobValues[j] = max(0, JobValues[j] - 1)     # L757-762
    if k.EngineerSpeciality = Some sp: collect sp for the caller   # L763-765
if the leader died: LeaderSeed = None                              # L767-775
```

The list is an append-ordered `Kittens` list, so `List.take` kills the **most recently born** kittens, matching ORIG's `this.kittens.splice(this.kittens.length - amount, amount)` (`village.js:3366`). ORIG routes each death through `village.unassignJob` (`village.js:3374`), which also decrements the dead engineer's `craft.value` via `unassignCraftJobIfEngineer`; the port returns those specialities to the caller instead (`Game.Managers.fs:765, 776`).

ORIG's tail also refreshes `village.updateResourceProduction()` + `game.updateResources()` on the kill tick (`village.js:3389-3391`). The port leaves this to the runner, which does exactly that at `Program.fs:1831-1835` (stats bump + `prodCache` recompute + `refreshCache()`).

### 3.4 Ordering constraint: death strictly precedes birth, within the same tick

`Program.fs:1826-1839`:
1. compute `starving` (`Program.fs:1826-1828`)
2. `starvationStep` → possible death (`Program.fs:1830`)
3. `growthRate = if starving then 0.0 else kittensPerTick` (`Program.fs:1837`)
4. `simUpdate maxKittens growthRate 1` → births (`Program.fs:1839`)

So on a starving tick a kitten can die and **no** kitten is born in the same tick; `NextKittenProgress` is frozen, not reset. On the first non-starving tick after recovery, growth resumes at the **accumulated** progress.

---

## 4. Starvation

### 4.1 The test

```
resDiff = catnip.value + catnip.perTickCached
starving ⟺ resDiff < 0
```
(`Game.Managers.fs:789-790`; ORIG `village.js:432,435`.) There is no threshold, no buffer, no smoothing: strictly negative. `catnip.perTickCached` is the *previous* tick's cached income (`Game.Production.calcResourcePerTick` output, `perTickCached` refreshed at `Program.fs:899-911` / ORIG `game.js:4571`). ORIG passes `getResourcePerTick("catnip", true)` = `perTickCached + getResourcePerTickConvertion` (`village.js:430`, `game.js:4585`); the port omits the conversion term (it is 0 with no smelters/converters, `Game.Production.fs:73-74`).

### 4.2 When it is evaluated

Once per `village.update`, i.e. **once per tick, at 5 ticks/second** (`game.js:2289`), *before* `sim.update` (`village.js:430` precedes `village.js:456`/`461`). The whole test is gated on `Kittens.Length > 0` (`Game.Managers.fs:787-788`) — **an empty village can never be starving**, so progress always accrues once MaxKittens > 0.

### 4.3 What happens on a failed tick

Covered in §3.1. In order:
1. `starved = min(1, |jsRound(resDiff)|)`.
2. If `starved > 0 && deathTimeout <= 0`: kill, set `deathTimeout = 25`, bump `kittensDead` stat (`Program.fs:1832-1833`) and `deadKittens` (`village.js:450`).
3. Else: `deathTimeout -= 1`.
4. **Either way, births are suppressed this tick** (`growthRate = 0`, `Program.fs:1837`).

---

## 5. Job assignment

### 5.1 Free-kitten pool — the port/orig divergence that matters

**ORIG** (`village.js:547-553`) computes the free pool from the **job counters**, not from the kittens:

```
getFreeKittens() = getDiligentKittens() - Σ_jobs job.value
getDiligentKittens() = isActive("anarchy") ? round(kittens * (1 - eff("kittenLaziness"))) : kittens
```
(`village.js:538-545`.) Note it can go **negative**.

**PORT** (`Game.Managers.fs:744-745`) counts actual unassigned kittens:

```fsharp
let getFreeKittens (vpool) : int =
    vpool.Kittens |> List.filter (fun k -> k.Job = None) |> List.length
```

These agree only while `JobValues` is perfectly in sync with the kittens' actual `Job` fields. **They diverge under exactly the quirk in §5.3.** This feeds three call sites: the assign cap (`Game.Managers.fs:927`), the happiness-driven catnip demand term (`Game.Production.fs:219`, via `Program.fs:881`), and the engineer's free-worker count (`Game.Managers.fs:1043-1047`, which *does* use the counter, faithfully).

### 5.2 Per-job limits

`Game.Managers.assignJob` (`Game.Managers.fs:925-934`) takes `jobLimit` as a **caller-supplied parameter**; the port does not implement `getJobLimit` itself. The two call sites hardcode it:

`Program.fs:5969-5976` (oracle runner) and `KittensState.fs:691-693` (app) — identical:

| Job | Limit | Source |
|---|---|---|
| engineer | `bld.get("factory").val` (0 if absent) | ORIG `village.js:329-331` |
| ambassador | **0** (hardcoded — perk not modelled) | ORIG `village.js:332-352` |
| priest | 100000 (atheism→0 not modelled) | ORIG `village.js:353-354` |
| **everything else** | **100000** | ORIG `village.js:355-357` |

Full ORIG ambassador limit (`village.js:332-352`): `0` unless perk `ambassadors` researched; else `unlockedRaces + floor(sumEmbassyLevels / embassiesPerAmbassadorSlot)`, counting leviathans as unlocked iff `energy > 0`.

### 5.3 `assignJob` / `unassignJob` semantics and the counter-desync quirk

```
assignJob(job, amt):
    current = JobValues[job]                                  # Game.Managers.fs:926
    free    = getFreeKittens(pool)                             # L927
    capped  = min(amt, min(free, jobLimit - current))          # L930
    if capped > 0: JobValues[job] = current + capped           # L931-932
    (else: no change at all, incl. negative amt)
simAssignJob(job, amt):                                        # L938-955
    freeIds = [ids of kittens with Job = None], reversed      # L942-947
    repeat amt times: take head of freeIds, set that kitten's Job = job
```
(`Game.Managers.fs:925-955`; ORIG `village.js:360-378` + `village.js:3480-3514`.)

**The counter-desync quirk (OBS-2, faithfully preserved).** Two things happen in sequence with *different* denominators:
- `assignJob` bumps `JobValues[job]` by `capped`, where `capped` was computed from `getFreeKittens`.
- `simAssignJob` then assigns kittens from the **reversed** free list and may assign **fewer** than `capped` if the list runs out — but `JobValues` is **not** rolled back.

In the port the two can disagree because `assignJob` uses the *kitten-count* free pool (`L927`) while ORIG uses the *counter-derived* pool (`village.js:367`). Callers mirror the two-step: `Program.fs:5978-5982`, `KittensState.fs:697-702` — `simAssignJob` runs only `if assigned > before`.

**Assignment order:** `simAssignJob` collects free kitten indices and **reverses** them (`Game.Managers.fs:946`), then `shift()`s from the front — so the **newest-born** free kitten is assigned first (matching ORIG's reverse-push + `shift()` at `village.js:3490-3508`).

**`unassignJob`** (`ORIG village.js:380-393`) decrements `job.value` and calls `sim.unassignCraftJobIfEngineer`. The port implements it only in `KittensState.fs:705-717`: decrement `JobValues` by `amt = min(n, before)`, then release the **last `amt` kittens carrying that job**, newest-first. The oracle runner has **no** unassign command.

**Over-assignment / limit enforcement.** ORIG re-checks limits **every tick** and trims: `village.update` loops all jobs and calls `sim.removeJob(jobName, job.value - limit)` if over (`village.js:463-469`); plus `if (getFreeKittens() < 0) this.clearJobs(true)` (`village.js:471-473`). **`removeJob`/`clearJobs` are NOT implemented in the port** — grep for `removeJob` across `kittens_land/src` returns nothing. So in the port, once a counter is inflated by the quirk above it is never corrected. Since `engineer`'s limit is `factory.val` and `ambassador`'s is 0, an inflated `engineer` counter can exceed `factory.val` permanently.

Also note the ORIG `assignJob` side effects the port only partially mirrors: `if (job.name == "hunter") this.sim.hadKittenHunters = true` (`village.js:374-375`) and the workshop/village tab refreshes — both non-sim.

---

## 6. Job production — all 9 jobs

### 6.1 Where the tables come from

`Game.Catalog.Village.jobDefs` (`Game.Catalog.Village.fs:21-29`) is a **generated snapshot** of ORIG's job `modifiers` / `calculateEffects` output *at fresh state* (see the header comment, `Game.Catalog.Village.fs:1-6`). `getResProduction` prefers `CalculatedModifiers` over `Modifiers` when present (`Game.Managers.fs:986-989`).

### 6.2 The nine modifier maps

| # | Job | `modifiers` (static) | `calculated` | Kind | PORT | ORIG |
|---|---|---|---|---|---|---|
| 1 | woodcutter | `{wood: 0.018}` | — | **static** | `Catalog.Village.fs:21` | `village.js:19-21` |
| 2 | farmer | `{catnip: 1}` | — | **static** | `:22` | `village.js:31-33` |
| 3 | scholar | `{}` | `{science: 0.035}` | **computed** | `:23` | `village.js:41-52` |
| 4 | hunter | `{manpower: 0.06}` | — | **static** | `:24` | `village.js:60-62` |
| 5 | miner | `{minerals: 0.05}` | — | **static** | `:25` | `village.js:71-73` |
| 6 | priest | `{faith: 0.0015}` | `{faith: 0.0015}` | computed, identical here | `:26` | `village.js:82-104` |
| 7 | geologist | `{}` | `{coal: 0.015}` | **computed** | `:27` | `village.js:107-151` |
| 8 | engineer | `{}` | — (none) | static, **empty** | `:28` | `village.js:158-159` |
| 9 | ambassador | 7 keys, see below | same 7 | computed | `:29` | `village.js:166-202` |

`StartsUnlocked`: only **woodcutter** is true (`Catalog.Village.fs:21`; ORIG `village.js:23-24` `unlocked: true, defaultUnlocked: true`). All others start locked.

**What each `calculated` depends on (all evaluated once and snapshotted, NOT live):**
- **scholar** (`village.js:42-52`): base `science: 0.035`; **+ `starchart: 0.0001` if workshop `astrophysicists` researched**. ORIG writes into `self.modifiers`, so it is a full replacement.
- **priest** (`village.js:87-104`): if challenge `atheism` active → `unlocked = false` and **every priest kitten is unassigned** (`village.js:90-96`). No numeric change to the modifier.
- **geologist** (`village.js:108-136`): `coal = 0.015`; `+0.010 coal / +0.0005 gold` if `miningDrill`; `+0.015 coal / +0.0005 gold` if `unobtainiumDrill`; `+0.0075 coal / +0.0008 gold` if `geodesy` — **but if `geodesy` is not researched, `gold` is forced back to 0** (`village.js:122-125`). Result keys: always `coal`, plus `gold` only when `gold > 0`. **Fully upgraded: `coal = 0.0475`, `gold = 0.0018`.**
- **ambassador** (`village.js:175-202`): base keys `tradeVolume 0.0007`, `embassyEffectCap 0.00133`, `tradeBlueprintChance 0.00008`, `tradeSpiceChance 0.00009`, `tradeNormalResChance 0.00003`. The **two consumption keys are recomputed from `self.value`** (the assigned-ambassador count): if `value > 5`, with `scalingBase = value - 5`: `cultureConsumptionAmbassadors = 20 * (1 + 0.025*scalingBase)`, `spiceConsumptionAmbassadors = 0.8 * (1 + 0.001*scalingBase²)`; otherwise the flat `20` / `0.8`. **The port's snapshot is the `value <= 5` branch** (`Catalog.Village.fs:29`) — the quadratic/cubic escalation is **not modelled**.

### 6.3 Engineer is special: it produces no resources

`engineer`'s modifier map is **empty** (`Catalog.Village.fs:28`, ORIG `village.js:158-159`). Instead, an engineer with an `EngineerSpeciality` contributes to a **synthetic key `"ES" + craftName`** (`Game.Managers.fs:1012-1041`; ORIG `village.js:691-721`):

```
automationBonus = eff(craftName + "AutomationBonus")              # L1019
diff = 1 + automationBonus                                        # L1020-1021
rankDiff = craft.tier - kitten.rank                               # L1022-1026
if rankDiff > 0: diff -= diff * rankDiff * 0.15                   # L1027-1029
diff += diff * skillMod                                           # L1030
if diff > 0: leader folds (same as §6.4), then diff *= happiness   # L1031-1039
res["ES" + craft] += diff
```

Engineers **without** a speciality contribute **nothing at all** (`Game.Managers.fs:1014-1015`).

### 6.4 The per-kitten modifier chain (identical for all jobs)

For each kitten `k` with job `j`, for each `(resName, baseMod)` in the job's modifier map (`Game.Managers.fs:998-1011`; ORIG `village.js:670-689`):

```
skillMod = getValueModifierPerSkill(k.skills[j] || 0, eff("masterSkillMultiplier"), eff("skillMultiplier"))   # L993-995
diff = baseMod + baseMod * skillMod                              # = baseMod * (1 + skillMod)        # L999
diff = diff * (1 + eff(j + "BoostPerRank") * k.rank)             # rankMultiplier                    # L997, L1000
if diff > 0:
    if k.isLeader:  diff *= getLeaderBonus(k.rank)                # L1004-1005
    elif leader exists: diff *= 1 + (getLeaderBonus(leader.rank) - 1) * eff("boostFromLeader")   # L1006-1008
    diff *= happiness                                             # L1010
res[resName] += diff
```

Note `diff` is added **unconditionally** — the `if diff > 0` block only gates the leader/happiness folds (ORIG `village.js:673-681`).

`getValueModifierPerSkill` (`Game.Managers.fs:846-861`; ORIG `village.js:1292-1318`) — **stepped, not continuous**:

```
if anarchy: 0
skill < 100   → 0
< 500        → 0.0125
< 1200       → 0.025
< 2500       → 0.045
< 5000       → 0.075
< 9000       → 0.125
≥ 9000       → 0.1875 * (1 + eff("masterSkillMultiplier"))
  then × (1 + eff("skillMultiplier"))
```

`getLeaderBonus(rank)` (`Game.Managers.fs:829-831`; ORIG `village.js:782-787`): `rank == 0 → 1.0`, else `(rank+1)/1.4`; `× 2` if authocracy researched.

### 6.5 Happiness fold — port/orig divergence

The `happiness` multiplier in §6.4 is **not** plain `village.happiness` in ORIG (`village.js:632-633`):

```
happiness = this.happiness + (this.happiness - 1) * eff("happinessKittenProductionRatio")
```

`happinessKittenProductionRatio = 0.1` from policy **liberty** (`Game.Catalog.Policies.fs:15`; ORIG `science.js:864`). **The port uses bare `vpool.Happiness`** (`Game.Managers.fs:970`, with the seam flagged in the comment at `:969`). Divergence only under liberty.

### 6.6 Which jobs consume a resource

**None of the 9 jobs has a consumption term inside `calcResourcePerTick`.** Consumption enters the production chain in exactly three places:

1. **Population demand** — `village.getResConsumption` (`village.js:811-819`; PORT `Game.Production.fs:211` ← `Program.fs:885-895` / `KittensState.fs:158-167`):
   ```
   catnip = -0.85 * kittens          # catnipPerKitten = -0.85, village.js:9,815
   furs   = -0.01  * kittens * philosophyLuxuryModifier
   ivory  = -0.007 * kittens * philosophyLuxuryModifier
   spice  = -0.001 * kittens * philosophyLuxuryModifier
   philosophyLuxuryModifier = (1 + eff("luxuryDemandRatio")) * (1 + festivalDays ? eff("festivalLuxuryConsumptionRatio") : 0)
   ```
   The PORT **hardcodes** these four constants (`Program.fs:891-894`) and **omits `philosophyLuxuryModifier` entirely** — so under extravagance (2.0) or a festival, port and orig disagree on furs/ivory/spice. Catnip is unaffected.
2. **Ambassadors** consume culture + spice via `actionAmbassadors` (`village.js:497-527`; PORT `Program.fs:479-503`), using `getAmtDependsOnStock` and setting `effectScaling`.
3. **Converters** (`getResourcePerTickConvertion`, `Game.Production.fs:73-74`) subtract `<res>PerTickCon` and ambassador consumption — currently 0.

So: **the farmer consumes nothing; every kitten consumes catnip (and furs/ivory/spice); ambassadors consume culture and spice.** Note the farmer's `{catnip: 1}` is the only positive catnip source and it exists to offset the −0.85/kitten.

---

## 7. Resource production aggregation

### 7.1 Two stages

**Stage 1 — village map.** `Game.Managers.getResProduction` (`Game.Managers.fs:962-1041`) returns `Map<string, float>`: the sum over all kittens of the §6.4 chain, plus the engineer `ES<craft>` keys. This map is the thing §6 describes; it is **not** the final income.

**Stage 2 — final per-tick.** `Game.Production.calcResourcePerTick` (`Game.Production.fs:94-243`), term-for-term in ORIG order. With `spaceRatio = 1 + eff("spaceRatio")` (`L109`) and `hp = calcResourcePerTick`:

```
1.  hp  = eff(res + "PerTickBase")                                                   L106
2.  hp += eff(res + "PerTickBaseSpace") * spaceRatio                                  L114-115
3.  hp *= getWeatherMod(cal, res)                                                     L118
4.  resProduction0 = VillageResProduction(res)          ← STAGE 1                     L121
5.  resProduction  = resProduction0 * HGScalingBonus   (1.0 in port)                  L124
6.  hp += resProduction                                                             L125
7.  hp += resProduction * eff(res + "JobRatio")                                       L128-129
8.  hp *= 1 + eff(res + "GlobalRatio")                                                L132
9.  hp *= 1 + eff(res + "Ratio")                                                     L135
10. hp *= 1 + eff(res + "RatioReligion")                                             L138
11. hp *= 1 + eff(res + "SuperRatio")                                                L141
12. if steamworksOn > 0: hp *= 1 + swEffectGlobal(res + "RatioGlobal")                L142-147
13. ppr = ParagonProductionRatio; if res=="catnip" && winterIsComing: ppr = 0
    hp *= 1 + ppr                                                                    L150-154
14. if res == "catnip": hp *= 1 + catnipPollutionRatio                               L156-158
15. psr = 1 + ppr * 0.05                                                             L161
16. hp += eff(res + "PerTickAutoprod") * psr * (1 + eff("rankLeaderBonusConversion") * leaderRank)   L163-167
17. if (not transient) && magnetoOn > 0 && res != "catnip":
        hp *= 1 + eff("magnetoRatio");  psr += psr * eff("magnetoRatio")             L169-173
18. if (not transient) && res != "uranium" && res != "catnip":
        hp *= 1 + eff("productionRatio"); psr += psr * eff("productionRatio")        L175-179
19. hp *= 1 + solarRevolutionRatio * (1 + (res ∈ {wood, catnip} ? solarRevolutionPollution : 0))   L181-183
20. if (not DisableCMBR) && res != "coal": hp *= 1 + CMBRBonus   (CMBRBonus = 0.2 iff enabled)   L185-187, L88-89
21. psr *= 1 + solarRevolutionRatio                                                 L190
22. hp += eff(res + "PerTickProd")                                                   L192
23. hp += (eff(res + "PerTickAutoprodSpace") * spaceRatio) * (1 + (psr - 1) * eff("prodTransferBonus"))   L194-198
24. hp += eff(res + "PerTickSpace") * spaceRatio                                     L200
25. hp += eff(res + "PerTick") * (1 + eff(res + "PerTickRatio"))                     L207-208
26. resConsumption = VillageResConsumption(res)            ← §6.6 stage 1            L211
    resConsumption *= 1 + eff(res + "DemandRatio")                                   L212
    if res == "catnip" && Kittens > 0 && Happiness > 1.0:                           L213
        hc = max(Happiness * (1 + eff("hapinnessConsumptionRatio")) - 1, 0)         L214
        resConsumption += resConsumption * hc * (1 + eff(res + "DemandWorkerRatioGlobal"))
                                * (1 - FreeKittens / Kittens)                       L216-219
27. hp *= 1 + (sorrow.value * eff("blsProductionBonus"))                             L221-227
28. hp *= 1 + eff("pyramidGlobalProductionRatio")                                   L229-230
29. if res == "faith": hp *= 1 + eff("pyramidFaithRatio")                          L232-234
30. hp *= 1 + eff(res + "PolicyRatio")                                              L236-237
31. hp += resConsumption                                                           L238
32. if isNaN hp: return 0 else hp                                                  L240-243
```

Faithful quirk at L238: consumption is **added last**, so it is multiplied by every ratio in steps 8-21 and 27-30 before being applied.

ORIG cross-check: `game.js:3668-3836`, term-for-term identical, incl. the misspelling `hapinnessConsumption` at `game.js:3809`.

Notable ORIG quirks preserved: `productionRatio` (reactor) is skipped for **catnip** as well as uranium (`game.js:3774`) — catnip gets no reactor bonus; `coal` is excluded from CMBR (`game.js:3778`).

### 7.2 `perTickCached` — production and refresh

`perTickCached = fixFloatPointNumber(calcResourcePerTick(res))` (`game.js:4571`), written **only** for resources with `calculatePerTick` (`game.js:4570`). `fixFloatPointNumber` (`Game.Production.fs:63-69`) strips sub-1e-7 dust:

```fsharp
let adjusted  = floor (number * 10000000.0) / 10000000.0
let roundDiff = jsRound ((number - adjusted) * 10000000.0)
if not (IsNaN roundDiff) && roundDiff <> 0.0 then
    floor ((number + 0.000000000000010) * 10000000.0) / 10000000.0
else adjusted
```

`getResourcePerTick(res, false)` returns `perTickCached` verbatim (`game.js:4585`; PORT equivalent: the cached field read at `Program.fs:1821-1823`).

**Refresh points (ORIG):**
| Trigger | Site |
|---|---|
| `updateCaches()` tail, itself on a **5-tick** timer | `game.js:2612-2614` → `game.js:2715` → `game.js:4571` |
| `village.killKittens` tail | `village.js:3391` |
| `game.craft` / `craftAll` | `game.js:4631, 4642, 4654, 4660` |
| `game.upgrade` (via `updateCaches`) | `game.js:6097, 6126` |
| new day (`game.upgrade` → `updateCaches`) | `calendar.js:868` |
| **10-tick** timer: `village.updateResourceProduction` (stage 1 only, not perTickCached) | `game.js:2607-2610` |

**PORT mirrors this exactly** (`Program.fs:4353-4362`): `prodPhase` counts down to 0 every **10** ticks → `updateResourceProduction()`; `updateCachesPhase` every **5** ticks → `refreshCache()` which rebuilds the effects cache *and* `refreshResourcesOnly()`. Plus the instant paths: on a kill (`Program.fs:1834-1835`) and on an `assign` that actually assigned (`Program.fs:5983`). `refreshResourcesOnly` (`Program.fs:899-911`) mirrors `game.updateResources` exactly: rebuilds `PerTickCached` for `CalculatePerTick` resources, does **not** touch the effects cache.

**This 5-tick cadence is a real simulation input**: `catnipPerTickCached` — the value the starvation test reads — is up to 5 ticks stale relative to reality.

### 7.3 Applying income to stocks

`resPool.update()` (`resources.js:728-773`; PORT `Game.Resources.fs:286-330`) runs once per tick, **before** `village.update` (`game.js:4505,4516`), iterating resources in pool order:

```
per resource res:
    res.maxValue = updateMaxValue(res)          # resources.js:780
    if res.name == "sorrow": continue          # L735-737 (skipped entirely)
    unlock flips (value > 0 → unlocked; value == 0 → relock for zebras/paragon/elderBox only)  # L740-748
    res.value += getResourcePerTick(res, false)            # i.e. += perTickCached       # L750-751
then karma (updateKarma), then energy accounting
```

`addRes` (`resources.js:642-...`) clamps against `max(res.value, res.maxValue)` unless `preventLimitCheck`, and is a **no-op during a temporal paradox** (`day < 0`, `resources.js:643`). PORT: `addResPerTick` (`Game.Resources.fs:92-93`) passes `allowDuringParadoxes = false`, matching.

So per tick, per resource: `value ← min(value + perTickCached, max(value, maxValue))`.

---

## 8. Happiness

### 8.1 Formula

`Game.Happiness.updateHappiness` (`Game.Happiness.fs:41-70`); ORIG `updateHappines` (`village.js:963-1010`). Result is `happiness/100`, i.e. a multiplier in **[0.25, ∞)**.

```
h = 100
unhappiness = fascism ? 0 : (kittens - 5) * 2 * (1 + eff("unhappinessRatio"))        # L35-38 / village.js:931-935
if kittens > 5: h -= unhappiness                                                  # L44-45 / village.js:967-969
h += eff("happiness") + eff("environmentHappinessBonus")
   + eff("environmentUnhappiness") + eff("challengeHappiness") + pollutionHappines  # L48-50 / village.js:971-975
perLuxury = 10 + eff("luxuryHappinessBonus")                                      # L53 / village.js:978-980
h += luxuryCount * perLuxury                                                     # L54 / village.js:981-983
if elderBox present AND wrappingPaper present: h -= perLuxury                     # L55 / village.js:984-986
h += consumableLuxuryCount * eff("consumableLuxuryHappiness")                    # L56 / village.js:987-989
if festivalDays > 0: h += 30 * (1 + eff("festivalRatio"))                        # L58-59 / village.js:991-993
h += karma                                                                     # L62 / village.js:997
overpopulation = kittens - maxKittens
if overpopulation > 0: h -= overpopulation * 2                                  # L64-66 / village.js:999-1002
if h < 25: h = 25                                                               # L68 / village.js:1004-1006
return h / 100
```

Inputs:
- **`luxuryCount`** — count of resources with `Category ≠ "common"` **and** `value > 0` (`Program.fs:1863-1867`; ORIG `village.js:982-983`). PORT computes it by scanning `pool.Order` over the catalog `Category` (`Game.Catalog.Resources.fs`). Note ORIG checks `resources[i].type != "common"`, matching.
- **`unhappinessRatio`** is one of only five LDR-folded effects (`Game.Effects.fs:27-31`): `catnipDemandRatio`, `fursDemandRatio`, `ivoryDemandRatio`, `spiceDemandRatio`, `unhappinessRatio`. `getLimitedDR(x, 1)` is applied to the *whole* aggregated value.
- `karma` — PORT threads `freshHappinessContext.Karma = 0.0` (`Game.Happiness.fs:19`); the karma seam is not wired.
- `overpopulation` uses **`maxKittens`** = `sim.maxKittens` in ORIG (`village.js:946`), which the port folds into `Vpool.MaxKittens` (see the §1.4 divergence).
- `pollutionHappines` — `-log10(pollution) * 1.2` (L4) / `*1.18` (L3) / `*1.08` (L2) etc. (`Program.fs:347-370`).

**Where it is computed in the tick order:** *after* births/deaths/skills, *before* ambassadors (`Program.fs:1860-1874`; ORIG `village.js:485-486`). So happiness always reflects the population at the *end* of the tick.

### 8.2 Where happiness feeds back

**Three feedback paths into production, all via `calcResourcePerTick`:**

1. **Job production multiplier.** Every per-kitten `diff` in `getResProduction` is multiplied by `happiness` (`Game.Managers.fs:1010`; ORIG `village.js:683`). This is the dominant path: happiness ≥ 1 scales *all* job output linearly.
2. **Engineer output.** `diff *= happiness` on the `ES<craft>` keys (`Game.Managers.fs:1038`; ORIG `village.js:719`).
3. **Catnip consumption** (`Game.Production.fs:213-219`; ORIG `game.js:3807-3817`) — only when `happiness > 1`:
   ```
   hc = max(happiness * (1 + eff("hapinnessConsumptionRatio")) - 1, 0)
   resConsumption += resConsumption * hc * (1 + eff(res + "DemandWorkerRatioGlobal")) * (1 - FreeKittens/Kittens)
   ```
   **Counter-intuitive but exact: happiness > 1 makes the village eat MORE.** Being happy is a cost, not a saving. With `Kittens` unemployed the `(1 - FreeKittens/Kittens)` factor is 0 and the term vanishes entirely — so the penalty is levied only on *employed* kittens. `hapinnessConsumptionRatio = -0.1` from policy **rationing** (`Game.Catalog.Policies.fs:59`).

**Paths into death / population:** **none directly.** Happiness does not kill kittens. Its only population effect is indirect, via path 3 changing `catnipPerTickCached`, which the §4 starvation test then reads. Above 100% happiness with a fully-staffed workforce, catnip net income drops, and *that* can starve the village.

`village.happiness` also feeds the toolbar overpopulation tooltip (`village.js:177`) and the achievements check `MaxKittens = 1` (`Game.Achievements.fs:105`) — display only.

---

## 9. Per-tick order of operations (the model a solver must reproduce)

From `Program.fs:1802-1874` and ORIG `game.js:4503-4540` + `village.js:421-493`:

```
 0. (5-tick phase) refreshCache(): effects cache + perTickCached        Program.fs:4360-4362
 1. village.maxKittens ← floor(eff("maxKittens"))                       game.js:4514
 2. kittensPerTick ← 0.01 * (1 + eff("kittenGrowthRatio"))              village.js:406-419
    … / arrivalSlowdown if > 1 ; × (2 + festivalArrivalRatio) if festival
 3. resDiff = catnip.value + catnip.perTickCached                       village.js:430-432
 4. IF kittens > 0 AND (resDiff < 0 OR freezeCondition):               village.js:435
       starved = min(1, |jsRound(resDiff)|)
       IF starved > 0 AND deathTimeout <= 0:
           killKittens(starved)   → job counters ↓, leader cleared,
                                    stats ↑, prodCache+cache REFRESHED   village.js:442-451
           deathTimeout = 25
       ELSE: deathTimeout -= 1
       growthRate = 0                                                 village.js:456
    ELSE: growthRate = kittensPerTick
 5. sim.maxKittens ← village.maxKittens (× maxKittensRatio if any)     village.js:425
 6. sim.update(growthRate, times):                                     village.js:3229-3251
       progress += times * rate ; spawn floor(progress) kittens (≤ maxKittens)
       if at cap: progress = 0
       skill half: skillXP = (max(kittens*hgMod/10000, 0.01) if internet else 0.01
                              + eff("skillXP")) * times                village.js:3273-3275
 7. per-job limit trim: if job.value > getJobLimit → sim.removeJob     village.js:463-469  [NOT IN PORT]
 8. if getFreeKittens() < 0: clearJobs(true)                           village.js:471-473  [NOT IN PORT]
 9. updateHappines()                                                   village.js:485
10. actionAmbassadors(1): consume culture+spice, rebuild diplomacy effects   village.js:486
11. kittens pseudo-resource: value = count, maxValue = sim.maxKittens    game.js:4537-4538
12. resPool.update(): maxValue recompute + value += perTickCached        resources.js:728-773
    (runs FIRST in the tick, before village.update — game.js:4505 vs 4516)
13. (10-tick phase) updateResourceProduction()                          game.js:2607-2610
```

**The one ordering subtlety that will bite a solver:** `resPool.update()` (step 12) runs *before* `village.update()` (steps 1-11) in the same tick, so a tick's income is applied using the *previous* tick's `perTickCached`, and the starvation test reads a value that is itself up to 5 ticks stale.

---

## 10. Constants quick-reference

| Constant | Value | PORT | ORIG |
|---|---|---|---|
| `kittensPerTickBase` | `0.01` | `Program.fs:1805` | `village.js:7` |
| `catnipPerKitten` | `-0.85` | `Program.fs:891` | `village.js:9` |
| population penalty | `2` per kitten over 5 | `Game.Happiness.fs:38` | `village.js:932` |
| overpopulation penalty | `2` per kitten over cap | `Game.Happiness.fs:66` | `village.js:1000` |
| happiness floor | `25` (→ 0.25) | `Game.Happiness.fs:68` | `village.js:1004` |
| luxury happiness | `+10` each (`+ eff("luxuryHappinessBonus")`) | `Game.Happiness.fs:53` | `village.js:978-980` |
| festival happiness | `+30 * (1 + eff("festivalRatio"))` | `Game.Happiness.fs:59` | `village.js:992` |
| death cooldown | `ticksPerSecond * 5` = **25** | `Game.Managers.fs:796` | `village.js:451` |
| max deaths per event | `1` | `Game.Managers.fs:793` | `village.js:438-440` |
| `ticksPerSecond` | `5` | `Program.fs:1830` | `game.js:2289` |
| `ticksPerDay` | `10` | `Game.Calendar.fs:33` | `calendar.js:217` |
| default job limit | `100000` | `Program.fs:5976` | `village.js:357` |
| engineer job limit | `factory.val` | `Program.fs:5971-5974` | `village.js:330` |
| `maxKittens` base | `0` (no base effect) | `Game.Catalog.BaseEffects.fs:11-27` | `village.js:5` |
| hut / logHouse / mansion | `2` / `1` / `1` per ON | `Game.Catalog.Defs.fs:55,64,73` | `buildings.js:502,520,543` |
| seed draw range | `[0, 1000000)` | `Game.Math.fs:46-49` | `village.js:3448` |
| skill cap | `20001` | `Game.Managers.fs:688` | `village.js:3276` |
| `getRankExp` | `500 * 1.75^rank` | `Game.Managers.fs:834` | `village.js:225` |
| CMBR bonus | `0.2` | `Game.Production.fs:88` | `game.js:4404-4406` |
| furs / ivory / spice per kitten | `-0.01 / -0.007 / -0.001` | `Program.fs:892-894` | `village.js:816-818` |

---

## 11. Summary of confirmed port/orig divergences

Ranked by risk to a solver predicting the next N ticks:

1. **`maxKittensRatio` is not applied** (`Game.Managers.fs:591-593` vs ORIG `village.js:394-405`). Housing is correct in every non-Holy-Genocide game; HG is wrong.
2. **`getFreeKittens` uses a different definition** (kitten-count, `Game.Managers.fs:744-745`) than ORIG (counter-derived, `village.js:547-553`). Diverges once `JobValues` desyncs from reality — and it feeds the **catnip happiness-consumption** term (`Game.Production.fs:219`), so this can change whether a village starves.
3. **Per-tick job-limit enforcement is missing** (`removeJob`/`clearJobs` at ORIG `village.js:463-473` are not in the port). Inflated counters never self-correct.
4. **Ambassador consumption escalation is not modelled** — only the `value <= 5` branch is snapshotted (`Game.Catalog.Village.fs:29` vs ORIG `village.js:194-201`).
5. **`philosophyLuxuryModifier` is omitted** on furs/ivory/spice (`Program.fs:892-894` vs ORIG `village.js:813-818`).
6. **`happinessKittenProductionRatio` (liberty) is not folded** into the job multiplier (`Game.Managers.fs:970` vs ORIG `village.js:632-633`).
7. **The winterIsComing freeze branch is unreachable** (`Game.Managers.fs:790`, hardcoded `false` at `Program.fs:1830`) and additionally drops ORIG's `weather == "cold"` conjunct.
8. **`Geologist`'s drill/geodesy variants are not modelled** — only the base `coal: 0.015` snapshot (`Game.Catalog.Village.fs:27` vs ORIG `village.js:108-136`).
9. **Scholar's `starchart: 0.0001`** upgrade is not modelled (`Game.Catalog.Village.fs:23` vs ORIG `village.js:47-49`).
10. **Ordering of festival vs pollution in the birth rate is swapped** (`Program.fs:1807-1811` vs ORIG `village.js:411-418`) — commutative, last-ULP only.

## 12. Explicitly undetermined

- **Natural death from old age**: **nonexistent.** Age is generated once (`Game.Managers.fs:619-621`) and never read by any simulation path.
- **The `optimizeJobs` path** in `sim.assignJob`/`removeJob` (ORIG `village.js:3482-3500`): requires workshop `register` researched **and** a leader; the PORT omits it (`Game.Managers.fs:938-955` comment says "no optimize at fresh"). Skilling-order differences apply only after the Register upgrade.
- **Ambassador limit formula**: the port hardcodes `0` (`Program.fs:5975`); the real formula is ORIG `village.js:332-352`. **Undetermined in the port.**
- **`theocracy` leader demotion** inside `updateResourceProduction` (ORIG `village.js:653-659`): absent from the port (`Game.Managers.fs:962-1041`).
- **`getResProduction`'s zebra manpower hack** (ORIG `village.js:612-621`: `+0.15` at `zebras > 0`, plus `getLimitedDR((zebras-1)*0.05, 2 + zebraPreparations*0.05)` at `zebras > 1`): **not implemented** — grep for `manpower` in `Game.Managers.fs` returns nothing.
