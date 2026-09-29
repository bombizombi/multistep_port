module Game.Time

// time-01/02 + void-01: TimeManager state (flux/heat/accelerated + CFU/VSU
// metas), temporal flux gain, per-tick acceleration drain; VoidManager with
// the spaceCathedral upgrade. Sources: js/time.js L1-158, js/void.js L1-44.
// The queue (time-14+) and shatter math (time-07+) are later slices.

open Game.Types

type TimeMeta =
    { Val: int
      On: int
      Unlocked: bool
      Researched: bool }

type TimePool =
    { Flux: float                 // years skipped by CF jumps (time.js flux)
      Heat: float
      IsAccelerated: bool
      CFUs: Map<string, TimeMeta>
      CfuOrder: string list
      VSUs: Map<string, TimeMeta>
      VsuOrder: string list }

let init () : TimePool =
    let mk () = { Val = 0; On = 0; Unlocked = false; Researched = false }
    { Flux = 0.0
      Heat = 0.0
      IsAccelerated = false
      CFUs = Game.Catalog.World.cfuDefs |> List.map (fun d -> (d.Name, mk ())) |> Map.ofList
      CfuOrder = Game.Catalog.World.cfuDefs |> List.map (fun d -> d.Name)
      VSUs = Game.Catalog.World.vsuDefs |> List.map (fun d -> (d.Name, mk ())) |> Map.ofList
      VsuOrder = Game.Catalog.World.vsuDefs |> List.map (fun d -> d.Name) }

let resetState (_tp: TimePool) : TimePool = init ()

let getCFU (tp: TimePool) (name: string) : TimeMeta = tp.CFUs.[name]
let getVSU (tp: TimePool) (name: string) : TimeMeta = tp.VSUs.[name]

/// orig gainTemporalFlux (L133-156): calendar tech gate; delta ms from the
/// harness clock; 5 flux/minute × (1 + accelerator timeRatio × val).
let gainTemporalFlux (tp: TimePool) (calendarResearched: bool) (nowMs: float) (timestampMs: float) (ticksPerSecond: float) (pool: ResPool) : TimePool * ResPool =
    if not calendarResearched then
        tp, pool
    else
        let delta = nowMs - timestampMs
        if delta <= 0.0 then
            tp, pool
        else
            let accelerator = tp.CFUs.["temporalAccelerator"]
            let timeRatio =
                (Game.Catalog.World.cfuDefs |> List.find (fun d -> d.Name = "temporalAccelerator")).Effects
                |> Map.tryFind "timeRatio" |> Option.defaultValue 0.0
            let energyRatio = 1.0 + float accelerator.Val * timeRatio
            let gained = Game.Math.jsRound (delta / (60.0 * 1000.0) * (ticksPerSecond * energyRatio))
            let pool', added = Game.Resources.addResEvent 0 "temporalFlux" gained pool
            tp, pool'

/// orig time.update flux part (L146-150): accelerated burns 1 flux/tick; auto-off
let update (tp: TimePool) (pool: ResPool) : TimePool * ResPool =
    let fluxValue = Game.Resources.get pool "temporalFlux" |> Option.map (fun r -> r.Value) |> Option.defaultValue 0.0
    if tp.IsAccelerated && fluxValue > 0.0 then
        let pool', _ = Game.Resources.addResEvent 0 "temporalFlux" -1.0 pool
        tp, pool'
    elif fluxValue = 0.0 && tp.IsAccelerated then
        { tp with IsAccelerated = false }, pool
    else
        tp, pool

/// orig time.js CFU provider (L26-32): CFU effects count only with the
/// chronoforge workshop tech researched; else ×on (stackable) raw.
let timeGroup (tp: TimePool) (chronoforgeResearched: bool) : Game.Effects.ManagerGroup =
    let cfuEffects (name: string) =
        (Game.Catalog.World.cfuDefs |> List.find (fun d -> d.Name = name)).Effects
    let vsuEffects (name: string) =
        (Game.Catalog.World.vsuDefs |> List.find (fun d -> d.Name = name)).Effects
    { Base = Map.empty
      Items =
        (tp.CfuOrder
         |> List.choose (fun n ->
             let m = tp.CFUs.[n]
             if m.On > 0 && chronoforgeResearched then
                 Some(cfuEffects n, (fun _ v -> v * float m.On))
             else None))
        @ (tp.VsuOrder
           |> List.choose (fun n ->
               let m = tp.VSUs.[n]
               if m.On > 0 then
                   Some(vsuEffects n, (fun _ v -> v * float m.On))
               else None)) }

// --- void-01: VoidManager -------------------------------------------------------

type VoidPool =
    { VUs: Map<string, TimeMeta>
      VuOrder: string list
      Faction: string option }

let initVoid () : VoidPool =
    { VUs =
        Game.Catalog.World.voidUpgradeDefs
        |> List.map (fun d -> (d.Name, { Val = 0; On = 0; Unlocked = false; Researched = false }))
        |> Map.ofList
      VuOrder = Game.Catalog.World.voidUpgradeDefs |> List.map (fun d -> d.Name)
      Faction = None }

let resetVoid (_vp: VoidPool) : VoidPool = initVoid ()

let getVU (vp: VoidPool) (name: string) : TimeMeta = vp.VUs.[name]

let voidGroup (vp: VoidPool) : Game.Effects.ManagerGroup =
    { Base = Map.empty
      Items =
        vp.VuOrder
        |> List.choose (fun n ->
            let m = vp.VUs.[n]
            if m.On > 0 then
                // spaceCathedral defines no effects table — provider yields 0s;
                // kept for the contract
                Some(Map.empty, (fun _ v -> v * float m.On))
            else None) }
