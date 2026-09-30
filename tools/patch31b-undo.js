#!/usr/bin/env node
"use strict";
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const edits = [
  // spacepU binding
  ["spacepu",
`                let mutable dpU = dp
                let mutable tpoolU = tpool
                let mutable ok = true`,
`                let mutable dpU = dp
                let mutable tpoolU = tpool
                let mutable spacepU = spacep
                let mutable ok = true`],
  // SpaceUndo case after TradeUndo
  ["spaceundo",
`                    | Game.Types.TradeUndo(trades, spent, gainedLst) ->
                        let dp2, p2, okT = Game.Diplomacy.undoTrade calendarDay trades spent gainedLst poolU dpU
                        dpU <- dp2; poolU <- p2`,
`                    | Game.Types.SpaceUndo(undoAction, metaId, count) ->
                        // space.undo (js/space.js L1267-1281): build = full refund
                        // at the CURRENT ladder; sell re-adds the units
                        let mutable refundedAny = false
                        let refundPct = if undoAction = "build" then 1.0 else 0.0
                        for _ in 1..count do
                            let sp2, p2, sold = Game.Space.sellOne calendarDay metaId poolU refundPct spacepU
                            if sold then spacepU <- sp2; poolU <- p2; refundedAny <- true
                        if not refundedAny then ok <- false`],
  // commit-back: find where tpoolU is committed and add spacepU
];
for (const [name, from, to] of edits) {
  const n = t.split(from).length - 1;
  if (n !== 1) { console.error("FAIL " + name + " x" + n); process.exit(1); }
  t = t.split(from).join(to);
}
fs.writeFileSync(q, t);
console.log("ok undo hooks");
