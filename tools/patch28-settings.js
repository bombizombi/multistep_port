#!/usr/bin/env node
"use strict";
// Batch-28 (settings-01/02/03 + config-01): opts state in the runner —
// builder emits from state, loader parses game.opts, setopt resop with hodl
// onChange → sellBcoin.
const fs = require("fs");

// fsproj entries (Settings module before Managers — standalone though)
for (const [q, ref] of [
  ["oracle/runner/fs-runner/fs-runner.fsproj", `../../../kittens_land/src/Game/Game.Settings.fs`],
  ["kittens_land/kittens_land.fsproj", `src/Game/Game.Settings.fs`],
]) {
  let t = fs.readFileSync(q, "utf8");
  if (t.includes("Game.Settings.fs")) { console.log("fsproj already: " + q); continue; }
  // insert right after the Game.Types line
  const lines = t.split("\n");
  const idx = lines.findIndex(l => l.includes("Game.Types.fs"));
  if (idx < 0) { console.error("no types line in " + q); process.exit(1); }
  const prefix = lines[idx].match(/^\s*/)[0];
  lines.splice(idx, 0, prefix + `<Compile Include="` + ref + `"/>`);
  fs.writeFileSync(q, lines.join("\n"));
  console.log("ok fsproj " + q);
}

// Runner: opts state + builder + loader + resop
{
  const q = "oracle/runner/fs-runner/Program.fs";
  let t = fs.readFileSync(q, "utf8");
  const edits = [
    ["opts-state",
`    // buildings-10: bld.cathPollution / cathPollutionPerTick (js/buildings.js)
    let mutable cathPollution = 0.0
    let mutable cathPollutionPerTick = 0.0`,
`    // buildings-10: bld.cathPollution / cathPollutionPerTick (js/buildings.js)
    let mutable cathPollution = 0.0
    let mutable cathPollutionPerTick = 0.0
    // settings-01/02: game.opts (booleans + notation + batchSize)
    let mutable opts = Game.Settings.freshOpts ()`],
    ["builder-from-state",
`        key "opts"; objStart ()
        let opts = [
            "notation", "\\"si\\""; "batchSize", "10"; "useWorkers", "true"; "forceHighPrecision", "false";
            "usePerSecondValues", "true"; "usePercentageResourceValues", "false"; "showNonApplicableButtons", "false";
            "usePercentageConsumptionValues", "false"; "highlightUnavailable", "true"; "hideSell", "false";
            "hideDowngrade", "false"; "hideBGImage", "false"; "tooltipsInRightColumn", "false"; "noConfirm", "false";
            "IWSmelter", "true"; "disableTelemetry", "false"; "enableRedshift", "false"; "disablePollution", "false";
            "enableRedshiftGflops", "false"; "useLegacyTwoInRowLayout", "false"; "useSwipeNavigation", "false";
            "ksEnabled", "false"; "forceLZ", "false"; "compressSaveFile", "false"; "hodl", "true"; "disableCMBR", "false"
        ]
        let firstO = ref true
        for on, ov in opts do
            sep firstO
            key on; raw ov
        objEnd ()`,
`        key "opts"; objStart ()
        // settings-01: emission from the live opts state in settingsArr order
        let optsRows =
            [
              yield ("notation", "\\"" + opts.Notation + "\\"")
              yield ("batchSize", num opts.BatchSize)
              for s in Game.Settings.settingsArr do
                  yield (s.Name, if opts.Bools.[s.Name] then "true" else "false")
            ]
        let firstO = ref true
        for on, ov in optsRows do
            sep firstO
            key on; raw ov
        objEnd ()`],
    ["loader-opts",
`            // game.save tail: karmaKittens / ironWill / deadKittens
            (match jget root "game" with
             | Some (JObj gv) ->
                 let karma = (jnumF (jget gv "karmaKittens") |> Option.defaultValue 0.0) |> int
                 pool <- { pool with KarmaKittens = karma }
                 ironWill <- jboolF (jget gv "ironWill") |> Option.defaultValue true`,
`            // game.save tail: karmaKittens / ironWill / deadKittens + opts
            (match jget root "game" with
             | Some (JObj gv) ->
                 let karma = (jnumF (jget gv "karmaKittens") |> Option.defaultValue 0.0) |> int
                 pool <- { pool with KarmaKittens = karma }
                 ironWill <- jboolF (jget gv "ironWill") |> Option.defaultValue true
                 // game.opts (js/game.js L3146-3164): copy all; defaults for
                 // tooltipsInRightColumn/fontSize; hodl opt-out for old saves
                 (match jget gv "opts" with
                  | Some (JObj ov) ->
                      for (k, v) in ov do
                          match v with
                          | JBool b when opts.Bools |> Map.containsKey k ->
                              opts <- { opts with Bools = opts.Bools |> Map.add k b }
                          | JStr s when k = "notation" -> opts <- { opts with Notation = s }
                          | JNum f when k = "batchSize" -> opts <- { opts with BatchSize = f }
                          | _ -> ()
                      if not (ov |> List.exists (fun (k, _) -> k = "tooltipsInRightColumn")) then
                          opts <- { opts with Bools = opts.Bools |> Map.add "tooltipsInRightColumn" false }
                      if not (ov |> List.exists (fun (k, _) -> k = "hodl")) then
                          opts <- { opts with Bools = opts.Bools |> Map.add "hodl" false }
                  | None ->
                      // no opts at all → hodl forced false (opt-out)
                      opts <- { opts with Bools = opts.Bools |> Map.add "hodl" false })`,
],
    ["reset-opts",
`            prodOverrides <- Map.empty
            lastLimits <- Map.empty`,
`            prodOverrides <- Map.empty
            lastLimits <- Map.empty
            opts <- Game.Settings.freshOpts ()`],
    ["setopt-resop",
`            | [ "esprobe" ] ->`,
`            | [ "setopt"; optName; valueArg ] ->
                // SettingsManager.set with the hodl onChange → sellBcoin
                let value = valueArg = "true"
                let cryptoPrice = calendar.CryptoPrice
                let opts', fireHodl = Game.Settings.setBool optName value opts
                opts <- opts'
                (match fireHodl with
                 | Some oldHodl ->
                     // diplomacy.sellBcoin(oldHodl): blackcoin × getCryptoPrice(hodl) → relic
                     let price = if oldHodl then 63918.0 else cryptoPrice // server.bcoinPrice (storage form)
                     let stash = (match get pool "blackcoin" with Some r -> r.Value | None -> 0.0)
                     let amt = stash * price
                     let pool1, _ = Game.Resources.addResEvent calendarDay "relic" amt pool
                     pool <- pool1
                     let bc = pool.ByName["blackcoin"]
                     pool <- { pool with ByName = pool.ByName |> Map.add "blackcoin" { bc with Value = 0.0 } }
                 | None -> ())
                actionLog <- (curLogTick, "resop", m.Args, RNum 0.0) :: actionLog
            | [ "getopt"; optName ] ->
                actionLog <- (curLogTick, "resop", m.Args, RBool opts.Bools.[optName]) :: actionLog
            | [ "esprobe" ] ->`],
  ];
  for (const [name, from, to] of edits) {
    const n = t.split(from).length - 1;
    if (n !== 1) { console.error("FAIL " + name + " x" + n); process.exit(1); }
    t = t.split(from).join(to);
  }
  fs.writeFileSync(q, t);
  console.log("ok runner opts");
}
console.log("patch28 done");
