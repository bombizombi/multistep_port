#!/usr/bin/env node
"use strict";
// Batch-19b: craft move failure logging parity (orig driver logs
// "gained X/Y (affordBefore=…, prices=…)" when nothing/partial is gained).
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");

const from = `        | "craft" ->
            let craftName = m.Args.[0]
            let amt = float m.Args.[1]
            // orig craft registers the undo with prices at the PRE-buy ladder
            let craftDef = wpool.Crafts.[craftName]
            let prices = Game.Managers.getCraftPrice cache (traditionResearched ()) craftDef.Def |> List.map (fun p -> (p.Resource, p.Val * ceil amt))
            let pool', wpool', ok = Game.Managers.craft calendarDay cache (traditionResearched ()) (crctx ()) craftName amt pool wpool
            pool <- pool'
            wpool <- wpool'
            if ok then
                craftFilterUnlocked <- true
                stpool <- Game.Stats.bumpStat "totalCrafts" 1.0 stpool
                stpool <- Game.Stats.bumpStatCurrent "totalCrafts" 1.0 stpool
                let gained = (1.0 + Game.Managers.getResCraftRatio cache (crctx ()) craftName) * ceil amt
                registerUndo [ { ManagerId = "workshop"; Data = Game.Types.CraftUndo(craftName, gained, prices) } ]
            refreshCache () // orig game.craft → workshop.craft + updateResources (unconditional)`;

const to = `        | "craft" ->
            let craftName = m.Args.[0]
            let amt = float m.Args.[1]
            // orig craft registers the undo with prices at the PRE-buy ladder
            let craftDef = wpool.Crafts.[craftName]
            let basePrices = Game.Managers.getCraftPrice cache (traditionResearched ()) craftDef.Def
            let prices = basePrices |> List.map (fun p -> (p.Resource, p.Val * ceil amt))
            // move-probe parity: affordBefore reads the RAW-n prices
            let affordBefore = (match Game.Resources.hasRes pool (basePrices |> List.map (fun p -> (p.Resource, p.Val * amt))) 0.0 with true -> true | _ -> false)
            let valueBefore = (match Game.Resources.get pool craftName with Some r -> r.Value | None -> 0.0)
            let pool', wpool', ok = Game.Managers.craft calendarDay cache (traditionResearched ()) (crctx ()) craftName amt pool wpool
            pool <- pool'
            wpool <- wpool'
            if ok then
                craftFilterUnlocked <- true
                stpool <- Game.Stats.bumpStat "totalCrafts" 1.0 stpool
                stpool <- Game.Stats.bumpStatCurrent "totalCrafts" 1.0 stpool
                let gained = (1.0 + Game.Managers.getResCraftRatio cache (crctx ()) craftName) * ceil amt
                registerUndo [ { ManagerId = "workshop"; Data = Game.Types.CraftUndo(craftName, gained, prices) } ]
            let gainedActual = (match Game.Resources.get pool craftName with Some r -> r.Value | None -> 0.0) - valueBefore
            if not affordBefore || gainedActual < amt then
                let pj =
                    basePrices
                    |> List.map (fun p -> sprintf "{\\"name\\":\\"%s\\",\\"val\\":%s}" (esc p.Resource) (num (p.Val * amt)))
                    |> String.concat ","
                actionLog <-
                    (m.Tick, "craft", m.Args,
                     RText(sprintf "gained %s/%s (affordBefore=%s, prices=[%s])" (num gainedActual) (num amt) (if affordBefore then "true" else "false") pj))
                    :: actionLog
            refreshCache () // orig game.craft → workshop.craft + updateResources (unconditional)`;

if (t.split(from).length - 1 !== 1) { console.error("anchor fail"); process.exit(1); }
fs.writeFileSync(q, t.split(from).join(to));
console.log("ok craft log parity");
