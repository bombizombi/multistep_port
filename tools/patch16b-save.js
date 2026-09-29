#!/usr/bin/env node
"use strict";
// Batch-16b: the full save builder body.
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");

const anchor = `    let mutable saveDataBuilder: (unit -> string) option = None
`;
if (!t.includes(anchor)) { console.error("scaffold anchor missing"); process.exit(1); }

const body = anchor + `
    /// game-13 _saveDataToString: JSON.stringify(saveData, JSONreplacer) with
    /// orig key insertion order (undefined keys dropped). No LZ at <5mb.
    let buildSaveString () : unit =
        let sb = System.Text.StringBuilder()
        let inline key (k: string) = sb.Append("\\"").Append(k).Append("\\":") |> ignore
        let inline raw (v: string) = sb.Append v |> ignore
        let inline str (v: string) = sb.Append(jsonStr v) |> ignore
        let inline numv (v: float) = sb.Append(num v) |> ignore
        let inline intv (v: int) = sb.Append(string v) |> ignore
        let inline boolv (v: bool) = sb.Append(if v then "true" else "false") |> ignore
        let inline sep (first: bool ref) = if not first.contents then sb.Append "," |> ignore; first.contents <- false
        let inline objStart () = sb.Append "{" |> ignore
        let inline objEnd () = sb.Append "}" |> ignore
        let inline arrStart () = sb.Append "[" |> ignore
        let inline arrEnd () = sb.Append "]" |> ignore

        objStart ()
        key "saveVersion"; intv 15; sb.Append "," |> ignore
        // server.save: motdContent undefined at this slice → dropped
        key "server"; objStart (); key "bcoinPrice"; numv 63918.0; objEnd (); sb.Append "," |> ignore

        // resPool.save
        key "resources"; arrStart ()
        let mutable firstR = true
        for n in pool.Order do
            sep &firstR
            objStart ()
            key "name"; str n; sb.Append "," |> ignore
            let r = pool.ByName[n]
            key "value"; numv r.Value; sb.Append "," |> ignore
            key "unlocked"; boolv r.Unlocked; sb.Append "," |> ignore
            key "isHidden"; boolv false
            if n = "wood" then sb.Append "," |> ignore; key "isHiddenFromCrafting"; boolv false
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "res"; objStart (); key "isLocked"; boolv false; objEnd (); sb.Append "," |> ignore

        // village.save
        key "village"; objStart ()
        key "kittens"; arrStart ()
        let jobNames = Game.Catalog.Village.jobDefs |> List.map (fun j -> j.Name)
        let firstK = true
        let _ = firstK
        for k in vpool.Kittens do
            objStart ()
            // saveCompressed: skills array (or single int when uniform)
            let skillsVals = jobNames |> List.map (fun j -> k.Skills |> Map.tryFind j |> Option.defaultValue 0.0 |> Game.Math.jsRoundX1)
            let mn = List.min skillsVals
            let mx = List.max skillsVals
            key "skills"
            if mn = mx then
                // JS: skills = maxSkill (the scalar); || undefined drops 0
                if mx <> 0.0 then numv mx
                else raw "undefined-unused" |> ignore; raw "" |> ignore
                // scalar 0 → falsy → key dropped: emulate by emitting nothing
                ()
            else
                arrStart ()
                (skillsVals |> List.iteri (fun i v -> if i > 0 then sb.Append "," |> ignore; numv v))
                arrEnd ()
            sb.Append "," |> ignore
            key "exp"
            if k.Exp <> 0.0 then numv (Game.Math.jsRoundX1 k.Exp) else raw "0" |> ignore; ()
            sb.Append "," |> ignore
            key "job"
            (match k.Job with
             | Some j -> intv (jobNames |> List.findIndex (fun x -> x = j))
             | None -> raw "undefined-unused" |> ignore)
            sb.Append "," |> ignore
            key "engineerSpeciality"
            (match k.EngineerSpeciality with
             | Some sp -> str sp
             | None -> raw "undefined-unused" |> ignore)
            sb.Append "," |> ignore
            key "rank"
            if k.Rank <> 0 then intv k.Rank else raw "0" |> ignore; ()
            sb.Append "," |> ignore
            key "combatExp"
            raw "undefined-unused" |> ignore
            sb.Append "," |> ignore
            key "isLeader"
            if k.IsLeader then boolv true else raw "undefined-unused" |> ignore
            sb.Append "," |> ignore
            key "isAdopted"; raw "undefined-unused" |> ignore
            sb.Append "," |> ignore
            key "favorite"; raw "undefined-unused" |> ignore
            sb.Append "," |> ignore
            if k.Seed <> 0 then key "seed"; intv k.Seed; sb.Append "," |> ignore
            let nameIdx = Game.Catalog.Village.names |> List.tryFindIndex (fun x -> x = k.Name)
            let surnameIdx = Game.Catalog.Village.surnames |> List.tryFindIndex (fun x -> x = k.Surname)
            key "ssn"; intv (Game.Managers.mergeSSN [ (nameIdx |> Option.defaultValue 0); (surnameIdx |> Option.defaultValue 0); int k.Age; (Game.Catalog.Village.traitDefs |> List.indexed |> List.tryFind (fun (_, td) -> td.Name = k.Trait) |> Option.map fst |> Option.defaultValue 0); k.Color; k.Variety; k.Rarity ])
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "maxKittens"; intv vpool.MaxKittens; sb.Append "," |> ignore
        key "jobs"; arrStart ()
        let mutable firstJ = true
        for jd in Game.Catalog.Village.jobDefs do
            sep &firstJ
            objStart ()
            key "name"; str jd.Name; sb.Append "," |> ignore
            key "unlocked"; boolv (vpool.JobUnlocked.Contains jd.Name); sb.Append "," |> ignore
            key "value"; intv (vpool.JobValues |> Map.tryFind jd.Name |> Option.defaultValue 0)
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "biomes"; arrStart ()
        let biomeUnlocked = [ "village", true; "plains", true; "hills", false; "forest", true; "boneForest", false; "rainForest", false; "mountain", false; "volcano", false; "desert", false; "bloodDesert", false; "swamp", false; "cath", true; "redmoon", false ]
        let mutable firstB = true
        for bn, bu in biomeUnlocked do
            sep &firstB
            objStart (); key "name"; str bn; sb.Append "," |> ignore; key "unlocked"; boolv bu; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "hadKittenHunters"; boolv false; sb.Append "," |> ignore
        key "nextKittenProgress"; numv vpool.NextKittenProgress; sb.Append "," |> ignore
        key "map"; objStart (); key "hqLevel"; intv 0; sb.Append "," |> ignore; key "energy"; numv 70.0; sb.Append "," |> ignore; key "explorersLevel"; intv 0; objEnd (); sb.Append "," |> ignore
        key "loadouts"; arrStart (); arrEnd ()
        objEnd (); sb.Append "," |> ignore

        // calendar.save
        key "calendar"; objStart ()
        key "year"; numv calendar.Year; sb.Append "," |> ignore
        key "day"; numv calendar.Day; sb.Append "," |> ignore
        key "season"; intv calendar.Season; sb.Append "," |> ignore
        (match calendar.Weather with
         | Some w0 -> key "weather"; str w0; sb.Append "," |> ignore
         | None -> ())
        key "festivalDays"; intv calendar.FestivalDays; sb.Append "," |> ignore
        key "cycle"; intv calendar.Cycle; sb.Append "," |> ignore
        key "cycleYear"; intv calendar.CycleYear; sb.Append "," |> ignore
        key "futureSeasonTemporalParadox"; intv (-1); sb.Append "," |> ignore
        key "cryptoPrice"; numv calendar.CryptoPrice
        objEnd (); sb.Append "," |> ignore

        // console.save: static filter table
        key "console"; objStart (); key "filters"; objStart ()
        let filters = [ "astronomicalEvent"; "hunt"; "trade"; "craft"; "workshopAutomation"; "meteor"; "ivoryMeteor"; "unicornRift"; "unicornSacrifice"; "alicornRift"; "alicornSacrifice"; "alicornCorruption"; "tcShatter"; "tcRefine"; "faith"; "elders"; "blackcoin"; "festival"; "undo"; "explore"; "combat" ]
        let mutable firstF = true
        for f0 in filters do
            sep &firstF
            key f0; objStart (); key "unlocked"; boolv false; sb.Append "," |> ignore; key "enabled"; boolv true; objEnd ()
        objEnd (); objEnd (); sb.Append "," |> ignore

        key "telemetry"; objStart (); key "guid"; str telemetryGuid; objEnd (); sb.Append "," |> ignore

        // challenges.save
        key "challenges"; objStart (); key "challenges"; arrStart ()
        let mutable firstC = true
        for n in cpool.Order do
            sep &firstC
            let c = cpool.Challenges.[n]
            objStart ()
            key "name"; str n; sb.Append "," |> ignore
            key "researched"; boolv c.Researched; sb.Append "," |> ignore
            key "on"; intv c.On; sb.Append "," |> ignore
            key "unlocked"; boolv c.Unlocked; sb.Append "," |> ignore
            key "active"; boolv c.Active
            objEnd ()
        arrEnd (); objEnd (); sb.Append "," |> ignore

        // workshop.save
        key "workshop"; objStart ()
        key "hideResearched"; boolv false; sb.Append "," |> ignore
        key "upgrades"; arrStart ()
        let mutable firstU = true
        for n in wpool.UpgradeOrder do
            sep &firstU
            let u = wpool.Upgrades.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv u.Unlocked; sb.Append "," |> ignore; key "researched"; boolv u.Researched; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "crafts"; arrStart ()
        let mutable firstCr = true
        for n in wpool.CraftOrder do
            sep &firstCr
            let c = wpool.Crafts.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv c.Unlocked; sb.Append "," |> ignore; key "value"; numv c.Value; sb.Append "," |> ignore; key "progress"; numv c.Progress; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "zebraUpgrades"; arrStart ()
        let mutable firstZ = true
        for n in wpool.ZebraOrder do
            sep &firstZ
            let u = wpool.ZebraUpgrades.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv u.Unlocked; sb.Append "," |> ignore; key "researched"; boolv u.Researched; objEnd ()
        arrEnd ()
        objEnd (); sb.Append "," |> ignore

        // diplomacy.save
        key "diplomacy"; objStart (); key "races"; arrStart ()
        let mutable firstD = true
        for n in dp.RaceOrder do
            sep &firstD
            let r = dp.Races.[n]
            objStart ()
            key "name"; str n; sb.Append "," |> ignore
            key "embassyLevel"; intv r.EmbassyLevel; sb.Append "," |> ignore
            key "unlocked"; boolv r.Unlocked; sb.Append "," |> ignore
            key "collapsed"; boolv false; sb.Append "," |> ignore
            key "energy"; numv r.Energy; sb.Append "," |> ignore
            key "duration"; numv r.Duration; sb.Append "," |> ignore
            key "pinned"; boolv false
            objEnd ()
        arrEnd (); objEnd (); sb.Append "," |> ignore

        // buildings.save: val/on dropped at 0, unlocked/jammed dropped at false
        key "buildings"; arrStart ()
        let mutable firstBld = true
        for n in bpool.Order do
            sep &firstBld
            let b = bpool.ByName[n]
            objStart ()
            key "name"; str n
            if b.Def.Stages.Length > 0 then sb.Append "," |> ignore; key "stage"; intv b.Stage
            if b.Val <> 0 then sb.Append "," |> ignore; key "val"; intv b.Val
            if b.On <> 0 then sb.Append "," |> ignore; key "on"; intv b.On
            if b.Unlocked then sb.Append "," |> ignore; key "unlocked"; boolv true
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "bldData"; objStart (); key "groupBuildings"; boolv false; sb.Append "," |> ignore; key "twoRows"; boolv false; objEnd (); sb.Append "," |> ignore
        key "cathPollution"; numv 0.0; sb.Append "," |> ignore

        // science.save
        key "science"; objStart ()
        key "hideResearched"; boolv false; sb.Append "," |> ignore
        key "policyToggleResearched"; boolv false; sb.Append "," |> ignore
        key "policyToggleBlocked"; boolv false; sb.Append "," |> ignore
        key "techs"; arrStart ()
        let mutable firstT = true
        for n in spool.TechOrder do
            sep &firstT
            let tc = spool.Techs.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv tc.Unlocked; sb.Append "," |> ignore; key "researched"; boolv tc.Researched; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "policies"; arrStart ()
        let mutable firstP = true
        for n in spool.PolicyOrder do
            sep &firstP
            let p = spool.Policies.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv p.Unlocked; sb.Append "," |> ignore; key "blocked"; boolv false; sb.Append "," |> ignore; key "researched"; boolv p.Researched; objEnd ()
        arrEnd ()
        objEnd (); sb.Append "," |> ignore

        // achievements.save
        key "achievements"; arrStart ()
        let mutable firstA = true
        for n in apool.AchievementOrder do
            sep &firstA
            let a = apool.Achievements.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv a.Unlocked; sb.Append "," |> ignore; key "starUnlocked"; boolv a.StarUnlocked; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "ach"; objStart (); key "badgesUnlocked"; boolv false; sb.Append "," |> ignore; key "badges"; arrStart ()
        let mutable firstBd = true
        for n in apool.BadgeOrder do
            sep &firstBd
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv apool.Badges.[n].Unlocked; objEnd ()
        arrEnd (); objEnd (); sb.Append "," |> ignore

        // religion.save
        key "religion"; objStart ()
        key "faith"; numv rpool.Faith; sb.Append "," |> ignore
        key "corruption"; numv rpool.Corruption; sb.Append "," |> ignore
        key "faithRatio"; numv rpool.FaithRatio; sb.Append "," |> ignore
        key "transcendenceTier"; intv rpool.TranscendenceTier; sb.Append "," |> ignore
        key "activeHolyGenocide"; intv rpool.ActiveHolyGenocide; sb.Append "," |> ignore
        key "necrocornDeficit"; numv rpool.NecrocornDeficit; sb.Append "," |> ignore
        key "tcratio"; numv (Game.Religion.getTranscendTotalPrice rpool.TranscendenceTier); sb.Append "," |> ignore
        key "zu"; arrStart ()
        let mutable firstZu = true
        for n in rpool.ZuOrder do
            sep &firstZu
            let m = rpool.ZUs.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "val"; intv m.Val; sb.Append "," |> ignore; key "on"; intv m.On; sb.Append "," |> ignore; key "unlocked"; boolv m.Unlocked; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "ru"; arrStart ()
        let mutable firstRu = true
        for n in rpool.RuOrder do
            sep &firstRu
            let m = rpool.RUs.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "val"; intv m.Val; sb.Append "," |> ignore; key "on"; intv m.On; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "tu"; arrStart ()
        let mutable firstTu = true
        for n in rpool.TuOrder do
            sep &firstTu
            let m = rpool.TUs.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "val"; intv m.Val; sb.Append "," |> ignore; key "on"; intv m.On; sb.Append "," |> ignore; key "unlocked"; boolv m.Unlocked; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "pact"; arrStart ()
        let mutable firstPa = true
        for n in rpool.PactOrder do
            sep &firstPa
            let m = rpool.Pacts.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "val"; intv m.Val; sb.Append "," |> ignore; key "on"; intv m.On; sb.Append "," |> ignore; key "unlocked"; boolv m.Unlocked; objEnd ()
        arrEnd ()
        objEnd (); sb.Append "," |> ignore

        // space.save (space-NN statics at this slice — metas match orig defaults)
        key "space"; objStart ()
        key "hideResearched"; boolv false; sb.Append "," |> ignore
        key "programs"; arrStart ()
        let programs = [ "orbitalLaunch", true; "moonMission", false; "duneMission", false; "piscineMission", false; "heliosMission", false; "terminusMission", false; "kairoMission", false; "rorschachMission", false; "yarnMission", false; "umbraMission", false; "charonMission", false; "centaurusSystemMission", false; "furthestRingMission", false ]
        let mutable firstSp = true
        for pn, pu in programs do
            sep &firstSp
            objStart (); key "name"; str pn; sb.Append "," |> ignore; key "val"; intv 0; sb.Append "," |> ignore; key "on"; intv 0; sb.Append "," |> ignore; key "unlocked"; boolv pu; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "planets"; arrStart ()
        let planets = [
            "cath", [ "spaceElevator"; "sattelite"; "spaceStation" ], 0
            "moon", [ "moonOutpost"; "moonBase" ], 30
            "dune", [ "planetCracker"; "hydrofracturer"; "spiceRefinery" ], 356
            "piscine", [ "researchVessel"; "orbitalArray" ], 619
            "helios", [ "sunlifter"; "holocathedral" ], 10000
            "terminus", [ "cryostation" ], 17300
            "kairo", [ "spaceBeacon" ], 26200
            "yarn", [ "hydroponics"; "spiceRefinery" ], 35000
            "umbra", [ "entangler" ], 55000
            "charon", [ "eternityLevel" ], 62000
            "centaurusSystem", [ "t-center" ], 700000
            "furthestRing", [ "horseshoe" ], 800000
        ]
        let mutable firstPl = true
        for pn, blds, rd in planets do
            sep &firstPl
            objStart ()
            key "name"; str pn; sb.Append "," |> ignore
            key "buildings"; arrStart ()
            let mutable firstPb = true
            for bn in blds do
                sep &firstPb
                objStart (); key "name"; str bn; sb.Append "," |> ignore; key "val"; intv 0; sb.Append "," |> ignore; key "on"; intv 0; sb.Append "," |> ignore; key "unlocked"; boolv false; objEnd ()
            arrEnd (); sb.Append "," |> ignore
            key "reached"; boolv false; sb.Append "," |> ignore
            key "unlocked"; boolv false; sb.Append "," |> ignore
            key "routeDays"; numv (float rd)
            objEnd ()
        arrEnd ()
        objEnd (); sb.Append "," |> ignore

        // time.save (timestamp = the fake clock at the CURRENT tick)
        key "time"; objStart ()
        key "timestamp"; numv (1759000000000.0 + float ticks * 1000.0); sb.Append "," |> ignore
        key "flux"; numv tpool.Flux; sb.Append "," |> ignore
        key "heat"; numv tpool.Heat; sb.Append "," |> ignore
        key "testShatter"; intv tpool.TestShatter; sb.Append "," |> ignore
        key "isAccelerated"; boolv tpool.IsAccelerated; sb.Append "," |> ignore
        key "cfu"; arrStart ()
        let mutable firstCfu = true
        for n in tpool.CfuOrder do
            sep &firstCfu
            let m = tpool.CFUs.[n]
            objStart ()
            key "name"; str n; sb.Append "," |> ignore
            key "val"; intv m.Val; sb.Append "," |> ignore
            key "on"; intv m.On
            if n = "blastFurnace" then sb.Append "," |> ignore; key "heat"; numv m.Heat
            if n = "controlledDelay" then sb.Append "," |> ignore; key "delayTicks"; intv m.DelayTicks
            sb.Append "," |> ignore
            key "unlocked"; boolv m.Unlocked
            if (Game.Catalog.World.cfuDefs |> List.find (fun d -> d.Name = n)).AutomationInit.IsSome then
                sb.Append "," |> ignore
                key "isAutomationEnabled"
                boolv (m.IsAutomationEnabled = Some false && n <> "temporalAccelerator" && n <> "temporalPress")
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "vsu"; arrStart ()
        let mutable firstVsu = true
        for n in tpool.VsuOrder do
            sep &firstVsu
            let m = tpool.VSUs.[n]
            objStart ()
            key "name"; str n
            if m.Val <> 0 then sb.Append "," |> ignore; key "val"; intv m.Val
            if m.On <> 0 then sb.Append "," |> ignore; key "on"; intv m.On
            if m.Unlocked then sb.Append "," |> ignore; key "unlocked"; boolv true
            objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "queueItems"; arrStart (); arrEnd (); sb.Append "," |> ignore
        key "queueSources"; objStart ()
        let qs = [ "buildings"; "spaceMission"; "spaceBuilding"; "zigguratUpgrades"; "transcendenceUpgrades"; "chronoforge"; "voidSpace" ]
        let mutable firstQs = true
        for q0 in qs do
            sep &firstQs
            key q0; boolv false
        objEnd ()
        objEnd (); sb.Append "," |> ignore

        // prestige.save
        key "prestige"; objStart (); key "perks"; arrStart ()
        let mutable firstPk = true
        for n in ppool.PerkOrder do
            sep &firstPk
            let p = ppool.Perks.[n]
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "unlocked"; boolv p.Unlocked; sb.Append "," |> ignore; key "researched"; boolv p.Researched; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "hideResearched"; boolv false
        objEnd (); sb.Append "," |> ignore

        // stats.save
        key "stats"; arrStart ()
        let mutable firstSt = true
        for n in stpool.Order do
            sep &firstSt
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "val"; numv (Game.Stats.getStat stpool n); objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "statsCurrent"; arrStart ()
        let mutable firstStc = true
        for n in stpool.CurrentOrder do
            sep &firstStc
            objStart (); key "name"; str n; sb.Append "," |> ignore; key "val"; numv (Game.Stats.getStatCurrentSimple stpool n); objEnd ()
        arrEnd (); sb.Append "," |> ignore
        key "void"; objStart (); key "vu"; arrStart ()
        let mutable firstVu = true
        for n in voidp.VuOrder do
            sep &firstVu
            objStart (); key "name"; str n; objEnd ()
        arrEnd (); sb.Append "," |> ignore
        (match voidp.Faction with Some f0 -> key "faction"; str f0 | None -> ())
        objEnd (); sb.Append "," |> ignore

        // game.save tail
        key "game"; objStart ()
        key "isCMBREnabled"; boolv false; sb.Append "," |> ignore
        key "colorScheme"; str ""; sb.Append "," |> ignore
        key "karmaKittens"; intv pool.KarmaKittens; sb.Append "," |> ignore
        key "karmaZebras"; intv 0; sb.Append "," |> ignore
        key "ironWill"; boolv ironWill; sb.Append "," |> ignore
        key "deadKittens"; numv (Game.Stats.getStat stpool "kittensDead"); sb.Append "," |> ignore
        key "cheatMode"; boolv false; sb.Append "," |> ignore
        key "startedWithoutChronospheres"; boolv true; sb.Append "," |> ignore
        key "opts"; objStart ()
        let opts = [
            "notation", "\"si\""; "batchSize", "10"; "useWorkers", "true"; "forceHighPrecision", "false";
            "usePerSecondValues", "true"; "usePercentageResourceValues", "false"; "showNonApplicableButtons", "false";
            "usePercentageConsumptionValues", "false"; "highlightUnavailable", "true"; "hideSell", "false";
            "hideDowngrade", "false"; "hideBGImage", "false"; "tooltipsInRightColumn", "false"; "noConfirm", "false";
            "IWSmelter", "true"; "disableTelemetry", "false"; "enableRedshift", "false"; "disablePollution", "false";
            "enableRedshiftGflops", "false"; "useLegacyTwoInRowLayout", "false"; "useSwipeNavigation", "false";
            "ksEnabled", "false"; "forceLZ", "false"; "compressSaveFile", "false"; "hodl", "true"; "disableCMBR", "false"
        ]
        let mutable firstO = true
        for on, ov in opts do
            sep &firstO
            key on; raw ov
        objEnd ()
        objEnd ()
        objEnd ()
        sb.ToString()

    saveDataBuilder <- Some buildSaveString
`;

t = t.replace(anchor, body);
fs.writeFileSync(q, t);
console.log("save builder inserted");
