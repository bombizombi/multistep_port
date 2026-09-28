module Game.Types

// resources-01/02 data shapes. JS semantics notes:
//  - undefined bools in resourceData are normalized to false (JS truthiness).
//  - `Category` is orig's `type` field; `Color`/`Tag` are optional strings.
//  - RefundableRule dispatches the one function-valued isRefundable override
//    (antimatter: energyProd >= energyCons) — conversion pattern #3; the rule
//    itself is evaluated in resources-07 territory, not here.

type RefundableRule =
    | Default
    | EnergyBalanced

type ResourceDef =
    { Name: string
      Category: string
      Visible: bool
      Color: string option
      Craftable: bool
      CalculatePerTick: bool
      Persists: bool
      AiCanDestroy: bool
      Transient: bool
      Tag: string option
      IsNotRefundable: bool
      CalculatePerDay: bool
      CalculatePerTickAndDay: bool
      CalculateOnYear: bool
      RefundableRule: RefundableRule }

/// Live state of one resource (orig mutates the def object in place; the port
/// threads immutable state — conversion pattern #2).
type ResourceState =
    { Def: ResourceDef
      Value: float
      Unlocked: bool
      MaxValue: float
      PerTickCached: float } // set by game.updateResources (game-10 slice); read by fastforward

/// The resPool registry. Order mirrors orig's resPool.resources array.
/// KarmaKittens is game.karmaKittens in orig — parked here until game-06 owns
/// GamePage state (see Game.Resources.addRes karma branch). Energy fields are
/// resPool.energyProd/energyWinterProd/energyCons (resources-07).
type ResPool =
    { Order: string list
      ByName: Map<string, ResourceState>
      KarmaKittens: int
      EnergyProd: float
      EnergyWinterProd: float
      EnergyCons: float }

// --- buildings-01 / science-01 / science-02 / workshop-01 / workshop-02 data ---

type Price = { Resource: string; Val: float }

type UnlockList =
    { Buildings: string list
      Tabs: string list
      Jobs: string list
      Tech: string list
      Policies: string list
      Upgrades: string list
      ZebraUpgrades: string list
      Religion: string list
      Crafts: string list
      Perks: string list
      Stages: string list }

type StageDef =
    { StageKey: string option
      Prices: Price list
      UnlockRatio: float option
      Effects: Map<string, float> }

type BuildingDef =
    { Name: string
      Tab: string option
      Stage: int
      UnlockRatio: float option
      DefaultUnlockable: bool
      Prices: Price list
      PriceRatio: float option
      LimitBuild: float option
      TogglableOnOff: bool
      NoStackable: bool
      BreaksIronWill: bool
      Effects: Map<string, float>
      StartsUnlocked: bool
      StartsUnlockable: bool
      Stages: StageDef list
      Unlocks: UnlockList option
      Upgrades: UnlockList option
      UnlockScheme: (string * float) option }

type TechDef =
    { Name: string
      Prices: Price list
      Unlocks: UnlockList option
      Upgrades: UnlockList option }

type PolicyDef =
    { Name: string
      Prices: Price list
      IsRelation: bool
      RelationGate: (string * int) option   // evaluateLocks checkRelation veto
      Unlocks: UnlockList option }

type UpgradeDef =
    { Name: string
      Prices: Price list
      Effects: Map<string, float> }

type CraftDef =
    { Name: string
      Prices: Price list
      Tier: float option
      IgnoreBonuses: bool
      ProgressHandicap: float
      StartsUnlocked: bool }

/// Live building state (orig mutates the def; conversion pattern #2).
type BuildingState =
    { Def: BuildingDef
      Val: int
      On: int
      Unlocked: bool
      Unlockable: bool
      Stage: int }

/// Live tech/policy/upgrade state.
type ResearchState =
    { Def: TechDef
      Unlocked: bool
      Researched: bool }

type PolicyState =
    { Def: PolicyDef
      Unlocked: bool
      Researched: bool }

type UpgradeState =
    { Def: UpgradeDef
      Unlocked: bool
      Researched: bool }

type CraftState =
    { Def: CraftDef
      Unlocked: bool
      Value: float
      Progress: float
      IsLimited: bool
      IsLimitedAmt: bool }

/// Zebra upgrade (workshop-10): research meta bought with bloodstone/science.
type ZebraUpgradeDef =
    { Name: string
      Prices: Price list
      Effects: Map<string, float>
      Unlocks: UnlockList option
      Upgrades: UnlockList option }

// --- game-04: undo event record (game.js L637-694) -----------------------------

/// Manager-specific undo payloads (orig: opaque `data` objects per manager).
type UndoData =
    | BuildUndo of building: string * count: int          // bld.undo (sellInternal, 50% refund)
    | CraftUndo of craft: string * gained: float * spent: (string * float) list
    | TradeUndo of trades: float * spent: (string * float) list * gained: (string * float) list
    | PraiseUndo of faithSpent: float * worshipGained: float
    | AdoreUndo of worshipBefore: float * epiphanyGained: float

type UndoEvent =
    { ManagerId: string
      Data: UndoData }

type UndoChange =
    { Ttl: int                    // DEFAULT_TTL 20 × ticksPerSecond 5 = 100
      Events: UndoEvent list }    // addEvent order preserved

// Typed constructors: ResearchState/PolicyState/UpgradeState share all field
// names, and F# record inference resolves to the LAST declared — these pin the
// intended type at every construction site.
let mkResearch (def: TechDef) : ResearchState = { Def = def; Unlocked = false; Researched = false }
let mkPolicy (def: PolicyDef) : PolicyState = { Def = def; Unlocked = false; Researched = false }
let mkUpgrade (def: UpgradeDef) : UpgradeState = { Def = def; Unlocked = false; Researched = false }
