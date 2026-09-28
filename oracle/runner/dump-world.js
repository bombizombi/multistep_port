#!/usr/bin/env node
"use strict";
/**
 * dump-world.js — generates a temporary orig-driver variant that dumps the
 * world-data catalogs (races, religion, space, perks, achievements, stats,
 * time CFU/VSU, calendar cycles) and runs it.
 *
 * Approach: patch the loaded orig-driver source in memory? No — simpler: this
 * script IS the driver variant. It replicates the bootstrap from orig-driver.js
 * by requiring it as a module is impossible (top-level side effects), so we
 * exec orig-driver.js's bootstrap by string-splicing its head onto a custom
 * tail. Run from multistep_port: node tools/dump-world.js <output.json>
 */
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const OUT = process.argv[2] || path.join(REPO, "oracle", "fixtures", "world-orig.json");
const driverSrc = fs.readFileSync(path.join(__dirname, "orig-driver.js"), "utf8");

// head = everything up to the scenario CLI guard; we replace the guard + run
// loop with a world dump tail.
const bootstrapEnd = driverSrc.indexOf("// ---------------------------------------------------------------------------\n// Catalog dump mode");
if (bootstrapEnd < 0) { console.error("bootstrap marker not found"); process.exit(1); }
let head = driverSrc.substring(0, bootstrapEnd);

// neutralize the CLI guard + scenario parse (head still contains them)
head = head
  .replace(/const dumpCatalogOnly = .*;\n/, "const dumpCatalogOnly = true;\n")
  .replace(/const dumpVillageOnly = .*;\n/, "const dumpVillageOnly = true;\n")
  .replace(/const scenarioPath = \(dumpCatalogOnly \|\| dumpVillageOnly\) \? null : process\.argv\[2\];/, "const scenarioPath = null;")
  .replace(/const scenario = \(dumpCatalogOnly \|\| dumpVillageOnly\) \? null : parseScenario\(fs\.readFileSync\(scenarioPath, "utf8"\)\);/, "const scenario = null;");

const tail = `
// ---------------------------------------------------------------------------
// World dump (--dump-world): all remaining static data tables.
{
  const clone = (o) => JSON.parse(JSON.stringify(o === undefined ? null : o));
  const races = game.diplomacy.races.map((r) => ({
    name: r.name, unlocked: !!r.unlocked,
    embassyPrices: clone(r.embassyPrices) || null,
    embassyLevel: r.embassyLevel || 0,
    attitude: r.attitude === undefined ? null : r.attitude,
    raceEffects: clone(r.raceEffects) || null,
  }));
  const zu = game.religion.zigguratUpgrades.map((z) => ({
    name: z.name, prices: clone(z.prices) || [], val: z.val || 0,
    unlocked: !!z.unlocked, effects: clone(z.effects) || {},
  }));
  const ru = game.religion.religionUpgrades.map((z) => ({
    name: z.name, prices: clone(z.prices) || [], val: z.val || 0,
    unlocked: !!z.unlocked, researched: !!z.researched, effects: clone(z.effects) || {},
  }));
  const tu = game.religion.transcendenceUpgrades.map((z) => ({
    name: z.name, prices: clone(z.prices) || [], val: z.val || 0,
    unlocked: !!z.unlocked, researched: !!z.researched, effects: clone(z.effects) || {},
  }));
  const pacts = game.religion.pactsManager.pacts.map((p) => ({
    name: p.name, prices: clone(p.prices) || [], val: p.val || 0,
    unlocked: !!p.unlocked, researched: !!p.researched, effects: clone(p.effects) || {},
  }));
  const programs = game.space.programs.map((p) => ({
    name: p.name, unlocked: !!p.unlocked, researched: !!p.researched,
    prices: clone(p.prices) || null,
  }));
  const planets = game.space.planets.map((p) => ({
    name: p.name, unlocked: !!p.unlocked, buildings: (p.buildings || []).map((b) => b.name),
  }));
  const spaceBuildings = (game.space.planets || []).flatMap((p) => (p.buildings || []).map((b) => ({
    name: b.name, planet: p.name, val: b.val || 0, on: b.on || 0,
    unlocked: !!b.unlocked, prices: clone(b.prices) || [],
    effects: clone(b.effects) || {},
  })));
  const perks = game.prestige.perks.map((p) => ({
    name: p.name, prices: clone(p.prices) || [], unlocked: !!p.unlocked, researched: !!p.researched,
    effects: clone(p.effects) || null,
  }));
  const achievements = game.achievements.achievements.map((a) => ({
    name: a.name, unlocked: !!a.unlocked, starred: !!a.starred || false,
  }));
  const stats = (game.stats.stats || game.stats.getStats ? game.stats.stats : []).map((s) => ({
    name: s.name, val: s.val || 0,
  }));
  const cfu = game.time.chronoforgeUpgrades.map((z) => ({
    name: z.name, prices: clone(z.prices) || [], unlocked: !!z.unlocked, researched: !!z.researched,
    effects: clone(z.effects) || {},
  }));
  const vsu = game.time.voidspaceUpgrades.map((z) => ({
    name: z.name, prices: clone(z.prices) || [], unlocked: !!z.unlocked, researched: !!z.researched,
    effects: clone(z.effects) || {},
  }));
  const cycles = game.calendar.cycles.map((c) => ({ name: c.name, effects: clone(c.effects) || {} }));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({
    driver: "orig-driver.js", origCommit: origCommit(),
    races, zu, ru, tu, pacts, programs, planets, spaceBuildings, perks, achievements, stats, cfu, vsu, cycles,
  }, null, 1));
  console.log("world -> " + outPath + " (races " + races.length + ", zu " + zu.length + ", ru " + ru.length + ", tu " + tu.length + ", pacts " + pacts.length + ", programs " + programs.length + ", planets " + planets.length + ", spaceBld " + spaceBuildings.length + ", perks " + perks.length + ", ach " + achievements.length + ", stats " + stats.length + ", cfu " + cfu.length + ", vsu " + vsu.length + ")");
  process.exit(0);
}
`;

fs.writeFileSync(path.join(__dirname, "_world-driver.js"), head + tail);
console.log("world driver written");
