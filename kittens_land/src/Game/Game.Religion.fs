module Game.Religion

// religion-01 / religion-08: faith, praise, adore (epiphany), transcend, and the
// solar revolution ratio. Sources: js/religion.js L4-176 (manager state, meta
// registration, resetState), L1488-1716 (praise economy + accessors). Purchase
// mechanics for RU/ZU are the core.js BuildingStackableBtnController build loop
// (pay → incrementValue → calculateEffects) — Game.Managers.buyItem generic path.
// Corruption/necrocorns (religion-03/04) and pacts (religion-14) remain seams.

open Game.Types

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
          Corruption = 0.0; ActiveHolyGenocide = 0
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
        @ metaItems (rp.TuOrder |> List.choose (fun n -> rp.TUs |> Map.tryFind n |> Option.map (fun m -> (n, m)))) tuEffects }

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
    let noStackableNow = def.NoStackable
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
let freezeSolarRevolution (cache: Game.Effects.EffectsCache) (rp: ReligionPool) : ReligionPool =
    let m = rp.RUs.["solarRevolution"]
    if m.On > 0 then
        let ratio = getSolarRevolutionRatio rp (Game.Effects.getEffect cache)
        let m = { m with FrozenEffects = m.FrozenEffects |> Map.add "solarRevolutionRatio" ratio }
        { rp with RUs = rp.RUs |> Map.add "solarRevolution" m }
    else
        rp
