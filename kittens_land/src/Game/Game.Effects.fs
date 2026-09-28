module Game.Effects

// game-08: the global effects cache (orig GamePage.updateCaches, game.js
// L2698-2717 + core.js TabManager.updateEffectCached L142-174 + provider).
// Managers contribute in fixed order: workshop, religion, bld, challenges,
// prestige, space, time, village, science. Each manager: registry names =
// its effectsBase keys ∪ its items' effect keys ∪ (bld) stage keys; base seeds
// the value; items contribute provider-scaled effects; LDR folds demand ratios.

open Game.Types

type EffectsCache =
    { Values: Map<string, float> }

let empty : EffectsCache = { Values = Map.empty }

/// game.getEffect(name) — missing effects read as 0 (JS `|| 0` at call sites;
/// the cache itself simply lacks the key).
let getEffect (cache: EffectsCache) (name: string) : float =
    match Map.tryFind name cache.Values with
    | Some v -> v
    | None -> 0.0

/// core.js _hasLimitedDiminishingReturn: demand ratios diminish as a WHOLE.
let hasLimitedDR (name: string) : bool =
    name = "catnipDemandRatio"
    || name = "fursDemandRatio"
    || name = "ivoryDemandRatio"
    || name = "spiceDemandRatio"
    || name = "unhappinessRatio"

/// One manager group for aggregation: base table (may be empty) + items, each
/// an effect table plus a PROVIDER — (effectName → effectValue → contribution),
/// exactly like core.js metadata.provider.getEffect. Buildings: Max-suffix ×val
/// (library excepted), coalRatioGlobal raw, rest ×on (Game.Buildings.provider).
/// Research/upgrades: raw contribution, gated by the caller on researched.
type ManagerGroup =
    { Base: Map<string, float>
      Items: (Map<string, float> * (string -> float -> float)) list }

/// orig TabManager.updateEffectCached for one group → contributions map.
let private aggregateGroup (g: ManagerGroup) : Map<string, float> =
    // registry = base keys ∪ item effect keys
    let registry =
        let mutable names = g.Base |> Map.toList |> List.map fst
        for (effects, _) in g.Items do
            names <- names @ (effects |> Map.toList |> List.map fst)
        names |> List.distinct

    let mutable existing =
        registry |> List.map (fun n -> (n, g.Base |> Map.tryFind n |> Option.defaultValue 0.0)) |> Map.ofList

    for (effects, provider) in g.Items do
        for KeyValue(name, effectValue) in effects do
            if existing |> Map.containsKey name then
                let contribution = provider name effectValue
                if contribution <> 0.0 then
                    existing <- existing |> Map.add name (existing.[name] + contribution)

    existing

/// orig updateCaches fresh+buildings slice: the per-manager aggregation with
/// LDR folding, summed into the global cache in the fixed manager order.
let updateCaches (cache: EffectsCache) (groups: ManagerGroup list) : EffectsCache =
    let mutable globalEffects = Map.empty<string, float>

    for g in groups do
        let existing = aggregateGroup g
        for KeyValue(name, effect) in existing do
            let mutable effect = effect
            if hasLimitedDR name && effect <> 0.0 then
                effect <- Game.Math.getLimitedDR effect 1.0
            globalEffects <-
                globalEffects
                |> Map.change name (function
                    | Some prev -> Some(prev + effect)
                    | None -> Some effect)

    { Values = globalEffects }
