# Orig inventory — recon index

Machine facts (lines, sha256, symbols, nondeterminism) live in `analysis/files.json`.
Semantic descriptions live in **per-file recon reports** under `analysis/recon/`
(convention D009). This file is a generated index — rerun `node tools/gen-inventory.js`
after adding reports; never hand-edit.

Orig snapshot: `781e379f79f1e7512d168849cba21ed111502644` — 82 files,
51623 lines total; 33 port-relevant files below.

| orig file | lines | role | recon report | status |
|---|---:|---|---|---|
| `config.js` | 10 | game | — | pending |
| `core.js` | 2857 | game | `analysis/recon/core.md` | **described** |
| `emulator.html` | 68 | html | — | pending |
| `game.js` | 6433 | game | `analysis/recon/game.md` | **described** |
| `i18n.js` | 191 | game | — | pending |
| `index.html` | 639 | html | — | pending |
| `js/achievements.js` | 884 | game | `analysis/recon/achievements.md` | **described** |
| `js/buildings.js` | 3799 | game | `analysis/recon/buildings.md` | **described** |
| `js/calendar.js` | 1269 | game | `analysis/recon/calendar.md` | **described** |
| `js/challenges.js` | 1329 | game | `analysis/recon/challenges.md` | **described** |
| `js/diplomacy.js` | 2233 | game | `analysis/recon/diplomacy.md` | **described** |
| `js/jsx/chiral.jsx.js` | 207 | ui-jsx | — | pending |
| `js/jsx/left.jsx.js` | 1027 | ui-jsx | — | pending |
| `js/jsx/mid.jsx.js` | 20 | ui-jsx | — | pending |
| `js/jsx/queue.jsx.js` | 267 | ui-jsx | — | pending |
| `js/jsx/toolbar.jsx.js` | 831 | ui-jsx | — | pending |
| `js/math.js` | 105 | game | — | pending |
| `js/prestige.js` | 716 | game | `analysis/recon/prestige.md` | **described** |
| `js/preview.js` | 230 | game | — | pending |
| `js/religion.js` | 3274 | game | `analysis/recon/religion.md` | **described** |
| `js/resources.js` | 1179 | game | `analysis/recon/resources.md` | **described** |
| `js/science.js` | 2821 | game | `analysis/recon/science.md` | **described** |
| `js/settings.js` | 393 | game | `analysis/recon/settings.md` | **described** |
| `js/space.js` | 1604 | game | `analysis/recon/space.md` | **described** |
| `js/stats.js` | 247 | game | `analysis/recon/stats.md` | **described** |
| `js/time.js` | 2792 | game | `analysis/recon/time.md` | **described** |
| `js/toolbar.js` | 242 | game | — | pending |
| `js/ui.js` | 1198 | game | `analysis/recon/ui.md` | **described** |
| `js/village.js` | 6075 | game | `analysis/recon/village.md` | **described** |
| `js/void.js` | 77 | game | — | pending |
| `js/workshop.js` | 3539 | game | `analysis/recon/workshop.md` | **described** |
| `simulate-combat.js` | 270 | game | — | pending |
| `tests.html` | 147 | html | — | pending |

## Nondeterminism summary (generated from files.json)

| category | call sites (game + ui-jsx roles) |
|---|---:|
| CONCURRENCY | 3 |
| ENV | 23 |
| RANDOM | 24 |
| STORAGE | 45 |
| TIME | 47 |
| TIMERS | 12 |

Full per-line census: `analysis/nondeterminism.json`.
