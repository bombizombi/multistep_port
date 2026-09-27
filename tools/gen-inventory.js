#!/usr/bin/env node
/**
 * gen-inventory.js — regenerate analysis/inventory.md as an INDEX of per-file
 * recon reports (analysis/recon/<stem>.md).
 *
 * Since 2026-09-28 (D009), semantic descriptions live in per-file recon reports
 * written by recon units; this generator only produces the status index from
 * analysis/files.json. Safe to rerun at any time — it never touches recon/.
 *
 * Usage: node tools/gen-inventory.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const filesJson = JSON.parse(fs.readFileSync(path.join(REPO, "analysis", "files.json"), "utf8"));
const outFile = path.join(REPO, "analysis", "inventory.md");
const reconDir = path.join(REPO, "analysis", "recon");

const interesting = (f) => ["game", "html", "ui-jsx"].includes(f.role);
const files = filesJson.files.filter(interesting);

const reconDone = new Set(
  fs.existsSync(reconDir) ? fs.readdirSync(reconDir).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")) : []
);

let md = `# Orig inventory — recon index

Machine facts (lines, sha256, symbols, nondeterminism) live in \`analysis/files.json\`.
Semantic descriptions live in **per-file recon reports** under \`analysis/recon/\`
(convention D009). This file is a generated index — rerun \`node tools/gen-inventory.js\`
after adding reports; never hand-edit.

Orig snapshot: \`${filesJson.origGitCommit}\` — ${filesJson.totals.files} files,
${filesJson.totals.lines} lines total; ${files.length} port-relevant files below.

| orig file | lines | role | recon report | status |
|---|---:|---|---|---|
`;

for (const f of files) {
  const stem = path.basename(f.path).replace(/\.(js|html)$/, "").replace(".jsx", "");
  const done = reconDone.has(stem) || reconDone.has(path.basename(f.path, ".js"));
  const link = done ? `\`analysis/recon/${stem}.md\`` : "—";
  const status = done ? "**described**" : "pending";
  md += `| \`${f.path}\` | ${f.lines} | ${f.role} | ${link} | ${status} |\n`;
}

md += `
## Nondeterminism summary (generated from files.json)

| category | call sites (game + ui-jsx roles) |
|---|---:|
`;

const byCat = {};
for (const f of files) {
  for (const h of f.nondet) byCat[h.category] = (byCat[h.category] || 0) + 1;
}
for (const [c, n] of Object.entries(byCat).sort()) md += `| ${c} | ${n} |\n`;
md += `
Full per-line census: \`analysis/nondeterminism.json\`.
`;

fs.writeFileSync(outFile, md);
console.log(`wrote index: ${path.relative(REPO, outFile)} (${reconDone.size} recon reports linked of ${files.length} files)`);
