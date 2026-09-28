#!/usr/bin/env node
"use strict";
/**
 * orig-driver.js — run the ORIGINAL kittens game headless & deterministic (oracle-01).
 *
 * Usage:  node orig-driver.js <scenario.cat> [output.json]
 *
 * Approach (mirrors orig's own jest bootloader, test/setup.js — see D001):
 *   - jsdom provides window/document/localStorage (jest uses testEnvironment jsdom)
 *   - portable dojo.declare + mocked dojo namespace exactly as test/setup.js
 *   - Math.random -> seeded sfc32 stream (draw-counted); Date -> fake clock that
 *     advances +1000ms per tick (logical time, never wall time)
 *   - the game never starts its own timers: we call game.tick() synchronously
 *   - actions go through the same UI-controller paths a player click uses
 *
 * Orig source is loaded from ../orig_project/kittensgame via require() — it is
 * NEVER modified. All nondeterminism is intercepted here, in the harness.
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { parseScenario } = require("./scenario");

const ORIG = path.resolve(__dirname, "..", "..", "..", "orig_project", "kittensgame");
const ORIG_LOAD_ORDER = [
  // exact require order of test/setup.js (jest-proofed by the orig authors)
  "lib/react.min.js", "lib/jQuery", "test/declare", "lib/lz-string.js", "lib/system.js",
  "config.js", "i18n.js",
  "core.js",
  "js/resources.js", "js/calendar.js", "js/buildings.js", "js/village.js", "js/science.js",
  "js/workshop.js", "js/diplomacy.js", "js/religion.js", "js/achievements.js", "js/settings.js",
  "js/space.js", "js/prestige.js", "js/time.js", "js/stats.js", "js/challenges.js",
  "js/void.js", "js/math.js", "js/preview.js",
  "game.js",
  "js/jsx/left.jsx.js", "js/ui.js", "js/toolbar.js",
];

// ---------------------------------------------------------------------------
// CLI
const dumpCatalogOnly = true;
const dumpVillageOnly = true;
const scenarioPath = null;
let outPath = process.argv[3];
if (!dumpCatalogOnly && !dumpVillageOnly && !scenarioPath) {
  console.error("usage: node orig-driver.js <scenario.cat> [output.json]\n       node orig-driver.js --dump-catalog <output.json>\n       node orig-driver.js --dump-village <output.json>");
  process.exit(2);
}
const scenario = null;
if (scenario && scenario.problems.length) {
  for (const p of scenario.problems) console.error(`scenario: ${p}`);
  if (scenario.problems.some((p) => !p.includes("ignored"))) process.exit(2);
}
if (!outPath) outPath = dumpCatalogOnly
  ? path.resolve(__dirname, "..", "fixtures", "resource-catalog-orig.json")
  : path.resolve(__dirname, "..", "recordings", `${scenario.name}.json`);

// ---------------------------------------------------------------------------
// Deterministic environment (BEFORE any orig code loads)

// seeded PRNG: splitmix32 seeds sfc32; both are pure integer ops — portable & stable
function splitmix32(a) {
  return function () {
    a |= 0; a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    t = t ^ (t >>> 15);
    return (t = (t + 0x61d88e45) | 0) >>> 0;
  };
}
function sfc32(a, b, c, d) {
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}
const sm = splitmix32(scenario ? scenario.seed : 20260927);
let rngDraws = 0;
function installRng(seed) {
  const sm = splitmix32(seed);
  const rng = sfc32(sm(), sm(), sm(), sm());
  Math.random = function () { rngDraws++; return rng(); };
}
installRng(scenario ? scenario.seed : 20260927);

// fake clock: logical time = base + tick*1000ms (the game's own tick period)
const BASE_MS = 1759000000000;
let tickIndex = 0;
const RealDate = Date;
class FakeDate extends RealDate {
  constructor(...args) {
    if (args.length === 0) super(BASE_MS + tickIndex * 1000);
    else super(...args);
  }
  static now() { return BASE_MS + tickIndex * 1000; }
}
global.Date = FakeDate;

// jsdom DOM
const dom = new JSDOM("<!doctype html><html><body><div id='gameContainerId'></div></body></html>", {
  url: "https://oracle.local/",
  pretendToBeVisual: false,
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, "navigator", { value: dom.window.navigator, configurable: true });
global.location = dom.window.location;

// ---------------------------------------------------------------------------
// Load orig exactly like test/setup.js does
global.React = require(path.join(ORIG, "lib/react.min.js"));
global.$ = require(path.join(ORIG, "lib/jQuery"));

const createNamespace = require(path.join(ORIG, "test/declare"));
const namespace = { com: {}, classes: {}, mixin: {} };
const dojo = createNamespace(namespace);
global.com = namespace.com;
global.classes = namespace.classes;
global.mixin = namespace.mixin;
global.dojo = {
  version: { minor: 6 },
  declare: dojo.declare,
  destroy: function () {},
  empty: function () {},
  byId: function () {},
  forEach: function (array, predicate) { for (const i in array) predicate(array[i]); },
  clone: function (mixin) {
    if (mixin instanceof Array) return mixin.map((elem) => global.dojo.clone(elem));
    return Object.assign({}, mixin);
  },
  hitch: function (ctx, method) { return method.bind(ctx, arguments); },
  connect: function () {},
  publish: function () {},
  subscribe: function () {},
  mixin: function (obj, mx) { return Object.assign(obj, mx); },
};

global.LZString = require(path.join(ORIG, "lib/lz-string.js"));
require(path.join(ORIG, "lib/system.js"));

global.LCstorage = window.localStorage;

// In jest (jsdom testEnvironment) window === global, so `window.classes...` lookups
// in game.js resolve to the declare namespace. In plain Node they are two objects —
// mirror the globals onto the jsdom window (same object references, so later
// registrations during require() are visible through both).
for (const g of ["com", "classes", "mixin", "dojo", "React", "$", "LZString"]) {
  dom.window[g] = global[g];
}

// config + i18n explicitly so the $I mock lands between them, exactly like jest
require(path.join(ORIG, "config.js"));
require(path.join(ORIG, "i18n.js"));
global.$I = function (key, args) { return "$" + key + "$"; };
dom.window.$I = global.$I;

for (const rel of ORIG_LOAD_ORDER.slice(7)) require(path.join(ORIG, rel)); // core..toolbar
global.newrelic = {
  addPageAction: function () {}, addRelease: function () {},
  setCustomAttribute: function () {}, setErrorHandler: function () {},
};

// ---------------------------------------------------------------------------
// Game bootstrap — exactly the jest beforeEach pattern
global.gamePage = global.game = new com.nuclearunicorn.game.ui.GamePage();
game.setUI(new classes.ui.UISystem("gameContainerId"));
game.resetState();

// ---------------------------------------------------------------------------
// Action executor (player-equivalent paths)
const actionLog = [];
const productionOverrides = {}; // resop prod test hook (D014)
let lastLimits = {}; // resop ff/limits test hooks
let resSaveData = null; // resop saveres/loadres test hooks
function doAction(move) {
  const { action } = move;
  const args = move.args;
  // arg shape per action: gather [count]; buy/craft/assign <name> [count];
  // research/upgrade/policy <name>; hunt/praise/observe/save/load bare
  let name = null, n = 1;
  if (action === "gather") {
    n = (args.length >= 1) ? Number(args[0]) : 1;
  } else if (action === "buy" || action === "craft" || action === "assign") {
    name = args[0];
    n = (args.length >= 2) ? Number(args[1]) : 1;
  } else if (action === "research" || action === "upgrade" || action === "policy") {
    name = args[0];
  }
  if ((action === "gather" || action === "buy" || action === "craft" || action === "assign") && (!Number.isInteger(n) || n < 1)) {
    actionLog.push({ tick: tickIndex, action, args, reason: `bad count "${args[action === "gather" ? 0 : 1]}"` });
    return;
  }
  try {
    switch (action) {
      case "gather":
        for (let i = 0; i < n; i++) game.bld.gatherCatnip();
        return;
      case "buy": {
        const c = new classes.ui.btn.BuildingBtnModernController(game);
        const model = c.fetchModel({ key: name, building: name });
        const before = model.metadata.val;
        const affordBefore = c.hasResources(model);
        c.build(model, n); // returns undefined on both paths — detect success via state delta
        const built = model.metadata.val - before;
        if (built !== n) {
          actionLog.push({
            tick: tickIndex, action, args,
            reason: `built ${built}/${n} (enabled=${model.enabled}, affordBefore=${affordBefore})`,
          });
        }
        // D012: in the browser, the UI render pass calls job calculateEffects via the
        // upgrade path after a building unlocks jobs. Headless has no render pass, so
        // mirror that side effect here (otherwise e.g. scholars never produce science).
        const unlocks = model.metadata.unlocks;
        if (built > 0 && unlocks && unlocks.jobs && unlocks.jobs.length) {
          game.upgrade({ jobs: unlocks.jobs });
        }
        return;
      }
      case "craft": {
        const craft = game.workshop.getCraft(name);
        const prices = game.workshop.getCraftPrice(craft).map((p) => ({ name: p.name, val: p.val * n }));
        const affordBefore = game.resPool.hasRes(prices);
        const before = game.resPool.get(name).value;
        game.craft(name, n);
        const gained = game.resPool.get(name).value - before;
        if (!affordBefore || gained < n) {
          actionLog.push({
            tick: tickIndex, action, args,
            reason: `gained ${gained}/${n} (affordBefore=${affordBefore}, prices=${JSON.stringify(prices)})`,
          });
        }
        return;
      }
      case "assign": {
        const freeBefore = game.village.getFreeKittens();
        game.village.assignJob({ name }, n);
        const assigned = game.village.getJob(name).value;
        if (freeBefore < n || assigned < n) {
          actionLog.push({
            tick: tickIndex, action, args,
            reason: `assigned ${assigned}/${n} (freeBefore=${freeBefore}, jobLimit=${game.village.getJobLimit(name)})`,
          });
        }
        return;
      }
      case "research": {
        const c = new com.nuclearunicorn.game.ui.TechButtonController(game);
        const model = c.fetchModel({ id: name });
        const r = c.buyItem(model, null, null);
        if (r && r.itemBought === false) actionLog.push({ tick: tickIndex, action, args, reason: r.reason });
        return;
      }
      case "upgrade": {
        const c = new com.nuclearunicorn.game.ui.UpgradeButtonController(game);
        const model = c.fetchModel({ id: name });
        const r = c.buyItem(model, null, null);
        if (r && r.itemBought === false) actionLog.push({ tick: tickIndex, action, args, reason: r.reason });
        return;
      }
      case "policy": {
        const c = new classes.ui.PolicyBtnController(game);
        const model = c.fetchModel({ id: name });
        const r = c.buyItem(model, null, null);
        if (r && r.itemBought === false) actionLog.push({ tick: tickIndex, action, args, reason: r.reason });
        return;
      }
      case "hunt": game.huntAll({ preventDefault: function () {} }); return; // orig reads event.preventDefault
      case "praise": game.religion.praise(); return;
      case "observe": return;
      case "save": game.save(); return;
      case "load": game.load(); return;
      // resop — test-hook action (D014): direct resPool calls for unit-level
      // verification of the resource pipeline (mirrors orig's own jest practice).
      case "resop": {
        const [fn, arg1, arg2] = args;
        if (fn === "caps") {
          game.resPool.updateMaxValueAll();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "prod") {
          // resource-per-tick override map; patches getResourcePerTick once (D001-style
          // harness injection — orig source untouched, restored never needed: test-only)
          productionOverrides[arg1] = Number(arg2);
          if (!game.getResourcePerTick.__overridden) {
            const real = game.getResourcePerTick.bind(game);
            game.getResourcePerTick = (name, conv) =>
              (name in productionOverrides) ? productionOverrides[name] : real(name, conv);
            game.getResourcePerTick.__overridden = true;
          }
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "pertick") {
          // set perTickCached directly (normally cached by game.updateResources)
          game.resPool.get(arg1).perTickCached = Number(arg2);
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "update") {
          game.resPool.update();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "hasRes" || fn === "limited" || fn === "pay") {
          const spec = String(arg1).split(",").map((p) => {
            const [r, a] = p.split(":");
            return { res: r, amt: Number(a), name: r, val: Number(a) };
          });
          let result;
          if (fn === "hasRes") result = game.resPool.hasRes(spec, Number(arg2) || 0);
          else if (fn === "limited") result = game.resPool.isStorageLimited(spec);
          else { game.resPool.payPrices(spec); result = true; }
          actionLog.push({ tick: tickIndex, action: "resop", args, result });
          return;
        }
        if (fn === "ff") {
          lastLimits = game.resPool.fastforward(Number(arg1));
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "limits") {
          game.resPool.enforceLimits(lastLimits);
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "voidq") {
          const result = game.resPool.getVoidQuantity();
          actionLog.push({ tick: tickIndex, action: "resop", args, result });
          return;
        }
        if (fn === "voidstat") {
          const result = game.resPool.getVoidQuantityStatistically();
          actionLog.push({ tick: tickIndex, action: "resop", args, result });
          return;
        }
        if (fn === "maxall") {
          game.resPool.maxAll();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "energydelta") {
          const result = game.resPool.getEnergyDelta();
          actionLog.push({ tick: tickIndex, action: "resop", args, result });
          return;
        }
        if (fn === 'gauss') {
          const result = game.math.standardGaussianRandom();
          actionLog.push({ tick: tickIndex, action: 'resop', args, result });
          return;
        }
        if (fn === 'irwin') {
          const result = game.math.irwinHallRandom(Number(arg1));
          actionLog.push({ tick: tickIndex, action: 'resop', args, result });
          return;
        }
        if (fn === 'binom') {
          const result = game.math.binominalRandomInteger(Number(arg1), Number(arg2));
          actionLog.push({ tick: tickIndex, action: 'resop', args, result });
          return;
        }
        if (fn === 'geom') {
          const result = game.math.geometricRandom(Number(arg1));
          actionLog.push({ tick: tickIndex, action: 'resop', args, result });
          return;
        }
        if (fn === 'uniform') {
          const result = game.math.uniformRandomInteger(Number(arg1), Number(arg2));
          actionLog.push({ tick: tickIndex, action: 'resop', args, result });
          return;
        }
        if (fn === 'seed') {
          // re-seed the PRNG stream (D014: position-independent RNG verification —
          // orig's bootstrap consumed draws the F# runner never makes)
          installRng(Number(arg1) >>> 0);
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "cache") {
          game.updateCaches();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "gtick") {
          const n = Number(arg1);
          for (let i = 0; i < n; i++) game.tick();
          tickIndex = game.ticks; // resop ops after gticks log at game time
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.ticks });
          return;
        }
        if (fn === "snap") {
          snapshots.push(takeSnapshot());
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "saveres") {
          // orig resPool.save() MUTATES its argument and returns undefined
          const sd = {};
          game.resPool.save(sd);
          resSaveData = sd;
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "loadres") {
          if (resSaveData) game.resPool.load(resSaveData);
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "stock") {
          // resop stock <amt> <spec> — spec "wood:5,catnip:10" (order-significant)
          const amt = Number(arg1);
          if (!Number.isFinite(amt)) throw new Error(`resop stock: bad amt "${arg1}"`);
          const spec = String(arg2).split(",").map((p) => {
            const [r, a] = p.split(":");
            return { res: r, amt: Number(a) };
          });
          const result = game.resPool.getAmtDependsOnStock(spec, amt);
          actionLog.push({ tick: tickIndex, action: "resop", args, result });
          return;
        }
        const v = Number(arg2);
        if (!Number.isFinite(v)) throw new Error(`resop ${fn}: bad value "${arg2}"`);
        let result;
        if (fn === "addRes") result = game.resPool.addRes(game.resPool.get(arg1), v, false);
        else if (fn === "addResEvent") result = game.resPool.addResEvent(arg1, v);
        else if (fn === "addResPerTick") result = game.resPool.addResPerTick(arg1, v);
        else throw new Error(`resop: unknown fn "${fn}"`);
        actionLog.push({ tick: tickIndex, action: "resop", args, result });
        return;
      }
      default: throw new Error(`unhandled action ${action}`);
    }
  } catch (e) {
    actionLog.push({ tick: tickIndex, action, args, reason: `threw: ${e.message}` });
  }
}

// ---------------------------------------------------------------------------
// Snapshot (format pinned in ../README.md; both sides must emit this shape)
function snapEffects(g) {
  const keys = ["catnipPerTickBase", "catnipDemandRatio", "maxKittensRatio", "woodPerTick"];
  const out = {};
  for (const k of keys) {
    try {
      const v = g.getEffect(k);
      if (typeof v === "number") out[k] = v;
    } catch { /* effect absent */ }
  }
  return out;
}

function takeSnapshot() {
  const g = game;
  const resources = {};
  for (const r of g.resPool.resources) {
    resources[r.name] = {
      v: r.value,
      m: (r.maxValue === undefined ? null : r.maxValue),
      u: !!r.unlocked,
      p: r.perTickCached || 0,
    };
  }
  const buildings = {};
  for (const b of g.bld.buildingsData) {
    buildings[b.name] = { val: b.val, on: b.on, unlocked: !!b.unlocked, unlockable: !!b.unlockable, stage: b.stage || 0 };
  }
  const jobs = {};
  for (const jobName of g.village.jobNames) {
    const j = g.village.getJob(jobName);
    jobs[jobName] = { value: j.value, unlocked: !!j.unlocked };
  }
  const crafts = {};
  for (const c of g.workshop.crafts) crafts[c.name] = { unlocked: !!c.unlocked, value: c.value || 0 };
  const techs = g.science.techs.filter((t) => t.researched).map((t) => t.name).sort();
  const upgrades = g.workshop.upgrades.filter((u) => u.researched).map((u) => u.name).sort();
  const policies = (g.science.policies || []).filter((p) => p.researched).map((p) => p.name).sort();
  const cal = g.calendar;
  const seasonName = (cal.seasons && cal.seasons[cal.season] && cal.seasons[cal.season].name) || null;
  // kitten-level ground truth: jobRef.value and sim kitten jobs can diverge (OBS-1)
  const kittenJobs = g.village.sim.kittens.map((k) => k.job || null).sort();
  return {
    tick: g.ticks,
    rngDraws,
    calendar: {
      year: cal.year, day: cal.day, season: seasonName, weather: cal.weather,
      cycle: cal.cycle, cycleYear: cal.cycleYear,
    },
    kittens: { count: g.village.sim.kittens.length, free: g.village.getFreeKittens(), jobs: kittenJobs },
    resources, buildings, jobs, crafts, techs, upgrades, policies,
    effects: snapEffects(g),
  };
}


// ---------------------------------------------------------------------------
// World dump (--dump-world): all remaining static data tables.
{
  const clone = (o) => JSON.parse(JSON.stringify(o === undefined ? null : o));
  const races = game.diplomacy.races.map((r) => ({
    name: r.name, unlocked: !!r.unlocked,
    standing: r.standing === undefined ? null : r.standing,
    hidden: !!r.hidden,
    embassyPrices: clone(r.embassyPrices) || null,
    embassyLevel: r.embassyLevel || 0,
    attitude: r.attitude === undefined ? null : r.attitude,
    raceEffects: clone(r.raceEffects) || null,
    buys: clone(r.buys) || [],
    sells: clone(r.sells) || [],
    unlocks: clone(r.unlocks) || null,
  }));
  const zu = game.religion.zigguratUpgrades.map((z) => ({
    name: z.name, prices: clone(z.prices) || [], val: z.val || 0,
    unlocked: !!z.unlocked, effects: clone(z.effects) || {},
    priceRatio: z.priceRatio === undefined ? null : z.priceRatio,
    unlocks: clone(z.unlocks) || null, upgrades: clone(z.upgrades) || null,
  }));
  const ru = game.religion.religionUpgrades.map((z) => ({
    name: z.name, prices: clone(z.prices) || [], val: z.val || 0,
    unlocked: !!z.unlocked, researched: !!z.researched, effects: clone(z.effects) || {},
    priceRatio: z.priceRatio === undefined ? null : z.priceRatio,
    faith: z.faith === undefined ? null : z.faith,
    noStackable: !!z.noStackable,
    unlocks: clone(z.unlocks) || null, upgrades: clone(z.upgrades) || null,
  }));
  const tu = game.religion.transcendenceUpgrades.map((z) => ({
    name: z.name, prices: clone(z.prices) || [], val: z.val || 0,
    unlocked: !!z.unlocked, researched: !!z.researched, effects: clone(z.effects) || {},
    priceRatio: z.priceRatio === undefined ? null : z.priceRatio,
    unlocks: clone(z.unlocks) || null, upgrades: clone(z.upgrades) || null,
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
    driver: "orig-driver.js", origCommit: (typeof origCommit === "function" ? origCommit() : "unknown"),
    races, zu, ru, tu, pacts, programs, planets, spaceBuildings, perks, achievements, stats, cfu, vsu, cycles,
  }, null, 1));
  console.log("world -> " + outPath + " (races " + races.length + ", zu " + zu.length + ", ru " + ru.length + ", tu " + tu.length + ", pacts " + pacts.length + ", programs " + programs.length + ", planets " + planets.length + ", spaceBld " + spaceBuildings.length + ", perks " + perks.length + ", ach " + achievements.length + ", stats " + stats.length + ", cfu " + cfu.length + ", vsu " + vsu.length + ")");
  process.exit(0);
}
