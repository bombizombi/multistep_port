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

/// orig BuildingStackableBtnController.getPrices: val × priceRatio^count with
/// CostReduction effects folded via getLimitedDR(x, 1). Stage prices override
/// the def prices when present.
let getPrices (cache: Game.Effects.EffectsCache) (b: BuildingState) : Price list =
    let def = b.Def
    let stage = if def.Stages.Length > 0 then Some def.Stages.[b.Stage] else None
    let prices =
        match stage with
        | Some s when s.Prices.Length > 0 -> s.Prices
        | _ -> def.Prices
    let ratio = b.Def.PriceRatio |> Option.defaultValue 1.0

    let eff = Game.Effects.getEffect cache
    let pricesDiscount = getLimitedDR (eff (def.Name + "CostReduction")) 1.0
    let priceModifier = 1.0 - pricesDiscount

    prices
    |> List.map (fun p ->
        let resPriceDiscount = getLimitedDR (eff (p.Resource + "CostReduction")) 1.0
        let resPriceModifier = 1.0 - resPriceDiscount
        let resourcePriceRatio =
            match stage with
            | Some s when s.Prices.Length > 0 -> ratio // stage prices use def ratio (orig reads meta ratio)
            | _ -> ratio
        { Resource = p.Resource
          Val = p.Val * resourcePriceRatio ** float b.Val * resPriceModifier * priceModifier })

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

// --- buy (buildings-02/03) -----------------------------------------------------

/// orig build(): buy up to n while affordable; increments val (and on for
/// non-togglable). Returns how many were built.
let build (calendarDay: int) (cache: Game.Effects.EffectsCache) (pool: ResPool) (n: int) (name: string) (bpool: BldPool) : BldPool * ResPool * int =
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
        let prices = getPrices cache b
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
