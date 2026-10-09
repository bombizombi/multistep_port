module Game.Buildings

// buildings-02 (registry) + buildings-03 (prices) + buildings-04 (unlock eval)
// + buildings-06 (effects dispatch/aggregation provider) + buildings-08 (stages).
// Ported from js/buildings.js manager + core.js TabManager base.

open Game.Types
open Game.Math

// --- registry (buildings-02) -------------------------------------------------

type BldPool =
    { Order: string list
      ByName: Map<string, BuildingState> }

let init (defs: BuildingDef list) : BldPool =
    let byName =
        defs
        |> List.map (fun d ->
            d.Name,
            { Def = d
              Val = 0
              On = 0
              Unlocked = d.StartsUnlocked
              Unlockable = d.StartsUnlockable
              Stage = d.Stage })
        |> Map.ofList
    { Order = defs |> List.map (fun d -> d.Name); ByName = byName }

let get (pool: BldPool) (name: string) : BuildingState option = pool.ByName |> Map.tryFind name

/// orig isUnlockable(b): defaultUnlockable || unlockable flag.
let isUnlockable (b: BuildingState) : bool = b.Def.DefaultUnlockable || b.Unlockable

/// orig isUnlocked(b): unlockable AND every price has value >= price × unlockRatio.
let isUnlocked (pool: ResPool) (b: BuildingState) : bool =
    if not (isUnlockable b) then false
    else
        let def = b.Def
        let stage = if def.Stages.Length > 0 then Some def.Stages.[b.Stage] else None
        let prices, ratio =
            match stage with
            | Some s when s.Prices.Length > 0 -> s.Prices, s.UnlockRatio
            | _ -> def.Prices, def.UnlockRatio
        match ratio with
        | None -> true
        | Some ratio ->
            prices
            |> List.forall (fun p ->
                match Game.Resources.get pool p.Resource with
                | Some r -> r.Value >= p.Val * ratio
                | None -> false)

// --- prices (buildings-03) ---------------------------------------------------

/// Challenge-dependent pricing inputs (js/buildings.js getPrices + the
/// challenge priceRules specials). PriceRules mirrors meta.priceRules (static:
/// stasisPod; dynamic: calciner/blackSky, steamworks/pacifism, field/
/// postApocalypse — recomputed wherever orig runs calculateAllEffects).
type PricingContext =
    { PriceRules: Set<string>
      UnicornTearsActive: bool
      BlackSkyActive: bool
      PacifismActive: bool
      PostApocalypseActive: bool
      PacifismOn: int
      UsedCryochambers: int
      IronWill: bool
      PollutionLevel: float }

let freshPricing : PricingContext =
    { PriceRules = Set.ofList ["stasisPod"]
      UnicornTearsActive = false
      BlackSkyActive = false
      PacifismActive = false
      PostApocalypseActive = false
      PacifismOn = 0
      UsedCryochambers = 0
      IronWill = false
      PollutionLevel = 0.0 }

/// orig getPrices core: base × ratio^(val + fakeBought) with the meta- and
/// per-resource CostReduction LDR discounts, then the priceRules specials.
/// The temporary unicornTears/postApocalypse add-ons are appended by
/// getExtraPrices (paid on buy, never refunded).
let getPricesWith (cache: Game.Effects.EffectsCache) (pctx: PricingContext) (additionalBought: int) (b: BuildingState) : Price list =
    let def = b.Def
    let stage = if def.Stages.Length > 0 then Some def.Stages.[b.Stage] else None
    let prices =
        match stage with
        | Some s when s.Prices.Length > 0 -> s.Prices
        | _ -> def.Prices
    // staged buildings mutate meta.priceRatio to the active stage's ratio
    // (orig getPriceRatioWithAccessor reads bld.get("priceRatio"))
    let ratio =
        match stage with
        | Some s when s.Prices.Length > 0 -> s.PriceRatio |> Option.defaultValue 1.0
        | _ -> b.Def.PriceRatio |> Option.defaultValue 1.0

    let eff = Game.Effects.getEffect cache
    let pricesDiscount = getLimitedDR (eff (def.Name + "CostReduction")) 1.0
    let priceModifier = 1.0 - pricesDiscount
    let fakeBought = eff (def.Name + "FakeBought") + float additionalBought
    let valExp = float b.Val + fakeBought

    let baseLoop =
        prices
        |> List.map (fun p ->
            let resPriceDiscount = getLimitedDR (eff (p.Resource + "CostReduction")) 1.0
            let resPriceModifier = 1.0 - resPriceDiscount
            let resourcePriceRatio =
                match stage with
                | Some s when s.Prices.Length > 0 -> ratio // stage prices use def ratio (orig reads meta ratio)
                | _ -> ratio
            { Resource = p.Resource
              Val = p.Val * resourcePriceRatio ** valExp * resPriceModifier * priceModifier })

    let priceRulesBranch =
        // (stasisPod fewZebrasPrices deferred to the zebra slice — scenarios
        // never buy stasisPod; multPriceRatio has no catalog entries here)
        let baseP =
            prices
            |> List.map (fun p ->
                let resPriceDiscount = getLimitedDR (eff (p.Resource + "CostReduction")) 1.0
                let resPriceModifier = 1.0 - resPriceDiscount
                { Resource = p.Resource
                  Val = p.Val * ratio ** valExp * resPriceModifier * priceModifier })
        let baseP =
            if pctx.BlackSkyActive && def.Name = "calciner" && b.Val = 0 then
                baseP
                |> List.map (fun pr ->
                    if pr.Resource = "titanium" then { pr with Val = 0.0 } else { pr with Val = pr.Val * 11.0 })
            else baseP
        if pctx.PacifismActive && def.Name = "steamworks" && b.Val = 0 then
            baseP
            |> List.map (fun pr ->
                if pr.Resource = "blueprint" then { pr with Val = float (pctx.PacifismOn * 5 + 1) } else pr)
        else baseP

    let withRules = if pctx.PriceRules.Contains def.Name then priceRulesBranch else baseLoop

    let extra =
        if pctx.UnicornTearsActive && b.Val > 0 then
            let weight =
                let w = Game.Challenges.sumPricesWeighted (prices |> List.map (fun p -> (p.Resource, p.Val)))
                if w > 0.0 then w * (eff "bonfireTearsPriceRatioChallenge") ** float (b.Val - 1) else w
            if weight > 1e9 then [ 1 ] // alicorn
            elif weight > 100000.0 then [ 1 ] // tears
            elif weight >= 100.0 then [ 1 ] // unicorns
            else []
        elif pctx.PostApocalypseActive && def.Name = "field"
             && pctx.PollutionLevel >= 5.0
             && float b.Val >= max (95.0 - float pctx.UsedCryochambers - pctx.PollutionLevel) (7.0 + (if pctx.IronWill then 8.0 else 0.0)) then [ 1 ]
        else []

    withRules

/// Temporary (paid on buy, never refunded) add-on prices.
let getExtraPrices (cache: Game.Effects.EffectsCache) (pctx: PricingContext) (b: BuildingState) : Price list =
    let def = b.Def
    let stage = if def.Stages.Length > 0 then Some def.Stages.[b.Stage] else None
    let prices =
        match stage with
        | Some s when s.Prices.Length > 0 -> s.Prices
        | _ -> def.Prices
    let eff = Game.Effects.getEffect cache
    let pricesDiscount = getLimitedDR (eff (def.Name + "CostReduction")) 1.0
    let priceModifier = 1.0 - pricesDiscount
    if pctx.UnicornTearsActive && b.Val > 0 then
        let weight =
            let w = Game.Challenges.sumPricesWeighted (prices |> List.map (fun p -> (p.Resource, p.Val)))
            if w > 0.0 then w * (eff "bonfireTearsPriceRatioChallenge") ** float (b.Val - 1) else w
        if weight > 1e9 then
            [ { Resource = "alicorn"; Val = (System.Math.Log weight - 19.7232) * priceModifier } ]
        elif weight > 100000.0 then
            [ { Resource = "tears"; Val = weight / 100000.0 * priceModifier } ]
        elif weight >= 100.0 then
            [ { Resource = "unicorns"; Val = weight / 100.0 * priceModifier } ]
        else []
    elif pctx.PostApocalypseActive && def.Name = "field"
         && pctx.PollutionLevel >= 5.0
         && float b.Val >= max (95.0 - float pctx.UsedCryochambers - pctx.PollutionLevel) (7.0 + (if pctx.IronWill then 8.0 else 0.0)) then
        let builtWithUnobtainium = max (float (b.Val + pctx.UsedCryochambers) - 100.0) 0.0
        [ { Resource = "unobtainium"; Val = 15.0 * (b.Def.PriceRatio |> Option.defaultValue 1.0) ** builtWithUnobtainium } ]
    else []

/// Normal (refundable) ladder with the priceRules specials.
let getPrices (cache: Game.Effects.EffectsCache) (pctx: PricingContext) (b: BuildingState) : Price list =
    let def = b.Def
    let stage = if def.Stages.Length > 0 then Some def.Stages.[b.Stage] else None
    let prices =
        match stage with
        | Some s when s.Prices.Length > 0 -> s.Prices
        | _ -> def.Prices
    // staged buildings mutate meta.priceRatio to the active stage ratio
    // (orig getPriceRatioWithAccessor reads bld.get("priceRatio"))
    let ratio =
        match stage with
        | Some s when s.Prices.Length > 0 -> s.PriceRatio |> Option.defaultValue 1.0
        | _ -> b.Def.PriceRatio |> Option.defaultValue 1.0

    let eff = Game.Effects.getEffect cache
    let pricesDiscount = getLimitedDR (eff (def.Name + "CostReduction")) 1.0
    let priceModifier = 1.0 - pricesDiscount
    let fakeBought = eff (def.Name + "FakeBought")
    let valExp = float b.Val + fakeBought

    let baseLoop =
        prices
        |> List.map (fun p ->
            let resPriceDiscount = getLimitedDR (eff (p.Resource + "CostReduction")) 1.0
            let resPriceModifier = 1.0 - resPriceDiscount
            let resourcePriceRatio =
                match stage with
                | Some s when s.Prices.Length > 0 -> ratio
                | _ -> ratio
            { Resource = p.Resource
              Val = p.Val * resourcePriceRatio ** valExp * resPriceModifier * priceModifier })

    let priceRulesBranch =
        let baseP =
            prices
            |> List.map (fun p ->
                let resPriceDiscount = getLimitedDR (eff (p.Resource + "CostReduction")) 1.0
                let resPriceModifier = 1.0 - resPriceDiscount
                { Resource = p.Resource
                  Val = p.Val * ratio ** valExp * resPriceModifier * priceModifier })
        let baseP =
            if pctx.BlackSkyActive && def.Name = "calciner" && b.Val = 0 then
                baseP
                |> List.map (fun pr ->
                    if pr.Resource = "titanium" then { pr with Val = 0.0 } else { pr with Val = pr.Val * 11.0 })
            else baseP
        if pctx.PacifismActive && def.Name = "steamworks" && b.Val = 0 then
            baseP
            |> List.map (fun pr ->
                if pr.Resource = "blueprint" then { pr with Val = float (pctx.PacifismOn * 5 + 1) } else pr)
        else baseP

    if pctx.PriceRules.Contains def.Name then priceRulesBranch else baseLoop

/// Combined affordability view (orig hasResources over the full price list).
let getAllPrices (cache: Game.Effects.EffectsCache) (pctx: PricingContext) (b: BuildingState) : Price list =
    getPrices cache pctx b @ getExtraPrices cache pctx b

// --- provider (buildings-06) --------------------------------------------------

/// orig buildings provider getEffect (js/buildings.js L144-175): Max-suffixed
/// effects (except library) and biolab Ratios scale with VAL; everything else
/// with ON; coalRatioGlobal raw. Stageable buildings read the active stage table.
let providerEffect (b: BuildingState) (effectName: string) : float =
    let def = b.Def
    let stageTable =
        if def.Stages.Length > 0 then
            let idx = min b.Stage (def.Stages.Length - 1)
            Some def.Stages.[idx].Effects
        else
            None
    let effectValue =
        match stageTable with
        | Some st ->
            if not st.IsEmpty then st |> Map.tryFind effectName |> Option.defaultValue 0.0
            else def.Effects |> Map.tryFind effectName |> Option.defaultValue 0.0
        | None -> def.Effects |> Map.tryFind effectName |> Option.defaultValue 0.0

    if effectName = "coalRatioGlobal" then effectValue
    elif (effectName.EndsWith("Max") && def.Name <> "library")
         || (def.Name = "biolab" && effectName.EndsWith("Ratio")) then
        effectValue * float b.Val
    else
        effectValue * float b.On

/// orig mutates building meta effects in place (updateEffects actions);
/// the fs mirror replaces the Def's static effects with a dynamic table per
/// BuildingState. Kept immutable here — callers thread the new pool.
let setEffects (bpool: BldPool) (name: string) (f: Map<string, float> -> Map<string, float>) : BldPool =
    let b = bpool.ByName[name]
    let def' = { b.Def with Effects = f b.Def.Effects }
    { bpool with ByName = bpool.ByName |> Map.add name { b with Def = def' } }

// --- game-19: bld build undo (sellInternal at 50% refund, core.js L1949-1972) --

/// Sell ONE unit back at the CURRENT ladder: decrement val/on, recompute the
/// price ladder at the new val, refund prices × refundPercentage (0.5) for
/// refundable resources. Returns updated pools + whether the sale happened.
let sellOne
    (calendarDay: int)
    (cache: Game.Effects.EffectsCache)
    (pctx: PricingContext)
    (pool: ResPool)
    (name: string)
    (refundPercentage: float)
    (bpool: BldPool)
    : BldPool * ResPool * bool =
    match get bpool name with
    | None -> bpool, pool, false
    | Some b when b.Val <= 0 -> bpool, pool, false
    | Some b ->
        let b' = { b with Val = b.Val - 1; On = if b.On > b.Val - 1 then b.Val - 1 else b.On }
        let bpool' = { bpool with ByName = bpool.ByName |> Map.add name b' }
        let prices = getPrices cache pctx b' // ladder at the post-decrement val (temporary add-ons never refund)
        let mutable pool' = pool
        for p in prices do
            let refundable =
                match Game.Resources.get pool' p.Resource with
                | Some r -> not r.Def.IsNotRefundable
                | None -> false
            if refundable then
                let pool2, _ = Game.Resources.addResEvent calendarDay p.Resource (p.Val * refundPercentage) pool'
                pool' <- pool2
        bpool', pool', true

// --- buy (buildings-02/03) -----------------------------------------------------

/// orig build(): buy up to n while affordable; increments val (and on for
/// non-togglable). Returns how many were built.
let build (calendarDay: int) (cache: Game.Effects.EffectsCache) (pctx: PricingContext) (pool: ResPool) (n: int) (name: string) (bpool: BldPool) : BldPool * ResPool * int =
    let mutable bpool = bpool
    let mutable b = bpool.ByName[name]
    let mutable pool = pool
    let mutable built = 0

    // limitBuild clamp
    let mutable maxBld = n
    match b.Def.LimitBuild with
    | Some limit when float limit - float b.Val < float maxBld -> maxBld <- int (float limit - float b.Val)
    | _ -> ()

    let mutable afford = true
    while built < maxBld && afford do
        // orig pays model.prices (incl. the temporary unicornTears/postApocalypse lines)
        let prices = getAllPrices cache pctx b
        if Game.Resources.hasRes pool (prices |> List.map (fun p -> (p.Resource, p.Val))) 0.0 then
            let poolPaid = Game.Resources.payPrices calendarDay pool (prices |> List.map (fun p -> (p.Resource, p.Val)))
            pool <- poolPaid
            let b' = { b with Val = b.Val + 1; On = if b.Def.TogglableOnOff then b.On else b.On + 1 }
            b <- b'
            built <- built + 1
        else
            afford <- false

    if built > 0 then
        // unlockScheme check (orig: val >= threshold → ui.unlockScheme; state-safe
        // subset: scheme effects land with buildings-04's fan-out verification)
        ()
    bpool <- { bpool with ByName = bpool.ByName |> Map.add name b }
    bpool, pool, built

// --- stage data accessor (buildings-08) ---------------------------------------

let activeEffects (b: BuildingState) : Map<string, float> =
    if b.Def.Stages.Length > 0 then
        let idx = min b.Stage (b.Def.Stages.Length - 1)
        let st = b.Def.Stages.[idx]
        if not st.Effects.IsEmpty then st.Effects else b.Def.Effects
    else
        b.Def.Effects

// --- per-tick unlock evaluation (orig bld.update, js/buildings.js L2787) ------

/// orig bld.update(): flip `unlocked` per-tick from the unlockRatio rule
/// (isUnlockable + every price at unlockRatio coverage); un-flip if patched off.
let update (pool: ResPool) (bpool: BldPool) : BldPool =
    let mutable bpool = bpool
    for name in bpool.Order do
        let b = bpool.ByName[name]
        if not b.Unlocked then
            if isUnlocked pool b then
                bpool <- { bpool with ByName = bpool.ByName |> Map.add name { b with Unlocked = true } }
        elif not (isUnlockable b) then
            bpool <- { bpool with ByName = bpool.ByName |> Map.add name { b with Unlocked = false } }
    bpool
