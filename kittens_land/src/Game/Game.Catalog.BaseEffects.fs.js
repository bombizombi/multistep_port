
import { tryFind, ofList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { ofArray } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";

export const baseEffects = ofList(ofArray([["catnipMax", 5000], ["woodMax", 200], ["mineralsMax", 250], ["coalMax", 60], ["ironMax", 50], ["titaniumMax", 2], ["goldMax", 10], ["oilMax", 1500], ["uraniumMax", 250], ["unobtainiumMax", 150], ["antimatterMax", 100], ["manpowerMax", 100], ["scienceMax", 250], ["cultureMax", 100], ["faithMax", 100], ["heatPerTick", 0.01], ["heatMax", 100], ["temporalFluxMax", 3000]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
});

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

