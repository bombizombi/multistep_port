(* VERIFY-SPECS (2026-10-01): re-verified against orig via oracle fixtures
   (defs-orig.json / space-orig.json — the real orig objects dumped by the
   orig driver) and the oracle-verified FS catalogs. Diff summary: 
   0 discrepancy(ies). Details at the bottom of this file and in
   verify-report.md. The old elmishKittens specs under ../elmishKittens are
   SUPERSEDED by the oracle-verified kittens_land catalogs; this copy is the
   archived input with the discrepancies recorded. *)
(* Village (village.js VillageManager.jobs) - auto-extracted from the original JS. *)
(* i18n labels resolved from res/i18n/en.json at extraction time. *)
(* Source: orig_project/kittensgame/js/village.js, jobs array (lines 14-205). *)
(* Job unlocks are dynamic (building research / challenge state), NOT static data: *)
(*   woodcutter starts unlocked (defaultUnlocked=true); all others unlocked=false initially. *)
(*   farmer/scholar/hunter/miner/geologist/engineer unlock via buildings/tech in update(). *)
(*   priest is force-locked + unassigned while the atheism challenge is active. *)
(*   engineer job limit = factory count; ambassador limit = unlocked races + embassies effect. *)

type VillageJob = { Name: string; Label: string; Description: string; Modifiers: (string * float) list; DefaultUnlocked: bool }

let villageJobs : VillageJob list = [
    (* ---- woodcutter (defaultUnlocked) ---- *)
    (* flavor (village.woodcutter.flavor): "Must. Not. Scratch." *)
    { Name = "woodcutter"
      Label = "Woodcutter"
      Description = "+0.09 wood per second"
      Modifiers = [ ("wood", 0.018) ]
      DefaultUnlocked = true }
    (* ---- farmer ---- *)
    { Name = "farmer"
      Label = "Farmer"
      Description = "+5 catnip per second"
      Modifiers = [ ("catnip", 1.0) ]
      DefaultUnlocked = false }
    (* ---- scholar ---- *)
    (* calculateEffects override (NOT evaluated): science=0.035, +starchart=0.0001 if workshop astrophysicists researched. *)
    { Name = "scholar"
      Label = "Scholar"
      Description = "+0.175 science per second"
      Modifiers = [  ]
      DefaultUnlocked = false }
    (* ---- hunter ---- *)
    (* flavor (village.job.hunter.flavor): "We're so cute we purr at our prey until it dies" *)
    { Name = "hunter"
      Label = "Hunter"
      Description = "+0.3 catpower per second"
      Modifiers = [ ("manpower", 0.06) ]
      DefaultUnlocked = false }
    (* ---- miner ---- *)
    (* flavor (village.job.miner.flavor): "I don't really understand how can I hold a pick with my paws" *)
    { Name = "miner"
      Label = "Miner"
      Description = "+0.25 mineral per second"
      Modifiers = [ ("minerals", 0.05) ]
      DefaultUnlocked = false }
    (* ---- priest ---- *)
    (* calculateEffects override (NOT evaluated): locked + all priests unassigned while atheism challenge active. *)
    { Name = "priest"
      Label = "Priest"
      Description = "+0.0075 faith per second"
      Modifiers = [ ("faith", 0.0015) ]
      DefaultUnlocked = false }
    (* ---- geologist ---- *)
    (* calculateEffects override (NOT evaluated): base coal=0.015; +0.010 miningDrill; +0.015 unobtainiumDrill; *)
    (*   +0.0075 geodesy; gold=0.0005 per drill but only if geodesy researched, +0.0008 geodesy. *)
    (*   description is rebuilt at runtime from village.job.geologist.desc(.upgraded/.gold) with per-second values. *)
    { Name = "geologist"
      Label = "Geologist"
      Description = "+{0} coal per second (may be upgraded)"
      Modifiers = [  ]
      DefaultUnlocked = false }
    (* ---- engineer ---- *)
    (* base modifiers empty; per-tick output computed from engineerSpeciality craft in update(). *)
    (* job limit = factory building count (getJobLimit). *)
    { Name = "engineer"
      Label = "Engineer"
      Description = "Engineers can automate resource crafting (once per 10 minute). Every factory unlocks one engineer slot"
      Modifiers = [  ]
      DefaultUnlocked = false }
    (* ---- ambassador ---- *)
    (* calculateEffects override (NOT evaluated): description rebuilt from village.job.ambassador.desc + *)
    (*   limit.per.race / limit.calculated; cultureConsumption scales quadratically, spice cubically past 5. *)
    (* job limit = unlocked races (+ embassy levels div) ; 0 unless metaphysics ambassadors perk researched. *)
    (* base modifiers include consumption terms (cultureConsumptionAmbassadors=20, spiceConsumptionAmbassadors=0.8). *)
    { Name = "ambassador"
      Label = "Ambassador"
      Description = "Improves various aspects of trade with other races.  Consumes some resources to do so."
      Modifiers = [ ("tradeVolume", 0.0007); ("embassyEffectCap", 0.00133); ("tradeBlueprintChance", 0.00008); ("tradeSpiceChance", 0.00009); ("tradeNormalResChance", 0.00003); ("cultureConsumptionAmbassadors", 20.0); ("spiceConsumptionAmbassadors", 0.8) ]
      DefaultUnlocked = false }
]

(* Kitten traits (village.js Kitten.traits, lines 1392-1416) - auto-extracted from the original JS. *)
(* i18n labels resolved from res/i18n/en.json (village.trait.*) at extraction time. *)
(* Leader effects (getEffectLeader, lines 234-287, NOT evaluated): engineer 0.05 craft; metallurgist 0.1 metal *)
(* craft; chemist 0.075 chemical craft; merchant 0.03 trade; manager 0.5 hunt; scientist science-price *)
(* discount 0.05; wise faith/gold-price discount 0.09+0.01*BP; all scaled by burnedParagonRatio x monarchy 1.95. *)

type KittenTrait = { Name: string; Label: string }

let kittenTraits : KittenTrait list = [
    { Name = "scientist"; Label = "Scientist" }
    { Name = "manager"; Label = "Manager" }
    { Name = "engineer"; Label = "Artisan" }
    { Name = "merchant"; Label = "Merchant" }
    { Name = "wise"; Label = "Philosopher" }
    { Name = "metallurgist"; Label = "Metallurgist" }
    { Name = "chemist"; Label = "Chemist" }
    { Name = "none"; Label = "None" }
]

(* Kitten name pools (village.js Kitten.names/surnames, lines 1380-1390) - verbatim from the original JS. *)
(* JS comment caps: 100 names MAX / 100 surnames MAX; new entries appended at the end of the list. *)
(* names: 35 before dedupe, 35 after (no exact duplicates). *)
(* surnames: 33 before dedupe, 33 after (no exact duplicates). *)

let kittenNames : string list = [
    "Angel"; "Charlie"; "Mittens"; "Oreo"; "Lily"; "Ellie"; "Amber"; "Molly"; "Jasper"
    "Oscar"; "Theo"; "Maddie"; "Cassie"; "Timber"; "Meeko"; "Micha"; "Tami"; "Plato"
    "Bea"; "Cedar"; "Cleo"; "Dali"; "Fiona"; "Hazel"; "Iggi"; "Jasmine"; "Kali"; "Luna"
    "Reilly"; "Reo"; "Rikka"; "Ruby"; "Tammy"; "Amy"; "Henry"
]

let kittenSurnames : string list = [
    "Smoke"; "Dust"; "Chalk"; "Fur"; "Clay"; "Paws"; "Tails"; "Sand"; "Scratch"; "Berry"; "Shadow"
    "Ash"; "Bark"; "Bowl"; "Brass"; "Dusk"; "Gaze"; "Gleam"; "Grass"; "Moss"; "Plaid"; "Puff"; "Rain"
    "Silk"; "Silver"; "Speck"; "Stripes"; "Tingle"; "Wool"; "Yarn"; "Snail"; "Rabbit"
]

(* Census rank rules (village.js getRankExp/getLeaderBonus/expToPromote/goldToPromote) - formulas, NOT evaluated. *)
(* exp to go from rank r to r+1: 500 * 1.75^r (floored at display); multi-rank sums each step. *)
(* gold to go from rank r to r+1: 25 * (r+1); multi-rank sums 25*(r+i+1) per step. *)
(* leader production bonus: rank 0 -> 1.0, else (rank+1)/1.4, x2 with authocracy policy researched. *)
(* canPromote blocked entirely while the anarchy challenge is active. *)

let rankExpBase : float = 500.0
let rankExpRatio : float = 1.75
let promotionGoldPerRank : float = 25.0

(* Village titles (village.js VillageTab.getVillageTitle, lines 5984-6033) - auto-extracted. *)
(* i18n labels resolved from res/i18n/en.json (village.tab.title.*) at extraction time. *)
(* JS form: switch true, first kittens>X match wins (checked high to low); 0 kittens -> Outpost. *)
(* Spec form: (threshold, title) with kittens > threshold, ordered ascending; base title below all thresholds. *)

let villageTitleBase : string = "Outpost"

let villageTitleThresholds : (int * string) list = [
    (0, "Small Village")
    (15, "Village")
    (30, "Settlement")
    (50, "Small Town")
    (100, "Town")
    (150, "City")
    (200, "Metropolis")
    (250, "Megapolis")
    (300, "Empire")
    (400, "Imperium")
    (500, "Dominion")
    (600, "Hegemony")
    (700, "Federation")
    (800, "Reich")
    (900, "Society")
    (1000, "Civilisation")
    (1200, "Consortium")
    (1500, "Planetary Council")
    (2000, "Galactic Union")
    (5000, "Elders")
    (10000, "Deities")
]

(* no discrepancies: all extracted fields match orig *)
