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
const dumpCatalogOnly = process.argv[2] === "--dump-catalog";
const dumpVillageOnly = process.argv[2] === "--dump-village" || process.argv[2] === "--dump-defs";
const dumpSpaceOnly = process.argv[2] === "--dump-space";
const scenarioPath = (dumpCatalogOnly || dumpVillageOnly || dumpSpaceOnly) ? null : process.argv[2];
let outPath = process.argv[3];
if (!dumpCatalogOnly && !dumpVillageOnly && !dumpSpaceOnly && !scenarioPath) {
  console.error("usage: node orig-driver.js <scenario.cat> [output.json]\n       node orig-driver.js --dump-catalog <output.json>\n       node orig-driver.js --dump-village <output.json>");
  process.exit(2);
}
const scenario = (dumpCatalogOnly || dumpVillageOnly || dumpSpaceOnly) ? null : parseScenario(fs.readFileSync(scenarioPath, "utf8"));
if (scenario && scenario.problems.length) {
  for (const p of scenario.problems) console.error(`scenario: ${p}`);
  if (scenario.problems.some((p) => !p.includes("ignored"))) process.exit(2);
}
if (!outPath) outPath = dumpSpaceOnly
  ? path.resolve(__dirname, "..", "fixtures", "space-orig.json")
  : dumpCatalogOnly
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
const dom = new JSDOM("<!doctype html><html><body><div id='gameContainerId'></div><div id='observeButton'></div></body></html>", {
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
  create: function () { return { connect: function () {} }; }, // observe-button UI (D014: headless stub)
  byId: function () { return {}; },
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
// D014 harness injection: jsdom window.confirm returns false, so confirm-gated
// actions (adore/transcend) would silently no-op. Auto-confirm mirrors the
// user clicking OK. Orig source untouched.
game.ui.confirm = function (title, msg, callbackOk) { callbackOk(); };
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
      case "huntall": game.village.huntAll({ preventDefault: function () {} }); return;
      case "hunthalf": game.village.huntHalf({ preventDefault: function () {} }); return;
      case "huntfifth": game.village.huntFifth({ preventDefault: function () {} }); return;
      case "praise": game.religion.praise(); return;
      case "adore": game.religion.resetFaith(1.01, true); return; // confirm auto-OK'd
      case "transcend": game.religion.transcend(); return; // confirm auto-OK'd
      case "worship": {
        const c = new com.nuclearunicorn.game.ui.ReligionBtnController(game);
        const model = c.fetchModel({ id: args[0] });
        c.buyItem(model, null, null);
        return;
      }
      case "ziggurat": {
        const c = new com.nuclearunicorn.game.ui.ZigguratBtnController(game);
        const model = c.fetchModel({ id: args[0] });
        c.buyItem(model, null, null);
        return;
      }
      case "embassy": {
        const race = game.diplomacy.get(args[0]);
        const n = args.length >= 2 ? Number(args[1]) : 1;
        const c = new classes.diplomacy.ui.EmbassyButtonController(game);
        const model = c.fetchModel({ prices: race.embassyPrices, race });
        // n clicks of the player path: each buyItem gates (writing + unlocked +
        // enabled) and builds exactly one embassy at the live 1.15 ladder
        let built = 0;
        for (let i = 0; i < n; i++) {
          const lvlBefore = race.embassyLevel;
          c.buyItem(model, null, null);
          built += race.embassyLevel - lvlBefore;
        }
        if (built !== n) {
          actionLog.push({ tick: tickIndex, action, args, reason: `built ${built}/${n}` });
        }
        return;
      }
      case "trade": {
        const race = game.diplomacy.get(args[0]);
        const n = args.length >= 2 ? Number(args[1]) : 1;
        // player-equivalent path: TradeButton pays [manpower, gold, buys×volume]
        // then tradeMultiple/trade resolves. n=1 via the controller pay + trade().
        if (n === 1) {
          const tradePrices = [
            { name: "manpower", val: game.diplomacy.getManpowerCost() },
            { name: "gold", val: game.diplomacy.getGoldCost() },
          ];
          for (const b of race.buys) {
            tradePrices.push({ name: b.name, val: b.val * game.diplomacy.getTradeVolume() });
          }
          if (!game.resPool.hasRes(tradePrices)) {
            actionLog.push({ tick: tickIndex, action, args, reason: "cannot afford" });
            return;
          }
          game.resPool.payPrices(tradePrices);
          game.diplomacy.trade(race);
        } else {
          game.diplomacy.tradeMultiple(race, n);
        }
        return;
      }
      case "tradeall": {
        const race = game.diplomacy.get(args[0]);
        game.diplomacy.tradeAll(race);
        return;
      }
      case "perk": {
        const c = new classes.ui.PrestigeBtnController(game);
        const model = c.fetchModel({ id: args[0] });
        const r = c.buyItem(model, null, null);
        if (r && r.itemBought === false) actionLog.push({ tick: tickIndex, action, args, reason: r.reason });
        return;
      }
      case "festival": {
        const amt = args.length >= 1 ? Number(args[0]) : 1;
        game.village.holdFestival(amt);
        return;
      }
      case "feedelder": {
        game.diplomacy.feedElders(Number(args[0]));
        game.updateCaches();
        return;
      }
      case "undo": {
        game.undo();
        return;
      }
      case "speciality": {
        // CraftButtonController.assignCraftJob path
        const craft = game.workshop.getCraft(args[0]);
        const n = args.length >= 2 ? Number(args[1]) : 1;
        const free = game.village.getFreeEngineers();
        const valueCorrected = free > n ? n : free;
        let added = 0;
        for (let i = 0; i < valueCorrected; i++) {
          if (game.village.sim.assignCraftJob(craft)) added += 1;
          else break;
        }
        craft.value += added;
        if (added !== n) {
          actionLog.push({ tick: tickIndex, action, args, reason: `assigned ${added}/${n} (free=${free})` });
        }
        return;
      }
      case "craftall":
        // game.craftAll minus the wood winter-confirm branch (headless: same end
        // state as clicking through the confirm)
        game.workshop.craftAll(args[0]);
        game.updateResources();
        return;
      case "refine": game.bld.refineCatnip(); return;
      case "observe":
        // the observe button: handler only while an event is pending
        if (game.calendar.observeRemainingTime > 0) game.calendar.observeHandler();
        return;
      case "pact": {
        // PactsBtnController.build via the controller's fetchModel
        const n = args.length >= 2 ? Number(args[1]) : 1;
        const controller = new com.nuclearunicorn.game.ui.PactsBtnController(game);
        const model = controller.fetchModel({ id: args[0] });
        controller.build(model, n);
        game.updateCaches();
        return;
      }
      case "accelerate":
        game.time.isAccelerated = !game.time.isAccelerated;
        return;
      case "mission": {
        // MissionBtnController.build(model, 1) via the stackable fetchModel
        const controller = new com.nuclearunicorn.game.ui.SpaceProgramBtnController(game);
        const model = controller.fetchModel({ id: args[0] });
        const valBefore = model.metadata.val;
        controller.build(model, 1);
        if (model.metadata.val === valBefore) {
          actionLog.push({ tick: tickIndex, action, args, reason: "cannot-afford-or-locked" });
        }
        game.updateCaches();
        return;
      }
      case "sbuilding": {
        // PlanetBuildingBtnController.build(model, n)
        const controller = new classes.ui.space.PlanetBuildingBtnController(game);
        const model = controller.fetchModel({ id: args[0] });
        const valBefore = model.metadata.val;
        const n = args.length >= 2 ? Number(args[1]) : 1;
        controller.build(model, n);
        if (model.metadata.val === valBefore) {
          actionLog.push({ tick: tickIndex, action, args, reason: "cannot-afford-or-locked" });
        }
        game.updateCaches();
        return;
      }
      case "shatter": {
        // ShatterTCBtnController.doShatterAmt via the controller's fetchModel
        const amt = Number(args[0]);
        const controller = new classes.ui.time.ShatterTCBtnController(game);
        const model = controller.fetchModel({ name: "shatterTC", prices: [{ name: "timeCrystal", val: 1 }] });
        const tcBefore = game.resPool.get("timeCrystal").value;
        controller.doShatterAmt(model, amt);
        if (game.resPool.get("timeCrystal").value === tcBefore && game.time.flux === 0 && amt > 0) {
          // cannot-afford probes log only when nothing changed and no flux accrued
          if (!model.enabled) actionLog.push({ tick: tickIndex, action, args, reason: "cannot-afford" });
        }
        game.updateCaches();
        return;
      }
      case "useheat": {
        // UseHeatBtnController.doShatterAmt — "all" = max(2, floor(heat/100))
        const controller = new classes.ui.time.UseHeatBtnController(game);
        const model = controller.fetchModel({ name: "useHeat" });
        const amt = args[0] === "all" ? "all" : Number(args[0]);
        const heatBefore = game.time.getCFU("blastFurnace").heat;
        if (amt === "all") {
          const quantity = Math.max(2, Math.floor(heatBefore / 100));
          controller.doShatterAmt(model, quantity);
        } else {
          controller.doShatterAmt(model, amt);
        }
        if (game.time.getCFU("blastFurnace").heat === heatBefore) {
          actionLog.push({ tick: tickIndex, action, args, reason: "not-enough-heat" });
        }
        game.updateCaches();
        return;
      }
      case "cfu": {
        // ChronoforgeBtnController.build(model, 1) via the stackable fetchModel
        const controller = new classes.ui.time.ChronoforgeBtnController(game);
        const model = controller.fetchModel({ id: args[0] });
        const valBefore = model.metadata.val;
        controller.build(model, 1);
        if (model.metadata.val === valBefore) {
          actionLog.push({ tick: tickIndex, action, args, reason: "cannot-afford-or-locked" });
        }
        game.updateCaches();
        return;
      }
      case "vsu": {
        // VoidSpaceBtnController.build(model, 1) via the stackable fetchModel
        const controller = new classes.ui.time.VoidSpaceBtnController(game);
        const model = controller.fetchModel({ id: args[0] });
        const valBefore = model.metadata.val;
        controller.build(model, 1);
        if (model.metadata.val === valBefore) {
          actionLog.push({ tick: tickIndex, action, args, reason: "cannot-afford-or-locked" });
        }
        game.updateCaches();
        return;
      }
      case "save": game.save(); return;
      case "load": game.load(); return;
      // resop — test-hook action (D014): direct resPool calls for unit-level
      // verification of the resource pipeline (mirrors orig's own jest practice).
      case "resop": {
        const [fn, arg1, arg2, arg3] = args;
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
        if (fn === 'seed2') {
          actionLog.push({ tick: tickIndex, action: 'resop', args, result: 0 });
          return;
        }
        if (fn === 'cache') {
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
        if (fn === "setbld") {
          const b = game.bld.get(arg1);
          b.val = Number(arg2);
          b.on = Number(arg2);
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "forceperk") {
          const perk = game.prestige.getPerk(arg1);
          perk.researched = true; perk.unlocked = true;
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "forcerace") {
          const race = game.diplomacy.get(arg1);
          race.unlocked = true;
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "forcetech") {
          const t = game.science.get(arg1);
          t.researched = true; t.unlocked = true;
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "forcepolicy") {
          const pol = game.science.getPolicy(arg1);
          pol.researched = true; pol.unlocked = true;
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "necroff") {
          game.religion.fastforward(Number(arg1));
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "setchallenge") {
          const chall = game.challenges.getChallenge(arg1);
          if (arg2 === "active") { chall.active = true; chall.unlocked = true; }
          else if (arg2 === "inactive") { chall.active = false; }
          else if (arg2 === "pending") { chall.pending = arg3 === undefined || arg3 === "1"; }
          else if (arg2 === "complete") { chall.researched = true; chall.on += 1; chall.active = false; }
          game.calculateAllEffects();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "forceupg") {
          // D014 injection: mark a workshop upgrade researched
          game.workshop.get(arg1).researched = true;
          game.workshop.get(arg1).unlocked = true;
          game.calculateAllEffects();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "forcepact") {
          const pact = game.religion.getPact(arg1);
          pact.unlocked = true;
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "startobserve") {
          game.calendar.observeRemainingTime = 300;
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "setres") {
          // D014 injection: raw resource state set
          game.resPool.get(arg1).value = Number(arg2);
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "setcfu") {
          // D014 injection: force a CFU meta field
          const cfu = game.time.getCFU(arg1);
          if (arg2 === "val") cfu.val = Number(arg3);
          else if (arg2 === "on") cfu.on = Number(arg3);
          else if (arg2 === "unlocked") cfu.unlocked = arg3 === "1";
          else if (arg2 === "automation") cfu.isAutomationEnabled = arg3 === "1";
          else if (arg2 === "automation-null") cfu.isAutomationEnabled = null;
          else if (arg2 === "delay") cfu.delayTicks = Number(arg3);
          else if (arg2 === "heat") cfu.heat = Number(arg3);
          game.calculateAllEffects();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "setheat") {
          // D014 injection: time.heat = n
          game.time.heat = Number(arg1);
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "redshift") {
          // D014 injection: game.time.applyRedshift(days) with the calendar
          const events = game.time.applyRedshift(Number(arg1));
          actionLog.push({ tick: tickIndex, action: "resop", args, result: events });
          return;
        }
        if (fn === "lzprobe") {
          const sample = "kittens game save probe: {\"saveVersion\":15,\"catnip\":54.61999999999768,\"кітки\":\"太陽\"} 0123456789 aaaabbbbbb";
          const utf16 = LZString.compressToUTF16(sample);
          const b64 = LZString.compressToBase64(sample);
          console.log("LZPROBE utf16len=" + utf16.length + " utf16sha=" + require("crypto").createHash("sha256").update(utf16).digest("hex"));
          console.log("LZPROBE b64len=" + b64.length + " b64sha=" + require("crypto").createHash("sha256").update(b64).digest("hex"));
          console.log("LZPROBE roundtrip=" + (LZString.decompressFromUTF16(utf16) === sample));
          actionLog.push({ tick: tickIndex, action: "resop", args, result: utf16.length });
          return;
        }
        if (fn === "savedump") {
          const blob = LCstorage["com.nuclearunicorn.kittengame.savedata"];
          const crypto = require("crypto");
          const sha = crypto.createHash("sha256").update(blob || "").digest("hex");
          console.log("SAVEDUMP len=" + (blob || "").length + " sha=" + sha);
          console.log("SAVEBLOB " + (blob || ""));
          actionLog.push({ tick: tickIndex, action: "resop", args, result: (blob || "").length });
          return;
        }
        if (fn === "satprobe2") {
          const s = game.space.getBuilding("sattelite");
          console.log("SAT2 tick=" + tickIndex + " val=" + s.val + " on=" + s.on +
            " effPTS=" + s.effects.starchartPerTickBaseSpace +
            " getEff=" + game.getEffect("starchartPerTickBaseSpace") +
            " ptc=" + game.resPool.get("starchart").perTickCached);
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "satprobe") {
          const s = game.space.getBuilding("sattelite");
          actionLog.push({ tick: tickIndex, action: "resop", args, result: s.val * 100 + s.on });
          console.log("SATPROBE val=" + s.val + " on=" + s.on + " ptc=" + game.resPool.get("starchart").perTickCached);
          return;
        }
        if (fn === "iwprobe") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.ironWill ? 1 : 0 });
          return;
        }
        if (fn === "moonon") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.space.getProgram("moonMission").on || 0 });
          return;
        }
        if (fn === "esprobe") {
          const prod = game.village.getResProduction();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: prod["ESwood"] || 0 });
          return;
        }
        if (fn === "addkitten") {
          game.village.sim.addKitten();
          game.village.updateTraits();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "skillprobe") {
          const ks = game.village.sim.kittens.map((k) => ({ s: k.skills, e: k.exp }));
          console.log("SKILLPROBE", JSON.stringify(ks));
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "leader") {
          // village.makeLeader(sim.kittens[idx]); -1 removes the leader
          const idx = Number(arg1);
          game.village.makeLeader(idx >= 0 ? game.village.sim.kittens[idx] : undefined);
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "promote") {
          // sim.promote(kitten, rank?) — result code 1/0/-1/-2
          const idx = Number(arg1);
          const rank = args.length >= 3 ? Number(args[2]) : undefined;
          const code = game.village.sim.promote(game.village.sim.kittens[idx], rank);
          game.updateCaches();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: code });
          return;
        }
        if (fn === "reserves") {
          // reserveMan.calculateReserves(isIronWillPending) + log cryochambers
          game.challenges.reserves.calculateReserves(arg1 === "1");
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.challenges.reserves.reserveCryochambers || 0 });
          return;
        }
        if (fn === "reservesadd") {
          game.challenges.reserves.addReserves();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "shattergc") {
          game.time.shatterInGroupCycles(Number(arg1));
          game.updateCaches();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "shatteric") {
          game.time.shatterInCycles(Number(arg1));
          game.updateCaches();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "unlockalltime") {
          game.time.unlockAll();
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "ffcal") {
          game.calendar.fastforward(Number(arg1));
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "buybcoin") {
          const amt = game.resPool.get("relic").value / game.calendar.getCryptoPrice();
          const added = game.resPool.addResEvent("blackcoin", amt);
          game.resPool.get("relic").value = 0;
          actionLog.push({ tick: tickIndex, action: "resop", args, result: added });
          return;
        }
        if (fn === "sellbcoin") {
          const amt = game.resPool.get("blackcoin").value * game.calendar.getCryptoPrice();
          const added = game.resPool.addResEvent("relic", amt);
          game.resPool.get("blackcoin").value = 0;
          actionLog.push({ tick: tickIndex, action: "resop", args, result: added });
          return;
        }
        if (fn === "day") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.calendar.day });
          return;
        }
        if (fn === "corruption") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.religion.corruption });
          return;
        }
        if (fn === "year") {
          game.calendar.year = Number(arg1);
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "worship") {
          game.religion.faith = Number(arg1);
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "epiphany") {
          game.religion.faithRatio = Number(arg1);
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "faith") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.religion.faith });
          return;
        }
        if (fn === "faithratio") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.religion.faithRatio });
          return;
        }
        if (fn === "tier") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.religion.transcendenceTier });
          return;
        }
        if (fn === "worshipval") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.religion.getRU(arg1).val });
          return;
        }
        if (fn === "embassy") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.diplomacy.get(arg1).embassyLevel });
          return;
        }
        if (fn === "nonrandom") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.diplomacy.nonRandomTrades });
          return;
        }
        if (fn === "forceru") {
          // D014 injection: force-own an RU (later-game prices are out of reach
          // of this slice's economy); mirrors what buying it would set
          const ru = game.religion.getRU(arg1);
          ru.val = 1; ru.on = 1; ru.researched = true; ru.unlocked = true;
          actionLog.push({ tick: tickIndex, action: "resop", args, result: 0 });
          return;
        }
        if (fn === "maxtrade") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.diplomacy.getMaxTradeAmt(game.diplomacy.get(arg1)) });
          return;
        }
        if (fn === "standing") {
          actionLog.push({ tick: tickIndex, action: "resop", args, result: game.diplomacy.getFinalStanding(game.diplomacy.get(arg1)) });
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
  for (const c of g.workshop.crafts) crafts[c.name] = { unlocked: !!c.unlocked, value: c.value || 0, progress: c.progress || 0 };
  const techs = g.science.techs.filter((t) => t.researched).map((t) => t.name).sort();
  const upgrades = g.workshop.upgrades.filter((u) => u.researched).map((u) => u.name).sort();
  const policies = Object.assign({}, ...g.science.policies.map((p) => ({ [p.name]: { unlocked: !!p.unlocked, researched: !!p.researched } })));
  const statsTotal = {};
  for (const st of g.stats.stats) statsTotal[st.name] = st.val || 0;
  const statsCurrent = {};
  for (const st of g.stats.statsCurrent) statsCurrent[st.name] = st.val || 0;
  const achievements = {};
  for (const a of g.achievements.achievements) {
    achievements[a.name] = { unlocked: !!a.unlocked, starUnlocked: !!a.starUnlocked };
  }
  const badges = {};
  for (const b of g.achievements.badges) badges[b.name] = !!b.unlocked;
  const cal = g.calendar;
  const seasonName = (cal.seasons && cal.seasons[cal.season] && cal.seasons[cal.season].name) || null;
  // kitten-level ground truth: jobRef.value and sim kitten jobs can diverge (OBS-1)
  const space = {
    programs: Object.assign({}, ...g.space.programs.map((p) => ({ [p.name]: { val: p.val || 0, on: p.on || 0, unlocked: !!p.unlocked } }))),
    buildings: Object.assign({}, ...g.space.spaceBuildingsMap.map((nm) => { const b = g.space.getBuilding(nm); return { [nm]: { val: b.val || 0, on: b.on || 0, unlocked: !!b.unlocked } }; })),
    planets: Object.assign({}, ...g.space.planets.map((p) => ({ [p.name]: { reached: !!p.reached, unlocked: !!p.unlocked, routeDays: p.routeDays } }))),
  };
  const kittenJobs = g.village.sim.kittens.map((k) => k.job || null).sort();
  return {
    tick: g.ticks,
    rngDraws,
    calendar: {
      year: cal.year, day: cal.day, season: seasonName, weather: cal.weather,
      cycle: cal.cycle, cycleYear: cal.cycleYear,
      cryptoPrice: cal.cryptoPrice, festivalDays: cal.festivalDays || 0,
    },
    kittens: { count: g.village.sim.kittens.length, free: g.village.getFreeKittens(), jobs: kittenJobs },
    resources, buildings, space, jobs, crafts, techs, upgrades, policies,
    religion: {
      faith: g.religion.faith,
      faithRatio: g.religion.faithRatio,
      tier: g.religion.transcendenceTier,
      corruption: g.religion.corruption || 0,
      metas: Object.assign(
        {},
        ...g.religion.religionUpgrades.map((m) => ({ [m.name]: { val: m.val || 0, on: m.on || 0, unlocked: !!m.unlocked, researched: !!m.researched } })),
        ...g.religion.zigguratUpgrades.map((m) => ({ [m.name]: { val: m.val || 0, on: m.on || 0, unlocked: !!m.unlocked, researched: !!m.researched } })),
        ...g.religion.transcendenceUpgrades.map((m) => ({ [m.name]: { val: m.val || 0, on: m.on || 0, unlocked: !!m.unlocked, researched: !!m.researched } })),
      ),
    },
    diplomacy: {
      races: Object.assign({}, ...g.diplomacy.races.map((r) => ({ [r.name]: { unlocked: !!r.unlocked, embassyLevel: r.embassyLevel || 0, energy: r.energy || 0, duration: r.duration || 0 } }))),
    },
    challenges: Object.assign({}, ...g.challenges.challenges.map((c) => ({ [c.name]: { unlocked: !!c.unlocked, pending: !!c.pending, active: !!c.active, researched: !!c.researched, on: c.on || 0 } }))),
    reserves: {
      resources: JSON.parse(JSON.stringify(g.challenges.reserves.reserveResources || {})),
      kittenCount: (g.challenges.reserves.reserveKittens || []).length,
      cryochambers: g.challenges.reserves.reserveCryochambers || 0,
    },
    pacts: Object.assign({}, ...g.religion.pactsManager.pacts.map((p) => ({ [p.name]: { val: p.val || 0, on: p.on || 0, unlocked: !!p.unlocked } }))),
    time: {
      flux: g.time.flux || 0,
      heat: g.time.heat || 0,
      testShatter: g.time.testShatter || 0,
      isAccelerated: !!g.time.isAccelerated,
      // per-CFU: emit only the fields the orig def actually declares
      // (heat: blastFurnace; delayTicks: controlledDelay; isAutomationEnabled:
      // blastFurnace/controlledDelay/temporalAccelerator/temporalPress) —
      // undefined values are dropped by JSON.stringify
      cfu: Object.assign({}, ...g.time.chronoforgeUpgrades.map((m) => ({
        [m.name]: Object.assign(
          { val: m.val || 0, on: m.on || 0 },
          m.heat !== undefined ? { heat: m.heat || 0 } : {},
          m.delayTicks !== undefined ? { delayTicks: m.delayTicks || 0 } : {},
          m.isAutomationEnabled !== undefined ? { automation: m.isAutomationEnabled } : {}
        ),
      }))),
      vsu: Object.assign({}, ...g.time.voidspaceUpgrades.map((m) => ({ [m.name]: { val: m.val || 0, on: m.on || 0 } }))),
    },
    void: {
      vu: Object.assign({}, ...g.void.voidUpgrades.map((m) => ({ [m.name]: { val: m.val || 0, on: m.on || 0, unlocked: !!m.unlocked } }))),
      faction: g.void.faction || null,
    },
    kittenIds: g.village.sim.kittens.map((k) => ({
      name: k.name, surname: k.surname, trait: k.trait.name, age: k.age,
      color: k.color || 0, variety: k.variety || 0, rarity: k.rarity || 0,
      rank: k.rank || 0, exp: k.exp || 0, job: k.job || null, seed: k.seed === undefined ? null : k.seed,
    })),
    observeRemainingTime: g.calendar.observeRemainingTime || 0,
    winterCatnipPerTick: g.winterCatnipPerTick || 0,
    happiness: g.village.happiness || 0,
    stats: { total: statsTotal, current: statsCurrent },
    achievements,
    badges,
    effects: snapEffects(g),
  };
}

// ---------------------------------------------------------------------------
// Catalog dump mode (--dump-catalog): initial resPool state, logic fields only.
// Used by resources-01 verification (see D014 / session 04).

if (process.argv[2] === "--dump-space") {
  const g = game;
  const clone = (o) => o === undefined ? null : JSON.parse(JSON.stringify(o));
  const programs = g.space.programs.map((p) => ({
    name: p.name, prices: p.prices, unlocks: clone(p.unlocks),
    requiredTech: clone(p.requiredTech), maxLevel: p.maxLevel === undefined ? null : p.maxLevel,
  }));
  const planets = g.space.planets.map((pl) => ({
    name: pl.name, reached: !!pl.reached, unlocked: !!pl.unlocked, routeDays: pl.routeDays || 0,
    buildings: pl.buildings.map((b) => ({
      name: b.name, prices: clone(b.prices), unlockRatio: b.unlockRatio === undefined ? null : b.unlockRatio,
      requiredTech: clone(b.requiredTech), unlockThreshold: b.unlockThreshold === undefined ? null : b.unlockThreshold,
      unlocks: clone(b.unlocks), effects: clone(b.effects), calculateEffects: typeof b.calculateEffects === "function",
      action: typeof b.action === "function", stages: clone(b.stages) || null,
    })),
  }));
  console.log(JSON.stringify({ programs, planets }, null, 1));
  process.exit(0);
}
if (process.argv[2] === "--dump-defs") {
  const g = game;
  const clone = (o) => JSON.parse(JSON.stringify(o === undefined ? null : o));
  const unlockShape = (u) => (u ? { buildings: u.buildings || [], tabs: u.tabs || [], jobs: u.jobs || [], tech: u.tech || [], policies: u.policies || [], upgrades: u.upgrades || [], zebraUpgrades: u.zebraUpgrades || [], religion: u.religion || [], crafts: u.crafts || [], perks: u.perks || [], stages: (u.stages || []).map(s => typeof s === "string" ? s : (s.bld || s.name || "?") + ":" + (s.stage !== undefined ? s.stage : "?")) } : null);
  const buildings = g.bld.buildingsData.map((b) => {
    const base = clone(b.effects);
    let calc = null;
    if (typeof b.calculateEffects === "function") {
      const before = clone(b.effects);
      const saveVal = b.val;
      b.val = 0; b.calculateEffects(b, g);
      const atVal0 = clone(b.effects);
      b.val = 1; b.calculateEffects(b, g);
      const atVal1 = clone(b.effects);
      b.val = saveVal; b.calculateEffects(b, g); b.effects = before;
      calc = { atVal0, atVal1 };
    }
    return {
      name: b.name, tab: b.tab || null, stage: b.stage || 0,
      unlockRatio: b.unlockRatio === undefined ? null : b.unlockRatio,
      defaultUnlockable: !!b.defaultUnlockable, unlockable: !!b.unlockable, unlocked: !!b.unlocked,
      prices: clone(b.prices) || [], priceRatio: b.priceRatio === undefined ? null : b.priceRatio,
      limitBuild: b.limitBuild === undefined ? null : b.limitBuild,
      togglableOnOff: !!b.togglableOnOff, noStackable: !!b.noStackable,
      breaksIronWill: !!b.breakIronWill,
      effectsBase: base, calc,
      stages: (b.stages || []).map((s) => ({
        key: s.name || s.key || null,
        prices: clone(s.prices) || [],
        unlockRatio: s.unlockRatio === undefined ? null : s.unlockRatio,
        effects: clone(s.effects) || {},
      })),
      unlocks: unlockShape(b.unlocks),
      upgrades: unlockShape(b.upgrades),
      unlockScheme: b.unlockScheme ? { name: b.unlockScheme.name, threshold: b.unlockScheme.threshold } : null,
    };
  });
  const techs = g.science.techs.map((t2) => ({
    name: t2.name, prices: clone(t2.prices) || [], unlocked: !!t2.unlocked, researched: !!t2.researched,
    unlocks: unlockShape(t2.unlocks), upgrades: unlockShape(t2.upgrades),
  }));
  const policies = g.science.policies.map((p) => {
    // capture evaluateLocks checkRelation gates symbolically (D014-style
    // harness probing of orig closures — orig source untouched)
    let gate = null;
    if (typeof p.evaluateLocks === "function") {
      const inert = () => ({ val: 0, on: 0, value: 0, researched: true, unlocked: true, effects: {} });
      const proxyGame = {
        science: {
          checkRelation: (race, needed) => { gate = { race, needed }; return false; },
          getPolicy: inert,
          get: inert,
        },
        prestige: { getPerk: inert },
        bld: { get: inert, getBuildingExt: () => ({ meta: { effects: {} } }) },
        resPool: { get: inert },
        village: { getEffectLeader: (t, d) => d },
        workshop: { get: inert, getZebraUpgrade: inert },
        religion: { getZU: inert, getRU: inert, getTU: inert },
        space: { getProgram: inert, getBuilding: inert, getPlanet: inert },
        challenges: { getChallenge: inert, isActive: () => false },
        time: { getVSU: inert },
        calendar: { getCryptoPrice: () => 1000 },
        getEffect: () => 0,
        getFeatureFlag: () => true,
        ironWill: false,
      };
      p.evaluateLocks(proxyGame); // orig: item.evaluateLocks(this.game) — single arg
    }
    return {
      name: p.name, prices: clone(p.prices) || [], unlocked: !!p.unlocked, researched: !!p.researched,
      unlocks: unlockShape(p.unlocks), isRelation: !!p.isRelation,
      gate: gate,
    };
  });
  const upgrades = g.workshop.upgrades.map((u) => ({
    name: u.name, prices: clone(u.prices) || [], unlocked: !!u.unlocked, researched: !!u.researched,
    effects: clone(u.effects) || {},
  }));
  const crafts = g.workshop.crafts.map((c) => ({
    name: c.name, prices: clone(c.prices) || [], unlocked: !!c.unlocked, value: c.value || 0,
    tier: c.tier === undefined ? null : c.tier, isLimited: !!c.isLimited, ignoreBonuses: !!c.ignoreBonuses,
    progressHandicap: c.progressHandicap === undefined ? null : c.progressHandicap,
    unlocks: unlockShape(c.unlocks), upgrades: unlockShape(c.upgrades),
  }));
  const zebraUpgrades = g.workshop.zebraUpgrades.map((u) => ({
    name: u.name, prices: clone(u.prices) || [], unlocked: !!u.unlocked, researched: !!u.researched,
    effects: clone(u.effects) || {},
    unlocks: unlockShape(u.unlocks), upgrades: unlockShape(u.upgrades),
  }));
  const seasons = g.calendar.seasons.map((s) => ({ name: s.name, modifiers: clone(s.modifiers) || {} }));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ driver: "orig-driver.js", origCommit: origCommit(), buildings, techs, policies, upgrades, crafts, zebraUpgrades, seasons }, null, 1));
  console.log(`defs -> ${outPath} (buildings ${buildings.length}, techs ${techs.length}, policies ${policies.length}, upgrades ${upgrades.length}, crafts ${crafts.length})`);
  process.exit(0);
}
if (dumpVillageOnly) {
  const v = game.village;
  const dump = {
    jobNames: v.jobNames,
    jobs: v.jobNames.map(n => {
      const j = v.getJob(n);
      const mods = JSON.parse(JSON.stringify(j.modifiers));
      if (typeof j.calculateEffects === 'function') {
        j.calculateEffects(j, game);
        return { name: j.name, modifiers: mods, calculated: j.modifiers, value: j.value, unlocked: !!j.unlocked };
      }
      return { name: j.name, modifiers: mods, value: j.value, unlocked: !!j.unlocked };
    }),
    traits: com.nuclearunicorn.game.village.Kitten.prototype.traits.map(t => ({ name: t.name })),
    names: com.nuclearunicorn.game.village.Kitten.prototype.names,
    surnames: com.nuclearunicorn.game.village.Kitten.prototype.surnames
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ driver: 'orig-driver.js', origCommit: origCommit(), village: dump }, null, 1));
  console.log('village catalog -> ' + outPath);
  process.exit(0);
}
if (dumpCatalogOnly) {
  // Bool fields: undefined ≡ false in JS truthiness — canonicalized to false so
  // the F# dump compares exactly (D014). String optionals (color/tag) stay null.
  const boolFields = ["visible", "craftable", "calculatePerTick", "persists", "aiCanDestroy",
    "transient", "isNotRefundable", "calculatePerDay", "calculatePerTickAndDay", "calculateOnYear"];
  const strFields = ["name", "type", "color", "tag"];
  const catalog = game.resPool.resources.map((r) => {
    const o = {};
    for (const f of strFields) o[f] = r[f] === undefined ? null : r[f];
    for (const f of boolFields) o[f] = r[f] === undefined ? false : !!r[f];
    o.hasCustomIsRefundable = typeof r.isRefundable === "function" && !r.isNotRefundable && r.name === "antimatter";
    return o;
  });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ driver: "orig-driver.js", origCommit: origCommit(), catalog }, null, 1));
  console.log(`catalog: ${catalog.length} resources -> ${outPath}`);
  process.exit(0);
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
if (resSaveData) result.resPoolSave = resSaveData.resources;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result, null, 1));
console.log(`scenario "${scenario.name}": ${scenario.maxTick} ticks, ${snapshots.length} snapshots, ${rngDraws} rng draws -> ${outPath}`);
if (actionLog.length) console.log(`action warnings: ${actionLog.length} (see actionLog in output)`);

function origCommit() {
  try { return require("child_process").execSync("git rev-parse HEAD", { cwd: ORIG }).toString().trim(); }
  catch { return "unknown"; }
}
