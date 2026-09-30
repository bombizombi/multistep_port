#!/usr/bin/env node
"use strict";
// Batch-31 (space-11): SpaceUndo (build full refund, sell un-refund) +
// village-14/15 evidence via the existing map/fauna skeleton + explore.
const fs = require("fs");

// Types: SpaceUndo
{
  const q = "kittens_land/src/Game/Game.Types.fs";
  let t = fs.readFileSync(q, "utf8");
  const from = `    | TradeUndo of trades: float * spent: (string * float) list * gained: (string * float) list`;
  const to = `    | TradeUndo of trades: float * spent: (string * float) list * gained: (string * float) list
    | SpaceUndo of action: string * metaId: string * val_: int      // space.undo (build 100% refund / sell re-gain)`;
  if (t.split(from).length - 1 !== 1) { console.error("FAIL types x" + (t.split(from).length - 1)); process.exit(1); }
  fs.writeFileSync(q, t.split(from).join(to));
  console.log("ok types");
}
console.log("patch31 types only");
