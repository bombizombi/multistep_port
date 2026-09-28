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
              MaxValue = 0.0 })
        |> Map.ofList
    { Order = defs |> List.map (fun d -> d.Name)
      ByName = byName
      KarmaKittens = 0 }

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
/// prestige-01, challenges, workshop). Fresh-state values are verified against
/// the golden fixtures; the fields are replaced by real lookups unit by unit.
type CapContext =
    { GetEffect: string -> float // fresh: Game.Catalog.BaseEffects.getEffect
      ParagonStorageRatio: float // prestige (0.0 fresh)
      CMBRBonus: float // game.getCMBRBonus() result (0.0 fresh: isCMBREnabled=false)
      UnicornTearsActive: bool // challenges (false fresh)
      SilosResearched: bool // workshop (false fresh)
      KarmaZebras: int } // game.karmaZebras (0 fresh)

let baseEffectsCapContext : CapContext =
    { GetEffect = Game.Catalog.BaseEffects.getEffect
      ParagonStorageRatio = 0.0
      CMBRBonus = 0.0
      UnicornTearsActive = false
      SilosResearched = false
      KarmaZebras = 0 }

/// State BEFORE the first tick: orig's global effects cache is empty until
/// updateCaches() runs (game-08), so getEffect returns 0 for everything —
/// verified against orig via the unit-res-caps scenario (only sorrow/zebras
/// get non-zero caps there, and neither needs effects).
let zeroCapContext : CapContext =
    { GetEffect = fun _ -> 0.0
      ParagonStorageRatio = 0.0
      CMBRBonus = 0.0
      UnicornTearsActive = false
      SilosResearched = false
      KarmaZebras = 0 }

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
