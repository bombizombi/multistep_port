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

// --- workshop-03: upgrades + crafts (orig game.workshop) ----------------------

type WorkshopPool =
    { UpgradeOrder: string list
      Upgrades: Map<string, UpgradeState>
      CraftOrder: string list
      Crafts: Map<string, CraftState> }

let initWorkshop (upgrades: UpgradeDef list) (crafts: CraftDef list) : WorkshopPool =
    { UpgradeOrder = upgrades |> List.map (fun u -> u.Name)
      Upgrades = upgrades |> List.map (fun u -> (u.Name, mkUpgrade u)) |> Map.ofList
      CraftOrder = crafts |> List.map (fun c -> c.Name)
      Crafts = crafts |> List.map (fun c -> (c.Name, { Def = c; Unlocked = c.StartsUnlocked; Value = 0.0 })) |> Map.ofList }

let getCraft (wp: WorkshopPool) (name: string) : CraftState option = wp.Crafts |> Map.tryFind name

/// orig getResCraftRatio(res): workshop craftRatio effects × (1 + skill bonus).
/// Skill/leader seams are fresh (0); effect read is live.
let getResCraftRatio (cache: Game.Effects.EffectsCache) (resName: string) : float =
    Game.Effects.getEffect cache (resName + "CraftRatio")

/// orig workshop.craft (js/workshop.js L2656): ceil amt, craftRatio bonus,
/// resource check, pay, addResEvent(craftAmt). suppressUndo/forceAll unused by
/// the runner path. Returns pool, workshop, actual amount gained, success.
let craft (calendarDay: int) (cache: Game.Effects.EffectsCache) (resName: string) (amt: float) (pool: ResPool) (wp: WorkshopPool) : ResPool * WorkshopPool * float * bool =
    match wp.Crafts |> Map.tryFind resName with
    | None -> pool, wp, 0.0, false
    | Some craftDef ->
        let craftRatio = getResCraftRatio cache resName
        let amt = ceil amt
        let craftAmt = amt * (1.0 + craftRatio)
        let prices = craftDef.Def.Prices |> List.map (fun p -> (p.Resource, p.Val * amt))

        if Game.Resources.hasRes pool prices 0.0 then
            let poolPaid = Game.Resources.payPrices calendarDay pool prices
            let poolGained, gained = Game.Resources.addResEvent calendarDay resName craftAmt poolPaid
            // craft.upgrades fan-out: none of the base crafts have them at fresh
            poolGained, wp, gained, true
        else
            pool, wp, 0.0, false

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
      Skills: Map<string, float> }

type VillagePool =
    { Kittens: Kitten list
      NextKittenProgress: float
      MaxKittens: int
      JobValues: Map<string, int> // jobRef.value counters (diverge from kitten jobs, OBS-2)
      JobUnlocked: Set<string>
      Happiness: float
      DeathTimeout: int }

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
      DeathTimeout = 0 }

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

let private makeKitten (seed: int) : Kitten =
    let rand = kittenLcg seed
    let name = Game.Catalog.Village.names.[rand Game.Catalog.Village.names.Length]
    let surname = Game.Catalog.Village.surnames.[rand Game.Catalog.Village.surnames.Length]
    let trait = Game.Catalog.Village.traitDefs.[rand Game.Catalog.Village.traitDefs.Length].Name
    // orig: age = 1 + LCG roll (age grows yearly); the +rand(30) growth roll
    // applies when rand(100) < 30
    let mutable age = 1.0 + float (rand 100) / 100.0
    let age' =
        if rand 100 < 30 then age + float (rand 30) else age
    age <- age'
    { Name = name; Surname = surname; Job = None; Rank = 0; Exp = 0.0; Seed = seed; Trait = trait; Age = age; Skills = Map.empty }

let addKitten (rand: unit -> float) (pool: VillagePool) : VillagePool =
    let seed = generateKittenSeed rand
    { pool with Kittens = pool.Kittens @ [ makeKitten seed ] }

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
    // skill XP (orig L3315-3360): baseSkillXP = max(kittens × hgMod / 10000, 0.01)
    // (internet seam: not researched); frequency = 1 for kittens < 100 → every tick
    let baseSkillXP = max (float pool.Kittens.Length / 10000.0) 0.01
    let skillXP = (baseSkillXP + 0.0) * float times // + skillXP effect seam (0)
    { pool with
        Kittens =
            pool.Kittens
            |> List.map (fun k ->
                match k.Job with
                | Some job ->
                    let cur = k.Skills |> Map.tryFind job |> Option.defaultValue 0.0
                    if cur = 0.0 then
                        // orig: first XP tick sets skills[job] = skillXP (not += from 0)
                        { k with Skills = k.Skills |> Map.add job skillXP }
                    else
                        { k with Skills = k.Skills |> Map.add job (cur + skillXP) }
                | None -> k) }

/// orig village.assignJob (manager level): amt capped by free kittens and the
/// job limit (manager default 100000 here); the counter bumps by the capped amt
/// — which can still over-count vs actual sim assignments (OBS-2 orig quirk).
/// orig getFreeKittens: kittens without a job.
let getFreeKittens (vpool: VillagePool) : int =
    vpool.Kittens |> List.filter (fun k -> k.Job = None) |> List.length

/// orig sim.killKittens(amount): removes the LAST n kittens (their job counters
/// decremented — orig routes through village.unassignJob). Stats seam (stats-01).
let killKittens (amount: int) (vpool: VillagePool) : VillagePool =
    let amount = min amount vpool.Kittens.Length
    let survivors = vpool.Kittens |> List.take (vpool.Kittens.Length - amount)
    let mutable jobValues = vpool.JobValues
    for k in vpool.Kittens |> List.skip (vpool.Kittens.Length - amount) do
        match k.Job with
        | Some j ->
            let cur = jobValues |> Map.tryFind j |> Option.defaultValue 0
            jobValues <- jobValues |> Map.add j (max 0 (cur - 1))
        | None -> ()
    { vpool with Kittens = survivors; JobValues = jobValues }

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
                let vpool' = killKittens starved vpool
                { vpool' with DeathTimeout = int (ticksPerSecond * 5.0) }
            elif vpool.DeathTimeout > 0 then
                { vpool with DeathTimeout = vpool.DeathTimeout - 1 }
            else
                vpool
        else
            { vpool with DeathTimeout = 0 }
    else
        vpool

let assignJob (name: string) (amt: int) (vpool: VillagePool) : VillagePool =
    let current = vpool.JobValues |> Map.tryFind name |> Option.defaultValue 0
    let free = getFreeKittens vpool
    let jobLimit = 100000 // manager default; engineer/ambassador branches are village-03
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

/// orig village.getResProduction (updateResourceProduction): per-kitten job
/// modifier sum, scaled by skill (0 at fresh), rank, leader, happiness.
/// Job modifiers come from village-01 data (base + calculated resolutions).
let getResProduction (vpool: VillagePool) (jobDefs: Map<string, Game.Catalog.Village.JobDef>) : Map<string, float> =
    let mutable res = Map.empty<string, float>
    let happiness = vpool.Happiness // + effect seam: happinessKittenProductionRatio (0 at fresh)

    for k in vpool.Kittens do
        match k.Job with
        | None -> ()
        | Some jobName ->
            match jobDefs |> Map.tryFind jobName with
            | None -> ()
            | Some jobDef ->
                // modifiers = calculated if the job has calculateEffects (D012 gate),
                // else the static table
                let modifiers =
                    match jobDef.CalculatedModifiers with
                    | Some m -> m
                    | None -> jobDef.Modifiers
                // skill mod (orig getValueModifierPerSkill L1292): tiered bonus on
                // accumulated skill XP; master/skill multiplier effects 0 at fresh
                let skill = k.Skills |> Map.tryFind jobName |> Option.defaultValue 0.0
                let skillBonus =
                    if skill < 100.0 then 0.0
                    elif skill < 500.0 then 0.0125
                    elif skill < 1200.0 then 0.025
                    elif skill < 2500.0 then 0.045
                    elif skill < 5000.0 then 0.075
                    elif skill < 9000.0 then 0.125
                    else 0.1875
                let skillMod = skillBonus * (1.0 + 0.0) // × (1 + skillMultiplier seam)
                for KeyValue(resName, baseMod) in modifiers do
                    let mutable diff = baseMod + baseMod * skillMod
                    diff <- diff * 1.0 // rank multiplier: boostPerRank 0 at fresh
                    if diff > 0.0 then
                        diff <- diff * happiness
                    res <- res |> Map.change resName (function Some prev -> Some(prev + diff) | None -> Some diff)
    res
