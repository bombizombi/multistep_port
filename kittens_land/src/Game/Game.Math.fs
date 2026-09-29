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

// ---------------------------------------------------------------------------
// math-01..04: the js/math.js distribution library (com.nuclearunicorn.game.Math).
// Every function consumes the harness-owned stream; verification is draw-exact
// via resop seed + draws (D014).

let private ln2 = 0.6931471805599453 // Math.LN2

/// math-01: log1p — series expansion for small |p| (used by geometricRandom).
let log1p (p: float) : float =
    if abs p > 0.25 then
        log (1.0 + p)
    else
        let mutable power = p
        let minusP = -p
        let coefficients = ResizeArray<float> [ 0.0; power ]
        let n = 1 + int (ceil (-52.0 * ln2 / log (abs p)))
        for i in 2..n do
            power <- power * minusP
            coefficients.[i] <- power / float i
        let mutable result = coefficients.[n]
        for i in (n - 1) .. -1 .. 1 do
            result <- result + coefficients.[i]
        result

/// math-02: standardGaussianRandom — Box-Muller, cos variate only. The two
/// while-loops redraw on exactly u=0/v=0 (probability ~0 but they consume draws).
let standardGaussianRandom (rand: unit -> float) : float =
    let mutable u = 0.0
    let mutable v = 0.0
    while u = 0.0 do
        u <- rand ()
    while v = 0.0 do
        v <- rand ()
    sqrt (-2.0 * log u) * cos (2.0 * System.Math.PI * v)

/// The shared engine of irwinHall/binomial: loop below 100 trials or when bounds
/// are tight; Gaussian approximation (with rounding for discrete + rejection
/// retry) otherwise. `baseDistribution` consumes the stream per call.
let loopOrGaussianApproximation
    (rand: unit -> float)
    (trials: float)
    (isDiscrete: bool)
    (mean: float)
    (variance: float)
    (lowerBound: float)
    (upperBound: float)
    (baseDistribution: unit -> float)
    : float =
    let globalMean = trials * mean
    let globalStandardDeviation = sqrt (trials * variance)
    let globalLowerBound = trials * lowerBound
    let globalUpperBound = trials * upperBound

    if trials < 100.0
       || globalMean - 5.0 * globalStandardDeviation < globalLowerBound
       || globalMean + 5.0 * globalStandardDeviation > globalUpperBound then
        let mutable result = 0.0
        let mutable i = trials
        while i > 0.0 do
            result <- result + baseDistribution ()
            i <- i - 1.0
        result
    else
        let mutable result = nan
        let mutable done' = false
        while not done' do
            result <- globalStandardDeviation * standardGaussianRandom rand + globalMean
            if isDiscrete then result <- jsRound result
            if globalLowerBound <= result && result <= globalUpperBound then done' <- true
        result

/// math-03: irwinHallRandom — sum of `trials` uniform [0,1] variables.
let irwinHallRandom (rand: unit -> float) (trials: float) : float =
    loopOrGaussianApproximation rand trials false 0.5 (1.0 / 12.0) 0.0 1.0 rand

/// math-03: binominalRandomInteger — hunting loot distribution.
let binominalRandomInteger (rand: unit -> float) (trials: float) (successProbability: float) : float =
    if successProbability <= 0.0 then 0.0
    elif successProbability >= 1.0 then trials
    else
        loopOrGaussianApproximation
            rand
            trials
            true
            successProbability
            (successProbability * (1.0 - successProbability))
            0.0
            1.0
            (fun () -> if rand () < successProbability then 1.0 else 0.0)

/// math-04: geometricRandom — attempts until an event of probability p; p<=0 is
/// Infinity (by design, so max(N - geom, 0) idioms work). log1p series inside.
let geometricRandom (rand: unit -> float) (p: float) : float =
    if p >= 1.0 then 1.0
    elif p <= 0.0 then System.Double.PositiveInfinity
    else
        let mutable u = 0.0
        while u = 0.0 do
            u <- rand ()
        ceil (log u / log1p (-p))

/// orig Kitten.precisionRound(number, 1): the e-notation round-trip reduces to
/// jsRound(x*10)/10 in the normal range (string round-trip is exact there).
let jsRoundX1 (x: float) : float = jsRound (x * 10.0) / 10.0
