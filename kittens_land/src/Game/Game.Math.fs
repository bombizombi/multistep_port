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

/// JS `x || 0` for numbers: NaN/0 collapse to 0, everything else passes through.
let jsOr0 (x: float) : float =
    if System.Double.IsNaN x || x = 0.0 then 0.0 else x

/// game.getLimitedDR — hyperbolic diminishing return: first 75% of the limit is
/// undiminished, the last 25% approaches 0.25×limit asymptotically. Sign-preserving.
let getLimitedDR (effect: float) (limit: float) : float =
    let absEffect = abs effect
    let maxUndiminished = 0.75 * limit
    if absEffect <= maxUndiminished then
        if effect < 0.0 then -absEffect else absEffect
    else
        let diminishedPortion = absEffect - maxUndiminished
        let delta = 0.25 * limit
        let diminishedEffect = (1.0 - (delta / (diminishedPortion + delta))) * delta
        let totalEffect = maxUndiminished + diminishedEffect
        if effect < 0.0 then -totalEffect else totalEffect

/// game.rand via js/math.js uniformRandomInteger(0, ratio): one Math.random draw.
/// `rand` is the harness-owned PRNG stream (orig patches Math.random; the F#
/// runner owns the same splitmix32+sfc32 stream).
let uniformRandomInteger (rand: unit -> float) (min': float) (max': float) : float =
    let lo = jsRound min'
    let hi = jsRound max'
    lo + floor (rand () * (hi - lo))
