module Game.Time

// time-01/02 + void-01: TimeManager state (flux/heat/accelerated + CFU/VSU
// metas), temporal flux gain, per-tick acceleration drain; VoidManager with
// the spaceCathedral upgrade. Sources: js/time.js L1-158, js/void.js L1-44.
// time-05/03/04/07/09 (this file's later half): CFU behavior defs
// (calculateEffects/updateEffects/action), the heat engine, the stackable
// price ladder + buy/sell loops, and the manual shatter heat split. The
// shatter year loop and applyRedshift fan-out live in the runner (they touch
// every pool); the queue (time-14+) and shatterInGroupCycles (time-08) are
// later slices.

open Game.Types

type TimeMeta =
    { Val: int
      On: int
      Unlocked: bool
      Researched: bool
      Heat: float // blastFurnace furnace charge (cfu.heat)
      DelayTicks: int // controlledDelay.delayTicks
      IsAutomationEnabled: bool option // JS tri-state: null/true/false
      Eff: Map<string, float> // dynamic effects table (calculate/updateEffects)
      PriceRatioDyn: float } // temporalPress mutates its own priceRatio

type TimePool =
    { Flux: float // years skipped by CF jumps (time.js flux)
      Heat: float
      IsAccelerated: bool
      TestShatter: int // 0 = shatter, 1 = shatterInGroupCycles (time-08)
      CFUs: Map<string, TimeMeta>
      CfuOrder: string list
      VSUs: Map<string, TimeMeta>
      VsuOrder: string list }

let private defEffects (name: string) : Map<string, float> =
    (Game.Catalog.World.cfuDefs |> List.find (fun d -> d.Name = name)).Effects

let private vsuDefEffects (name: string) : Map<string, float> =
    (Game.Catalog.World.vsuDefs |> List.find (fun d -> d.Name = name)).Effects

let private mkMeta (startUnlocked: bool) : TimeMeta =
    { Val = 0
      On = 0
      Unlocked = startUnlocked
      Researched = false
      Heat = 0.0
      DelayTicks = 0
      IsAutomationEnabled = None
      Eff = Map.empty
      PriceRatioDyn = 0.0 }

let init () : TimePool =
    let mk (d: Game.Catalog.World.CFUDef) =
        { Val = 0
          On = 0
          Unlocked = d.StartsUnlocked
          Researched = false
          Heat = 0.0
          DelayTicks = 0
          // core.js resetStateStackable nulls every DECLARED automation field
          IsAutomationEnabled = None
          Eff = d.Effects
          PriceRatioDyn = d.PriceRatio }
    { Flux = 0.0
      Heat = 0.0
      IsAccelerated = false
      TestShatter = 0
      CFUs = Game.Catalog.World.cfuDefs |> List.map (fun d -> (d.Name, mk d)) |> Map.ofList
      CfuOrder = Game.Catalog.World.cfuDefs |> List.map (fun d -> d.Name)
      VSUs =
        Game.Catalog.World.vsuDefs
        |> List.map (fun d ->
            (d.Name, { (mkMeta false) with Eff = d.Effects }))
        |> Map.ofList
      VsuOrder = Game.Catalog.World.vsuDefs |> List.map (fun d -> d.Name) }

let resetState (_tp: TimePool) : TimePool = init ()

let getCFU (tp: TimePool) (name: string) : TimeMeta = tp.CFUs.[name]
let getVSU (tp: TimePool) (name: string) : TimeMeta = tp.VSUs.[name]

let updateCfu (tp: TimePool) (name: string) (f: TimeMeta -> TimeMeta) : TimePool =
    { tp with CFUs = tp.CFUs |> Map.add name (f tp.CFUs.[name]) }

/// Everything the CFU behavior defs read outside the time pool.
/// Mirrors the free variables of time.js calculateEffects/updateEffects.
type TimeCalcContext =
    { GetEffect: string -> float
      Years1000On: int // challenges.getChallenge("1000Years").on
      BlazarVal: int // religion.getTU("blazar").val
      YearsPerCycle: int } // calendar.yearsPerCycle = 5

/// One meta's calculateEffects XOR updateEffects (game.upgrade semantics:
/// exactly one of the two runs per meta). Callers fan out via UpgradesCFU.
let cfuCalculate (ctx: TimeCalcContext) (name: string) (tp: TimePool) : TimePool =
    match name with
    | "blastFurnace" ->
        // calculateEffects: heatMax = 100 + heatMaxExpansion
        updateCfu tp name (fun m ->
            { m with Eff = m.Eff |> Map.add "heatMax" (100.0 + ctx.GetEffect "heatMaxExpansion") })
    | "controlledDelay" ->
        // calculateEffects: force non-null automation
        updateCfu tp name (fun m ->
            { m with IsAutomationEnabled = Some(match m.IsAutomationEnabled with None -> false | Some v -> v) })
    | "temporalAccelerator" ->
        // calculateEffects (strict null check) + testShatter sync
        let acc = tp.CFUs.[name]
        let auto =
            match acc.IsAutomationEnabled with
            | None -> Some(tp.TestShatter = 1)
            | Some v -> Some v
        let tp = updateCfu tp name (fun m -> { m with IsAutomationEnabled = auto })
        { tp with TestShatter = if auto = Some true then 1 else 0 }
    | "temporalImpedance" ->
        // calculateEffects: round(1000 × (1 + timeRatio))
        updateCfu tp name (fun m ->
            { m with
                Eff = m.Eff |> Map.add "timeImpedance" (Game.Math.jsRound (1000.0 * (1.0 + ctx.GetEffect "timeRatio")) |> float) })
    | "temporalPress" ->
        // calculateEffects: automation gate, shatterYearBoost, dynamic priceRatio
        let press = tp.CFUs.[name]
        let pressAuto =
            if ctx.Years1000On > 1 || ctx.BlazarVal > 2 then
                Some(match press.IsAutomationEnabled with None -> false | Some v -> v)
            else
                None // reset to null — completing <2 runs revokes the automation feature
        let yearsPerCycle = float ctx.YearsPerCycle
        updateCfu tp name (fun m ->
            { m with
                IsAutomationEnabled = pressAuto
                Eff =
                  m.Eff
                  |> Map.add "shatterYearBoost" (if pressAuto = Some true then 5.0 * yearsPerCycle else yearsPerCycle)
                PriceRatioDyn = max 1.01 (1.1 - float ctx.Years1000On * 0.001) })
    | "timeBoiler" ->
        // updateEffects (non-proportional table; timeBoiler has no calculateEffects)
        updateCfu tp name (fun m ->
            { m with
                Eff =
                  m.Eff
                  |> Map.add "heatMaxExpansion" (10.0 * float m.On)
                  |> Map.add "energyConsumption" (float m.On) })
    | _ -> tp

/// Everything the per-tick time.update reads beyond the pools. Shatter is the
/// runner orchestration (time-07): furnace automation + manual paths land there.
type TimeUpdateContext =
    { GetEffect: string -> float
      Shatter: int -> unit
      GetTpool: unit -> TimePool // single source of truth: shatterCore mutates
      SetTpool: TimePool -> unit } // the same cell the furnace actions write

/// orig gainTemporalFlux (L106-131): calendar tech gate; delta ms from the
/// harness clock; 5 flux/minute × (1 + accelerator timeRatio × val).
let gainTemporalFlux (tp: TimePool) (calendarResearched: bool) (nowMs: float) (timestampMs: float) (ticksPerSecond: float) (pool: ResPool) : TimePool * ResPool =
    if not calendarResearched then
        tp, pool
    else
        let delta = nowMs - timestampMs
        if delta <= 0.0 then
            tp, pool
        else
            let accelerator = tp.CFUs.["temporalAccelerator"]
            let timeRatio = defEffects "temporalAccelerator" |> Map.tryFind "timeRatio" |> Option.defaultValue 0.0
            let energyRatio = 1.0 + float accelerator.Val * timeRatio
            let gained = Game.Math.jsRound (delta / (60.0 * 1000.0) * (ticksPerSecond * energyRatio))
            let pool', added = Game.Resources.addResEvent 0 "temporalFlux" (float gained) pool
            tp, pool'

/// orig time.update (L152-178): flux burn, heat transfer into the blast
/// furnace, then every CFU with an .action — blastFurnace (delay gate,
/// automation shatter at 100 heat, cap 5 or shatterYearBoost) and timeBoiler
/// (updateEffects). calculateRedshift is a no-op here (opts.enableRedshift is
/// false; the timestamp bookkeeping keeps gainTemporalFlux semantics).
/// The pool travels in a ref: ctx.Shatter (the runner's shatterCore) mutates
/// the same TimePool instance mid-update (flux/testShatter/CFU unlocks), so a
/// by-value copy would clobber it on return.
let update (ctx: TimeUpdateContext) (pool: ResPool) : ResPool =
    let mutable pool = pool
    let mutable tp = ctx.GetTpool ()
    let commit () = ctx.SetTpool tp
    let fluxValue = Game.Resources.get pool "temporalFlux" |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0

    if tp.IsAccelerated && fluxValue > 0.0 then
        let pool', _ = Game.Resources.addResEvent 0 "temporalFlux" -1.0 pool
        pool <- pool'
    if fluxValue = 0.0 && tp.IsAccelerated then
        tp <- { tp with IsAccelerated = false }
        commit ()

    // spare chronoheat dissipates into the furnace at heatPerTick × (1+heatEfficiency)
    if tp.Heat > 0.0 then
        let perTick = min (ctx.GetEffect "heatPerTick") tp.Heat
        let efficiency = 1.0 + ctx.GetEffect "heatEfficiency"
        tp <- updateCfu tp "blastFurnace" (fun m -> { m with Heat = m.Heat + perTick * efficiency })
        tp <- { tp with Heat = max 0.0 (tp.Heat - perTick) }
        commit ()

    // CFU action loop (blastFurnace → timeBoiler, def order). The pool is
    // reloaded after ctx.Shatter: it rewrites flux/CFUs through the context.
    for name in (ctx.GetTpool ()).CfuOrder do
        if name = "blastFurnace" || name = "timeBoiler" then
            tp <- ctx.GetTpool ()
            if name = "blastFurnace" then
                tp <-
                    updateCfu tp "blastFurnace" (fun m ->
                        { m with
                            Eff = m.Eff |> Map.add "heatMax" (100.0 + ctx.GetEffect "heatMaxExpansion")
                            IsAutomationEnabled =
                              (match m.IsAutomationEnabled with
                               | None -> Some false
                               | Some v -> Some v)
                            On = if m.On < m.Val then m.Val else m.On })
                commit () // action head mutations persist even when no shatter fires
                let furnace = tp.CFUs.["blastFurnace"]
                let delay = tp.CFUs.["controlledDelay"]
                if delay.DelayTicks > 0 then
                    // timer counts down even when automation is paused (not Tempus-Fugit affected)
                    tp <- updateCfu tp "controlledDelay" (fun m -> { m with DelayTicks = m.DelayTicks - 1 })
                    commit ()
                elif furnace.On <> 0 && furnace.IsAutomationEnabled = Some true && furnace.Heat >= 100.0 then
                    let mutable limit = 5.0
                    let press = tp.CFUs.["temporalPress"]
                    if press.IsAutomationEnabled = Some true && tp.TestShatter = 1 then
                        limit <- max limit (ctx.GetEffect "shatterYearBoost")
                    let mutable amt = floor (furnace.Heat / 100.0)
                    if amt > limit then amt <- limit
                    tp <- updateCfu tp "blastFurnace" (fun m -> { m with Heat = m.Heat - 100.0 * amt })
                    tp <- updateCfu tp "controlledDelay" (fun m -> { m with DelayTicks = m.On })
                    commit ()
                    ctx.Shatter (int amt)
            else
                // timeBoiler.action → updateEffects (non-proportional table)
                tp <-
                    updateCfu tp "timeBoiler" (fun m ->
                        { m with
                            Eff =
                              m.Eff
                              |> Map.add "heatMaxExpansion" (10.0 * float m.On)
                              |> Map.add "energyConsumption" (float m.On) })
                commit ()

    pool
/// orig time.js CFU provider (L26-32): CFU effects count only with the
/// chronoforge workshop tech researched; else ×on (stackable) raw. Reads the
/// DYNAMIC effects tables (calculate/updateEffects mutated them).
let timeGroup (tp: TimePool) (chronoforgeResearched: bool) : Game.Effects.ManagerGroup =
    let vsuEffects (name: string) =
        (Game.Catalog.World.vsuDefs |> List.find (fun d -> d.Name = name)).Effects
    // timeBase (heatPerTick/heatMax/temporalFluxMax) rides in the shared
    // baseEffects table (BaseEffects.baseEffects) — Base stays empty here
    { Base = Map.empty
      Items =
        (tp.CfuOrder
         |> List.choose (fun n ->
             let m = tp.CFUs.[n]
             if m.On > 0 && chronoforgeResearched then
                 Some(m.Eff, (fun _ v -> v * float m.On))
             else None))
        @ (tp.VsuOrder
           |> List.choose (fun n ->
               let m = tp.VSUs.[n]
               if m.On > 0 then
                   Some(vsuEffects n, (fun _ v -> v * float m.On))
               else None)) }

// --- time-05/09: stackable price ladder + buy/sell loops (core.js L2145-2410) --

let cfuDef (name: string) : Game.Catalog.World.CFUDef =
    Game.Catalog.World.cfuDefs |> List.find (fun d -> d.Name = name)

/// BuildingStackableBtnController.getPrices: base × ratio^val with the
/// meta-level and per-resource CostReduction LDR discounts.
let cfuPrices (tp: TimePool) (getEffect: string -> float) (name: string) : (string * float) list =
    let def = cfuDef name
    let meta = tp.CFUs.[name]
    let ratio = meta.PriceRatioDyn
    let pricesDiscount = Game.Math.getLimitedDR (getEffect (def.Name + "CostReduction")) 1.0
    let priceModifier = 1.0 - pricesDiscount
    def.Prices
    |> List.map (fun p ->
        let resPriceDiscount = Game.Math.getLimitedDR (getEffect (p.Resource + "CostReduction")) 1.0
        let resPriceModifier = 1.0 - resPriceDiscount
        (p.Resource, p.Val * ratio ** float meta.Val * resPriceModifier * priceModifier))

let cfuHasRes (pool: ResPool) (prices: (string * float) list) : bool =
    prices
    |> List.forall (fun (resName, val') ->
        match Game.Resources.get pool resName with
        | Some r -> r.Value >= val'
        | None -> false)

let cfuEnabled (tp: TimePool) (name: string) : bool =
    // updateEnabled: limitBuild cap is the only CFU-specific disable
    let def = cfuDef name
    let meta = tp.CFUs.[name]
    match def.LimitBuild with
    | Some lb when lb <= meta.Val -> false
    | _ -> true

/// ChronoforgeBtnController.build(model, maxBld) loop: incrementValue +
/// payPrice while affordable. Returns the pool, the updated time pool and the
/// counter.
let buyCFU (getEffect: string -> float) (calendarDay: int) (name: string) (maxBld: int) (tp: TimePool) (pool: ResPool) : TimePool * ResPool * int =
    let mutable tp = tp
    let mutable pool = pool
    let mutable counter = 0
    let mutable maxBld = maxBld
    let def = cfuDef name
    // limitBuild caps the batch (build() head)
    match def.LimitBuild with
    | Some lb when lb - tp.CFUs.[name].Val < maxBld -> maxBld <- lb - tp.CFUs.[name].Val
    | _ -> ()
    let affordable () =
        let prices = cfuPrices tp getEffect name
        cfuHasRes pool prices
    // orig loop: hasResources(cached prices) → incrementValue → payPrice(cached)
    // → re-cache prices at the new val. The first unit pays the val-0 price.
    let mutable prices = cfuPrices tp getEffect name
    while maxBld > 0 && cfuHasRes pool prices do
        tp <-
            updateCfu tp name (fun m ->
                { m with
                    Val = m.Val + 1
                    On = m.On + 1 })
        for resName, val' in prices do
            let pool1, _ = Game.Resources.addResEvent calendarDay resName (-val') pool
            pool <- pool1
        counter <- counter + 1
        maxBld <- maxBld - 1
        prices <- cfuPrices tp getEffect name
    tp, pool, counter

/// time.undo buildCFU: sellInternal(model, val - data.val, false) with
/// refundPercentage 1.0 — decrement then refund the ladder at the new val.
/// isRefundable defaults true (no CFU price lands on antimatter/karma seams).
let sellCFU (getEffect: string -> float) (calendarDay: int) (name: string) (endVal: int) (tp: TimePool) (pool: ResPool) : TimePool * ResPool * int =
    let mutable tp = tp
    let mutable pool = pool
    let mutable counter = 0
    while tp.CFUs.[name].Val > endVal do
        tp <-
            updateCfu tp name (fun m ->
                { m with
                    Val = m.Val - 1
                    On = if m.On > m.Val - 1 then m.Val - 1 else m.On })
        let prices = cfuPrices tp getEffect name
        for resName, val' in prices do
            let pool1, _ = Game.Resources.addResEvent calendarDay resName val' pool
            pool <- pool1
        counter <- counter + 1
    tp, pool, counter

/// time.unlockAll (dev helper): every CFU unlocked.
let unlockAll (tp: TimePool) : TimePool =
    { tp with
        CFUs = tp.CFUs |> Map.map (fun _ m -> { m with Unlocked = true }) }

// --- time-06: voidspace purchase + calculateEffects ----------------------------

let vsuDef (name: string) : Game.Catalog.World.VSUDef =
    Game.Catalog.World.vsuDefs |> List.find (fun d -> d.Name = name)

/// VoidSpaceBtnController.getPrices: stackable ladder; cryochambers takes the
/// karma discount 1 − LDR(0.01 × burnedParagonRatio, 1).
let vsuPrices (tp: TimePool) (burnedParagonRatio: float) (name: string) : (string * float) list =
    let def = vsuDef name
    let meta = tp.VSUs.[name]
    let ratio = def.PriceRatio |> Option.defaultValue 1.0
    def.Prices
    |> List.map (fun p ->
        let v = p.Val * ratio ** float meta.Val
        if name = "cryochambers" && p.Resource = "karma" then
            (p.Resource, v - v * Game.Math.getLimitedDR (0.01 * burnedParagonRatio) 1.0)
        else (p.Resource, v))

/// VoidSpaceBtnController.build(model, maxBld) loop (same pay-cache-recompute
/// order as the CFU ladder).
let buyVSU (calendarDay: int) (name: string) (maxBld: int) (burnedParagonRatio: float) (tp: TimePool) (pool: ResPool) : TimePool * ResPool * int =
    let mutable tp = tp
    let mutable pool = pool
    let mutable counter = 0
    let mutable maxBld = maxBld
    let mutable prices = vsuPrices tp burnedParagonRatio name
    while maxBld > 0 && cfuHasRes pool prices do
        tp <-
            { tp with
                VSUs =
                    tp.VSUs
                    |> Map.add name { tp.VSUs.[name] with Val = tp.VSUs.[name].Val + 1; On = tp.VSUs.[name].On + 1 } }
        for resName, val' in prices do
            let pool1, _ = Game.Resources.addResEvent calendarDay resName (-val') pool
            pool <- pool1
        counter <- counter + 1
        maxBld <- maxBld - 1
        prices <- vsuPrices tp burnedParagonRatio name
    tp, pool, counter

/// time.undo buildVSU: full-refund sellInternal at the re-derived ladder.
let sellVSU (calendarDay: int) (name: string) (endVal: int) (burnedParagonRatio: float) (tp: TimePool) (pool: ResPool) : TimePool * ResPool * int =
    let mutable tp = tp
    let mutable pool = pool
    let mutable counter = 0
    while tp.VSUs.[name].Val > endVal do
        tp <-
            { tp with
                VSUs =
                    tp.VSUs
                    |> Map.add name
                        { tp.VSUs.[name] with
                            Val = tp.VSUs.[name].Val - 1
                            On = if tp.VSUs.[name].On > tp.VSUs.[name].Val - 1 then tp.VSUs.[name].Val - 1 else tp.VSUs.[name].On } }
        let prices = vsuPrices tp burnedParagonRatio name
        for resName, val' in prices do
            let pool1, _ = Game.Resources.addResEvent calendarDay resName val' pool
            pool <- pool1
        counter <- counter + 1
    tp, pool, counter

/// VSU calculateEffects (calculateAllEffects voidSpace pass).
/// cryochambers: limitBuild = chronosphere.on + cryochamberSupport; on =
/// min(val, limitBuild). chronocontrol: temporalParadoxDay = 1 + bonus.
let vsuCalculate (tp: TimePool) (chronosphereOn: int) (getEffect: string -> float) : TimePool =
    let cryo = tp.VSUs.["cryochambers"]
    let limitBuild = chronosphereOn + int (getEffect "cryochamberSupport")
    let tp =
        { tp with
            VSUs =
                tp.VSUs
                |> Map.add "cryochambers"
                    { cryo with On = min cryo.Val limitBuild } }
    let ctrl = tp.VSUs.["chronocontrol"]
    { tp with
        VSUs =
            tp.VSUs
            |> Map.add "chronocontrol"
                { ctrl with
                    Eff = ctrl.Eff |> Map.add "temporalParadoxDay" (1.0 + getEffect "temporalParadoxDayBonus") } }

// --- time-07: manual shatter heat split (ShatterTCBtnController.doShatter) -----

/// Everything doShatter needs outside the pools (badges/void live runner-side).
type DoShatterContext =
    { GetEffect: string -> float
      Years1000Researched: bool }

/// doShatter heat accounting: 10 heat per year (5 with 1000Years researched),
/// split between time.heat and the furnace by heatCompression, the furnace
/// share already scaled by heatEfficiency. Returns the updated time pool.
let doShatterHeat (ctx: DoShatterContext) (amt: int) (tp: TimePool) : TimePool =
    let factor = if ctx.Years1000Researched then 5.0 else 10.0
    let compression = 1.0 - 1.0 / (1.0 + ctx.GetEffect "heatCompression")
    let mutable tp = tp
    if compression <> 0.0 then
        let efficiency = 1.0 + ctx.GetEffect "heatEfficiency"
        tp <- { tp with Heat = tp.Heat + float amt * factor * (1.0 - compression) }
        tp <- updateCfu tp "blastFurnace" (fun m -> { m with Heat = m.Heat + float amt * factor * compression * efficiency })
    else
        tp <- { tp with Heat = tp.Heat + float amt * factor }
    tp

// --- void-01: VoidManager -------------------------------------------------------

type VoidPool =
    { VUs: Map<string, TimeMeta>
      VuOrder: string list
      Faction: string option }

let initVoid () : VoidPool =
    { VUs =
        Game.Catalog.World.voidUpgradeDefs
        |> List.map (fun d ->
            // void.js upgrades define no effects table (spaceCathedral) — 0s
            (d.Name, { (mkMeta false) with Eff = Map.empty }))
        |> Map.ofList
      VuOrder = Game.Catalog.World.voidUpgradeDefs |> List.map (fun d -> d.Name)
      Faction = None }

let resetVoid (_vp: VoidPool) : VoidPool = initVoid ()

let getVU (vp: VoidPool) (name: string) : TimeMeta = vp.VUs.[name]

let voidGroup (vp: VoidPool) : Game.Effects.ManagerGroup =
    { Base = Map.empty
      Items =
        vp.VuOrder
        |> List.choose (fun n ->
            let m = vp.VUs.[n]
            if m.On > 0 then
                // spaceCathedral defines no effects table — provider yields 0s;
                // kept for the contract
                Some(Map.empty, (fun _ v -> v * float m.On))
            else None) }
