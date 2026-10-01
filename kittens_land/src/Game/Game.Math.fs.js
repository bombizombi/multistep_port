
import { item, setItem } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Array.js";

const sqrt2 = 1.4142135623730951;

/**
 * game.getUnlimitedDR — sqrt curve; falls back to the asymptotic form at overflow.
 */
export function getUnlimitedDR(value, stripe) {
    const result = (Math.sqrt(1 + ((value / stripe) * 8)) - 1) / 2;
    if (result === Infinity) {
        return (Math.sqrt(value) / Math.sqrt(stripe)) * sqrt2;
    }
    else {
        return result;
    }
}

/**
 * game.getInverseUnlimitedDR — the input getUnlimitedDR would map back to `value`.
 */
export function getInverseUnlimitedDR(value, stripe) {
    return ((stripe / 2) * value) * (value + 1);
}

/**
 * JS Math.round — half-up (JS spec: floor(x + 0.5)). F# `round` is banker's
 * rounding and would diverge (D013-1). Always use this where orig says Math.round.
 */
export function jsRound(x) {
    return Math.floor(x + 0.5);
}

/**
 * JS `x || 0` for numbers: NaN/0 collapse to 0, everything else passes through.
 */
export function jsOr0(x) {
    if (Number.isNaN(x) ? true : (x === 0)) {
        return 0;
    }
    else {
        return x;
    }
}

/**
 * game.getLimitedDR — hyperbolic diminishing return: first 75% of the limit is
 * undiminished, the last 25% approaches 0.25×limit asymptotically. Sign-preserving.
 */
export function getLimitedDR(effect, limit) {
    const absEffect = Math.abs(effect);
    const maxUndiminished = 0.75 * limit;
    if (absEffect <= maxUndiminished) {
        if (effect < 0) {
            return -absEffect;
        }
        else {
            return absEffect;
        }
    }
    else {
        const diminishedPortion = absEffect - maxUndiminished;
        const delta = 0.25 * limit;
        const diminishedEffect = (1 - (delta / (diminishedPortion + delta))) * delta;
        const totalEffect = maxUndiminished + diminishedEffect;
        if (effect < 0) {
            return -totalEffect;
        }
        else {
            return totalEffect;
        }
    }
}

/**
 * game.rand via js/math.js uniformRandomInteger(0, ratio): one Math.random draw.
 * `rand` is the harness-owned PRNG stream (orig patches Math.random; the F#
 * runner owns the same splitmix32+sfc32 stream).
 */
export function uniformRandomInteger(rand, min$0027, max$0027) {
    const lo = jsRound(min$0027);
    const hi = jsRound(max$0027);
    return lo + Math.floor(rand() * (hi - lo));
}

const ln2 = 0.6931471805599453;

/**
 * math-01: log1p — series expansion for small |p| (used by geometricRandom).
 */
export function log1p(p) {
    if (Math.abs(p) > 0.25) {
        return Math.log(1 + p);
    }
    else {
        let power = p;
        const minusP = -p;
        const coefficients = [0, power];
        const n = (1 + ~~Math.ceil((-52 * ln2) / Math.log(Math.abs(p)))) | 0;
        for (let i = 2; i <= n; i++) {
            power = (power * minusP);
            setItem(coefficients, i, power / i);
        }
        let result = item(n, coefficients);
        for (let i_1 = n - 1; i_1 >= 1; i_1--) {
            result = (result + item(i_1, coefficients));
        }
        return result;
    }
}

/**
 * math-02: standardGaussianRandom — Box-Muller, cos variate only. The two
 * while-loops redraw on exactly u=0/v=0 (probability ~0 but they consume draws).
 */
export function standardGaussianRandom(rand) {
    let u = 0;
    let v = 0;
    while (u === 0) {
        u = rand();
    }
    while (v === 0) {
        v = rand();
    }
    return Math.sqrt(-2 * Math.log(u)) * Math.cos((2 * 3.141592653589793) * v);
}

/**
 * The shared engine of irwinHall/binomial: loop below 100 trials or when bounds
 * are tight; Gaussian approximation (with rounding for discrete + rejection
 * retry) otherwise. `baseDistribution` consumes the stream per call.
 */
export function loopOrGaussianApproximation(rand, trials, isDiscrete, mean, variance, lowerBound, upperBound, baseDistribution) {
    const globalMean = trials * mean;
    const globalStandardDeviation = Math.sqrt(trials * variance);
    const globalLowerBound = trials * lowerBound;
    const globalUpperBound = trials * upperBound;
    if (((trials < 100) ? true : ((globalMean - (5 * globalStandardDeviation)) < globalLowerBound)) ? true : ((globalMean + (5 * globalStandardDeviation)) > globalUpperBound)) {
        let result = 0;
        let i = trials;
        while (i > 0) {
            result = (result + baseDistribution());
            i = (i - 1);
        }
        return result;
    }
    else {
        let result_1 = Number.NaN;
        let done$0027 = false;
        while (!done$0027) {
            result_1 = ((globalStandardDeviation * standardGaussianRandom(rand)) + globalMean);
            if (isDiscrete) {
                result_1 = jsRound(result_1);
            }
            if ((globalLowerBound <= result_1) && (result_1 <= globalUpperBound)) {
                done$0027 = true;
            }
        }
        return result_1;
    }
}

/**
 * math-03: irwinHallRandom — sum of `trials` uniform [0,1] variables.
 */
export function irwinHallRandom(rand, trials) {
    return loopOrGaussianApproximation(rand, trials, false, 0.5, 1 / 12, 0, 1, rand);
}

/**
 * math-03: binominalRandomInteger — hunting loot distribution.
 */
export function binominalRandomInteger(rand, trials, successProbability) {
    if (successProbability <= 0) {
        return 0;
    }
    else if (successProbability >= 1) {
        return trials;
    }
    else {
        return loopOrGaussianApproximation(rand, trials, true, successProbability, successProbability * (1 - successProbability), 0, 1, () => ((rand() < successProbability) ? 1 : 0));
    }
}

/**
 * math-04: geometricRandom — attempts until an event of probability p; p<=0 is
 * Infinity (by design, so max(N - geom, 0) idioms work). log1p series inside.
 */
export function geometricRandom(rand, p) {
    if (p >= 1) {
        return 1;
    }
    else if (p <= 0) {
        return Infinity;
    }
    else {
        let u = 0;
        while (u === 0) {
            u = rand();
        }
        return Math.ceil(Math.log(u) / log1p(-p));
    }
}

/**
 * orig Kitten.precisionRound(number, 1): the e-notation round-trip reduces to
 * jsRound(x*10)/10 in the normal range (string round-trip is exact there).
 */
export function jsRoundX1(x) {
    return jsRound(x * 10) / 10;
}

