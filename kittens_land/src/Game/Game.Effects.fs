module Game.Effects

// game-08: the global effects cache (orig GamePage.updateCaches, game.js
// L2673-2717). updateCaches wipes the cache and re-aggregates every manager's
// updateEffectCached. At fresh state the ONLY contributors are the base tables
// (bld.effectsBase + time.effectsBase) — every other manager aggregates zero
// (no buildings, upgrades, kittens). Building val×effects aggregation arrives
// with buildings-01; this module's shape is the contract for it.

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

/// orig updateCaches() fresh slice: re-seed from the base tables. Managers with
/// no state (workshop/religion/village/... at fresh) contribute nothing.
let updateCaches (cache: EffectsCache) : EffectsCache =
    { Values = Game.Catalog.BaseEffects.baseEffects }
