#!/usr/bin/env node
/**
 * gen-inventory.js — regenerate the inventory skeleton in analysis/inventory.md
 * from analysis/files.json.
 *
 * Recon sessions fill in the "Description:" sections and the "Functionality"
 * lists BY HAND (this is the LLM/semantic half of Phase 1). To add a newly
 * scanned file without losing written descriptions, descriptions are keyed by
 * path in analysis/inventory-notes/*.md — no, keep it simple: this generator
 * only (re)creates MISSING sections and never rewrites existing text.
 *
 * Usage: node tools/gen-inventory.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const filesJson = JSON.parse(fs.readFileSync(path.join(REPO, "analysis", "files.json"), "utf8"));
const outFile = path.join(REPO, "analysis", "inventory.md");

const interesting = (f) => ["game", "html", "ui-jsx"].includes(f.role);
const files = filesJson.files.filter(interesting);

let md = `# Orig inventory — semantic descriptions (Phase 1 recon target)

Machine facts (lines, sha256, symbols, nondeterminism) live in \`analysis/files.json\`
(generated). This file is the **semantic half**: what each file/symbol does, written by
recon work units (\`recon-01\`…\`recon-20\` in the ledger).

Orig snapshot: \`${filesJson.origGitCommit}\` — ${filesJson.totals.files} files,
${filesJson.totals.lines} lines total; ${files.length} port-relevant files below.

Status legend per file: (pending) → (described) → (split into work units).
Recon rule: 2–3 files per session; for each file write the Description + Functionality
list, then define its work units in \`ledger/migration.yaml\` + \`analysis/work-units.json\`.

`;

for (const f of files) {
  const nondetByCat = f.nondet.reduce((acc, h) => {
    (acc[h.category] ||= []).push(`L${h.line} ${h.api}`);
    return acc;
  }, {});
  const nondetMd = Object.entries(nondetByCat)
    .map(([c, hits]) => `    - ${c}: ${hits.join(", ")}`)
    .join("\n");

  md += `## \`${f.path}\`  (${f.lines} lines, role: ${f.role}) — (pending)

Description:
> (pending — recon unit writes 3–8 sentences: purpose, main managers/classes, how it
> interacts with the rest of the game, where its state lives)

Functionality:
1. (pending — numbered list; each item becomes/attaches to a work unit)

Nondeterminism:
${nondetMd || "    - (none found)"}

Symbols (top ${(f.symbols.length > 0 ? Math.min(f.symbols.length, 40) : 0)} of ${f.symbols.length}):
${f.symbols
  .slice(0, 40)
  .map((s) => `    - L${s.line} ${s.kind} ${s.name}`)
  .join("\n") || "    - (none detected)"}

`;
}

fs.writeFileSync(outFile, md);
console.log(`wrote ${path.relative(REPO, outFile)} (${files.length} file sections, all pending)`);
