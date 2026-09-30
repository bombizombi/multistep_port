(* VERIFY-SPECS (2026-10-01): re-verified against orig via oracle fixtures
   (defs-orig.json / space-orig.json — the real orig objects dumped by the
   orig driver) and the oracle-verified FS catalogs. Diff summary: 
   0 discrepancy(ies). Details at the bottom of this file and in
   verify-report.md. The old elmishKittens specs under ../elmishKittens are
   SUPERSEDED by the oracle-verified kittens_land catalogs; this copy is the
   archived input with the discrepancies recorded. *)
(* Diplomacy races (diplomacy.js DiplomacyManager.races) - auto-extracted from the original JS. *)
(* i18n titles resolved from res/i18n/en.json (trade.race.*) at extraction time. *)
(* Race visibility/unlock (exact, from DiplomacyManager.resetState + unlockRandomRace + update): *)
(*   resetState: embassyLevel=0, unlocked=false, energy=0, duration=0 for ALL races. *)
(*   first contact unlockYear: 0 if navigationDiplomacy researched and ships>0; 1 if diplomacy *)
(*     researched; 5 if karmaKittens>0; else 20. Then unlockRandomRace picks a non-hidden race. *)
(*   hidden-race thresholds: nagas culture>=1500; zebras ship>=1 (also unlocks caravanserai + *)
(*     zebraRelationsAppeasement/Bellicosity); spiders ship>=100 and science.max>125000; *)
(*     dragons nuclearFission researched. Leviathans arrive via trade-ship/leviathan-energy logic. *)
(* Trade mechanics (exact): isValidTrade requires embassyLevel>=sell.minLevel (absent = always), *)
(*   resource unlocked (coal/uranium exempt; leviathans exempt), and *)
(*   (chance + ambassador tradeNormalResChance)>0. Negative base chance (e.g. manuscript -0.03) *)
(*   becomes tradable via embassy/ambassador bonuses. *)
(* Sell seasons: [spring;summer;autumn;winter] additive modifiers to trade amounts; dragons and *)
(*   leviathans have NO seasons in JS (offworld, unaffected by Cath seasons). Spiders JS also *)
(*   contains a commented-out silk offer (not active data) - omitted. The shark-scribes-policy *)
(*   scaling of parchment/manuscript/iron values is runtime code (updateSharkScribes), not data. *)
(* Standing = initial diplomatic standing. UnlockPolicies = science policies unlocked with race. *)
(* Leviathans have NO embassyPrices in JS (no embassy) - recorded as empty list. *)
(* Buys entries in JS carry only {name,val} - recorded with Chance/Width/MinLevel=None, Seasons=[]. *)

type TradeOffer = { Res: string; Value: float; Chance: float option; Width: float option; MinLevel: int option; Seasons: (string * float) list }
type Race = { Name: string; Title: string; Standing: float; Hidden: bool; Sells: TradeOffer list; Buys: TradeOffer list; EmbassyPrices: Price list; UnlockPolicies: string list }

let races : Race list = [
    (* ---- lizards ---- *)
    { Name = "lizards"
      Title = "Lizards"
      Standing = 0.25; Hidden = false
      Sells = [
        { Res = "wood"; Value = 500; Chance = Some 1; Width = Some 0.08; MinLevel = None; Seasons = [ ("spring", -0.05); ("summer", 0.35); ("autumn", 0.15); ("winter", 0.05) ] }
        { Res = "beam"; Value = 10; Chance = Some 0.25; Width = Some 0.15; MinLevel = Some 5; Seasons = [ ("spring", -0.15); ("summer", 0.2); ("autumn", 0.2); ("winter", 0.1) ] }
        { Res = "scaffold"; Value = 1; Chance = Some 0.1; Width = Some 0.1; MinLevel = Some 10; Seasons = [ ("spring", -0.1); ("summer", 0.05); ("autumn", 0.3); ("winter", 0.1) ] }
        { Res = "manuscript"; Value = 4; Chance = Some -0.03; Width = Some 0.42; MinLevel = Some 25; Seasons = [ ("spring", 0.08); ("summer", 0.5); ("autumn", -0.04); ("winter", -0.12) ] }
        { Res = "furs"; Value = 12; Chance = Some -0.06; Width = Some 0.25; MinLevel = Some 40; Seasons = [ ("spring", -0.05); ("summer", 0.2); ("autumn", 0.1); ("winter", -0.5) ] }
      ]
      Buys = [
        { Res = "minerals"; Value = 1000; Chance = None; Width = None; MinLevel = None; Seasons = [  ] }
      ]
      EmbassyPrices = [ { Resource = "culture"; Amount = 100 } ]
      UnlockPolicies = [  ] }
    (* ---- sharks ---- *)
    { Name = "sharks"
      Title = "Sharks"
      Standing = 0; Hidden = false
      Sells = [
        { Res = "catnip"; Value = 35000; Chance = Some 1; Width = Some 0.15; MinLevel = None; Seasons = [ ("spring", 0.2); ("summer", -0.05); ("autumn", 0.15); ("winter", 0.45) ] }
        { Res = "parchment"; Value = 5; Chance = Some 0.25; Width = Some 0.25; MinLevel = Some 5; Seasons = [ ("spring", 0.15); ("summer", -0.35); ("autumn", -0.05); ("winter", 0.4) ] }
        { Res = "manuscript"; Value = 3; Chance = Some 0.15; Width = Some 0.25; MinLevel = Some 10; Seasons = [ ("spring", -0.15); ("summer", -0.35); ("autumn", 0.35); ("winter", 0.1) ] }
        { Res = "compedium"; Value = 1; Chance = Some 0.1; Width = Some 0.25; MinLevel = Some 15; Seasons = [ ("spring", 0.4); ("summer", 0.2); ("autumn", -0.15); ("winter", -0.3) ] }
        { Res = "oil"; Value = 160; Chance = Some -0.01; Width = Some 0.7; MinLevel = Some 25; Seasons = [ ("spring", 0.2); ("summer", -0.1); ("autumn", -0.1); ("winter", 0.3) ] }
        { Res = "plastic"; Value = 0.5; Chance = Some -0.2; Width = Some 0.7; MinLevel = Some 40; Seasons = [ ("spring", 0.25); ("summer", 0.1); ("autumn", -0.2); ("winter", -0.1) ] }
      ]
      Buys = [
        { Res = "iron"; Value = 100; Chance = None; Width = None; MinLevel = None; Seasons = [  ] }
      ]
      EmbassyPrices = [ { Resource = "culture"; Amount = 100 } ]
      UnlockPolicies = [  ] }
    (* ---- griffins ---- *)
    { Name = "griffins"
      Title = "Griffins"
      Standing = -0.15; Hidden = false
      Sells = [
        { Res = "iron"; Value = 250; Chance = Some 1; Width = Some 0.12; MinLevel = None; Seasons = [ ("spring", -0.25); ("summer", -0.05); ("autumn", 0.35); ("winter", -0.2) ] }
        { Res = "steel"; Value = 25; Chance = Some 0.25; Width = Some 0.1; MinLevel = Some 5; Seasons = [ ("spring", -0.15); ("summer", 0.1); ("autumn", 0.15); ("winter", -0.4) ] }
        { Res = "gear"; Value = 5; Chance = Some 0.1; Width = Some 0.25; MinLevel = Some 10; Seasons = [ ("spring", 0); ("summer", 0.1); ("autumn", 0.25); ("winter", -0.35) ] }
        { Res = "alloy"; Value = 2; Chance = Some -0.05; Width = Some 0.18; MinLevel = Some 20; Seasons = [ ("spring", -0.05); ("summer", 0.05); ("autumn", 0.2); ("winter", -0.2) ] }
        { Res = "microchip"; Value = 6; Chance = Some -0.125; Width = Some 0.5; MinLevel = Some 30; Seasons = [ ("spring", -0.25); ("summer", 0.05); ("autumn", 0.3); ("winter", -0.7) ] }
      ]
      Buys = [
        { Res = "wood"; Value = 500; Chance = None; Width = None; MinLevel = None; Seasons = [  ] }
      ]
      EmbassyPrices = [ { Resource = "culture"; Amount = 1000 } ]
      UnlockPolicies = [  ] }
    (* ---- nagas ---- *)
    { Name = "nagas"
      Title = "Nagas"
      Standing = 0; Hidden = true
      Sells = [
        { Res = "minerals"; Value = 1000; Chance = Some 1; Width = Some 0.18; MinLevel = None; Seasons = [ ("spring", 0.25); ("summer", 0.05); ("autumn", -0.35); ("winter", -0.05) ] }
        { Res = "slab"; Value = 5; Chance = Some 0.75; Width = Some 0.15; MinLevel = Some 5; Seasons = [ ("spring", 0.3); ("summer", 0.075); ("autumn", -0.4); ("winter", -0.075) ] }
        { Res = "concrate"; Value = 5; Chance = Some 0.25; Width = Some 0.05; MinLevel = Some 10; Seasons = [ ("spring", 0.4); ("summer", 0.1); ("autumn", -0.45); ("winter", -0.1) ] }
        { Res = "megalith"; Value = 1; Chance = Some 0.1; Width = Some 0.1; MinLevel = Some 15; Seasons = [ ("spring", 0.48); ("summer", 0.12); ("autumn", -0.48); ("winter", -0.12) ] }
        { Res = "uranium"; Value = 0.2; Chance = Some -0.08; Width = Some 0.1; MinLevel = Some 40; Seasons = [ ("spring", 0.6); ("summer", 0.1); ("autumn", -0.4); ("winter", -0.3) ] }
        { Res = "thorium"; Value = 0.05; Chance = Some -0.16; Width = Some 0.04; MinLevel = Some 55; Seasons = [ ("spring", 0.5); ("summer", 0.2); ("autumn", -0.7); ("winter", -0.3) ] }
      ]
      Buys = [
        { Res = "ivory"; Value = 500; Chance = None; Width = None; MinLevel = None; Seasons = [  ] }
      ]
      EmbassyPrices = [ { Resource = "culture"; Amount = 500 } ]
      UnlockPolicies = [  ] }
    (* ---- zebras ---- *)
    { Name = "zebras"
      Title = "Zebras"
      Standing = -0.3; Hidden = true
      Sells = [
        { Res = "iron"; Value = 300; Chance = Some 1; Width = Some 0.08; MinLevel = None; Seasons = [ ("spring", 0); ("summer", 0.15); ("autumn", -0.1); ("winter", -0.2) ] }
        { Res = "plate"; Value = 2; Chance = Some 0.65; Width = Some 0.25; MinLevel = None; Seasons = [ ("spring", 0.05); ("summer", -0.15); ("autumn", 0.05); ("winter", 0.25) ] }
        { Res = "alloy"; Value = 0.25; Chance = Some 0.05; Width = Some 0.05; MinLevel = Some 5; Seasons = [ ("spring", -0.02); ("summer", 0); ("autumn", 0.03); ("winter", 0.08) ] }
        { Res = "steel"; Value = 0.01; Chance = Some -0.05; Width = Some 0.1; MinLevel = Some 15; Seasons = [ ("spring", -0.15); ("summer", -0.15); ("autumn", 0); ("winter", 0.3) ] }
        { Res = "starchart"; Value = 0.05; Chance = Some -0.15; Width = Some 0.6; MinLevel = Some 30; Seasons = [ ("spring", 0.2); ("summer", -0.5); ("autumn", 0.15); ("winter", -0.8) ] }
        { Res = "coal"; Value = 0.004; Chance = Some -0.2; Width = Some 0.25; MinLevel = Some 50; Seasons = [ ("spring", 0.05); ("summer", 0.2); ("autumn", 0.05); ("winter", -0.15) ] }
        { Res = "unobtainium"; Value = 1e-06; Chance = Some -0.245; Width = Some 0.3; MinLevel = Some 80; Seasons = [ ("spring", -0.1); ("summer", 0.6); ("autumn", 0.2); ("winter", -0.4) ] }
      ]
      Buys = [
        { Res = "slab"; Value = 50; Chance = None; Width = None; MinLevel = None; Seasons = [  ] }
      ]
      EmbassyPrices = [ { Resource = "culture"; Amount = 25000 } ]
      UnlockPolicies = [ "zebraRelationsAppeasement"; "zebraRelationsBellicosity" ] }
    (* ---- spiders ---- *)
    { Name = "spiders"
      Title = "Spiders"
      Standing = 0.15; Hidden = true
      Sells = [
        { Res = "coal"; Value = 350; Chance = Some 1; Width = Some 0.15; MinLevel = None; Seasons = [ ("spring", 0); ("summer", 0.05); ("autumn", 0.15); ("winter", -0.05) ] }
        { Res = "oil"; Value = 100; Chance = Some 0.25; Width = Some 0.15; MinLevel = Some 5; Seasons = [ ("spring", 0.11); ("summer", -0.01); ("autumn", 0.04); ("winter", -0.06) ] }
        { Res = "plastic"; Value = 1; Chance = Some -0.2; Width = Some 0.8; MinLevel = Some 15; Seasons = [ ("spring", 1); ("summer", -0.3); ("autumn", -0.6); ("winter", 2) ] }
      ]
      Buys = [
        { Res = "scaffold"; Value = 50; Chance = None; Width = None; MinLevel = None; Seasons = [  ] }
      ]
      EmbassyPrices = [ { Resource = "culture"; Amount = 5000 } ]
      UnlockPolicies = [  ] }
    (* ---- dragons ---- *)
    { Name = "dragons"
      Title = "Dragons"
      Standing = 0; Hidden = true
      Sells = [
        { Res = "uranium"; Value = 1; Chance = Some 0.95; Width = Some 0.25; MinLevel = None; Seasons = [  ] }
        { Res = "thorium"; Value = 1; Chance = Some 0.5; Width = Some 0.25; MinLevel = Some 5; Seasons = [  ] }
        { Res = "temporalFlux"; Value = 0.2; Chance = Some -0.075; Width = Some 0.18; MinLevel = Some 30; Seasons = [  ] }
        { Res = "antimatter"; Value = 0.1; Chance = Some -0.175; Width = Some 0.18; MinLevel = Some 50; Seasons = [  ] }
      ]
      Buys = [
        { Res = "titanium"; Value = 250; Chance = None; Width = None; MinLevel = None; Seasons = [  ] }
      ]
      EmbassyPrices = [ { Resource = "culture"; Amount = 7500 } ]
      UnlockPolicies = [  ] }
    (* ---- leviathans ---- *)
    { Name = "leviathans"
      Title = "Leviathans"
      Standing = 0; Hidden = true
      Sells = [
        { Res = "starchart"; Value = 250; Chance = Some 0.5; Width = Some 0.8; MinLevel = None; Seasons = [  ] }
        { Res = "timeCrystal"; Value = 0.25; Chance = Some 0.98; Width = Some 0.15; MinLevel = None; Seasons = [  ] }
        { Res = "sorrow"; Value = 1; Chance = Some 0.15; Width = Some 0.1; MinLevel = None; Seasons = [  ] }
        { Res = "relic"; Value = 1; Chance = Some 0.05; Width = Some 0; MinLevel = None; Seasons = [  ] }
        { Res = "temporalFlux"; Value = 3; Chance = Some -0.1; Width = Some 0.2; MinLevel = None; Seasons = [  ] }
        { Res = "tears"; Value = 1500; Chance = Some -0.1; Width = Some 0.8; MinLevel = None; Seasons = [  ] }
      ]
      Buys = [
        { Res = "unobtainium"; Value = 5000; Chance = None; Width = None; MinLevel = None; Seasons = [  ] }
      ]
      EmbassyPrices = [  ]
      UnlockPolicies = [ "transkittenism"; "necrocracy"; "radicalXenophobia" ] }
]
(* no discrepancies: all extracted fields match orig *)
