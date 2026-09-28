#!/usr/bin/env node
"use strict";
/**
 * diff-json.js — exact deep comparison of two JSON files (bit-exact floats,
 * ORDER-INSENSITIVE object keys so JS and F# emitters can be compared).
 *
 * Usage: node tools/diff-json.js <a.json> <b.json> [rootPath]
 *   rootPath: optional JSON-pointer-like prefix (e.g. "/catalog") restricting
 *   the comparison to that subtree.
 * Exit codes: 0 identical, 1 different, 2 usage/IO error.
 */
const fs = require("fs");

function* walk(node, path) {
  if (node === null || typeof node !== "object") {
    yield [path, node];
    return;
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* walk(node[i], `${path}/${i}`);
    return;
  }
  for (const k of Object.keys(node).sort()) yield* walk(node[k], `${path}/${k}`);
}

function main() {
  const [, , aPath, bPath, rootPath = ""] = process.argv;
  if (!aPath || !bPath) {
    console.error("usage: node tools/diff-json.js <a.json> <b.json> [rootPath]");
    process.exit(2);
  }
  const A = JSON.parse(fs.readFileSync(aPath, "utf8"));
  const B = JSON.parse(fs.readFileSync(bPath, "utf8"));

  // normalize: accept "catalog" or "/catalog" (Git Bash mangles leading-slash args)
  const root = "/" + String(rootPath).replace(/^\/+/, "");
  const pick = (doc) => {
    if (root === "/") return doc;
    let node = doc;
    for (const seg of root.split("/").filter(Boolean)) node = node[seg];
    return node;
  };

  let firstDivergence = null;
  let lastMatches = [];
  const wa = walk(pick(A), "$" + rootPath.replace(/\//g, "."));
  const wb = walk(pick(B), "$" + rootPath.replace(/\//g, "."));
  while (true) {
    const ia = wa.next();
    const ib = wb.next();
    if (ia.done && ib.done) break;
    if (ia.done !== ib.done) {
      firstDivergence = { pointer: "(shape)", a: ia.done ? "(ended)" : ia.value[1], b: ib.done ? "(ended)" : ib.value[1] };
      break;
    }
    const [pa, va] = ia.value;
    const [pb, vb] = ib.value;
    if (pa !== pb) {
      firstDivergence = { pointer: `${pa} vs ${pb}`, a: va, b: vb };
      break;
    }
    const numEq = typeof va === "number" && typeof vb === "number"
      ? va === vb || (Number.isNaN(va) && Number.isNaN(vb))
      : va === vb;
    if (!numEq) {
      firstDivergence = { pointer: pa, a: va, b: vb };
      break;
    }
    lastMatches.push(pa);
    if (lastMatches.length > 5) lastMatches.shift();
  }

  if (firstDivergence) {
    console.log("DIFFERENT:");
    console.log(`  pointer: ${firstDivergence.pointer}`);
    console.log(`  a: ${JSON.stringify(firstDivergence.a)}`);
    console.log(`  b: ${JSON.stringify(firstDivergence.b)}`);
    console.log("  last matching:");
    for (const p of lastMatches) console.log(`    ok ${p}`);
    process.exit(1);
  }
  console.log(`IDENTICAL${root !== "/" ? ` (${root})` : ""}`);
  process.exit(0);
}

main();
