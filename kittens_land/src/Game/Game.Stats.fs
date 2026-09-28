module Game.Stats

// stats-01..03: all-run + current-run stat tables, lifecycle, accessors.
// Sources: js/stats.js L4-133 (defs), L135-182 (resetState/save/load/getStat/
// getStatCurrent/resetStatsCurrent). The 3 calculate stats (averageKittens,
// transcendenceTier, totalChallengesCompleted) are functions of live state —
// evaluated on getStatCurrent via the StatsContext getters.

open System

type StatsContext =
    { TotalYears: float
      TranscendenceTier: int
      KittensResValue: float
      CalendarYear: float
      ChallengeCompletions: int }

type StatsPool =
    { // all-run values (stats.js `stats`)
      Values: Map<string, float>
      Unlocked: Set<string>
      // current-run values (stats.js `statsCurrent`; calculate stats stored too,
      // recomputed on getStatCurrent exactly like orig)
      Current: Map<string, float> }

let statDefs = Game.Catalog.World.statDefs
let statCurrentDefs = Game.Catalog.World.statCurrentDefs

let init () : StatsPool =
    { Values = statDefs |> List.map (fun s -> (s.Name, s.InitialVal)) |> Map.ofList
      Unlocked = statDefs |> List.filter (fun s -> s.StartsUnlocked) |> List.map (fun s -> s.Name) |> Set.ofList
      Current = statCurrentDefs |> List.map (fun s -> (s.Name, 0.0)) |> Map.ofList }

let resetState (_sp: StatsPool) : StatsPool = init ()

/// orig getStat: the mutable meta value (callers bump it in place).
let getStat (sp: StatsPool) (name: string) : float =
    sp.Values |> Map.tryFind name |> Option.defaultValue 0.0

let bumpStat (name: string) (delta: float) (sp: StatsPool) : StatsPool =
    { sp with Values = sp.Values |> Map.change name (function Some v -> Some(v + delta) | None -> Some delta) }

let setStat (name: string) (value: float) (sp: StatsPool) : StatsPool =
    { sp with Values = sp.Values |> Map.add name value }

/// orig getStatCurrent: calculate stats recompute from live state on read.
let getStatCurrent (sp: StatsPool) (ctx: StatsContext) (name: string) : float =
    match name with
    | "averageKittens" ->
        if ctx.TotalYears <> 0.0 then
            ctx.TotalYears / ceil (ctx.TotalYears / 100.0) |> ignore
            // orig: totalKittens / ceil(totalYears / 100)
            getStat sp "totalKittens" / ceil (ctx.TotalYears / 100.0)
        else 0.0
    | "transcendenceTier" -> float ctx.TranscendenceTier
    | "totalChallengesCompleted" -> float ctx.ChallengeCompletions
    | "timePlayed" ->
        // orig: toDisplaySeconds(trueYear * seasonsPerYear * daysPerSeason * ticksPerDay / tps)
        // display-only; raw value = trueYear * 100 * 10 ticks
        let _ = ctx.CalendarYear
        sp.Current |> Map.tryFind name |> Option.defaultValue 0.0
    | _ -> sp.Current |> Map.tryFind name |> Option.defaultValue 0.0

let bumpStatCurrent (name: string) (delta: float) (sp: StatsPool) : StatsPool =
    { sp with Current = sp.Current |> Map.change name (function Some v -> Some(v + delta) | None -> Some delta) }

let resetStatsCurrent (sp: StatsPool) : StatsPool =
    { sp with Current = sp.Current |> Map.map (fun _ _ -> 0.0) }
