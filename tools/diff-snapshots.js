#!/usr/bin/env node
"use strict";
/**
 * diff-snapshots.js — exact comparison of two oracle snapshot files (oracle-04).
 *
 * Floats are compared BIT-EXACTLY (JSON roundtrip of doubles is exact; no epsilon).
 * Object keys are compared ORDER-INSENSITIVELY (sorted) so JS and F# emitters with
 * different key orders can be diffed; arrays stay positional.
 *
 * Usage: node tools/diff-snapshots.js <a.json> <b.json> [includePrefix ...]
 *   includePrefix: optional pointer prefixes (e.g. "resources", "actionLog") to
 *   restrict the comparison to subtrees the port already implements (D014).
 *   No prefix = compare everything.
 *
 * Exit codes: 0 identical, 1 different, 2 usage/IO error.
 */
const fs = require("fs");

function* walk(node, path, prefixes) {
  if (prefixes && prefixes.length > 0 && !prefixes.some((p) => path === "$" || path.startsWith(`$/${p}`) || `$/${p}`.startsWith(path + "/") || path === "$")) {
    // skip subtrees not under any include prefix (but keep walking toward them)
    if (!prefixes.some((p) => path.startsWith(`$/${p}`))) return;
  }
  if (node === null || typeof node !== "object") {
    yield [path, node];
    return;
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* walk(node[i], `${path}/${i}`, prefixes);
    return;
  }
  for (const k of Object.keys(node).sort()) yield* walk(node[k], `${path}/${k}`, prefixes);
}

function main() {
  const argv = process.argv.slice(2);
  const [aPath, bPath, ...prefixes] = argv;
  if (!aPath || !bPath) {
    console.error("usage: node tools/diff-snapshots.js <a.json> <b.json> [includePrefix ...]");
    process.exit(2);
  }
  const A = JSON.parse(fs.readFileSync(aPath, "utf8"));
  const B = JSON.parse(fs.readFileSync(bPath, "utf8"));

  // header: scenario + seed must match; driver/rngImpl/origCommit are metadata
  for (const k of ["scenario", "seed"]) {
    if (JSON.stringify(A[k]) !== JSON.stringify(B[k])) {
      console.log(`DIFFERENT (header): ${k}: ${JSON.stringify(A[k])} vs ${JSON.stringify(B[k])}`);
      process.exit(1);
    }
  }

  const ticksA = A.snapshots.map((s) => s.tick).sort((x, y) => x - y);
  const ticksB = B.snapshots.map((s) => s.tick).sort((x, y) => x - y);
  if (JSON.stringify(ticksA) !== JSON.stringify(ticksB)) {
    console.log(`DIFFERENT (checkpoint sets): A=[${ticksA}] B=[${ticksB}]`);
    process.exit(1);
  }

  let diverged = null;
  let lastMatches = [];
  const wa = walk(A, "$", prefixes.length ? prefixes : null);
  const wb = walk(B, "$", prefixes.length ? prefixes : null);
  while (true) {
    const ia = wa.next();
    const ib = wb.next();
    if (ia.done && ib.done) break;
    if (ia.done !== ib.done) {
      diverged = { pointer: "(shape)", a: ia.done ? "(ended)" : ia.value[1], b: ib.done ? "(ended)" : ib.value[1], why: "one side ended early" };
      break;
    }
    const [pa, va] = ia.value;
    const [pb, vb] = ib.value;
    if (pa !== pb) {
      diverged = { pointer: `${pa} vs ${pb}`, a: va, b: vb, why: "path mismatch" };
      break;
    }
    const numEq = typeof va === "number" && typeof vb === "number"
      ? va === vb || (Number.isNaN(va) && Number.isNaN(vb))
      : va === vb;
    if (!numEq) {
      diverged = { pointer: pa, a: va, b: vb, why: "value mismatch" };
      break;
    }
    lastMatches.push(pa);
    if (lastMatches.length > 5) lastMatches.shift();
  }

  if (diverged) {
    console.log("DIFFERENT:");
    console.log(`  first divergence (${diverged.why})`);
    console.log(`  pointer: ${diverged.pointer}`);
    console.log(`  a: ${JSON.stringify(diverged.a)}`);
    console.log(`  b: ${JSON.stringify(diverged.b)}`);
    console.log("  last matching pointers:");
    for (const p of lastMatches) console.log(`    ok ${p}`);
    process.exit(1);
  }
  console.log(`IDENTICAL: ${ticksA.length} checkpoints, scenario "${A.scenario}", seed ${A.seed}${prefixes.length ? ` (prefixes: ${prefixes.join(", ")})` : ""}`);
  process.exit(0);
}

main();
