#!/usr/bin/env node
/**
 * scan.js — mechanical reconnaissance over the original kittens game.
 *
 * Produces (deterministic, rerunnable at any time):
 *   analysis/files.json           — per-file facts: lines, bytes, sha256, role, symbols
 *   analysis/nondeterminism.json  — every nondeterminism call site, categorized
 *
 * Usage (from multistep_port/):   node tools/scan.js
 * The orig path can be overridden: node tools/scan.js ../orig_project/kittensgame
 *
 * This is the "machine facts" half of Phase 1. Semantic descriptions of what
 * each file/symbol DOES are filled in later (LLM work units) into
 * analysis/inventory.md — never hand-edit files.json; rerun the scanner.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const REPO = path.resolve(__dirname, "..");
const DEFAULT_ORIG = path.resolve(REPO, "..", "orig_project", "kittensgame");
const ORIG = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_ORIG;
const OUT = path.join(REPO, "analysis");

// Files are tagged by role so reports can filter without losing information.
function roleOf(rel) {
  if (rel.startsWith("test/")) return "test";
  if (rel.startsWith("lib/")) return "lib";
  if (rel.startsWith("tools/")) return "tool";
  if (rel.startsWith("js/jsx/")) return "ui-jsx";
  if (rel.endsWith(".jsx.js")) return "ui-jsx";
  if (rel === "index.html" || rel === "emulator.html" || rel === "tests.html") return "html";
  if (rel === "config.js" || rel === "i18n.js" || rel.startsWith("js/")) return "game";
  if (rel === "core.js" || rel === "game.js" || rel === "simulate-combat.js") return "game";
  return "other";
}

// Heuristic top-level symbol extraction. Not an AST — orientation only.
const SYMBOL_PATTERNS = [
  { kind: "declare", re: /dojo\.declare\(\s*"([^"]+)"/g },
  { kind: "function", re: /^\s*function\s+([A-Za-z_$][\w$]*)\s*\(/gm },
  { kind: "method", re: /^\s{4}([A-Za-z_$][\w$]*)\s*:\s*function\s*\(/gm },
  { kind: "const", re: /^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function|\()/gm },
  { kind: "class", re: /^\s*class\s+([A-Za-z_$][\w$]*)/gm },
];

// Nondeterminism catalogue: category -> API patterns.
const NONDET_PATTERNS = [
  { category: "RANDOM", apis: ["Math.random", "crypto.getRandomValues", "crypto.randomBytes"] },
  { category: "TIME", apis: ["Date.now", "new Date", "performance.now", "getTime("] },
  { category: "STORAGE", apis: ["localStorage", "sessionStorage", "LCstorage"] },
  { category: "TIMERS", apis: ["setInterval", "setTimeout", "requestAnimationFrame", "clearInterval", "clearTimeout"] },
  { category: "NETWORK", apis: ["fetch(", "XMLHttpRequest", "WebSocket", "EventSource"] },
  { category: "ENV", apis: ["navigator.", "location.", "process.env", "window.innerWidth", "window.innerHeight", "userAgent"] },
  { category: "CONCURRENCY", apis: ["new Worker", "Promise.race", "postMessage"] },
];

function walk(dir, base, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".vs") continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full).split(path.sep).join("/");
    if (entry.isDirectory()) walk(full, base, acc);
    else if (/\.(js|html)$/.test(entry.name)) acc.push(rel);
  }
  return acc;
}

function scanFile(root, rel) {
  const full = path.join(root, rel);
  const text = fs.readFileSync(full, "utf8");
  const lines = text.split("\n").length;
  const linesArr = text.split("\n");
  const sha256 = crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);

  const symbols = [];
  for (const { kind, re } of SYMBOL_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      const line = text.slice(0, m.index).split("\n").length;
      // Skip inside game source only? No — record everything; reports filter.
      symbols.push({ kind, name: m[1], line });
    }
  }
  symbols.sort((a, b) => a.line - b.line);

  const nondet = [];
  for (const { category, apis } of NONDET_PATTERNS) {
    for (const api of apis) {
      for (let i = 0; i < linesArr.length; i++) {
        if (linesArr[i].includes(api)) {
          nondet.push({ category, api, line: i + 1, snippet: linesArr[i].trim().slice(0, 120) });
        }
      }
    }
  }

  return {
    path: rel,
    role: roleOf(rel),
    lines,
    bytes: fs.statSync(full).size,
    sha256,
    symbols,
    nondet,
  };
}

function main() {
  if (!fs.existsSync(path.join(ORIG, "game.js"))) {
    console.error(`orig not found at ${ORIG} (expected game.js there)`);
    process.exit(1);
  }
  const rels = walk(ORIG, ORIG, []).sort();
  const files = rels.map((rel) => scanFile(ORIG, rel));

  const nondetIndex = {};
  for (const f of files) {
    if (f.nondet.length === 0) continue;
    nondetIndex[f.path] = f.nondet.reduce((acc, h) => {
      (acc[h.category] ||= []).push({ api: h.api, line: h.line });
      return acc;
    }, {});
  }

  fs.mkdirSync(OUT, { recursive: true });
  const meta = {
    generatedBy: "tools/scan.js",
    origPath: path.relative(REPO, ORIG).split(path.sep).join("/"),
    origGitCommit: gitCommit(ORIG),
    scannedAt: "deterministic — no timestamp stored; see origGitCommit for identity",
    totals: totals(files),
    files,
  };
  fs.writeFileSync(path.join(OUT, "files.json"), JSON.stringify(meta, null, 2));
  fs.writeFileSync(
    path.join(OUT, "nondeterminism.json"),
    JSON.stringify({ generatedBy: "tools/scan.js", origGitCommit: meta.origGitCommit, byFile: nondetIndex }, null, 2)
  );

  // Human-readable summary to stdout.
  console.log(`orig: ${meta.origPath} @ ${meta.origGitCommit}`);
  for (const [role, n] of Object.entries(meta.totals.byRole)) console.log(`  ${role.padEnd(8)} ${String(n.files).padStart(3)} files  ${String(n.lines).padStart(6)} lines`);
  console.log(`  total    ${String(meta.totals.files).padStart(3)} files  ${String(meta.totals.lines).padStart(6)} lines`);
  console.log("\nnondeterminism by category (game-role files only):");
  const byCat = {};
  for (const f of files) {
    if (f.role !== "game" && f.role !== "ui-jsx") continue;
    for (const h of f.nondet) byCat[h.category] = (byCat[h.category] || 0) + 1;
  }
  for (const [c, n] of Object.entries(byCat).sort()) console.log(`  ${c.padEnd(12)} ${n}`);
  console.log(`\nwrote ${path.relative(REPO, path.join(OUT, "files.json"))} and nondeterminism.json`);
}

function gitCommit(root) {
  try {
    return require("child_process").execSync("git rev-parse HEAD", { cwd: root }).toString().trim();
  } catch {
    return "unknown";
  }
}

function totals(files) {
  const byRole = {};
  let lines = 0;
  for (const f of files) {
    byRole[f.role] ||= { files: 0, lines: 0 };
    byRole[f.role].files++;
    byRole[f.role].lines += f.lines;
    lines += f.lines;
  }
  return { files: files.length, lines, byRole };
}

main();
