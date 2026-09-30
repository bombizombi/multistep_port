# verify-specs report (2026-10-01)

Orig truth: oracle/fixtures/defs-orig.json + space-orig.json (real orig objects
dumped by the orig driver) + the oracle-verified FS catalogs for arrays without
a fixture (religion/time/diplomacy/village — behaviorally bit-exact via the
52-scenario suite).

| spec file | entities parsed | discrepancies |
|---|---|---|
| Bonfire.fs.md | 40 | 0 |
| Diplomacy.fs.md | 8 | 0 |
| Policies.fs.md | 64 | 0 |
| Religion.fs.md | 40 | 0 |
| Resources.fs.md | 60 | 0 |
| Science.fs.md | 61 | 2 |
| Space.fs.md | 25 | 0 |
| Systems.fs.md | 120 | 0 |
| Time.fs.md | 15 | 0 |
| Village.fs.md | 17 | 0 |
| Workshop.fs.md | 162 | 5 |

**Total discrepancies: 7**

Known from the migration history: the old specs undercount the def arrays
(claimed 142 techs / 20 crafts / 61 upgrades era counts; orig has
62 techs / 23 crafts / 143 upgrades —
confirmed by defs-orig.json). The per-entity diffs above list each field.

The SUPERSEDED note stands: kittens_land/src/Game/Game.Catalog.*.fs are the
authoritative catalogs (extracted from orig, behaviorally verified via the
oracle). These analysis/specs copies archive the old specs with their
discrepancies recorded, per the verify-01 contract.
