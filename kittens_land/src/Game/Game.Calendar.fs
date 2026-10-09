module Game.Calendar

// calendar-01 + calendar-02: the calendar manager core (orig js/calendar.js).
// Slice scope: tick progression, season/year/cycle bookkeeping, weather rolls,
// and the fresh-state onNewDay/onNewSeason/onNewYear paths. Seams (documented
// per field): time flux (time-01), religion pacts (religion-NN), prestige perks
// (prestige-01), stats (stats-01), space upgrade fan-out (space-NN), festival
// consumption (village-NN) — none of which touch snapshotted state at fresh.

open Game.Math

// --- data (calendar-01) -----------------------------------------------------

type SeasonDef =
    { Name: string
      Modifiers: Map<string, float> } // keyed by RESOURCE name (orig seasons[..].modifiers)

let seasons : SeasonDef list =
    [ { Name = "spring"; Modifiers = Map.ofList [ "catnip", 1.5 ] }
      { Name = "summer"; Modifiers = Map.ofList [ "catnip", 1.0 ] }
      { Name = "autumn"; Modifiers = Map.ofList [ "catnip", 1.0 ] }
      { Name = "winter"; Modifiers = Map.ofList [ "catnip", 0.25 ] } ]

let cycleYearColors : string list =
    [ "#A00000"; "#DBA901"; "#14CD61"; "#01A9DB"; "#9A2EFE" ]

// Cycle effects/festivalEffects tables are space-NN data; names only here.
let cycleNames : string list =
    [ "charon"; "umbra"; "yarn"; "helios"; "cath"; "redmoon"; "dune"; "piscine"; "terminus"; "kairo" ]

// --- constants (js/calendar.js L217-221) ------------------------------------

let ticksPerDay = 10.0
let daysPerSeason = 100.0


// --- state ------------------------------------------------------------------

type CalendarState =
    { Year: float
      Day: float
      Season: int
      Weather: string option // "warm" | "cold" | None
      Cycle: int
      CycleYear: int
      EventChance: float
      FestivalDays: int
      CryptoPrice: float     // bcoin random walk (calendar-10)
      ObserveRemainingTime: int }

/// orig village.holdFestival (js/village.js L1131): the carnivals perk extends
/// the festival by a year per hold, otherwise it (re)sets to one year
/// (daysPerSeason x seasonsPerYear = 400 days). Returns updated calendar.
let holdFestival (carnivalsResearched: bool) (amt: int) (st: CalendarState) : CalendarState =
    let yearDays = int (daysPerSeason * float (List.length seasons))
    if carnivalsResearched
    then { st with FestivalDays = st.FestivalDays + yearDays * amt }
    else { st with FestivalDays = yearDays }

let init : CalendarState =
    { Year = 0.0
      Day = 0.0
      Season = 0
      Weather = None
      Cycle = 0
      CycleYear = 0
      CryptoPrice = 1000.0
      ObserveRemainingTime = 0
      EventChance = 0.0
      FestivalDays = 0 }

// --- context seam ------------------------------------------------------------

/// Everything the calendar slices read from managers not yet ported. Fresh-state
/// values below are verified against the orig harness.
type CalendarContext =
    { GetEffect: string -> float // game-08 effects cache
      TimeAccelerationRatio: float // time controls (0.0 fresh)
      DarkFuture: bool // calendar.darkFutureYears() >= 0 (false fresh)
      ChronomancyResearched: bool // prestige perk (false fresh)
      UnicornmancyResearched: bool // prestige perk (false fresh)
      Year1000ChallengeActive: bool // challenges (false fresh)
      WinterIsComingResearched: bool // challenges (false fresh)
      WinterIsComingActive: bool // challenges (false fresh)
      AdvancedAutomationResearched: bool // workshop (false fresh)
      CommunismResearched: bool // policy (false fresh) — getWeatherMod
      WinterIsComingOn: bool // challenge toggled ON (false fresh) — getWeatherMod
      Rand: unit -> float // the harness PRNG stream
      OnParadox: CalendarState -> CalendarState // paradox hook (resources void accrual)
      OnNewDayRefresh: CalendarState -> CalendarState
      OnNewDayTail: CalendarState -> CalendarState
      OnObserveTimeout: CalendarState -> CalendarState
      OnFlux: float -> unit // time.flux bookkeeping (time-01); arg = delta
      OnNewSeasonTail: CalendarState -> CalendarState // steamworks autumn unjam seam
      }
      // orig onNewDay tail: game.upgrade({policies:["authocracy"]}) — the
      // "policy hack" whose updateCaches refreshes ALL effects daily (L730)

/// Season/weather production modifier (orig getWeatherMod) — catnip only.
/// `weather` comes from calendar-02 rolls; policy/challenge seams are fresh-false.
let getWeatherMod (ctx: CalendarContext) (st: CalendarState) (resName: string) : float =
    let season = seasons.[st.Season]
    let mutable mod' = season.Modifiers |> Map.tryFind resName |> Option.defaultValue 1.0

    if resName <> "catnip" then
        mod'
    else
        if ctx.CommunismResearched && season.Name = "winter" && st.Weather = Some "cold" then
            0.0
        else
            if st.Weather = Some "warm" then mod' <- mod' + 0.15
            elif st.Weather = Some "cold" then mod' <- mod' - 0.15
            // (winterIsComing ON × coldHarshness: challenge seam, fresh-false)
            if season.Name = "spring" then
                mod' <- mod' * (1.0 + ctx.GetEffect("springCatnipRatio"))
            mod'

// (the runner builds CalendarContext values; no module-level default)

// --- core (calendar-01) ------------------------------------------------------

let private roundToCentiday (st: CalendarState) : CalendarState =
    { st with Day = jsRound (st.Day * 100.0) / 100.0 }

/// orig calendar.tick() — progression + new-day/season/year slices. The time
/// flux bookkeeping (time-01) is the one skipped side effect; it touches no
/// snapshotted state.
let tick (ctx: CalendarContext) (st: CalendarState) : CalendarState =
    // observe countdown (orig tick L419-425): at zero, the timeout draws
    // rand(100) vs autoChance via the context hook
    let mutable st = st
    if st.ObserveRemainingTime > 0 then
        st <- { st with ObserveRemainingTime = st.ObserveRemainingTime - 1 }
        if st.ObserveRemainingTime = 0 then
            st <- ctx.OnObserveTimeout st

    // (observeRemainingTime countdown: observe events are calendar-03, none at fresh)

    let previousIntDay = floor st.Day
    st <- { st with Day = st.Day + (1.0 + ctx.TimeAccelerationRatio) / ticksPerDay }
    st <- roundToCentiday st
    // time.flux bookkeeping (time-01): paradox counts down, acceleration up
    let ticksPerYear = ticksPerDay * daysPerSeason * float (List.length seasons)
    if st.Day < 0.0 then
        ctx.OnFlux (-1.0 / (1.0 + ctx.TimeAccelerationRatio) / ticksPerYear)
    else
        ctx.OnFlux (ctx.TimeAccelerationRatio / ticksPerYear)

    if floor st.Day = previousIntDay then st
    else
        let mutable newSeason = false
        let mutable newYear = false

        if st.Day >= daysPerSeason then
            st <- { st with Day = st.Day - daysPerSeason }
            st <- roundToCentiday st
            st <- { st with Season = st.Season + 1 }
            newSeason <- true

            // Temporal paradox (the draw happens even at chance 0!)
            let temporalParadoxChance = ctx.GetEffect("temporalParadoxChance")
            if ctx.Rand () < temporalParadoxChance then
                st <- { st with Day = -10.0 - ctx.GetEffect("temporalParadoxDay") }

            if st.Season >= List.length seasons then
                st <- { st with Season = 0 }
                let yearInc = if ctx.Year1000ChallengeActive && st.Year >= 500.0 then 0.0 else 1.0
                st <- { st with Year = st.Year + yearInc }
                newYear <- true

        // onNewDay slice (calendar-01): festival decrement (none at fresh),
        // perk chance ratios (unused at fresh), void/relic daily accrual:
        if st.Day < 0.0 then
            // void accrual during temporal paradox — resources-10 via the hook
            st <- ctx.OnParadox st
        else
            () // relic addResPerDay: getEffect("relicPerDay") = 0 at fresh → no-op
        // (necrocorn pacts / blackPyramid / payDebt: religion-NN seams — no
        //  snapshotted state at fresh)
        // onNewDay: festival countdown (orig L487-497). The luxury-deficit
        // early end reads festivalLuxuryConsumptionRatio (0 at fresh → no-op).
        if st.FestivalDays > 0 then
            st <- { st with FestivalDays = st.FestivalDays - 1 }
            let _ = ctx.GetEffect "festivalLuxuryConsumptionRatio"
            ()

        // calendar-10 tail: crypto price walk (orig L728) — gated on the
        // antimatter tech via the context hook below (no-op when not researched)
        st <- ctx.OnNewDayTail st

        // orig onNewDay TAIL: game.upgrade({policies:["authocracy"]}) — the
        // "policy hack"; game.upgrade unconditionally runs updateCaches, so
        // EVERY new day refreshes the effects cache + perTickCached
        st <- ctx.OnNewDayRefresh st

        if newSeason then
            // onNewSeason slice (calendar-02)
            st <- { st with EventChance = 0.0 }

            if st.Year > 3.0 then
                let mutable coldChance = 175.0
                let mutable warmChance = 175.0
                let effect = 1000.0 * ctx.GetEffect("coldChance")
                coldChance <- coldChance + effect
                warmChance <- warmChance - effect
                if warmChance < 0.0 then warmChance <- 0.0
                if seasons.[st.Season].Name = "winter"
                   && ctx.WinterIsComingResearched
                   && not ctx.WinterIsComingActive then
                    coldChance <- 0.0

                let rand = uniformRandomInteger ctx.Rand 0.0 1000.0
                if rand < warmChance then st <- { st with Weather = Some "warm" }
                elif rand < warmChance + coldChance then st <- { st with Weather = Some "cold" }
                else st <- { st with Weather = None }
            else
                st <- { st with Weather = None }

            // (steamworks unjam: workshop seam; pasture upgrade fan-out:
            //  buildings-01 seam — neither touches snapshotted state at fresh)

            // onNewSeason tail: steamworks unjam at autumn (season 2) with
            // advancedAutomation (js/calendar.js L951-953); pasture upgrade
            // fan-out is a buildings seam
            st <- ctx.OnNewSeasonTail st

            if newYear then
                // onNewYear slice (calendar-01): stats/seams at fresh, then
                // cycle bookkeeping (L1009-1024)
                if st.Year % 1000.0 = 0.0 then () // paragon: prestige-01 seam

                if (int st.Year % 1000 + 1 = 1000) then () // blackPyramid roll: pyramidVal 0 at fresh
                // (leviathans/blackSky: diplomacy seam; space upgrade fan-out: space seam;
                //  antimatter yearly production: getResourceOnYearProduction = 0 at fresh)

                let cycleYear' = st.CycleYear + 1
                if cycleYear' >= List.length cycleYearColors then
                    st <- { st with CycleYear = 0 }
                    let cycle' = st.Cycle + 1
                    st <- { st with Cycle = if cycle' >= List.length cycleNames then 0 else cycle' }
                else
                    st <- { st with CycleYear = cycleYear' }

        // calendar.update() is empty in orig
        st

/// Season production modifiers of the current season (calendar-02, used by game-10).
let seasonModifiers (st: CalendarState) : Map<string, float> =
    seasons.[st.Season].Modifiers

// --- calendar-07: fastForward (full parity) ------------------------------------
// orig calendar.fastForward (js/calendar.js L840-932): EV-based day skipping.
// Resource accrual goes through runner callbacks (the pool is owned there);
// rand() draws: ivory meteor rand(1500) on hit + the crypto walk
// (loopOrGaussian base + adjustCryptoPrice + possible correction).

type FastForwardContext =
    { GetEffect: string -> float
      Rand: unit -> float
      IronWill: bool
      LibraryOn: bool
      AstronomyResearched: bool
      BlackSkyActive: bool
      Chronomancy: bool
      Unicornmancy: bool
      Astromancy: bool
      Alicornmancy: bool
      PacifismActive: bool
      AnimalResearched: bool
      ArcheryResearched: bool
      MiningResearched: bool
      CelestialMechanics: bool
      Prospecting: bool
      Seti: bool
      Year1000Active: bool
      AntimatterResearched: bool
      EnergyBalanced: bool // resPool.energyProd >= energyCons (true at this slice)
      UnicornsValue: unit -> float // live read (orig resPool.get("unicorns").value)
      ZebrasValue: unit -> float
      ZebrasMax: unit -> float
      AddResEvent: string -> float -> unit
      AddResPerTick: string -> float -> unit
      OnAlicornUpgrade: unit -> unit // upgrade({zigguratUpgrades: [skyPalace; …]})
      OnParagon: float -> unit // pool + totalParagon stat
      OnMillenniumKarma: float -> unit // pactsMilleniumKarmaKittens seam
      OnYearsAdvanced: float -> unit // totalYears stat
      SpaceBeaconAction: unit -> unit // val=0 seam (no-op)
      UpdateCaches: unit -> unit }

let getAstroEventAutoChance (ctx: FastForwardContext) : float =
    if ctx.Seti then 1.0
    else
        let mutable autoChance = ctx.GetEffect "starAutoSuccessChance"
        if ctx.Astromancy then autoChance <- autoChance * 2.0
        autoChance <-
            if ctx.IronWill then max 0.25 autoChance
            else max 0.0 autoChance
        min autoChance 1.0

let fastForward (ctx: FastForwardContext) (st: CalendarState) (days: float) : CalendarState * float =
    let mutable st = st
    let timeRatioBonus = 1.0 + ctx.GetEffect "timeRatio" * 0.25
    let chanceRatio = (if ctx.Chronomancy then 1.1 else 1.0) * timeRatioBonus
    let unicornChanceRatio = (if ctx.Unicornmancy then 1.1 else 1.0) * timeRatioBonus
    let mutable totalEvents = 0.0

    // auto observable events
    if (ctx.LibraryOn || ctx.AstronomyResearched) && not ctx.BlackSkyActive then
        let mutable eventChance = (0.0025 + ctx.GetEffect "starEventChance") * chanceRatio
        if ctx.Astromancy then eventChance <- eventChance * 2.0
        let autoChance = getAstroEventAutoChance ctx
        let numberEvents = jsRound (days * eventChance * autoChance)
        if numberEvents > 0.0 && ctx.AstronomyResearched then
            ctx.AddResEvent "starchart" numberEvents
        let celestialBonus =
            if ctx.CelestialMechanics then
                if ctx.IronWill then 1.6 else 1.2
            else 1.0
        let sciBonus = numberEvents * 25.0 * celestialBonus * (1.0 + ctx.GetEffect "scienceRatio")
        ctx.AddResEvent "science" sciBonus
        totalEvents <- totalEvents + numberEvents

    // meteors
    let iwChance = if ctx.IronWill then 40.0 else 0.0
    let baseChance = 10.0 * chanceRatio
    if ctx.MiningResearched then
        let numberEvents = jsRound (days * (baseChance + iwChance) / 10000.0)
        let mutable mineralsAmt = 50.0 + 25.0 * ctx.GetEffect "mineralsRatio"
        let minerologyBonus = ctx.GetEffect "academyMeteorBonus"
        if ctx.IronWill then mineralsAmt <- mineralsAmt + mineralsAmt * 0.1
        mineralsAmt <- mineralsAmt * (1.0 + ctx.GetEffect "mineralsPolicyRatio" / 3.0)
        mineralsAmt <- mineralsAmt * (1.0 + minerologyBonus)
        ctx.AddResEvent "minerals" (numberEvents * mineralsAmt)
        if ctx.CelestialMechanics then
            ctx.AddResEvent "science" (numberEvents * 15.0 * (1.0 + ctx.GetEffect "scienceRatio"))
        if ctx.Prospecting then
            ctx.AddResEvent "iron" (numberEvents * 5.0 * (1.0 + minerologyBonus))
        totalEvents <- totalEvents + numberEvents

    // 0.035% unicorns in Iron Will (+ zebra drift)
    if ctx.IronWill then
        if ctx.UnicornsValue () < 2.0 && ctx.ArcheryResearched then
            let numberEvents = jsRound (days * 17.0 * unicornChanceRatio / 100000.0)
            ctx.AddResEvent "unicorns" numberEvents
            totalEvents <- totalEvents + numberEvents
        if ctx.ZebrasValue () > 0.0 && ctx.ZebrasValue () < ctx.ZebrasMax () then
            let numberEvents = jsRound (days * 500.0 / 100000.0)
            ctx.AddResEvent "zebras" numberEvents
            totalEvents <- totalEvents + numberEvents

    // 0.035% unicorns in Pacifism
    if ctx.PacifismActive && ctx.UnicornsValue () < 2.0 && ctx.AnimalResearched then
        let numberEvents = jsRound (days * 17.0 * unicornChanceRatio / 100000.0)
        ctx.AddResEvent "unicorns" numberEvents
        totalEvents <- totalEvents + numberEvents

    // rifts
    let numberEvents = jsRound (days * ctx.GetEffect "riftChance" * unicornChanceRatio)
    ctx.AddResEvent "unicorns" (numberEvents * 500.0)
    totalEvents <- totalEvents + numberEvents

    // alicorns
    let aliChance =
        ctx.GetEffect "alicornChance"
        * (1.0 + getLimitedDR (ctx.GetEffect "alicornPerTickRatio") 1.2)
    let aliEvents = jsRound (days * aliChance)
    if aliEvents >= 1.0 then
        ctx.AddResEvent "alicorn" aliEvents
        ctx.OnAlicornUpgrade ()
    totalEvents <- totalEvents + aliEvents

    // ivory meteors (rand(1500) only on hit)
    let ivEvents = jsRound (days * ctx.GetEffect "ivoryMeteorChance" * unicornChanceRatio)
    if ivEvents > 0.0 then
        let ivoryRoll = uniformRandomInteger ctx.Rand 0.0 1500.0
        let ivory = 250.0 + float ivoryRoll * (1.0 + ctx.GetEffect "ivoryMeteorRatio")
        ctx.AddResEvent "ivory" (ivory * ivEvents)
    totalEvents <- totalEvents + ivEvents

    let yearsOffset = floor (days / (daysPerSeason * float (List.length seasons)))

    // antimatter yearly production
    if ctx.EnergyBalanced then
        let yearProd =
            ctx.GetEffect "antimatterProduction"
            * (1.0 + ctx.GetEffect "antimatterPolicyRatio")
            * (1.0 + ctx.GetEffect "pyramidPerYearRatio")
        ctx.AddResEvent "antimatter" (yearProd * yearsOffset)

    // spaceBeacon.action (val=0 seam) then the mid-FF cache refresh
    ctx.SpaceBeaconAction ()
    ctx.UpdateCaches ()

    ctx.AddResPerTick "relic" (ctx.GetEffect "relicPerDay" * days)

    // temporal paradox void EV
    let temporalParadoxChance = ctx.GetEffect "temporalParadoxChance"
    if temporalParadoxChance > 0.0 then
        let daysInParadox = 10.0 + ctx.GetEffect "temporalParadoxDay"
        let daysBetweenParadox = daysInParadox + 100.0 * max 1.0 (1.0 / temporalParadoxChance)
        let percentTimeInParadox = daysInParadox / daysBetweenParadox
        let voidStatistical = (ctx.GetEffect "temporalParadoxVoid" + 1.0) / 2.0
        ctx.AddResEvent "void" (floor (voidStatistical * days * percentTimeInParadox))

    // crypto walk (antimatter-gated; loopOrGaussian draws + adjustCryptoPrice)
    if ctx.AntimatterResearched then
        let cryptoBase () : float =
            let y = ctx.Rand ()
            if y < 0.3 then log1p ((y - 0.3) / (0.3 * 40000.0))
            elif y < 0.6 then 0.0
            else log1p ((y - 0.6) / (0.4 * 40000.0))
        let logIncrease =
            loopOrGaussianApproximation
                ctx.Rand
                (days - 1.0) false 1.2499270834635280e-6 1.4427062504448777e-10
                (log1p (-1.0 / 40000.0))
                (log1p (1.0 / 40000.0))
                cryptoBase
        st <- { st with CryptoPrice = st.CryptoPrice * exp logIncrease }
        // adjustCryptoPrice (the daily walk) — draws rand(10) + rand()
        let r10 = uniformRandomInteger ctx.Rand 0.0 10.0
        let rf = ctx.Rand ()
        st <- { st with CryptoPrice = st.CryptoPrice + st.CryptoPrice * (1.0 - (r10 % 3.0)) * rf / 40000.0 }
        if st.CryptoPrice > 1100.0 then
            let rc = ctx.Rand ()
            st <- { st with CryptoPrice = st.CryptoPrice * (0.7 + 0.1 * rc) }

    // cap years skipped at 500 in the 1000 Years challenge
    let mutable yearsOffset = yearsOffset
    if ctx.Year1000Active && st.Year + yearsOffset > 500.0 then
        yearsOffset <- max (500.0 - st.Year) 0.0

    // millennium paragon
    let paragon = floor ((st.Year + yearsOffset) / 1000.0) - floor (st.Year / 1000.0)
    if paragon > 0.0 then
        ctx.OnParagon paragon
    ctx.OnMillenniumKarma paragon

    let oldYear = st.Year
    st <- { st with Year = st.Year + yearsOffset }
    ctx.OnYearsAdvanced yearsOffset

    // alicornmancy: one unicorn per 2 crossed years
    let numTwoYears = floor (st.Year / 2.0) - floor (oldYear / 2.0)
    if numTwoYears > 0.0 && ctx.Alicornmancy && ctx.PacifismActive && ctx.AnimalResearched && ctx.UnicornsValue () < 2.0 then
        ctx.AddResEvent "unicorns" (min (2.0 - ctx.UnicornsValue ()) numTwoYears)

    st, totalEvents
