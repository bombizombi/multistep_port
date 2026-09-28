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
      MaxValue: float }

/// The resPool registry. Order mirrors orig's resPool.resources array.
/// KarmaKittens is game.karmaKittens in orig — parked here until game-06 owns
/// GamePage state (see Game.Resources.addRes karma branch).
type ResPool =
    { Order: string list
      ByName: Map<string, ResourceState>
      KarmaKittens: int }
