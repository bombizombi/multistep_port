#!/usr/bin/env node
"use strict";
// Mark ledger units verified (session 2026-09-30-21+).
const fs = require("fs");
const q = "ledger/migration.yaml";
let t = fs.readFileSync(q, "utf8");
const marks = [
  ["science-03", "Void/chrono tech handlers: cryptotheology→transcendenceUpgrades + voidSpace→voidSpace queue-source unlocks on research and in science.afterLoad (js/science.js L808-831) — policies.cat IDENTICAL"],
  ["science-05", "Industrial/info/tier5 policy defs: static effects tables (Game.Catalog.Policies) + calculateEffects (liberty IW maxKittens; socialism orig bug = empty table) — policies.cat IDENTICAL"],
  ["science-06", "Foreign/relation policy defs: effect tables + verbatim blocks graph + evaluateLocks relation gates — policies.cat IDENTICAL"],
  ["science-07", "Philosophy/environmental/pact policy defs: effect tables + feedingFrenzy UDR calc + upfrontPayment onResearch + cryochamberExtraction VSU bump — policies.cat IDENTICAL"],
  ["science-08", "scienceGroup = effectsBase (environment*Modifier 1) + researched-policy items raw per registerMeta(research) — policies.cat IDENTICAL"],
  ["science-11", "PolicyBtnController: ×1.25^policyFakeBought pricing, shouldBeBought gates (priest/aiLevel/upfront/blocked), rival blocking, require-confirmation logging, unlock vetoes — policies.cat IDENTICAL"],
];
for (const [id, ver] of marks) {
  const needle = `{ id: "${id}",`;
  const idx = t.indexOf(needle);
  if (idx < 0) { console.error("no entry " + id); process.exit(1); }
  const segEnd = t.indexOf("recon:", idx);
  const seg = t.slice(idx, segEnd);
  if (!seg.includes("status: not-started")) { console.error("not not-started: " + id); process.exit(1); }
  t = t.slice(0, idx) + seg.replace("status: not-started", `status: verified, session: "2026-09-30-21", verification: "${ver}"`) + t.slice(segEnd);
}
fs.writeFileSync(q, t);
console.log("ok +6");
