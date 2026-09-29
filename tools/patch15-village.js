#!/usr/bin/env node
"use strict";
// Batch-15: village internals — kitten identity exactness (age/color/variety/
// rarity rolls), leader system, skill learning, promote, leader effect hooks.
const fs = require("fs");

// --- Game.Managers.fs ---------------------------------------------------------
const pm = "kittens_land/src/Game/Game.Managers.fs";
let ms = fs.readFileSync(pm, "utf8");

// 1. Kitten gains identity + leader fields
ms = ms.replace(
`type Kitten =
    { Name: string
      Surname: string
      Job: string option
      Rank: int
      Exp: float
      Seed: int
      Trait: string
      Age: float
      Skills: Map<string, float>
      EngineerSpeciality: string option }`,
`type Kitten =
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
      EngineerSpeciality: string option }`);

// 2. exact makeKitten (_generateAttributes draw-for-draw)
ms = ms.replace(
`let private makeKitten (seed: int) : Kitten =
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
    { Name = name; Surname = surname; Job = None; Rank = 0; Exp = 0.0; Seed = seed; Trait = trait; Age = age; Skills = Map.empty; EngineerSpeciality = None }`,
`/// orig Kitten._generateAttributes (village.js L1483-1515) draw-for-draw on the
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
      IsLeader = false; Skills = Map.empty; EngineerSpeciality = None }`);

// 3. VillagePool gains LeaderSeed + Traits
ms = ms.replace(
`type VillagePool =
    { Kittens: Kitten list
      NextKittenProgress: float
      MaxKittens: int
      JobValues: Map<string, int> // jobRef.value counters (diverge from kitten jobs, OBS-2)
      JobUnlocked: Set<string>
      Happiness: float
      DeathTimeout: int }`,
`type VillagePool =
    { Kittens: Kitten list
      NextKittenProgress: float
      MaxKittens: int
      JobValues: Map<string, int> // jobRef.value counters (diverge from kitten jobs, OBS-2)
      JobUnlocked: Set<string>
      Happiness: float
      DeathTimeout: int
      LeaderSeed: int option // orig stores the kitten object; fs keys by seed
      Traits: string list } // village.traits — newest-first unshift on arrivals`);

ms = ms.replace(
`let initVillage (jobDefs: Game.Catalog.Village.JobDef list) : VillagePool =
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
      DeathTimeout = 0 }`,
`let initVillage (jobDefs: Game.Catalog.Village.JobDef list) : VillagePool =
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
      Traits = [] }`);

// 4. addKitten: unshift trait into village.traits
ms = ms.replace(
`let addKitten (rand: unit -> float) (pool: VillagePool) : VillagePool =
    let seed = generateKittenSeed rand
    { pool with Kittens = pool.Kittens @ [ makeKitten seed ] }`,
`let addKitten (rand: unit -> float) (pool: VillagePool) : VillagePool =
    let seed = generateKittenSeed rand
    let kitten = makeKitten seed
    // orig addKitten: village.traits.unshift(trait) when new
    let traits =
        if pool.Traits |> List.contains kitten.Trait then pool.Traits
        else kitten.Trait :: pool.Traits
    { pool with Kittens = pool.Kittens @ [ kitten ]; Traits = traits }`);

// 5. killKittens: clear leader if the leader died
ms = ms.replace(
`    { vpool with Kittens = survivors; JobValues = jobValues }, deadSpecialities`,
`    let leaderDead =
        match vpool.LeaderSeed with
        | Some ls -> survivors |> List.forall (fun k -> k.Seed <> ls)
        | None -> false
    { vpool with
        Kittens = survivors
        JobValues = jobValues
        LeaderSeed = if leaderDead then None else vpool.LeaderSeed }, deadSpecialities`);

// 6. leader helpers + skill curves + promote (append after getFreeKittens block)
ms = ms.replace(
`/// orig sim.sortKittensByExp (village.js L3395-3400): rank asc then exp asc`,
`// --- village-06: leaders -------------------------------------------------------

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
let promote (anarchyActive: bool) (rankTarget: int option) (seed: int) (vpool: VillagePool) (pool: ResPool) : VillagePool * ResPool * int =
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

/// orig sim.sortKittensByExp (village.js L3395-3400): rank asc then exp asc`);

fs.writeFileSync(pm, ms);
console.log("managers patched");
