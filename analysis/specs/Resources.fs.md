(* VERIFY-SPECS (2026-10-01): re-verified against orig via oracle fixtures
   (defs-orig.json / space-orig.json — the real orig objects dumped by the
   orig driver) and the oracle-verified FS catalogs. Diff summary: 
   0 discrepancy(ies). Details at the bottom of this file and in
   verify-report.md. The old elmishKittens specs under ../elmishKittens are
   SUPERSEDED by the oracle-verified kittens_land catalogs; this copy is the
   archived input with the discrepancies recorded. *)
(* Resources + calendar constants + toolbar icons - auto-extracted from the original JS. *)
(* i18n labels resolved from res/i18n/en.json at extraction time. *)
(* Sources: *)
(*   resources.js ResourceManager.resourceData (60 entries, in source order) *)
(*   buildings.js BuildingsManager.effectsBase (base storage caps) *)
(*   calendar.js Calendar.seasons + Calendar.ticksPerDay/daysPerSeason *)
(*   toolbar.js classes.ui.Toolbar constructor addIcon order + jsx/toolbar.jsx.js WToolbar.getIcons *)
(* Resource visibility (exact, from resources.js constructor + game.unlock): *)
(*   constructor clones resourceData verbatim: res.value=0, res.unlocked=false for ALL resources. *)
(*   game.unlock(res): target.unlocked=true; resource tab shows unlocked resources (visible flag *)
(*     controls the collapsed/expanded display, NOT the unlock itself). *)
(*   Missing flags in JS are falsy: no `visible` field = hidden (craft resources beam/slab/...); *)
(*     no `craftable`/`transient` field = false; no `persists` field = reset default (None here). *)
(*   Omitted per-entry JS fields (behavioral, not static domain data): calculatePerTick, *)
(*     calculatePerDay, calculatePerTickAndDay, calculateOnYear, aiCanDestroy, isNotRefundable, *)
(*     isRefundable fn, tag (baseMetal/metallurgist/chemist), display, description. *)
(* Base caps note: effectsBase also holds hutFakeBought/logHouseFakeBought/mansionFakeBought *)
(*   (all 0, rewritten dynamically by pollution logic) - excluded here as non-storage state. *)
(* Toolbar note: classic toolbar.js constructor order is MOTD, Happiness, Energy. *)
(*   Modern jsx/toolbar.jsx.js getIcons renders FPS, Pollution (unless disablePollution), *)
(*     Happiness, Energy, BLS, Login (MOTD commented out) - engine chrome, not game domain. *)
(*   This spec keeps the 3 game-domain icons from toolbar.js in constructor order. *)

type GameResource = { Name: string; Title: string; Type: string; Visible: bool; Craftable: bool; Transient: bool; Persists: bool option; Color: string option }

let gameResources : GameResource list = [
    (* ---- catnip (resources.js) ---- *)
    { Name = "catnip"
      Title = "catnip"
      Type = "common"
      Visible = true; Craftable = false; Transient = false; Persists = None; Color = None }
    (* ---- wood ---- *)
    { Name = "wood"
      Title = "wood"
      Type = "common"
      Visible = true; Craftable = true; Transient = false; Persists = None; Color = None }
    (* ---- minerals ---- *)
    { Name = "minerals"
      Title = "minerals"
      Type = "common"
      Visible = true; Craftable = false; Transient = false; Persists = None; Color = None }
    (* ---- coal ---- *)
    { Name = "coal"
      Title = "coal"
      Type = "common"
      Visible = true; Craftable = false; Transient = false; Persists = None; Color = Some "gray" }
    (* ---- iron ---- *)
    { Name = "iron"
      Title = "iron"
      Type = "common"
      Visible = true; Craftable = false; Transient = false; Persists = None; Color = None }
    (* ---- titanium ---- *)
    { Name = "titanium"
      Title = "titanium"
      Type = "common"
      Visible = true; Craftable = false; Transient = false; Persists = None; Color = None }
    (* ---- gold ---- *)
    { Name = "gold"
      Title = "gold"
      Type = "common"
      Visible = true; Craftable = false; Transient = false; Persists = None; Color = None }
    (* ---- oil ---- *)
    { Name = "oil"
      Title = "oil"
      Type = "common"
      Visible = true; Craftable = false; Transient = false; Persists = None; Color = None }
    (* ---- uranium ---- *)
    { Name = "uranium"
      Title = "uranium"
      Type = "common"
      Visible = true; Craftable = false; Transient = false; Persists = None; Color = Some "#4EA24E" }
    (* ---- unobtainium ---- *)
    { Name = "unobtainium"
      Title = "unobtainium"
      Type = "common"
      Visible = true; Craftable = false; Transient = false; Persists = None; Color = Some "#A00000" }
    (* ---- antimatter (TRANSIENT block) ---- *)
    { Name = "antimatter"
      Title = "antimatter"
      Type = "common"
      Visible = true; Craftable = false; Transient = true; Persists = None; Color = Some "#5A0EDE" }
    (* ---- manpower ---- *)
    { Name = "manpower"
      Title = "catpower"
      Type = "common"
      Visible = true; Craftable = false; Transient = true; Persists = None; Color = Some "#DBA901" }
    (* ---- science ---- *)
    { Name = "science"
      Title = "science"
      Type = "common"
      Visible = true; Craftable = false; Transient = true; Persists = None; Color = Some "#01A9DB" }
    (* ---- culture ---- *)
    { Name = "culture"
      Title = "culture"
      Type = "common"
      Visible = true; Craftable = false; Transient = true; Persists = None; Color = Some "#DF01D7" }
    (* ---- faith ---- *)
    { Name = "faith"
      Title = "faith"
      Type = "common"
      Visible = true; Craftable = false; Transient = true; Persists = None; Color = Some "gray" }
    (* ---- kittens ---- *)
    { Name = "kittens"
      Title = "kittens"
      Type = "common"
      Visible = true; Craftable = false; Transient = true; Persists = Some false; Color = None }
    (* ---- zebras ---- *)
    { Name = "zebras"
      Title = "zebras"
      Type = "common"
      Visible = true; Craftable = false; Transient = true; Persists = Some false; Color = None }
    (* ---- starchart ---- *)
    { Name = "starchart"
      Title = "starchart"
      Type = "common"
      Visible = true; Craftable = false; Transient = true; Persists = None; Color = Some "#9A2EFE" }
    (* ---- temporalFlux ---- *)
    { Name = "temporalFlux"
      Title = "temporal flux"
      Type = "common"
      Visible = false; Craftable = false; Transient = false; Persists = Some true; Color = None }
    (* ---- gflops ---- *)
    { Name = "gflops"
      Title = "gigaflops"
      Type = "common"
      Visible = false; Craftable = false; Transient = true; Persists = Some false; Color = None }
    (* ---- hashrates ---- *)
    { Name = "hashrates"
      Title = "hashrates"
      Type = "common"
      Visible = false; Craftable = false; Transient = true; Persists = Some false; Color = None }
    (* ---- furs (luxury block) ---- *)
    { Name = "furs"
      Title = "furs"
      Type = "uncommon"
      Visible = true; Craftable = false; Transient = true; Persists = Some false; Color = None }
    (* ---- ivory ---- *)
    { Name = "ivory"
      Title = "ivory"
      Type = "uncommon"
      Visible = true; Craftable = false; Transient = true; Persists = Some false; Color = None }
    (* ---- spice ---- *)
    { Name = "spice"
      Title = "spice"
      Type = "uncommon"
      Visible = true; Craftable = false; Transient = true; Persists = Some false; Color = None }
    (* ---- unicorns ---- *)
    { Name = "unicorns"
      Title = "unicorns"
      Type = "rare"
      Visible = true; Craftable = false; Transient = true; Persists = Some false; Color = None }
    (* ---- alicorn ---- *)
    { Name = "alicorn"
      Title = "alicorns"
      Type = "rare"
      Visible = true; Craftable = false; Transient = false; Persists = Some false; Color = None }
    (* ---- necrocorn ---- *)
    { Name = "necrocorn"
      Title = "necrocorns"
      Type = "rare"
      Visible = true; Craftable = false; Transient = false; Persists = Some false; Color = Some "#E00000" }
    (* ---- tears ---- *)
    { Name = "tears"
      Title = "tears"
      Type = "rare"
      Visible = true; Craftable = false; Transient = false; Persists = Some false; Color = None }
    (* ---- karma ---- *)
    { Name = "karma"
      Title = "karma"
      Type = "rare"
      Visible = true; Craftable = false; Transient = false; Persists = Some false; Color = None }
    (* ---- paragon ---- *)
    { Name = "paragon"
      Title = "paragon"
      Type = "common"
      Visible = true; Craftable = false; Transient = false; Persists = Some true; Color = Some "#6141CD" }
    (* ---- burnedParagon ---- *)
    { Name = "burnedParagon"
      Title = "burned paragon"
      Type = "common"
      Visible = true; Craftable = false; Transient = false; Persists = Some true; Color = Some "#493099" }
    (* ---- timeCrystal ---- *)
    { Name = "timeCrystal"
      Title = "time crystal"
      Type = "common"
      Visible = true; Craftable = false; Transient = false; Persists = None; Color = Some "#14CD61" }
    (* ---- sorrow ---- *)
    { Name = "sorrow"
      Title = "sorrow"
      Type = "common"
      Visible = false; Craftable = false; Transient = false; Persists = Some true; Color = Some "black" }
    (* ---- relic ---- *)
    { Name = "relic"
      Title = "relic"
      Type = "exotic"
      Visible = true; Craftable = false; Transient = false; Persists = None; Color = Some "#5A0EDE" }
    (* ---- void ---- *)
    { Name = "void"
      Title = "void"
      Type = "exotic"
      Visible = true; Craftable = false; Transient = false; Persists = None; Color = Some "#5A0EDE" }
    (* ---- elderBox ---- *)
    { Name = "elderBox"
      Title = "present box"
      Type = "exotic"
      Visible = true; Craftable = false; Transient = false; Persists = Some true; Color = Some "#FA0EDE" }
    (* ---- wrappingPaper ---- *)
    { Name = "wrappingPaper"
      Title = "wrapping paper"
      Type = "exotic"
      Visible = true; Craftable = false; Transient = false; Persists = Some true; Color = Some "#FA0EDE" }
    (* ---- blackcoin ---- *)
    { Name = "blackcoin"
      Title = "blackcoin"
      Type = "exotic"
      Visible = true; Craftable = false; Transient = false; Persists = None; Color = Some "gold" }
    (* ---- bloodstone ---- *)
    { Name = "bloodstone"
      Title = "bloodstone"
      Type = "exotic"
      Visible = true; Craftable = true; Transient = false; Persists = None; Color = Some "red" }
    (* ---- tMythril ---- *)
    { Name = "tMythril"
      Title = "T-Mythril"
      Type = "exotic"
      Visible = true; Craftable = true; Transient = true; Persists = None; Color = Some "#00e6b8" }
    (* ---- beam (CRAFT block) ---- *)
    { Name = "beam"
      Title = "beam"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "#df9000" }
    (* ---- slab ---- *)
    { Name = "slab"
      Title = "slab"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = None }
    (* ---- plate ---- *)
    { Name = "plate"
      Title = "plate"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = None }
    (* ---- steel ---- *)
    { Name = "steel"
      Title = "steel"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "gray" }
    (* ---- concrate ---- *)
    { Name = "concrate"
      Title = "concrete"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = None }
    (* ---- gear ---- *)
    { Name = "gear"
      Title = "gear"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "gray" }
    (* ---- alloy ---- *)
    { Name = "alloy"
      Title = "alloy"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "gray" }
    (* ---- eludium ---- *)
    { Name = "eludium"
      Title = "eludium"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "darkViolet" }
    (* ---- scaffold ---- *)
    { Name = "scaffold"
      Title = "scaffold"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "#FF7F50" }
    (* ---- ship ---- *)
    { Name = "ship"
      Title = "ship"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "#FF571A" }
    (* ---- tanker ---- *)
    { Name = "tanker"
      Title = "tanker"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "#CF4F20" }
    (* ---- kerosene ---- *)
    { Name = "kerosene"
      Title = "kerosene"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "olive" }
    (* ---- plastic ---- *)
    { Name = "plastic"
      Title = "plastic"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "#9B9A5A" }
    (* ---- microchip ---- *)
    { Name = "microchip"
      Title = "microchip"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "#9B9A5A" }
    (* ---- parchment ---- *)
    { Name = "parchment"
      Title = "parchment"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "#DF01D7" }
    (* ---- manuscript ---- *)
    { Name = "manuscript"
      Title = "manuscript"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "#01A9DB" }
    (* ---- compedium ---- *)
    { Name = "compedium"
      Title = "compendium"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "#01A9DB" }
    (* ---- blueprint ---- *)
    { Name = "blueprint"
      Title = "blueprint"
      Type = "common"
      Visible = true; Craftable = true; Transient = true; Persists = None; Color = Some "#01A9DB" }
    (* ---- thorium ---- *)
    { Name = "thorium"
      Title = "thorium"
      Type = "common"
      Visible = true; Craftable = true; Transient = false; Persists = None; Color = Some "#4EA24E" }
    (* ---- megalith ---- *)
    { Name = "megalith"
      Title = "megalith"
      Type = "common"
      Visible = false; Craftable = true; Transient = false; Persists = None; Color = Some "gray" }
]

(* Base storage caps (buildings.js BuildingsManager.effectsBase). *)
let baseCaps : (string * float) list = [
    ("catnipMax", 5000)
    ("woodMax", 200)
    ("mineralsMax", 250)
    ("coalMax", 60)
    ("ironMax", 50)
    ("titaniumMax", 2)
    ("goldMax", 10)
    ("oilMax", 1500)
    ("uraniumMax", 250)
    ("unobtainiumMax", 150)
    ("antimatterMax", 100)
    ("manpowerMax", 100)
    ("scienceMax", 250)
    ("cultureMax", 100)
    ("faithMax", 100)
]

(* Calendar seasons (calendar.js Calendar.seasons modifiers) + conversion constants. *)
(* Seasons in source order; catnip modifier is the only per-season modifier in JS. *)
let calendarSeasons : (string * float) list = [
    ("spring", 1.5)
    ("summer", 1.0)
    ("autumn", 1.0)
    ("winter", 0.25)
]

type CalendarConsts = { TicksPerDay: int; DaysPerSeason: int }

(* calendar.js: ticksPerDay=10, daysPerSeason=100 (seasonsPerYear/yearsPerCycle/cyclesPerEra *)
(* are computed in the constructor from seasons/cycles arrays, not static constants). *)
let calendarConsts : CalendarConsts = { TicksPerDay = 10; DaysPerSeason = 100 }

(* Toolbar icons (toolbar.js classes.ui.Toolbar constructor addIcon order). *)
let toolbarIcons : string list = [
    "motd"
    "happiness"
    "energy"
]

(* no discrepancies: all extracted fields match orig *)
