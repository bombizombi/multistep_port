module Game.Managers

open Game.Types
open Game.Math
open Game.Buildings

// --- science-03: research (orig game.science) --------------------------------

type SciencePool =
    { TechOrder: string list
      Techs: Map<string, ResearchState>
      PolicyOrder: string list
      Policies: Map<string, PolicyState> }

let initScience (techs: TechDef list) (policies: PolicyDef list) : SciencePool =
    { TechOrder = techs |> List.map (fun t -> t.Name)
      Techs = techs |> List.map (fun t -> (t.Name, mkResearch t)) |> Map.ofList
      PolicyOrder = policies |> List.map (fun p -> p.Name)
      Policies = policies |> List.map (fun p -> (p.Name, mkPolicy p)) |> Map.ofList }

let getTech (sp: SciencePool) (name: string) : ResearchState option = sp.Techs |> Map.tryFind name

/// orig TechButtonController buyItem → onPurchase: pay prices, set researched.
let research (calendarDay: int) (name: string) (pool: ResPool) (sp: SciencePool) : ResPool * SciencePool * bool =
    match sp.Techs |> Map.tryFind name with
    | Some tech when not tech.Researched ->
        let prices = tech.Def.Prices |> List.map (fun p -> (p.Resource, p.Val))
        if Game.Resources.hasRes pool prices 0.0 then
            let pool' = Game.Resources.payPrices calendarDay pool prices
            let sp' = { sp with Techs = sp.Techs |> Map.add name { tech with Researched = true } }
            pool', sp', true
        else
            pool, sp, false
    | _ -> pool, sp, false

/// orig PolicyBtnController buyItem: pay prices, set researched (toggle-off not
/// needed at our stage).
let researchPolicy (calendarDay: int) (name: string) (pool: ResPool) (sp: SciencePool) : ResPool * SciencePool * bool =
    match sp.Policies |> Map.tryFind name with
    | Some pol when not pol.Researched ->
        let prices = pol.Def.Prices |> List.map (fun p -> (p.Resource, p.Val))
        if Game.Resources.hasRes pool prices 0.0 then
            let pool' = Game.Resources.payPrices calendarDay pool prices
            let sp' = { sp with Policies = sp.Policies |> Map.add name { pol with Researched = true } }
            pool', sp', true
        else
            pool, sp, false
    | _ -> pool, sp, false

// --- workshop-03/11/12/13/14: upgrades + crafts (orig game.workshop) ----------

type WorkshopPool =
    { UpgradeOrder: string list
      Upgrades: Map<string, UpgradeState>
      CraftOrder: string list
      Crafts: Map<string, CraftState>
      ZebraOrder: string list
      ZebraUpgrades: Map<string, UpgradeState> }

let initWorkshop (upgrades: UpgradeDef list) (crafts: CraftDef list) : WorkshopPool =
    { UpgradeOrder = upgrades |> List.map (fun u -> u.Name)
      Upgrades = upgrades |> List.map (fun u -> (u.Name, mkUpgrade u)) |> Map.ofList
      CraftOrder = crafts |> List.map (fun c -> c.Name)
      Crafts =
        crafts
        |> List.map (fun c ->
            (c.Name,
             { Def = c
               Unlocked = c.StartsUnlocked
               Value = 0.0
               Progress = 0.0
               IsLimited = false
               IsLimitedAmt = false }))
        |> Map.ofList
      ZebraOrder = Game.Catalog.Defs.zebraUpgradeDefs |> List.map (fun u -> u.Name)
      ZebraUpgrades =
        Game.Catalog.Defs.zebraUpgradeDefs
        |> List.map (fun u -> (u.Name, { Def = { Name = u.Name; Prices = u.Prices; Effects = u.Effects }; Unlocked = false; Researched = false }))
        |> Map.ofList }

let getCraft (wp: WorkshopPool) (name: string) : CraftState option = wp.Crafts |> Map.tryFind name
let getZebraUpgrade (wp: WorkshopPool) (name: string) : UpgradeState option = wp.ZebraUpgrades |> Map.tryFind name

/// orig getResCraftRatio(res): workshop craftRatio effects × (1 + skill bonus).
/// Skill/leader seams are fresh (0); effect read is live.
/// Leader craft bonus (orig getEffectLeader): engineer +0.05, metallurgist
/// +0.1 (tag), chemist +0.075 (tag); all × (1 + burnedParagonRatio) × monarchy.
let getEffectLeaderCraft (leaderTrait: string option) (trait: string) (burnedParagonRatio: float) (monarchyResearched: bool) : float =
    match leaderTrait with
    | Some t when t = trait ->
        let leaderRatio = if monarchyResearched then 1.95 else 1.0
        let baseB =
            match trait with
            | "engineer" -> 0.05
            | "metallurgist" -> 0.1
            | "chemist" -> 0.075
            | _ -> 0.0
        baseB * (1.0 + burnedParagonRatio) * leaderRatio
    | _ -> 0.0

/// orig game.getCraftRatio(tag) + getResCraftRatio (game.js L4412-4448): wood
/// takes the refine special (early return — craftRatio never applies to wood).
/// Inputs for the craft-ratio computation (bld values for blueprint/kerosene).
type CraftRatioContext =
    { IronWill: bool
      LeaderTrait: string option
      BurnedParagonRatio: float
      MonarchyResearched: bool
      BldVal: string -> int }

let resourceTag (resName: string) : string =
    match Game.Catalog.Resources.resourceDefs |> List.tryFind (fun r -> r.Name = resName) with
    | Some d -> d.Tag |> Option.defaultValue ""
    | None -> ""

let getResCraftRatio (cache: Game.Effects.EffectsCache) (ctx: CraftRatioContext) (resName: string) : float =
    let eff = Game.Effects.getEffect cache
    if resName = "wood" then
        let policyRefineRatio = eff "refinePolicyRatio"
        let refineRatio = policyRefineRatio + (1.0 + policyRefineRatio) * eff "refineRatio"
        if ctx.IronWill then
            (1.0 + refineRatio) * (1.0 + eff "woodRatio" + eff "woodPolicyRatio" / 3.0) - 1.0
        else refineRatio
    else
        let tag = resourceTag resName
        let mutable ratio =
            eff "craftRatio"
            + getEffectLeaderCraft ctx.LeaderTrait "engineer" ctx.BurnedParagonRatio ctx.MonarchyResearched
            + getEffectLeaderCraft ctx.LeaderTrait tag ctx.BurnedParagonRatio ctx.MonarchyResearched
        if resName = "blueprint" then
            ratio <- ratio + float (ctx.BldVal "library" + ctx.BldVal "academy" + ctx.BldVal "observatory" + ctx.BldVal "biolab") * eff "cadBlueprintCraftRatio"
        if resName = "kerosene" then
            ratio <- ratio * (1.0 + float (ctx.BldVal "factory") * 0.75 * eff "factoryRefineRatio")
        ratio <- ratio + eff (resName + "CraftRatio")
        ratio <- ratio * (1.0 + eff (resName + "GlobalCraftRatio"))
        ratio

/// orig getCraftPrice (js/workshop.js L2634-2654): manuscript takes the tradition
/// policy override; ship scales starchart by the satnav LDR (sattelite.on seam 0);
/// everything else returns the recipe prices verbatim.
let getCraftPrice (cache: Game.Effects.EffectsCache) (traditionResearched: bool) (craft: CraftDef) : Price list =
    if craft.Name = "manuscript" && traditionResearched then
        [ { Resource = "parchment"; Val = 20.0 }; { Resource = "culture"; Val = 300.0 } ]
    elif craft.Name = "ship" then
        let satnavRatioOn = Game.Effects.getEffect cache "satnavRatio" * 0.0 // sattelite.on seam
        craft.Prices
        |> List.map (fun p ->
            if p.Resource = "starchart" then
                { p with Val = p.Val * (1.0 - Game.Math.getLimitedDR satnavRatioOn 0.75) }
            else p)
    else
        craft.Prices

/// orig workshop.craft (js/workshop.js L2656-2701): ceil amt, craftRatio bonus,
/// negative-amt guard, resource check on the SCALED prices, pay, addResEvent.
/// Returns pool, workshop, success. (stats totalCrafts + undo are UI seams.)
let craft (calendarDay: int) (cache: Game.Effects.EffectsCache) (traditionResearched: bool) (crCtx: CraftRatioContext) (resName: string) (amt: float) (pool: ResPool) (wp: WorkshopPool) : ResPool * WorkshopPool * bool =
    match wp.Crafts |> Map.tryFind resName with
    | None -> pool, wp, false
    | Some craftDef ->
        let craftRatio = getResCraftRatio cache crCtx resName
        let amt = ceil amt
        let craftAmt = amt * (1.0 + craftRatio)
        // prevent undo giving free res
        let stockValue =
            match Game.Resources.get pool resName with
            | Some r -> r.Value
            | None -> 0.0
        if amt < 0.0 && stockValue < (abs craftAmt) then
            pool, wp, false
        else
            let prices =
                getCraftPrice cache traditionResearched craftDef.Def
                |> List.map (fun p -> (p.Resource, p.Val * amt))
            if Game.Resources.hasRes pool prices 0.0 then
                let poolPaid = Game.Resources.payPrices calendarDay pool prices
                let poolGained, _gained = Game.Resources.addResEvent calendarDay resName craftAmt poolPaid
                // craft.upgrades fan-out + stats: UI seams (no base craft defines them)
                poolGained, wp, true
            else
                pool, wp, false

/// orig _getCraftAllCountInternal (L2793): min over prices of stock/price.
let private getCraftAllCountInternal (getResValue: string -> float) (prices: Price list) : float =
    let mutable minAmt = System.Double.MaxValue
    for p in prices do
        let allAmt = getResValue p.Resource / p.Val
        if allAmt < minAmt then minAmt <- allAmt
    minAmt

/// orig getCraftAllCount (L2787): floor of the internal minimum.
let getCraftAllCount (cache: Game.Effects.EffectsCache) (traditionResearched: bool) (getResValue: string -> float) (wp: WorkshopPool) (craftName: string) : float =
    match wp.Crafts |> Map.tryFind craftName with
    | None -> 0.0
    | Some craft ->
        let prices = getCraftPrice cache traditionResearched craft.Def
        floor (getCraftAllCountInternal getResValue prices)

/// orig craftAll (L2807): craft the floor maximum with bypassResourceCheck.
let craftAll (calendarDay: int) (cache: Game.Effects.EffectsCache) (traditionResearched: bool) (crCtx: CraftRatioContext) (getResValue: string -> float) (craftName: string) (pool: ResPool) (wp: WorkshopPool) : ResPool * WorkshopPool * bool =
    let minAmt = getCraftAllCount cache traditionResearched getResValue wp craftName
    if 0.0 < minAmt && minAmt < System.Double.MaxValue then
        let pool', wp', ok = craft calendarDay cache traditionResearched crCtx craftName minAmt pool wp
        pool', wp', ok
    else
        pool, wp, false

/// orig getEffectEngineer (L2734-2752): per-engineer craft progress per tick.
let getEffectEngineer (cache: Game.Effects.EffectsCache) (prodCache: Map<string, float>) (neuralNetworksResearched: bool) (wp: WorkshopPool) (resName: string) : float =
    match wp.Crafts |> Map.tryFind resName with
    | None -> 0.0
    | Some craft ->
        let kittenResProduction =
            (prodCache |> Map.tryFind ("ES" + resName) |> Option.defaultValue 0.0)
            * (if neuralNetworksResearched then 2.0 else 1.0)
        // HG scaling bonus seam: simScalingRatio 0 → 1
        let tierCraftRatioRaw =
            match craft.Def.Tier with
            | Some t -> Game.Effects.getEffect cache ("t" + string t + "CraftRatio") + Game.Effects.getEffect cache "UniversalKnowHow"
            | None -> 0.0
        let tierCraftRatio = if tierCraftRatioRaw = 0.0 then 1.0 else tierCraftRatioRaw
        let ticksPerSecond = 5.0
        let handicap = craft.Def.ProgressHandicap
        kittenResProduction * tierCraftRatio / (600.0 * ticksPerSecond * handicap)

/// orig workshop.fastforward(update) effectsBase slice (L2885-2884): oilMax /
/// scienceMax / cultureMax / faithMax — manuscript/compendia caps. Called every
/// tick from workshop.update BEFORE craftByEngineers.
let workshopEffectsBase (cache: Game.Effects.EffectsCache) (getResValue: string -> float) (codexResearched: bool) : Map<string, float> =
    let oilMax = floor (getResValue "tanker" * 500.0)
    // scienceMaxCap: bld scienceMax + pyramid seam + ironWill ×10 + codex branch
    let scienceMaxCap = Game.Effects.getEffect cache "scienceMax"
    let compendiaScienceMax = floor (getResValue "compedium" * 10.0)
    let scienceMax = min compendiaScienceMax scienceMaxCap
    let cultureBonusRaw = floor (getResValue "manuscript")
    let cultureMax = Game.Math.getUnlimitedDR cultureBonusRaw 0.01 * (1.0 + Game.Effects.getEffect cache "cultureFromManuscripts")
    let faithFromManuscripts = Game.Effects.getEffect cache "faithFromManuscripts"
    let faithMax =
        if faithFromManuscripts > 0.0 then
            let faithMaxBld = Game.Effects.getEffect cache "faithMax"
            let unimpededCap = 10000.0 + faithMaxBld * 0.15
            let stripe = 0.02
            let threshold = Game.Math.getInverseUnlimitedDR unimpededCap stripe
            if cultureBonusRaw > threshold then
                let scaling = Game.Math.getLimitedDR (1.0 + 0.021715 * log (cultureBonusRaw / threshold)) 10.0
                unimpededCap * scaling
            else
                Game.Math.getUnlimitedDR cultureBonusRaw stripe
            |> fun v -> v * faithFromManuscripts
        else 0.0
    let _ = codexResearched
    Map.ofList
        [ "oilMax", oilMax
          "scienceMax", scienceMax
          "cultureMax", cultureMax
          "faithMax", faithMax ]

/// orig craftByEngineers (L2890-2915): progress accumulation + auto-craft.
/// `times` = ticks elapsed (1 per tick from update). The isStorageLimited
/// craftable branch reads the PRE-tick craft states (orig reads the live meta
/// objects, which the loop mutates one craft at a time).
let craftByEngineers (calendarDay: int) (cache: Game.Effects.EffectsCache) (traditionResearched: bool) (crCtx: CraftRatioContext) (getResValue: string -> float) (prodCache: Map<string, float>) (neuralNetworksResearched: bool) (times: float) (pool: ResPool) (wp: WorkshopPool) : ResPool * WorkshopPool * float =
    let mutable pool = pool
    let mutable crafts = wp.Crafts
    let mutable craftsDone = 0.0
    let craftCtx : Game.Resources.CraftContext =
        { CraftUnlocked = fun n -> (wp.Crafts |> Map.tryFind n |> Option.map (fun c -> c.Unlocked)) |> Option.defaultValue false
          CraftIsLimited = fun n -> (wp.Crafts |> Map.tryFind n |> Option.map (fun c -> c.IsLimited)) |> Option.defaultValue false }
    for name in wp.CraftOrder do
        let craftState = crafts.[name]
        let priceList = getCraftPrice cache traditionResearched craftState.Def
        let prices = priceList |> List.map (fun p -> (p.Resource, p.Val))
        // cache storage-limited state for every craft (even value 0)
        let isLimited = Game.Resources.isStorageLimited craftCtx pool prices
        crafts <- crafts |> Map.add name { craftState with IsLimited = isLimited }
        if craftState.Value = 0.0 then
            ()
        else
            let currentProgress =
                max craftState.Progress 0.0
                + times * getEffectEngineer cache prodCache neuralNetworksResearched wp name
            if currentProgress >= 1.0 then
                let currentProgress = min currentProgress (getCraftAllCountInternal getResValue priceList)
                let units = floor currentProgress
                if not isLimited then
                    let pool', _wpIgnored, ok = craft calendarDay cache traditionResearched crCtx name units pool { wp with Crafts = crafts }
                    if ok then
                        pool <- pool'
                        craftsDone <- craftsDone + units
                        crafts <- crafts |> Map.add name { crafts.[name] with Progress = currentProgress - units }
            elif Game.Resources.hasRes pool prices currentProgress then
                crafts <- crafts |> Map.add name { crafts.[name] with IsLimitedAmt = false; Progress = currentProgress }
            else
                crafts <- crafts |> Map.add name { crafts.[name] with IsLimitedAmt = true }
    pool, { wp with Crafts = crafts }, craftsDone

/// orig UpgradeButtonController buyItem → onPurchase: pay, set researched.
let buyUpgrade (calendarDay: int) (name: string) (pool: ResPool) (wp: WorkshopPool) : ResPool * WorkshopPool * bool =
    match wp.Upgrades |> Map.tryFind name with
    | Some upg when not upg.Researched ->
        let prices = upg.Def.Prices |> List.map (fun p -> (p.Resource, p.Val))
        if Game.Resources.hasRes pool prices 0.0 then
            let pool' = Game.Resources.payPrices calendarDay pool prices
            let wp' = { wp with Upgrades = wp.Upgrades |> Map.add name { upg with Researched = true } }
            pool', wp', true
        else
            pool, wp, false
    | _ -> pool, wp, false

/// orig workshop.unlock (L2919-2932): mark researched, run handler (seam),
/// fan out unlocks/upgrades. Returns updated pool + fan-outs for the dispatcher.
let unlockZebraUpgrade (name: string) (wp: WorkshopPool) : WorkshopPool * UnlockList option * UnlockList option =
    match wp.ZebraUpgrades |> Map.tryFind name with
    | Some z when not z.Researched ->
        let def = Game.Catalog.Defs.zebraUpgradeDefs |> List.find (fun u -> u.Name = name)
        let wp' = { wp with ZebraUpgrades = wp.ZebraUpgrades |> Map.add name { z with Researched = true } }
        wp', def.Unlocks, def.Upgrades
    | _ -> wp, None, None

/// orig village defaultFaunaNames (js/village.js L1851)
let defaultFaunaNames : string list = [ "giant moth"; "mantis"; "slime mold" ]

// --- science-09: lookup, relation unlock, price computation (L2206-2280) ------

/// orig checkRelation (L2232-2234): race embassy level >= needed. The caller
/// reads the live embassy level (Managers compiles before Diplomacy).
let checkRelation (embassyLevel: int) (embassyNeeded: int) : bool =
    embassyLevel >= embassyNeeded

/// orig unlockRelations (L2236-2245): with the diplomacy perk, all relation
/// policies unlock. Called on load + after every embassy purchase.
let unlockRelations
    (diplomacyPerkResearched: bool)
    (getEmbassyLevel: string -> int)
    (sp: SciencePool)
    : SciencePool * string list =
    if diplomacyPerkResearched then
        let mutable sp = sp
        let mutable unlockedList = []
        for (name, pol) in sp.Policies |> Map.toList do
            let gateOpen =
                match pol.Def.RelationGate with
                | Some (race, needed) -> getEmbassyLevel race >= needed
                | None -> pol.Def.IsRelation // non-gated relation policies open freely
            if pol.Def.IsRelation && gateOpen && not pol.Unlocked then
                sp <- { sp with Policies = sp.Policies |> Map.add name { pol with Unlocked = true } }
                unlockedList <- name :: unlockedList
        sp, List.rev unlockedList
    else
        sp, []

/// orig science.getPrices: leader seam (wise scientist → identity at this
/// slice) + unicornTears challenge branch (seam). Prices are the static table.
let getTechPrices (sp: SciencePool) (name: string) : Price list =
    match sp.Techs |> Map.tryFind name with
    | Some t -> t.Def.Prices
    | None -> []

// --- game-04/19: workshop.undo — craft refund (js/workshop.js L2752-2776) -----

/// orig workshop.undo: fail unless the crafted stock is still there; then
/// un-gain the product and refund exactly what was spent.
let undoCraft
    (calendarDay: int)
    (craft: string)
    (gained: float)
    (spent: (string * float) list)
    (pool: ResPool)
    : ResPool * bool =
    let stock = Game.Resources.get pool craft |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0
    if stock < gained then
        pool, false
    else
        let pool1, _ = Game.Resources.addResEvent calendarDay craft (-gained) pool
        let mutable pool' = pool1
        for (name, value) in spent do
            let p, _ = Game.Resources.addResEvent calendarDay name value pool'
            pool' <- p
        pool', true

// --- game-04: unlock/upgrade dispatch (orig game.unlock / game.upgrade) -------
// Metas unlock by id across registries; targets may veto via evaluateLocks
// (none of the fresh-reachable metas have them — recorded for later units).

let unlock
    (buildings: string list)
    (tabs: string list)
    (jobs: string list)
    (techs: string list)
    (policies: string list)
    (upgrades: string list)
    (zebraUpgrades: string list)
    (crafts: string list)
    (bpool: BldPool)
    (sp: SciencePool)
    (wp: WorkshopPool)
    : BldPool * SciencePool * WorkshopPool =
    let mutable bpool = bpool
    for name in buildings do
        match get bpool name with
        | Some b -> bpool <- { bpool with ByName = bpool.ByName |> Map.add name { b with Unlockable = true } }
        | None -> ()
    // tabs: visible flag on the tab registry (UI-owned) — no snapshotted state
    let mutable sp = sp
    for name in techs do
        match getTech sp name with
        | Some t -> sp <- { sp with Techs = sp.Techs |> Map.add name { t with Unlocked = true } }
        | None -> ()
    for name in policies do
        match sp.Policies |> Map.tryFind name with
        | Some p -> sp <- { sp with Policies = sp.Policies |> Map.add name { p with Unlocked = true } }
        | None -> ()
    let mutable wp = wp
    for name in upgrades do
        match wp.Upgrades |> Map.tryFind name with
        | Some u -> wp <- { wp with Upgrades = wp.Upgrades |> Map.add name { u with Unlocked = true } }
        | None -> ()
    for name in zebraUpgrades do
        match wp.ZebraUpgrades |> Map.tryFind name with
        | Some z -> wp <- { wp with ZebraUpgrades = wp.ZebraUpgrades |> Map.add name { z with Unlocked = true } }
        | None -> ()
    for name in crafts do
        match wp.Crafts |> Map.tryFind name with
        | Some c -> wp <- { wp with Crafts = wp.Crafts |> Map.add name { c with Unlocked = true } }
        | None -> ()
    // jobs unlock: applied to the village pool by the caller (JobUnlocked set);
    // jobs/tabs touch no state owned here (no snapshotted effect)
    let _ = jobs
    let _ = tabs
    bpool, sp, wp

/// orig game.upgrade(list): recalculate effects for metas that define
/// calculateEffects — with all such functions val-constant (session 08), this is
/// a no-op on tables whose values are already baked into the catalogs. Job
/// calculateEffects (D012) is the exception — handled by the caller (village).

// --- village-02/03/04/05a: kitten sim core (orig js/village.js) ----------------

type Kitten =
    { Name: string
      Surname: string
      Job: string option
      Rank: int
      Exp: float
      Seed: int
      Trait: string
      Age: float
      Color: int
      Variety: int
      Rarity: int
      IsLeader: bool
      Skills: Map<string, float>
      EngineerSpeciality: string option }

type VillagePool =
    { Kittens: Kitten list
      NextKittenProgress: float
      MaxKittens: int
      JobValues: Map<string, int> // jobRef.value counters (diverge from kitten jobs, OBS-2)
      JobUnlocked: Set<string>
      Happiness: float
      DeathTimeout: int
      LeaderSeed: int option // orig stores the kitten object; fs keys by seed
      Traits: string list } // village.traits — newest-first unshift on arrivals

let initVillage (jobDefs: Game.Catalog.Village.JobDef list) : VillagePool =
    { Kittens = []
      NextKittenProgress = 0.0
      MaxKittens = 0
      JobValues = jobDefs |> List.map (fun j -> (j.Name, 0)) |> Map.ofList
      JobUnlocked =
        jobDefs
        |> List.filter (fun j -> j.StartsUnlocked)
        |> List.map (fun j -> j.Name)
        |> Set.ofList
      Happiness = 1.0
      DeathTimeout = 0
      LeaderSeed = None
      Traits = [] }

/// orig calculateSimMaxKittens: maxKittens effect (huts ×val etc. via cache).
let calculateMaxKittens (cache: Game.Effects.EffectsCache) (pool: VillagePool) : int =
    let maxKittens = Game.Effects.getEffect cache "maxKittens"
    int (floor maxKittens)

/// orig sim.addKitten: ONE global PRNG draw (the kitten seed via
/// generateKittenSeed → uniformRandomInteger(0, SEED_MAX+1)); ALL attributes
/// (name/surname/trait/age) roll on the kitten's private Lehmer LCG seeded
/// from it (js/village.js L1474, L1521-1545, L1495-1517) — bit-exact port.
let generateKittenSeed (rand: unit -> float) : int =
    uniformRandomInteger rand 0.0 1000000.0 |> int

let private kittenLcg (seed: int) : int -> int =
    let mutable state = float ((seed + 1) % 2147483647)
    fun (ratio: int) ->
        state <- state * 16807.0 % 2147483647.0
        int (floor ((state - 1.0) / 2147483646.0 * float ratio))

/// orig Kitten._generateAttributes (village.js L1483-1515) draw-for-draw on the
/// kitten's private Lehmer LCG: name, surname, trait, age 5+rand(10) with the
/// rand(100)<30 growth roll, then the color/variety/rarity tables.
let private makeKitten (seed: int) : Kitten =
    let rand = kittenLcg seed
    let name = Game.Catalog.Village.names.[rand Game.Catalog.Village.names.Length]
    let surname = Game.Catalog.Village.surnames.[rand Game.Catalog.Village.surnames.Length]
    let trait = Game.Catalog.Village.traitDefs.[rand Game.Catalog.Village.traitDefs.Length].Name
    let mutable age = 5.0 + float (rand 10)
    if rand 100 < 30 then age <- age + float (rand 30)
    // 10% chance of one of 6 primary colors; colored cats roll 5 rare varieties
    let mutable color = 0
    let mutable variety = 0
    if rand 100 <= 10 then
        color <- rand 6 + 1
        if rand 100 <= 10 then variety <- rand 4 + 1
    // 5% rarity 1-2, plus 10% extra on top
    let mutable rarity = 0
    if rand 100 <= 5 then
        rarity <- rand 2 + 1
        if rand 100 <= 10 then rarity <- rarity + 1
    { Name = name; Surname = surname; Job = None; Rank = 0; Exp = 0.0; Seed = seed
      Trait = trait; Age = age; Color = color; Variety = variety; Rarity = rarity
      IsLeader = false; Skills = Map.empty; EngineerSpeciality = None }

let addKitten (rand: unit -> float) (pool: VillagePool) : VillagePool =
    let seed = generateKittenSeed rand
    let kitten = makeKitten seed
    // orig addKitten: village.traits.unshift(trait) when new
    let traits =
        if pool.Traits |> List.contains kitten.Trait then pool.Traits
        else kitten.Trait :: pool.Traits
    { pool with Kittens = pool.Kittens @ [ kitten ]; Traits = traits }

/// Everything the skill-learning half of sim.update reads.
type SkillContext =
    { AnarchyActive: bool
      InternetResearched: bool
      NeuralNetworksResearched: bool
      SkillXPEffect: float
      MaxKittensRatioLDR: float
      Day: int
      GetJobValue: string -> int
      GetJobUnlocked: string -> bool
      Times: int }

/// orig sim.update skill half (L3285-3338): frequency applies only at
/// times=1; each working kitten learns its job skill (+exp) and either spreads
/// to other unlocked jobs (neuralNetworks) or forgets them.
let learnSkills (ctx: SkillContext) (pool: VillagePool) : VillagePool =
    let kittens = pool.Kittens
    let hgSkillModifier =
        if pool.Kittens.Length <= pool.MaxKittens then
            1.0 / (1.0 + Game.Math.getLimitedDR ctx.MaxKittensRatioLDR 1.0)
        else 1.0
    let baseSkillXP =
        if ctx.InternetResearched then
            max (float pool.Kittens.Length * hgSkillModifier / 10000.0) 0.01
        else 0.01
    let skillXP = (baseSkillXP + ctx.SkillXPEffect) * float ctx.Times
    let skillsCap = 20001.0
    let updated =
        kittens
        |> List.map (fun kitten ->
            let mutable kitten = kitten
            // legacy hacks (exp migration from skills / rank default / trait roll)
            // do not fire for port kittens (exp starts 0, rank present, trait set)
            match kitten.Job with
            | Some job when ctx.Day >= 0 && not ctx.AnarchyActive ->
                let jobSkill = kitten.Skills |> Map.tryFind job |> Option.defaultValue 0.0
                let mutable skills = kitten.Skills
                // engineers without a speciality do not learn
                if not (job = "engineer" && kitten.EngineerSpeciality = None) then
                    if jobSkill < skillsCap then
                        skills <- skills |> Map.add job (min (jobSkill + skillXP) skillsCap)
                    kitten <- { kitten with Exp = kitten.Exp + skillXP }
                if ctx.NeuralNetworksResearched then
                    for jobName in Game.Catalog.Village.jobDefs |> List.map (fun j -> j.Name) do
                        if ctx.GetJobUnlocked jobName && ctx.GetJobValue jobName > 0 then
                            let s = skills |> Map.tryFind jobName |> Option.defaultValue 0.0
                            if s <> skillsCap then
                                skills <- skills |> Map.add jobName (min (s + float ctx.Times * 0.001 * float (ctx.GetJobValue jobName)) skillsCap)
                else
                    skills <-
                        skills
                        |> Map.map (fun sk v ->
                            if sk <> job && v > 0.0 then
                                let decay = min (float ctx.Times * 0.001) v
                                v - decay
                            else v)
                kitten <- { kitten with Skills = skills }
                kitten
            | _ -> kitten)
    { pool with Kittens = updated }

/// orig sim.update(kittensPerTick, times): births from progress accumulation.
let simUpdate (maxKittens: int) (kittensPerTick: float) (times: int) (rand: unit -> float) (pool: VillagePool) : VillagePool =
    let mutable pool = pool
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
    // skill learning lives in learnSkills (village-10/12) — the runner calls
    // it after simUpdate with the full context (exp, NN spread, engineer gate)
    { pool with Kittens = pool.Kittens }

/// orig village.assignJob (manager level): amt capped by free kittens and the
/// job limit (manager default 100000 here); the counter bumps by the capped amt
/// — which can still over-count vs actual sim assignments (OBS-2 orig quirk).
/// orig getFreeKittens: kittens without a job.
let getFreeKittens (vpool: VillagePool) : int =
    vpool.Kittens |> List.filter (fun k -> k.Job = None) |> List.length

/// orig sim.killKittens(amount): removes the LAST n kittens (their job counters
/// decremented — orig routes through village.unassignJob, which also decrements
/// the craft.value of dead engineers via unassignCraftJobIfEngineer). Returns
/// the dead engineers' specialities for the caller's craft bookkeeping. Stats
/// seam (stats-01). Orig tail: updateResourceProduction + updateResources —
/// the CALLER (runner) mirrors those cache refreshes.
let killKittens (amount: int) (vpool: VillagePool) : VillagePool * string list =
    let amount = min amount vpool.Kittens.Length
    let survivors = vpool.Kittens |> List.take (vpool.Kittens.Length - amount)
    let mutable jobValues = vpool.JobValues
    let mutable deadSpecialities = []
    for k in vpool.Kittens |> List.skip (vpool.Kittens.Length - amount) do
        match k.Job with
        | Some j ->
            let cur = jobValues |> Map.tryFind j |> Option.defaultValue 0
            jobValues <- jobValues |> Map.add j (max 0 (cur - 1))
        | None -> ()
        match k.EngineerSpeciality with
        | Some sp -> deadSpecialities <- sp :: deadSpecialities
        | None -> ()
    let leaderDead =
        match vpool.LeaderSeed with
        | Some ls -> survivors |> List.forall (fun k -> k.Seed <> ls)
        | None -> false
    { vpool with
        Kittens = survivors
        JobValues = jobValues
        LeaderSeed = if leaderDead then None else vpool.LeaderSeed }, deadSpecialities

/// orig village.update starvation branch (L430-462): kittens > 0 and catnip
/// value + perTick < 0 -> kill min(1, |resDiff| rounded), deathTimeout = tps*5;
/// else deathTimeout decrements. winterIsComing freeze branch folded in.
let starvationStep
    (catnipValue: float)
    (catnipPerTick: float)
    (ticksPerSecond: float)
    (winterIsComingActive: bool)
    (maxKittens: int)
    (vpool: VillagePool)
    : VillagePool =
    let kittens = vpool.Kittens.Length
    if kittens > 0 then
        let resDiff = catnipValue + catnipPerTick
        let starving = resDiff < 0 || (winterIsComingActive && kittens > maxKittens)
        if starving then
            let mutable starved = int (abs (jsRound resDiff))
            if starved > 1 then starved <- 1
            if starved > 0 && vpool.DeathTimeout <= 0 then
                let vpool', _deadSpecialities = killKittens starved vpool
                { vpool' with DeathTimeout = int (ticksPerSecond * 5.0) }
            else
                // orig decrements in EVERY starving non-kill tick (the timeout
                // may go negative); NOT starving leaves it untouched (L455-461)
                { vpool with DeathTimeout = vpool.DeathTimeout - 1 }
        else
            vpool
    else
        vpool

// --- village-06: leaders -------------------------------------------------------

/// orig makeLeader(kitten) (L750-769). The theocracy gate is a policy seam
/// (not researched at this slice). anarchy clears the leader.
let makeLeader (anarchyActive: bool) (theocracyBlocks: bool) (seed: int option) (vpool: VillagePool) : VillagePool =
    let cleared =
        { vpool with
            Kittens =
                vpool.Kittens
                |> List.map (fun k -> if k.IsLeader then { k with IsLeader = false } else k) }
    if anarchyActive || seed = None || theocracyBlocks then
        { cleared with LeaderSeed = None }
    else
        match seed with
        | None -> cleared
        | Some s ->
            let kittens =
                cleared.Kittens
                |> List.map (fun k -> if k.Seed = s then { k with IsLeader = true } else k)
            { cleared with Kittens = kittens; LeaderSeed = Some s }

/// orig getLeaderBonus(rank) (L776-781): rank 0 → 1.0, else (rank+1)/1.4,
/// authocracy doubles it.
let getLeaderBonus (authocracyResearched: bool) (rank: int) : float =
    let bonus = if rank = 0 then 1.0 else (float rank + 1.0) / 1.4
    if authocracyResearched then bonus * 2.0 else bonus

/// The leader's current trait (from the leader seed).
let leaderTrait (vpool: VillagePool) : string option =
    match vpool.LeaderSeed with
    | None -> None
    | Some s -> vpool.Kittens |> List.tryFind (fun k -> k.Seed = s) |> Option.map (fun k -> k.Trait)

/// orig getRankExp(rank) (L224-226): 500 × 1.75^rank.
let getRankExp (rank: int) : float = 500.0 * (1.75 ** float rank)

// --- village-10: skill curves --------------------------------------------------

/// orig getValueModifierPerSkill (L1292-1324): anarchy zeroes it; the top tier
/// scales by (1 + masterSkillMultiplier); everything × (1 + skillMultiplier).
let getValueModifierPerSkill (anarchyActive: bool) (masterSkillMultiplier: float) (skillMultiplier: float) (value: float) : float =
    if anarchyActive then 0.0
    else
        let bonus =
            if value < 100.0 then 0.0
            elif value < 500.0 then 0.0125
            elif value < 1200.0 then 0.025
            elif value < 2500.0 then 0.045
            elif value < 5000.0 then 0.075
            elif value < 9000.0 then 0.125
            else 0.1875 * (1.0 + masterSkillMultiplier)
        bonus * (1.0 + skillMultiplier)

/// orig getSkillExpRange (L1326-1341).
let getSkillExpRange (value: float) : float * float =
    if value < 100.0 then (0.0, 100.0)
    elif value < 500.0 then (100.0, 500.0)
    elif value < 2500.0 then (500.0, 2500.0)
    elif value < 5000.0 then (2500.0, 5000.0)
    elif value < 9000.0 then (5000.0, 9000.0)
    elif value < 20000.0 then (9000.0, 20000.0)
    else (20000.0, value)

// --- village-13: promote internals ---------------------------------------------

/// expToPromote (L3706-3714): sum of getRankExp over the rank span.
let expToPromote (rankBase: int) (rankFinal: int) (expNeeded: float) : bool * float =
    let mutable total = 0.0
    for i in 0 .. (rankFinal - rankBase - 1) do
        total <- total + getRankExp (rankBase + i)
    if total > expNeeded then (false, 0.0) else (true, total)

/// goldToPromote (L3716-3726): 25 × rank per step.
let goldToPromote (rankBase: int) (rankFinal: int) (goldNeeded: float) : bool * float =
    let mutable total = 0.0
    for i in 0 .. (rankFinal - rankBase - 1) do
        total <- total + 25.0 * float (rankBase + i + 1)
    if total > goldNeeded then (false, 0.0) else (true, total)

/// sim.promote (L3655-3704): returns 1 promoted / 0 ineligible / -1 no gold /
/// -2 no exp. Mutates the kitten list (rank, exp) and the gold pool.
let rec promote (anarchyActive: bool) (rankTarget: int option) (seed: int) (vpool: VillagePool) (pool: ResPool) : VillagePool * ResPool * int =
    if anarchyActive then vpool, pool, 0
    else
        match vpool.Kittens |> List.tryFind (fun k -> k.Seed = seed) with
        | None -> vpool, pool, 0
        | Some kitten ->
            let kittenRank = kitten.Rank
            let rankFinal, rankDiff =
                match rankTarget with
                | None -> kittenRank + 1, 1
                | Some r -> r, r - kittenRank
            if rankDiff <= 0 then vpool, pool, 0
            else
                let (expOk, expCost) = expToPromote kittenRank rankFinal kitten.Exp
                let gold = Game.Resources.get pool "gold" |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0
                let (goldOk, goldCost) = goldToPromote kittenRank rankFinal gold
                if expOk && goldOk then
                    let kittens =
                        vpool.Kittens
                        |> List.map (fun k ->
                            if k.Seed = seed then { k with Rank = rankFinal; Exp = k.Exp - expCost } else k)
                    let pool1, _ = Game.Resources.addResEvent 0 "gold" (-goldCost) pool
                    { vpool with Kittens = kittens }, pool1, 1
                elif rankDiff > 1 then
                    promote anarchyActive None seed vpool pool
                elif expOk && not goldOk then
                    vpool, pool, -1
                else vpool, pool, -2

/// orig sim.sortKittensByExp (village.js L3395-3400): rank asc then exp asc
/// (JS stable sort → F# stable List.sortWith). Used by cryochamber reserves.
let sortKittensByExp (pool: VillagePool) : VillagePool =
    let sorted =
        pool.Kittens
        |> List.sortWith (fun a b ->
            if a.Rank <> b.Rank then compare a.Rank b.Rank else compare a.Exp b.Exp)
    { pool with Kittens = sorted }

let assignJob (name: string) (amt: int) (jobLimit: int) (vpool: VillagePool) : VillagePool =
    let current = vpool.JobValues |> Map.tryFind name |> Option.defaultValue 0
    let free = getFreeKittens vpool
    // jobLimit computed by the caller (orig getJobLimit: engineer = factory.val,
    // ambassador = perk-gated race count, manager default 100000)
    let capped = min amt (min free (jobLimit - current))
    if capped > 0 then
        { vpool with JobValues = vpool.JobValues |> Map.add name (current + capped) }
    else
        vpool

/// orig sim.assignJob(job, amt, optimize): assign up to amt free kittens
/// (reverse iteration, no optimize at fresh — register perk not researched).
let simAssignJob (job: string) (amt: int) (vpool: VillagePool) : VillagePool =
    let mutable vpool = vpool
    // orig iterates kittens REVERSED collecting free ones, then shift() takes
    // from the front — i.e. the LAST free kitten is assigned first
    let mutable freeIds =
        vpool.Kittens
        |> List.indexed
        |> List.filter (fun (_, k) -> k.Job = None)
        |> List.map fst
        |> List.rev
    let mutable n = amt
    while n > 0 && not freeIds.IsEmpty do
        let id = freeIds.Head
        freeIds <- freeIds.Tail
        let k = vpool.Kittens.[id]
        vpool <- { vpool with Kittens = vpool.Kittens |> List.updateAt id { k with Job = Some job } }
        n <- n - 1
    vpool

/// orig village.updateResourceProduction (js/village.js L626-728): the CACHED
/// per-kitten production map. Orig refreshes this on a 10-tick timer, on job
/// assignment/promotion, and lazily on first read (village.js L603-605) — the
/// runner owns that timing; this function is the pure recompute. Includes the
/// engineer "ES<craft>" keys (L691-721).
let getResProduction
    (cache: Game.Effects.EffectsCache)
    (vpool: VillagePool)
    (jobDefs: Map<string, Game.Catalog.Village.JobDef>)
    (wp: WorkshopPool)
    : Map<string, float> =
    let mutable res = Map.empty<string, float>
    // happiness + happinessKittenProductionRatio seam (0 at fresh)
    let happiness = vpool.Happiness
    let eff = Game.Effects.getEffect cache
    let anarchyActive = eff "kittenLaziness" > 0.0 || false // anarchy via challengesGroup effect
    let authocracyResearched = false // policy seam (fresh)
    let leaderRank =
        match vpool.LeaderSeed with
        | Some ls -> vpool.Kittens |> List.tryFind (fun k -> k.Seed = ls) |> Option.map (fun k -> k.Rank)
        | None -> None

    for k in vpool.Kittens do
        match k.Job with
        | None -> ()
        | Some jobName ->
            match jobDefs |> Map.tryFind jobName with
            | None -> ()
            | Some jobDef ->
                let modifiers =
                    match jobDef.CalculatedModifiers with
                    | Some m -> m
                    | None -> jobDef.Modifiers
                // orig getValueModifierPerSkill (L1292): anarchy zero, top tier
                // × (1 + masterSkillMultiplier), all × (1 + skillMultiplier)
                let skill = k.Skills |> Map.tryFind jobName |> Option.defaultValue 0.0
                let skillMod =
                    getValueModifierPerSkill
                        anarchyActive (eff "masterSkillMultiplier") (eff "skillMultiplier") skill
                // rank multiplier: 1 + <job>BoostPerRank × rank (effect 0 at fresh)
                let rankMultiplier = 1.0 + eff (jobName + "BoostPerRank") * float k.Rank
                for KeyValue(resName, baseMod) in modifiers do
                    let mutable diff = baseMod + baseMod * skillMod
                    diff <- diff * rankMultiplier
                    if diff > 0.0 then
                        // leader folds (L671-679): the leader's own job gets the
                        // full bonus; other kittens fold (bonus-1)×boostFromLeader
                        if k.IsLeader then
                            diff <- diff * getLeaderBonus authocracyResearched k.Rank
                        else
                            match leaderRank with
                            | Some lr -> diff <- diff * (1.0 + (getLeaderBonus authocracyResearched lr - 1.0) * eff "boostFromLeader")
                            | None -> ()
                        diff <- diff * happiness
                    res <- res |> Map.change resName (function Some prev -> Some(prev + diff) | None -> Some diff)

                // engineer speciality → "ES<craft>" production key (L691-721)
                if jobName = "engineer" then
                    match k.EngineerSpeciality with
                    | None -> ()
                    | Some speciality ->
                        match wp.Crafts |> Map.tryFind speciality with
                        | None -> ()
                        | Some craftState ->
                            let automationBonus = eff (speciality + "AutomationBonus")
                            let mutable diff = 1.0 + automationBonus
                            let rankDiff =
                                match craftState.Def.Tier with
                                | Some t -> t - float k.Rank
                                | None -> 0.0
                            if rankDiff > 0.0 then
                                diff <- diff - diff * rankDiff * 0.15
                            diff <- diff + diff * skillMod
                            if diff > 0.0 then
                                if k.IsLeader then
                                    diff <- diff * getLeaderBonus authocracyResearched k.Rank
                                else
                                    match leaderRank with
                                    | Some lr -> diff <- diff * (1.0 + (getLeaderBonus authocracyResearched lr - 1.0) * eff "boostFromLeader")
                                    | None -> ()
                            if diff > 0.0 then
                                diff <- diff * happiness
                            let key = "ES" + speciality
                            res <- res |> Map.change key (function Some prev -> Some(prev + diff) | None -> Some diff)
    res

/// orig village.getFreeEngineers (L573-578): engineers minus sum of craft values.
let getFreeEngineers (vpool: VillagePool) (wp: WorkshopPool) : float =
    let engineerCount = vpool.JobValues |> Map.tryFind "engineer" |> Option.defaultValue 0 |> float
    let assigned = wp.CraftOrder |> List.sumBy (fun n -> (wp.Crafts.[n]).Value)
    engineerCount - assigned

/// orig sim.assignCraftJob (L3577-3615): give the speciality to one free
/// engineer kitten (reverse iteration, optimize seam skipped — no register).
let simAssignCraftJob (craftName: string) (vpool: VillagePool) : VillagePool * bool =
    let mutable assignedId = -1
    let mutable i = vpool.Kittens.Length - 1
    while assignedId < 0 && i >= 0 do
        let k = vpool.Kittens.[i]
        if k.Job = Some "engineer" && k.EngineerSpeciality = None then
            assignedId <- i
        i <- i - 1
    if assignedId >= 0 then
        let k = vpool.Kittens.[assignedId]
        { vpool with Kittens = vpool.Kittens |> List.updateAt assignedId { k with EngineerSpeciality = Some craftName } }, true
    else
        vpool, false

/// orig sim.unassignCraftJobIfEngineer (L3652-3659)
let unassignCraftJobIfEngineer (vpool: VillagePool) (kittenId: int) : VillagePool * string option =
    let k = vpool.Kittens.[kittenId]
    match k.Job, k.EngineerSpeciality with
    | Some "engineer", Some speciality ->
        { vpool with Kittens = vpool.Kittens |> List.updateAt kittenId { k with EngineerSpeciality = None } }, Some speciality
    | _ ->
        let k' = if k.EngineerSpeciality <> None then { k with EngineerSpeciality = None } else k
        { vpool with Kittens = vpool.Kittens |> List.updateAt kittenId k' }, None

/// orig sim.clearCraftJobs (L3663-3673)
let clearCraftJobs (vpool: VillagePool) : VillagePool =
    { vpool with
        Kittens =
            vpool.Kittens
            |> List.map (fun k -> if k.EngineerSpeciality <> None then { k with EngineerSpeciality = None } else k) }
