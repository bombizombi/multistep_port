module Game.Achievements

// achievements-01..03: definition tables (catalog), manager core (lookup,
// unlock, polling, reset). Sources: js/achievements.js L437-551. Conditions
// are closures in orig — ported as a name-keyed evaluator over an AchContext;
// fresh/inject-reachable conditions implemented, the rest are documented seams
// (space/challenges/time/leader/server/date-gated — all false at this slice).

open System

type AchContext =
    { ResValue: string -> float
      KittensResMax: float
      DeadKittens: float
      Happiness: float
      KittenCount: int
      MaxKittens: int
      Faith: float              // religion.faith (worship pool)
      FestivalDays: float
      TrueYear: float
      ObservatoryOn: int
      ZigguratVal: int
      LeviathanEnergy: float
      TotalYears: float
      TotalResets: float
      IronWill: bool
      MineVal: int
      WarehouseVal: int
      PastureVal: int
      MagnetoVal: int
      FactoryVal: int
      SteamworksVal: int }

type AchMeta = { Unlocked: bool; StarUnlocked: bool }
type BadgeMeta = { Unlocked: bool }

type AchPool =
    { Achievements: Map<string, AchMeta>
      AchievementOrder: string list
      Badges: Map<string, BadgeMeta>
      BadgeOrder: string list
      BadgesUnlocked: bool }

let private mkAch () = { Unlocked = false; StarUnlocked = false }
let private mkBadge () = { Unlocked = false }

let init () : AchPool =
    { Achievements = Game.Catalog.World.achievementDefs |> List.map (fun a -> (a.Name, mkAch ())) |> Map.ofList
      AchievementOrder = Game.Catalog.World.achievementDefs |> List.map (fun a -> a.Name)
      Badges = Game.Catalog.World.badgeDefs |> List.map (fun b -> (b.Name, mkBadge ())) |> Map.ofList
      BadgeOrder = Game.Catalog.World.badgeDefs |> List.map (fun b -> b.Name)
      BadgesUnlocked = false }

let resetState (_ap: AchPool) : AchPool = init ()

let get (ap: AchPool) (name: string) : AchMeta = ap.Achievements.[name]
let getBadge (ap: AchPool) (name: string) : BadgeMeta = ap.Badges.[name]

let unlockAchievement (name: string) (ap: AchPool) : AchPool =
    let a = ap.Achievements.[name]
    if not a.Unlocked then
        { ap with Achievements = ap.Achievements |> Map.add name { a with Unlocked = true } }
    else
        ap

let unlockStarAchievement (name: string) (ap: AchPool) : AchPool =
    let a = ap.Achievements.[name]
    if not a.StarUnlocked then
        { ap with Achievements = ap.Achievements |> Map.add name { a with StarUnlocked = true } }
    else
        ap

let unlockBadge (name: string) (ap: AchPool) : AchPool =
    let b = ap.Badges.[name]
    if not b.Unlocked then
        { ap with
            Badges = ap.Badges |> Map.add name { b with Unlocked = true }
            BadgesUnlocked = true }
    else
        ap

/// Condition evaluator (js/achievements.js closures). Seams return false:
/// ironWill/space/challenges/time.flux/leader/server/date-gated/cheat modes.
let private evalCondition (ctx: AchContext) (name: string) : bool =
    let res r = ctx.ResValue r
    match name with
    | "theElderLegacy" -> false // date.getMonth()==0 && year==2017 (fake clock 2025)
    | "unicornConspiracy" -> res "unicorns" > 0.0
    | "uniception" -> res "tears" > 0.0
    | "sinsOfEmpire" -> res "alicorn" > 0.0
    | "anachronox" -> res "timeCrystal" > 0.0
    | "deadSpace" -> res "necrocorn" > 0.0
    | "sadnessAbyss" -> res "sorrow" >= 100.0
    | "ironWill" -> ctx.IronWill && ctx.KittenCount = 0 && ctx.MineVal > 0
    | "uberkatzhen" -> ctx.IronWill && ctx.KittenCount = 0 && ctx.WarehouseVal > 0
    | "hundredYearsSolitude" -> ctx.IronWill && ctx.KittenCount = 0 && ctx.SteamworksVal > 0
    | "soilUptuned" -> ctx.IronWill && ctx.KittenCount = 0 && ctx.PastureVal >= 45
    | "atlasUnmeowed" -> ctx.IronWill && ctx.KittenCount = 0 && ctx.MagnetoVal > 0
    | "meowMeowRevolution" -> ctx.IronWill && ctx.KittenCount = 0 && ctx.FactoryVal > 0
    | "spaceOddity" | "jupiterAscending" -> false // space seam
    | "veryLargeArray" -> ctx.ObservatoryOn >= 100 // && !seti (seti researched gate — seam 0 fresh)
    | "shadowOfTheColossus" -> ctx.ZigguratVal > 0 && ctx.MaxKittens = 1
    | "sunGod" -> ctx.Faith >= 696342.0
    | "heartOfDarkness" -> res "zebras" > 1.0
    | "winterIsComing" -> ctx.DeadKittens >= 10.0
    | "youMonster" -> ctx.DeadKittens >= 100.0
    | "superUnethicalClimax" | "systemShock" -> false
    | "lotusMachine" -> res "karma" >= 1.0
    | "serenity" -> float ctx.KittenCount >= 50 && ctx.DeadKittens = 0.0
    | "utopiaProject" -> ctx.Happiness >= 1.5 && float ctx.KittenCount > 35.0
    | "deathStranding" -> false // space seam
    | "cathammer" -> ctx.TrueYear >= 500.0 // darkFutureBeginning
    | "eternalBacchanalia" -> ctx.FestivalDays >= 100.0 * 100.0 * 1.0
    | "challenger" -> false // challenge completions seam
    | "betterSafeThanSorry" -> false // badge condition (fullyHidden)
    | _ -> false

/// Badge conditions (js/achievements.js L275-435). Badges without a condition
/// field are never polled by update() — only direct unlockBadge calls hit them.
let private evalBadgeCondition (ctx: AchContext) (name: string) : bool option =
    match name with
    | "lotus" -> Some(ctx.TotalResets >= 50.0) // totalResets stat (reset flow seam: 0 here)
    | "useless" -> None // leader seam (condition present, leader null → false)
    | "beta" -> Some false // window.location.href has no "beta"
    | "silentHill" -> Some false // server.motdContent null == "" is false
    | "deadSpace" -> Some(ctx.ResValue "kittens" >= 1000.0 && ctx.KittensResMax = 0.0)
    | "reginaNoctis" -> Some(ctx.ResValue "kittens" >= 500.0 && ctx.ResValue "alicorn" = 0.0)
    | "sequenceBreak" -> Some false // space seam
    | "fantasticFurColor" -> Some false // leader seam
    | "lostDates" -> Some false // time.flux seam
    | "buffet" -> Some(ctx.LeviathanEnergy >= 1000.0)
    | "newHome" -> Some false // space seam
    | "soLongAndThanksForAllTheHay" -> Some(abs (ctx.ResValue "alicorn" - 42.0) < 1e-12)
    // no condition field → update() skips (None = not polled)
    | _ -> None

/// orig update() (L495-522): poll conditions; then the lostDates title gamble
/// consumes ONE game.rand(100) draw per poll (frequency 50 in the timer).
let update (ctx: AchContext) (rand: unit -> float) (ap: AchPool) : AchPool * float =
    let mutable ap = ap
    for def in Game.Catalog.World.achievementDefs do
        let a = ap.Achievements.[def.Name]
        if not a.Unlocked && def.HasCondition && evalCondition ctx def.Name then
            ap <- unlockAchievement def.Name ap
        if not a.StarUnlocked && def.HasStarCondition then
            // star conditions: all sit on seams at this slice (extra condition
            // variants of the base ones — ironWill/paragon/startedWithout...)
            let starHit =
                match def.Name with
                | "jupiterAscending" -> false
                | _ -> false
            if starHit then ap <- unlockStarAchievement def.Name ap
    for def in Game.Catalog.World.badgeDefs do
        match evalBadgeCondition ctx def.Name with
        | Some hit ->
            let b = ap.Badges.[def.Name]
            if not b.Unlocked && hit then ap <- unlockBadge def.Name ap
        | None -> ()
    let _ = rand () // lostDates title gamble: game.rand(100) draw
    ap, 0.0

let hasUnlocked (ap: AchPool) : bool =
    ap.AchievementOrder |> List.exists (fun n -> ap.Achievements.[n].Unlocked)
