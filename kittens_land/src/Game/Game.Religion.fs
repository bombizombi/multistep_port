module Game.Religion

// religion-01 / religion-08: faith, praise, adore (epiphany), transcend, and the
// solar revolution ratio. Sources: js/religion.js L4-176 (manager state, meta
// registration, resetState), L1488-1716 (praise economy + accessors). Purchase
// mechanics for RU/ZU are the core.js BuildingStackableBtnController build loop
// (pay → incrementValue → calculateEffects) — Game.Managers.buyItem generic path.
// Corruption/necrocorns (religion-03/04) and pacts (religion-14) remain seams.

open Game.Types

/// Pact state (pactsManager metas: stackable val/on).
type PactMeta =
    { Val: int
      On: int
      Unlocked: bool }

/// Live meta state shared by ZU/RU/TU metas (orig mutates the def: val/on).
/// FrozenEffects carries calculateEffects output that orig writes INTO the def
/// (solarRevolution sets effects.solarRevolutionRatio at buy time; the value
/// stays frozen until another recalc event touches the meta — game.js L5878).
type ReligionMeta =
    { Val: int
      On: int
      Unlocked: bool
      Researched: bool
      FrozenEffects: Map<string, float> }

type ReligionPool =
    { Faith: float            // worship pool (praise target)
      FaithRatio: float       // epiphany (adore target)
      Tcratio: float          // transcendence progress spent
      TranscendenceTier: int
      Corruption: float
      NecrocornDeficit: float // pactsManager.necrocornDeficit (religion-14)
      FractureThreshold: float // pactsManager.fractureNecrocornDeficit (50)
      Pacts: Map<string, PactMeta>
      PactOrder: string list
      ActiveHolyGenocide: int
      ZUs: Map<string, ReligionMeta>
      RUs: Map<string, ReligionMeta>
      TUs: Map<string, ReligionMeta>
      ZuOrder: string list
      RuOrder: string list
      TuOrder: string list }

let private mkMeta () : ReligionMeta =
    { Val = 0; On = 0; Unlocked = false; Researched = false; FrozenEffects = Map.empty }

let init () : ReligionPool =
    let idx (defs: 'a list) (nameOf: 'a -> string) =
        defs |> List.map nameOf,
        defs |> List.map (fun d -> (nameOf d, mkMeta ())) |> Map.ofList
    let zuOrder = Game.Catalog.World.zuDefs |> List.map (fun d -> d.Name)
    let zus =
        Game.Catalog.World.zuDefs
        |> List.map (fun d -> (d.Name, { (mkMeta ()) with Unlocked = d.StartsUnlocked }))
        |> Map.ofList
    let ruOrder, rus = idx Game.Catalog.World.ruDefs (fun d -> d.Name)
    let tuOrder, tus = idx Game.Catalog.World.tuDefs (fun d -> d.Name)
    { Faith = 0.0
      FaithRatio = 0.0
      Tcratio = 0.0
      TranscendenceTier = 0
      Corruption = 0.0
      NecrocornDeficit = 0.0
      FractureThreshold = 50.0
      Pacts =
        Game.Catalog.World.pactDefs
        |> List.map (fun d -> (d.Name, { Val = 0; On = 0; Unlocked = false }))
        |> Map.ofList
      PactOrder = Game.Catalog.World.pactDefs |> List.map (fun d -> d.Name)
      ActiveHolyGenocide = 0
      ZUs = zus
      RUs = rus
      TUs = tus
      ZuOrder = zuOrder
      RuOrder = ruOrder
      TuOrder = tuOrder }

let getRU (rp: ReligionPool) (name: string) : ReligionMeta = rp.RUs.[name]
let getZU (rp: ReligionPool) (name: string) : ReligionMeta = rp.ZUs.[name]
let getTU (rp: ReligionPool) (name: string) : ReligionMeta = rp.TUs.[name]

/// orig getApocryphaBonus (L1510): UDR(faithRatio, 0.1) * 0.1
let getApocryphaBonus (rp: ReligionPool) : float =
    Game.Math.getUnlimitedDR rp.FaithRatio 0.1 * 0.1

/// orig getSolarRevolutionRatio (L1499): LDR(UDR(faith,1000)/100,
///   10 + solarRevolutionLimit [+ atheism tier seam]) * (1 + faithSolarRevolutionBoost)
let getSolarRevolutionRatio (rp: ReligionPool) (getEffect: string -> float) : float =
    let uncappedBonus =
        if (getRU rp "solarRevolution").On > 0 then
            Game.Math.getUnlimitedDR rp.Faith 1000.0 / 100.0
        else 0.0
    let limit =
        10.0 + getEffect "solarRevolutionLimit"
        // atheism challenge seam (researched? + transcendenceTier): 0 at this slice
    Game.Math.getLimitedDR uncappedBonus limit * (1.0 + getEffect "faithSolarRevolutionBoost")

/// orig _getTranscendTotalPrice (L1653): inverseUDR(exp(tier)/10, 0.1)
let getTranscendTotalPrice (tier: int) : float =
    Game.Math.getInverseUnlimitedDR (exp (float tier) / 10.0) 0.1

let getTranscendNextPrice (rp: ReligionPool) : float =
    getTranscendTotalPrice (rp.TranscendenceTier + 1) - getTranscendTotalPrice rp.TranscendenceTier

/// orig praise (L1536): worship += faith.value * (1 + apocrypha); faith.value = 0.0001
let praise (rp: ReligionPool) (faithValue: float) : ReligionPool =
    let gained = faithValue * (1.0 + getApocryphaBonus rp)
    let faith = System.Math.Min(rp.Faith + gained, System.Double.MaxValue)
    { rp with Faith = faith } // caller then sets faith resource value to 0.0001

/// orig _resetFaithInternal (L1580): faithRatio += faith/1e6 * (tt+1)^2 * ratio; faith = 0.01
let adoreInternal (rp: ReligionPool) (bonusRatio: float) : ReligionPool =
    let ttPlus1 =
        (if (getRU rp "transcendence").On > 0 then rp.TranscendenceTier else 0) + 1
    let faithRatio = rp.FaithRatio + rp.Faith / 1000000.0 * float ttPlus1 * float ttPlus1 * bonusRatio
    { rp with
        FaithRatio = System.Math.Min(faithRatio, System.Double.MaxValue)
        Faith = 0.01 }

/// orig transcend (L1600): consume next price from faithRatio, tier++
let transcend (rp: ReligionPool) : ReligionPool * bool =
    if (getRU rp "transcendence").On = 0 then
        (rp, false)
    else
        let needNextLevel = getTranscendNextPrice rp
        if rp.FaithRatio > needNextLevel then
            { rp with
                FaithRatio = rp.FaithRatio - needNextLevel
                Tcratio = rp.Tcratio + needNextLevel
                TranscendenceTier = rp.TranscendenceTier + 1 },
            true
        else
            (rp, false)

/// orig resetState (L71-101)
let resetState (_rp: ReligionPool) : ReligionPool =
    let fresh =
        let idx (defs: 'a list) (nameOf: 'a -> string) =
            defs |> List.map nameOf,
            defs |> List.map (fun d -> (nameOf d, mkMeta ())) |> Map.ofList
        let zuOrder = Game.Catalog.World.zuDefs |> List.map (fun d -> d.Name)
        let zus =
            Game.Catalog.World.zuDefs
            |> List.map (fun d -> (d.Name, { (mkMeta ()) with Unlocked = d.StartsUnlocked }))
            |> Map.ofList
        let ruOrder, rus = idx Game.Catalog.World.ruDefs (fun d -> d.Name)
        let tuOrder, tus = idx Game.Catalog.World.tuDefs (fun d -> d.Name)
        { Faith = 0.0; FaithRatio = 0.0; Tcratio = 0.0; TranscendenceTier = 0
          Corruption = 0.0; NecrocornDeficit = 0.0; FractureThreshold = 50.0
          Pacts =
            Game.Catalog.World.pactDefs
            |> List.map (fun d -> (d.Name, { Val = 0; On = 0; Unlocked = false }))
            |> Map.ofList
          PactOrder = Game.Catalog.World.pactDefs |> List.map (fun d -> d.Name)
          ActiveHolyGenocide = 0
          ZUs = zus; RUs = rus; TUs = tus
          ZuOrder = zuOrder; RuOrder = ruOrder; TuOrder = tuOrder }
    fresh

/// core.js registerMeta("stackable") provider: effects × on.
/// ZU provider is custom (effects × on; blackPyramid special — seam 0),
/// RU/TU group providers likewise read × on (L37-46).
let private metaItems (metas: (string * ReligionMeta) list) (effectsOf: string -> Map<string, float>) =
    metas
    |> List.choose (fun (name, m) ->
        if m.On > 0 then
            // orig provider reads the def's (possibly calculateEffects-mutated)
            // effects table: FrozenEffects overlay wins over the static table
            let effects =
                let statics = effectsOf name
                m.FrozenEffects
                |> Map.fold (fun acc k v -> Map.add k v acc) statics
            Some(effects, (fun _ (v: float) -> v * float m.On))
        else
            None)

/// orig religion effectsBase (L1488-1491)
let effectsBase : Map<string, float> =
    Map.ofList
        [ "kittensKarmaPerMinneliaRatio", 0.0001
          "pactNecrocornConsumption", -0.0005 ]

/// Pacts stackable group contribution (effects × on) — merged into the
/// religion manager group.
let pactItems (rp: ReligionPool) : (Map<string, float> * (string -> float -> float)) list =
    Game.Catalog.World.pactDefs
    |> List.choose (fun def ->
        let m = rp.Pacts.[def.Name]
        if m.On > 0 then
            Some(def.Effects, (fun _ (v: float) -> v * float m.On))
        else None)

/// Manager group for the global effects cache (religion slot in updateCaches).
let religionGroup (rp: ReligionPool) : Game.Effects.ManagerGroup =
    let zuEffects (name: string) =
        (Game.Catalog.World.zuDefs |> List.find (fun d -> d.Name = name)).Effects
    let ruEffects (name: string) =
        (Game.Catalog.World.ruDefs |> List.find (fun d -> d.Name = name)).Effects
    let tuEffects (name: string) =
        (Game.Catalog.World.tuDefs |> List.find (fun d -> d.Name = name)).Effects
    { Base = effectsBase
      Items =
        metaItems (rp.ZuOrder |> List.choose (fun n -> rp.ZUs |> Map.tryFind n |> Option.map (fun m -> (n, m)))) zuEffects
        @ metaItems (rp.RuOrder |> List.choose (fun n -> rp.RUs |> Map.tryFind n |> Option.map (fun m -> (n, m)))) ruEffects
        @ metaItems (rp.TuOrder |> List.choose (fun n -> rp.TUs |> Map.tryFind n |> Option.map (fun m -> (n, m)))) tuEffects
        @ pactItems rp }

// --- religion-03: corruption engine (js/religion.js L182-408) ------------------

/// Seam context for corruption math (live reads supplied by the runner).
type CorruptionContext =
    { GetEffect: string -> float
      Alicorns: float
      Sorrow: float
      FeedingFrenzyResearched: bool }

/// orig getExistNecrocornThreshold (L183): feedingFrenzy -> 1, else 0.
let getExistNecrocornThreshold (ctx: CorruptionContext) : float =
    if ctx.FeedingFrenzyResearched then 1.0 else 0.0

/// orig getCorruptionEffects (L204-291): markers additive, exist-penalty
/// multiplicative, black radiance sqrt, feeding-frenzy interference. Pact
/// siphoning branches are seams (no pacts at this slice).
let getCorruptionEffects (ctx: CorruptionContext) (pretendExistNecrocorn: bool option) : float =
    let existNecrocorn =
        match pretendExistNecrocorn with
        | Some b -> b
        | None -> ctx.Alicorns > getExistNecrocornThreshold ctx
    let mutable finalCorruptionPerTick = 0.0
    if ctx.Alicorns > 0.0 then
        finalCorruptionPerTick <- finalCorruptionPerTick + ctx.GetEffect "corruptionRatio"
    if existNecrocorn then
        let multiplier = 0.25 * (1.0 + ctx.GetEffect "corruptionBoostRatio")
        finalCorruptionPerTick <- finalCorruptionPerTick * multiplier
    finalCorruptionPerTick <- finalCorruptionPerTick * (1.0 + sqrt (ctx.Sorrow * ctx.GetEffect "blsCorruptionRatio"))
    finalCorruptionPerTick <- finalCorruptionPerTick * (1.0 + ctx.GetEffect "necrocornCorruptionInterference")
    finalCorruptionPerTick

/// orig getCorruptionPerTick (L296-302)
let getCorruptionPerTick (ctx: CorruptionContext) (pretendExistNecrocorn: bool option) : float =
    getCorruptionEffects ctx pretendExistNecrocorn

/// orig getNecrocornDeficitConsumptionModifier (L2894-2912)
let getNecrocornDeficitConsumptionModifier (ctx: CorruptionContext) (pool: ResPool) (rp: ReligionPool) : float =
    if rp.NecrocornDeficit <= 0.0 then 1.0
    else
        let necrocornPerDay = ctx.GetEffect "necrocornPerDay"
        if ctx.GetEffect "repayDebtOnNecrocornGeneration" <> 0.0 then 1.0
        else
            let mutable modifier = 1.0 + 0.15 * (1.0 + ctx.GetEffect "deficitRecoveryRatio" / 2.0)
            let necrocorns = Game.Resources.get pool "necrocorn" |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0
            if necrocorns + necrocornPerDay * modifier < 0.0 then
                max ((necrocornPerDay * modifier + necrocorns) / necrocornPerDay) 0.0
            else modifier

/// Direct value writes (orig assigns .value; NOT addResEvent — no cap/rounding).
let private setResValue (name: string) (value: float) (pool: ResPool) : ResPool =
    let res = pool.ByName[name]
    { pool with ByName = pool.ByName |> Map.add name { res with Value = value } }

/// orig corruptNecrocorns (L376-408): convert alicorns 1:1 at progress >= 1,
/// keep at least 1 alicorn, clamp progress to 1 when starved of alicorns.
/// Pacts debt is a seam (repayDebtOnNecrocornGeneration 0, deficit 0).
/// Returns necrocorns kept (debt-paid ones don't count).
let corruptNecrocorns
    (ctx: CorruptionContext)
    (pool: ResPool)
    (rp: ReligionPool)
    : ReligionPool * ResPool * float =
    let alicorns = Game.Resources.get pool "alicorn" |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0
    let maxAlicornsToCorrupt = ceil alicorns - 1.0
    let alicornsToCorrupt = floor (min rp.Corruption maxAlicornsToCorrupt)
    // debtToPay = repayDebtOnNecrocornGeneration ? floor(deficit) : 0 — seam 0
    if alicornsToCorrupt > 0.0 then
        let rp' = { rp with Corruption = rp.Corruption - alicornsToCorrupt }
        let pool1 = setResValue "alicorn" (alicorns - alicornsToCorrupt) pool
        let necrocorns = Game.Resources.get pool1 "necrocorn" |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0
        let pool2 = setResValue "necrocorn" (necrocorns + alicornsToCorrupt) pool1
        // game.upgrade({zigguratUpgrades: [skyPalace, unicornUtopia, sunspire]})
        // -> updateCaches recalc handled by the caller
        rp', pool2, alicornsToCorrupt
    else
        let corruption = if rp.Corruption >= 1.0 then 1.0 else rp.Corruption
        { rp with Corruption = corruption }, pool, 0.0

// --- religion-04: necrocorn fast-forward math (js/religion.js L343-636) --------

/// orig pactsManager.necrocornConsumptionDays (L3004-3026). necrocornPerDay
/// effect is 0 without active pacts at this slice; deficit bookkeeping kept.
let necrocornConsumptionDays
    (calendarDay: int)
    (ctx: CorruptionContext)
    (days: float)
    (pool: ResPool)
    (rp: ReligionPool)
    : ReligionPool * ResPool =
    let necrocornPerDay = ctx.GetEffect "necrocornPerDay"
    if ctx.GetEffect "repayDebtOnNecrocornGeneration" <> 0.0 then
        { rp with NecrocornDeficit = rp.NecrocornDeficit - necrocornPerDay * days }, pool
    else
        let mutable modifier = 1.0
        let mutable deficit = rp.NecrocornDeficit
        let necrocorns = Game.Resources.get pool "necrocorn" |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0
        if deficit > 0.0 then
            modifier <- 1.0 + 0.15 * (1.0 + ctx.GetEffect "deficitRecoveryRatio" / 2.0)
        if necrocorns + necrocornPerDay * days * modifier < 0.0 then
            deficit <- deficit + max (-necrocornPerDay * days - necrocorns) 0.0
            modifier <- 1.0
        elif deficit > 0.0 then
            deficit <- max (deficit + necrocornPerDay * (0.15 * (1.0 + ctx.GetEffect "deficitRecoveryRatio") * days)) 0.0
        let pool', _ = Game.Resources.addResPerTick calendarDay "necrocorn" (necrocornPerDay * modifier * days) pool
        { rp with NecrocornDeficit = deficit }, pool'

/// orig _necrocornsNaiveFastForward_withoutSiphoning (L560-620 area)
let private necrocornsNaiveFFWithoutSiphoning
    (calendarDay: int)
    (ctx: CorruptionContext)
    (daysOffset: float)
    (times: float)
    (pool: ResPool)
    (rp: ReligionPool)
    : ReligionPool * ResPool =
    let threshold = getExistNecrocornThreshold ctx
    let necrocornsBefore = Game.Resources.get pool "necrocorn" |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0
    let corruptionPerTickUnpenalized = getCorruptionPerTick ctx (Some false)
    let mutable corruption = rp.Corruption
    if corruptionPerTickUnpenalized > 0.0 then
        let corruptionPerTickPenalized = getCorruptionPerTick ctx (Some true)
        let necrocornsToPassThreshold = 1.0 + floor (threshold - necrocornsBefore)
        let mutable ticksUnpenalized = ceil ((necrocornsToPassThreshold - rp.Corruption) / corruptionPerTickUnpenalized)
        if ticksUnpenalized < 0.0 then ticksUnpenalized <- 0.0
        if ticksUnpenalized > times then ticksUnpenalized <- times
        let ticksPenalized = times - ticksUnpenalized
        corruption <- corruption + corruptionPerTickUnpenalized * ticksUnpenalized + corruptionPerTickPenalized * ticksPenalized
    let rp1 = { rp with Corruption = corruption }
    let rp2, pool1 = necrocornConsumptionDays calendarDay ctx daysOffset pool rp1
    let rp3, pool2, _ = corruptNecrocorns ctx pool1 rp2
    rp3, pool2

/// orig _necrocornsNaiveFastForward_withSiphoning (L425-558): the debt-aware
/// variant. No active pacts (debt 0, necrocornPerDay 0) degenerates to the
/// plain split; the iteration shape is kept for the contract.
let private necrocornsNaiveFFWithSiphoning
    (calendarDay: int)
    (ctx: CorruptionContext)
    (daysOffset: float)
    (times: float)
    (pool: ResPool)
    (rp: ReligionPool)
    : ReligionPool * ResPool =
    let corruptionBefore = rp.Corruption
    let threshold = getExistNecrocornThreshold ctx
    let necrocornRes = Game.Resources.get pool "necrocorn" |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0
    let debtBefore = rp.NecrocornDeficit
    let corruptionPerTickUnpenalized = getCorruptionPerTick ctx (Some false)
    let corruptionPerTickPenalized = getCorruptionPerTick ctx (Some true)
    let avgDebtPerTick = -ctx.GetEffect "necrocornPerDay"
    let mutable ticksUnpenalized = 0.0
    if necrocornRes <= threshold && times > 0.0 then
        let baseNecrocornsToPassThreshold = 1.0 + floor (threshold - necrocornRes)
        let mutable tryNumber = baseNecrocornsToPassThreshold
        let mutable ticksElapsed = 0.0
        let mutable giveUp = false
        while ticksElapsed < times && not giveUp do
            ticksElapsed <-
                if corruptionPerTickUnpenalized <> 0.0 then
                    ceil ((tryNumber - corruptionBefore) / corruptionPerTickUnpenalized)
                else System.Double.MaxValue
            let projectedDebt = debtBefore + ticksElapsed * avgDebtPerTick
            let targetNecrocorns = baseNecrocornsToPassThreshold + floor projectedDebt
            if tryNumber >= targetNecrocorns then
                ()
            else
                tryNumber <- targetNecrocorns
                if avgDebtPerTick >= corruptionPerTickUnpenalized && tryNumber > (baseNecrocornsToPassThreshold + debtBefore) * 2.0 then
                    giveUp <- true
                    tryNumber <- System.Double.MaxValue
        ticksElapsed <-
            if corruptionPerTickUnpenalized <> 0.0 then
                ceil ((tryNumber - corruptionBefore) / corruptionPerTickUnpenalized)
            else System.Double.MaxValue
        ticksUnpenalized <- ticksElapsed
        if ticksUnpenalized < 0.0 then ticksUnpenalized <- 0.0
        if ticksUnpenalized > times then ticksUnpenalized <- times
    let ticksPenalized = times - ticksUnpenalized
    let mutable daysUnpenalized = floor (ticksUnpenalized / 10.0) // TICKS_PER_DAY seam (10 at this slice)
    if System.Double.IsNaN daysUnpenalized then daysUnpenalized <- 0.0
    let daysPenalized = daysOffset - daysUnpenalized
    let mutable rp = rp
    let mutable pool = pool
    if daysUnpenalized > 0.0 then
        let rp', pool' = necrocornConsumptionDays calendarDay ctx daysUnpenalized pool rp
        rp <- rp'; pool <- pool'
    if ticksUnpenalized > 0.0 then
        rp <- { rp with Corruption = rp.Corruption + corruptionPerTickUnpenalized * ticksUnpenalized }
        let rp', pool', _ = corruptNecrocorns ctx pool rp
        rp <- rp'; pool <- pool'
    if daysPenalized > 0.0 then
        let rp', pool' = necrocornConsumptionDays calendarDay ctx daysPenalized pool rp
        rp <- rp'; pool <- pool'
    if ticksPenalized > 0.0 then
        rp <- { rp with Corruption = rp.Corruption + corruptionPerTickPenalized * ticksPenalized }
    let rp', pool', _ = corruptNecrocorns ctx pool rp
    rp', pool'

/// orig necrocornsNaiveFastForward (L622-636)
let necrocornsNaiveFastForward
    (calendarDay: int)
    (ctx: CorruptionContext)
    (daysOffset: float)
    (times: float)
    (pool: ResPool)
    (rp: ReligionPool)
    : ReligionPool * ResPool =
    if ctx.Alicorns > 0.0 then
        if ctx.GetEffect "repayDebtOnNecrocornGeneration" <> 0.0 then
            necrocornsNaiveFFWithSiphoning calendarDay ctx daysOffset times pool rp
        else
            necrocornsNaiveFFWithoutSiphoning calendarDay ctx daysOffset times pool rp
    else
        necrocornConsumptionDays calendarDay ctx daysOffset pool rp

/// orig triggerOrderOfTheVoid (L628-633): voidOrder perk converts 10% of
/// produced faith (× voidResonance), at a quarter of the apocrypha bonus.
let triggerOrderOfTheVoid
    (voidOrderResearched: bool)
    (voidResonance: float)
    (faithPerTick: float)
    (ticks: float)
    (rp: ReligionPool)
    : ReligionPool =
    if voidOrderResearched then
        let convertedFaith = ticks * faithPerTick * 0.1 * (1.0 + voidResonance)
        { rp with Faith = rp.Faith + convertedFaith * (1.0 + getApocryphaBonus rp / 4.0) }
    else
        rp

/// orig necrocornFastForward (L639+): split simulation at the
/// above-to-below-threshold edge case.
let necrocornFastForward
    (calendarDay: int)
    (ctx: CorruptionContext)
    (days: float)
    (times: float)
    (pool: ResPool)
    (rp: ReligionPool)
    : ReligionPool * ResPool =
    let threshold = getExistNecrocornThreshold ctx
    let necrocornPerDay = ctx.GetEffect "necrocornPerDay"
    let continuouslyConsumeNecrocorns = ctx.GetEffect "repayDebtOnNecrocornGeneration" = 0.0
    let ticksPerDay = times / days
    let mutable daysRemaining = days
    let mutable timesRemaining = times
    let mutable rp = rp
    let mutable pool = pool
    let mutable guard = 0
    while (daysRemaining > 0.0 || timesRemaining > 0.0) && guard < 100000 do
        guard <- guard + 1
        let mutable daysUntilEdgeCase1 = System.Double.PositiveInfinity
        if continuouslyConsumeNecrocorns && necrocornPerDay < 0.0 then
            let necrocornRes = Game.Resources.get pool "necrocorn" |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0
            if necrocornRes > threshold then
                let consumptionRate = -necrocornPerDay * (getNecrocornDeficitConsumptionModifier ctx pool rp)
                daysUntilEdgeCase1 <- ceil ((necrocornRes - threshold) / consumptionRate)
            else
                let ticksUntilThreshold =
                    ceil ((1.0 + floor (threshold - necrocornRes) - rp.Corruption) / (getCorruptionPerTick ctx (Some false)))
                daysUntilEdgeCase1 <- ceil (ticksUntilThreshold / ticksPerDay)
        if System.Double.IsNaN daysUntilEdgeCase1 then daysUntilEdgeCase1 <- System.Double.PositiveInfinity
        let daysToSimulate = min daysRemaining daysUntilEdgeCase1
        let mutable timesToSimulate = min (ceil (daysToSimulate * ticksPerDay)) timesRemaining
        if daysToSimulate < 1.0 then timesToSimulate <- timesRemaining
        let rp', pool' = necrocornsNaiveFastForward calendarDay ctx daysToSimulate timesToSimulate pool rp
        rp <- rp'
        pool <- pool'
        daysRemaining <- daysRemaining - daysToSimulate
        timesRemaining <- timesRemaining - timesToSimulate
    rp, pool

// --- game-19: religion.undo — praise/adore (js/religion.js L1748-1770) --------

/// orig praise undo: restore worship & faith stock.
let undoPraise (faithSpent: float) (worshipGained: float) (pool: ResPool) (rp: ReligionPool) : ReligionPool * ResPool * bool =
    if rp.Faith >= worshipGained then
        let rp' = { rp with Faith = rp.Faith - worshipGained }
        let pool', _ = Game.Resources.addResEvent 0 "faith" faithSpent pool
        rp', pool', true
    else
        rp, pool, false

/// orig adore undo: restore epiphany & the pre-adore worship pool.
let undoAdore (worshipBefore: float) (epiphanyGained: float) (rp: ReligionPool) : ReligionPool * bool =
    if rp.FaithRatio >= epiphanyGained then
        { rp with FaithRatio = rp.FaithRatio - epiphanyGained; Faith = worshipBefore }, true
    else
        rp, false

// --- religion-14: pactsManager (js/religion.js L2572-3004) ---------------------

let getPact (rp: ReligionPool) (name: string) : PactMeta = rp.Pacts.[name]

/// orig countUniqueActivePacts (L2966): MAUSOLEUM_PACTS flag is TRUE in the
/// harness (localhost); fractured short-circuits the count; special skipped.
let countUniqueActivePacts (rp: ReligionPool) : int =
    if rp.Pacts.["fractured"].On > 0 then 0
    else
        Game.Catalog.World.pactDefs
        |> List.filter (fun d -> not d.Special)
        |> List.sumBy (fun d -> if rp.Pacts.[d.Name].On > 0 then 1 else 0)

let countActivePacts (rp: ReligionPool) : int =
    if rp.Pacts.["fractured"].On > 0 then 0
    else
        Game.Catalog.World.pactDefs
        |> List.filter (fun d -> not d.Special)
        |> List.sumBy (fun d -> rp.Pacts.[d.Name].On)

/// orig getDebtPenaltyRatio (L2880-2898)
let getDebtPenaltyRatio (rp: ReligionPool) (getEffect: string -> float) : float =
    if rp.Pacts.["fractured"].On > 0 || rp.NecrocornDeficit >= rp.FractureThreshold then 0.0
    else
        let lowerBound = getEffect "smallDebtPunishmentExemption"
        if rp.NecrocornDeficit <= lowerBound then 1.0
        else 1.0 - (rp.NecrocornDeficit - lowerBound) / (rp.FractureThreshold - lowerBound)

/// orig pact purchase build (L2478-2545): pactsAvailable cap, prices, deficit
/// +0.5/counter (unless notAddDeficit or positive upfront cost), payDebt
/// special pays the deficit instead. Returns updated pools.
let buyPact
    (calendarDay: int)
    (getEffect: string -> float)
    (name: string)
    (n: int)
    (pool: ResPool)
    (rp: ReligionPool)
    : ReligionPool * ResPool * int =
    let def = Game.Catalog.World.pactDefs |> List.find (fun d -> d.Name = name)
    let mutable maxBld = n
    // pactsAvailable cap: each pact's effects.pactsAvailable is NEGATIVE;
    // headroom = pactsAvailable / (-this pact's pactsAvailable)
    let pactAvailableEffect = def.Effects |> Map.tryFind "pactsAvailable" |> Option.defaultValue 0.0
    if pactAvailableEffect <> 0.0 then
        maxBld <- min maxBld (int (getEffect "pactsAvailable" / -pactAvailableEffect))
    let mutable pact = rp.Pacts.[name]
    let mutable rp = rp
    let mutable pool = pool
    let mutable counter = 0
    let prices0 = def.Prices |> List.map (fun p -> (p.Resource, p.Val))
    match def.LimitBuild with
    | Some lb -> maxBld <- min maxBld (int lb - pact.Val)
    | None -> ()
    while counter < maxBld && Game.Resources.hasRes pool prices0 0.0 do
        rp <- { rp with Pacts = rp.Pacts |> Map.add name { pact with Val = pact.Val + 1; On = pact.On + 1 } }
        pact <- rp.Pacts.[name]
        pool <- Game.Resources.payPrices calendarDay pool prices0
        counter <- counter + 1
    if counter > 0 then
        if not def.NotAddDeficit then
            rp <- { rp with NecrocornDeficit = rp.NecrocornDeficit + 0.5 * float counter }
        if name = "payDebt" then
            // payDebt calculateEffects: clears the deficit & retires the pact
            rp <-
                { rp with
                    NecrocornDeficit = 0.0
                    Pacts = rp.Pacts |> Map.add "payDebt" { rp.Pacts.["payDebt"] with On = 0; Val = 0; Unlocked = false } }
    rp, pool, counter

/// orig onNewDay slice for pacts (calendar calls pactsManager
/// necrocornConsumptionDays(1) + payDebt.onNewDay + deficit punishment).
let pactsOnNewDay
    (ctx: CorruptionContext)
    (pool: ResPool)
    (rp: ReligionPool)
    : ReligionPool * ResPool =
    let rp1, pool1 = necrocornConsumptionDays 0 ctx 1.0 pool rp
    // payDebt pact: unlocked + price refresh while deficit > 0
    let pd = rp1.Pacts.["payDebt"]
    let rp2 =
        { rp1 with
            Pacts =
                rp1.Pacts
                |> Map.add "payDebt" { pd with Unlocked = rp1.NecrocornDeficit > 0.0 } }
    // deficit >= fracture threshold → punishment (fractured pact flips on;
    // the kitten skill wipe is a village seam)
    let rp3 =
        if rp2.NecrocornDeficit >= rp2.FractureThreshold then
            { rp2 with Pacts = rp2.Pacts |> Map.add "fractured" { rp2.Pacts.["fractured"] with On = 1; Val = 1 } }
        else rp2
    rp3, pool1

// --- purchases (core.js BuildingStackableBtnController build loop) -------------

/// stackable price ladder (identical math to Game.Buildings.getPrices; ZU adds
/// the ivory ratio override from ZigguratBtnController.getPrices L1893-1912).
let zuPrices (cache: Game.Effects.EffectsCache) (rp: ReligionPool) (name: string) : Price list =
    let def = Game.Catalog.World.zuDefs |> List.find (fun d -> d.Name = name)
    let meta = rp.ZUs.[name]
    let ratio = def.PriceRatio |> Option.defaultValue 1.0
    let eff = Game.Effects.getEffect cache
    // zigguratIvoryPriceRatio applies additively to the ratio, ivory only, floored at 1
    let ivoryRatio = max (ratio + eff "zigguratIvoryPriceRatio") 1.0
    let pricesDiscount = Game.Math.getLimitedDR (eff (name + "CostReduction")) 1.0
    let priceModifier = 1.0 - pricesDiscount
    def.Prices
    |> List.map (fun p ->
        let resPriceDiscount = Game.Math.getLimitedDR (eff (p.Resource + "CostReduction")) 1.0
        let resPriceModifier = 1.0 - resPriceDiscount
        let ratioToUse = if p.Resource = "ivory" then ivoryRatio else ratio
        { Resource = p.Resource
          Val = p.Val * ratioToUse ** float meta.Val * resPriceModifier * priceModifier })

/// RU ladder (ReligionBtnController.getPrices L1929-1942): base ladder, then
/// faith/gold ×(1 + religionUpgradesDiscount); wise-leader seam = identity.
let ruPrices (cache: Game.Effects.EffectsCache) (rp: ReligionPool) (name: string) : Price list =
    let def = Game.Catalog.World.ruDefs |> List.find (fun d -> d.Name = name)
    let meta = rp.RUs.[name]
    let ratio = def.PriceRatio |> Option.defaultValue 1.0
    let eff = Game.Effects.getEffect cache
    let pricesDiscount = Game.Math.getLimitedDR (eff (name + "CostReduction")) 1.0
    let priceModifier = 1.0 - pricesDiscount
    let discount = 1.0 + eff "religionUpgradesDiscount"
    def.Prices
    |> List.map (fun p ->
        let resPriceDiscount = Game.Math.getLimitedDR (eff (p.Resource + "CostReduction")) 1.0
        let resPriceModifier = 1.0 - resPriceDiscount
        let v = p.Val * ratio ** float meta.Val * resPriceModifier * priceModifier
        { Resource = p.Resource
          Val = if p.Resource = "faith" || p.Resource = "gold" then v * discount else v })

/// Shared stackable build tail: incrementValue (val++/on++) + unlock/upgrade
/// fan-outs (core.js build L2358-2435). Returns updated pool; caller handles
/// paying + frozen effects.
let private increment (m: ReligionMeta) : ReligionMeta =
    // incrementValue (core.js L2422-2441); togglable seams don't apply to religion metas
    { m with Val = m.Val + 1; On = m.On + 1 }

type ReligionBuyResult =
    { Pool: ReligionPool
      Bought: int
      UnlockFanOut: UnlockList option
      UpgradeFanOut: UnlockList option }

/// Buy n of a ZU while affordable at the FROZEN ladder (orig recomputes neither
/// prices nor the ladder inside the while loop — model.prices is fixed).
let buyZU (calendarDay: int) (cache: Game.Effects.EffectsCache) (pool: ResPool) (n: int) (name: string) (rp: ReligionPool) : ReligionPool * ResPool * ReligionBuyResult =
    let def = Game.Catalog.World.zuDefs |> List.find (fun d -> d.Name = name)
    let prices = zuPrices cache rp name
    let priceList = prices |> List.map (fun p -> (p.Resource, p.Val))
    let mutable rp = rp
    let mutable pool = pool
    let mutable counter = 0
    let mutable maxBld = n
    while counter < maxBld && Game.Resources.hasRes pool priceList 0.0 do
        let m = rp.ZUs.[name]
        rp <- { rp with ZUs = rp.ZUs |> Map.add name (increment m) }
        pool <- Game.Resources.payPrices calendarDay pool priceList
        counter <- counter + 1
    // build tail: unlocks fan-out, upgrade fan-out (recalc by caller)
    let result =
        { Pool = rp
          Bought = counter
          UnlockFanOut = def.Unlocks
          UpgradeFanOut = def.Upgrades }
    (rp, pool, result)

/// Buy n of an RU. orig build() checks only model.enabled (updateEnabled
/// L2227: hasResources && !(on>0 && noStackable)) — the faith gate is
/// updateVisible UI-only and does NOT gate the buy.
let buyRU (calendarDay: int) (cache: Game.Effects.EffectsCache) (pool: ResPool) (n: int) (name: string) (rp: ReligionPool) : ReligionPool * ResPool * ReligionBuyResult =
    let def = Game.Catalog.World.ruDefs |> List.find (fun d -> d.Name = name)
    let meta = rp.RUs.[name]
    // orig recalculates noStackable via calculateEffects to
    // (transcendence.on == 0): with the transcendence RU ON the RU stacks
    let noStackableNow = def.NoStackable && (match rp.RUs |> Map.tryFind "transcendence" with Some t -> t.On = 0 | None -> true)
    if meta.On > 0 && noStackableNow then
        (rp, pool, { Pool = rp; Bought = 0; UnlockFanOut = None; UpgradeFanOut = None })
    else
        let prices = ruPrices cache rp name
        let priceList = prices |> List.map (fun p -> (p.Resource, p.Val))
        let mutable rp = rp
        let mutable pool = pool
        let mutable counter = 0
        while counter < n && Game.Resources.hasRes pool priceList 0.0 do
            let m = rp.RUs.[name]
            rp <- { rp with RUs = rp.RUs |> Map.add name (increment m) }
            pool <- Game.Resources.payPrices calendarDay pool priceList
            counter <- counter + 1
        let result =
            { Pool = rp
              Bought = counter
              UnlockFanOut = def.Unlocks
              UpgradeFanOut = def.Upgrades }
        (rp, pool, result)

/// solarRevolution calculateEffects (religion.js L1154-1156): freeze the live
/// ratio INTO the meta's effects (orig mutates the def; frozen until recalc).
// --- religion-11/12: transform controller + sorrow refine (js/religion.js) ---

/// blackPyramid.getEffectiveValue: val + (blackSky researched && !active ? 1 : 0)
let blackPyramidEffectiveValue (pool: ReligionPool) (blackSkyResearched: bool) (blackSkyActive: bool) : int =
    (match pool.ZUs |> Map.tryFind "blackPyramid" with Some z -> z.Val | None -> 0)
    + (if blackSkyResearched && not blackSkyActive then 1 else 0)

/// ctx for the ZU calculateEffects REPLACE tables (skyPalace/utopia/sunspire)
type ZuCalcCtx =
    { AlicornmancyResearched: bool
      AlicornValue: float
      UnicornTearsActive: bool }

let zuCalcEffects (ctx: ZuCalcCtx) (name: string) (pool: ReligionPool) : ReligionPool =
    let alicornPerTick = if ctx.AlicornmancyResearched || ctx.AlicornValue > 0.0 then 1.0 else 0.0
    let newEffects =
      match name with
      | "skyPalace" ->
        [ "goldMaxRatio", 0.01; "unicornsRatioReligion", 0.5; "alicornChance", 0.0001
          "alicornPerTick", 0.00002 * alicornPerTick; "ivoryMeteorRatio", 0.05
          "unicornsMax", 0.0; "tearsMax", 0.0; "alicornMax", 0.0 ]
        |> (fun l ->
             if ctx.UnicornTearsActive
             then l @ [ "unicornsMax", 50.0; "tearsMax", 275.0; "alicornMax", 0.2 ]
             else l)
        |> Map.ofList
      | "unicornUtopia" ->
        [ "unicornsRatioReligion", 2.5; "alicornChance", 0.00015
          "alicornPerTick", 0.000025 * alicornPerTick; "tcRefineRatio", 0.05
          "ivoryMeteorRatio", 0.15
          "unicornsMax", 0.0; "tearsMax", 0.0; "alicornMax", 0.0 ]
        |> (fun l ->
             if ctx.UnicornTearsActive
             then l @ [ "unicornsMax", 5500.0; "tearsMax", 1800.0; "alicornMax", 0.6 ]
             else l)
        |> Map.ofList
      | "sunspire" ->
        [ "unicornsRatioReligion", 5.0; "alicornChance", 0.0003
          "alicornPerTick", 0.00005 * alicornPerTick; "tcRefineRatio", 0.1
          "ivoryMeteorRatio", 0.5
          "unicornsMaxRatio", 0.0; "tearsMax", 0.0; "alicornMax", 0.0 ]
        |> (fun l ->
             if ctx.UnicornTearsActive
             then l @ [ "unicornsMaxRatio", 0.1; "tearsMax", 10000.0; "alicornMax", 1.0 ]
             else l)
        |> Map.ofList
      | _ -> (match pool.ZUs |> Map.tryFind name with Some z -> z.FrozenEffects | None -> Map.empty)
    match pool.ZUs |> Map.tryFind name with
    | Some z -> { pool with ZUs = pool.ZUs |> Map.add name { z with FrozenEffects = newEffects } }
    | None -> pool

/// TU purchase (TranscendenceBtnController → stackable ladder + tier gate).
/// darkParacosm uses priceRules (per-price paragon priceRatio 2).
let buyTU (calendarDay: int) (getEffect: string -> float) (tier: int) (name: string) (n: int) (pool: ResPool) (rpool: ReligionPool) : ResPool * ReligionPool * int =
    match rpool.TUs |> Map.tryFind name with
    | Some m when m.Unlocked && m.Val = 0 ->
        let def = Game.Catalog.World.tuDefs |> List.find (fun d -> d.Name = name)
        // tier gate evaluated at the moment of purchase (unlock flag set at
        // transcend time — the button is invisible below tier anyway)
        let ratio = def.PriceRatio |> Option.defaultValue 1.15
        let priceFor () =
            def.Prices
            |> List.map (fun p ->
                let base0 = p.Val * (ratio ** float m.Val)
                let v =
                  if def.PriceRules && p.Resource = "paragon" then
                    8.0 * (2.0 ** float m.Val)
                  elif def.PriceRules then p.Val
                  else base0
                (p.Resource, v))
        let mutable r = pool
        let mutable rp2 = rpool
        let mutable bought = 0
        let mutable left = n
        while left > 0 && (Game.Resources.hasRes r (priceFor ()) 0.0) do
            let pool1 = Game.Resources.payPrices calendarDay r (priceFor ())
            r <- pool1
            rp2 <- { rp2 with TUs = rp2.TUs |> Map.add name { m with Val = m.Val + 1 } }
            bought <- bought + 1
            left <- left - 1
        r, rp2, bought
    | _ -> pool, rpool, 0

/// transform controller core (TransformBtnController._transform): pay
/// priceCount from resFrom, gain gainMultiplier×amt of resTo (capped),
/// overcap = attempted − actual (0 when uncapped).
let transform (calendarDay: int) (resFrom: string) (resTo: string) (price: float) (divider: int) (n: int) (gainMultiplier: float) (pool: ResPool) : ResPool * float * float * float * bool =
    // n = ALL/half/fifth selector (MultiLinkBtn divider): canAfford/n batches
    let afford0 = floor ((match Game.Resources.get pool resFrom with Some r -> r.Value | None -> 0.0) / price) |> int
    let gainMax = (match Game.Resources.get pool resTo with Some r -> r.MaxValue | None -> 0.0)
    let gainNow = (match Game.Resources.get pool resTo with Some r -> r.Value | None -> 0.0)
    let canAfford =
        if gainMax <> 0.0 && afford0 > 1 then
            max 1 (min afford0 (int (ceil ((gainMax - gainNow) / gainMultiplier))))
        else afford0
    let transformations = canAfford / n
    if transformations <= 0 then pool, 0.0, 0.0, 0.0, false
    else
        let amt = float (transformations * divider)
        let priceCount = price * amt
        let fromValue = (match Game.Resources.get pool resFrom with Some r -> r.Value | None -> 0.0)
        if priceCount > fromValue then pool, 0.0, 0.0, 0.0, false
        else
            let attemptedGain = gainMultiplier * amt
            let pool1, actualGain = Game.Resources.addResEvent calendarDay resFrom -priceCount pool
            let pool2, actual = Game.Resources.addResEvent calendarDay resTo attemptedGain pool1
            let maxV = (match Game.Resources.get pool2 resTo with Some r -> r.MaxValue | None -> 0.0)
            let overcap = if maxV = 0.0 then 0.0 else attemptedGain - actual
            pool2, price * float (transformations * divider), attemptedGain, overcap, true

/// RefineTearsBtnController: tears 10000 → sorrow.value++ per batch, direct
/// value write bypassing addResEvent; stops at sorrow.maxValue.
let refineTears (calendarDay: int) (n: int) (pool: ResPool) : ResPool * int =
    let price = 10000.0
    let sorrowMax = 17.0
    let mutable r = pool
    let mutable refined = 0
    let mutable left = n
    while left > 0
          && (match Game.Resources.get r "tears" with Some t -> t.Value >= price | None -> false)
          && (match Game.Resources.get r "sorrow" with Some s -> s.Value < sorrowMax | None -> false) do
        let pool1, _ = Game.Resources.addResEvent calendarDay "tears" -price r
        let s = pool1.ByName["sorrow"]
        r <- { pool1 with ByName = pool1.ByName |> Map.add "sorrow" { s with Value = s.Value + 1.0 } }
        refined <- refined + 1
        left <- left - 1
    r, refined

/// orig ReligionManager.necrocornDeficitPunishment (deficit ≥ 50 wipes skills — later unit)
let freezeSolarRevolution (cache: Game.Effects.EffectsCache) (rp: ReligionPool) : ReligionPool =
    let m = rp.RUs.["solarRevolution"]
    if m.On > 0 then
        let ratio = getSolarRevolutionRatio rp (Game.Effects.getEffect cache)
        let m = { m with FrozenEffects = m.FrozenEffects |> Map.add "solarRevolutionRatio" ratio }
        { rp with RUs = rp.RUs |> Map.add "solarRevolution" m }
    else
        rp
