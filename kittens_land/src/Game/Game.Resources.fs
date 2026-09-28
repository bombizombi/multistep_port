module Game.Resources

// resources-02 + resources-03: the resPool registry and the core add/mutate
// pipeline (orig js/resources.js: constructor/get/reset L538-583, addRes family
// L642-687). Ported statement-for-statement per D003 — including the
// "res.maxValue || Number.MAX_VALUE" falsy-coercion and the karma roundtrip.

open Game.Types
open Game.Math

/// orig constructor: clone resourceData, value = 0, unlocked = false, no cap set.
/// (setVillage is deferred until the village manager exists — resources-02 note.)
let init (defs: ResourceDef list) : ResPool =
    let byName =
        defs
        |> List.map (fun d ->
            d.Name,
            { Def = d
              Value = 0.0
              Unlocked = false
              MaxValue = 0.0 })
        |> Map.ofList
    { Order = defs |> List.map (fun d -> d.Name)
      ByName = byName
      KarmaKittens = 0 }

/// orig get(): the resource or None (orig returns false).
let get (pool: ResPool) (name: string) : ResourceState option = pool.ByName |> Map.tryFind name

/// orig resPool.reset(): fresh pool from the same catalog.
let reset (pool: ResPool) : ResPool = init (pool.ByName |> Map.toList |> List.map (fun (_, s) -> s.Def))

/// orig addRes(res, addedValue, allowDuringParadoxes, preventLimitCheck).
/// calendarDay is game.calendar.day (owned by calendar-01; threaded in until then).
/// Returns the updated pool and the actual delta (orig's return value).
let addRes
    (calendarDay: int)
    (addedValue: float)
    (allowDuringParadoxes: bool)
    (preventLimitCheck: bool)
    (name: string)
    (pool: ResPool)
    : ResPool * float =

    if (calendarDay < 0 && not allowDuringParadoxes) || addedValue = 0.0 then
        pool, 0.0
    else
        let res = pool.ByName[name] // orig: get(name) must exist — catalog covers all
        let prevValue = res.Value

        // res.value = Math.min(prevValue + addedValue, Number.MAX_VALUE)
        let v1 = min (prevValue + addedValue) System.Double.MaxValue

        // if (!preventLimitCheck): limit = Math.max(prevValue, res.maxValue || MAX)
        // JS falsy: maxValue of 0 (unset) means "no limit".
        let v2 =
            if preventLimitCheck then
                v1
            else
                let limit = max prevValue (if res.MaxValue <> 0.0 then res.MaxValue else System.Double.MaxValue)
                min v1 limit

        // void is always an integer
        let v3 = if name = "void" then floor v2 else v2

        // NaN / dust guard
        let v4 = if System.Double.IsNaN v3 || v3 < 0.0000000001 then 0.0 else v3

        // karma roundtrip through the unlimited-DR curve
        let v5, karmaKittens =
            if name = "karma" then
                let kk = jsRound (getInverseUnlimitedDR v4 5.0) |> int
                getUnlimitedDR (float kk) 5.0, kk
            else
                v4, pool.KarmaKittens

        let updated = { res with Value = v5 }
        let pool' =
            { pool with
                ByName = pool.ByName |> Map.add name updated
                KarmaKittens = karmaKittens }

        // orig: return addedValue directly when unclamped (avoids double rounding)
        let delta = if v5 = prevValue + addedValue then addedValue else v5 - prevValue
        pool', delta

/// orig addResPerTick(name, value): paradox-gated (allowDuringParadoxes = false).
let addResPerTick (calendarDay: int) (name: string) (value: float) (pool: ResPool) : ResPool * float =
    addRes calendarDay value false false name pool

/// orig addResEvent(name, value): allowed during paradoxes.
let addResEvent (calendarDay: int) (name: string) (value: float) (pool: ResPool) : ResPool * float =
    addRes calendarDay value true false name pool
