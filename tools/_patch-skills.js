#!/usr/bin/env node
"use strict";
// Session-09 patch: kitten skill XP + tiered skill modifier in getResProduction.
const fs = require("fs");
const FILE = "kittens_land/src/Game/Game.Managers.fs";
let t = fs.readFileSync(FILE, "utf8");
let failed = null;
const must = (c, label) => { if (!c) failed = label; };

// 1. Kitten gets Skills map
const oldKitten = `type Kitten =
    { Name: string
      Surname: string
      Job: string option
      Rank: int
      Exp: float
      Seed: int
      Trait: string
      Age: float }`;
const newKitten = `type Kitten =
    { Name: string
      Surname: string
      Job: string option
      Rank: int
      Exp: float
      Seed: int
      Trait: string
      Age: float
      Skills: Map<string, float> }`;
must(t.includes(oldKitten), "Kitten type");
t = t.split(oldKitten).join(newKitten);

const oldCtor = "{ Name = name; Surname = surname; Job = None; Rank = 0; Exp = 0.0; Seed = seed; Trait = trait; Age = age }";
const newCtor = "{ Name = name; Surname = surname; Job = None; Rank = 0; Exp = 0.0; Seed = seed; Trait = trait; Age = age; Skills = Map.empty }";
must(t.includes(oldCtor), "Kitten ctor");
t = t.split(oldCtor).join(newCtor);

// 2. simUpdate: skill XP accumulation (orig L3305-3360)
const oldTail = `            for _ in 1..kittensToAdd do
                if pool.Kittens.Length < maxKittens then
                    pool <- addKitten rand pool
            if pool.Kittens.Length >= maxKittens then
                pool <- { pool with NextKittenProgress = 0.0 }
    pool`;
const newTail = `            for _ in 1..kittensToAdd do
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
                | None -> k) }`;
must(t.includes(oldTail), "simUpdate tail");
t = t.split(oldTail).join(newTail);

// 3. getResProduction: tiered skill modifier (orig getValueModifierPerSkill L1292)
const oldProd = `                for KeyValue(resName, baseMod) in modifiers do
                    let mutable diff = baseMod + baseMod * 0.0 // ×(1+skill mod): skill 0 at fresh
                    diff <- diff * 1.0 // rank multiplier: boostPerRank 0 at fresh`;
const newProd = `                // skill mod (orig getValueModifierPerSkill L1292): tiered bonus on
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
                    diff <- diff * 1.0 // rank multiplier: boostPerRank 0 at fresh`;
must(t.includes(oldProd), "getResProduction skill");
t = t.split(oldProd).join(newProd);

if (failed) { console.error("FAILED at:", failed); process.exit(1); }
fs.writeFileSync(FILE, t);
console.log("skills patch applied");
