#!/usr/bin/env node
"use strict";
// Batch-14 patch: time-08 shatter variants + calendarOnNewYears + reserveMan
// into the fs-runner let-rec chain.
const fs = require("fs");
const q = "oracle/runner/fs-runner/Program.fs";
let t = fs.readFileSync(q, "utf8");

const anchor = `        refreshCache () // upgrade({buildings: ["pasture"]}) season-effect fan-out
        // queue.update(): QUEUE flag off (time-14 seam)
`;
if (!t.includes(anchor)) { console.error("shatterCore anchor missing"); process.exit(1); }

const block = `        refreshCache () // upgrade({buildings: ["pasture"]}) season-effect fan-out
        // queue.update(): QUEUE flag off (time-14 seam)

    /// calendar.calculateMilleniumProduction (L967-973): paragon + karma seam.
    and calculateMilleniumProduction (milleniums: float) : unit =
        // DARK_PARACOSM feature flag seam (milleninumParagon effect — flag off)
        let poolP, _ = Game.Resources.addResEvent calendarDay "paragon" milleniums pool
        pool <- poolP
        stpool <- Game.Stats.bumpStat "totalParagon" milleniums stpool
        () // pactsMilleniumKarmaKittens: karma seam (pactsAvailable 0)

    /// calendar.getMilleniaChanged (L964-966)
    let getMilleniaChanged (startYear: float) (endYear: float) : float =
        max 0.0 ((floor (endYear / 1000.0) * 1000.0 - floor (startYear / 1000.0) * 1000.0) / 1000.0)

    /// calendar.onNewYears (L975-1053) — the batch-years variant used by the
    /// bulk shatters. Unlike onNewYear, the elder roll draws rand(1000) ONCE
    /// with a years-multiplied threshold, cycles advance by whole years, and
    /// the tail runs the policy-hack refresh (authocracy + 2 relation policies).
    and calendarOnNewYears (years: float) (milleniumChangeCalculated: bool) : unit =
        let ty = Game.Stats.getStat stpool "totalYears" + years
        stpool <- Game.Stats.setStat "totalYears" (if ty < calendar.Year then calendar.Year else ty) stpool
        if calendar.Year >= 40000.0 then
            let imp = tpool.CFUs.["temporalImpedance"]
            tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalImpedance" { imp with Unlocked = true } }
        steamworksJammed <- false
        if milleniumChangeCalculated then
            calculateMilleniumProduction (getMilleniaChanged (calendar.Year - years) calendar.Year)
        let pyramidVal = float (Game.Religion.getZU rpool "blackPyramid").Val
        let markerVal = float (Game.Religion.getZU rpool "marker").Val
        if pyramidVal > 0.0 then
            let elderRoll = Game.Math.uniformRandomInteger (fun () -> rngDraws <- rngDraws + 1; rand ()) 0.0 1000.0
            if float elderRoll < 35.0 * pyramidVal * years * (1.0 + 0.1 * markerVal) then
                dp <- Game.Diplomacy.unlockElders dp 400.0
        if dp.Races.["leviathans"].Unlocked then
            let c = cpool.Challenges.["blackSky"]
            cpool <- { cpool with Challenges = cpool.Challenges |> Map.add "blackSky" { c with Unlocked = true } }
        let cycleYear' = calendar.CycleYear + int years
        if cycleYear' >= List.length Game.Calendar.cycleYearColors then
            let cyclesChange = cycleYear' / List.length Game.Calendar.cycleYearColors
            let newCycleYear = cycleYear' % List.length Game.Calendar.cycleYearColors
            calendar <- { calendar with CycleYear = newCycleYear }
            let cyclesPerEra = List.length Game.Calendar.cycleNames
            calendar <-
                { calendar with
                    Cycle =
                      if cyclesChange + calendar.Cycle >= cyclesPerEra then
                          (cyclesChange + calendar.Cycle) % cyclesPerEra
                      else calendar.Cycle + cyclesChange }
        else
            calendar <- { calendar with CycleYear = cycleYear' }
        // upgrade({spaceBuilding}) fan-out: space-NN seam
        let antimatterYearProd =
            Game.Effects.getEffect cache "antimatterProduction"
            * (1.0 + Game.Effects.getEffect cache "antimatterPolicyRatio")
            * (1.0 + Game.Effects.getEffect cache "pyramidPerYearRatio")
        let poolA, _ = Game.Resources.addResEvent calendarDay "antimatter" (antimatterYearProd * years) pool
        pool <- poolA
        let yearFlux =
            Game.Effects.getEffect cache "temporalFluxProduction"
            * (1.0 + Game.Effects.getEffect cache "temporalFluxPolicyRatio")
            * (1.0 + Game.Effects.getEffect cache "pyramidPerYearRatio")
        let poolF, _ = Game.Resources.addResEvent calendarDay "temporalFlux" (yearFlux * years) pool
        pool <- poolF
        // aiCore apocalypse msg: aiLevel seam (0 at this slice)
        refreshCache () // upgrade({policies: [authocracy + 2 relation policies]})

    /// Shared shatterTCGain production replay (orig duplicates this block in
    /// all three variants). uncapped inflate → chronoEngineers → clamp.
    and shatterReplay (ticks: float) (gain: float) (ootv: bool) : unit =
        if gain > 0.0 then
            let limits =
                pool.Order
                |> List.choose (fun n ->
                    match get pool n with
                    | Some r ->
                        let lim = max r.Value (if r.MaxValue <> 0.0 then r.MaxValue else System.Double.MaxValue)
                        let pool1, _ =
                            Game.Resources.addRes calendarDay (r.PerTickCached * ticks * gain) false true n pool
                        pool <- pool1
                        Some(n, lim)
                    | None -> None)
            if (match wpool.Upgrades |> Map.tryFind "chronoEngineers" with Some u -> u.Researched | None -> false) then
                let pool1, wp1, craftsDone =
                    Game.Managers.craftByEngineers calendarDay cache (traditionResearched ()) getResValue
                        (getResProductionCached ()) false (ticks * gain) pool wpool
                pool <- pool1
                wpool <- wp1
                if craftsDone > 0.0 then
                    stpool <- Game.Stats.bumpStat "totalCrafts" craftsDone stpool
                    stpool <- Game.Stats.bumpStatCurrent "totalCrafts" craftsDone stpool
            pool <-
                { pool with
                    ByName =
                        pool.ByName
                        |> Map.map (fun n res ->
                            match limits |> List.tryFind (fun (ln, _) -> ln = n) with
                            | Some(_, lim) -> { res with Value = min res.Value lim }
                            | None -> res) }
            // cathPollution FF: pollution seam (0 with no calciners)
            if ootv then triggerOotV ticks

    /// time.shatterInCycles (L750-828, deprecated) — cycle-at-a-time variant.
    and shatterCoreCycles (amtIn: int) : unit =
        let amt = if amtIn = 0 then 1 else amtIn
        let _routeSpeed = 1.0 // space ETA seam
        let shatterTCGain =
            Game.Effects.getEffect cache "shatterTCGain" * (1.0 + Game.Effects.getEffect cache "rrRatio")
        let triggersOotV = Game.Effects.getEffect cache "voidResonance" > 0.0
        let seasonsCount = float (List.length Game.Calendar.seasons)
        let daysPerYear = Game.Calendar.daysPerSeason * seasonsCount
        let yearsPerCycle = float (List.length Game.Calendar.cycleYearColors)
        let endYear = calendar.Year + float amt
        let remFirstSaved =
            Game.Calendar.daysPerSeason * (seasonsCount - float calendar.Season) - calendar.Day
        let mutable remFirst = remFirstSaved
        calendar <- { calendar with Day = 0.0; Season = 0 }
        let mutable maxYearsShattered = float amt
        while maxYearsShattered > 0.0 do
            let remYearsInCurrentCycle = min (yearsPerCycle - float calendar.CycleYear) maxYearsShattered
            let remDaysInCurrentCycle = (remYearsInCurrentCycle - 1.0) * daysPerYear + remFirst
            let remTicks = remDaysInCurrentCycle * Game.Calendar.ticksPerDay
            shatterReplay remTicks shatterTCGain triggersOotV
            calendar <- { calendar with Year = calendar.Year + remYearsInCurrentCycle }
            calendarOnNewYears (endYear = calendar.Year) remYearsInCurrentCycle false
            calculateMilleniumProduction (getMilleniaChanged (calendar.Year - remYearsInCurrentCycle) calendar.Year)
            maxYearsShattered <- maxYearsShattered - remYearsInCurrentCycle
            remFirst <- daysPerYear
        tpool <- { tpool with Flux = tpool.Flux + (float (amt - 1) + remFirstSaved / daysPerYear) }
        let c1000 = cpool.Challenges.["1000Years"]
        cpool <- { cpool with Challenges = cpool.Challenges |> Map.add "1000Years" { c1000 with Unlocked = true } }
        if c1000.Active && calendar.Year >= 1000.0 then
            cpool <- Game.Challenges.researchChallenge "1000Years" cpool
            let pressM = tpool.CFUs.["temporalPress"]
            tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalPress" { pressM with Unlocked = true } }
            calculateAllTime ()
        refreshCache () // pasture season-effect fan-out

    /// time.shatterInGroupCycles (L838-1018) — the testShatter=1 path.
    /// aiCore apocalypse destruction is an aiLevel seam (0) — variables kept
    /// for shape; cycles produce in 5-year onNewYears batches.
    and shatterCoreGroupCycles (amtIn: int) : unit =
        if amtIn <= 1 then shatterCore (max 1 amtIn)
        else
            let amt = amtIn
            let _routeSpeed = 1.0 // space ETA seam
            let shatterTCGain =
                Game.Effects.getEffect cache "shatterTCGain" * (1.0 + Game.Effects.getEffect cache "rrRatio")
            let triggersOotV = Game.Effects.getEffect cache "voidResonance" > 0.0
            let seasonsCount = float (List.length Game.Calendar.seasons)
            let daysPerYear = Game.Calendar.daysPerSeason * seasonsCount
            let yearsPerCycle = float (List.length Game.Calendar.cycleYearColors)
            let cyclesPerEra = List.length Game.Calendar.cycleNames
            let startYear = calendar.Year
            let endYear = calendar.Year + float amt
            let remFirstSaved =
                Game.Calendar.daysPerSeason * (seasonsCount - float calendar.Season) - calendar.Day
            let mutable remFirst = remFirstSaved
            calendar <- { calendar with Day = 0.0; Season = 0 }
            let aiApocalypseLevel = 0 // aiLevel seam
            let _aiDestructionMod = -min 1.0 (float aiApocalypseLevel * 0.01)
            // cycle-year distribution
            let remainingCyclesYears = Array.create 10 0.0
            let mutable maxYears = float amt
            if amt % 50 = 0 then
                for j in 0..9 do remainingCyclesYears.[j] <- float amt / 10.0
            else
                let wholeCycleYears = float (amt - amt % 50)
                for j in 0..9 do remainingCyclesYears.[j] <- wholeCycleYears / 10.0
                maxYears <- maxYears - wholeCycleYears
                let first = min (yearsPerCycle - float calendar.CycleYear) maxYears
                remainingCyclesYears.[calendar.Cycle] <- remainingCyclesYears.[calendar.Cycle] + first
                maxYears <- maxYears - first
                for j in 1 .. cyclesPerEra - 1 do
                    let take = min yearsPerCycle maxYears
                    remainingCyclesYears.[(calendar.Cycle + j) % 10] <- remainingCyclesYears.[(calendar.Cycle + j) % 10] + take
                    maxYears <- maxYears - take
            maxYears <- float amt
            let startingCycleNum = calendar.Cycle
            for cycleNum in 0 .. cyclesPerEra - 1 do
                let yearsInCurrentCycle = remainingCyclesYears.[(cycleNum + startingCycleNum) % 10]
                if yearsInCurrentCycle <> 0.0 then
                    let daysInCurrentCycle = (yearsInCurrentCycle - 1.0) * daysPerYear + remFirst
                    let ticksInCurrentCycle = daysInCurrentCycle * Game.Calendar.ticksPerDay
                    let ai = if yearsInCurrentCycle = 1.0 then 0 else aiApocalypseLevel
                    let _ = ai
                    shatterReplay ticksInCurrentCycle shatterTCGain triggersOotV
                    let step = min 5.0 maxYears
                    calendar <- { calendar with Year = calendar.Year + step }
                    calendarOnNewYears (endYear = calendar.Year) step false
                    maxYears <- maxYears - step
                    remFirst <- daysPerYear
            calendar <- { calendar with Year = calendar.Year + maxYears }
            calendarOnNewYears (endYear = calendar.Year) maxYears false
            calculateMilleniumProduction (getMilleniaChanged startYear calendar.Year)
            tpool <- { tpool with Flux = tpool.Flux + (float (amt - 1) + remFirstSaved / daysPerYear) }
            let c1000 = cpool.Challenges.["1000Years"]
            cpool <- { cpool with Challenges = cpool.Challenges |> Map.add "1000Years" { c1000 with Unlocked = true } }
            if c1000.Active && calendar.Year >= 1000.0 then
                cpool <- Game.Challenges.researchChallenge "1000Years" cpool
                let pressM = tpool.CFUs.["temporalPress"]
                tpool <- { tpool with CFUs = tpool.CFUs |> Map.add "temporalPress" { pressM with Unlocked = true } }
                calculateAllTime ()
            refreshCache () // pasture season-effect fan-out

    /// reserveMan.calculateReserveResources (L726-754): resStasisRatio share of
    /// persisted resources (sqrt for craftables without fluxCondensator; void
    /// floors; timeCrystal skipped; max-vs-existing).
    and calculateReserveResources () : unit =
        let saveRatio =
            if (Game.Buildings.get bpool "chronosphere" |> Option.map (fun b -> b.Val) |> Option.defaultValue 0) > 0 then
                Game.Effects.getEffect cache "resStasisRatio"
            else 0.0
        if saveRatio <> 0.0 then
            let fluxCondensator =
                match wpool.Upgrades |> Map.tryFind "fluxCondensator" with Some u -> u.Researched | None -> false
            for n in pool.Order do
                if n <> "timeCrystal" then
                    match get pool n with
                    | Some r ->
                        let skip =
                            r.Def.Persists = false
                            || (r.Def.Craftable && n <> "wood" && not fluxCondensator)
                        if not skip then
                            let value =
                                if not r.Def.Persists then
                                    if not r.Def.Craftable || n = "wood" then
                                        let v = r.Value * saveRatio
                                        if n = "void" then floor v else v
                                    elif r.Value > 0.0 then
                                        System.Math.Sqrt r.Value * saveRatio * 100.0
                                    else 0.0
                                else 0.0
                            if value > 0.0 then
                                let existing = reserveResources |> Map.tryFind n |> Option.defaultValue 0.0
                                reserveResources <- reserveResources |> Map.add n (max existing (min value System.Double.MaxValue))
                    | None -> ()

    /// reserveMan.calculateReserveKittens (L756-771): sort by exp, take last N
    /// = cryochambers.on, strip job/leader/engineer.
    and calculateReserveKittens () : unit =
        let cryochambers = tpool.VSUs.["cryochambers"].On
        if cryochambers > 0 then
            let sorted = Game.Managers.sortKittensByExp vpool
            let taken = sorted |> List.rev |> List.truncate cryochambers |> List.rev |> List.map (fun k -> { k with Job = None; EngineerSpeciality = None })
            reserveKittens <- reserveKittens @ taken

    /// reserveMan.calculateReserves (L773-782)
    and calculateReserves (isIronWillPending: bool) : unit =
        calculateReserveResources ()
        if not (Game.Challenges.getChallenge cpool "postApocalypse").Pending || isIronWillPending then
            calculateReserveKittens ()
            reserveCryochambers <- reserveCryochambers + tpool.VSUs.["cryochambers"].On

    /// reserveMan.addReserves (L784-813): max-vs-cap restore, kitten push,
    /// usedCryochambers accumulation.
    and addReserves () : unit =
        for KeyValue(n, v) in reserveResources do
            if n = "timeCrystal" then
                reserveResources <- reserveResources |> Map.remove n
            else
                match get pool n with
                | Some r ->
                    if r.MaxValue = 0.0 then
                        let pool1, _ = Game.Resources.addResEvent calendarDay n (min (r.Value + v) System.Double.MaxValue) pool
                        pool <- pool1
                    else
                        let pool1 = { pool with ByName = pool.ByName |> Map.add n { r with Value = max r.Value v } }
                        pool <- pool1
                | None -> ()
                reserveResources <- reserveResources |> Map.remove n
        vpool <- { vpool with Kittens = vpool.Kittens @ reserveKittens }
        let kittensRes = pool.ByName["kittens"]
        pool <- { pool with ByName = pool.ByName |> Map.add "kittens" { kittensRes with Value = float vpool.Kittens.Length } }
        let used = tpool.VSUs.["usedCryochambers"]
        tpool <-
            { tpool with
                VSUs =
                    tpool.VSUs
                    |> Map.add "usedCryochambers"
                        { used with Val = used.Val + reserveCryochambers; On = used.On + reserveCryochambers
                                    Unlocked = used.Unlocked || used.Val + reserveCryochambers > 0 } }
        reserveCryochambers <- 0
        reserveKittens <- []
        // startedWithoutChronospheres = false (achievement seam)
`;

t = t.replace(anchor, block);
fs.writeFileSync(q, t);
console.log("chain block inserted");
