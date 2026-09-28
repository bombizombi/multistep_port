module Game.Production

// game-10a: calcResourcePerTick (orig game.js L3666-3837) — the authoritative
// per-tick production formula. Ported term-for-term in orig order (D003). Terms
// that read managers not yet ported (village/religion/buildings) are SEAMS with
// fresh-state values; every cache read is live via the effects cache (game-08),
// so the fresh-state path is fully exercised and verified. Later units replace
// seams with real lookups without touching this function's structure.

open Game.Types
open Game.Math
open Game.Effects
open Game.Calendar

type ProductionContext =
    { Cache: EffectsCache
      Calendar: CalendarState
      CalendarCtx: CalendarContext
      // seams (fresh values):
      SpaceManufacturingResearched: bool
      VillageResProduction: string -> float
      HGScalingBonus: float
      SteamworksOn: int
      SteamworksEffectGlobal: string -> float option
      ParagonProductionRatio: float
      WinterIsComingActive: bool
      CatnipPollutionRatio: float
      LeaderRank: int
      MagnetoOn: int
      SolarRevolutionRatio: float
      DisableCMBR: bool
      CMBRBonus: float
      VillageResConsumption: string -> float
      Kittens: int
      Happiness: float
      FreeKittens: int }

let freshProductionContext (cache: EffectsCache) (cal: CalendarState) (calCtx: CalendarContext) : ProductionContext =
    { Cache = cache
      Calendar = cal
      CalendarCtx = calCtx
      SpaceManufacturingResearched = false
      VillageResProduction = fun _ -> 0.0
      HGScalingBonus = 1.0
      SteamworksOn = 0
      SteamworksEffectGlobal = fun _ -> None
      ParagonProductionRatio = 0.0
      WinterIsComingActive = false
      CatnipPollutionRatio = 0.0
      LeaderRank = 0
      MagnetoOn = 0
      SolarRevolutionRatio = 0.0
      DisableCMBR = false
      CMBRBonus = 0.0
      VillageResConsumption = fun _ -> 0.0
      Kittens = 0
      Happiness = 1.0
      FreeKittens = 0 }

/// game.fixFloatPointNumber — strips floating-point dust below 1e-7.
let fixFloatPointNumber (number: float) : float =
    let adjusted = floor (number * 10000000.0) / 10000000.0
    let roundDiff = jsRound ((number - adjusted) * 10000000.0)
    if not (System.Double.IsNaN roundDiff) && roundDiff <> 0.0 then
        floor ((number + 0.000000000000010) * 10000000.0) / 10000000.0
    else
        adjusted

/// orig calcResourcePerTick(resName) — the full term chain in exact order.
/// The pool supplies the resource def (flags) and the sorrow value.
let calcResourcePerTick (ctx: ProductionContext) (pool: ResPool) (resName: string) : float =
    let def =
        match Game.Resources.get pool resName with
        | Some r -> r.Def
        | None ->
            { Name = resName; Category = ""; Visible = false; Color = None; Craftable = false;
              CalculatePerTick = true; Persists = false; AiCanDestroy = false; Transient = false;
              Tag = None; IsNotRefundable = false; CalculatePerDay = false; CalculatePerTickAndDay = false;
              CalculateOnYear = false; RefundableRule = Default }
    let eff = getEffect ctx.Cache

    // BUILDING PerTickBase
    let mutable perTick = eff (resName + "PerTickBase")

    // SPACE RATIO CALCULATION
    let spaceRatio = 1.0 + eff "spaceRatio"
    if ctx.SpaceManufacturingResearched && resName <> "uranium" then
        () // factory seam (buildings-01): spaceRatio *= 1 + factory.on * craftRatio * 0.75

    // +SPACE PerTickBase
    let perTickBaseSpace = eff (resName + "PerTickBaseSpace") * spaceRatio
    perTick <- perTick + perTickBaseSpace

    // *SEASON MODIFIERS
    perTick <- perTick * getWeatherMod ctx.CalendarCtx ctx.Calendar resName

    // +VILLAGE JOB PRODUCTION
    let resProduction0 = ctx.VillageResProduction resName

    // +HOLY GENOCIDE SCALING BONUS
    let resProduction = resProduction0 * ctx.HGScalingBonus
    perTick <- perTick + resProduction

    // +VILLAGE JOB PRODUCTION (UPGRADE EFFECTS JOBS)
    let workshopResRatio = eff (resName + "JobRatio")
    perTick <- perTick + resProduction * workshopResRatio

    // +*BEFORE PRODUCTION BOOST (UPGRADE EFFECTS GLOBAL)
    perTick <- perTick * (1.0 + eff (resName + "GlobalRatio"))

    // +*BUILDINGS AND SPACE PRODUCTION
    perTick <- perTick * (1.0 + eff (resName + "Ratio"))

    // +*RELIGION EFFECTS
    perTick <- perTick * (1.0 + eff (resName + "RatioReligion"))

    // +*AFTER PRODUCTION BOOST (UPGRADE EFFECTS SUPER)
    perTick <- perTick * (1.0 + eff (resName + "SuperRatio"))

    // +*AFTER PRODUCTION REDUCTION (STEAMWORKS HACK FOR COAL)
    if ctx.SteamworksOn > 0 then
        match ctx.SteamworksEffectGlobal (resName + "RatioGlobal") with
        | Some swEffectGlobal -> perTick <- perTick * (1.0 + swEffectGlobal)
        | None -> ()

    // *PARAGON BONUS
    let mutable paragonProductionRatio = ctx.ParagonProductionRatio
    if resName = "catnip" && ctx.WinterIsComingActive then
        paragonProductionRatio <- 0.0 // winter has come

    perTick <- perTick * (1.0 + paragonProductionRatio)

    // *POLLUTION MODIFIER
    if resName = "catnip" then
        perTick <- perTick * (1.0 + ctx.CatnipPollutionRatio)

    // ParagonSpaceProductionRatio definition 1/4
    let mutable paragonSpaceProductionRatio = 1.0 + paragonProductionRatio * 0.05

    // +BUILDING AUTOPROD
    let perTickAutoprod =
        eff (resName + "PerTickAutoprod")
        * paragonSpaceProductionRatio
        * (1.0 + eff "rankLeaderBonusConversion" * float ctx.LeaderRank)
    perTick <- perTick + perTickAutoprod

    // *MAGNETOS PRODUCTION BONUS
    if not def.Transient && ctx.MagnetoOn > 0 && resName <> "catnip" then
        // (steamworks swRatio seam: buildings-01)
        perTick <- perTick * (1.0 + eff "magnetoRatio")
        paragonSpaceProductionRatio <-
            paragonSpaceProductionRatio + paragonSpaceProductionRatio * eff "magnetoRatio"

    // +*REACTOR PRODUCTION BONUS
    if not def.Transient && resName <> "uranium" && resName <> "catnip" then
        perTick <- perTick * (1.0 + eff "productionRatio")
        paragonSpaceProductionRatio <- paragonSpaceProductionRatio + paragonSpaceProductionRatio * eff "productionRatio"

    // +*FAITH BONUS (solarRevolutionPollution: pollutionEffects seam, 0 at fresh)
    let solarPollution = 0.0
    perTick <- perTick * (1.0 + ctx.SolarRevolutionRatio * (1.0 + solarPollution))

    // +COSMIC RADIATION
    if not ctx.DisableCMBR && resName <> "coal" then
        perTick <- perTick * (1.0 + ctx.CMBRBonus)

    // ParagonSpaceProductionRatio definition 4/4
    paragonSpaceProductionRatio <- paragonSpaceProductionRatio * (1.0 + ctx.SolarRevolutionRatio)

    // +AUTOMATED PRODUCTION BUILDING
    perTick <- perTick + eff (resName + "PerTickProd")

    // +AUTOMATED PRODUCTION SPACE (FULL BONUS)
    perTick <-
        perTick
        + (eff (resName + "PerTickAutoprodSpace") * spaceRatio)
          * (1.0 + (paragonSpaceProductionRatio - 1.0) * eff "prodTransferBonus")

    // +AUTOMATED PRODUCTION SPACE (NOT FULL BONUS)
    perTick <- perTick + eff (resName + "PerTickSpace") * spaceRatio

    // CYCLE FESTIVAL EFFECTS (numeromancy seam: fresh-false → unchanged)

    // +BUILDING AND SPACE PerTick
    perTick <- perTick + eff (resName + "PerTick") * (1.0 + eff (resName + "PerTickRatio"))

    // -EARTH CONSUMPTION
    let mutable resConsumption = ctx.VillageResConsumption resName
    resConsumption <- resConsumption * (1.0 + eff (resName + "DemandRatio"))
    if resName = "catnip" && ctx.Kittens > 0 && ctx.Happiness > 1.0 then
        let hapinnessConsumption = max (ctx.Happiness * (1.0 + eff "hapinnessConsumptionRatio") - 1.0) 0.0
        // (anarchy challenge seam: fresh-false → else branch)
        resConsumption <-
            resConsumption
            + resConsumption * hapinnessConsumption * (1.0 + eff (resName + "DemandWorkerRatioGlobal"))
              * (1.0 - float ctx.FreeKittens / float ctx.Kittens)

    // necrocracy global effect (reads the sorrow resource value live)
    let sorrowValue =
        match Game.Resources.get pool "sorrow" with
        | Some s -> s.Value
        | None -> 0.0
    perTick <- perTick * (1.0 + (sorrowValue * eff "blsProductionBonus"))

    // pact Global Production Ratio
    perTick <- perTick * (1.0 + eff "pyramidGlobalProductionRatio")

    // pyramid faith ratio
    if resName = "faith" then
        perTick <- perTick * (1.0 + eff "pyramidFaithRatio")

    // policy ratio effects
    perTick <- perTick * (1.0 + eff (resName + "PolicyRatio"))

    perTick <- perTick + resConsumption

    if System.Double.IsNaN perTick then
        0.0
    else
        perTick
