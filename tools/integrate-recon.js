#!/usr/bin/env node
"use strict";
/**
 * integrate-recon.js — append a recon report's proposed work units to the ledger
 * and mark its recon unit verified.
 *
 * Usage: node tools/integrate-recon.js <report.md> <orig-source> <recon-unit-id> "<note>"
 *   e.g. node tools/integrate-recon.js analysis/recon/religion.js js/religion.js recon-08 "N units"
 *
 * Idempotence: refuses to run twice for the same recon unit (checks the ledger).
 * The report must follow the recon template (## Proposed work units table).
 */
const fs = require("fs");
const path = require("path");

const [, , reportPath, srcFile, reconUnit, note] = process.argv;
if (!reportPath || !srcFile || !reconUnit || !note) {
  console.error("usage: node tools/integrate-recon.js <report.md> <orig-source> <recon-unit-id> <note>");
  process.exit(2);
}
const REPO = path.resolve(__dirname, "..");
const ledgerPath = path.join(REPO, "ledger", "migration.yaml");
const report = fs.readFileSync(path.join(REPO, reportPath), "utf8");
let ledger = fs.readFileSync(ledgerPath, "utf8");

if (ledger.includes(`${reconUnit}, layer: core, source: ${srcFile}, status: verified`)) {
  console.log(`${reconUnit} already verified — nothing to do`);
  process.exit(0);
}

const table = report.split(/## Proposed work units/)[1].split(/## Dependencies/)[0];
const rows = table.split("\n").filter((l) => l.trim().startsWith("|") && !l.includes("---") && !l.includes(" id "));
if (rows.length === 0) {
  console.error(`no unit rows found in ${reportPath} — is it a recon template report?`);
  process.exit(1);
}

const q = (s) => JSON.stringify(s);
let out = `\n  # --- from ${path.basename(reportPath)} ---\n`;
for (const row of rows) {
  const cells = row.split("|").map((c) => c.trim()).filter((c) => c !== "");
  if (cells.length < 5) continue;
  const depsRaw = (cells[5] || "—").trim();
  out += `  - { id: ${q(cells[0])}, title: ${q(cells[1])}, layer: ${q(cells[4] || "core")}, source: ${q(srcFile)}, symbols: ${q(cells[2])}, lines: ${q(cells[3])}, depends_on: ${depsRaw === "—" ? "[]" : depsRaw}, status: not-started, recon: ${q(reportPath.split(path.sep).join("/"))} }\n`;
}
fs.appendFileSync(ledgerPath, out);

// mark the recon unit verified (it is a one-line { ... } entry in the ledger)
const re = new RegExp(`\\{ id: ${reconUnit}, layer: ([a-z]+), source: ([^,]+), status: not-started, note: "([^"]*)" \\}`);
if (re.test(ledger)) {
  ledger = fs.readFileSync(ledgerPath, "utf8");
  ledger = ledger.replace(re, `{ id: ${reconUnit}, layer: $1, source: $2, status: verified, session: "2026-09-28-03", recon: ${q(reportPath.split(path.sep).join("/"))}, note: ${q(note)} }`);
  fs.writeFileSync(ledgerPath, ledger);
} else {
  console.warn(`warning: one-line entry for ${reconUnit} not found — mark it verified manually`);
}
console.log(`integrated ${reportPath}: ${rows.length} units appended, ${reconUnit} verified`);
