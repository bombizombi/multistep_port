#!/usr/bin/env node
"use strict";
// ledger-29: time-14/15/16 (queue), prestige-07/08 (burn paragon/HG),
// village-16 (combat math), game-12 (display formatters) + undo TradeUndo fix.
const fs = require("fs");
const path = "ledger/migration.yaml";
let t = fs.readFileSync(path, "utf8");
const marks = {
  "time-14": "Queue state/cap/editing: manager fields + calculateCap (aiCore.on + entangler hashRateLevel + baseCap 3 + queueCap, floor × 1+queueCapRatio), queueLength (value||1), addToQueue (shift=Inf/ctrl=batchSize, nonStackable clamp 1, tail merge, cap clamp), remove (falsy splice), pushBack/pushFront (index gates), unlockQueueSource, dropLastItem — save slice queueItems+queueSources (buildings-boolean validation quirk on load; alphabeticalSort never saved → falsy) — queue.cat IDENTICAL",
  "time-15": "Queue options + resolution: getQueueOptionsUnsorted per all 13 sources (unlocked/researched/blocked/val/limitBuild/atheism/faith-gate filters, usedCryochambers special), getQueueOptionsAlphabetical via generated en-US collation ranks (QueueLabels.fs, Node localeCompare over the $I-mock label universe), getFirstItemEtaDay (engineersConsumed/getEffectEngineer afterCraft, eta caps+ceil, calc=false gates) — queue.cat IDENTICAL",
  "time-16": "Queue per-tick update: timer hook freq 10 (game.js L2632) after winter catnip in registration order, queue.update = calculateCap + first-item buy via controller dispatch (buildings/tech/upgrades/policies/religion/ziggurat/transcendence/embassies incl. cheapest/spaceMission/spaceBuilding/chronoforge/voidSpace incl. usedCryochambers fixPrices) with side-effect tails, drop/wait reasons (_isReasonToSkipItem), dropLastItem drain, head blocking — queue.cat IDENTICAL",
  "prestige-07": "Prestige button controllers: PrestigeBtnController metaphysics buy gate precedes afford checks (not-unlocked, no state change) + updateVisible (unlocked && (researched || metaphysics)), BurnParagonBtnController.updateVisible (paragon > 0), turnHGOffButtonController.updateVisible (aHG > 0 || holyGenocide.on > 0) — prestige-burn.cat IDENTICAL",
  "prestige-08": "Burn-paragon/HG actions: discardParagon confirm chain auto-OK → doDiscardParagon (burnedParagon += paragon; paragon = 0; ironWill = Boolean(ironWill && spaceOddity.starUnlocked)), religion.turnHGOff (aHG = 0; holyGenocide.on = 0) — byte-exact savedump incl. game.ironWill flip — prestige-burn.cat IDENTICAL",
  "village-16": "Combat math & leader combat stats (classes.village.Map): getExp (<<0 trunc, negative-diff df penalty), getHitRate (clamp 100), getKillExp (floor 1), xmur3/getSeededStatRoll, rand finalizer, getStatAtLevel (baked stat seed, macroLuck, jitter), getCombatStatsAt (traitless bias +0.05, floor 1), getCombatLevel/getCombatExpProgress, attack (±10% damage roll then game.rand(100) hit check, hp floor 0) — RNG-draw-aligned across 3 battles × 50 iters — village-combat.cat IDENTICAL",
  "game-12": "Display assembly + number formatting: getDisplayValueExt (si/e/sie notations, 15-step postfix ladder incl. K at 9e3, usePerSecondValues ×ticksPerSecond hack with undo at ladder step, prefix/±∞), getDisplayValue (toFixed precision, forceHighPrecision, (...)-mantissa, int fast path), toDisplaySeconds/toDisplayDays (unit decomposition, year suppression, 1e6/1e9 guards), toDisplayPercentage (auto-precision cascade 0-8 + fixed mode −1/10^p), fixFloatPointNumber — display-fmt.cat IDENTICAL",
};
for (const [id, ver] of Object.entries(marks)) {
  const re = new RegExp('(\{ id: "' + id + '"[^}]*?)status: not-started([^}]*\})');
  if (!re.test(t)) { console.error("MISS " + id); continue; }
  t = t.replace(re, '$1status: verified, session: "2026-10-01-29", verification: "' + ver + '"$2');
  console.log("marked " + id);
}
fs.writeFileSync(path, t);
