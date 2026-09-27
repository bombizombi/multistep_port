# analysis/ — machine facts + semantic inventory

| File | Kind | Owner |
|---|---|---|
| `files.json` | generated | `node tools/scan.js` — never hand-edit |
| `nondeterminism.json` | generated | `node tools/scan.js` — never hand-edit |
| `inventory.md` | semantic (LLM-written) | recon units `recon-01..20` |
| `work-units.json` | semantic (LLM-written) | recon units — symbol→unit mapping + dependency edges |
| `specs/` | data (verified) | verify-01 — re-emitted from `../elmishKittens/specs/` after mechanical verification |

The two-layer split (machine facts vs LLM interpretation) is deliberate: the scanner
regenerates truth cheaply and identically every time; the LLM layers add meaning on top
and are version-controlled separately so a re-scan never destroys written descriptions.
