# analysis/ — machine facts + semantic inventory

| File / dir | Kind | Owner |
|---|---|---|
| `files.json` | generated | `node tools/scan.js` — never hand-edit |
| `nondeterminism.json` | generated | `node tools/scan.js` — never hand-edit |
| `inventory.md` | generated index | `node tools/gen-inventory.js` — never hand-edit |
| `recon/<stem>.md` | semantic (LLM-written) | recon units — THE authoritative per-file description + proposed work-unit tables |
| `work-units.json` | schema | conventions for unit splitting; the actual tables live in `recon/*.md`, statuses in `ledger/migration.yaml` |
| `specs/` | data (verified) | verify-01 — re-emitted from `../elmishKittens/specs/` after mechanical verification |

Three-layer split (D009): **machine facts** (scanner, regenerable), **semantic recon**
(per-file LLM reports, version-controlled), **statuses** (ledger only). A re-scan never
destroys written descriptions; the index (`inventory.md`) is rebuilt from both.
