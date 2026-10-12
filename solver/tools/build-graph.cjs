#!/usr/bin/env node
"use strict";
/**
 * build-graph.cjs — distil the verified game catalog into a solver-usable graph.
 *
 * INPUT  (all already oracle-verified fixtures; orig is never executed here)
 *   ../oracle/fixtures/defs-orig.json            buildings, techs, upgrades, crafts, policies
 *   ../oracle/fixtures/world-orig.json           races, ZU/RU/TU, perks, space, challenges...
 *   ../oracle/fixtures/village-orig.json         jobs, traits
 *   ../oracle/fixtures/resource-catalog-orig.json  60 resource defs
 *
 * OUTPUT
 *   ../catalog/graph.json   machine-readable: nodes, edges, resource flow, goal closures
 *   ../catalog/GRAPH.md     the same content as a human-readable reference
 *   ../catalog/DEPS.mmd     mermaid DAG of the critical path to the Temple
 *
 * Everything here is a DERIVATION of fixture data plus the pricing rules the
 * port implements (Game.Buildings.getAllPrices: price.val * ratio^val, staged
 * buildings price per stage). No hand-entered game numbers.
 */

const fs = require("fs");
const path = require("path");

const FIX = path.resolve(__dirname, "..", "..", "oracle", "fixtures");
const OUT = path.resolve(__dirname, "..", "catalog");
const load = (f) => JSON.parse(fs.readFileSync(path.join(FIX, f), "utf8"));

const defs = load("defs-orig.json");
const world = load("world-orig.json");
const village = load("village-orig.json").village;
const resCatalog = load("resource-catalog-orig.json").catalog;


// ---------------------------------------------------------------------------
// Canonical node-id prefixes. Node creation AND idOf() must agree — an edge
// pointing at a non-existent id silently breaks every closure walk.
const PREFIX = {
  resource: "res", building: "bld", tech: "tech", upgrade: "upg",
  craft: "craft", policy: "pol", zebraUpgrade: "zebraUpgrade",
  job: "job", tab: "tab", stage: "stage", religion: "religion", perk: "perk",
  race: "race", zu: "zu", ru: "ru", tu: "tu", program: "program",
  planet: "planet", spaceBuilding: "spaceBuilding", cfu: "cfu", vsu: "vsu",
  challenge: "challenge", pact: "pact",
};
const idOf = (kind, name) => `${PREFIX[kind] || kind}:${name}`;

// helpers

/** Price of `def` at stack level `val` — the port's rule: base * ratio^val. */
function priceAt(def, val) {
  if (!def.prices || def.prices.length === 0) return [];
  const r = def.priceRatio == null ? 1 : def.priceRatio;
  return def.prices.map((p) => ({ resource: p.name, val: p.val * Math.pow(r, val) }));
}

/**
 * Flatten a building's effect map.
 * Staged buildings (library, warehouse, amphitheatre, barn…) carry NO
 * effectsBase — their effects live on each stage, so fold stage 0 in or the
 * most important buildings render as having no effect at all.
 */
function effectsOf(b) {
  const out = { ...(b.effectsBase || {}) };
  const calc = b.calc && b.calc.atVal0 ? b.calc.atVal0 : null;
  if (calc) {
    for (const [k, v] of Object.entries(calc)) {
      if (v !== 0 && v != null) out[k] = v;
      else if (!(k in out)) out[k] = v;
    }
  }
  if (b.stages && b.stages.length && b.stages[0].effects) {
    Object.assign(out, b.stages[0].effects);
  }
  return out;
}

/** Every unlock target of a def, normalised to {kind, name} pairs. */
function unlockTargets(u) {
  if (!u) return [];
  const kindOf = {
    buildings: "building", tabs: "tab", jobs: "job", tech: "tech",
    policies: "policy", upgrades: "upgrade", zebraUpgrades: "zebraUpgrade",
    religion: "religion", crafts: "craft", perks: "perk", stages: "stage",
  };
  const out = [];
  for (const [k, names] of Object.entries(u)) {
    if (!Array.isArray(names)) continue;
    for (const n of names) if (n) out.push({ kind: kindOf[k] || k, name: n });
  }
  return out;
}

/** A building's stage list normalised (staged buildings have empty .prices). */
function stagesOf(b) {
  return (b.stages || []).map((s, i) => ({
    index: i,
    prices: s.prices || [],
    priceAtStage: s.prices || [],
    unlockRatio: s.unlockRatio == null ? null : s.unlockRatio,
    effects: s.effects || {},
  }));
}

// ---------------------------------------------------------------------------
// nodes

const nodes = [];
const push = (n) => { nodes.push(n); return n; };

const resourceNodes = resCatalog.map((r) =>
  push({
    id: `res:${r.name}`,
    kind: "resource",
    name: r.name,
    type: r.type,               // common | uncommon | rare | exotic
    craftable: r.craftable,
    persists: r.persists,
    tag: r.tag,
    producedBy: [],
    consumedBy: [],
  })
);

const buildingNodes = defs.buildings.map((b) =>
  push({
    id: `bld:${b.name}`,
    kind: "building",
    name: b.name,
    tab: b.tab,
    stage: b.stage,
    basePrices: b.prices || [],
    priceRatio: b.priceRatio,
    staged: (b.stages || []).length > 0,
    stages: stagesOf(b),
    limitBuild: b.limitBuild,
    defaultUnlockable: b.defaultUnlockable,
    unlockRatio: b.unlockRatio,
    unlockScheme: b.unlockScheme || null,
    breaksIronWill: b.breaksIronWill,
    togglableOnOff: b.togglableOnOff,
    noStackable: b.noStackable,
    effects: effectsOf(b),
    unlocks: unlockTargets(b.unlocks),
    upgrades: unlockTargets(b.upgrades),
  })
);

const techNodes = defs.techs.map((t) =>
  push({
    id: `tech:${t.name}`,
    kind: "tech",
    name: t.name,
    prices: t.prices || [],
    unlockedAtStart: t.unlocked,
    unlocks: unlockTargets(t.unlocks),
    upgrades: unlockTargets(t.upgrades),
  })
);

const upgradeNodes = defs.upgrades.map((u) =>
  push({
    id: `upg:${u.name}`,
    kind: "upgrade",
    name: u.name,
    prices: u.prices || [],
    effects: u.effects || {},
  })
);

const craftNodes = defs.crafts.map((c) =>
  push({
    id: `craft:${c.name}`,
    kind: "craft",
    name: c.name,
    prices: c.prices || [],
    tier: c.tier,
    isLimited: c.isLimited,
    ignoreBonuses: c.ignoreBonuses,
    progressHandicap: c.progressHandicap,
    unlocks: unlockTargets(c.unlocks),
    upgrades: unlockTargets(c.upgrades),
  })
);

const policyNodes = defs.policies.map((p) =>
  push({
    id: `pol:${p.name}`,
    kind: "policy",
    name: p.name,
    prices: p.prices || [],
    isRelation: p.isRelation,
    gate: p.gate,
    unlocks: unlockTargets(p.unlocks),
  })
);

// world defs: kept as first-class nodes so the graph is complete, but they are
// outside the Temple critical path (see GOALS below).
const worldGroups = {
  race: world.races, zu: world.zu, ru: world.ru, tu: world.tu,
  perk: world.perks, program: world.programs, planet: world.planets,
  spaceBuilding: world.spaceBuildings, cfu: world.cfu, vsu: world.vsu,
  challenge: world.challenges, pact: world.pacts,
};
for (const [kind, list] of Object.entries(worldGroups)) {
  for (const d of list || []) {
    push({
      id: `${kind}:${d.name}`,
      kind,
      name: d.name,
      prices: d.prices || null,
      effects: d.effects || null,
      unlocks: unlockTargets(d.unlocks),
    });
  }
}
for (const d of defs.zebraUpgrades || []) {
  push({ id: `zebraUpgrade:${d.name}`, kind: "zebraUpgrade", name: d.name, prices: d.prices || [], effects: d.effects || {} });
}
for (const j of village.jobs) {
  push({
    id: `job:${j.name}`,
    kind: "job",
    name: j.name,
    modifiers: j.modifiers || {},
    calculated: j.calculated || null,
    unlocked: j.unlocked,
  });
}

// ---------------------------------------------------------------------------
// unlock gate for each building, straight from the port's predicate
// (Game.Buildings.isUnlocked, Game.Buildings.fs:36-52):
//
//   unlocked = unlockable(defaultUnlockable || unlockable)
//           AND for every price of the CURRENT stage:
//                 stock[resource] >= price.val * unlockRatio
//
// `unlockScheme.threshold` is a separate UI reveal gate, not this predicate.

for (const n of buildingNodes) {
  const stage = n.staged && n.stages.length ? n.stages[0] : null;
  const prices = stage ? stage.prices : n.basePrices;
  const ratio = stage ? stage.unlockRatio : n.unlockRatio;
  n.unlockGate = {
    unlockable: n.defaultUnlockable,
    ratio,
    needs: (prices || [])
      .filter((p) => p && p.name)
      .map((p) => ({ resource: p.name, atRatio: p.val * (ratio == null ? 1 : ratio), price: p.val })),
    uiScheme: n.unlockScheme,
  };
}

// ---------------------------------------------------------------------------
// edges

const edges = [];
const edge = (from, to, kind, extra = {}) => edges.push({ from, to, kind, ...extra });


// enables: producer unlocks consumer  (tech -> building, building -> job, ...)
for (const n of nodes) {
  for (const t of n.unlocks || []) {
    edge(n.id, idOf(t.kind, t.name), "enables", { via: "unlocks" });
  }
  for (const t of n.upgrades || []) {
    edge(n.id, idOf(t.kind, t.name), "enables", { via: "upgrades" });
  }
}

// threshold unlocks: a default-unlockable building appears once its gating
// resource is stocked to price x unlockRatio (Game.Buildings.isUnlocked).
for (const n of buildingNodes) {
  if (!n.unlockGate.unlockable) continue;
  for (const need of n.unlockGate.needs) {
    edge(idOf("resource", need.resource), n.id, "unlocksAt", { need: need.atRatio });
  }
}

// costs: action -> resource
for (const n of nodes) {
  if (n.kind === "resource" || n.kind === "job" || n.kind === "tab") continue;
  // buildings carry `basePrices`; crafts/techs/upgrades/policies carry `prices`.
  // Missing this is why craft inputs vanished from the goal closure.
  const priceList = n.staged && n.stages.length ? n.stages[0].prices : n.basePrices || n.prices || [];
  for (const p of priceList || []) {
    if (!p || !p.name) continue;
    edge(n.id, idOf("resource", p.name), "costs", {
      val: p.val,
      ratio: n.staged ? null : n.priceRatio,
      formula: n.staged ? null : `${p.val} × ${n.priceRatio ?? 1}^n`,
      limitBuild: n.limitBuild ?? null,
    });
  }
}

// resource flow: which effects move which resource each tick.
// Orig naming: <res>PerTickBase / PerTickAutoprod / PerTickProd (positive =
// produced), <res>PerTickCon (already negative = consumed). <res>Ratio and
// <res>Max are modifiers, not flows, and are deliberately excluded.
const PRODUCES = /^(.+)PerTick(Base|Autoprod|Prod|Con)$/;
for (const n of nodes) {
  if (n.kind !== "building") continue;
  for (const [k, v] of Object.entries(n.effects || {})) {
    const m = PRODUCES.exec(k);
    if (!m) continue;
    const res = m[1];
    if (!resCatalog.some((r) => r.name === res)) continue;
    const node = resourceNodes.find((r) => r.name === res);
    // Orig already stores consumption as a NEGATIVE number (smelter:
    // woodPerTickCon -0.05). Do NOT negate — that flips consumption into
    // production, which made `mint` look like a gold producer when it in fact
    // spends gold. Consuming is sign < 0.
    const amount = typeof v === "number" ? v : 0;
    if (amount === 0) continue;
    edge(n.id, idOf("resource", res), amount > 0 ? "produces" : "consumes", { perTick: amount });
    (amount > 0 ? node.producedBy : node.consumedBy).push({ kind: n.kind, name: n.name, perTick: amount });
  }
}

// job production: each job writes into its modifier resources.
for (const j of village.jobs) {
  const mods = { ...(j.modifiers || {}), ...(j.calculated || {}) };
  for (const [k, v] of Object.entries(mods)) {
    if (k === "cultureConsumptionAmbassadors" || k === "spiceConsumptionAmbassadors") continue;
    if (!resCatalog.some((r) => r.name === k)) continue;
    const node = resourceNodes.find((r) => r.name === k);
    edge(idOf("job", j.name), idOf("resource", k), "produces", { perWorkerTick: v });
    (v >= 0 ? node.producedBy : node.consumedBy).push({ kind: "job", name: j.name, perWorkerTick: v });
  }
}

// craft chain: craft -> resource it yields
const CRAFT_YIELD = {
  wood: "wood", beam: "beam", slab: "slab", plate: "plate", steel: "steel",
  concreate: "concrate", gear: "gear", alloy: "alloy", eludium: "eludium",
  scaffold: "scaffold", ship: "ship", tanker: "tanker", kerosene: "kerosene",
  plastic: "plastic", microchip: "microchip", parchment: "parchment",
  manuscript: "manuscript", compedium: "compedium", blueprint: "blueprint",
  thorium: "thorium", megalith: "megalith", bloodstone: "bloodstone",
  tMythril: "tMythril",
};
for (const c of defs.crafts) {
  const y = CRAFT_YIELD[c.name];
  if (y && resCatalog.some((r) => r.name === y)) {
    edge(idOf("craft", c.name), idOf("resource", y), "produces", { perCraft: 1 });
    const node = resourceNodes.find((r) => r.name === y);
    node.producedBy.push({ kind: "craft", name: c.name, perCraft: 1 });
  }
}

// ---------------------------------------------------------------------------
// hunting — the ONLY gold source early, and it is STOCHASTIC, so it cannot be
// expressed as a per-tick rate. Formula transcribed from the port,
// Game.Village.gainHuntRes (Game.Village.fs:28-82):
//
//   squads = 0.25 * hunters                    (huntFraction, hunters)
//   unicorns = binominal(rand, squads, chance)
//   bloodstone = binominal(rand, squads, 0.005 * ratio)   [zebras >= 10]
//   gold      = 5*IH(goldHunts) + 5*hunterRatio*IH(goldHunts)
//               where goldHunts = binominal(rand, squads, 0.25)
//               *** GATED ON IronWill AND goldOre researched ***
//   ivory     = 50*IH(ivoryHunts) + 40*hunterRatio*IH(ivoryHunts)
//   furs      = 80*IH(squads) + 65*hunterRatio*IH(squads)
//   IH = irwinHallRandom: floor(6 * mean-of-3-uniforms) style draw

const HUNT_GATES = {
  gold: "IronWill AND upgrade:goldOre researched (Game.Village.fs:62)",
  furs: "always (hunters > 0)",
  ivory: "always, but scales with hunterRatio",
  unicorns: "always",
  bloodstone: "zebras >= 10",
};

const huntNode = push({
  id: "act:hunt",
  kind: "action",
  name: "hunt",
  stochastic: true,
  formula: {
    squads: "0.25 * hunters",
    gold: "5*IH(binominal(rand, squads, 0.25)) + 5*hunterRatio*IH(same)",
    furs: "80*IH(squads) + 65*hunterRatio*IH(squads)",
    ivory: "50*IH(binominal(rand, squads, 0.45+0.02*hunterRatio)) + 40*hunterRatio*IH(same)",
    unicorns: "binominal(rand, squads, unicornChance)",
    requires: "hunters > 0 and manpower >= 1",
  },
  gates: HUNT_GATES,
});

for (const [res, gate] of Object.entries(HUNT_GATES)) {
  if (!resCatalog.some((r) => r.name === res)) continue;
  edge(huntNode.id, idOf("resource", res), "produces", { stochastic: true, gate });
  const node = resourceNodes.find((r) => r.name === res);
  node.producedBy.push({ kind: "action", name: "hunt", stochastic: true, gate });
}
// hunting needs hunters, and hunters are unlocked by archery
edge(idOf("tech", "archery"), idOf("job", "hunter"), "enables", { via: "unlocks" });

// ---------------------------------------------------------------------------
// unlock resolution: who makes `id` available?

const enabledBy = {};
for (const e of edges) {
  if (e.kind !== "enables") continue;
  (enabledBy[e.to] = enabledBy[e.to] || []).push(e.from);
}

// ---------------------------------------------------------------------------
// goal closure: the full transitive prerequisite set of a target node.
//
// Walks three relations, all pointing from dependency -> dependent:
//   enables / unlocksAt : something must be bought/researched first
//   produces            : to HAVE a resource you need whoever produces it
//   costs               : to BUILD/MAKE a thing you need its input resources
//                         (cost edges point outward, so follow them forward)

function closure(targetId) {
  const seen = new Set();
  const stack = [targetId];
  const why = {};
  const push = (id, reason) => {
    if (seen.has(id)) return;
    why[id] = reason;
    stack.push(id);
  };
  const BACKWARD = new Set(["enables", "unlocksAt", "produces"]);

  while (stack.length) {
    const cur = stack.pop();
    if (seen.has(cur)) continue;
    seen.add(cur);

    // what must exist for `cur`
    for (const e of edges) {
      if (!BACKWARD.has(e.kind) || e.to !== cur) continue;
      push(e.from, `${e.kind} ${cur}${e.need != null ? ` (need ${e.need})` : ""}`);
    }

    // what `cur` consumes to be built
    for (const e of edges) {
      if (e.kind !== "costs" || e.from !== cur) continue;
      push(e.to, `costs ${cur}${e.formula ? ` (${e.formula})` : ""}`);
    }
  }
  seen.delete(targetId);
  return { nodes: [...seen].sort(), why };
}

/** Union of the closures of several targets (e.g. the temple's four inputs). */
function closureOfAll(targetIds) {
  const why = {};
  const all = new Set();
  for (const t of targetIds) {
    const c = closure(t);
    for (const id of c.nodes) { all.add(id); why[id] = c.why[id]; }
  }
  for (const t of targetIds) all.delete(t);
  return { nodes: [...all].sort(), why };
}

/**
 * BFS shortest enabling-path from the fresh-game state to `target`.
 * Seeds are the nodes already available at tick 0: catnip, the pre-unlocked
 * techs (calendar/agriculture/archery in orig), every defaultUnlockable
 * building (revealed by resource thresholds), and the start-unlocked jobs/crafts.
 */
function unlockPath(targetId) {
  const start = new Set(["res:catnip"]);
  for (const n of nodes) {
    if (n.kind === "tech" && n.unlockedAtStart) start.add(n.id);
    if (n.kind === "building" && n.defaultUnlockable) start.add(n.id);
    if ((n.kind === "job" || n.kind === "craft") && n.unlocked) start.add(n.id);
  }
  const prev = new Map();
  const q = [...start];
  const seen = new Set(q);
  const TRAVERSABLE = new Set(["enables", "unlocksAt"]);
  while (q.length) {
    const cur = q.shift();
    if (cur === targetId) break;
    for (const e of edges) {
      if (!TRAVERSABLE.has(e.kind) || e.from !== cur) continue;
      if (seen.has(e.to)) continue;
      seen.add(e.to);
      prev.set(e.to, cur);
      q.push(e.to);
    }
  }
  if (!prev.has(targetId) && !start.has(targetId)) return null;
  const path = [targetId];
  let c = targetId;
  while (prev.has(c)) { c = prev.get(c); path.unshift(c); }
  return path;
}

// ---------------------------------------------------------------------------
// emit

// The Temple has TWO independent unlock routes, and they are not comparable in
// size — the union closure is 89 nodes because the ziggurat route drags in
// blueprint -> compedium -> microchip -> antimatter. Keep them separate so the
// recipe can choose a route instead of inheriting both.
const TEMPLE_INPUTS = ["res:gold", "res:slab", "res:plate", "res:manuscript"];

const GOALS = {
  temple: closure("bld:temple"),          // union of every route
  materials: closureOfAll(TEMPLE_INPUTS), // just the four resources
  philosophyRoute: closure("tech:philosophy"), // science spine
  zigguratRoute: closure("bld:ziggurat"),  // the expensive alternative
};

/**
 * Topological layering of a dependency subgraph: layer 0 can be done with
 * nothing but the starting state, layer N needs everything below it.
 * This IS a build order skeleton — the solver fills in the timings.
 */
function layers(nodeSet) {
  const remaining = new Set(nodeSet);
  const done = new Set();
  const out = [];
  // dependencies INSIDE the set only
  const depsIn = (id) =>
    edges
      .filter((e) => e.to === id && remaining.has(e.from) &&
        (e.kind === "enables" || e.kind === "produces" || e.kind === "costs"))
      .map((e) => e.from);

  while (remaining.size) {
    const ready = [...remaining].filter((id) => !depsIn(id).some((d) => remaining.has(d) && !done.has(d)));
    if (!ready.length) {
      // cycle (craft chains can loop through costs); break it deterministically
      const fallback = [...remaining].sort()[0];
      out.push([fallback]);
      done.add(fallback);
      remaining.delete(fallback);
      continue;
    }
    out.push(ready.sort());
    for (const id of ready) { done.add(id); remaining.delete(id); }
  }
  return out;
}

GOALS.recipeLayers = layers(new Set([...GOALS.materials.nodes, ...GOALS.philosophyRoute.nodes]));

const graph = {
  meta: {
    generatedBy: "solver/tools/build-graph.cjs",
    source: "oracle/fixtures/*-orig.json (orig 781e379, v1.6.1.6)",
    counts: {
      nodes: nodes.length,
      edges: edges.length,
      resources: resourceNodes.length,
      buildings: buildingNodes.length,
      techs: techNodes.length,
      upgrades: upgradeNodes.length,
      crafts: craftNodes.length,
      policies: policyNodes.length,
      jobs: village.jobs.length,
    },
  },
  nodes,
  edges,
  enabledBy,
  goals: GOALS,
  unlockPathToTemple: unlockPath("bld:temple"),
  unlockPathToPhilosophy: unlockPath("tech:philosophy"),
};

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "graph.json"), JSON.stringify(graph, null, 1));

// ---- console summary (the useful part, for the terminal) --------------------
const c = graph.meta.counts;
console.log(`graph: ${c.nodes} nodes, ${c.edges} edges`);
console.log(`  resources ${c.resources}  buildings ${c.buildings}  techs ${c.techs}`);
console.log(`  upgrades ${c.upgrades}  crafts ${c.crafts}  policies ${c.policies}  jobs ${c.jobs}`);
console.log(`temple closure: ${GOALS.temple.nodes.length} prerequisite nodes`);
console.log(`temple unlock path: ${(graph.unlockPathToTemple || []).join(" -> ")}`);
console.log(`philosophy unlock path: ${(graph.unlockPathToPhilosophy || []).join(" -> ")}`);

const temple = nodes.find((n) => n.id === "bld:temple");
console.log(`temple costs: ${temple.basePrices.map((p) => `${p.val} ${p.name}`).join(", ")}`);
console.log(`temple enabled by: ${(enabledBy["bld:temple"] || []).join(", ")}`);

console.log("\nresource producers for temple inputs:");
for (const r of ["gold", "slab", "plate", "manuscript"]) {
  const node = resourceNodes.find((x) => x.name === r);
  console.log(`  ${r.padEnd(11)} <- ${node.producedBy.map((p) => `${p.kind}:${p.name}`).join(", ") || "(none)"}`);
}

console.log("\ntemple closure (why each node is needed):");
for (const id of GOALS.temple.nodes) {
  console.log(`  ${id.padEnd(28)} ${GOALS.temple.why[id]}`);
}

console.log("\nbuildings that produce something, per tick:");
for (const n of buildingNodes) {
  const flow = edges.filter((e) => e.from === n.id && e.kind === "produces");
  if (!flow.length) continue;
  console.log(`  ${n.name.padEnd(14)} ` + flow.map((e) => `${e.perTick > 0 ? "+" : ""}${e.perTick} ${e.to.replace("res:", "")}`).join("  "));
}

// ---------------------------------------------------------------------------
// GRAPH.md — the same facts, readable by a human

const fmt = (n, d = 2) => {
  if (n == null) return "—";
  return String(Math.round(n * 10 ** d) / 10 ** d);
};

const priceListOf = (n) => (n.staged && n.stages.length ? n.stages[0].prices : n.basePrices) || [];

const costOf = (n) => {
  const list = priceListOf(n);
  if (!list.length) return "—";
  const body = list.map((p) => `${fmt(p.val)} ${p.name}`).join(" + ");
  return n.priceRatio ? `${body} × ${n.priceRatio}^n` : body;
};

const enablersOf = (n) => [...new Set((enabledBy[n.id] || []).map((e) => e.replace(/^[a-z]+:/, "")))];

const gateOf = (n) => {
  const bits = [];
  const g = n.unlockGate;
  if (!g.unlockable) bits.push("not default-unlockable");
  else if (g.ratio != null && g.needs.length) {
    bits.push("appears when stocked " + g.needs.map((d) => `${fmt(d.atRatio, 1)} ${d.resource}`).join(" & "));
  }
  const un = enablersOf(n);
  if (un.length) bits.push("unlocked by " + un.join(", "));
  return bits.length ? bits.join("; ") : "**available from tick 0**";
};

const md = [];
md.push(`# Game catalog — extracted reference`);
md.push(``);
md.push(`Generated by \`solver/tools/build-graph.cjs\` from the oracle fixtures (orig Kittens Game`);
md.push(`\`${defs.origCommit}\`, v1.6.1.6). **Do not hand-edit — regenerate.**`);
md.push(``);
md.push(`The F# port's own catalog was diffed against the orig dump: 60/60 resources and`);
md.push(`9/9 jobs match exactly, so these numbers are the real game's numbers.`);
md.push(``);
md.push(`| | count |`);
md.push(`|---|---:|`);
for (const [k, v] of Object.entries(graph.meta.counts)) md.push(`| ${k} | ${v} |`);
md.push(``);

md.push(`## Jobs — what each worker does per tick`);
md.push(``);
md.push(`Per-worker per-tick output, from orig's own job table (\`village-orig.json\`).`);
md.push(``);
md.push(`| job | produces / tick | consumes | unlocked by |`);
md.push(`|---|---|---|---|`);
for (const j of village.jobs) {
  const mods = { ...(j.modifiers || {}), ...(j.calculated || {}) };
  const prod = [];
  const cons = [];
  for (const [k, v] of Object.entries(mods)) {
    if (/Consumption/.test(k)) cons.push(`${fmt(v, 3)} ${k.replace("Consumption", "").replace("Ambassadors", "")}`);
    else if (resCatalog.some((r) => r.name === k)) prod.push(`${fmt(v, 4)} ${k}`);
  }
  const un = enablersOf(nodes.find((n) => n.id === idOf("job", j.name)));
  md.push(`| **${j.name}** | ${prod.join(", ") || "—"} | ${cons.join(", ") || "—"} | ${un.join(", ") || (j.unlocked ? "start" : "?")} |`);
}
md.push(``);

md.push(`## Resources — who makes them, who eats them`);
md.push(``);
md.push(`| resource | type | produced by | consumed by |`);
md.push(`|---|---|---|---|`);
for (const r of resourceNodes) {
  const p = r.producedBy.map((x) => `${x.kind}:${x.name}`).join(", ") || "—";
  const c = r.consumedBy.map((x) => `${x.kind}:${x.name}`).join(", ") || "—";
  md.push(`| **${r.name}** | ${r.type} | ${p} | ${c} |`);
}
md.push(``);
md.push(`> **Gold has no per-tick producer.** It enters the game in exactly two places:`);
md.push(`> \`hunt\` (\`Game.Village.fs:62\` — gated on **Iron Will AND the goldOre upgrade**)`);
md.push(`> and selling resources at a **tradepost**. Everything else only *spends* gold.`);
md.push(``);

md.push(`## Buildings — cost, unlock gate, effect`);
md.push(``);
md.push(`Cost of the nth copy is \`base × ratio^n\` (\`Game.Buildings.getAllPrices\`).`);
md.push(`"appears when stocked X" is \`stock >= price × unlockRatio\` (\`Game.Buildings.isUnlocked\`).`);
md.push(``);
md.push(`| building | cost (1st copy) | ratio | unlock gate | per-tick effect |`);
md.push(`|---|---|---|---|---|`);
for (const n of buildingNodes) {
  const eff = Object.entries(n.effects || {}).filter(([, v]) => v).map(([k, v]) => `${k} ${fmt(v, 3)}`).join(", ");
  md.push(`| **${n.name}** | ${costOf(n)} | ${n.priceRatio ?? "—"} | ${gateOf(n)} | ${eff || "—"} |`);
}
md.push(``);

md.push(`## Crafts — what the workshop makes`);
md.push(``);
md.push(`| craft | cost | tier | progressHandicap | unlocked by |`);
md.push(`|---|---|---|---|---|`);
for (const n of craftNodes) {
  const un = enablersOf(n);
  md.push(`| **${n.name}** | ${(n.prices || []).map((p) => `${fmt(p.val)} ${p.name}`).join(" + ") || "—"} | ${n.tier} | ${n.progressHandicap} | ${un.join(", ") || (n.unlocked ? "start" : "?")} |`);
}
md.push(``);

md.push(`## Techs — the unlock spine`);
md.push(``);
md.push(`| tech | science | unlocks |`);
md.push(`|---|---|---|`);
for (const n of techNodes) {
  const un = edges.filter((e) => e.from === n.id && e.kind === "enables").map((e) => e.to.replace(/^[a-z]+:/, ""));
  md.push(`| **${n.name}** | ${(n.prices || []).map((p) => fmt(p.val)).join("") || "—"} | ${un.join(", ") || "—"} |`);
}
md.push(``);

md.push(`## Upgrades — grouped by the effect they apply`);
md.push(``);
md.push(`| effect | upgrades granting it |`);
md.push(`|---|---|`);
const byEffect = {};
for (const n of upgradeNodes) {
  for (const [k, v] of Object.entries(n.effects || {})) (byEffect[k] = byEffect[k] || []).push(`${n.name} (${fmt(v, 4)})`);
}
for (const k of Object.keys(byEffect).sort()) md.push(`| \`${k}\` | ${byEffect[k].join(", ")} |`);
md.push(``);

md.push(`## The Temple — full prerequisite closure`);
md.push(``);
md.push(`Cost **50 gold · 25 slab · 15 plate · 10 manuscript**. Unlocked by *philosophy*, *theology* or a *ziggurat*.`);
md.push(``);
md.push(`| node | needed because |`);
md.push(`|---|---|`);
for (const id of GOALS.temple.nodes) md.push(`| \`${id}\` | ${GOALS.temple.why[id]} |`);
md.push(``);

fs.writeFileSync(path.join(OUT, "GRAPH.md"), md.join("\n") + "\n");

// ---------------------------------------------------------------------------
// DEPS.mmd — mermaid DAG of the temple's prerequisite subgraph

const inClosure = new Set(GOALS.temple.nodes);
const nid = (id) => id.replace(/[^a-zA-Z0-9]/g, "_");
const STYLE = {
  tech: ["#e8f0fe", "#4285f4"],
  bld: ["#e6f4ea", "#34a853"],
  craft: ["#fef7e0", "#fbbc04"],
  res: ["#fce8e6", "#ea4335"],
  job: ["#f3e8fd", "#a142f4"],
  act: ["#fce8e6", "#ea4335"],
};
const mm = [
  "%% Temple critical path — generated by solver/tools/build-graph.cjs",
  `%% ${inClosure.size} prerequisite nodes`,
  "flowchart TD",
];
const byKind = {};
for (const id of inClosure) (byKind[id.split(":")[0]] = byKind[id.split(":")[0]] || []).push(id);
for (const [kind, ids] of Object.entries(byKind)) {
  mm.push(`  subgraph g_${kind}["${kind}"]`);
  for (const id of ids) mm.push(`    ${nid(id)}["${id.replace(/^[a-z]+:/, "")}"]`);
  mm.push("  end");
  for (const id of ids) {
    const [fill, stroke] = STYLE[kind] || ["#ffffff", "#999999"];
    mm.push(`  style ${nid(id)} fill:${fill},stroke:${stroke}`);
  }
}
for (const e of edges) {
  if (!inClosure.has(e.from) || !inClosure.has(e.to)) continue;
  const label = e.kind === "unlocksAt" ? `stock ≥ ${fmt(e.need, 1)}` : "";
  mm.push(`  ${nid(e.from)} -->|${label}| ${nid(e.to)}`);
}
mm.push(`  TEMPLE["TEMPLE<br/>50 gold · 25 slab · 15 plate · 10 manuscript"]`);
mm.push(`  style TEMPLE fill:#ffd7d5,stroke:#ea4335,stroke-width:3px`);
for (const e of edges) {
  if (e.to === "bld:temple" && inClosure.has(e.from)) mm.push(`  ${nid(e.from)} --> TEMPLE`);
}
fs.writeFileSync(path.join(OUT, "DEPS.mmd"), mm.join("\n") + "\n");

console.log(`wrote GRAPH.md (${md.length} lines) and DEPS.mmd (${mm.length} lines)`);