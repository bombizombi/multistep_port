# Coverage — orig port-relevant files vs migration units

Coverage target = every `game`/`html`/`ui-jsx` file in `analysis/files.json` is claimed
by ≥1 work unit whose `coversLines` sum ≈ file length (orientation-based). Excluded per
D004: `lib/`, `test/`, `tools/` of orig.

**Phase 1 complete (2026-09-28): all 33 port-relevant files described** — semantic
reports in `analysis/recon/` (index: `analysis/inventory.md`), 244 ported work units in
`ledger/migration.yaml`.

| orig file | lines | recon report | units defined | ported (units verified) |
|---|---:|---|---|---|
| game.js | 6432 | recon/game.md | game-01..20 (20) | 0% |
| js/village.js | 6074 | recon/village.md | village-01..20 (20) | 0% |
| js/buildings.js | 3798 | recon/buildings.md | buildings-01..15 (15) | 0% |
| js/workshop.js | 3538 | recon/workshop.md | workshop-01..15 (15) | 0% |
| js/religion.js | 3273 | recon/religion.md | religion-01..15 (15) | 0% |
| core.js | 2856 | recon/core.md | core-01..16 (16) | 0% |
| js/science.js | 2820 | recon/science.md | science-01..14 (14) | 0% |
| js/time.js | 2791 | recon/time.md | time-01..16 (16) | 0% |
| js/diplomacy.js | 2232 | recon/diplomacy.md | diplomacy-01..12 (12) | 0% |
| js/space.js | 1603 | recon/space.md | space-01..12 (12) | 0% |
| js/challenges.js | 1328 | recon/challenges.md | challenges-01..13 (13) | 0% |
| js/calendar.js | 1268 | recon/calendar.md | calendar-01..12 (12) | 0% |
| index.html (+emulator/tests) | 854 | recon/index.md | html-01..10 (10) | 0% |
| js/ui.js | 1197 | recon/ui.md | ui-01..14 (14) | 0% |
| js/resources.js | 1178 | recon/resources.md | resources-01..11 (11) | 0% |
| js/jsx/* (5 files) | 2352 | recon/toolbar.md | jsx-01..14 (with toolbar/preview) | 0% |
| js/achievements.js | 883 | recon/achievements.md | achievements-01..08 (8) | 0% |
| js/prestige.js | 715 | recon/prestige.md | prestige-01..08 (8) | 0% |
| js/settings.js | 392 | recon/settings.md | settings-01..04 (4) | 0% |
| js/stats.js | 246 | recon/stats.md | stats-01..04 (4) | 0% |
| js/toolbar.js | 241 | recon/toolbar.md | (bundled) | 0% |
| js/preview.js | 229 | recon/toolbar.md | (bundled) | 0% |
| js/void.js | 76 | recon/stats.md | void-01..02 (2) | 0% |
| js/math.js | 104 | recon/stats.md | math-01..04 (4) | 0% |
| i18n.js + config.js | ~200 | recon/settings.md | i18n-01..04, config-01 (5) | 0% |

Totals: **244 work units** defined; **43,800 / 43,800** core+shell lines described (**100%**).
Ported: resources-01..04 + 06 + oracle-04 verified (sessions 2026-09-28-04/-05); `unit-resources` and `unit-res-caps` agree bit-exact with orig.
