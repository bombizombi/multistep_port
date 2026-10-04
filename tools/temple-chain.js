#!/usr/bin/env node
"use strict";
/**
 * temple-chain.js — solver Level 0: extract the real prerequisite DAG of a
 * target building from the orig fixtures. No guessing: unlock edges, craft
 * ingredients, tech prereqs and production sources all come from
 * oracle/fixtures/defs-orig.json (the actual orig objects).
 */
const fs = require("fs");
const path = require("path");

const defs = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "oracle", "fixtures", "defs-orig.json"), "utf8"));
const target = process.argv[2] || "temple";

const bld = new Map(defs.buildings.map((b) => [b.name, b]));
const techs = new Map(defs.techs.map((t) => [t.name, t]));
const crafts = new Map(defs.crafts.map((c) => [c.name, c]));

// who unlocks X? (scan every entity's unlocks.buildings)
function unlockedBy(name) {
  const out = [];
  for (const [kind, arr] of [["tech", defs.techs], ["bld", defs.buildings], ["upg", defs.upgrades], ["pol", defs.policies]]) {
    for (const x of arr) {
      if (x.unlocks && Array.isArray(x.unlocks.buildings) && x.unlocks.buildings.includes(name)) out.push(kind + ":" + x.name);
    }
  }
  return out;
}

// resources needed by an entity + how each resource is produced
function ingredientTree(entityName, depth, seen) {
  if (depth > 6 || seen.has(entityName)) return;
  seen.add(entityName);
  const pad = "  ".repeat(depth);
  const b = bld.get(entityName);
  if (b) {
    const by = unlockedBy(entityName).join(",") || "(always)";
    console.log(`${pad}${entityName} [building] prices=${JSON.stringify(b.prices)} unlockedBy=${by}`);
    for (const p of b.prices || []) resourceLine(p.name, depth + 1, seen);
    return;
  }
  const t = techs.get(entityName);
  if (t) {
    const by = unlockedBy("tech:" + entityName);
    console.log(`${pad}${entityName} [tech] prices=${JSON.stringify(t.prices)} gatedBy=${JSON.stringify(by.length ? by : "see techs")}`);
    for (const p of t.prices || []) resourceLine(p.name, depth + 1, seen);
    return;
  }
  console.log(`${pad}${entityName} (?)`);
}

function resourceLine(res, depth, seen) {
  const pad = "  ".repeat(depth);
  const c = crafts.get(res);
  if (c) {
    console.log(`${pad}${res} = craft(${JSON.stringify(c.prices)})`);
    for (const p of c.prices || []) resourceLine(p.name, depth + 1, seen);
    // who unlocks the craft?
    for (const x of defs.techs) {
      if (x.unlocks && Array.isArray(x.unlocks.crafts) && x.unlocks.crafts.includes(res)) {
        console.log(`${pad}  craft unlocked by tech:${x.name} (prices=${JSON.stringify(x.prices)})`);
      }
    }
    return;
  }
  // building producers of this resource
  const producers = [];
  for (const b of defs.buildings) {
    const e = b.effectsBase || {};
    for (const k of Object.keys(e)) {
      const v = e[k];
      if (k === res + "PerTickBase" || k === res + "PerTickAutoprod" || k === res + "PerTickProd") producers.push(`${b.name}(${k}=${v})`);
    }
  }
  // hunting (village.js L1083: gold drop)
  if (res === "gold") producers.push("hunting(binominal 0.25/squad, irwinHall amounts)");
  if (res === "furs" || res === "manpower") producers.push("hunting(main loot)");
  console.log(`${pad}${res} <- ${producers.join(", ") || "(no static producer found)"}`);
}

console.log(`=== prerequisite chain of "${target}" ===`);
ingredientTree(target, 0, new Set());
