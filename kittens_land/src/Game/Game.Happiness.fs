module Game.Happiness

// village-05a: happiness model (orig js/village.js L931-1017). happiness ∈
// [0.25 .. ∞)/100; production multiplier in getResProduction. Fresh-game value:
// 1.0 (5 kittens → no penalty until >5; no bonuses). Karma/festival/luxury
// seams are wired with fresh-zero values; fascism policy seam fresh-false.

open Game.Types

type HappinessContext =
    { GetEffect: string -> float
      FascismResearched: bool
      FestivalDays: int
      Karma: float
      UpfrontPaymentResearched: bool
      // luxury scan over resPool (orig iterates ALL resources; only uncommon/
      // rare types with value > 0 count — at fresh none qualify)
      LuxuryCount: int
      PollutionHappines: float
      ElderBoxWithPaper: bool
      ConsumableLuxuryCount: int }

let freshHappinessContext : HappinessContext =
    { GetEffect = fun _ -> 0.0
      FascismResearched = false
      FestivalDays = 0
      Karma = 0.0
      UpfrontPaymentResearched = false
      LuxuryCount = 0
      PollutionHappines = 0.0
      ElderBoxWithPaper = false
      ConsumableLuxuryCount = 0 }

/// orig getUnhappiness(): (kittens − 5) × 2 × (1 + unhappinessRatio).
let getUnhappiness (ctx: HappinessContext) (kittens: int) : float =
    if ctx.FascismResearched then 0.0
    else
        float (kittens - 5) * 2.0 * (1.0 + ctx.GetEffect "unhappinessRatio")

/// orig updateHappines() → village.happiness ∈ [0.25 .. ] (fraction of 100).
let updateHappiness (ctx: HappinessContext) (kittens: int) (maxKittens: int) : float =
    let mutable happiness = 100.0

    let unhappiness = getUnhappiness ctx kittens
    if kittens > 5 then happiness <- happiness - unhappiness

    // environment effect: bonus + unhappiness + pollutionHappines (all 0 at fresh)
    happiness <- happiness + (ctx.GetEffect "happiness" + ctx.GetEffect "environmentHappinessBonus"
                              + ctx.GetEffect "environmentUnhappiness" + ctx.GetEffect "challengeHappiness"
                              + ctx.PollutionHappines)

    // luxury resources: +10% each (+epicurianism/consumable seams)
    let perLuxury = 10.0 + ctx.GetEffect "luxuryHappinessBonus"
    happiness <- happiness + float ctx.LuxuryCount * perLuxury
    if ctx.ElderBoxWithPaper then happiness <- happiness - perLuxury
    happiness <- happiness + float ctx.ConsumableLuxuryCount * ctx.GetEffect "consumableLuxuryHappiness"

    if ctx.FestivalDays > 0 then
        happiness <- happiness + 30.0 * (1.0 + ctx.GetEffect "festivalRatio")

    // karma: +1% per point (upfrontPayment debt seam at fresh: untouched)
    happiness <- happiness + ctx.Karma

    let overpopulation = kittens - maxKittens
    if overpopulation > 0 then
        happiness <- happiness - float overpopulation * 2.0

    if happiness < 25.0 then happiness <- 25.0

    happiness / 100.0
