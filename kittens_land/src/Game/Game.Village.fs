module Game.Village

// village-07: hunting loot (orig js/village.js huntFraction + gainHuntRes
// L1025-1118). RNG roll order IS the contract (D013-3/4). Zebras gate (>=10),
// bloodstone first-hunt geometric roll, gold gated on ironWill + goldOre,
// unicorn chance via alicornmancy seam (fresh-false). msg() side effects are
// UI-owned and skipped; pacifism unlock at >=1000 squads is a challenges seam.

open Game.Types
open Game.Math

type HuntContext =
    { GetEffect: string -> float
      Rand: unit -> float // counting wrapper supplied by the runner
      Zebras: float
      IronWill: bool
      GoldOreResearched: bool
      AlicornmancyResearched: bool
      UnicornPastureVal: int
      LeaderManagerBonus: float } // getEffectLeader("manager", 0)

/// orig getHuntUnicornChance (village.js L1121-1130): 0.25 with alicornmancy +
/// no pasture, else flat 0.05.
let getHuntUnicornChance (ctx: HuntContext) : float =
    if ctx.AlicornmancyResearched && ctx.UnicornPastureVal = 0 then 0.25
    else 0.05

/// orig gainHuntRes(squads) — roll order IS the contract:
/// unicorns (binomial) → bloodstone gate (zebras ≥ 10) → gold (ironWill +
/// goldOre) → ivory (binomial + 2 irwin-halls) → furs (binomial + 2 irwin-halls).
let rec gainHuntRes (ctx: HuntContext) (squads: float) (pool: ResPool) : ResPool =
    let rand = ctx.Rand

    // (pacifism unlock at squads >= 1000: challenges seam — flagged)

    let unicornChance = getHuntUnicornChance ctx
    let unicorns = binominalRandomInteger rand squads unicornChance
    let pool = Game.Resources.addResEvent 0 "unicorns" unicorns pool |> fst

    let pool =
        if ctx.Zebras >= 10.0 then
            let bloodstoneRatio = 1.0 + ctx.GetEffect "bloodstoneRatio"
            let mutable bloodstoneSquads = squads
            let bloodstoneVal =
                match Game.Resources.get pool "bloodstone" with
                | Some b -> b.Value
                | None -> 0.0
            let mutable pool = pool
            if bloodstoneVal = 0.0 then
                let huntsUntilBloodstone = geometricRandom rand (0.05 * bloodstoneRatio)
                if huntsUntilBloodstone <= bloodstoneSquads then
                    pool <- Game.Resources.addResEvent 0 "bloodstone" 1.0 pool |> fst
                bloodstoneSquads <- max 0.0 (bloodstoneSquads - huntsUntilBloodstone)
            let bloodstone = binominalRandomInteger rand bloodstoneSquads (0.005 * bloodstoneRatio)
            Game.Resources.addResEvent 0 "bloodstone" bloodstone pool |> fst
        else
            pool

    let hunterRatio = ctx.GetEffect "hunterRatio" + ctx.LeaderManagerBonus

    let pool =
        if ctx.IronWill && ctx.GoldOreResearched then
            let goldHunts = binominalRandomInteger rand squads 0.25
            let gold =
                5.0 * irwinHallRandom rand goldHunts
                + 5.0 * hunterRatio * irwinHallRandom rand goldHunts
            Game.Resources.addResEvent 0 "gold" gold pool |> fst
        else
            pool

    let ivoryHunts = binominalRandomInteger rand squads (0.45 + 0.02 * hunterRatio)
    let ivory =
        50.0 * irwinHallRandom rand ivoryHunts
        + 40.0 * hunterRatio * irwinHallRandom rand ivoryHunts
    let pool = Game.Resources.addResEvent 0 "ivory" ivory pool |> fst

    let furs =
        80.0 * irwinHallRandom rand squads
        + 65.0 * hunterRatio * irwinHallRandom rand squads
    let pool = Game.Resources.addResEvent 0 "furs" furs pool |> fst

    pool

/// orig huntFraction(divisor): squads affordable at manpowerCost
/// (100 − huntCatpowerDiscount); spend + loot. Returns updated pool.
let huntFraction (ctx: HuntContext) (divisor: float) (pool: ResPool) : ResPool =
    let manpowerCost = 100.0 - ctx.GetEffect "huntCatpowerDiscount"
    let squads =
        match Game.Resources.get pool "manpower" with
        | Some m -> floor (floor (m.Value / manpowerCost) / divisor)
        | None -> 0.0
    if squads >= 1.0 then
        let poolSpent, _ = Game.Resources.addResEvent 0 "manpower" (-squads * manpowerCost) pool
        gainHuntRes ctx squads poolSpent
    else
        pool

/// orig village.huntAll(): huntFraction(1).
let huntAll (ctx: HuntContext) (pool: ResPool) : ResPool = huntFraction ctx 1.0 pool
