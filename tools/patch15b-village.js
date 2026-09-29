#!/usr/bin/env node
"use strict";
// Batch-15 B: production leader folds, skill learning in simUpdate, wiring.
const fs = require("fs");

const pm = "kittens_land/src/Game/Game.Managers.fs";
let ms = fs.readFileSync(pm, "utf8");

// 1. getResProduction: anarchy-aware skill mod + leader folds
ms = ms.replace(
`                // orig getValueModifierPerSkill (L1292) × (1 + skillMultiplier seam 0)
                let skill = k.Skills |> Map.tryFind jobName |> Option.defaultValue 0.0
                let skillBonus =
                    if skill < 100.0 then 0.0
                    elif skill < 500.0 then 0.0125
                    elif skill < 1200.0 then 0.025
                    elif skill < 2500.0 then 0.045
                    elif skill < 5000.0 then 0.075
                    elif skill < 9000.0 then 0.125
                    else 0.1875
                let skillMod = skillBonus * (1.0 + 0.0)`,
`                // orig getValueModifierPerSkill (L1292): anarchy zero, top tier
                // × (1 + masterSkillMultiplier), all × (1 + skillMultiplier)
                let skill = k.Skills |> Map.tryFind jobName |> Option.defaultValue 0.0
                let skillMod =
                    getValueModifierPerSkill
                        anarchyActive (eff "masterSkillMultiplier") (eff "skillMultiplier") skill`);
ms = ms.replace(
`                for KeyValue(resName, baseMod) in modifiers do
                    let mutable diff = baseMod + baseMod * skillMod
                    diff <- diff * rankMultiplier
                    if diff > 0.0 then
                        // leader seams: no leaders in this slice (isLeader false,
                        // village.leader null → no boostFromLeader fold)
                        diff <- diff * happiness
                    res <- res |> Map.change resName (function Some prev -> Some(prev + diff) | None -> Some diff)`,
`                for KeyValue(resName, baseMod) in modifiers do
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
                    res <- res |> Map.change resName (function Some prev -> Some(prev + diff) | None -> Some diff)`);

// engineer branch leader folds
ms = ms.replace(
`                            if rankDiff > 0.0 then
                                diff <- diff - diff * rankDiff * 0.15
                            diff <- diff + diff * skillMod`,
`                            if rankDiff > 0.0 then
                                diff <- diff - diff * rankDiff * 0.15
                            diff <- diff + diff * skillMod
                            if diff > 0.0 then
                                if k.IsLeader then
                                    diff <- diff * getLeaderBonus authocracyResearched k.Rank
                                else
                                    match leaderRank with
                                    | Some lr -> diff <- diff * (1.0 + (getLeaderBonus authocracyResearched lr - 1.0) * eff "boostFromLeader")
                                    | None -> ()`);

// 2. getResProduction signature gains the anarchy/leader context (option-padded)
ms = ms.replace(
`let getResProduction
    (cache: Game.Effects.EffectsCache)
    (vpool: VillagePool)
    (jobDefs: Map<string, Game.Catalog.Village.JobDef>)
    (wp: WorkshopPool)
    : Map<string, float> =
    let mutable res = Map.empty<string, float>
    // happiness + happinessKittenProductionRatio seam (0 at fresh)
    let happiness = vpool.Happiness
    let eff = Game.Effects.getEffect cache`,
`let getResProduction
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
        | None -> None`);

fs.writeFileSync(pm, ms);
console.log("production folds added");

// 3. simUpdate: skill learning block (orig L3276-3338)
const simAnchor = `/// orig sim.update(kittensPerTick, times): births from progress accumulation.`;
const simBlock = `/// Everything the skill-learning half of sim.update reads.
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
    let mutable kittens = pool.Kittens
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
                    skills
                    <- skills
                       |> Map.map (fun sk v ->
                           if sk <> job && v > 0.0 then
                               let decay = min (float ctx.Times * 0.001) v
                               v - decay
                           else v)
                kitten <- { kitten with Skills = skills }
                kitten
            | _ -> kitten)
    { pool with Kittens = updated }

${simAnchor}`;
if (!ms.includes(simAnchor)) { console.error("sim anchor missing"); process.exit(1); }
ms = ms.replace(simAnchor, simBlock);
fs.writeFileSync(pm, ms);
console.log("learnSkills added");

// 4. runner wiring: simUpdate call gains learnSkills + the hunt/craft leader hooks
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");

// 4a. per-tick village sim: learnSkills after simUpdate births
t = t.replace(
`        let growthRate = if starving then 0.0 else kittensPerTick
        let beforeBirths = vpool.Kittens.Length
        vpool <- Game.Managers.simUpdate maxKittens growthRate 1 (fun () -> rngDraws <- rngDraws + 1; rand ()) vpool`,
`        let growthRate = if starving then 0.0 else kittensPerTick
        let beforeBirths = vpool.Kittens.Length
        vpool <- Game.Managers.simUpdate maxKittens growthRate 1 (fun () -> rngDraws <- rngDraws + 1; rand ()) vpool
        // sim.update skill half (village-10/12)
        let skillCtx : Game.Managers.SkillContext =
          { AnarchyActive = Game.Challenges.isActive cpool "anarchy"
            InternetResearched = (match wpool.Upgrades |> Map.tryFind "internet" with Some u -> u.Researched | None -> false)
            NeuralNetworksResearched = (match wpool.Upgrades |> Map.tryFind "neuralNetworks" with Some u -> u.Researched | None -> false)
            SkillXPEffect = Game.Effects.getEffect cache "skillXP"
            MaxKittensRatioLDR = Game.Effects.getEffect cache "maxKittensRatio"
            Day = calendarDay
            GetJobValue = fun n -> vpool.JobValues |> Map.tryFind n |> Option.defaultValue 0
            GetJobUnlocked = fun n -> vpool.JobUnlocked.Contains n
            Times = 1 }
        vpool <- Game.Managers.learnSkills skillCtx vpool`);

fs.writeFileSync(q, t);
console.log("runner skill wiring added");
