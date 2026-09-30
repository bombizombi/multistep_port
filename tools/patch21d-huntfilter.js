#!/usr/bin/env node
"use strict";
// Batch-21d: wire the hunt console filter (hunt success msgs unlock it,
// js/village.js gainHuntRes → msg tag "hunt").
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const edits = [
  ["decl",
`    // console.filters["craft"].unlocked — set by the first craft msg (core.js L537)
    let mutable craftFilterUnlocked = false`,
`    // console.filters["craft"].unlocked — set by the first craftAll msg
    // (core.js L537); ["hunt"] unlocks on every hunt success msg
    let mutable craftFilterUnlocked = false
    let mutable huntFilterUnlocked = false`],
  ["hunt-unlock",
`            | "huntall" -> pool <- Game.Village.huntFraction hctx 1.0 pool
            | "hunthalf" -> pool <- Game.Village.huntFraction hctx 2.0 pool
            | "huntfifth" -> pool <- Game.Village.huntFraction hctx 5.0 pool
            | _ -> pool <- Game.Village.huntAll hctx pool`,
`            let manpowerBefore =
                (match Game.Resources.get pool "manpower" with Some m0 -> m0.Value | None -> 0.0)
            (match m.Args.[0] with
             | "huntall" -> pool <- Game.Village.huntFraction hctx 1.0 pool
             | "hunthalf" -> pool <- Game.Village.huntFraction hctx 2.0 pool
             | "huntfifth" -> pool <- Game.Village.huntFraction hctx 5.0 pool
             | _ -> pool <- Game.Village.huntAll hctx pool)
            // a successful hunt always emits the success msg with tag "hunt"
            // (js/village.js gainHuntRes tail) → unlocks the filter
            let manpowerAfter =
                (match Game.Resources.get pool "manpower" with Some m0 -> m0.Value | None -> 0.0)
            if manpowerAfter < manpowerBefore then huntFilterUnlocked <- true`],
  ["builder-hunt",
`        let filters = [ "astronomicalEvent"; "hunt"; "trade"; "craft"; "workshopAutomation"; "meteor"; "ivoryMeteor"; "unicornRift"; "unicornSacrifice"; "alicornRift"; "alicornSacrifice"; "alicornCorruption"; "tcShatter"; "tcRefine"; "faith"; "elders"; "blackcoin"; "festival"; "undo"; "explore"; "combat" ]
        let firstF = ref true
        for f0 in filters do
            sep firstF
            key f0; objStart (); key "unlocked"; boolv (f0 = "craft" && craftFilterUnlocked); sb.Append "," |> ignore; key "enabled"; boolv true; objEnd ()`,
`        let filters = [ "astronomicalEvent"; "hunt"; "trade"; "craft"; "workshopAutomation"; "meteor"; "ivoryMeteor"; "unicornRift"; "unicornSacrifice"; "alicornRift"; "alicornSacrifice"; "alicornCorruption"; "tcShatter"; "tcRefine"; "faith"; "elders"; "blackcoin"; "festival"; "undo"; "explore"; "combat" ]
        let firstF = ref true
        for f0 in filters do
            sep firstF
            let unl =
                (f0 = "craft" && craftFilterUnlocked) || (f0 = "hunt" && huntFilterUnlocked)
            key f0; objStart (); key "unlocked"; boolv unl; sb.Append "," |> ignore; key "enabled"; boolv true; objEnd ()`],
  ["loader-reset",
`            queueSourcesUnlocked <- set [ "buildings" ]
            craftFilterUnlocked <- false`,
`            queueSourcesUnlocked <- set [ "buildings" ]
            craftFilterUnlocked <- false
            huntFilterUnlocked <- false`],
];
for (const [name, from, to] of edits) {
  if (t.split(from).length - 1 !== 1) { console.error("FAIL " + name); process.exit(1); }
  t = t.split(from).join(to);
}
fs.writeFileSync(q, t);
console.log("ok hunt filter");
