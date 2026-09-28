

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

