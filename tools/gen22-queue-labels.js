#!/usr/bin/env node
"use strict";
/**
 * gen22-queue-labels.js — dump the classes.queue.manager option universe
 * (name + display label per queue source type) from the orig catalogs and
 * emit an F# data file with en-US collation ranks for getQueueOptionsAlphabetical.
 *
 * Labels in the harness are the $I() mock placeholders ("$key$"), so the rank
 * table is computed once here, with Node's own localeCompare — the FS side
 * sorts by rank (stable), which is bit-identical to label.localeCompare.
 * (time-15; one-shot generator, output checked in)
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require(path.resolve(__dirname, "..", "oracle", "runner", "node_modules", "jsdom"));

const ORIG = path.resolve(__dirname, "..", "..", "orig_project", "kittensgame");
const ORIG_LOAD_ORDER = [
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

const dom = new JSDOM("<!doctype html><html><body><div id='gameContainerId'></div><div id='observeButton'></div></body></html>", {
  url: "https://oracle.local/", pretendToBeVisual: false,
});
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, "navigator", { value: dom.window.navigator, configurable: true });
global.location = dom.window.location;

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
  Deferred: function () { this.callback = () => {}; this.addCallback = () => {}; },
  destroy: function () {}, empty: function () {},
  create: function () { return { connect: function () {} }; },
  byId: function () { return {}; },
  forEach: function (array, predicate) { for (const i in array) predicate(array[i]); },
  clone: function (mixin) { if (mixin instanceof Array) return mixin.map((e) => global.dojo.clone(e)); return Object.assign({}, mixin); },
  hitch: function (ctx, method) { return method.bind(ctx, arguments); },
  connect: function () {}, publish: function () {}, subscribe: function () {},
  mixin: function (obj, mx) { return Object.assign(obj, mx); },
};
global.LZString = require(path.join(ORIG, "lib/lz-string.js"));
require(path.join(ORIG, "lib/system.js"));
global.LCstorage = window.localStorage;
for (const g of ["com", "classes", "mixin", "dojo", "React", "$", "LZString"]) dom.window[g] = global[g];
require(path.join(ORIG, "config.js"));
require(path.join(ORIG, "i18n.js"));
global.$I = function (key, args) { return "$" + key + "$"; };
dom.window.$I = global.$I;
for (const rel of ORIG_LOAD_ORDER.slice(7)) require(path.join(ORIG, rel));
global.newrelic = { addPageAction: function () {}, addRelease: function () {}, setCustomAttribute: function () {}, setErrorHandler: function () {} };

global.gamePage = global.game = new com.nuclearunicorn.game.ui.GamePage();
game.setUI(new classes.ui.UISystem("gameContainerId"));
game.ui.confirm = function (title, msg, callbackOk) { callbackOk(); };
game.resetState();

// force the full option universe visible (extraction only — never saved)
for (const b of game.bld.buildingsData) b.unlocked = true;
for (const t of game.science.techs) t.unlocked = true;
for (const p of game.science.policies) p.unlocked = true;
for (const u of game.workshop.upgrades) u.unlocked = true;
for (const z of game.workshop.zebraUpgrades) z.unlocked = true;
for (const r of game.religion.religionUpgrades) r.unlocked = true;
for (const z of game.religion.zigguratUpgrades) z.unlocked = true;
for (const t of game.religion.transcendenceUpgrades) t.unlocked = true;
for (const c of game.time.chronoforgeUpgrades) c.unlocked = true;
for (const v of game.time.voidspaceUpgrades) v.unlocked = true;
for (const p of game.space.programs) p.unlocked = true;
for (const pl of game.space.planets) for (const b of pl.buildings) b.unlocked = true;
for (const r of game.diplomacy.races) r.unlocked = true;
game.prestige.getPerk("treaties").researched = true;
game.workshop.get("chronoforge").researched = true;
game.religion.faith = 1e15;

const types = ["buildings", "tech", "upgrades", "policies", "embassies", "religion",
  "zebraUpgrades", "spaceMission", "spaceBuilding", "zigguratUpgrades",
  "transcendenceUpgrades", "chronoforge", "voidSpace"];

const universe = {}; // type -> [{name, label}]
for (const t of types) {
  const opts = game.time.queue.getQueueOptionsUnsorted(t);
  universe[t] = opts.map((o) => ({ name: o.name, label: o.label }));
}

// building stage labels (option label follows the current stage)
const stageLabels = {};
for (const b of game.bld.buildingsData) {
  if (b.stages) stageLabels[b.name] = b.stages.map((s) => s.label);
}

// collation ranks per type over the full label universe (Node localeCompare)
const fsharp = new fsharpWriter();
fsharp.line("// GENERATED by tools/gen22-queue-labels.js — classes.queue.manager option");
fsharp.line("// universe with en-US collation ranks for getQueueOptionsAlphabetical");
fsharp.line("// (labels are the harness $I() mock placeholders; ranks computed with Node's");
fsharp.line("//  own localeCompare, stable sort by rank is bit-identical to label compare).");
fsharp.line("module Game.QueueLabels");
fsharp.line("");
fsharp.line("/// (qtype, name, stage, rank) — stage is 0 for non-staged entries.");
fsharp.line("let labelRanks : (string * string * int * int) list = [");
for (const t of types) {
  const labels = [];
  for (const o of universe[t]) labels.push(o.label);
  for (const name of Object.keys(stageLabels)) {
    // only buildings have stages; ranks cover every stage label
    if (t === "buildings") for (const l of stageLabels[name]) labels.push(l);
  }
  const uniq = [...new Set(labels)];
  const sorted = uniq.slice().sort((a, b) => a.localeCompare(b));
  const rankOf = new Map(sorted.map((l, i) => [l, i]));
  for (const o of universe[t]) {
    fsharp.line(`      ("${t}", "${o.name}", 0, ${rankOf.get(o.label)})`);
  }
  for (const name of Object.keys(stageLabels)) {
    if (t === "buildings") {
      stageLabels[name].forEach((l, i) => {
        fsharp.line(`      ("${t}", "${name}", ${i + 1}, ${rankOf.get(l)})`);
      });
    }
  }
}
fsharp.line("  ]");
fsharp.line("");
fsharp.line("/// (qtype, name, stage) -> label-rank lookup");
fsharp.line("let rankOf (qtype: string) (name: string) (stage: int) : int =");
fsharp.line("  labelRanks");
fsharp.line("  |> List.tryFind (fun (t, n, s, _) -> t = qtype && n = name && s = stage)");
fsharp.line("  |> Option.map (fun (_, _, _, r) -> r)");
fsharp.line("  |> Option.defaultValue 2147483647");

fs.writeFileSync(path.join(__dirname, "..", "oracle", "runner", "fs-runner", "QueueLabels.fs"), fsharp.text);
const total = types.reduce((n, t) => n + universe[t].length, 0);
console.log(`QueueLabels.fs written: ${total} options across ${types.length} types; staged: ${Object.keys(stageLabels).join(", ") || "none"}`);

function fsharpWriter() {
  const out = [];
  return {
    line: (s) => out.push(s),
    get text() { return out.join("\n") + "\n"; },
  };
}
