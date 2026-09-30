module Game.Challenges

// challenges-01..04: manager skeleton + all 10 challenge defs + the stacked
// effect provider. Sources: js/challenges.js L1-34 (ctor + provider), L42-499
// (defs incl. calculateEffects active/inactive tables), L499-660 (lifecycle,
// isActive, completions, researchChallenge). Completion conditions that need
// space/aiCore are seams (never fire at this slice). enable/disable (challenge
// entry) runs through the harness setchallenge resop (D014) mirroring the
// controller path.

open Game.Types

type ChallengeState =
    { Unlocked: bool
      Pending: bool
      Active: bool
      Researched: bool
      On: int }

type ChallengePool =
    { Challenges: Map<string, ChallengeState>
      Order: string list }

let init () : ChallengePool =
    let order = Game.Catalog.World.challengeDefs |> List.map (fun c -> c.Name)
    { Challenges =
        Game.Catalog.World.challengeDefs
        |> List.map (fun c -> (c.Name, { Unlocked = c.StartsUnlocked; Pending = false; Active = false; Researched = false; On = 0 }))
        |> Map.ofList
      Order = order }

let resetState (_cp: ChallengePool) : ChallengePool = init ()

let getChallenge (cp: ChallengePool) (name: string) : ChallengeState = cp.Challenges.[name]

let isActive (cp: ChallengePool) (name: string) : bool = cp.Challenges.[name].Active

let anyChallengeActive (cp: ChallengePool) : bool =
    cp.Order |> List.exists (fun n -> cp.Challenges.[n].Active)

let getCountCompletions (cp: ChallengePool) : int =
    cp.Order |> List.sumBy (fun n -> cp.Challenges.[n].On)

let getCountUniqueCompletions (cp: ChallengePool) : int =
    cp.Order |> List.sumBy (fun n -> if cp.Challenges.[n].Researched then 1 else 0)

let getCountPending (cp: ChallengePool) : int =
    cp.Order |> List.sumBy (fun n -> if cp.Challenges.[n].Pending then 1 else 0)

/// orig researchChallenge (L660+): researched, on++, active off. Completion
/// conditions are polled in update() — space/aiCore seams never fire here.
let researchChallenge (name: string) (cp: ChallengePool) : ChallengePool =
    let c = cp.Challenges.[name]
    if c.Active then
        { cp with
            Challenges =
                cp.Challenges
                |> Map.add name { c with Researched = true; On = c.On + 1; Active = false } }
    else
        cp

/// Harness-facing enable/abandon (the controller's enable/disable path: set
/// active + recalculate effects — the caller refreshes the cache).
let setActive (name: string) (active: bool) (cp: ChallengePool) : ChallengePool =
    let c = cp.Challenges.[name]
    let c' =
        if active then
            // orig enable(): unlocked gate + currentChallenge swap; ironWill mirror
            let unlocked = c.Unlocked || name = "ironWill"
            { c with Active = unlocked; Unlocked = unlocked }
        else
            { c with Active = false }
    { cp with Challenges = cp.Challenges |> Map.add name c' }

// --- calculateEffects (the active/inactive tables) ----------------------------
// Each returns the EFFECTS TABLE for the meta. Orig mutates self.effects via
// the def closures; val-constant per state (active/on), so pure functions of
// (state, getEffect) reproduce them exactly.

let private ldr = Game.Math.getLimitedDR

/// orig getTradeBonusEffect (L318-330): tradepost ladder, requires completions
/// and an inactive challenge. tradepostVal is the live building val; the
/// tradeRatio 0.015 is the tradepost meta's own static effect.
let getTradeBonusEffect (cp: ChallengePool) (getEffect: string -> float) (tradepostVal: float) : float =
    let c = cp.Challenges.["pacifism"]
    if c.On = 0 || c.Active then 0.0
    else
        let tradeKnowledge = getEffect "tradeKnowledge"
        let tradepostLimit = (7.0 + tradeKnowledge * 3.0) * (0.99 + tradeKnowledge * 0.01)
        let tradepostRatioLimit = ldr (0.099 + tradeKnowledge * 0.0075) 0.25
        0.015 * (min tradepostLimit (tradepostVal * tradepostRatioLimit))

/// unicornTears price weight table (L420-450). NegativeInfinity sentinels keep
/// already-priced resources out of the modification; "default" 10 for the rest.
let private resWeights : Map<string, float> =
    Map.ofList [
        "catnip", 0.0; "wood", 0.5; "minerals", 0.35; "iron", 1.0
        "titanium", 200.0; "uranium", 150000.0; "unobtainium", 1e6; "antimatter", 1e10
        "starchart", 200.0; "spice", 250.0
        "beam", 0.75; "slab", 0.75; "plate", 5.0; "concrate", 25.0; "gear", 20.0
        "alloy", 300.0; "eludium", 1e8; "ship", 1500.0; "tanker", 150000.0; "kerosene", 7000.0
        "parchment", 2.0; "compedium", 20.0; "blueprint", 50.0; "thorium", 180000.0
        "unicorns", System.Double.NegativeInfinity
        "alicorn", System.Double.NegativeInfinity
        "tears", System.Double.NegativeInfinity
        "megalith", System.Double.NegativeInfinity
        "default", 10.0
    ]

let getResWeight (resName: string) : float =
    match resWeights |> Map.tryFind resName with
    | Some w -> w
    | None -> resWeights.["default"]

/// unicornTears.sumPricesWeighted (L401-412): weight×val per line, NaN lines
/// skipped (indeterminate 0×Infinity), NaN totals collapse to 0.
let sumPricesWeighted (prices: (string * float) list) : float =
    let mutable total = 0.0
    for resName, value in prices do
        let lineValue = getResWeight resName * value
        if not (System.Double.IsNaN lineValue) then total <- total + lineValue
    if System.Double.IsNaN total then 0.0 else total

/// Per-challenge calculateEffects. Returns the override table to MERGE over
/// the static def effects (orig writes onto self.effects).
let private calculateEffectsFor (cp: ChallengePool) (getEffect: string -> float) (tradepostVal: float) (name: string) : Map<string, float> =
    let c = cp.Challenges.[name]
    match name with
    | "winterIsComing" ->
        if c.Active then
            Map.ofList ["springCatnipRatio", 0.0; "summerSolarFarmRatio", 0.0; "coldChance", 0.05; "coldHarshness", -0.02]
        else
            Map.ofList ["springCatnipRatio", 0.05; "summerSolarFarmRatio", 0.05; "coldChance", 0.0; "coldHarshness", 0.0]
    | "anarchy" ->
        if c.Active then
            let c' = getEffect "catnipDemandRatio" |> ignore
            Map.ofList [
                "masterSkillMultiplier", 0.0
                "kittenLaziness", 0.5 + ldr (0.05 * float c.On) 0.25
            ]
        else
            Map.ofList ["masterSkillMultiplier", 0.2; "kittenLaziness", 0.0]
    | "energy" ->
        // js/challenges.js L116-150: active table (energyProduction/consumption
        // challenges) — seams at this slice (no energy buildings); static table
        // is the inactive/reward shape
        Map.empty
    | "atheism" ->
        // L150-189: no calculateEffects (reward effects only); static table
        Map.empty
    | "1000Years" ->
        // L189-230: calculateEffects active/reward tables (provider ×on still
        // applies — rewards only materialize once on >= 1)
        if c.Active then
            Map.ofList [
                "shatterCostReduction", 0.0
                "shatterCostIncreaseChallenge", 0.5
                "shatterVoidCost", 0.4
                "temporalPressCap", 0.0
                "heatEfficiency", 0.0
                "heatCompression", 0.0
            ]
        else
            Map.ofList [
                "shatterCostReduction", -0.02
                "shatterCostIncreaseChallenge", 0.0
                "shatterVoidCost", 0.0
                "temporalPressCap", 10.0
                "heatEfficiency", 0.1
                "heatCompression", 0.05
            ]
    | "blackSky" ->
        // L230-261: no effects table
        Map.empty
    | "pacifism" ->
        // L261-331: full active/inactive tables. steamworksFakeBought:
        // floor(1.5*on || 1)/(on || 1). Inactive tradeKnowledgeRatio comes from
        // getTradeBonusEffect (tradepost ladder, 0 while active or on = 0).
        if c.Active then
            Map.ofList [
                "alicornPerTickRatio", 0.0
                "tradeKnowledge", 0.0
                "weaponEfficency", -0.1
                "policyFakeBought", 1.0
                "embassyFakeBought", 1.0
                "steamworksFakeBought", System.Math.Floor(max 1.0 (1.5 * float c.On)) / (max 1.0 (float c.On))
                "tradeKnowledgeRatio", 0.0
            ]
        else
            Map.ofList [
                "alicornPerTickRatio", 0.1
                "tradeKnowledge", 1.0
                "weaponEfficency", 0.0
                "policyFakeBought", 0.0
                "embassyFakeBought", 0.0
                "steamworksFakeBought", 0.0
                "tradeKnowledgeRatio", getTradeBonusEffect cp getEffect tradepostVal
            ]
    | "postApocalypse" ->
        // L458-494: arrivalSlowdown while active; cryochamberSupport is 1 both ways
        if c.Active then
            Map.ofList ["arrivalSlowdown", 10.0; "cryochamberSupport", 1.0]
        else
            Map.ofList ["arrivalSlowdown", 0.0; "cryochamberSupport", 1.0]
    | "unicornTears" ->
        // L333-458: MAUSOLEUM-style feature gate — getFeatureFlag always true
        // in the harness
        if c.Active then
            Map.ofList [
                "bonfireTearsPriceRatioChallenge", ldr (1.2 + 0.03 * float c.On) 2.5
                "scienceTearsPricesChallenge", 0.25
                "workshopTearsPricesChallenge", 0.01
                "cathPollutionPerTearOvercapped", 3.0
                "unicornsMax", 10.0
                "tearsMax", 1.0
                "alicornMax", 0.2
                "zigguratIvoryPriceRatio", 0.0
            ]
        else
            Map.ofList [
                "bonfireTearsPriceRatioChallenge", 0.0
                "scienceTearsPricesChallenge", 0.0
                "workshopTearsPricesChallenge", 0.0
                "cathPollutionPerTearOvercapped", 0.0
                "unicornsMax", 0.0
                "tearsMax", 0.0
                "alicornMax", 0.0
                "zigguratIvoryPriceRatio", -0.003
            ]
    | "postApocalypse" ->
        // L458-499: pollution challenge; effects none at this slice
        Map.empty
    | _ -> Map.empty

/// The challenges manager group: provider = amt × on (stackOptions: noStack /
/// LDRLimit / capMagnitude), then calculateEffects overrides merged.
let challengesGroup (cp: ChallengePool) (getEffect: string -> float) (tradepostVal: float) : Game.Effects.ManagerGroup =
    { Base = Map.empty
      Items =
        Game.Catalog.World.challengeDefs
        |> List.choose (fun def ->
            let state = cp.Challenges.[def.Name]
            if state.On > 0 || state.Active then
                // merge calculateEffects overrides over the static table
                let overrides = calculateEffectsFor cp getEffect tradepostVal def.Name
                let effects =
                    overrides
                    |> Map.fold (fun acc k v -> Map.add k v acc) def.Effects
                let stackOf k =
                    def.StackOptions |> Map.tryFind k |> Option.defaultValue ({ NoStack = false; LDRLimit = None; CapMagnitude = None })
                Some(effects, (fun (effectName: string) (v: float) ->
                    let so = stackOf effectName
                    if so.NoStack then v
                    else
                        let mutable amt = v * float state.On
                        match so.LDRLimit with
                        | Some lim -> amt <- ldr amt lim
                        | None -> ()
                        match so.CapMagnitude with
                        | Some cap -> amt <- max (-cap) (min cap amt)
                        | None -> ()
                        amt))
            else
                None) }
