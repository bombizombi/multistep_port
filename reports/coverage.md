# Coverage — orig port-relevant files vs migration units

Coverage target = every `game`/`html`/`ui-jsx` file in `analysis/files.json` is claimed
by ≥1 work unit whose `coversLines` sum ≈ file length (orientation-based). Update after
each recon session. Excluded per D004: `lib/`, `test/`, `tools/` of orig.

Recon done = per-file semantic report exists in `analysis/recon/`.
Units defined = ported work units in `ledger/migration.yaml`.

| orig file | lines | recon | units defined | ported (units verified) |
|---|---:|---|---|---|
| game.js | 6432 | **done** (recon-01) | game-01..20 (20) | 0% |
| js/village.js | 6074 | **done** (recon-02) | village-01..20 (20) | 0% |
| js/buildings.js | 3798 | **done** (recon-03) | buildings-01..15 (15) | 0% |
| js/workshop.js | 3538 | running (recon-04) | pending | 0% |
| js/religion.js | 3273 | pending (recon-08) | — | 0% |
| core.js | 2856 | pending (recon-17) | — | 0% |
| js/science.js | 2820 | running (recon-05) | pending | 0% |
| js/time.js | 2791 | pending (recon-09) | — | 0% |
| js/diplomacy.js | 2232 | pending (recon-10) | — | 0% |
| js/space.js | 1603 | pending (recon-11) | — | 0% |
| js/challenges.js | 1328 | pending (recon-12) | — | 0% |
| js/calendar.js | 1268 | **done** (recon-06) | calendar-01..12 (12) | 0% |
| index.html | 639 | pending (recon-20) | — | 0% |
| js/ui.js | 1197 | pending (recon-18) | — | 0% |
| js/resources.js | 1178 | **done** (recon-07) | resources-01..11 (11) | 0% |
| js/jsx/* (5 files) | 2352 | pending (recon-19) | — | 0% |
| js/achievements.js | 883 | pending (recon-14) | — | 0% |
| js/prestige.js | 715 | pending (recon-13) | — | 0% |
| js/settings.js | 392 | pending (recon-16) | — | 0% |
| js/stats.js | 246 | pending (recon-15) | — | 0% |
| js/toolbar.js | 241 | pending (recon-19) | — | 0% |
| js/preview.js | 229 | pending (recon-19) | — | 0% |
| js/void.js | 76 | pending (recon-15) | — | 0% |
| js/math.js | 104 | pending (recon-15) | — | 0% |
| i18n.js + config.js | ~200 | pending (recon-16) | — | 0% |

Totals: **78 work units** defined; ~29,750 / 43,800 core+shell lines described (**68%**).
