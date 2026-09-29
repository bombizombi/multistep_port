#!/usr/bin/env node
"use strict";
// Batch-14 patch C: runner wiring (researchChallengeFull, vsu move, unjam).
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");

// 1. calCtx OnNewSeasonTail
t = t.replace(
`          OnFlux = fun delta -> tpool <- { tpool with Flux = tpool.Flux + delta }`,
`          OnFlux = fun delta -> tpool <- { tpool with Flux = tpool.Flux + delta }
          // calendar-08 steamworks autumn unjam (js/calendar.js L951-953)
          OnNewSeasonTail =
            fun st ->
                if st.Season = 2
                   && (match wpool.Upgrades |> Map.tryFind "advancedAutomation" with Some u -> u.Researched | None -> false) then
                    steamworksJammed <- false
                st`);

// 2. researchChallengeFull in the chain
t = t.replace(
`    /// orig updateModel (game.js L4487-4521): one model pass.
    and updateModelBody () =`,
`    /// researchChallenge full runner tail: actionOnCompletion dispatch, unlock
    /// fan-out, calculateAllEffects (js/challenges.js L654-673).
    and researchChallengeFull (name: string) : unit =
        let c = cpool.Challenges.[name]
        if c.Active then
            cpool <- Game.Challenges.researchChallenge name cpool
            if name = "postApocalypse" then
                // actionOnCompletion: fakeBought resets (0 at this slice) +
                // pollutionDissipationRatio restore (pollution seam); the two
                // end-game policies unlock ONLY after winning the challenge
                for pol in ["terraformingInsight"; "cryochamberExtraction"] do
                    match spool.Policies |> Map.tryFind pol with
                    | Some p -> spool <- { spool with Policies = spool.Policies |> Map.add pol { p with Unlocked = true } }
                    | None -> ()
            if name = "1000Years" then
                let mm = tpool.CFUs.["temporalPress"]
                tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalPress" { mm with Unlocked = true } }
            calculateAllTime ()

    /// orig updateModel (game.js L4487-4521): one model pass.
    and updateModelBody () =`);

// 3. research sites -> researchChallengeFull
t = t.replace(
`        if c1000.Active && calendar.Year >= 1000.0 then
            cpool <- Game.Challenges.researchChallenge "1000Years" cpool
            // researchChallenge tail: unlock(unlocks {chronoforge: [temporalPress]})
            let pressM = tpool.CFUs.["temporalPress"]
            tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalPress" { pressM with Unlocked = true } }
            calculateAllTime ()`,
`        if c1000.Active && calendar.Year >= 1000.0 then
            researchChallengeFull "1000Years"`);

// 4. setchallenge complete site
t = t.replace(
`                | "complete" ->
                    cpool <- Game.Challenges.researchChallenge name cpool
                    // researchChallenge tail: unlock(unlocks) + calculateAllEffects
                    // (1000Years is the only challenge unlocking chronoforge here)
                    if name = "1000Years" then
                        let mm = tpool.CFUs.["temporalPress"]
                        tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalPress" { mm with Unlocked = true } }
                    calculateAllTime ()`,
`                | "complete" -> researchChallengeFull name`);

// 5. calculateAllTime: VSU pass before CFUs
t = t.replace(
`        for name in List.rev tpool.CfuOrder do
            tpool <- Game.Time.cfuCalculate (timeCalcCtx ()) name tpool
        refreshCache ()`,
`        let chronosphereOn = (Game.Buildings.get bpool "chronosphere" |> Option.map (fun b -> b.On) |> Option.defaultValue 0)
        tpool <- Game.Time.vsuCalculate tpool chronosphereOn (Game.Effects.getEffect cache)
        for name in List.rev tpool.CfuOrder do
            tpool <- Game.Time.cfuCalculate (timeCalcCtx ()) name tpool
        refreshCache ()`);

// 6. vsu move handler
t = t.replace(
`        | other -> actionLog <- (m.Tick, other, m.Args, RNone) :: actionLog

    // scenario run loop`,
`        | "vsu" ->
            // VoidSpaceBtnController.build(model, 1) + breakIronWill/calc/undo
            let name = m.Args.[0]
            let burnRatio = Game.Prestige.getBurnedParagonRatio (Game.Effects.getEffect cache) (getResValue "paragon") (getResValue "burnedParagon")
            let tp2, pool2, counter = Game.Time.buyVSU calendarDay name 1 burnRatio tpool pool
            tpool <- tp2
            pool <- pool2
            if counter > 0 then
                let def = Game.Time.vsuDef name
                if name = "cryochambers" && def.BreaksIronWill then
                    // meta.breakIronWill (core.js build tail)
                    ironWill <- false
                    wpool <-
                        (wpool, ["huntingArmor"; "bolas"; "compositeBow"])
                        ||> List.fold (fun acc up ->
                            match acc.Upgrades |> Map.tryFind up with
                            | Some u -> { acc with Upgrades = acc.Upgrades |> Map.add up { u with Unlocked = true } }
                            | None -> acc)
                    match spool.Policies |> Map.tryFind "sharkRelationsBotanists" with
                    | Some p -> spool <- { spool with Policies = spool.Policies |> Map.add "sharkRelationsBotanists" { p with Unlocked = true } }
                    | None -> ()
                if name = "cryochambers" then
                    let m' = tpool.VSUs.["cryochambers"]
                    tpool <- { tpool with VSUs = tpool.VSUs |> Map.add "cryochambers" { m' with Unlocked = true } }
                let chronosphereOn = (Game.Buildings.get bpool "chronosphere" |> Option.map (fun b -> b.On) |> Option.defaultValue 0)
                tpool <- Game.Time.vsuCalculate tpool chronosphereOn (Game.Effects.getEffect cache)
                undoChange <-
                    Some({ Ttl = 100
                           Events =
                               [ { ManagerId = "time"
                                   Data = Game.Types.VSUUndo(name, tpool.VSUs.[name].Val - counter) } ] })
                refreshCache ()
            else
                actionLog <- (m.Tick, "vsu", m.Args, RText "cannot-afford-or-locked") :: actionLog
        | other -> actionLog <- (m.Tick, other, m.Args, RNone) :: actionLog

    // scenario run loop`);

// 7. VSUUndo case in undo dispatch
t = t.replace(
`                    | Game.Types.CFUUndo(metaId, endVal) ->`,
`                    | Game.Types.VSUUndo(metaId, endVal) ->
                        let burnRatio = Game.Prestige.getBurnedParagonRatio (Game.Effects.getEffect cache) (getResValue "paragon") (getResValue "burnedParagon")
                        let tp2, p2, sold = Game.Time.sellVSU calendarDay metaId endVal burnRatio tpoolU poolU
                        tpoolU <- tp2
                        poolU <- p2
                        if sold = 0 then ok <- false
                    | Game.Types.CFUUndo(metaId, endVal) ->`);

fs.writeFileSync(q, t);
console.log("patch C applied");
