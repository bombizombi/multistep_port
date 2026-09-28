//------------------------------------------------------------------------------
// GENERATED from oracle/fixtures/village-orig.json (orig @ 781e379f79f1).
// village-01 (data): job/role definitions incl. resolved calculateEffects
// values (the dump executes them exactly as the D012 upgrade path does),
// traits, and the kitten name pools. i18n titles omitted (UI layer).
// Never hand-edit — regenerate from the dump.
//------------------------------------------------------------------------------

module Game.Catalog.Village

type JobDef =
    { Name: string
      Modifiers: Map<string, float>
      CalculatedModifiers: Map<string, float> option
      StartsUnlocked: bool }

type TraitDef = { Name: string }

let jobDefs : JobDef list =
    [
      { Name = "woodcutter"; Modifiers = Map.ofList ["wood", 0.018]; CalculatedModifiers = None; StartsUnlocked = true }
      { Name = "farmer"; Modifiers = Map.ofList ["catnip", 1]; CalculatedModifiers = None; StartsUnlocked = false }
      { Name = "scholar"; Modifiers = Map.empty; CalculatedModifiers = Some(Map.ofList ["science", 0.035]); StartsUnlocked = false }
      { Name = "hunter"; Modifiers = Map.ofList ["manpower", 0.06]; CalculatedModifiers = None; StartsUnlocked = false }
      { Name = "miner"; Modifiers = Map.ofList ["minerals", 0.05]; CalculatedModifiers = None; StartsUnlocked = false }
      { Name = "priest"; Modifiers = Map.ofList ["faith", 0.0015]; CalculatedModifiers = Some(Map.ofList ["faith", 0.0015]); StartsUnlocked = false }
      { Name = "geologist"; Modifiers = Map.empty; CalculatedModifiers = Some(Map.ofList ["coal", 0.015]); StartsUnlocked = false }
      { Name = "engineer"; Modifiers = Map.empty; CalculatedModifiers = None; StartsUnlocked = false }
      { Name = "ambassador"; Modifiers = Map.ofList ["tradeVolume", 0.0007; "embassyEffectCap", 0.00133; "tradeBlueprintChance", 0.00008; "tradeSpiceChance", 0.00009; "tradeNormalResChance", 0.00003; "cultureConsumptionAmbassadors", 20; "spiceConsumptionAmbassadors", 0.8]; CalculatedModifiers = Some(Map.ofList ["tradeVolume", 0.0007; "embassyEffectCap", 0.00133; "tradeBlueprintChance", 0.00008; "tradeSpiceChance", 0.00009; "tradeNormalResChance", 0.00003; "cultureConsumptionAmbassadors", 20; "spiceConsumptionAmbassadors", 0.8]); StartsUnlocked = false }
    ]

let traitDefs : TraitDef list =
    [
      { Name = "scientist" }
      { Name = "manager" }
      { Name = "engineer" }
      { Name = "merchant" }
      { Name = "wise" }
      { Name = "metallurgist" }
      { Name = "chemist" }
      { Name = "none" }
    ]

let names : string list =
    ["Angel"; "Charlie"; "Mittens"; "Oreo"; "Lily"; "Ellie"; "Amber"; "Molly"; "Jasper"; "Oscar"; "Theo"; "Maddie"; "Cassie"; "Timber"; "Meeko"; "Micha"; "Tami"; "Plato"; "Bea"; "Cedar"; "Cleo"; "Dali"; "Fiona"; "Hazel"; "Iggi"; "Jasmine"; "Kali"; "Luna"; "Reilly"; "Reo"; "Rikka"; "Ruby"; "Tammy"; "Amy"; "Henry"]

let surnames : string list =
    ["Smoke"; "Dust"; "Chalk"; "Fur"; "Clay"; "Paws"; "Tails"; "Sand"; "Scratch"; "Berry"; "Shadow"; "Ash"; "Bark"; "Bowl"; "Brass"; "Dusk"; "Gaze"; "Gleam"; "Grass"; "Moss"; "Plaid"; "Puff"; "Rain"; "Silk"; "Silver"; "Speck"; "Stripes"; "Tingle"; "Wool"; "Yarn"; "Snail"; "Rabbit"]
