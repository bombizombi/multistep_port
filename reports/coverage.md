# Coverage — orig port-relevant files vs migration units

Coverage target = every `game`/`html`/`ui-jsx` file in `analysis/files.json` is claimed
by ≥1 work unit whose `coversLines` sum ≈ file length (orientation-based). Update after
each recon session. Excluded per D004: `lib/`, `test/`, `tools/` of orig.

| orig file | lines | units claiming it | recon | ported (units verified) |
|---|---:|---|---|---|
| game.js | 6432 | recon-01 → (units TBD) | pending | 0% |
| js/village.js | 6074 | recon-02 → TBD | pending | 0% |
| js/buildings.js | 3798 | recon-03 → TBD | pending | 0% |
| js/workshop.js | 3538 | recon-04 → TBD | pending | 0% |
| js/religion.js | 3273 | recon-08 → TBD | pending | 0% |
| core.js | 2856 | recon-17 → TBD | pending | 0% |
| js/science.js | 2820 | recon-05 → TBD | pending | 0% |
| js/time.js | 2791 | recon-09 → TBD | pending | 0% |
| js/diplomacy.js | 2232 | recon-10 → TBD | pending | 0% |
| js/space.js | 1603 | recon-11 → TBD | pending | 0% |
| js/challenges.js | 1328 | recon-12 → TBD | pending | 0% |
| js/calendar.js | 1268 | recon-06 → TBD | pending | 0% |
| index.html | 639 | recon-20 → TBD | pending | 0% |
| js/ui.js | 1197 | recon-18 → TBD | pending | 0% |
| js/resources.js | 1178 | recon-07 → TBD | pending | 0% |
| js/jsx/* (5 files) | 2352 | recon-19 → TBD | pending | 0% |
| js/achievements.js | 883 | recon-14 → TBD | pending | 0% |
| js/prestige.js | 715 | recon-13 → TBD | pending | 0% |
| js/settings.js | 392 | recon-16 → TBD | pending | 0% |
| js/stats.js | 246 | recon-15 → TBD | pending | 0% |
| js/toolbar.js | 241 | recon-19 → TBD | pending | 0% |
| js/preview.js | 229 | recon-19 → TBD | pending | 0% |
| js/void.js | 76 | recon-15 → TBD | pending | 0% |
| js/math.js | 104 | recon-15 → TBD | pending | 0% |
| i18n.js + config.js | ~200 | recon-16 → TBD | pending | 0% |

Totals: 0 / ~43,800 core+shell lines covered by defined units (recon phase defines them).
