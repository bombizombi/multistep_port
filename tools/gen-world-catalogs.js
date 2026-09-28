#!/usr/bin/env node
"use strict";
/**
 * gen-world-catalogs.js — generate Game.Catalog.World.fs from
 * oracle/fixtures/world-orig.json (produced by oracle/runner/_run-world.js).
 * diplomacy-01 / religion-01..04(data) / space-01..03(data) / prestige-01 /
 * achievements-01 / stats-01 / time-01..02(data). Never hand-edit the F# file.
 */
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const src = JSON.parse(fs.readFileSync(path.join(REPO, "oracle", "fixtures", "world-orig.json"), "utf8"));

const fstr = (s) => JSON.stringify(s === null || s === undefined ? "" : s);
const fbool = (b) => (b ? "true" : "false");
const foptF = (f) => (f === null || f === undefined ? "None" : `Some ${f}`);
const fprices = (ps) =>
  !ps || ps.length === 0
    ? "[]"
    : "[" + ps.map((p) => `{ Resource = ${JSON.stringify(p.name)}; Val = ${p.val} }`).join("; ") + "]";
const fmap = (m) =>
  !m || Object.keys(m).length === 0
    ? "Map.empty"
    : "Map.ofList [" + Object.entries(m).map(([k, v]) => `${JSON.stringify(k)}, ${v}`).join("; ") + "]";

// trade sell line: value/chance/width/minLevel/seasons (diplomacy-07/08 data)
const fsell = (s) =>
  `{ Name = ${fstr(s.name)}; Value = ${s.value}; Chance = ${s.chance}; Width = ${s.width}; MinLevel = ${s.minLevel === undefined || s.minLevel === null ? "None" : `Some ${s.minLevel}`}; Seasons = ${s.seasons ? fmap(s.seasons) : "Map.empty"} }`;
const funlocks = (u) =>
  !u
    ? "None"
    : `Some({ Buildings = [${(u.buildings || []).map(fstr).join("; ")}]; Tabs = [${(u.tabs || []).map(fstr).join("; ")}]; Jobs = [${(u.jobs || []).map(fstr).join("; ")}]; Tech = [${(u.tech || []).map(fstr).join("; ")}]; Policies = [${(u.policies || []).map(fstr).join("; ")}]; Upgrades = [${(u.upgrades || []).map(fstr).join("; ")}]; ZebraUpgrades = [${(u.zebraUpgrades || []).map(fstr).join("; ")}]; Religion = [${(u.religion || []).map(fstr).join("; ")}]; Crafts = [${(u.crafts || []).map(fstr).join("; ")}]; Perks = [${(u.perks || []).map(fstr).join("; ")}]; Stages = [] })`;

const races = src.races.map((r) =>
  `      { Name = ${fstr(r.name)}; StartsUnlocked = ${fbool(r.unlocked)}; Standing = ${r.standing}; Hidden = ${fbool(r.hidden)}; EmbassyPrices = ${fprices(r.embassyPrices)}; EmbassyLevel = ${r.embassyLevel || 0}; RaceEffects = ${fmap(r.raceEffects)}; Buys = ${fprices(r.buys)}; Sells = [${(r.sells || []).map(fsell).join("; ")}]; Unlocks = ${funlocks(r.unlocks)} }`);

const zu = src.zu.map((z) =>
  `      { Name = ${fstr(z.name)}; Prices = ${fprices(z.prices)}; Effects = ${fmap(z.effects)}; PriceRatio = ${foptF(z.priceRatio)}; StartsUnlocked = ${fbool(z.unlocked)}; Unlocks = ${funlocks(z.unlocks)}; Upgrades = ${funlocks(z.upgrades)} }`);
const ru = src.ru.map((z) =>
  `      { Name = ${fstr(z.name)}; Prices = ${fprices(z.prices)}; Effects = ${fmap(z.effects)}; PriceRatio = ${foptF(z.priceRatio)}; FaithGate = ${foptF(z.faith)}; NoStackable = ${fbool(z.noStackable)}; Unlocks = ${funlocks(z.unlocks)}; Upgrades = ${funlocks(z.upgrades)} }`);
const tu = src.tu.map((z) =>
  `      { Name = ${fstr(z.name)}; Prices = ${fprices(z.prices)}; Effects = ${fmap(z.effects)}; PriceRatio = ${foptF(z.priceRatio)}; Unlocks = ${funlocks(z.unlocks)}; Upgrades = ${funlocks(z.upgrades)} }`);
const pacts = src.pacts.map((z) =>
  `      { Name = ${fstr(z.name)}; Prices = ${fprices(z.prices)}; Effects = ${fmap(z.effects)} }`);

const programs = src.programs.map((p) =>
  `      { Name = ${fstr(p.name)}; Prices = ${fprices(p.prices)} }`);
const planets = src.planets.map((p) =>
  `      { Name = ${fstr(p.name)}; Buildings = [${(p.buildings || []).map(fstr).join("; ")}] }`);
const spaceBld = src.spaceBuildings.map((b) =>
  `      { Name = ${fstr(b.name)}; Planet = ${fstr(b.planet)}; Prices = ${fprices(b.prices)}; Effects = ${fmap(b.effects)} }`);

const perks = src.perks.map((p) =>
  `      { Name = ${fstr(p.name)}; Prices = ${fprices(p.prices)}; Effects = ${p.effects ? fmap(p.effects) : "Map.empty"}; StartsUnlocked = ${fbool(p.defaultUnlocked)}; Unlocks = ${funlocks(p.unlocks)}; Upgrades = ${funlocks(p.upgrades)}; HasHandler = ${fbool(p.hasHandler)} }`);

const achievements = src.achievements.map((a) =>
  `      { Name = ${fstr(a.name)}; Hidden = ${fbool(a.hidden)}; HasCondition = ${fbool(a.hasCondition)}; HasStarCondition = ${fbool(a.hasStarCondition)} }`);

const badges = (src.badges || []).map((b) =>
  `      { Name = ${fstr(b.name)}; Difficulty = ${b.difficulty === null || b.difficulty === undefined ? "None" : `Some ${fstr(b.difficulty)}`}; HasCondition = ${fbool(b.hasCondition)} }`);

const stats = src.stats.map((s) =>
  `      { Name = ${fstr(s.name)}; InitialVal = ${s.val || 0}; StartsUnlocked = ${fbool(s.defaultUnlocked)}; HasCalculate = ${fbool(s.hasCalculate)} }`);

const statsCurrent = (src.statsCurrent || []).map((s) =>
  `      { Name = ${fstr(s.name)}; HasCalculate = ${fbool(s.hasCalculate)} }`);

const cfu = src.cfu.map((z) =>
  `      { Name = ${fstr(z.name)}; Prices = ${fprices(z.prices)}; Effects = ${fmap(z.effects)} }`);
const vsu = src.vsu.map((z) =>
  `      { Name = ${fstr(z.name)}; Prices = ${fprices(z.prices)}; Effects = ${fmap(z.effects)} }`);

const cycles = src.cycles.map((c) =>
  `      { Name = ${fstr(c.name)}; Effects = ${fmap(c.effects)} }`);

const biomes = (src.biomes || []).map((b) =>
  `      { Name = ${fstr(b.name)}; FaunaNames = ${b.faunaNames ? `[${b.faunaNames.map(fstr).join("; ")}]` : "[]"}; FaunaPenalty = ${b.faunaPenalty} }`);

const out = `//------------------------------------------------------------------------------
// GENERATED by tools/gen-world-catalogs.js from oracle/fixtures/world-orig.json
// (orig @ ${src.origCommit.slice(0, 12)}).
// diplomacy-01 / religion-01..04(data) / space-01..03(data) / prestige-01 /
// achievements-01 / stats-01 / time-01..02(data). i18n omitted. Never edit.
//------------------------------------------------------------------------------

module Game.Catalog.World

open Game.Types

type RaceDef =
    { Name: string; StartsUnlocked: bool; Standing: float; Hidden: bool
      EmbassyPrices: Price list; EmbassyLevel: int; RaceEffects: Map<string, float>
      Buys: Price list; Sells: SellDef list; Unlocks: UnlockList option }

and SellDef =
    { Name: string; Value: float; Chance: float; Width: float; MinLevel: int option; Seasons: Map<string, float> }

type ZUDef =
    { Name: string; Prices: Price list; Effects: Map<string, float>
      PriceRatio: float option; StartsUnlocked: bool
      Unlocks: UnlockList option; Upgrades: UnlockList option }

type RUDef =
    { Name: string; Prices: Price list; Effects: Map<string, float>
      PriceRatio: float option; FaithGate: float option; NoStackable: bool
      Unlocks: UnlockList option; Upgrades: UnlockList option }

type TUDef =
    { Name: string; Prices: Price list; Effects: Map<string, float>
      PriceRatio: float option; Unlocks: UnlockList option; Upgrades: UnlockList option }

type PactDef = { Name: string; Prices: Price list; Effects: Map<string, float> }

type ProgramDef = { Name: string; Prices: Price list }
type PlanetDef = { Name: string; Buildings: string list }
type SpaceBuildingDef =
    { Name: string; Planet: string; Prices: Price list; Effects: Map<string, float> }

type PerkDef =
    { Name: string; Prices: Price list; Effects: Map<string, float>
      StartsUnlocked: bool; Unlocks: UnlockList option; Upgrades: UnlockList option
      HasHandler: bool }

type AchievementDef =
    { Name: string; Hidden: bool; HasCondition: bool; HasStarCondition: bool }

type BadgeDef = { Name: string; Difficulty: string option; HasCondition: bool }

type StatDef =
    { Name: string; InitialVal: float; StartsUnlocked: bool; HasCalculate: bool }

type StatCurrentDef = { Name: string; HasCalculate: bool }
type CFUDef = { Name: string; Prices: Price list; Effects: Map<string, float> }
type VSUDef = { Name: string; Prices: Price list; Effects: Map<string, float> }
type CycleDef = { Name: string; Effects: Map<string, float> }

/// village map biomes — RNG skeleton data only (village-14/15 slice): the
/// fauna roll consumes 1-3 draws per biome per tick and MUST mirror orig.
type BiomeDef = { Name: string; FaunaNames: string list; FaunaPenalty: float }

let raceDefs : RaceDef list =
    [
${races.join("\n")}
    ]

let zuDefs : ZUDef list =
    [
${zu.join("\n")}
    ]

let ruDefs : RUDef list =
    [
${ru.join("\n")}
    ]

let tuDefs : TUDef list =
    [
${tu.join("\n")}
    ]

let pactDefs : PactDef list =
    [
${pacts.join("\n")}
    ]

let programDefs : ProgramDef list =
    [
${programs.join("\n")}
    ]

let planetDefs : PlanetDef list =
    [
${planets.join("\n")}
    ]

let spaceBuildingDefs : SpaceBuildingDef list =
    [
${spaceBld.join("\n")}
    ]

let perkDefs : PerkDef list =
    [
${perks.join("\n")}
    ]

let achievementDefs : AchievementDef list =
    [
${achievements.join("\n")}
    ]

let badgeDefs : BadgeDef list =
    [
${badges.join("\n")}
    ]

let statDefs : StatDef list =
    [
${stats.join("\n")}
    ]

let statCurrentDefs : StatCurrentDef list =
    [
${statsCurrent.join("\n")}
    ]

let cfuDefs : CFUDef list =
    [
${cfu.join("\n")}
    ]

let vsuDefs : VSUDef list =
    [
${vsu.join("\n")}
    ]

let cycleDefs : CycleDef list =
    [
${cycles.join("\n")}
    ]

let biomeDefs : BiomeDef list =
    [
${biomes.join("\n")}
    ]
`;

const target = path.join(REPO, "kittens_land", "src", "Game", "Game.Catalog.World.fs");
fs.writeFileSync(target, out);
console.log(`wrote Game.Catalog.World.fs (races ${src.races.length}, zu ${src.zu.length}, ru ${src.ru.length}, tu ${src.tu.length}, pacts ${src.pacts.length}, programs ${src.programs.length}, planets ${src.planets.length}, spaceBld ${src.spaceBuildings.length}, perks ${src.perks.length}, ach ${src.achievements.length}, stats ${src.stats.length}, cfu ${src.cfu.length}, vsu ${src.vsu.length})`);
