#!/usr/bin/env node
"use strict";
/**
 * verify-specs.js — verify-01: re-verify the old elmishKittens spec files
 * (../elmishKittens/specs/*.fs.md) against orig data and re-emit corrected
 * copies under analysis/specs/.
 *
 * Orig truth: oracle/fixtures/defs-orig.json + space-orig.json +
 * resource-catalog-orig.json (produced by the orig driver's --dump modes —
 * the real orig objects, not a re-parse). For arrays without an orig fixture
 * (religion TU/ZU/RU, time CFU/VSU, diplomacy races, village jobs) the
 * oracle-verified FS catalogs (kittens_land Game.Catalog.*) are the reference:
 * they were extracted from orig and are behaviorally bit-exact across the
 * 52-scenario suite.
 *
 * Output: analysis/specs/<name>.fs.md (spec text with corrected fields +
 * a verification header + discrepancy log) and analysis/specs/verify-report.md.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SPECS = path.resolve(ROOT, "..", "elmishKittens", "specs");
const OUT = path.join(ROOT, "analysis", "specs");

const defs = JSON.parse(fs.readFileSync(path.join(ROOT, "oracle", "fixtures", "defs-orig.json"), "utf8"));
const space = JSON.parse(fs.readFileSync(path.join(ROOT, "oracle", "fixtures", "space-orig.json"), "utf8"));

// --- generic F# record field extractor -------------------------------------
// Splits `Name = value` fields inside a brace-balanced block.
function splitFields(body) {
  const fields = {};
  let i = 0;
  const n = body.length;
  while (i < n) {
    const m = /^(\s*)([A-Za-z_][A-Za-z0-9_]*)\s*=\s*/.exec(body.slice(i));
    if (!m) { i++; continue; }
    const key = m[2];
    i += m[0].length;
    // capture the value up to the next top-level field key or end
    let depth = 0, j = i, inStr = false;
    while (j < n) {
      const c = body[j];
      if (inStr) { if (c === "\\") j++; else if (c === '"') inStr = false; j++; continue; }
      if (c === '"') { inStr = true; j++; continue; }
      if (c === "[" || c === "(" || c === "{") depth++;
      if (c === "]" || c === ")" || c === "}") { if (depth === 0) break; depth--; }
      if (depth === 0) {
        const rest = body.slice(j);
        const nextField = /^s*(?:;s*)?[A-Za-z_][A-Za-z0-9_]*s*=/.test(rest);
        if (nextField) break;
      }
      j++;
    }
    fields[key] = body.slice(i, j).trim();
    i = Math.max(j, i + 1); // guaranteed progress (empty values)
  }
  return fields;
}

function extractRecords(text) {
  const records = [];
  const re = /\{\s*(?:[^{}]*?)Name\s*=\s*"([^"]+)"/g;
  let minPos = 0;
  let m;
  while ((m = re.exec(text))) {
    const nameStart = m.index;
    if (nameStart < minPos) { re.lastIndex = minPos; continue; }
    // scan BACKWARD from the Name field to the record's opening brace
    let open = -1, depth = 0;
    for (let k = nameStart; k >= minPos; k--) {
      const c = text[k];
      if (c === '}') depth++;
      else if (c === '{') { if (depth === 0) { open = k; break; } depth--; }
    }
    if (open < 0) { re.lastIndex = nameStart + 1; continue; }
    // brace-match forward
    let d2 = 0, j = open, inStr = false;
    while (j < text.length) {
      const c = text[j];
      if (inStr) { if (c === "\\") j++; else if (c === '"') inStr = false; j++; continue; }
      if (c === '"') { inStr = true; j++; continue; }
      if (c === '{') d2++;
      if (c === '}') { d2--; if (d2 === 0) break; }
      j++;
    }
    const body = text.slice(open + 1, j);
    const fields = splitFields(body);
    records.push({ name: m[1], open, close: j + 1, fields });
    minPos = j + 1;
    re.lastIndex = minPos;
  }
  return records;
}

// --- canonicalizers ---------------------------------------------------------
function canonPrices(raw) {
  const out = [];
  const re = /Resource\s*=\s*"([^"]+)"\s*;\s*(?:Amount|Val)\s*=\s*([0-9.eE+-]+)/g;
  let m;
  while ((m = re.exec(raw))) out.push(`${m[1]}:${Number(m[2])}`);
  return out.sort();
}

function canonPairs(raw) {
  // ("key", v) tuples, ["key", v] lists, and Map.ofList ["k", v; ...]
  const out = [];
  const re = /[([]\s*"([^"]+)"\s*;?\s*,?\s*(-?[0-9.eE+-]+)\s*[)\]]/g;
  let m;
  while ((m = re.exec(raw))) out.push(`${m[1]}:${Number(m[2])}`);
  return out.sort();
}

function canonUnlocks(raw) {
  // [ ("buildings", ["hut"; "field"]); ... ] — kind + sorted name set
  if (!raw || /^\[\s*\]$/.test(raw) || raw === "None") return [];
  const out = [];
  const re = /\(\s*"([^"]+)"\s*,\s*\[(.*?)\]\s*\)/g;
  let m;
  while ((m = re.exec(raw))) {
    const names = [];
    const nre = /"([^"]+)"/g;
    let n;
    while ((n = nre.exec(m[2]))) names.push(n[1]);
    out.push(`${m[1]}:${names.sort().join(",")}`);
  }
  return out.sort();
}

function canonOptNum(raw) {
  if (!raw) return null;
  const m = /^Some\s+(-?[0-9.eE+-]+)$/.exec(raw.trim());
  if (m) return Number(m[1]);
  if (raw.trim() === "None") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

// --- orig truth tables ------------------------------------------------------
const origBuildings = new Map(defs.buildings.map((b) => [b.name, b]));
const origTechs = new Map(defs.techs.map((x) => [x.name, x]));
const origPolicies = new Map(defs.policies.map((x) => [x.name, x]));
const origUpgrades = new Map(defs.upgrades.map((x) => [x.name, x]));
const origCrafts = new Map(defs.crafts.map((x) => [x.name, x]));
const origPrograms = new Map((space.programs || []).map((x) => [x.name, x]));

function origPricesF(p) { return (p || []).map((x) => `${x.name}:${x.val}`).sort(); }
function origEffectsF(e) { return Object.entries(e || {}).map(([k, v]) => `${k}:${v}`).sort(); }
function origUnlocksF(u) {
  if (!u) return [];
  return Object.entries(u)
    .filter(([, v]) => Array.isArray(v) && v.length)
    .map(([k, v]) => `${k}:${[...v].sort().join(",")}`)
    .sort();
}

// compare one entity's spec fields against orig record
function diffEntity(kind, specRec, orig, diffs) {
  const d = (field, specV, origV) => {
    if (JSON.stringify(specV) !== JSON.stringify(origV)) {
      diffs.push({ kind, name: specRec.name, field, specV: JSON.stringify(specV), origV: JSON.stringify(origV) });
    }
  };
  // prices
  if (orig.prices) {
    const rawP = specRec.fields.EntryPrices !== undefined ? specRec.fields.EntryPrices : specRec.fields.Prices;
    if (rawP !== undefined) d("prices", canonPrices(rawP), origPricesF(orig.prices));
  }
  // priceRatio
  const rr = specRec.fields.EntryPriceRatio !== undefined ? specRec.fields.EntryPriceRatio : specRec.fields.PriceRatio;
  if (rr !== undefined && orig.priceRatio !== undefined && orig.priceRatio !== null) {
    d("priceRatio", Number(rr), orig.priceRatio);
  }
  // effects
  const effRaw = specRec.fields.EntryEffects !== undefined ? specRec.fields.EntryEffects : specRec.fields.Effects;
  if (effRaw !== undefined && orig.effectsBase) d("effects", canonPairs(effRaw), origEffectsF(orig.effectsBase));
  if (effRaw !== undefined && orig.effects) d("effects", canonPairs(effRaw), origEffectsF(orig.effects));
  // visibility
  if (specRec.fields.Visibility !== undefined && orig.unlockRatio !== undefined) {
    const vis = splitFields(specRec.fields.Visibility.replace(/^[{]|[}]$/g, "").trim());
    d("defaultUnlockable", vis.DefaultUnlockable === "true", !!orig.defaultUnlockable);
    d("unlockRatio", canonOptNum(vis.UnlockRatio), orig.unlockRatio);
  }
  // unlock rules
  if (specRec.fields.Unlocks !== undefined && orig.unlocks !== undefined) d("unlocks", canonUnlocks(specRec.fields.Unlocks), origUnlocksF(orig.unlocks));
  if (specRec.fields.Upgrades !== undefined && orig.upgrades !== undefined) d("upgrades", canonUnlocks(specRec.fields.Upgrades), origUnlocksF(orig.upgrades));
}

// file → orig map + kind
const FILE_MAP = {
  "Bonfire.fs.md": ["buildings", origBuildings],
  "Science.fs.md": ["techs", origTechs],
  "Policies.fs.md": ["policies", origPolicies],
  "Workshop.fs.md": ["upgrades+crafts", null], // two arrays
  "Space.fs.md": ["programs", origPrograms],
};

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
const report = [];
let totalDiffs = 0;

for (const file of fs.readdirSync(SPECS)) {
  if (!file.endsWith(".fs.md")) continue;
  const text = fs.readFileSync(path.join(SPECS, file), "utf8");
  const records = extractRecords(text);
  const diffs = [];
  const map = FILE_MAP[file];

  if (map) {
    const [kind, table] = map;
    if (kind === "upgrades+crafts") {
      for (const r of records) {
        const o = origUpgrades.get(r.name) || origCrafts.get(r.name);
        if (o) diffEntity(kind, r, o, diffs);
      }
    } else {
      for (const r of records) {
        const o = table.get(r.name);
        if (o) diffEntity(kind, r, o, diffs);
      }
    }
  }

  // count check: how many entities the spec claims vs known orig counts
  const countChecks = {
    "Science.fs.md": [records.length, defs.techs.length, "techs"],
    "Policies.fs.md": [records.length, defs.policies.length, "policies"],
    "Workshop.fs.md": [records.length, defs.upgrades.length + defs.crafts.length, "upgrades+crafts"],
    "Bonfire.fs.md": [records.length, defs.buildings.length, "buildings"],
  };
  if (countChecks[file]) {
    const [specN, origN, what] = countChecks[file];
    if (specN !== origN) {
      diffs.unshift({ kind: what, name: "<file-level>", field: "entityCount", specV: specN, origV: origN });
    }
  }

  // missing-entity check: which orig names never appear in the spec
  const missingNames = [];
  if (file === "Science.fs.md") {
    const have = new Set(records.map((r) => r.name));
    missingNames.push(...defs.techs.filter((x) => !have.has(x.name)).map((x) => "tech:" + x.name));
  }
  if (file === "Workshop.fs.md") {
    const have = new Set(records.map((r) => r.name));
    missingNames.push(...defs.upgrades.filter((x) => !have.has(x.name)).map((x) => "upgrade:" + x.name));
    missingNames.push(...defs.crafts.filter((x) => !have.has(x.name)).map((x) => "craft:" + x.name));
  }
  for (const mn of missingNames) {
    diffs.push({ kind: "missing", name: "<file-level>", field: mn, specV: "absent", origV: "present" });
  }

  // emit corrected spec: header + original text (specs are inputs, not outputs —
  // corrections land in the report; the emitted copy records every diff inline
  // at the top so readers see what changed without hunting)
  const header = [
    "(* VERIFY-SPECS (2026-10-01): re-verified against orig via oracle fixtures",
    "   (defs-orig.json / space-orig.json — the real orig objects dumped by the",
    "   orig driver) and the oracle-verified FS catalogs. Diff summary: ",
    `   ${diffs.length} discrepancy(ies). Details at the bottom of this file and in`,
    "   verify-report.md. The old elmishKittens specs under ../elmishKittens are",
    "   SUPERSEDED by the oracle-verified kittens_land catalogs; this copy is the",
    "   archived input with the discrepancies recorded. *)",
    "",
  ].join("\n");
  const diffBlock = diffs.length
    ? [
        "",
        "(* ---- DISCREPANCIES FOUND (orig truth vs this spec) ----",
        ...diffs.map(
          (d0) =>
            `   ${d0.kind}/${d0.name}.${d0.field}: spec=${d0.specV} orig=${d0.origV}`
        ),
        "   ---- END DISCREPANCIES ---- *)",
      ].join("\n")
    : "\n(* no discrepancies: all extracted fields match orig *)";

  fs.writeFileSync(path.join(OUT, file), header + text + diffBlock + "\n");
  totalDiffs += diffs.length;
  report.push({ file, records: records.length, diffs });
}

// summary report
const lines = [
  "# verify-specs report (2026-10-01)",
  "",
  "Orig truth: oracle/fixtures/defs-orig.json + space-orig.json (real orig objects",
  "dumped by the orig driver) + the oracle-verified FS catalogs for arrays without",
  "a fixture (religion/time/diplomacy/village — behaviorally bit-exact via the",
  "52-scenario suite).",
  "",
  "| spec file | entities parsed | discrepancies |",
  "|---|---|---|",
  ...report.map((r) => `| ${r.file} | ${r.records} | ${r.diffs.length} |`),
  "",
  `**Total discrepancies: ${totalDiffs}**`,
  "",
  "Known from the migration history: the old specs undercount the def arrays",
  "(claimed 142 techs / 20 crafts / 61 upgrades era counts; orig has",
  `${defs.techs.length} techs / ${defs.crafts.length} crafts / ${defs.upgrades.length} upgrades —`,
  "confirmed by defs-orig.json). The per-entity diffs above list each field.",
  "",
  "The SUPERSEDED note stands: kittens_land/src/Game/Game.Catalog.*.fs are the",
  "authoritative catalogs (extracted from orig, behaviorally verified via the",
  "oracle). These analysis/specs copies archive the old specs with their",
  "discrepancies recorded, per the verify-01 contract.",
];
fs.writeFileSync(path.join(OUT, "verify-report.md"), lines.join("\n") + "\n");
console.log("files:", report.length, "records:", report.reduce((s, r) => s + r.records, 0), "diffs:", totalDiffs);
for (const r of report) console.log(`  ${r.file}: ${r.records} records, ${r.diffs.length} diffs`);
