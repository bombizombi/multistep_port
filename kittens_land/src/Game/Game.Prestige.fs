module Game.Prestige

// prestige-01..05: perk data (catalog), manager lifecycle, paragon economy math,
// reset bonus preview. Sources: js/prestige.js L492-604 (manager), L549-597
// (ratios + breakdown), L608-647 (controllers — buy path is the
// BuildingNotStackableBtnController buyItem/onPurchase, core.js L2446-2529).
// Perk purchase pays paragon via payPrices; the "diplomacy" perk's handler
// (unlockRelations) is honored by the caller (science-09).

open Game.Types

type PerkMeta =
    { Unlocked: bool
      Researched: bool }

type PrestigePool =
    { Perks: Map<string, PerkMeta>
      PerkOrder: string list
      HideResearched: bool }

let init () : PrestigePool =
    let order = Game.Catalog.World.perkDefs |> List.map (fun p -> p.Name)
    { Perks =
        Game.Catalog.World.perkDefs
        |> List.map (fun p -> (p.Name, { Unlocked = p.StartsUnlocked; Researched = false }))
        |> Map.ofList
      PerkOrder = order
      HideResearched = false }

let getPerk (pp: PrestigePool) (name: string) : PerkMeta = pp.Perks.[name]

let resetState (_pp: PrestigePool) : PrestigePool = init ()

/// orig getSpentParagon (L526-535): sums perk.paragon — no def defines that
/// field in this version, so it is 0 (kept for contract completeness).
let getSpentParagon (pp: PrestigePool) : float =
    let _ = pp
    0.0

let getParagonRatio (getEffect: string -> float) : float =
    1.0 + getEffect "paragonRatio"

/// orig getBurnedParagonRatio (L552-554): UDR(burnedParagon.value, 500)
let getBurnedParagonRatio (burnedParagon: float) : float =
    Game.Math.getUnlimitedDR burnedParagon 500.0

/// orig getParagonProductionRatio (L556-572): LDR-capped paragon production +
/// burned-paragon production (×4 cap in dark future — darkFutureYears seam -1)
let getParagonProductionRatio (getEffect: string -> float) (paragon: float) (burnedParagon: float) : float =
    let paragonRatio = getParagonRatio getEffect
    let mutable productionRatioParagon = (paragon * 0.010) * paragonRatio
    productionRatioParagon <- Game.Math.getLimitedDR productionRatioParagon (2.0 * paragonRatio)
    let ratio = 1.0 // darkFutureYears() >= 0 ? 4 : 1 — seam: -1 at fresh
    let mutable productionRatioBurnedParagon = burnedParagon * 0.010 * paragonRatio
    productionRatioBurnedParagon <- Game.Math.getLimitedDR productionRatioBurnedParagon (ratio * paragonRatio)
    productionRatioParagon + productionRatioBurnedParagon

/// orig getParagonStorageRatio (L574-583): every 100 paragon → +10% storage;
/// burned paragon /500 in dark future, /2000 before (seam: pre-dark-future)
let getParagonStorageRatio (getEffect: string -> float) (paragon: float) (burnedParagon: float) : float =
    let paragonRatio = getParagonRatio getEffect
    let mutable storageRatio = (paragon / 1000.0) * paragonRatio
    // darkFutureYears() >= 0 branch is the /500 one; at fresh we take /2000
    storageRatio <- storageRatio + (burnedParagon / 2000.0) * paragonRatio
    storageRatio

/// orig getResetBonusBreakdown (L588-600): marginal fractions a reset would add
type ResetBonus = { Happiness: float; Storage: float; Production: float }

let getResetBonusBreakdown
    (getEffect: string -> float)
    (paragon: float)
    (extraParagon: float)
    (extraKarma: float)
    : ResetBonus =
    let paragonRatio = getParagonRatio getEffect
    let prodCur = Game.Math.getLimitedDR ((paragon * 0.010) * paragonRatio) (2.0 * paragonRatio)
    let prodNew = Game.Math.getLimitedDR (((paragon + extraParagon) * 0.010) * paragonRatio) (2.0 * paragonRatio)
    { Happiness = extraKarma / 100.0
      Storage = (extraParagon / 1000.0) * paragonRatio
      Production = prodNew - prodCur }

// --- purchase (PrestigeBtnController → BuildingNotStackableBtnController) -----

type PerkBuyResult =
    { Pool: PrestigePool
      Bought: bool
      UnlockFanOut: UnlockList option
      UpgradeFanOut: UnlockList option
      RunsDiplomacyHandler: bool }

/// orig buyItem gates: metaphysics researched (controller L622-631) +
/// !researched + hasResources (core.js L2477-2491). onPurchase: handler →
/// unlock → upgrade.
let buyPerk (calendarDay: int) (metaphysicsResearched: bool) (pool: ResPool) (name: string) (pp: PrestigePool) : PrestigePool * ResPool * PerkBuyResult =
    let def = Game.Catalog.World.perkDefs |> List.find (fun p -> p.Name = name)
    let meta = pp.Perks.[name]
    if not metaphysicsResearched || meta.Researched then
        pp, pool, { Pool = pp; Bought = false; UnlockFanOut = None; UpgradeFanOut = None; RunsDiplomacyHandler = false }
    else
        let prices = def.Prices |> List.map (fun p -> (p.Resource, p.Val))
        if not (Game.Resources.hasRes pool prices 0.0) then
            pp, pool, { Pool = pp; Bought = false; UnlockFanOut = None; UpgradeFanOut = None; RunsDiplomacyHandler = false }
        else
            let pool' = Game.Resources.payPrices calendarDay pool prices
            let pp' = { pp with Perks = pp.Perks |> Map.add name { meta with Researched = true } }
            pp',
            pool',
            { Pool = pp'
              Bought = true
              UnlockFanOut = def.Unlocks
              UpgradeFanOut = def.Upgrades
              RunsDiplomacyHandler = def.HasHandler }

/// Manager group for the global effects cache (prestige slot): research
/// provider — researched perks contribute their raw effects.
let prestigeGroup (pp: PrestigePool) : Game.Effects.ManagerGroup =
    { Base = Map.empty
      Items =
        Game.Catalog.World.perkDefs
        |> List.choose (fun def ->
            let meta = pp.Perks.[def.Name]
            if meta.Researched && not def.Effects.IsEmpty then
                Some(def.Effects, (fun _ (v: float) -> v))
            else
                None) }
