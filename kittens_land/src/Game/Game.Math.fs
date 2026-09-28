module Game.Math

// Diminishing-return helpers from game.js (formally game-09 scope; included here
// because resources-03's karma branch needs them). Ported expression-for-expression
// per D003/D013 — no algebraic simplification.

let private sqrt2 = 1.4142135623730951 // Math.SQRT2

/// game.getUnlimitedDR — sqrt curve; falls back to the asymptotic form at overflow.
let getUnlimitedDR (value: float) (stripe: float) : float =
    let result = (sqrt (1.0 + (value / stripe) * 8.0) - 1.0) / 2.0
    if result = System.Double.PositiveInfinity then
        sqrt value / sqrt stripe * sqrt2
    else
        result

/// game.getInverseUnlimitedDR — the input getUnlimitedDR would map back to `value`.
let getInverseUnlimitedDR (value: float) (stripe: float) : float =
    stripe / 2.0 * value * (value + 1.0)

/// JS Math.round — half-up (JS spec: floor(x + 0.5)). F# `round` is banker's
/// rounding and would diverge (D013-1). Always use this where orig says Math.round.
let jsRound (x: float) : float = floor (x + 0.5)
