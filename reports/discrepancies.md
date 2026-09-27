# Discrepancies — oracle mismatches and their resolution

Rules: a mismatch is **diagnosed before fixed**. Never edit a fixture to make a test
pass. If the *port* was wrong → fix the port. If orig behavior was misread → fix the
port and add a regression scenario. If we *choose* to diverge from orig → decision
entry in `ledger/decisions.md` and mark the discrepancy `accepted`.

## Open observations (orig behavior not yet fully explained — resolve during porting)

| id | date | area | observation | plan |
|---|---|---|---|---|
| — | — | — | none open | — |

## Discrepancy log

| id | date | unit | scenario/tick | symptom | root cause | resolution | status |
|---|---|---|---|---|---|---|---|
| OBS-1 | 2026-09-28 | science production | first-research | Science stayed 0 for 1800+ ticks despite library + 2 scholars (perTickCached 0, cap fine). | **SOLVED**: job modifiers are computed by `calculateEffects` on the job def (e.g. scholar sets `{science: 0.035}`); in orig this is triggered by the UI render pass via `game.upgrade({jobs})` after a building unlocks jobs. Headless there is no render pass, so modifiers stayed `{}` and job production × 0. | Harness mirrors the render side effect after successful building purchases (`orig-driver.js`, decision D012); agriculture now researches end-to-end. **Port requirement recorded:** the F# core must call job `calculateEffects` at unlock time, not rely on any UI pass (village-04). | resolved 2026-09-28 |
| OBS-2 | 2026-09-28 | job assignment | first-research/t1350 | `village.assignJob` reported "assigned 2/2" with only 1 free kitten. | orig quirk: manager `assignJob` adds `amt` to `jobRef.value` regardless of how many kittens `sim.assignJob` actually assigned. | Captured as oracle fixture behavior; port must reproduce the counter/kitten divergence faithfully (village-04 contract). | observed (expected orig behavior) |
