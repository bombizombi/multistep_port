# Discrepancies — oracle mismatches and their resolution

Rules: a mismatch is **diagnosed before fixed**. Never edit a fixture to make a test
pass. If the *port* was wrong → fix the port. If orig behavior was misread → fix the
port and add a regression scenario. If we *choose* to diverge from orig → decision
entry in `ledger/decisions.md` and mark the discrepancy `accepted`.

## Open observations (orig behavior not yet fully explained — resolve during porting)

| id | date | area | observation | plan |
|---|---|---|---|---|
| OBS-1 | 2026-09-28 | science production | With library built + 2 scholars assigned, `science` resource stays at 0 for 1800+ ticks (`perTickCached` 0, `unlocked` false, cap 250→500 fine). Production path (`updateResourceProduction`, village.js L626-728 → `getResourcePerTickStack` village entry) returns 0 — the unlock/production gate was not identified during oracle bring-up. Orig's own jest tests bypass this by setting `researched = true` directly. | The gate is orig logic that must be ported faithfully; resolve while implementing village-04 / resources-05, then re-author `first-research.cat` so the research action succeeds and re-capture its fixture. |

## Discrepancy log

| id | date | unit | scenario/tick | symptom | root cause | resolution | status |
|---|---|---|---|---|---|---|---|
| — | — | — | — | none recorded yet (no port-side runs yet) | — | — | — |
