
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { list_type, class_type, string_type, record_type, int32_type, bool_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { choose, ofArray, sumBy, exists, map } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { StackOptions, challengeDefs } from "./Game.Catalog.World.fs.js";
import { fold, empty, tryFind, add, FSharpMap__get_Item, ofList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { disposeSafe, getEnumerator, comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";
import { getLimitedDR } from "./Game.Math.fs.js";
import { max, min } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Double.js";
import { defaultArg } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Option.js";
import { ManagerGroup } from "./Game.Effects.fs.js";

export class ChallengeState extends Record {
    constructor(Unlocked, Pending, Active, Researched, On) {
        super();
        this.Unlocked = Unlocked;
        this.Pending = Pending;
        this.Active = Active;
        this.Researched = Researched;
        this.On = (On | 0);
    }
}

export function ChallengeState_$reflection() {
    return record_type("Game.Challenges.ChallengeState", [], ChallengeState, () => [["Unlocked", bool_type], ["Pending", bool_type], ["Active", bool_type], ["Researched", bool_type], ["On", int32_type]]);
}

export class ChallengePool extends Record {
    constructor(Challenges, Order) {
        super();
        this.Challenges = Challenges;
        this.Order = Order;
    }
}

export function ChallengePool_$reflection() {
    return record_type("Game.Challenges.ChallengePool", [], ChallengePool, () => [["Challenges", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, ChallengeState_$reflection()])], ["Order", list_type(string_type)]]);
}

export function init() {
    const order = map((c) => c.Name, challengeDefs);
    return new ChallengePool(ofList(map((c_1) => [c_1.Name, new ChallengeState(c_1.StartsUnlocked, false, false, false, 0)], challengeDefs), {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), order);
}

export function resetState(_cp) {
    return init();
}

export function getChallenge(cp, name) {
    return FSharpMap__get_Item(cp.Challenges, name);
}

export function isActive(cp, name) {
    return FSharpMap__get_Item(cp.Challenges, name).Active;
}

export function anyChallengeActive(cp) {
    return exists((n) => FSharpMap__get_Item(cp.Challenges, n).Active, cp.Order);
}

export function getCountCompletions(cp) {
    return sumBy((n) => (FSharpMap__get_Item(cp.Challenges, n).On | 0), cp.Order, {
        GetZero: () => 0,
        Add: (x, y) => ((x + y) | 0),
    }) | 0;
}

export function getCountUniqueCompletions(cp) {
    return sumBy((n) => {
        if (FSharpMap__get_Item(cp.Challenges, n).Researched) {
            return 1;
        }
        else {
            return 0;
        }
    }, cp.Order, {
        GetZero: () => 0,
        Add: (x, y) => ((x + y) | 0),
    }) | 0;
}

export function getCountPending(cp) {
    return sumBy((n) => {
        if (FSharpMap__get_Item(cp.Challenges, n).Pending) {
            return 1;
        }
        else {
            return 0;
        }
    }, cp.Order, {
        GetZero: () => 0,
        Add: (x, y) => ((x + y) | 0),
    }) | 0;
}

/**
 * orig researchChallenge (L660+): researched, on++, active off. Completion
 * conditions are polled in update() — space/aiCore seams never fire here.
 */
export function researchChallenge(name, cp) {
    const c = FSharpMap__get_Item(cp.Challenges, name);
    if (c.Active) {
        return new ChallengePool(add(name, new ChallengeState(c.Unlocked, c.Pending, false, true, c.On + 1), cp.Challenges), cp.Order);
    }
    else {
        return cp;
    }
}

/**
 * Harness-facing enable/abandon (the controller's enable/disable path: set
 * active + recalculate effects — the caller refreshes the cache).
 */
export function setActive(name, active, cp) {
    const c = FSharpMap__get_Item(cp.Challenges, name);
    let c$0027;
    if (active) {
        const unlocked = c.Unlocked ? true : (name === "ironWill");
        c$0027 = (new ChallengeState(unlocked, c.Pending, unlocked, c.Researched, c.On));
    }
    else {
        c$0027 = (new ChallengeState(c.Unlocked, c.Pending, false, c.Researched, c.On));
    }
    return new ChallengePool(add(name, c$0027, cp.Challenges), cp.Order);
}

const ldr = (effect) => ((limit) => getLimitedDR(effect, limit));

/**
 * orig getTradeBonusEffect (L318-330): tradepost ladder, requires completions
 * and an inactive challenge. tradepostVal is the live building val; the
 * tradeRatio 0.015 is the tradepost meta's own static effect.
 */
export function getTradeBonusEffect(cp, getEffect, tradepostVal) {
    const c = FSharpMap__get_Item(cp.Challenges, "pacifism");
    if ((c.On === 0) ? true : c.Active) {
        return 0;
    }
    else {
        const tradeKnowledge = getEffect("tradeKnowledge");
        const tradepostLimit = (7 + (tradeKnowledge * 3)) * (0.99 + (tradeKnowledge * 0.01));
        const tradepostRatioLimit = ldr(0.099 + (tradeKnowledge * 0.0075))(0.25);
        return 0.015 * min(tradepostLimit, tradepostVal * tradepostRatioLimit);
    }
}

const resWeights = ofList(ofArray([["catnip", 0], ["wood", 0.5], ["minerals", 0.35], ["iron", 1], ["titanium", 200], ["uranium", 150000], ["unobtainium", 1000000], ["antimatter", 10000000000], ["starchart", 200], ["spice", 250], ["beam", 0.75], ["slab", 0.75], ["plate", 5], ["concrate", 25], ["gear", 20], ["alloy", 300], ["eludium", 100000000], ["ship", 1500], ["tanker", 150000], ["kerosene", 7000], ["parchment", 2], ["compedium", 20], ["blueprint", 50], ["thorium", 180000], ["unicorns", -Infinity], ["alicorn", -Infinity], ["tears", -Infinity], ["megalith", -Infinity], ["default", 10]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
});

export function getResWeight(resName) {
    const matchValue = tryFind(resName, resWeights);
    if (matchValue == null) {
        return FSharpMap__get_Item(resWeights, "default");
    }
    else {
        const w = matchValue;
        return w;
    }
}

/**
 * unicornTears.sumPricesWeighted (L401-412): weight×val per line, NaN lines
 * skipped (indeterminate 0×Infinity), NaN totals collapse to 0.
 */
export function sumPricesWeighted(prices) {
    let total = 0;
    const enumerator = getEnumerator(prices);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const value = forLoopVar[1];
            const resName = forLoopVar[0];
            const lineValue = getResWeight(resName) * value;
            if (!Number.isNaN(lineValue)) {
                total = (total + lineValue);
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    if (Number.isNaN(total)) {
        return 0;
    }
    else {
        return total;
    }
}

function calculateEffectsFor(cp, getEffect, tradepostVal, name) {
    const c = FSharpMap__get_Item(cp.Challenges, name);
    switch (name) {
        case "winterIsComing":
            if (c.Active) {
                return ofList(ofArray([["springCatnipRatio", 0], ["summerSolarFarmRatio", 0], ["coldChance", 0.05], ["coldHarshness", -0.02]]), {
                    Compare: (x, y) => (comparePrimitives(x, y) | 0),
                });
            }
            else {
                return ofList(ofArray([["springCatnipRatio", 0.05], ["summerSolarFarmRatio", 0.05], ["coldChance", 0], ["coldHarshness", 0]]), {
                    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
                });
            }
        case "anarchy":
            if (c.Active) {
                const c$0027 = void getEffect("catnipDemandRatio");
                return ofList(ofArray([["masterSkillMultiplier", 0], ["kittenLaziness", 0.5 + ldr(0.05 * c.On)(0.25)]]), {
                    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
                });
            }
            else {
                return ofList(ofArray([["masterSkillMultiplier", 0.2], ["kittenLaziness", 0]]), {
                    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
                });
            }
        case "energy":
            return empty({
                Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
            });
        case "atheism":
            return empty({
                Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
            });
        case "1000Years":
            if (c.Active) {
                return ofList(ofArray([["shatterCostReduction", 0], ["shatterCostIncreaseChallenge", 0.5], ["shatterVoidCost", 0.4], ["temporalPressCap", 0], ["heatEfficiency", 0], ["heatCompression", 0]]), {
                    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
                });
            }
            else {
                return ofList(ofArray([["shatterCostReduction", -0.02], ["shatterCostIncreaseChallenge", 0], ["shatterVoidCost", 0], ["temporalPressCap", 10], ["heatEfficiency", 0.1], ["heatCompression", 0.05]]), {
                    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
                });
            }
        case "blackSky":
            return empty({
                Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
            });
        case "pacifism":
            if (c.Active) {
                return ofList(ofArray([["alicornPerTickRatio", 0], ["tradeKnowledge", 0], ["weaponEfficency", -0.1], ["policyFakeBought", 1], ["embassyFakeBought", 1], ["steamworksFakeBought", Math.floor(max(1, 1.5 * c.On)) / max(1, c.On)], ["tradeKnowledgeRatio", 0]]), {
                    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
                });
            }
            else {
                return ofList(ofArray([["alicornPerTickRatio", 0.1], ["tradeKnowledge", 1], ["weaponEfficency", 0], ["policyFakeBought", 0], ["embassyFakeBought", 0], ["steamworksFakeBought", 0], ["tradeKnowledgeRatio", getTradeBonusEffect(cp, getEffect, tradepostVal)]]), {
                    Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
                });
            }
        case "postApocalypse":
            if (c.Active) {
                return ofList(ofArray([["arrivalSlowdown", 10], ["cryochamberSupport", 1]]), {
                    Compare: (x_11, y_11) => (comparePrimitives(x_11, y_11) | 0),
                });
            }
            else {
                return ofList(ofArray([["arrivalSlowdown", 0], ["cryochamberSupport", 1]]), {
                    Compare: (x_12, y_12) => (comparePrimitives(x_12, y_12) | 0),
                });
            }
        case "unicornTears":
            if (c.Active) {
                return ofList(ofArray([["bonfireTearsPriceRatioChallenge", ldr(1.2 + (0.03 * c.On))(2.5)], ["scienceTearsPricesChallenge", 0.25], ["workshopTearsPricesChallenge", 0.01], ["cathPollutionPerTearOvercapped", 3], ["unicornsMax", 10], ["tearsMax", 1], ["alicornMax", 0.2], ["zigguratIvoryPriceRatio", 0]]), {
                    Compare: (x_13, y_13) => (comparePrimitives(x_13, y_13) | 0),
                });
            }
            else {
                return ofList(ofArray([["bonfireTearsPriceRatioChallenge", 0], ["scienceTearsPricesChallenge", 0], ["workshopTearsPricesChallenge", 0], ["cathPollutionPerTearOvercapped", 0], ["unicornsMax", 0], ["tearsMax", 0], ["alicornMax", 0], ["zigguratIvoryPriceRatio", -0.003]]), {
                    Compare: (x_14, y_14) => (comparePrimitives(x_14, y_14) | 0),
                });
            }
        default:
            return empty({
                Compare: (x_15, y_15) => (comparePrimitives(x_15, y_15) | 0),
            });
    }
}

/**
 * The challenges manager group: provider = amt × on (stackOptions: noStack /
 * LDRLimit / capMagnitude), then calculateEffects overrides merged.
 */
export function challengesGroup(cp, getEffect, tradepostVal) {
    return new ManagerGroup(empty({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), choose((def) => {
        const state = FSharpMap__get_Item(cp.Challenges, def.Name);
        if ((state.On > 0) ? true : state.Active) {
            const overrides = calculateEffectsFor(cp, getEffect, tradepostVal, def.Name);
            const effects = fold((acc, k, v) => add(k, v, acc), def.Effects, overrides);
            const stackOf = (k_1) => {
                const value = new StackOptions(false, undefined, undefined);
                return defaultArg(tryFind(k_1, def.StackOptions), value);
            };
            return [effects, (effectName) => ((v_1) => {
                const so = stackOf(effectName);
                if (so.NoStack) {
                    return v_1;
                }
                else {
                    let amt = v_1 * state.On;
                    const matchValue = so.LDRLimit;
                    if (matchValue == null) {
                    }
                    else {
                        const lim = matchValue;
                        amt = ldr(amt)(lim);
                    }
                    const matchValue_1 = so.CapMagnitude;
                    if (matchValue_1 == null) {
                    }
                    else {
                        const cap = matchValue_1;
                        amt = max(-cap, min(cap, amt));
                    }
                    return amt;
                }
            })];
        }
        else {
            return undefined;
        }
    }, challengeDefs));
}

