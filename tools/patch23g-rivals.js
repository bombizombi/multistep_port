#!/usr/bin/env node
"use strict";
const fs = require("fs");
const q = "kittens_land/src/Game/Game.Managers.fs";
let t = fs.readFileSync(q, "utf8");
const from = [
"            else",
"                let pool' = Game.Resources.payPrices calendarDay pool prices",
"                let sp1 = { sp with Policies = sp.Policies |> Map.add name { pol with Researched = true } }",
"                let sp2 = recalcPolicy bctx.Calc name sp1"].join("\n");
const to = [
"            else",
"                let pool' = Game.Resources.payPrices calendarDay pool prices",
"                let sp1 = { sp with Policies = sp.Policies |> Map.add name { pol with Researched = true } }",
"                // onPurchase: this policy permanently blocks its rivals",
"                let rivals = Game.Catalog.Policies.blocks |> Map.tryFind name |> Option.defaultValue []",
"                let sp1b =",
"                    rivals",
"                    |> List.fold (fun acc r0 ->",
"                        match acc.Policies |> Map.tryFind r0 with",
"                        | Some rp -> { acc with Policies = acc.Policies |> Map.add r0 { rp with Blocked = true } }",
"                        | None -> acc) sp1",
"                let sp2 = recalcPolicy bctx.Calc name sp1b"].join("\n");
if (t.split(from).length - 1 !== 1) { console.error("FAIL x" + (t.split(from).length - 1)); process.exit(1); }
fs.writeFileSync(q, t.split(from).join(to));
console.log("ok rivals blocked");
