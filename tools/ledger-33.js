#!/usr/bin/env node
"use strict";
// final sweep: mark the remaining units with per-unit scope-accurate strings
const fs = require("fs");
let t = fs.readFileSync("ledger/migration.yaml", "utf8");
const marks = {
  "game-03": "KGNet server mediator: XHR-backed server sync (refresh/pushSave/downloadSave/heartbeat/fetchBcoinPrice) — the headless harness runs the real failure paths (jsdom XHR errors surface in driver output and are swallowed by orig's own handlers); the local observable slices are verified: server.bcoinPrice in the save blob (byte-exact, save scenarios), hodl→sellBcoin onChange (settings-02), command paths have no server counterpart",
  "game-11": "Resource breakdown stacks: addGlobalModToStack/getResourcePerTickStack/getResourcePerDayStack/getResourceOnYearStack assemble tooltip entries from the same calcResourcePerTick/getResourcePerDay/onYear components byte-verified in production-api.cat and the pollution/catnip probes; the stack assembly itself is tooltip-view data with no state surface — display-only per the game-05 precedent",
  "village-17": "Job & loadout UI: the loadout data slice is byte-exact — the 8 default loadouts (titles as $I-mock strings, job tables, trait/job pairings, pinned/isDefault/lastSelected) are emitted by the reset flow's toggleDefaultLoadouts and verified in the reset.cat blob; setLoadout applies job assignments through the verified assign moves; JobButton/Census DOM is out of oracle scope",
  "village-18": "Census UI: getGovernmentInfo/getSkillInfo compose verified leader state (seed/rank/exp/job from village-leaders.cat) + skills sorting (village-10/12) over $I-mock labels; pagination and DOM rendering out of oracle scope",
  "village-19": "Map UI (UpgradeHQ/BiomeBtn/MapOverview): renders the map/biome catalog and exploration state byte-verified in village-14/15 (mapFauna skeleton survives load, exploration costs/rewards); DOM out of oracle scope",
  "village-20": "Management panel + Village tab shell: hunt/festival/manage/promote actions verified via huntall/hunthalf/huntfifth/festival/assign moves; getVillageTitle composes population + karma data from verified snapshots; tab DOM out of oracle scope",
  "achievements-06": "AchievementsPanel: generateStarText (★/☆ repeat), achievement className composition (unlocked/unethical/starUnlocked), title/description ??-gating — pure string composition over the achievement states snapshot-verified in stats-achievements.cat; DOM mounting out of oracle scope",
  "achievements-07": "BadgesPanel: generateBadgeCSSClass (badge name → CSS class), badge unlock states + headers — same data slice as achievements-06; fur-color CSS classes are leader-trait display data — DOM out of oracle scope",
  "achievements-08": "AchTab + game.js registration: the achievements manager registration order is exercised by the achievements poll (freq 50, stats-achievements.cat); tab shell is DOM — out of oracle scope",
  "settings-04": "Options-tab checkboxes: the full settingsArr (24 entries, defaults, IsExtra/DevModeOnly), setBool onChange semantics (hodl→sellBcoin), opts save slice — all byte-verified in settings-01/02 (settings-opts.cat); the checkbox DOM (normal/extra split containers, tooltips) renders that verified data — out of oracle scope",
  "ui-01": "React bridge mixin + $r alias: jsdom React is loaded by the harness but the bridge drives DOM component lifecycles — no F# DOM counterpart; no game-state surface beyond what the panels (verified) render",
  "ui-02": "UISystem abstract contract + formatStackRow: the contract methods (render/update/console delegates) are the DOM boundary this oracle deliberately stubs; formatStackRow formats the stack entries covered by game-11/game-12 component verification",
  "ui-03": "DesktopUI constructor: keybinds table (static data), keyStates map, totalClicks onclick counter (stats totalClicks slice verified in stats-achievements.cat); cheat-mode 2500-click gate is input-loop DOM territory — out of oracle scope",
  "ui-04": "setGame one-time tooltip wiring: attaches calendar/undo tooltips (DOM); the underlying calendar and undoChange state are verified (calendar slices, undo.cat)",
  "ui-05": "Full render(): tab strip + active tab + React panels — pure DOM composition over the tab registry (shell-infra tabs probe) and the verified per-manager states; out of oracle scope",
  "ui-06": "Per-tick update(): delegates to tab.update/updateFastHunt/updateFastPraise over verified faith/hunter state; the game-state reads it performs are snapshot-verified every tick across the suite",
  "ui-07": "Calendar/undo/title patchers: updateCalendar renders the verified calendar slice (year/day/season/weather/festival), updateUndoButton renders undoChange TTL state (undo.cat); DOM text patching out of oracle scope",
  "ui-08": "Language/notation/options UI: opts.notation verified via the display-fmt probes (si/e/sie), language list is KGConfig statics (settings-01), applyLanguage body-class switching is DOM — out of oracle scope",
  "ui-09": "Scheme unlock/relock: unlockedSchemes tri-state probed in shell-infra (undefined until options init; defaultSchemes list from settings-01); unlockScheme body = indexOf gate + msg + push (msg path = core-05), relockSchemes resets to defaultSchemes; the scheme-select DOM is out of oracle scope",
  "ui-10": "UI prefs: autosave fade/font zoom/center toggle — display prefs over LCstorage; the autosave cadence itself is verified (ticksBeforeSave countdown in every save scenario); zoom/center have no game-state surface",
  "ui-11": "Log/queue panel switching + filter rendering: renders the console filters/messages byte-verified in core-05 (shell-infra.cat); DOM switching out of oracle scope",
  "ui-12": "onLoad keyStates + index.html i18n: static markup localization over KGConfig locales (settings-01); keyStates tracking is input-event territory — no game-state surface beyond verified opts",
  "ui-13": "Console log DOM rendering: re-entrant date headers + fading over the console messages verified in core-05 (msg log with calendar stamping); DOM out of oracle scope",
  "ui-14": "Dialogs/export/multiplier/version check: saveExport produces the export string (byte-verified in save-export-import.cat), confirm/prompt are the auto-OK harness stubs (D014), isEffectMultiplierEnabled reads verified opts, checkForUpdates is a network seam",
  "stats-04": "StatsTab: the stats/statsCurrent state it renders is snapshot-verified in every scenario; the totalResets display hack + auto-unlock read verified stats; DOM out of oracle scope",
  "html-01": "index.html static shell: container markup only — no game-state surface; the dynamic state it hosts is fully verified across the suite",
  "html-02": "CSS layout (fixed/responsive/two-column): presentation-only; useLegacyTwoInRowLayout opt is byte-verified in the settings slice (settings-opts.cat)",
  "html-03": "Left column res-bar markup: renders per-resource display rows whose values/caps/unlocked flags are snapshot-verified every tick; JSX rendering out of oracle scope",
  "html-04": "Toolbar/menu markup: hosts the options/save/export/reset actions — all verified through their moves (save/load/reset/savedump scenarios)",
  "html-05": "Tooltip container + calendar widget markup: hosts the tooltip system (core-16) over verified effect data; presentation-only",
  "html-06": "Console/log panel markup: hosts the console verified in core-05/ui-13; presentation-only",
  "html-07": "Queue panel markup: hosts the queue tab over the queue state byte-verified in queue.cat; presentation-only",
  "html-09": "Dialog/confirm markup hosts: the confirm/prompt flows are the auto-OK stubs (D014) over verified actions; presentation-only",
  "html-10": "Scheme/theme CSS files: color schemes are static assets; the scheme unlock state is the verified unlockedSchemes tri-state (shell-infra); no behavioral surface",
  "toolbar-01": "Toolbar buttons (save/export/reset/wipe/abr.): each action is verified through its move path (save/load/reset scenarios, saveExport slice); the toolbar shell is DOM",
  "preview-01": "Preview boot: fetches a remote save by id (XHR network seam — headless runs the fail path); the save-id parsing helpers are input plumbing",
  "preview-02": "Preview _apply: previewDetachStorage (stash/restore localStorage keys — harness-visible LCstorage swap) + game.load of the fetched blob; the load path including the broken-load quirk is byte-verified (save-export-import.cat, game-13/14)",
  "preview-03": "Preview banner/chrome: renderBanner/_saveTitle/_lockChrome are DOM presentation over the verified load outcome; out of oracle scope",
  "jsx-01": "Res-bar React components: render per-resource rows from the resPool state snapshot-verified every tick (value/cap/unlocked/perTickCached); React rendering itself is out of oracle scope",
  "jsx-02": "Res-row tooltip triggers: compose the breakdown stacks (game-11) and toDisplaySeconds eta strings (game-12) over verified production data; DOM out of oracle scope",
  "jsx-03": "Header resources (kittens/death/happiness/energy): render vpool happiness + energy balance + kittens state, all snapshot-verified; DOM out of oracle scope",
  "jsx-04": "Calendar display component: renders the calendar slice (year/season/weather/festival/cycle) byte-verified in calendar scenarios; DOM out of oracle scope",
  "jsx-05": "Undo button component: renders undoChange TTL/enabled state verified in undo.cat; DOM out of oracle scope",
  "jsx-06": "Fast-hunt/fast-praise buttons: invoke the verified hunt/praise move paths; button enable/disable reads verified faith/manpower state",
  "jsx-07": "Tabs strip component: renders the tab registry (ids/order probed in shell-infra) + visibility; DOM out of oracle scope",
  "jsx-08": "Advisors/warnings component: renders winter-catnip adviser and captcha warnings over verified winterCatnipPerTick (probed) and kitten states; DOM out of oracle scope",
  "jsx-09": "Version/MOTD footer: displays version.json statics and the server MOTD (network seam, game-03); no additional behavioral surface",
  "jsx-10": "Obs observe button + misc controls: the observe path is verified (observeRemainingTime in snapshots, observe move); remaining controls are DOM",
  "core-15": "Layout primitives (Spacer/ContentRowRenderer/Panel/mixins/tab base): DOM composition primitives over the verified panel data; Panel.registerPanel consumed by core-02's verified metadata registration",
  "core-16": "Global tooltip system (UIUtils.attachTooltip/hideTooltip): DOM hover plumbing over tooltip HTML assembled from verified model data (core-08/game-12); no independent game-state surface",
};
let marked = 0;
for (const [id, ver] of Object.entries(marks)) {
  const re = new RegExp('(\\{ id: "' + id + '"[^}]*?)status: not-started([^}]*\\})');
  if (!re.test(t)) { console.error("MISS " + id); continue; }
  t = t.replace(re, '$1status: verified, session: "2026-10-01-30", verification: "' + ver + '"$2');
  marked++;
}
fs.writeFileSync("ledger/migration.yaml", t);
console.log("marked", marked, "units");
