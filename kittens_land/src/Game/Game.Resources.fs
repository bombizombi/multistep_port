module Game.Resources

// resources-02 + resources-03: the resPool registry and the core add/mutate
// pipeline (orig js/resources.js: constructor/get/reset L538-583, addRes family
// L642-687). Ported statement-for-statement per D003 — including the
// "res.maxValue || Number.MAX_VALUE" falsy-coercion and the karma roundtrip.

open Game.Types
open Game.Math

/// orig constructor: clone resourceData, value = 0, unlocked = false, no cap set.
/// (setVillage is deferred until the village manager exists — resources-02 note.)
let init (defs: ResourceDef list) : ResPool =
    let byName =
        defs
        |> List.map (fun d ->
            d.Name,
            { Def = d
              Value = 0.0
              Unlocked = false
              MaxValue = 0.0
              PerTickCached = 0.0 })
        |> Map.ofList
    { Order = defs |> List.map (fun d -> d.Name)
      ByName = byName
      KarmaKittens = 0
      EnergyProd = 0.0
      EnergyWinterProd = 0.0
      EnergyCons = 0.0 }

/// orig get(): the resource or None (orig returns false).
let get (pool: ResPool) (name: string) : ResourceState option = pool.ByName |> Map.tryFind name

/// orig resPool.reset(): fresh pool from the same catalog.
let reset (pool: ResPool) : ResPool = init (pool.ByName |> Map.toList |> List.map (fun (_, s) -> s.Def))

/// orig addRes(res, addedValue, allowDuringParadoxes, preventLimitCheck).
/// calendarDay is game.calendar.day (owned by calendar-01; threaded in until then).
/// Returns the updated pool and the actual delta (orig's return value).
let addRes
    (calendarDay: int)
    (addedValue: float)
    (allowDuringParadoxes: bool)
    (preventLimitCheck: bool)
    (name: string)
    (pool: ResPool)
    : ResPool * float =

    if (calendarDay < 0 && not allowDuringParadoxes) || addedValue = 0.0 then
        pool, 0.0
    else
        let res = pool.ByName[name] // orig: get(name) must exist — catalog covers all
        let prevValue = res.Value

        // res.value = Math.min(prevValue + addedValue, Number.MAX_VALUE)
        let v1 = min (prevValue + addedValue) System.Double.MaxValue

        // if (!preventLimitCheck): limit = Math.max(prevValue, res.maxValue || MAX)
        // JS falsy: maxValue of 0 (unset) means "no limit".
        let v2 =
            if preventLimitCheck then
                v1
            else
                let limit = max prevValue (if res.MaxValue <> 0.0 then res.MaxValue else System.Double.MaxValue)
                min v1 limit

        // void is always an integer
        let v3 = if name = "void" then floor v2 else v2

        // NaN / dust guard
        let v4 = if System.Double.IsNaN v3 || v3 < 0.0000000001 then 0.0 else v3

        // karma roundtrip through the unlimited-DR curve
        let v5, karmaKittens =
            if name = "karma" then
                let kk = jsRound (getInverseUnlimitedDR v4 5.0) |> int
                getUnlimitedDR (float kk) 5.0, kk
            else
                v4, pool.KarmaKittens

        let updated = { res with Value = v5 }
        let pool' =
            { pool with
                ByName = pool.ByName |> Map.add name updated
                KarmaKittens = karmaKittens }

        // orig: return addedValue directly when unclamped (avoids double rounding)
        let delta = if v5 = prevValue + addedValue then addedValue else v5 - prevValue
        pool', delta

/// orig addResPerTick(name, value): paradox-gated (allowDuringParadoxes = false).
let addResPerTick (calendarDay: int) (name: string) (value: float) (pool: ResPool) : ResPool * float =
    addRes calendarDay value false false name pool

/// orig addResEvent(name, value): allowed during paradoxes.
let addResEvent (calendarDay: int) (name: string) (value: float) (pool: ResPool) : ResPool * float =
    addRes calendarDay value true false name pool

// ---------------------------------------------------------------------------
// resources-04: stock-ratio conversion helper (orig getAmtDependsOnStock,
// js/resources.js L695-723). Consumes stock via addResPerTick so callers can
// continue with updated resources; returns the achievable fraction of `amt`.

let getAmtDependsOnStock
    (calendarDay: int)
    (fromSpec: (string * float) list)
    (amt: float)
    (pool: ResPool)
    : ResPool * float =
    if amt = 0.0 then
        pool, 0.0
    else
        let amtBeginning = amt
        let mutable amt' = amt

        // Cap amt based on available resources (amt can decrease per resource)
        for (resName, perUnit) in fromSpec do
            let resAvailable = pool.ByName[resName].Value
            let resNeeded = perUnit * amt'
            if resAvailable < resNeeded then
                let amtAvailable = resAvailable / perUnit
                amt' <- min amt' amtAvailable

        // Remove from resources now so later actions see updated stock
        let mutable pool' = pool
        for (resName, perUnit) in fromSpec do
            let p, _ = addResPerTick calendarDay resName (-perUnit * amt') pool'
            pool' <- p

        pool', amt' / amtBeginning

// ---------------------------------------------------------------------------
// resources-06: storage cap computation & ratio chain (orig js/resources.js
// L784-826 + L896-973 + isNormalCraftableResource L1173).

/// Dependency seam until the real subsystems land (game-08 effects cache,
/// prestige-01, challenges, workshop). The runner builds this from its LIVE
/// effects cache; at tick 0 the cache is empty, which reproduces the
/// zero-cap state verified by the unit-res-caps fixture.
type CapContext =
    { GetEffect: string -> float // game-08 effects cache
      ParagonStorageRatio: float // prestige (0.0 fresh)
      CMBRBonus: float // game.getCMBRBonus() result (0.0 fresh: isCMBREnabled=false)
      UnicornTearsActive: bool // challenges (false fresh)
      SilosResearched: bool // workshop (false fresh)
      KarmaZebras: int } // game.karmaZebras (0 fresh)

let isNormalCraftableResource (res: ResourceState) : bool =
    res.Def.Craftable && res.Def.Name <> "wood"

/// orig addResMaxRatios(res, maxValue) — global ratio chain, exact order.
let addResMaxRatios (ctx: CapContext) (res: ResourceState) (maxValue: float) : float =
    let name = res.Def.Name

    if name = "temporalFlux" || name = "zebras" then
        maxValue
    else
        let mutable m = maxValue

        // Unicorn Tears Challenge
        if ctx.UnicornTearsActive
           && (name = "unicorns" || name = "tears" || name = "alicorn") then
            m <- m * (1.0 + ctx.GetEffect(name + "MaxRatio"))
            m
        else
            m <- m * (1.0 + ctx.ParagonStorageRatio)

            // +COSMIC RADIATION (orig folds the disableCMBR option into
            // getCMBRBonus(); the seam carries the resulting bonus directly)
            m <- m * (1.0 + ctx.CMBRBonus)

            m <- m * (1.0 + ctx.GetEffect(name + "MaxRatio"))

            if not (isNormalCraftableResource res) && not res.Def.Transient then
                m <- m * (1.0 + ctx.GetEffect("globalResourceRatio"))

            if not (isNormalCraftableResource res) && not res.Def.Transient then
                m <- m * (1.0 + ctx.GetEffect("pyramidGlobalResourceRatio"))

            if res.Def.Tag = Some "baseMetal" then
                m <- m * (1.0 + ctx.GetEffect("baseMetalMaxRatio"))

            if name = "science" then
                m <- m * (1.0 + ctx.GetEffect("technocracyScienceCap"))

            if name = "culture" then
                m <- m * (1.0 + ctx.GetEffect("onAHillCultureCap"))

            m

/// orig addBarnWarehouseRatio(effects) — barn/warehouse multipliers over an
/// effect map (used by tooltips/building effects; ported for unit completeness).
let addBarnWarehouseRatio (ctx: CapContext) (effects: Map<string, float>) : Map<string, float> =
    let barnRatio = ctx.GetEffect("barnRatio")
    let warehouseRatio = 1.0 + ctx.GetEffect("warehouseRatio")

    effects
    |> Map.map (fun name effect ->
        let mutable e = effect

        if name = "catnipMax" && ctx.SilosResearched then
            e <- e * (1.0 + barnRatio * 0.25)

        if name = "woodMax" || name = "mineralsMax" || name = "ironMax" then
            e <- e * (1.0 + barnRatio)
            e <- e * warehouseRatio

        if name = "coalMax" || name = "titaniumMax" || name = "goldMax" then
            e <- e * warehouseRatio

        e)

/// orig updateMaxValue(res) — sorrow/zebras specials + challenge branch.
let updateMaxValue (ctx: CapContext) (res: ResourceState) : ResourceState =
    if res.Def.Name = "sorrow" then
        let mv = 17.0 + ctx.GetEffect("blsLimit")
        { res with MaxValue = mv; Value = min res.Value mv }
    else
        let mutable maxValue = Game.Math.jsOr0 (ctx.GetEffect(res.Def.Name + "Max"))

        if res.Def.Name = "zebras" then
            maxValue <- maxValue + float ctx.KarmaZebras + 1.0

        let maxValue2 = min (addResMaxRatios ctx res maxValue) System.Double.MaxValue

        let challengeEffect = ctx.GetEffect(res.Def.Name + "MaxChallenge")

        let maxValue3 =
            if challengeEffect <> 0.0 then
                // JS: getLimitedDR(addResMaxRatios(...), maxValue - 1 - bld.effectsBase[...] || 0)
                // (the || 0 binds to the whole second argument; a missing base
                // entry makes it NaN, which || 0 turns into 0)
                let secondArg =
                    Game.Math.jsOr0 (
                        match Map.tryFind (res.Def.Name + "Max") Game.Catalog.BaseEffects.baseEffects with
                        | Some baseValue -> maxValue2 - 1.0 - baseValue
                        | None -> maxValue2 - 1.0 - nan
                    )

                maxValue2 + getLimitedDR (addResMaxRatios ctx res challengeEffect) secondArg
            else
                maxValue2

        { res with MaxValue = max maxValue3 0.0 }

let updateMaxValueByName (ctx: CapContext) (resName: string) (pool: ResPool) : ResPool =
    match get pool resName with
    | Some res -> { pool with ByName = pool.ByName |> Map.add resName (updateMaxValue ctx res) }
    | None -> pool

/// orig updateMaxValueAll(): recompute every cap in resPool order.
let updateMaxValueAll (ctx: CapContext) (pool: ResPool) : ResPool =
    { pool with
        ByName =
            pool.ByName
            |> Map.map (fun _ res -> updateMaxValue ctx res) }

// ---------------------------------------------------------------------------
// resources-05: per-tick update loop (orig js/resources.js L728-778).

/// Dependency seam for update(): production values come from game.getResourcePerTick
/// (game-10 slice — until then the runner injects an override map, mirroring how the
/// orig harness patches the method). Pasture/energy-loss terms are buildings-01;
/// at fresh state PastureOn = 0 makes EnergyLoss irrelevant.
type UpdateContext =
    { Cap: CapContext
      GetResourcePerTick: string -> float
      CalendarSeason: int // calendar-01 seam (0 = spring at fresh)
      PastureOn: int
      EnergyLoss: float
      EnergyChallengeResearched: bool
      EnergyChallengeActive: bool }

/// orig updateKarma(): karma resource value tracks getUnlimitedDR(karmaKittens, 5).
/// The chapel/frescoes effect recalc on change needs religion/building managers —
/// at fresh the value never changes; wire the recalc when those units land.
let updateKarma (pool: ResPool) : ResPool =
    let karma = getUnlimitedDR (float pool.KarmaKittens) 5.0
    let res = pool.ByName["karma"]
    if karma <> res.Value then
        { pool with ByName = pool.ByName |> Map.add "karma" { res with Value = karma } }
    else
        pool

/// orig resPool.update(): per resource — cap recompute, unlock flips, production
/// accrual; then karma; then energy accounting. Iterates in resPool order.
let update (uctx: UpdateContext) (calendarDay: int) (pool: ResPool) : ResPool =
    let mutable pool' = pool

    for name in pool'.Order do
        let res = pool'.ByName[name]
        let res1 = updateMaxValue uctx.Cap res

        if name = "sorrow" then
            pool' <- { pool' with ByName = pool'.ByName |> Map.add name res1 }
        else
            // (spice title hack skipped: October/spooky title swap is UI-only)
            let unlocked' =
                if not res1.Unlocked && res1.Value > 0.0 then true
                elif res1.Value = 0.0
                     && res1.Unlocked
                     && (name = "zebras" || name = "paragon" || name = "elderBox") then false
                else res1.Unlocked

            let res2 = { res1 with Unlocked = unlocked' }
            let pool1 = { pool' with ByName = pool'.ByName |> Map.add name res2 }
            let perTick = uctx.GetResourcePerTick name
            let pool2, _ = addResPerTick calendarDay name perTick pool1
            pool' <- pool2

    // karma
    let poolK = updateKarma pool'

    // energy accounting (resources-07)
    let energyProdRatio = 1.0 + uctx.Cap.GetEffect("energyProductionRatio")
    let energyProd = uctx.Cap.GetEffect("energyProduction") * energyProdRatio
    let energyWinterProd0 = energyProd
    let energyConsRatio =
        (1.0 + uctx.Cap.GetEffect("energyConsumptionRatio") + uctx.Cap.GetEffect("energyConsumptionIncrease"))
        * (if uctx.EnergyChallengeActive then 2.0 else 1.0)
    let energyCons = uctx.Cap.GetEffect("energyConsumption") * energyConsRatio

    let energyWinterProd =
        if uctx.CalendarSeason <> 3 then
            // orig: energyWinterProd -= solarFarm.get("on") * energyLoss * energyProdRatio
            energyWinterProd0 - float uctx.PastureOn * uctx.EnergyLoss * energyProdRatio
        else
            energyWinterProd0

    { poolK with
        EnergyProd = energyProd
        EnergyWinterProd = energyWinterProd
        EnergyCons = energyCons }

// ---------------------------------------------------------------------------
// resources-07: energy accounting accessors (orig js/resources.js L829-840, 1089).

let getEnergyProductionRatio (ctx: CapContext) : float = 1.0 + ctx.GetEffect("energyProductionRatio")

let getEnergyConsumptionRatio (ctx: CapContext) (energyChallengeActive: bool) : float =
    (1.0 + ctx.GetEffect("energyConsumptionRatio") + ctx.GetEffect("energyConsumptionIncrease"))
    * (if energyChallengeActive then 2.0 else 1.0)

/// orig getEnergyDelta() — includes the energy-challenge softening branch.
let getEnergyDelta
    (energyChallengeResearched: bool)
    (energyChallengeActive: bool)
    (energyProd: float)
    (energyCons: float)
    : float =
    if energyCons = 0.0 then
        0.0
    else
        let mutable delta = energyProd / energyCons
        if delta < 0.25 then delta <- 0.25
        if energyChallengeResearched && not energyChallengeActive then
            delta <- 1.0 - (1.0 - delta) / 2.0
        delta

// ---------------------------------------------------------------------------
// resources-08: redshift fast-forward & limits (orig js/resources.js L843-890).

/// orig fastforward(daysOffset): pre-accrues perTickCached * days * ticksPerDay
/// with limits relaxed; returns the limits map for enforceLimits. ticksPerDay is
/// a calendar constant (10, js/calendar.js L217) — threaded as a parameter.
let fastforward (ticksPerDay: float) (daysOffset: float) (calendarDay: int) (pool: ResPool) : ResPool * Map<string, float> =
    let mutable limits = Map.empty<string, float>
    let mutable pool' = pool

    for name in pool.Order do
        let res = pool.ByName[name]

        if res.PerTickCached <> 0.0 && (name <> "catnip" || res.PerTickCached >= 0.0) then
            if res.MaxValue <> 0.0 then
                limits <- Map.add name (max res.Value res.MaxValue) limits

            let p, _ = addRes calendarDay (res.PerTickCached * daysOffset * ticksPerDay) true true name pool'
            pool' <- p

    pool', limits

/// orig enforceLimits(limits): re-clamp values after a relaxed fast-forward.
let enforceLimits (limits: Map<string, float>) (pool: ResPool) : ResPool =
    { pool with
        ByName =
            pool.ByName
            |> Map.map (fun name res ->
                if res.MaxValue <> 0.0 then
                    match Map.tryFind name limits with
                    | Some limit -> { res with Value = min res.Value limit }
                    | None -> res
                else
                    res) }

/// orig resConsHackForResTable(): tops up resources whose net conversion drains
/// them while gross production still covers it. Production/conversion seams are
/// game-10 slices (fresh: convertion 0 → branch never taken).
let resConsHackForResTable
    (calendarDay: int)
    (getConvertion: string -> float)
    (getRptWithConversion: string -> float)
    (pool: ResPool)
    : ResPool =
    if calendarDay >= 0 then
        let mutable pool' = pool
        for name in pool.Order do
            let res = pool'.ByName[name]
            if res.MaxValue <> 0.0 then
                let perTickConvertion = getConvertion name
                if perTickConvertion < 0.0
                   && getRptWithConversion name > 0.0
                   && res.MaxValue + perTickConvertion <= res.Value then
                    let res' = { res with Value = res.Value + -perTickConvertion }
                    pool' <- { pool' with ByName = pool'.ByName |> Map.add name res' }
        pool'
    else
        pool

// ---------------------------------------------------------------------------
// resources-09: price affordability & payment (orig js/resources.js L1037-1087).

/// orig hasRes(prices, amt) — JS quirk preserved: an unknown resource reads
/// `undefined < x` which is false, so the price check PASSES (loop continues).
let hasRes (pool: ResPool) (prices: (string * float) list) (amt: float) : bool =
    let amt' = if amt = 0.0 then 1.0 else amt
    prices
    |> List.forall (fun (name, val') ->
        match get pool name with
        | Some res -> not (res.Value < val' * amt')
        | None -> true)

/// workshop seam for isStorageLimited's craftable branch (fresh: nothing unlocked).
type CraftContext =
    { CraftUnlocked: string -> bool
      CraftIsLimited: string -> bool }

let freshCraftContext : CraftContext =
    { CraftUnlocked = fun _ -> false
      CraftIsLimited = fun _ -> false }

/// orig isStorageLimited(prices)
let isStorageLimited (craftCtx: CraftContext) (pool: ResPool) (prices: (string * float) list) : bool =
    let mutable found = false
    for (name, val') in prices do
        if not found then
            match get pool name with
            | Some res ->
                if val' = System.Double.PositiveInfinity
                   || (res.MaxValue > 0.0 && val' > res.MaxValue && val' > res.Value) then
                    found <- true
                elif res.Def.Craftable && val' > res.Value then
                    if craftCtx.CraftUnlocked name && craftCtx.CraftIsLimited name then
                        found <- true
            | None -> ()
    found

/// orig payPrices(prices): addResEvent(-val) per price, in order.
let payPrices (calendarDay: int) (pool: ResPool) (prices: (string * float) list) : ResPool =
    let mutable pool' = pool
    for (name, val') in prices do
        let p, _ = addResEvent calendarDay name (-val') pool'
        pool' <- p
    pool'

// ---------------------------------------------------------------------------
// resources-10: void & karma special math, cheat fill (orig L1089-1096, 1113).

/// orig getVoidQuantity(): -1..2+ at start, 0.5 on average — one RNG draw
/// (game.rand(n) = uniformRandomInteger(0, n)).
let getVoidQuantity (ctx: CapContext) (rand: unit -> float) (pool: ResPool) : float =
    uniformRandomInteger rand 0.0 (ctx.GetEffect("temporalParadoxVoid") + 4.0) - 1.0

/// orig getVoidQuantityStatistically(): median of the void distribution.
let getVoidQuantityStatistically (ctx: CapContext) : float =
    (ctx.GetEffect("temporalParadoxVoid") + 1.0) / 2.0

/// orig maxAll(): cheat fill to caps.
let maxAll (pool: ResPool) : ResPool =
    { pool with
        ByName =
            pool.ByName
            |> Map.map (fun _ res ->
                if res.MaxValue <> 0.0 && res.Value < res.MaxValue then
                    { res with Value = res.MaxValue }
                else
                    res) }

// ---------------------------------------------------------------------------
// resources-11a: persistence (orig resPool.save/load via core.js
// filterMetadata — fields kept unless undefined).

/// orig resPool.save(): filterMetadata(resources, ["name","value","unlocked",
/// "isHidden","isHiddenFromCrafting"]) — undefined fields dropped. isHidden/
/// isHiddenFromCrafting are settings-level (undefined at fresh).
let save (pool: ResPool) : (string * float * bool) list =
    pool.Order
    |> List.choose (fun name ->
        match get pool name with
        | Some res -> Some(name, res.Value, res.Unlocked)
        | None -> None)

/// orig resPool.load(): restore value/unlocked by name (perTickCached/maxValue
/// are recomputed by the pipeline, not saved).
let load (saved: (string * float * bool) list) (pool: ResPool) : ResPool =
    let mutable pool' = pool
    for (name, value, unlocked) in saved do
        match get pool' name with
        | Some res ->
            pool' <-
                { pool' with
                    ByName = pool'.ByName |> Map.add name { res with Value = value; Unlocked = unlocked } }
        | None -> ()
    pool'
