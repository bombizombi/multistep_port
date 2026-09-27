#!/usr/bin/env node
"use strict";
/**
 * diff-snapshots.js — exact comparison of two oracle snapshot files (oracle-04).
 *
 * Floats are compared BIT-EXACTLY (JSON roundtrip of doubles is exact; no epsilon).
 * Reports the FIRST divergence with tick + JSON pointer + both values, plus the
 * last few matching pointers to localize the drift point.
 *
 * Usage: node tools/diff-snapshots.js <a.json> <b.json>
 * Exit codes: 0 identical, 1 different, 2 usage/IO error.
 */
const fs = require("fs");

function isNum(v) { return typeof v === "number"; }

// deterministic key order walk so pointer paths are stable
function* walk(node, path) {
  if (node === null || typeof node !== "object") { yield [path, node]; return; }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* walk(node[i], `${path}/${i}`);
    return;
  }
  for (const k of Object.keys(node)) yield* walk(node[k], `${path}/${k}`);
}

function indexSnapshots(file) {
  const doc = JSON.parse(fs.readFileSync(file, "utf8"));
  const byTick = new Map();
  for (const snap of doc.snapshots) byTick.set(snap.tick, snap);
  return { doc, byTick };
}

function main() {
  const [, , aPath, bPath] = process.argv;
  if (!aPath || !bPath) {
    console.error("usage: node tools/diff-snapshots.js <a.json> <b.json>");
    process.exit(2);
  }
  const A = indexSnapshots(aPath);
  const B = indexSnapshots(bPath);

  // header sanity
  const metaDiff = [];
  for (const k of ["scenario", "seed", "driver", "rngImpl"]) {
    if (JSON.stringify(A.doc[k]) !== JSON.stringify(B.doc[k])) metaDiff.push(`${k}: ${A.doc[k]} vs ${B.doc[k]}`);
  }
  if (metaDiff.length) {
    console.log("DIFFERENT (header):");
    for (const m of metaDiff) console.log(`  ${m}`);
    process.exit(1);
  }

  const ticksA = [...A.byTick.keys()].sort((x, y) => x - y);
  const ticksB = [...B.byTick.keys()].sort((x, y) => x - y);
  if (JSON.stringify(ticksA) !== JSON.stringify(ticksB)) {
    console.log(`DIFFERENT (checkpoint sets): A=[${ticksA}] B=[${ticksB}]`);
    process.exit(1);
  }

  let lastMatches = [];
  let diverged = null;
  for (const tick of ticksA) {
    const a = A.byTick.get(tick);
    const b = B.byTick.get(tick);
    const wa = walk(a, `$tick${tick}`);
    const wb = walk(b, `$tick${tick}`);
    let ia, ib;
    while (true) {
      ia = wa.next(); ib = wb.next();
      if (ia.done || ib.done) break;
      const [pa, va] = ia.value;
      const [pb, vb] = ib.value;
      if (pa !== pb) { diverged = { tick, pointer: `${pa} vs ${pb}`, a: va, b: vb, why: "path mismatch" }; break; }
      if (isNum(va) && isNum(vb)) {
        if (va !== vb && !(Number.isNaN(va) && Number.isNaN(vb))) { diverged = { tick, pointer: pa, a: va, b: vb, why: "number mismatch" }; break; }
      } else if (va !== vb) { diverged = { tick, pointer: pa, a: va, b: vb, why: "value mismatch" }; break; }
      lastMatches.push(pa);
      if (lastMatches.length > 5) lastMatches.shift();
    }
    if (!ia.done && !ib.done) break; // diverged inside walk
    if (!ia.done !== !ib.done) { diverged = { tick, pointer: "EOF", a: "(one side ended)", b: "(other side ended)", why: "shape mismatch" }; break; }
  }

  if (diverged) {
    console.log("DIFFERENT:");
    console.log(`  first divergence at tick ${diverged.tick} (${diverged.why})`);
    console.log(`  pointer: ${diverged.pointer}`);
    console.log(`  a: ${JSON.stringify(diverged.a)}`);
    console.log(`  b: ${JSON.stringify(diverged.b)}`);
    console.log("  last matching pointers (for localization):");
    for (const p of lastMatches) console.log(`    ok ${p}`);
    process.exit(1);
  }
  console.log(`IDENTICAL: ${ticksA.length} checkpoints, scenario "${A.doc.scenario}", seed ${A.doc.seed}`);
  process.exit(0);
}

main();
