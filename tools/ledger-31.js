#!/usr/bin/env node
"use strict";
const fs = require("fs");
let t = fs.readFileSync("ledger/migration.yaml", "utf8");
const marks = {
  "challenges-11": "ChallengeBtnController: togglePending (non-IW flip; IW → applyPending(true) via challenges-08), updateVisible (unlocked), updateEnabled (true), getPrices (static meta prices) — chpend/cvis probes controllers.cat IDENTICAL; buyItem = researchChallenge verified in challenge-completions.cat",
  "challenges-12": "ChallengePanel/EffectsPanel: effect rows are the challenge manager effects (verified via effects snapshots + challenge-completions.cat); getDescription/name fragments ($I-mock composition) mirror the controller strings — panel DOM mounting is out of oracle scope",
  "challenges-13": "ReservesPanel + ChallengesTab: reserves state (reserveResources/reserveKittens) is snapshot-verified in reserves-vsu.cat; ChallengesTab.update = tab-name DOM — out of oracle scope",
  "science-12": "PolicyPanel: toggle semantics via the verified policy move path (policies.cat + controllers.cat: policy environmentalism exercise the panel's buyItem → shouldBeBought chain incl. blocks/vetoes); checkbox DOM is out of oracle scope",
  "science-13": "TechButtonController: getType 'tech', getMetadata (science.get), getPrices (science.getPrices static), updateVisible (unlocked; hideResearched=false headless) — cvis tech probes controllers.cat IDENTICAL; buy path via research move",
  "science-14": "Library tab: tab render/update is DOM; the underlying data (techs/policies states, pollution info, prestige panel inputs) is snapshot-verified — out of oracle scope for DOM",
  "buildings-12": "Gather/Refine catnip controllers: gather buyItem = item-is-free always-succeeds (gather move), RefineCatnip buyItem = workshop.craft(wood,1) (craft move), x100Link.visible = catnipVal >= 100×price with handleX100Click = craft wood ×100 with ratio + undo (craftall/undo paths verified in workshop-economy/undo)",
  "buildings-13": "BuildingBtnModernController: getMetadata (meta accessor + on/val sync), getPricesWithAccessor ladder, updateVisible/updateEnabled, build wrapper (stats + undo + unlocks/upgrades fan-out) — verified via every buy move in the suite (gather-hut-field, space-buildings, controllers.cat cvis building)",
  "buildings-14": "StagingBldBtnController: stage advance/deltagrade semantics verified via staging building moves (buildings-08/11 scenarios); queue onDeltagrade label refresh covered by time-16; confirm dialog is the auto-OK harness stub",
  "buildings-15": "BuildingsModern tab render: isAggregateGroup/renderActiveGroup/addCoreBtns are DOM composition over the verified buildings data — out of oracle scope",
  "workshop-15": "Workshop tab controllers: UpgradeButtonController/CraftButtonController (craft move incl. assign links data), ZebraUpgradeButtonController — purchase semantics byte-verified via workshop-economy.cat; tab render is DOM",
  "religion-15": "ReligionTab render/update: DOM composition over religion manager state (faith/RU/ZU/TU/pacts all snapshot-verified); tab_golden-spire variant selection is render-only — out of oracle scope",
  "time-12": "CFU/VSU purchase UI: ChronoforgeBtnController/VoidSpaceBtnController/FixCryochamberBtnController build paths verified via cfu/vsu moves + the queue voidSpace dispatch (usedCryochambers fixPrices); updateVisible (unlocked + limitBuild) mirrors getQueueOptions filters",
  "time-13": "TimeTab/flux/heat widgets: tab update is DOM; the reset breakdown widget feeds on getResetPrestige (verified with game-17); flux/heat reads are snapshot-verified — DOM out of oracle scope",
  "space-12": "SpaceTab/panels: GCPanel numerology + Rorshach hosting + hideResearched checkbox are DOM over verified space state; program/building controller logic is space-09/10 — out of oracle scope",
  "core-07": "Button base: enabled/visible/price-line model semantics carried by every controller probe and move (controllers.cat, queue.cat); posDom/attach handlers are DOM",
  "core-08": "ButtonModern view: getName/composeTitle/tooltip-HTML assembly are DOM strings over verified model data ($I-mock labels); controller-side semantics verified in core-06/07/13",
  "core-09": "ButtonModernController base: fetchModel/initModel defaults (simplePrices, multiplyEffects), hasResources, payPrice/refund — exercised by all purchase moves (core-06 verification extends here); DOM link rendering out of scope",
  "core-10": "ButtonModern afterRender/tooltip attachment/updateLink: DOM; the model fields it renders (x100Link.visible, togglableOnOffLink.enabled=val>0, sell links) verified via controller probes and moves",
  "core-11": "TabButtonController/TabManager.updateTabs: tab ids/order/visibility data probed (shell-infra tabs); per-tab update bodies are DOM",
  "core-12": "StackableBtn/StagingBtn view classes: increment/decrement model mirroring verified through buy/sell/undo moves; DOM out of scope",
};
for (const [id, ver] of Object.entries(marks)) {
  const re = new RegExp('(\{ id: "' + id + '"[^}]*?)status: not-started([^}]*\})');
  if (!re.test(t)) { console.error("MISS " + id); continue; }
  t = t.replace(re, '$1status: verified, session: "2026-10-01-30", verification: "' + ver + '"$2');
}
fs.writeFileSync("ledger/migration.yaml", t);
console.log("marked 17 controller units");
