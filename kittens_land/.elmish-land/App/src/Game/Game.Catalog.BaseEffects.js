
import { tryFind, add, fold, ofList } from "../../fable_modules/fable-library-js.5.17.0/Map.js";
import { ofArray } from "../../fable_modules/fable-library-js.5.17.0/List.js";
import { comparePrimitives } from "../../fable_modules/fable-library-js.5.17.0/Util.js";

export const bldBase = ofList(ofArray([["catnipMax", 5000], ["woodMax", 200], ["mineralsMax", 250], ["coalMax", 60], ["ironMax", 50], ["titaniumMax", 2], ["goldMax", 10], ["oilMax", 1500], ["uraniumMax", 250], ["unobtainiumMax", 150], ["antimatterMax", 100], ["manpowerMax", 100], ["scienceMax", 250], ["cultureMax", 100], ["faithMax", 100]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
});

export const timeBase = ofList(ofArray([["heatPerTick", 0.01], ["heatMax", 100], ["temporalFluxMax", 3000]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
});

export const baseEffects = fold((acc, k, v) => add(k, v, acc), timeBase, bldBase);

/**
 * game.getEffect(name) at fresh state: the effects cache IS this table.
 */
export function getEffect(name) {
    const matchValue = tryFind(name, baseEffects);
    if (matchValue == null) {
        return 0;
    }
    else {
        return matchValue;
    }
}

