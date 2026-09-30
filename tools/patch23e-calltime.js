#!/usr/bin/env node
"use strict";
// calculateAllTime: policies recalc pass (orig metaKeys policies, reversed)
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");
const from = `        upgradeMetas [ ("buildings", [ "warehouse" ]); ("spaceBuilding", [ "hydroponics" ]) ]
        upgradeMetas
            [ ("spaceMission", Game.Catalog.Space.programDefs |> List.map (fun d -> d.Name))
              ("spaceBuilding", Game.Catalog.Space.buildingDefs |> List.map (fun d -> d.Name))
              ("planet", Game.Catalog.Space.planetDefs |> List.map (fun d -> d.Name)) ]`;
const to = `        upgradeMetas [ ("buildings", [ "warehouse" ]); ("spaceBuilding", [ "hydroponics" ]) ]
        upgradeMetas
            [ ("spaceMission", Game.Catalog.Space.programDefs |> List.map (fun d -> d.Name))
              ("spaceBuilding", Game.Catalog.Space.buildingDefs |> List.map (fun d -> d.Name))
              ("planet", Game.Catalog.Space.planetDefs |> List.map (fun d -> d.Name)) ]
        // metaKeys policies (reversed): recalc researched policy effects
        for n in List.rev spool.PolicyOrder do
            spool <- Game.Managers.recalcPolicy (scienceCalcCtx ()) n spool`;
if (t.split(from).length - 1 !== 1) { console.error("FAIL x" + (t.split(from).length - 1)); process.exit(1); }
fs.writeFileSync(q, t.split(from).join(to));
console.log("ok calltime policies");
