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
const scenarioPath = process.argv[2];
let outPath = process.argv[3];
if (!scenarioPath) {
  console.error("usage: node orig-driver.js <scenario.cat> [output.json]");
  process.exit(2);
}
const scenario = parseScenario(fs.readFileSync(scenarioPath, "utf8"));
if (scenario.problems.length) {
  for (const p of scenario.problems) console.error(`scenario: ${p}`);
  if (scenario.problems.some((p) => !p.includes("ignored"))) process.exit(2);
}
if (!outPath) outPath = path.resolve(__dirname, "..", "recordings", `${scenario.name}.json`);

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
const sm = splitmix32(scenario.seed);
const rng = sfc32(sm(), sm(), sm(), sm());
let rngDraws = 0;
Math.random = function () { rngDraws++; return rng(); };

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
// Run loop. Semantics (pinned in scenario.js header):
//   moves at tick T execute BEFORE tick T's game.tick();
//   snapshot at tick T is taken AFTER tick T's game.tick();
//   tick 0 = fresh state + tick-0 moves, zero ticks, snapshotted first.
const cpSet = new Set(scenario.checkpoints);
const snapshots = [];

const movesByTick = new Map();
for (const mv of scenario.moves) {
  if (!movesByTick.has(mv.tick)) movesByTick.set(mv.tick, []);
  movesByTick.get(mv.tick).push(mv);
}

tickIndex = 0;
const moves0 = movesByTick.get(0);
if (moves0) for (const mv of moves0) doAction(mv);
snapshots.push(takeSnapshot());

for (let t = 1; t <= scenario.maxTick; t++) {
  tickIndex = t;
  const moves = movesByTick.get(t);
  if (moves) for (const mv of moves) doAction(mv);
  game.tick();
  if (cpSet.has(t)) snapshots.push(takeSnapshot());
}

// ---------------------------------------------------------------------------
// Output
const result = {
  driver: "orig-driver.js",
  scenario: scenario.name,
  seed: scenario.seed,
  origCommit: origCommit(),
  rngImpl: "splitmix32-seeded sfc32",
  snapshots,
  actionLog,
};
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result, null, 1));
console.log(`scenario "${scenario.name}": ${scenario.maxTick} ticks, ${snapshots.length} snapshots, ${rngDraws} rng draws -> ${outPath}`);
if (actionLog.length) console.log(`action warnings: ${actionLog.length} (see actionLog in output)`);

function origCommit() {
  try { return require("child_process").execSync("git rev-parse HEAD", { cwd: ORIG }).toString().trim(); }
  catch { return "unknown"; }
}
