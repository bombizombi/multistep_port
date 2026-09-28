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
      CryptoPrice: float }   // bcoin random walk (calendar-10)

let init : CalendarState =
    { Year = 0.0
      Day = 0.0
      Season = 0
      Weather = None
      Cycle = 0
      CycleYear = 0
      CryptoPrice = 1000.0
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
      OnNewDayTail: CalendarState -> CalendarState } // orig onNewDay tail: game.upgrade({policies:["authocracy"]}) — the "policy hack" whose updateCaches refreshes ALL effects daily (calendar.js L730)

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
    let mutable st = st

    // (observeRemainingTime countdown: observe events are calendar-03, none at fresh)

    let previousIntDay = floor st.Day
    st <- { st with Day = st.Day + (1.0 + ctx.TimeAccelerationRatio) / ticksPerDay }
    st <- roundToCentiday st
    // time.flux bookkeeping skipped (time-01 seam)

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
