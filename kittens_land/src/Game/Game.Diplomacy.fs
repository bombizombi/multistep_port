module Game.Diplomacy

// diplomacy-02/03/07/08: manager lifecycle state, embassy purchases, random race
// unlocking, and the full trade resolution math. Sources: js/diplomacy.js
// L360-458 (lifecycle), L461-528 (unlocking/update), L813-1108 (trade math),
// L1109-1161 (standing/chances), L1528-1648 (embassy purchase). Race data from
// Game.Catalog.World (runtime-dump generated). RNG: every draw goes through the
// caller's counted `rand` (order matters — see tradeImpl).

open Game.Types
open Game.Catalog.World

/// Live race state (orig mutates the def: unlocked/embassyLevel/energy/duration).
type RaceState =
    { Unlocked: bool
      EmbassyLevel: int
      Energy: float
      Duration: float }

type DiplomacyPool =
    { Races: Map<string, RaceState>
      RaceOrder: string list
      NonRandomTrades: float
      NonRandomResetDays: float }

let init () : DiplomacyPool =
    let order = Game.Catalog.World.raceDefs |> List.map (fun r -> r.Name)
    { Races = order |> List.map (fun n -> (n, { Unlocked = false; EmbassyLevel = 0; Energy = 0.0; Duration = 0.0 })) |> Map.ofList
      RaceOrder = order
      NonRandomTrades = 0.0
      NonRandomResetDays = 0.0 }

let getRace (dp: DiplomacyPool) (name: string) : RaceState = dp.Races.[name]

let hasUnlockedRaces (dp: DiplomacyPool) : bool =
    dp.RaceOrder |> List.exists (fun n -> dp.Races.[n].Unlocked)

let getSumEmbassyLevels (dp: DiplomacyPool) : int =
    dp.RaceOrder |> List.sumBy (fun n -> dp.Races.[n].EmbassyLevel)

let resetState (dp: DiplomacyPool) : DiplomacyPool =
    { dp with
        Races = dp.RaceOrder |> List.map (fun n -> (n, { Unlocked = false; EmbassyLevel = 0; Energy = 0.0; Duration = 0.0 })) |> Map.ofList
        NonRandomTrades = 0.0
        NonRandomResetDays = 0.0 }

/// Per-tick seam context (no manager object in the port; callers supply live reads).
type DiplomacyContext =
    { GetEffect: string -> float
      GetResValue: string -> float
      GetResMax: string -> float
      IsResUnlocked: string -> bool
      Season: string            // current season name (getCurSeason().name)
      NuclearFissionResearched: bool
      IronWill: bool }

/// Side effects of deterministic unlock gates (zebras: caravanserai upgrade +
/// zebra relation policies become unlocked — orig L510-513).
type UnlockEvent =
    { Race: string option
      UnlockCaravanserai: bool
      UnlockZebraPolicies: bool }

let noneEvent : UnlockEvent = { Race = None; UnlockCaravanserai = false; UnlockZebraPolicies = false }

/// orig unlockRandomRace (L484-528): deterministic gates first (nagas/zebras/
/// spiders/dragons), then ONE Math.random draw among unmet non-hidden races.
let unlockRandomRace (dp: DiplomacyPool) (ctx: DiplomacyContext) (rand: unit -> float) : DiplomacyPool * UnlockEvent =
    let def name = Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = name)
    let unmetRaces =
        dp.RaceOrder |> List.filter (fun n -> not dp.Races.[n].Unlocked && not (def n).Hidden)
    let hasLockedHiddenRaces =
        dp.RaceOrder |> List.exists (fun n -> not dp.Races.[n].Unlocked && (def n).Hidden)
    if unmetRaces.IsEmpty && not hasLockedHiddenRaces then
        (dp, noneEvent)
    else
        // nagas like highly cultural kittens :3
        if not dp.Races.["nagas"].Unlocked && ctx.GetResValue "culture" >= 1500.0 then
            let dp = { dp with Races = dp.Races |> Map.add "nagas" { dp.Races.["nagas"] with Unlocked = true } }
            (dp, { noneEvent with Race = Some "nagas" })
        elif not dp.Races.["zebras"].Unlocked && ctx.GetResValue "ship" >= 1.0 then
            let dp = { dp with Races = dp.Races |> Map.add "zebras" { dp.Races.["zebras"] with Unlocked = true } }
            (dp, { Race = Some "zebras"; UnlockCaravanserai = true; UnlockZebraPolicies = true })
        elif not dp.Races.["spiders"].Unlocked
             && ctx.GetResValue "ship" >= 100.0
             && ctx.GetResMax "science" > 125000.0 then
            let dp = { dp with Races = dp.Races |> Map.add "spiders" { dp.Races.["spiders"] with Unlocked = true } }
            (dp, { noneEvent with Race = Some "spiders" })
        elif not dp.Races.["dragons"].Unlocked && ctx.NuclearFissionResearched then
            let dp = { dp with Races = dp.Races |> Map.add "dragons" { dp.Races.["dragons"] with Unlocked = true } }
            (dp, { noneEvent with Race = Some "dragons" })
        else
            if unmetRaces.IsEmpty then
                (dp, noneEvent)
            else
                let raceId = int (floor (rand () * float unmetRaces.Length))
                match List.tryItem raceId unmetRaces with
                | Some name ->
                    let dp = { dp with Races = dp.Races |> Map.add name { dp.Races.[name] with Unlocked = true } }
                    (dp, { noneEvent with Race = Some name })
                | None -> (dp, noneEvent)

/// orig diplomacy.update (L588-610) fresh slice: race unlock once the year gate
/// passes. unlockYear = 20 at fresh (karmaKittens 0, prestige perk seams off).
let update (dp: DiplomacyPool) (ctx: DiplomacyContext) (year: float) (karmaKittens: int) (rand: unit -> float) : DiplomacyPool * UnlockEvent =
    if not (hasUnlockedRaces dp) then
        // navigationDiplomacy+ship → 0; diplomacy perk → 1; karmaKittens>0 → 5; else 20
        let unlockYear = if karmaKittens > 0 then 5.0 else 20.0
        if year < unlockYear then
            (dp, noneEvent)
        else
            unlockRandomRace dp ctx rand
    else
        (dp, noneEvent)

// --- trade costs / volume (L998-1108) ------------------------------------------

let getManpowerCost (ctx: DiplomacyContext) : float =
    let manpowerCost = 50.0 - ctx.GetEffect "tradeCatpowerDiscount"
    if manpowerCost < 0.0 then 0.0 else manpowerCost

let getGoldCost (ctx: DiplomacyContext) : float =
    let goldCost = 15.0 - ctx.GetEffect "tradeGoldDiscount"
    if goldCost < 0.0 then 0.0 else goldCost

/// orig getTradeVolume (L1082): (1 + tradeVolume) * (1 + ambassador tradeVolume)
let getTradeVolume (ctx: DiplomacyContext) (ambassadorEffects: Map<string, float>) : float =
    (1.0 + ctx.GetEffect "tradeVolume")
    * (1.0 + (ambassadorEffects |> Map.tryFind "tradeVolume" |> Option.defaultValue 0.0))

/// orig getTradeRatio (L404): tradeRatio effect + merchant leader seam (0).
let getTradeRatio (ctx: DiplomacyContext) : float =
    ctx.GetEffect "tradeRatio"

// --- standing & chances (L1109-1161) -------------------------------------------

/// orig calculateStandingFromPolicies: policy-gated, 0 at this slice.
let calculateStandingFromPolicies (_raceName: string) : float = 0.0

let getFinalStanding (dp: DiplomacyPool) (ctx: DiplomacyContext) (raceName: string) : float =
    let def = Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = raceName)
    let race = dp.Races.[raceName]
    let bonusStanding = ctx.GetEffect "standingRatio" + calculateStandingFromPolicies raceName
    if def.Standing < 0.0 then
        min (def.Standing + bonusStanding) 0.0
    elif def.Standing = 0.0 then
        // lizardRelationsDiplomats seam: not researched at this slice → 0
        0.0
    else
        def.Standing + bonusStanding / 2.0

let getAmbassadorEffect (ambassadorEffects: Map<string, float>) (name: string) : float =
    ambassadorEffects |> Map.tryFind name |> Option.defaultValue 0.0

/// orig isValidTrade (L456-462)
let isValidTrade (dp: DiplomacyPool) (ctx: DiplomacyContext) (sell: SellDef) (raceName: string) (ambassadorEffects: Map<string, float>) : bool =
    let race = dp.Races.[raceName]
    let hasHighEnoughEmbassyLevel = (match sell.MinLevel with Some l -> race.EmbassyLevel >= l | None -> true)
    let isResourceTradeable =
        ctx.IsResUnlocked sell.Name || sell.Name = "coal" || sell.Name = "uranium" || raceName = "leviathans"
    let positiveChance = (sell.Chance + getAmbassadorEffect ambassadorEffects "tradeNormalResChance") > 0.0
    hasHighEnoughEmbassyLevel && isResourceTradeable && positiveChance

let getBlueprintTradeChance (ambassadorEffects: Map<string, float>) (raceName: string) (ctx: DiplomacyContext) : float =
    let retVal = 0.1 + getAmbassadorEffect ambassadorEffects "tradeBlueprintChance"
    if raceName = "nagas" then retVal + ctx.GetEffect "nagaBlueprintTradeChance" else retVal

let getSpiceTradeChance (dp: DiplomacyPool) (ambassadorEffects: Map<string, float>) (raceName: string) (ctx: DiplomacyContext) : float =
    let embassyEffect = if ctx.IronWill then 0.0025 else 0.01
    let baseChance = 0.35 + getAmbassadorEffect ambassadorEffects "tradeSpiceChance"
    let race = dp.Races.[raceName]
    let def = Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = raceName)
    let hasEmbassyPrices = not def.EmbassyPrices.IsEmpty
    baseChance * (1.0 + (if hasEmbassyPrices then float race.EmbassyLevel * embassyEffect else 0.0))

let getResourceTradeChance (dp: DiplomacyPool) (ctx: DiplomacyContext) (sell: SellDef) (raceName: string) (ambassadorEffects: Map<string, float>) : float =
    let embassyEffect = if ctx.IronWill then 0.0025 else 0.01
    if not (isValidTrade dp ctx sell raceName ambassadorEffects) then
        0.0
    else
        let baseChance = sell.Chance + getAmbassadorEffect ambassadorEffects "tradeNormalResChance"
        if baseChance <= 0.0 then
            0.0
        else
            let race = dp.Races.[raceName]
            let def = Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = raceName)
            let hasEmbassyPrices = not def.EmbassyPrices.IsEmpty
            baseChance
            * (1.0
               + (if hasEmbassyPrices then
                      Game.Math.getLimitedDR (float race.EmbassyLevel * embassyEffect)
                          (0.75 + getAmbassadorEffect ambassadorEffects "embassyEffectCap")
                  else 0.0))

// --- trade resolution (L813-996) -----------------------------------------------

type TradeResults = { Failed: float; Normal: float; Bonus: float }

/// orig calculateFailedNormalBonusTrades (L813-853)
let calculateFailedNormalBonusTrades (ctx: DiplomacyContext) (rand: unit -> float) (standing: float) (numTrades: float) (nonRandom: float) : TradeResults =
    if standing < 0.0 then
        let failed1 = min nonRandom numTrades
        let randomEligible = max (numTrades - nonRandom) 0.0
        let failed = failed1 + Game.Math.binominalRandomInteger rand randomEligible (-standing)
        { Failed = failed; Normal = numTrades - failed; Bonus = 0.0 }
    elif standing > 0.0 then
        if standing >= 1.0 then
            { Failed = 0.0; Normal = 0.0; Bonus = numTrades }
        else
            let randomEligible = max (numTrades - nonRandom) 0.0
            let bonus = Game.Math.binominalRandomInteger rand randomEligible standing
            { Failed = 0.0; Normal = numTrades - bonus; Bonus = bonus }
    else
        { Failed = 0.0; Normal = numTrades; Bonus = 0.0 }

/// orig _fuzzGainedAmount (L963): amount + width * (irwinHall(amount) - amount/2)
let fuzzGainedAmount (rand: unit -> float) (amount: float) (width: float) : float =
    amount + width * (Game.Math.irwinHallRandom rand amount - amount / 2.0)

/// orig tradeImpl (L859-961): pure computation + nonRandom bookkeeping.
/// Returns bought resources (name → amount) + updated NonRandomTrades state.
let tradeImpl (dp: DiplomacyPool) (ctx: DiplomacyContext) (rand: unit -> float) (raceName: string) (totalTradeAmount: float) (ambassadorEffects: Map<string, float>) : DiplomacyPool * Map<string, float> =
    let def = Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = raceName)
    let tradeResults = calculateFailedNormalBonusTrades ctx rand (getFinalStanding dp ctx raceName) totalTradeAmount dp.NonRandomTrades
    let dp = { dp with NonRandomTrades = max (dp.NonRandomTrades - tradeResults.Failed) 0.0 }
    let normalTradeAmount = tradeResults.Normal
    let bonusTradeAmount = tradeResults.Bonus
    let successfullTradeAmount = normalTradeAmount + bonusTradeAmount

    if successfullTradeAmount = 0.0 then
        (dp, Map.empty)
    else
        let mutable dp = dp
        // race.duration clamp (L886-887): at most 1 year + 1 season per energy unit
        let race = dp.Races.[raceName]
        let durationCap = 100.0 * (1.0 + floor race.Energy) // daysPerSeason=100, seasonsPerYear=1... see note
        // NOTE: orig reads calendar.daysPerSeason * (calendar.seasonsPerYear + floor(energy));
        // those are 100 and 1 at this slice.
        let duration = min race.Duration durationCap
        dp <- { dp with Races = dp.Races |> Map.add raceName { race with Duration = duration } }

        let tradeVolume = getTradeVolume ctx ambassadorEffects
        let tradeRatio =
            1.0
            + getTradeRatio ctx
            + 0.0 // calculateTradeBonusFromPolicies: policy-gated, 0 at this slice
            + 0.0 // pacifism challenge seam
        let raceRatio = 1.0 + race.Energy * 0.02
        let currentSeason = ctx.Season

        let mutable bought = Map.empty<string, float>
        for sell in def.Sells do
            let tradeChance = getResourceTradeChance dp ctx sell raceName ambassadorEffects
            if tradeChance <> 0.0 then
                let mutable eligibleForResNormal = normalTradeAmount
                let mutable eligibleForResBonus = bonusTradeAmount
                if tradeChance < 1.0 && dp.NonRandomTrades <> 0.0 then
                    eligibleForResNormal <- max (normalTradeAmount - dp.NonRandomTrades) 0.0
                    eligibleForResBonus <- max (bonusTradeAmount - max (dp.NonRandomTrades - normalTradeAmount) 0.0) 0.0

                let passedNormal = Game.Math.binominalRandomInteger rand eligibleForResNormal tradeChance
                let passedBonus = Game.Math.binominalRandomInteger rand eligibleForResBonus tradeChance

                if passedNormal + passedBonus <> 0.0 then
                    let fuzzedNormal = fuzzGainedAmount rand passedNormal sell.Width
                    let fuzzedBonus = fuzzGainedAmount rand passedBonus sell.Width
                    let seasonRatio = 1.0 + (sell.Seasons |> Map.tryFind currentSeason |> Option.defaultValue 0.0)
                    let amt = (fuzzedNormal + fuzzedBonus * 1.25) * sell.Value * tradeRatio * raceRatio * seasonRatio * tradeVolume
                    bought <- bought |> Map.add sell.Name amt

        // spice (L928-942)
        let spiceChance = getSpiceTradeChance dp ambassadorEffects raceName ctx
        let mutable eligibleForSpice = successfullTradeAmount
        if spiceChance < 1.0 && dp.NonRandomTrades <> 0.0 then
            eligibleForSpice <- max (successfullTradeAmount - dp.NonRandomTrades) 0.0
        let spiceTradeAmount = Game.Math.binominalRandomInteger rand eligibleForSpice spiceChance
        let mutable spiceAmt = 25.0 * spiceTradeAmount + 50.0 * tradeRatio * Game.Math.irwinHallRandom rand spiceTradeAmount
        if spiceChance > 1.0 then
            spiceAmt <- spiceAmt * spiceChance
        bought <- bought |> Map.add "spice" spiceAmt

        // blueprint (L945-955)
        let blueprintTradeChance = getBlueprintTradeChance ambassadorEffects raceName ctx
        let mutable eligibleForBlueprint = successfullTradeAmount
        if blueprintTradeChance < 1.0 && dp.NonRandomTrades <> 0.0 then
            eligibleForBlueprint <- max (successfullTradeAmount - dp.NonRandomTrades) 0.0
        let blueprintAmt =
            floor (Game.Math.binominalRandomInteger rand eligibleForBlueprint blueprintTradeChance)
        bought <- bought |> Map.add "blueprint" blueprintAmt

        // zebra titanium (L958-968); tradepost tradeRatio read from the static
        // def table (bld.getBuildingExt("tradepost").meta.effects["tradeRatio"])
        if raceName = "zebras" then
            let shipAmount = ctx.GetResValue "ship"
            let tradepostTradeRatio =
                (Game.Catalog.Defs.buildingDefs |> List.find (fun b -> b.Name = "tradepost")).Effects
                |> Map.tryFind "tradeRatio" |> Option.defaultValue 0.0
            let zebraRelationModifierTitanium = ctx.GetEffect "zebraRelationModifier" * tradepostTradeRatio
            let titaniumTradeChance = 0.15 + shipAmount * 0.0035
            let mutable eligibleForTitanium = successfullTradeAmount
            if titaniumTradeChance < 1.0 && dp.NonRandomTrades <> 0.0 then
                eligibleForTitanium <- max (successfullTradeAmount - dp.NonRandomTrades) 0.0
            let titaniumAmt =
                (1.5 + shipAmount * 0.03) * (1.0 + zebraRelationModifierTitanium) * tradeVolume
                * Game.Math.binominalRandomInteger rand eligibleForTitanium titaniumTradeChance
            bought <- bought |> Map.add "titanium" titaniumAmt

        // consume non-random trades (L976)
        dp <- { dp with NonRandomTrades = max (dp.NonRandomTrades - successfullTradeAmount) 0.0 }
        (dp, bought)

/// orig getMaxTradeAmt (L1084-1107): min of affordable trades across gold /
/// manpower / the buy resource; None when 0 or unbounded. (JS returns undefined.)
let getMaxTradeAmt
    (dp: DiplomacyPool)
    (ctx: DiplomacyContext)
    (ambassadorEffects: Map<string, float>)
    (raceName: string)
    : float option =
    let def = Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = raceName)
    let manpowerCost = getManpowerCost ctx
    let goldCost = getGoldCost ctx
    let volume = getTradeVolume ctx ambassadorEffects
    let goldAmt = floor (ctx.GetResValue "gold" / max goldCost 1.0)
    let manpAmt = floor (ctx.GetResValue "manpower" / max manpowerCost 1.0)
    let buyAmt = floor (ctx.GetResValue def.Buys.[0].Resource / (def.Buys.[0].Val * volume))
    let amt1 = goldAmt + (if goldCost > 0.0 then 0.0 else System.Double.MaxValue)
    let amt2 = manpAmt + (if manpowerCost > 0.0 then 0.0 else System.Double.MaxValue)
    let minAmt = min amt1 (min amt2 buyAmt)
    if minAmt = System.Double.MaxValue || minAmt = 0.0 then None else Some minAmt

// --- embassy purchase (L1528-1648) ---------------------------------------------

/// orig EmbassyButtonController getPrices: culture × (1 - embassyCostReduction)
/// × 1.15^(embassyLevel + embassyFakeBought)
let embassyPrices (dp: DiplomacyPool) (ctx: DiplomacyContext) (raceName: string) : Price list =
    let def = Game.Catalog.World.raceDefs |> List.find (fun r -> r.Name = raceName)
    let race = dp.Races.[raceName]
    let priceCoeficient = 1.0 - ctx.GetEffect "embassyCostReduction"
    def.EmbassyPrices
    |> List.map (fun p ->
        { p with
            Val = p.Val * priceCoeficient * 1.15 ** float (race.EmbassyLevel) })

/// Buy n embassies while affordable (build loop; increments embassyLevel).
/// Requires writing researched + race unlocked (buyItem gates L1626-1643) —
/// the caller checks those gates and passes n>0 only when they hold.
let buyEmbassies (calendarDay: int) (dp: DiplomacyPool) (ctx: DiplomacyContext) (pool: ResPool) (n: int) (raceName: string) : DiplomacyPool * ResPool * int =
    let mutable dp = dp
    let mutable pool = pool
    let mutable counter = 0
    let mutable stop = false
    while not stop && counter < n do
        let prices = embassyPrices dp ctx raceName |> List.map (fun p -> (p.Resource, p.Val))
        if Game.Resources.hasRes pool prices 0.0 then
            pool <- Game.Resources.payPrices calendarDay pool prices
            let race = dp.Races.[raceName]
            dp <- { dp with Races = dp.Races |> Map.add raceName { race with EmbassyLevel = race.EmbassyLevel + 1 } }
            counter <- counter + 1
        else
            stop <- true
    (dp, pool, counter)
