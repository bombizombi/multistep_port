#!/usr/bin/env node
"use strict";
// Standalone: insert tech-handler re-runs into the loader's science.afterLoad
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const from = [
`                if not currentSaveIsBroken then`,
`                    for n in List.rev spool.TechOrder do`,
`                        let t = spool.Techs.[n]`,
`                        if t.Researched then`,
`                            match t.Def.Unlocks with`].join("\n");
const to = [
`                if not currentSaveIsBroken then`,
`                    for n in List.rev spool.TechOrder do`,
`                        let t = spool.Techs.[n]`,
`                        if t.Researched then`,
`                            // orig afterLoad re-runs tech handlers (L2339-2341)`,
`                            if n = "cryptotheology" then queueSourcesUnlocked <- Set.add "transcendenceUpgrades" queueSourcesUnlocked`,
`                            if n = "voidSpace" then queueSourcesUnlocked <- Set.add "voidSpace" queueSourcesUnlocked`,
`                            match t.Def.Unlocks with`].join("\n");
const n = t.split(from).length - 1;
if (n !== 1) { console.error("FAIL x" + n); process.exit(1); }
fs.writeFileSync(q, t.split(from).join(to));
console.log("ok afterload handlers");
