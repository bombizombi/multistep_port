module Game.Catalog.BaseEffects

// resources-06 data basis: the fresh-state global effect values that caps are
// computed from. In orig these live in TWO tables — bld.effectsBase
// (js/buildings.js L2388) and the time manager's effectsBase (js/time.js L651) —
// which together seed the global effects cache before any building/upgrades exist.
// When game-08 (effects cache) lands, this catalog becomes its seed data.

let baseEffects : Map<string, float> =
    Map.ofList
        [ // --- bld.effectsBase (js/buildings.js) ---
          "catnipMax", 5000.0
          "woodMax", 200.0
          "mineralsMax", 250.0
          "coalMax", 60.0
          "ironMax", 50.0
          "titaniumMax", 2.0
          "goldMax", 10.0
          "oilMax", 1500.0
          "uraniumMax", 250.0
          "unobtainiumMax", 150.0
          "antimatterMax", 100.0
          "manpowerMax", 100.0
          "scienceMax", 250.0
          "cultureMax", 100.0
          "faithMax", 100.0
          // hut/logHouse/mansion "FakeBought" pollution entries are cost hacks,
          // not caps — owned by the buildings units (buildings-01).
          // --- time manager effectsBase (js/time.js) ---
          "heatPerTick", 0.01
          "heatMax", 100.0
          "temporalFluxMax", 3000.0 // 60 * 10 * 5: 10 minutes at ticksPerSecond 5
        ]

/// game.getEffect(name) at fresh state: the effects cache IS this table.
let getEffect (name: string) : float =
    match Map.tryFind name baseEffects with
    | Some v -> v
    | None -> 0.0
