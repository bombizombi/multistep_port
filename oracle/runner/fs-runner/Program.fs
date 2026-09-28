module FsRunner.Program

// oracle-04 (port side): execute a scenario against the F# Game core and emit
// snapshots in the same JSON shape as oracle/runner/orig-driver.js, so
// tools/diff-snapshots.js can compare implementations bit-exactly.
//
// Scope note (session 2026-09-28-04): only the resources pipeline exists in the
// core so far (resources-01..03). Actions other than `resop` are logged to
// actionLog as not-yet-ported rather than executed. Snapshot comparison is done
// with --include filters on the subtrees the port owns (see D014).

open System
open System.IO
open Game.Types
open Game.Resources

// ---------------------------------------------------------------------------
// Minimal JSON writer (hand-rolled: exact float formatting control).
// .NET shortest-roundtrip double formatting matches V8's JSON.stringify; -0.0 is
// normalized to 0.0 (JS prints "0").

let private norm (v: float) = if v = 0.0 then 0.0 else v // maps -0.0 onto +0.0

let private esc (s: string) =
    s.Replace("\\", "\\\\").Replace("\"", "\\\"")

let num (v: float) : string =
    let v = norm v
    if Double.IsNaN v || Double.IsInfinity v then "null" else string v

// ---------------------------------------------------------------------------
// Scenario parsing (subset of oracle/runner/scenario.js; same file format)

type Move = { Tick: int; Action: string; Args: string list }

type Scenario =
    { Name: string
      Seed: int
      Checkpoints: int list
      Moves: Move list
      MaxTick: int }

let parseScenario (text: string) : Scenario =
    let mutable name = "unnamed"
    let mutable seed = 20260927
    let mutable checkpoints = []
    let mutable moves = []
    let mutable maxTick = 0

    for raw in text.Replace("\r", "").Split('\n') do
        let line = raw.Trim()
        if line <> "" then
            if line.StartsWith("#") then
                let rest = line.Substring(1).Trim()
                let idx = rest.IndexOf(':')
                if idx >= 0 then
                    let key = rest.Substring(0, idx).Trim()
                    let value = rest.Substring(idx + 1).Trim()
                    match key with
                    | "name" -> name <- value
                    | "seed" -> seed <- int value
                    | "checkpoints" ->
                        for part in value.Split(',') do
                            let t = int (part.Trim())
                            checkpoints <- t :: checkpoints
                            if t > maxTick then maxTick <- t
                    | _ -> ()
            else
                let parts = line.Split(' ', StringSplitOptions.RemoveEmptyEntries) |> List.ofArray
                match parts with
                | tickStr :: action :: args ->
                    let tick = int tickStr
                    moves <- { Tick = tick; Action = action; Args = args } :: moves
                    if tick > maxTick then maxTick <- tick
                | _ -> ()

    checkpoints <- 0 :: maxTick :: checkpoints // snapshot at 0 and end always
    { Name = name
      Seed = seed
      Checkpoints = checkpoints |> List.distinct |> List.sort
      Moves = moves |> List.rev |> List.sortBy (fun m -> m.Tick) // rev: restore file order (prepend), stable sort keeps it within a tick
      MaxTick = maxTick }

// ---------------------------------------------------------------------------
// Scenario execution against the F# core

type ExecResult =
    { Snapshots: (int * (string * (float * float * bool * float)) list * int) list // tick, resources((name,(v,m,u,p))), rngDraws
      ActionLog: (int * string * string list * float option * string option) list } // tick, action, args, result?, reason?

let execute (scenario: Scenario) : ExecResult =
    let mutable pool = init Game.Catalog.Resources.resourceDefs
    // calendarDay: owned by calendar-01. Verified against the golden fixture:
    // after resetState the calendar sits at day = 0 (spring, year 0). The
    // paradox gate (day < 0) therefore does not trigger at tick 0.
    let mutable calendarDay = 0
    let mutable rngDraws = 0
    let mutable actionLog = []
    let mutable snapshots = []
    let cpSet = Set.ofList scenario.Checkpoints

    let takeSnapshot () =
        let resources =
            pool.Order
            |> List.choose (fun n ->
                match get pool n with
                | Some r -> Some(n, (r.Value, r.MaxValue, r.Unlocked, 0.0)) // p: perTickCached is resources-05
                | None -> None)
        (0, resources, rngDraws)

    let doMove (m: Move) =
        match m.Action with
        | "resop" ->
            match m.Args with
            | [ fn; resName; valueArg ] ->
                let v = float valueArg
                // orig get(name) returns false for unknown names; addRes then
                // reads/writes a primitive — writes no-op, reads give undefined,
                // and the return value is NaN (JSON null). Mirror that outcome.
                let known = get pool resName |> Option.isSome
                let pool', delta =
                    if not known then pool, nan
                    else
                        match fn with
                        | "addRes" -> addRes calendarDay v false false resName pool
                        | "addResEvent" -> addResEvent calendarDay resName v pool
                        | "addResPerTick" -> addResPerTick calendarDay resName v pool
                        | other ->
                            actionLog <- (0, m.Action, m.Args, None, Some(sprintf "unknown fn %s" other)) :: actionLog
                            pool, 0.0
                pool <- pool'
                actionLog <- (m.Tick, "resop", m.Args, Some delta, None) :: actionLog
            | _ -> actionLog <- (m.Tick, "resop", m.Args, None, Some "bad args") :: actionLog
        | "gather"
        | "buy"
        | "craft"
        | "assign"
        | "research"
        | "upgrade"
        | "policy"
        | "hunt"
        | "praise"
        | "save"
        | "load" -> actionLog <- (m.Tick, m.Action, m.Args, None, Some "not-yet-ported") :: actionLog
        | "observe" -> ()
        | other -> actionLog <- (m.Tick, other, m.Args, None, Some(sprintf "unknown action %s" other)) :: actionLog

    // tick-0 moves, then snapshot (same semantics as orig-driver, D010)
    for m in scenario.Moves do
        if m.Tick = 0 then doMove m
    snapshots <- takeSnapshot () :: snapshots

    // ticks 1..maxTick would call the port's tick() — not ported yet; any moves
    // beyond tick 0 are recorded as not-yet-ported so nothing executes silently.
    for t in 1..scenario.MaxTick do
        for m in scenario.Moves do
            if m.Tick = t then actionLog <- (t, m.Action, m.Args, None, Some "not-yet-ported") :: actionLog

    { Snapshots = List.rev snapshots
      ActionLog = List.rev actionLog }

// ---------------------------------------------------------------------------
// Catalog dump (--dump-catalog): same shape as orig-driver.js

let dumpCatalog () =
    let defJson (d: ResourceDef) =
        let b (v: bool) = if v then "true" else "false"
        let opt (o: string option) = match o with Some s -> sprintf "\"%s\"" (esc s) | None -> "null"
        let rule = if d.RefundableRule = EnergyBalanced then "true" else "false"
        sprintf
            "{\"name\":\"%s\",\"type\":\"%s\",\"visible\":%s,\"color\":%s,\"craftable\":%s,\"calculatePerTick\":%s,\"persists\":%s,\"aiCanDestroy\":%s,\"transient\":%s,\"tag\":%s,\"isNotRefundable\":%s,\"calculatePerDay\":%s,\"calculatePerTickAndDay\":%s,\"calculateOnYear\":%s,\"hasCustomIsRefundable\":%s}"
            (esc d.Name) (esc d.Category) (b d.Visible) (opt d.Color) (b d.Craftable) (b d.CalculatePerTick)
            (b d.Persists) (b d.AiCanDestroy) (b d.Transient) (opt d.Tag) (b d.IsNotRefundable) (b d.CalculatePerDay)
            (b d.CalculatePerTickAndDay) (b d.CalculateOnYear) rule

    let defs = Game.Catalog.Resources.resourceDefs
    let items = defs |> List.map defJson |> String.concat ","
    "{\n  \"driver\": \"fs-runner\",\n  \"origCommit\": \"n/a (F# core)\",\n  \"catalog\": [" + items + "]\n}"

// ---------------------------------------------------------------------------
// Snapshot JSON (resources subtree only until more core exists)

let snapshotJson (tick: int, resources: (string * (float * float * bool * float)) list, rngDraws: int) : string =
    let resItems =
        resources
        |> List.map (fun (n, (v, m, u, p)) ->
            sprintf
                "\"%s\":{\"v\":%s,\"m\":%s,\"u\":%s,\"p\":%s}"
                (esc n)
                (num v)
                (num m)
                (if u then "true" else "false")
                (num p))
        |> String.concat ","
    sprintf "{\"tick\":%d,\"rngDraws\":%d,\"resources\":{%s}}" tick rngDraws resItems

let logJson ((tick, action, args, result, reason): int * string * string list * float option * string option) : string =
    let argStr = args |> List.map (fun a -> sprintf "\"%s\"" (esc a)) |> String.concat ","
    let tail =
        match result, reason with
        | Some r, _ -> sprintf "\"result\":%s" (num r)
        | None, Some w -> sprintf "\"reason\":\"%s\"" (esc w)
        | None, None -> "\"reason\":null"
    sprintf "{\"tick\":%d,\"action\":\"%s\",\"args\":[%s],%s}" tick (esc action) argStr tail

[<EntryPoint>]
let main argv =
    let args = List.ofArray argv
    match args with
    | [ "--dump-catalog"; outPath ] ->
        File.WriteAllText(outPath, dumpCatalog ())
        printfn "catalog: %d resources -> %s" Game.Catalog.Resources.resourceDefs.Length outPath
        0
    | [ scenarioPath; outPath ] ->
        let scenario = File.ReadAllText(scenarioPath) |> parseScenario
        let result = execute scenario
        let snaps = result.Snapshots |> List.map snapshotJson |> String.concat ",\n    "
        let logs = result.ActionLog |> List.map logJson |> String.concat ",\n    "
        let json =
            sprintf
                "{\n  \"driver\": \"fs-runner\",\n  \"scenario\": \"%s\",\n  \"seed\": %d,\n  \"origCommit\": \"n/a (F# core)\",\n  \"rngImpl\": \"splitmix32-seeded sfc32\",\n  \"snapshots\": [\n    %s\n  ],\n  \"actionLog\": [%s]\n}"
                (esc scenario.Name) scenario.Seed snaps logs
        File.WriteAllText(outPath, json)
        printfn
            "scenario \"%s\": %d ticks, %d snapshots -> %s"
            scenario.Name
            scenario.MaxTick
            result.Snapshots.Length
            outPath
        0
    | _ ->
        eprintfn "usage: dotnet run --project fs-runner -- <scenario.cat> <output.json>"
        eprintfn "       dotnet run --project fs-runner -- --dump-catalog <output.json>"
        2
