
import { Record } from "../../fable_modules/fable-library-js.5.17.0/Types.js";
import { unit_type, tuple_type, option_type, lambda_type, list_type, record_type, class_type, float64_type, string_type, bool_type, int32_type } from "../../fable_modules/fable-library-js.5.17.0/Reflection.js";
import { map as map_1, add, FSharpMap__get_Item, empty, ofList } from "../../fable_modules/fable-library-js.5.17.0/Map.js";
import { choose, forAll, head, isEmpty, empty as empty_1, singleton, ofArray, contains, find, map } from "../../fable_modules/fable-library-js.5.17.0/List.js";
import { stringHash, disposeSafe, getEnumerator, comparePrimitives } from "../../fable_modules/fable-library-js.5.17.0/Util.js";
import { planetDefs, buildingDefs, programDefs } from "./Game.Catalog.Space.js";
import { getUnlimitedDR, getLimitedDR } from "./Game.Math.js";
import { addResEvent, payPrices, hasRes } from "./Game.Resources.js";
import { max } from "../../fable_modules/fable-library-js.5.17.0/Double.js";
import { ManagerGroup } from "./Game.Effects.js";

export class SpaceMeta extends Record {
    constructor(Val, On, Unlocked, Effects) {
        super();
        this.Val = (Val | 0);
        this.On = (On | 0);
        this.Unlocked = Unlocked;
        this.Effects = Effects;
    }
}

export function SpaceMeta_$reflection() {
    return record_type("Game.Space.SpaceMeta", [], SpaceMeta, () => [["Val", int32_type], ["On", int32_type], ["Unlocked", bool_type], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class PlanetState extends Record {
    constructor(Reached, Unlocked, RouteDays) {
        super();
        this.Reached = Reached;
        this.Unlocked = Unlocked;
        this.RouteDays = RouteDays;
    }
}

export function PlanetState_$reflection() {
    return record_type("Game.Space.PlanetState", [], PlanetState, () => [["Reached", bool_type], ["Unlocked", bool_type], ["RouteDays", float64_type]]);
}

export class SpacePool extends Record {
    constructor(Programs, ProgramOrder, Buildings, BuildingOrder, Planets, PlanetOrder) {
        super();
        this.Programs = Programs;
        this.ProgramOrder = ProgramOrder;
        this.Buildings = Buildings;
        this.BuildingOrder = BuildingOrder;
        this.Planets = Planets;
        this.PlanetOrder = PlanetOrder;
    }
}

export function SpacePool_$reflection() {
    return record_type("Game.Space.SpacePool", [], SpacePool, () => [["Programs", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, SpaceMeta_$reflection()])], ["ProgramOrder", list_type(string_type)], ["Buildings", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, SpaceMeta_$reflection()])], ["BuildingOrder", list_type(string_type)], ["Planets", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, PlanetState_$reflection()])], ["PlanetOrder", list_type(string_type)]]);
}

export function init() {
    return new SpacePool(ofList(map((d) => [d.Name, new SpaceMeta(0, 0, d.Name === "orbitalLaunch", empty({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }))], programDefs), {
        Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
    }), map((d_1) => d_1.Name, programDefs), ofList(map((d_2) => [d_2.Name, new SpaceMeta(0, 0, false, d_2.Effects)], buildingDefs), {
        Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
    }), map((d_3) => d_3.Name, buildingDefs), ofList(map((d_4) => [d_4.Name, new PlanetState(false, false, d_4.RouteDays)], planetDefs), {
        Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
    }), map((d_5) => d_5.Name, planetDefs));
}

export function resetState(_sp) {
    return init();
}

export function getProgram(sp, name) {
    return FSharpMap__get_Item(sp.Programs, name);
}

export function getBuilding(sp, name) {
    return FSharpMap__get_Item(sp.Buildings, name);
}

/**
 * per-building priceRatio (js/space.js defs); orig controller default 1.15
 */
export function priceRatio(name) {
    switch (name) {
        case "sattelite":
            return 1.08;
        case "spaceElevator":
            return 1.15;
        case "spaceStation":
            return 1.12;
        case "moonOutpost":
            return 1.12;
        case "moonBase":
            return 1.12;
        case "planetCracker":
            return 1.18;
        case "hydrofracturer":
            return 1.18;
        case "spiceRefinery":
            return 1.15;
        case "researchVessel":
            return 1.15;
        case "orbitalArray":
            return 1.15;
        case "sunlifter":
            return 1.15;
        case "containmentChamber":
            return 1.125;
        case "heatsink":
            return 1.12;
        case "sunforge":
            return 1.12;
        case "cryostation":
            return 1.12;
        case "spaceBeacon":
            return 1.15;
        case "terraformingStation":
            return 1.25;
        case "hydroponics":
            return 1.15;
        case "hrHarvester":
            return 1.15;
        case "navigationRelay":
            return 1.2;
        case "spaceShuttle":
            return 1.15;
        case "entangler":
            return 1.15;
        case "tectonic":
            return 1.25;
        case "moltenCore":
            return 1.25;
        default:
            return 1.15;
    }
}

/**
 * SpaceProgramBtnController.getPrices (js/space.js L1298-1321): oil/manpower
 * reductions, blackSky orbitalLaunch starchart→0 / rest ×11.
 */
export function missionPrices(getEffect, blackSkyActive, name, def) {
    return map((p) => {
        let v = p.Val;
        if (p.Resource === "oil") {
            v = (v * (1 - getLimitedDR(getEffect("oilReductionRatio"), 0.75)));
        }
        if (p.Resource === "manpower") {
            v = (v * (1 - getLimitedDR(getEffect("catpowerReductionRatio"), 0.75)));
        }
        if (blackSkyActive && (name === "orbitalLaunch")) {
            v = ((p.Resource === "starchart") ? 0 : (v * 11));
        }
        return [p.Resource, v];
    }, def.Prices);
}

/**
 * PlanetBuildingBtnController.getPrices (js/space.js L1396-1428): priceRatio
 * ladder (oil 1.05), oilReductionRatio, per-meta + per-resource
 * CostReduction effects, blackSky sattelite (val=0) starchart→0 / rest ×14.
 */
export function buildingPrices(getEffect, blackSkyActive, def, val0) {
    const ratio = priceRatio(def.Name);
    const metaDiscount = 1 - getLimitedDR(getEffect(def.Name + "CostReduction"), 1);
    const oilDiscount = 1 - getLimitedDR(getEffect("oilReductionRatio"), 0.75);
    return map((p) => {
        let v = (p.Resource !== "oil") ? (p.Val * Math.pow(ratio, val0)) : ((p.Val * Math.pow(1.05, val0)) * oilDiscount);
        const resDiscount = 1 - getLimitedDR(getEffect(p.Resource + "CostReduction"), 1);
        v = ((v * metaDiscount) * resDiscount);
        if ((blackSkyActive && (def.Name === "sattelite")) && (val0 === 0)) {
            v = ((p.Resource === "starchart") ? 0 : (v * 14));
        }
        return [p.Resource, v];
    }, def.Prices);
}

/**
 * orig MissionBtnController build (L1322-1345 via StackableBtn build +
 * updateEnabled): gate on unlocked + not in-progress (val≠0 && on=0); after
 * the purchase loop metadata.on is reset to 0 — except rorschachMission
 * which completes instantly (on=1). Unlocks fire on the first completion.
 */
export function buyProgram(getEffect, blackSkyActive, calendarDay, name, maxBld, sp, pool) {
    let table_3, bind$0040_1, table_4, bind$0040_2;
    let sp_1 = sp;
    let pool_1 = pool;
    let counter = 0;
    let maxBld_1 = maxBld;
    const def = find((d) => (d.Name === name), programDefs);
    const m0 = FSharpMap__get_Item(sp_1.Programs, name);
    if (!((m0.Val !== 0) && (m0.On === 0))) {
        const prices = () => missionPrices(getEffect, blackSkyActive, name, def);
        while ((maxBld_1 > 0) && (hasRes(pool_1, prices(), 0))) {
            let table, bind$0040;
            const pool1 = payPrices(calendarDay, pool_1, prices());
            pool_1 = pool1;
            sp_1 = (new SpacePool((table = sp_1.Programs, add(name, (bind$0040 = FSharpMap__get_Item(sp_1.Programs, name), new SpaceMeta(FSharpMap__get_Item(sp_1.Programs, name).Val + 1, bind$0040.On, bind$0040.Unlocked, bind$0040.Effects)), table)), sp_1.ProgramOrder, sp_1.Buildings, sp_1.BuildingOrder, sp_1.Planets, sp_1.PlanetOrder));
            counter = ((counter + 1) | 0);
            maxBld_1 = ((maxBld_1 - 1) | 0);
            if (counter === 1) {
                const enumerator = getEnumerator(def.UnlocksPlanets);
                try {
                    while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                        let Planets;
                        const pn = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                        const pl = FSharpMap__get_Item(sp_1.Planets, pn);
                        sp_1 = ((Planets = add(pn, new PlanetState(pl.Reached, true, pl.RouteDays), sp_1.Planets), new SpacePool(sp_1.Programs, sp_1.ProgramOrder, sp_1.Buildings, sp_1.BuildingOrder, Planets, sp_1.PlanetOrder)));
                    }
                }
                finally {
                    disposeSafe(enumerator);
                }
                const enumerator_1 = getEnumerator(def.UnlocksMissions);
                try {
                    while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
                        const mn = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
                        const m = FSharpMap__get_Item(sp_1.Programs, mn);
                        sp_1 = (new SpacePool(add(mn, new SpaceMeta(m.Val, m.On, true, m.Effects), sp_1.Programs), sp_1.ProgramOrder, sp_1.Buildings, sp_1.BuildingOrder, sp_1.Planets, sp_1.PlanetOrder));
                    }
                }
                finally {
                    disposeSafe(enumerator_1);
                }
            }
        }
        sp_1 = (new SpacePool((table_3 = sp_1.Programs, add(name, (bind$0040_1 = FSharpMap__get_Item(sp_1.Programs, name), new SpaceMeta(bind$0040_1.Val, 0, bind$0040_1.Unlocked, bind$0040_1.Effects)), table_3)), sp_1.ProgramOrder, sp_1.Buildings, sp_1.BuildingOrder, sp_1.Planets, sp_1.PlanetOrder));
        if (name === "rorschachMission") {
            sp_1 = (new SpacePool((table_4 = sp_1.Programs, add(name, (bind$0040_2 = FSharpMap__get_Item(sp_1.Programs, name), new SpaceMeta(bind$0040_2.Val, 1, bind$0040_2.Unlocked, bind$0040_2.Effects)), table_4)), sp_1.ProgramOrder, sp_1.Buildings, sp_1.BuildingOrder, sp_1.Planets, sp_1.PlanetOrder));
        }
    }
    return [sp_1, pool_1, counter];
}

/**
 * SpaceBuildingBtnController.build: gated on unlocked (planet-reached is a
 * precondition of unlock); prices re-read per purchase.
 */
export function buyBuilding(getEffect, blackSkyActive, calendarDay, name, maxBld, sp, pool) {
    let sp_1 = sp;
    let pool_1 = pool;
    let counter = 0;
    let maxBld_1 = maxBld;
    const def = find((d) => (d.Name === name), buildingDefs);
    const prices = () => buildingPrices(getEffect, blackSkyActive, def, FSharpMap__get_Item(sp_1.Buildings, name).Val);
    while ((maxBld_1 > 0) && (hasRes(pool_1, prices(), 0))) {
        let Buildings, table, bind$0040;
        const pool1 = payPrices(calendarDay, pool_1, prices());
        pool_1 = pool1;
        sp_1 = ((Buildings = ((table = sp_1.Buildings, add(name, (bind$0040 = FSharpMap__get_Item(sp_1.Buildings, name), new SpaceMeta(FSharpMap__get_Item(sp_1.Buildings, name).Val + 1, FSharpMap__get_Item(sp_1.Buildings, name).On + 1, bind$0040.Unlocked, bind$0040.Effects)), table))), new SpacePool(sp_1.Programs, sp_1.ProgramOrder, Buildings, sp_1.BuildingOrder, sp_1.Planets, sp_1.PlanetOrder)));
        counter = ((counter + 1) | 0);
        maxBld_1 = ((maxBld_1 - 1) | 0);
    }
    return [sp_1, pool_1, counter];
}

export class SpaceCalcCtx extends Record {
    constructor(GetEffect, SolarSatellitesResearched, AmBasesResearched, AiBasesResearched, BlackSkyActive, DarkFutureYears, NumerologyActive, NumerologyCycleMult, AiCoreOn, RunUpgradeFanout) {
        super();
        this.GetEffect = GetEffect;
        this.SolarSatellitesResearched = SolarSatellitesResearched;
        this.AmBasesResearched = AmBasesResearched;
        this.AiBasesResearched = AiBasesResearched;
        this.BlackSkyActive = BlackSkyActive;
        this.DarkFutureYears = DarkFutureYears;
        this.NumerologyActive = NumerologyActive;
        this.NumerologyCycleMult = NumerologyCycleMult;
        this.AiCoreOn = (AiCoreOn | 0);
        this.RunUpgradeFanout = RunUpgradeFanout;
    }
}

export function SpaceCalcCtx_$reflection() {
    return record_type("Game.Space.SpaceCalcCtx", [], SpaceCalcCtx, () => [["GetEffect", lambda_type(string_type, float64_type)], ["SolarSatellitesResearched", bool_type], ["AmBasesResearched", bool_type], ["AiBasesResearched", bool_type], ["BlackSkyActive", bool_type], ["DarkFutureYears", float64_type], ["NumerologyActive", bool_type], ["NumerologyCycleMult", lambda_type(string_type, option_type(float64_type))], ["AiCoreOn", int32_type], ["RunUpgradeFanout", lambda_type(list_type(tuple_type(string_type, list_type(string_type))), unit_type)]]);
}

/**
 * metas with a calculateEffects body (XOR updateEffects: game.upgrade calls
 * exactly one; heatsink/sunforge bodies are empty but present).
 */
export function hasCalcEffects(name) {
    return contains(name, ofArray(["spaceElevator", "sattelite", "spaceStation", "moonOutpost", "moonBase", "planetCracker", "hydrofracturer", "spiceRefinery", "researchVessel", "orbitalArray", "sunlifter", "containmentChamber", "heatsink", "sunforge", "cryostation", "hrHarvester", "tectonic"]), {
        Equals: (x, y) => (x === y),
        GetHashCode: (x) => (stringHash(x) | 0),
    });
}

export function hasUpdateEffects(name) {
    if (name === "terraformingStation") {
        return true;
    }
    else {
        return name === "hydroponics";
    }
}

/**
 * meta.breakIronWill: spaceStation + terraformingStation
 */
export function breakIronWill(name) {
    if (name === "spaceStation") {
        return true;
    }
    else {
        return name === "terraformingStation";
    }
}

/**
 * meta.upgrades chains on space buildings (game.upgrade fan-out after build).
 */
export function buildingUpgrades(name) {
    switch (name) {
        case "sattelite":
            return ofArray([["buildings", singleton("observatory")], ["challenges", singleton("blackSky")]]);
        case "heatsink":
            return singleton(["spaceBuilding", singleton("containmentChamber")]);
        case "hydroponics":
            return singleton(["spaceBuilding", singleton("terraformingStation")]);
        case "moltenCore":
            return singleton(["spaceBuilding", singleton("tectonic")]);
        default:
            return empty_1();
    }
}

function setBld(sp, name, m) {
    return new SpacePool(sp.Programs, sp.ProgramOrder, add(name, m, sp.Buildings), sp.BuildingOrder, sp.Planets, sp.PlanetOrder);
}

function setEffects(sp, name, effects) {
    let bind$0040;
    return setBld(sp, name, (bind$0040 = FSharpMap__get_Item(sp.Buildings, name), new SpaceMeta(bind$0040.Val, bind$0040.On, bind$0040.Unlocked, effects)));
}

/**
 * calculateEffects bodies in orig order. REPLACE bodies are wholesale swaps.
 */
export function calculateEffects(ctx, name, sp) {
    let bind$0040, scale;
    switch (name) {
        case "spaceElevator":
            return setEffects(sp, name, ofList(ofArray([["oilReductionRatio", 0.05], ["spaceRatio", 0.01], ["prodTransferBonus", 0.001]]), {
                Compare: (x, y) => (comparePrimitives(x, y) | 0),
            }));
        case "sattelite": {
            const eff0 = ofList(ofArray([["observatoryRatio", 0.05 * (1 + ctx.GetEffect("satelliteSynergyBonus"))], ["starchartPerTickBaseSpace", 0.001], ["energyConsumption", 0], ["energyProduction", 0]]), {
                Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
            });
            const patternInput = ctx.SolarSatellitesResearched ? [add("energyProduction", 1, eff0), setBld(sp, name, (bind$0040 = FSharpMap__get_Item(sp.Buildings, name), new SpaceMeta(bind$0040.Val, FSharpMap__get_Item(sp.Buildings, name).Val, bind$0040.Unlocked, bind$0040.Effects)))] : [add("energyConsumption", 1, eff0), sp];
            const eff1 = patternInput[0];
            ctx.RunUpgradeFanout(ofArray([["buildings", singleton("observatory")], ["challenges", singleton("blackSky")]]));
            return setEffects(patternInput[1], name, ctx.BlackSkyActive ? add("starchartPerTickBaseSpace", FSharpMap__get_Item(eff1, "starchartPerTickBaseSpace") * (1 / (1 + ctx.GetEffect("bskSattelitePenalty"))), eff1) : eff1);
        }
        case "spaceStation":
            return setEffects(sp, name, ofList(ofArray([["scienceRatio", 0.5], ["maxKittens", 2], ["energyConsumption", 10]]), {
                Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
            }));
        case "moonOutpost":
            return setEffects(sp, name, ofList(ofArray([["uraniumPerTickCon", -0.35], ["unobtainiumPerTickSpace", 0.007 * (1 + ctx.GetEffect("lunarOutpostRatio"))], ["energyConsumption", 5]]), {
                Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
            }));
        case "moonBase": {
            const spaceportRatio = 1 + ctx.GetEffect("moonBaseStorageBonus");
            const m0 = ofList(ofArray([["catnipMax", 45000 * spaceportRatio], ["woodMax", 25000 * spaceportRatio], ["mineralsMax", 30000 * spaceportRatio], ["coalMax", 3500 * spaceportRatio], ["ironMax", 9000 * spaceportRatio], ["titaniumMax", 1250 * spaceportRatio], ["oilMax", 3500 * spaceportRatio], ["unobtainiumMax", 150 * spaceportRatio], ["energyConsumption", ctx.AmBasesResearched ? 5 : 10]]), {
                Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
            });
            return setEffects(sp, name, ctx.AiBasesResearched ? ((scale = (1 + ((ctx.AiCoreOn * 0.1) * (1 + ctx.GetEffect("aiCoreUpgradeBonus")))), map_1((k, v) => {
                if (k === "energyConsumption") {
                    return v;
                }
                else {
                    return v * scale;
                }
            }, m0))) : m0);
        }
        case "planetCracker":
            return setEffects(sp, name, ofList(ofArray([["uraniumPerTickSpace", 0.3 * (1 + ctx.GetEffect("crackerRatio"))], ["uraniumMax", 1750 * (1 + ctx.GetEffect("planetCrackerStorageBonus"))]]), {
                Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
            }));
        case "hydrofracturer":
            return setEffects(sp, name, ofList(singleton(["oilPerTickAutoprodSpace", 0.5]), {
                Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
            }));
        case "spiceRefinery":
            return setEffects(sp, name, ofList(singleton(["spicePerTickAutoprodSpace", 0.025]), {
                Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
            }));
        case "researchVessel":
            return setEffects(sp, name, ofList(ofArray([["scienceMax", 10000 * (1 + ctx.GetEffect("spaceScienceRatio"))], ["starchartPerTickBaseSpace", ctx.BlackSkyActive ? 0 : 0.01]]), {
                Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
            }));
        case "orbitalArray":
            return setEffects(sp, name, ofList(ofArray([["spaceRatio", 0.02], ["energyConsumption", 20]]), {
                Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
            }));
        case "sunlifter":
            return setEffects(sp, name, ofList(ofArray([["antimatterProduction", 1], ["energyProduction", 30]]), {
                Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
            }));
        case "containmentChamber": {
            const hs = FSharpMap__get_Item(sp.Buildings, "heatsink").Val;
            return setEffects(sp, name, ofList(ofArray([["antimatterMax", 100 * (1 + (hs * 0.02))], ["energyConsumption", 50 * (1 + (hs * 0.01))]]), {
                Compare: (x_11, y_11) => (comparePrimitives(x_11, y_11) | 0),
            }));
        }
        case "heatsink":
        case "sunforge":
            return sp;
        case "cryostation": {
            const ratio = 1 + ctx.GetEffect("cryostationStorageBonus");
            return setEffects(sp, name, ofList(ofArray([["woodMax", 200000 * ratio], ["mineralsMax", 200000 * ratio], ["coalMax", 25000 * ratio], ["ironMax", 50000 * ratio], ["titaniumMax", 7500 * ratio], ["oilMax", 7500 * ratio], ["uraniumMax", 5000 * ratio], ["unobtainiumMax", 750 * ratio]]), {
                Compare: (x_12, y_12) => (comparePrimitives(x_12, y_12) | 0),
            }));
        }
        case "hrHarvester":
            return setEffects(sp, name, add("energyProduction", (1 + (getUnlimitedDR(max(ctx.DarkFutureYears, 0), 0.075) * 0.01)) * (1 + ctx.GetEffect("umbraBoostRatio")), FSharpMap__get_Item(sp.Buildings, name).Effects));
        case "tectonic":
            return setEffects(sp, name, ofList(singleton(["energyProduction", 25 * (1 + ctx.GetEffect("tectonicBonus"))]), {
                Compare: (x_13, y_13) => (comparePrimitives(x_13, y_13) | 0),
            }));
        default:
            return sp;
    }
}

/**
 * updateEffects bodies (terraformingStation / hydroponics mutate in place).
 */
export function updateEffects(ctx, name, sp) {
    let table, table_1;
    switch (name) {
        case "terraformingStation":
            return setEffects(sp, name, (table = FSharpMap__get_Item(sp.Buildings, name).Effects, add("maxKittens", 1 + ctx.GetEffect("terraformingMaxKittensRatio"), table)));
        case "hydroponics": {
            const on = FSharpMap__get_Item(sp.Buildings, name).On;
            return setEffects(sp, name, add("catnipRatio", 0.025, (table_1 = FSharpMap__get_Item(sp.Buildings, name).Effects, add("terraformingMaxKittensRatio", getUnlimitedDR(on, 100) / on, table_1))));
        }
        default:
            return sp;
    }
}

/**
 * calendar.cycleEffectsBasics (js/calendar.js L322): numerology zodiac
 * multipliers keyed "building-effect"; sattelite keeps the observatory
 * unlock in sync via game.upgrade.
 */
export function cycleEffectsBasics(ctx, name, sp) {
    const m = FSharpMap__get_Item(sp.Buildings, name);
    const effs = ctx.NumerologyActive ? map_1((k, v) => {
        const matchValue = ctx.NumerologyCycleMult((name + "-") + k);
        if (matchValue == null) {
            return v;
        }
        else {
            return v * matchValue;
        }
    }, m.Effects) : m.Effects;
    if (name === "sattelite") {
        ctx.RunUpgradeFanout(singleton(["buildings", singleton("observatory")]));
    }
    return setBld(sp, name, new SpaceMeta(m.Val, m.On, m.Unlocked, effs));
}

/**
 * space.update (L1097-1145): routes tick down on unlocked planets; reaching a
 * planet unlocks its requiredTech-less buildings; programs turn on when their
 * planet is reached (no planet → immediate on). The entangler gflops action
 * (L1150-1170) early-returns at gflops = 0 — no state at this slice.
 */
export function update(getEffect, onPlanetReach, ticksPerDay, sp) {
    let sp_1 = sp;
    let routeSpeed;
    const rs = getEffect("routeSpeed");
    routeSpeed = ((rs !== 0) ? rs : 1);
    const enumerator = getEnumerator(sp_1.PlanetOrder);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            let Planets, Planets_1;
            const pn = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const pl = FSharpMap__get_Item(sp_1.Planets, pn);
            if (!pl.Reached && pl.Unlocked) {
                if (pl.RouteDays > 0) {
                    sp_1 = ((Planets = add(pn, new PlanetState(pl.Reached, pl.Unlocked, pl.RouteDays - (routeSpeed / ticksPerDay)), sp_1.Planets), new SpacePool(sp_1.Programs, sp_1.ProgramOrder, sp_1.Buildings, sp_1.BuildingOrder, Planets, sp_1.PlanetOrder)));
                }
                else {
                    sp_1 = ((Planets_1 = add(pn, new PlanetState(true, pl.Unlocked, 0), sp_1.Planets), new SpacePool(sp_1.Programs, sp_1.ProgramOrder, sp_1.Buildings, sp_1.BuildingOrder, Planets_1, sp_1.PlanetOrder)));
                    onPlanetReach(pn);
                }
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    const enumerator_1 = getEnumerator(programDefs);
    try {
        while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
            let matchValue;
            const p0 = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const m = FSharpMap__get_Item(sp_1.Programs, p0.Name);
            if ((m.Val > 0) && (m.On === 0)) {
                if ((matchValue = p0.UnlocksPlanets, isEmpty(matchValue) ? true : FSharpMap__get_Item(sp_1.Planets, head(matchValue)).Reached)) {
                    sp_1 = (new SpacePool(add(p0.Name, new SpaceMeta(m.Val, 1, m.Unlocked, m.Effects), sp_1.Programs), sp_1.ProgramOrder, sp_1.Buildings, sp_1.BuildingOrder, sp_1.Planets, sp_1.PlanetOrder));
                }
            }
        }
    }
    finally {
        disposeSafe(enumerator_1);
    }
    return sp_1;
}

/**
 * caller-driven building unlock (needs science access; kept out of update).
 */
export function unlockBuildings(techResearched, sp) {
    return new SpacePool(sp.Programs, sp.ProgramOrder, map_1((name, m) => {
        if (!m.Unlocked && FSharpMap__get_Item(sp.Planets, find((d) => (d.Name === name), buildingDefs).Planet).Reached) {
            return new SpaceMeta(m.Val, m.On, forAll(techResearched, find((d_1) => (d_1.Name === name), buildingDefs).RequiredTech), m.Effects);
        }
        else {
            return m;
        }
    }, sp.Buildings), sp.BuildingOrder, sp.Planets, sp.PlanetOrder);
}

/**
 * space.fastforward (L1147-1175): routes; the entangler loop is a no-op
 * without gflops.
 */
export function fastforward(getEffect, ticksPerDay, daysOffset, sp) {
    let routeSpeed;
    const rs = getEffect("routeSpeed");
    routeSpeed = ((rs !== 0) ? rs : 1);
    const times = daysOffset * ticksPerDay;
    return new SpacePool(sp.Programs, sp.ProgramOrder, sp.Buildings, sp.BuildingOrder, map_1((_arg, pl) => {
        if ((!pl.Reached && pl.Unlocked) && (pl.RouteDays > 0)) {
            return new PlanetState(pl.Reached, pl.Unlocked, pl.RouteDays - ((times * routeSpeed) / ticksPerDay));
        }
        else {
            return pl;
        }
    }, sp.Planets), sp.PlanetOrder);
}

/**
 * effects provider (js/space.js L975-991): reached-planet buildings, effect ×
 * on; the 4 hash effects raw (per-category values, not per-building);
 * spaceRatio × getEnergyDelta when cons > prod.
 */
export function spaceGroup(energyCons, energyProd, energyDelta, sp) {
    return new ManagerGroup(empty({
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), choose((d) => {
        const m = FSharpMap__get_Item(sp.Buildings, d.Name);
        if ((m.On > 0) && FSharpMap__get_Item(sp.Planets, d.Planet).Reached) {
            return [m.Effects, (effectName) => ((v) => (((((effectName === "hashrate") ? true : (effectName === "hashRateLevel")) ? true : (effectName === "nextHashLevelAt")) ? true : (effectName === "hrProgress")) ? v : (((effectName === "spaceRatio") && (energyCons > energyProd)) ? ((v * m.On) * energyDelta) : (v * m.On))))];
        }
        else {
            return undefined;
        }
    }, buildingDefs));
}

/**
 * space.undo refund path (js/space.js undo L1267-1281): sell ONE unit via
 * PlanetBuildingBtnController.sellInternal — refund = current ladder prices
 * × refundPercentage (build undo 1.0, sell undo 0 = re-add). Requires the
 * planet to have been reached and val > 0.
 */
export function sellOne(calendarDay, name, pool, refundPercentage, sp) {
    const def = find((d) => (d.Name === name), buildingDefs);
    const m = FSharpMap__get_Item(sp.Buildings, name);
    if ((m.Val === 0) ? true : !FSharpMap__get_Item(sp.Planets, def.Planet).Reached) {
        return [sp, pool, false];
    }
    else {
        const refundPrices = map((tupledArg) => [tupledArg[0], tupledArg[1] * refundPercentage], map((p) => {
            let arg1__1;
            return [p.Resource, p.Val * ((arg1__1 = (m.Val - 1), Math.pow(1.1, arg1__1)))];
        }, def.Prices));
        const sp$0027 = new SpacePool(sp.Programs, sp.ProgramOrder, add(name, new SpaceMeta(m.Val - 1, m.On - 1, m.Unlocked, m.Effects), sp.Buildings), sp.BuildingOrder, sp.Planets, sp.PlanetOrder);
        let pool$0027 = pool;
        const enumerator = getEnumerator(refundPrices);
        try {
            while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                const v_1 = forLoopVar[1];
                if (v_1 > 0) {
                    const patternInput = addResEvent(calendarDay, forLoopVar[0], v_1, pool$0027);
                    pool$0027 = patternInput[0];
                }
            }
        }
        finally {
            disposeSafe(enumerator);
        }
        return [sp$0027, pool$0027, true];
    }
}

