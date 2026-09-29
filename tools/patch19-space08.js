#!/usr/bin/env node
"use strict";
// Batch-19 (space-08): per-building calculateEffects + energy-scaled space
// provider + upgrade fan-outs + live space save/snapshot sections.
const fs = require("fs");
function patch(path, edits) {
  let t = fs.readFileSync(path, "utf8");
  for (const [name, from, to, count] of edits) {
    const n = t.split(from).length - 1;
    if (n !== (count === undefined ? 1 : count)) {
      console.error(`FAIL ${path} "${name}": found ${n}, expected ${count === undefined ? 1 : count}`);
      process.exit(1);
    }
    t = t.split(from).join(to);
  }
  fs.writeFileSync(path, t);
  console.log(`ok ${path} (${edits.length} edits)`);
}

patch("oracle/runner/fs-runner/Program.fs", [
  // 1. SnapTuple: + spaceSnap (pre-formatted at checkpoint time)
  ["snaptuple-tail",
`        * ((string * (int * int * bool)) list * string option)
        * int * float * float`,
`        * ((string * (int * int * bool)) list * string option)
        * int * float * float
        * string // spaceSnap (space section JSON, formatted at checkpoint time)`],

  // 2. queueSources state + energy challenge readers + spaceGroup energy args
  ["spacegroup-energy",
`    let spacepRef = ref (Game.Space.init ()) // late-bound: synced in refreshCache/gtick
    let spaceGroup () = Game.Space.spaceGroup !spacepRef`,
`    let spacepRef = ref (Game.Space.init ()) // late-bound: synced in refreshCache/gtick
    let mutable queueSourcesUnlocked = set [ "buildings" ] // time.queue sources (js/time.js); "buildings" starts unlocked
    let energyChallengeResearched () = (match cpool.Challenges |> Map.tryFind "energy" with Some c -> c.Researched | None -> false)
    let energyChallengeActive () = (match cpool.Challenges |> Map.tryFind "energy" with Some c -> c.Active | None -> false)
    let spaceGroup () =
        Game.Space.spaceGroup pool.EnergyCons pool.EnergyProd
            (Game.Resources.getEnergyDelta (energyChallengeResearched ()) (energyChallengeActive ()) pool.EnergyProd pool.EnergyCons)
            !spacepRef`],

  // 3. uctx energy challenge flags (both construction sites)
  ["uctx-energy-flags",
`              EnergyChallengeResearched = false
              EnergyChallengeActive = false }`,
`              EnergyChallengeResearched = energyChallengeResearched ()
              EnergyChallengeActive = energyChallengeActive () }`,
   2],

  // 4. energydelta resop: real challenge flags
  ["energydelta-resop",
`RNum(getEnergyDelta false false pool.EnergyProd pool.EnergyCons)`,
`RNum(Game.Resources.getEnergyDelta (energyChallengeResearched ()) (energyChallengeActive ()) pool.EnergyProd pool.EnergyCons)`],

  // 5. calculateAllEffects: metaKeys space portion before chronoforge/voidSpace
  ["calltime-space",
`        toggle "calciner" (Game.Challenges.isActive cpool "blackSky")
        toggle "steamworks" (Game.Challenges.isActive cpool "pacifism")
        toggle "field" (Game.Challenges.isActive cpool "postApocalypse")
        let chronosphereOn = (Game.Buildings.get bpool "chronosphere" |> Option.map (fun b -> b.On) |> Option.defaultValue 0)`,
`        toggle "calciner" (Game.Challenges.isActive cpool "blackSky")
        toggle "steamworks" (Game.Challenges.isActive cpool "pacifism")
        toggle "field" (Game.Challenges.isActive cpool "postApocalypse")
        // calculateAllEffects: upgrade({buildings:[warehouse], spaceBuilding:[hydroponics]})
        // then metaKeys — space metas (programs, flat building map, planets)
        // sit between buildings and chronoforge/voidSpace
        upgradeMetas [ ("buildings", [ "warehouse" ]); ("spaceBuilding", [ "hydroponics" ]) ]
        upgradeMetas
            [ ("spaceMission", Game.Catalog.Space.programDefs |> List.map (fun d -> d.Name))
              ("spaceBuilding", Game.Catalog.Space.buildingDefs |> List.map (fun d -> d.Name))
              ("planet", Game.Catalog.Space.planetDefs |> List.map (fun d -> d.Name)) ]
        let chronosphereOn = (Game.Buildings.get bpool "chronosphere" |> Option.map (fun b -> b.On) |> Option.defaultValue 0)`],

  // 6. upgradeMetas + spaceCalcCtx after calculateAllTime
  ["upgrade-metas",
`        for name in List.rev tpool.CfuOrder do
            tpool <- Game.Time.cfuCalculate (timeCalcCtx ()) name tpool
        refreshCache ()


    // --- game-13: save/load core`,
`        for name in List.rev tpool.CfuOrder do
            tpool <- Game.Time.cfuCalculate (timeCalcCtx ()) name tpool
        refreshCache ()


    /// orig game.upgrade(list) (game.js): updateCaches; per type in list
    /// order, names REVERSED; calculateEffects XOR updateEffects per meta;
    /// spaceBuilding also runs cycleEffectsBasics; an empty name list aborts
    /// the whole call INCLUDING the trailing updateCaches (orig \`return\`).
    and upgradeMetas (list: (string * string list) list) : unit =
        refreshCache () // leading updateCaches
        let mutable aborted = false
        for (typ, names) in list do
            if aborted then ()
            elif names = [] then aborted <- true
            else
                for name in List.rev names do
                    match typ with
                    | "spaceBuilding" ->
                        let ctx = spaceCalcCtx ()
                        spacep <-
                            (if Game.Space.hasCalcEffects name then Game.Space.calculateEffects ctx name spacep
                             elif Game.Space.hasUpdateEffects name then Game.Space.updateEffects ctx name spacep
                             else spacep)
                        spacep <- Game.Space.cycleEffectsBasics ctx name spacep
                    | "challenges" ->
                        // challenge calculateEffects replicas: priceRules toggles
                        // (challenge effect values flow via the provider side)
                        if name = "blackSky" then
                            priceRulesExtra <- (if Game.Challenges.isActive cpool "blackSky" then Set.add "calciner" priceRulesExtra else Set.remove "calciner" priceRulesExtra)
                        elif name = "pacifism" then
                            priceRulesExtra <- (if Game.Challenges.isActive cpool "pacifism" then Set.add "steamworks" priceRulesExtra else Set.remove "steamworks" priceRulesExtra)
                        elif name = "postApocalypse" then
                            priceRulesExtra <- (if Game.Challenges.isActive cpool "postApocalypse" then Set.add "field" priceRulesExtra else Set.remove "field" priceRulesExtra)
                    | "planet" ->
                        // cath.calculateEffects (js/space.js L326-330)
                        if name = "cath" then
                            let rocketry = (match spool.Techs |> Map.tryFind "rocketry" with Some t -> t.Researched | None -> false)
                            if rocketry then queueSourcesUnlocked <- Set.add "spaceMission" queueSourcesUnlocked
                    | _ -> () // buildings/spaceMission/zigguratUpgrades/policies/upgrades: no observable meta recalc at this slice
        if not aborted then refreshCache () // trailing updateCaches

    /// space meta recalc context (js/space.js calculateEffects reads)
    and spaceCalcCtx () : Game.Space.SpaceCalcCtx =
        let wsRes (n: string) = (match wpool.Upgrades |> Map.tryFind n with Some u -> u.Researched | None -> false)
        let chAct (n: string) = (match cpool.Challenges |> Map.tryFind n with Some c -> c.Active | None -> false)
        let perkRes (n: string) = (match ppool.Perks |> Map.tryFind n with Some p -> p.Researched | None -> false)
        { GetEffect = fun n -> Game.Effects.getEffect cache n
          SolarSatellitesResearched = wsRes "solarSatellites"
          AmBasesResearched = wsRes "amBases"
          AiBasesResearched = wsRes "aiBases"
          BlackSkyActive = chAct "blackSky"
          DarkFutureYears = calendar.Year - 40000.0
          NumerologyActive = perkRes "numerology"
          NumerologyCycleMult = fun _ -> None // zodiac cycle mults land with the calendar-cycles unit
          AiCoreOn = (Game.Buildings.get bpool "aiCore" |> Option.map (fun b -> b.On) |> Option.defaultValue 0)
          RunUpgradeFanout = upgradeMetas }

    // --- game-13: save/load core`],

  // 7. sbuilding: full controller.build order
  ["sbuilding-handler",
`            if counter > 0 then
                let def = Game.Catalog.Space.buildingDefs |> List.find (fun d0 -> d0.Name = name)
                for pol in def.UnlocksPolicies do
                    match spool.Policies |> Map.tryFind pol with
                    | Some p0 -> spool <- { spool with Policies = spool.Policies |> Map.add pol { p0 with Unlocked = true } }
                    | None -> ()
                refreshCache ()
            else
                actionLog <- (m.Tick, "sbuilding", m.Args, RText "cannot-afford-or-locked") :: actionLog`,
`            if counter > 0 then
                let def = Game.Catalog.Space.buildingDefs |> List.find (fun d0 -> d0.Name = name)
                // controller.build order: breakIronWill; meta.unlocks;
                // meta.calculateEffects + cycleEffectsBasics; meta.upgrades
                // (updateEffects first, then game.upgrade). The full IW
                // fan-out (liberty/zebraOutpost recalcs) lands with the
                // IW-space scenario (space-12).
                if Game.Space.breakIronWill name then ironWill <- false
                for pol in def.UnlocksPolicies do
                    match spool.Policies |> Map.tryFind pol with
                    | Some p0 -> spool <- { spool with Policies = spool.Policies |> Map.add pol { p0 with Unlocked = true } }
                    | None -> ()
                if Game.Space.hasCalcEffects name then
                    spacep <- Game.Space.calculateEffects (spaceCalcCtx ()) name spacep
                    spacep <- Game.Space.cycleEffectsBasics (spaceCalcCtx ()) name spacep
                let ups = Game.Space.buildingUpgrades name
                if ups <> [] then
                    if Game.Space.hasUpdateEffects name then
                        spacep <- Game.Space.updateEffects (spaceCalcCtx ()) name spacep
                    upgradeMetas ups
                refreshCache ()
            else
                actionLog <- (m.Tick, "sbuilding", m.Args, RText "cannot-afford-or-locked") :: actionLog`],
]);

// 8. save: live space section (separate patch — long anchor)
{
  const q = "oracle/runner/fs-runner/Program.fs";
  let t = fs.readFileSync(q, "utf8");
  const start = t.indexOf('        // space.save (space-NN statics at this slice — metas match orig defaults)');
  const endMarker = `        arrEnd ()
        objEnd (); sb.Append "," |> ignore

        // time.save`;
  const end = t.indexOf(endMarker, start);
  if (start < 0 || end < 0) { console.error("FAIL save-space anchors"); process.exit(1); }
  const replacement = `        // space.save (js/space.js save): filterMetadata name/val/on/unlocked
        // + planets name/buildings/reached/unlocked/routeDays — live state
        key "space"; objStart ()
        key "hideResearched"; boolv false; sb.Append "," |> ignore
        key "programs"; arrStart ()
        let firstSp = ref true
        for pn in spacep.ProgramOrder do
            sep firstSp
            let m = spacep.Programs.[pn]
            objStart (); key "name"; str pn; sb.Append "," |> ignore; key "val"; intv m.Val; sb.Append "," |> ignore; key "on"; intv m.On; sb.Append "," |> ignore; key "unlocked"; boolv m.Unlocked; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "planets"; arrStart ()
        let firstPl = ref true
        for pn in spacep.PlanetOrder do
            sep firstPl
            let pl = spacep.Planets.[pn]
            objStart ()
            key "name"; str pn; sb.Append "," |> ignore
            key "buildings"; arrStart ()
            let firstPb = ref true
            for bn in Game.Catalog.Space.buildingDefs |> List.filter (fun d0 -> d0.Planet = pn) |> List.map (fun d0 -> d0.Name) do
                sep firstPb
                let m = spacep.Buildings.[bn]
                objStart (); key "name"; str bn; sb.Append "," |> ignore; key "val"; intv m.Val; sb.Append "," |> ignore; key "on"; intv m.On; sb.Append "," |> ignore; key "unlocked"; boolv m.Unlocked; objEnd ()
            arrEnd (); sb.Append "," |> ignore
            key "reached"; boolv pl.Reached; sb.Append "," |> ignore
            key "unlocked"; boolv pl.Unlocked; sb.Append "," |> ignore
            key "routeDays"; numv pl.RouteDays
            objEnd ()
` + endMarker;
  t = t.slice(0, start) + replacement + t.slice(end + endMarker.length);
  fs.writeFileSync(q, t);
  console.log("ok save-space section");
}

patch("oracle/runner/fs-runner/Program.fs", [
  // 9. queueSources: driven by unlock state
  ["qs-state",
`        let qs = [ "buildings", true; "tech", false; "upgrades", false; "policies", false; "embassies", false; "religion", false; "zebraUpgrades", false; "spaceMission", false; "spaceBuilding", false; "zigguratUpgrades", false; "transcendenceUpgrades", false; "chronoforge", false; "voidSpace", false ]`,
`        let qs =
            [ "buildings"; "tech"; "upgrades"; "policies"; "embassies"; "religion"; "zebraUpgrades";
              "spaceMission"; "spaceBuilding"; "zigguratUpgrades"; "transcendenceUpgrades"; "chronoforge"; "voidSpace" ]
            |> List.map (fun k -> (k, Set.contains k queueSourcesUnlocked))`],

  // 10. checkpoint: spaceSnap binding + tuple element
  ["spaceSnap-binding",
`        let observeSnap = calendar.ObserveRemainingTime
        let winterSnap = winterCatnipPerTick`,
`        let observeSnap = calendar.ObserveRemainingTime
        let winterSnap = winterCatnipPerTick
        let spaceSnap =
            let metaJson (n: string) (m: Game.Space.SpaceMeta) =
                sprintf "\\"%s\\":{\\"val\\":%d,\\"on\\":%d,\\"unlocked\\":%s}" (esc n) m.Val m.On (if m.Unlocked then "true" else "false")
            let progs = spacep.ProgramOrder |> List.map (fun n -> metaJson n spacep.Programs.[n]) |> String.concat ","
            let blds = spacep.BuildingOrder |> List.map (fun n -> metaJson n spacep.Buildings.[n]) |> String.concat ","
            let pls =
                spacep.PlanetOrder
                |> List.map (fun n ->
                    let pl = spacep.Planets.[n]
                    sprintf "\\"%s\\":{\\"reached\\":%s,\\"unlocked\\":%s,\\"routeDays\\":%s}" (esc n) (if pl.Reached then "true" else "false") (if pl.Unlocked then "true" else "false") (num pl.RouteDays))
                |> String.concat ","
            sprintf "{\\"programs\\":{%s},\\"buildings\\":{%s},\\"planets\\":{%s}}" progs blds pls`],
  ["checkpoint-tuple",
`         challengeSnap, pactSnap, reservesSnap, kittenSnap, timeSnap, voidSnap, observeSnap, winterSnap, vpool.Happiness)`,
`         challengeSnap, pactSnap, reservesSnap, kittenSnap, timeSnap, voidSnap, observeSnap, winterSnap, vpool.Happiness, spaceSnap)`],

  // 11. snapshotJson: signature + format + arg
  ["snapjson-sig",
`happiness: float): SnapTuple)`,
`happiness: float, spaceSnap: string): SnapTuple)`],
  ["snapjson-format",
`,\\"happiness\\":%s,\\"effects\\":{%s}}"`,
`,\\"happiness\\":%s,\\"effects\\":{%s},\\"space\\":%s}"`],
  ["snapjson-arg",
`        (num happiness)
        effectsJson`,
`        (num happiness)
        effectsJson
        spaceSnap`],
]);

// 12. orig-driver: matching snapshot space section
patch("oracle/runner/orig-driver.js", [
  ["snapshot-key",
`    resources, buildings, jobs, crafts, techs, upgrades, policies,`,
`    resources, buildings, space, jobs, crafts, techs, upgrades, policies,`],
  ["snapshot-const",
`  const kittenJobs = g.village.sim.kittens.map((k) => k.job || null).sort();
  return {`,
`  const space = {
    programs: Object.assign({}, ...g.space.programs.map((p) => ({ [p.name]: { val: p.val || 0, on: p.on || 0, unlocked: !!p.unlocked } }))),
    buildings: Object.assign({}, ...g.space.spaceBuildingsMap.map((b) => ({ [b.name]: { val: b.val || 0, on: b.on || 0, unlocked: !!b.unlocked } }))),
    planets: Object.assign({}, ...g.space.planets.map((p) => ({ [p.name]: { reached: !!p.reached, unlocked: !!p.unlocked, routeDays: p.routeDays } }))),
  };
  const kittenJobs = g.village.sim.kittens.map((k) => k.job || null).sort();
  return {`],
]);
console.log("patch19 done");
