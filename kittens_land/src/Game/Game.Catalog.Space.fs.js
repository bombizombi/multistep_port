
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { class_type, float64_type, record_type, list_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { Price, Price_$reflection } from "./Game.Types.fs.js";
import { empty, singleton, ofArray } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { empty as empty_1, ofList } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";

export class SpaceProgramDef extends Record {
    constructor(Name, Prices, UnlocksPlanets, UnlocksMissions, UnlocksPolicies) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.UnlocksPlanets = UnlocksPlanets;
        this.UnlocksMissions = UnlocksMissions;
        this.UnlocksPolicies = UnlocksPolicies;
    }
}

export function SpaceProgramDef_$reflection() {
    return record_type("Game.Catalog.Space.SpaceProgramDef", [], SpaceProgramDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["UnlocksPlanets", list_type(string_type)], ["UnlocksMissions", list_type(string_type)], ["UnlocksPolicies", list_type(string_type)]]);
}

export class SpaceBuildingDef extends Record {
    constructor(Name, Planet, Prices, RequiredTech, Effects, UnlocksPolicies) {
        super();
        this.Name = Name;
        this.Planet = Planet;
        this.Prices = Prices;
        this.RequiredTech = RequiredTech;
        this.Effects = Effects;
        this.UnlocksPolicies = UnlocksPolicies;
    }
}

export function SpaceBuildingDef_$reflection() {
    return record_type("Game.Catalog.Space.SpaceBuildingDef", [], SpaceBuildingDef, () => [["Name", string_type], ["Planet", string_type], ["Prices", list_type(Price_$reflection())], ["RequiredTech", list_type(string_type)], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])], ["UnlocksPolicies", list_type(string_type)]]);
}

export class PlanetDef extends Record {
    constructor(Name, RouteDays) {
        super();
        this.Name = Name;
        this.RouteDays = RouteDays;
    }
}

export function PlanetDef_$reflection() {
    return record_type("Game.Catalog.Space.PlanetDef", [], PlanetDef, () => [["Name", string_type], ["RouteDays", float64_type]]);
}

export const programDefs = ofArray([new SpaceProgramDef("orbitalLaunch", ofArray([new Price("oil", 15000), new Price("manpower", 5000), new Price("science", 100000), new Price("starchart", 250)]), singleton("cath"), singleton("moonMission"), empty()), new SpaceProgramDef("moonMission", ofArray([new Price("titanium", 5000), new Price("oil", 45000), new Price("science", 125000), new Price("starchart", 500)]), singleton("moon"), ofArray(["duneMission", "piscineMission"]), empty()), new SpaceProgramDef("duneMission", ofArray([new Price("titanium", 7000), new Price("science", 175000), new Price("starchart", 1000), new Price("kerosene", 75)]), singleton("dune"), singleton("heliosMission"), ofArray(["technocracy", "theocracy", "expansionism"])), new SpaceProgramDef("piscineMission", ofArray([new Price("titanium", 9000), new Price("science", 200000), new Price("starchart", 1500), new Price("kerosene", 250)]), singleton("piscine"), singleton("terminusMission"), empty()), new SpaceProgramDef("heliosMission", ofArray([new Price("titanium", 15000), new Price("science", 250000), new Price("starchart", 3000), new Price("kerosene", 1250)]), singleton("helios"), singleton("yarnMission"), empty()), new SpaceProgramDef("terminusMission", ofArray([new Price("titanium", 12000), new Price("science", 225000), new Price("starchart", 2500), new Price("kerosene", 750)]), singleton("terminus"), ofArray(["heliosMission", "kairoMission"]), empty()), new SpaceProgramDef("kairoMission", ofArray([new Price("titanium", 20000), new Price("science", 300000), new Price("starchart", 5000), new Price("kerosene", 7500)]), singleton("kairo"), singleton("rorschachMission"), empty()), new SpaceProgramDef("rorschachMission", ofArray([new Price("titanium", 80000), new Price("science", 500000), new Price("starchart", 15000), new Price("kerosene", 25000)]), empty(), singleton("centaurusSystemMission"), empty()), new SpaceProgramDef("yarnMission", ofArray([new Price("titanium", 35000), new Price("science", 350000), new Price("starchart", 7500), new Price("kerosene", 12000)]), singleton("yarn"), singleton("umbraMission"), empty()), new SpaceProgramDef("umbraMission", ofArray([new Price("science", 500000), new Price("starchart", 25000), new Price("kerosene", 25000), new Price("thorium", 15000)]), singleton("umbra"), singleton("charonMission"), empty()), new SpaceProgramDef("charonMission", ofArray([new Price("science", 750000), new Price("starchart", 75000), new Price("kerosene", 35000), new Price("thorium", 35000)]), singleton("charon"), empty(), empty()), new SpaceProgramDef("centaurusSystemMission", ofArray([new Price("titanium", 40000), new Price("science", 800000), new Price("starchart", 100000), new Price("kerosene", 50000), new Price("thorium", 50000)]), singleton("centaurusSystem"), singleton("furthestRingMission"), empty()), new SpaceProgramDef("furthestRingMission", ofArray([new Price("science", 1250000), new Price("starchart", 500000), new Price("kerosene", 75000), new Price("thorium", 75000)]), singleton("furthestRing"), empty(), empty())]);

export const buildingDefs = ofArray([new SpaceBuildingDef("spaceElevator", "cath", ofArray([new Price("titanium", 6000), new Price("unobtainium", 50), new Price("science", 75000)]), ofArray(["orbitalEngineering", "nanotechnology"]), ofList(ofArray([["oilReductionRatio", 0], ["spaceRatio", 0], ["prodTransferBonus", 0]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
}), empty()), new SpaceBuildingDef("sattelite", "cath", ofArray([new Price("titanium", 2500), new Price("oil", 15000), new Price("science", 100000), new Price("starchart", 325)]), singleton("sattelites"), ofList(ofArray([["observatoryRatio", 0], ["starchartPerTickBaseSpace", 0], ["energyConsumption", 0], ["energyProduction", 0]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
}), ofArray(["outerSpaceTreaty", "militarizeSpace"])), new SpaceBuildingDef("spaceStation", "cath", ofArray([new Price("oil", 35000), new Price("science", 150000), new Price("starchart", 425), new Price("alloy", 750)]), singleton("orbitalEngineering"), ofList(ofArray([["scienceRatio", 0], ["maxKittens", 0], ["energyConsumption", 0]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
}), empty()), new SpaceBuildingDef("moonOutpost", "moon", ofArray([new Price("oil", 55000), new Price("uranium", 500), new Price("science", 100000), new Price("starchart", 650), new Price("concrate", 150), new Price("alloy", 750)]), empty(), ofList(ofArray([["uraniumPerTickCon", 0], ["unobtainiumPerTickSpace", 0], ["energyConsumption", 0]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
}), empty()), new SpaceBuildingDef("moonBase", "moon", ofArray([new Price("titanium", 9500), new Price("oil", 70000), new Price("unobtainium", 50), new Price("science", 100000), new Price("starchart", 700), new Price("concrate", 250)]), empty(), ofList(ofArray([["catnipMax", 0], ["woodMax", 0], ["mineralsMax", 0], ["coalMax", 0], ["ironMax", 0], ["titaniumMax", 0], ["oilMax", 0], ["unobtainiumMax", 0], ["energyConsumption", 0]]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
}), empty()), new SpaceBuildingDef("planetCracker", "dune", ofArray([new Price("science", 125000), new Price("starchart", 2500), new Price("alloy", 1750), new Price("kerosene", 50)]), empty(), ofList(ofArray([["uraniumPerTickSpace", 0], ["uraniumMax", 0]]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
}), empty()), new SpaceBuildingDef("hydrofracturer", "dune", ofArray([new Price("science", 150000), new Price("starchart", 750), new Price("alloy", 1025), new Price("kerosene", 100)]), empty(), ofList(singleton(["oilPerTickAutoprodSpace", 0]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
}), empty()), new SpaceBuildingDef("spiceRefinery", "dune", ofArray([new Price("science", 75000), new Price("starchart", 500), new Price("alloy", 500), new Price("kerosene", 125)]), empty(), ofList(singleton(["spicePerTickAutoprodSpace", 0]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
}), empty()), new SpaceBuildingDef("researchVessel", "piscine", ofArray([new Price("titanium", 12500), new Price("starchart", 100), new Price("alloy", 2500), new Price("kerosene", 250)]), empty(), ofList(ofArray([["scienceMax", 0], ["starchartPerTickBaseSpace", 0]]), {
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
}), empty()), new SpaceBuildingDef("orbitalArray", "piscine", ofArray([new Price("science", 250000), new Price("starchart", 2000), new Price("eludium", 100), new Price("kerosene", 500)]), empty(), ofList(ofArray([["spaceRatio", 0], ["energyConsumption", 0]]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
}), empty()), new SpaceBuildingDef("sunlifter", "helios", ofArray([new Price("science", 500000), new Price("eludium", 225), new Price("kerosene", 2500)]), empty(), ofList(ofArray([["antimatterProduction", 0], ["energyProduction", 0]]), {
    Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
}), empty()), new SpaceBuildingDef("containmentChamber", "helios", ofArray([new Price("science", 500000), new Price("kerosene", 2500)]), empty(), ofList(ofArray([["antimatterMax", 0], ["energyConsumption", 0]]), {
    Compare: (x_11, y_11) => (comparePrimitives(x_11, y_11) | 0),
}), empty()), new SpaceBuildingDef("heatsink", "helios", ofArray([new Price("science", 125000), new Price("relic", 1), new Price("kerosene", 5000), new Price("thorium", 12500)]), empty(), empty_1({
    Compare: (x_12, y_12) => (comparePrimitives(x_12, y_12) | 0),
}), empty()), new SpaceBuildingDef("sunforge", "helios", ofArray([new Price("antimatter", 250), new Price("science", 100000), new Price("relic", 1), new Price("kerosene", 1250)]), empty(), ofList(singleton(["baseMetalMaxRatio", 0.01]), {
    Compare: (x_13, y_13) => (comparePrimitives(x_13, y_13) | 0),
}), empty()), new SpaceBuildingDef("cryostation", "terminus", ofArray([new Price("science", 200000), new Price("concrate", 1500), new Price("eludium", 25), new Price("kerosene", 500)]), empty(), ofList(ofArray([["woodMax", 0], ["mineralsMax", 0], ["coalMax", 0], ["ironMax", 0], ["titaniumMax", 0], ["oilMax", 0], ["uraniumMax", 0], ["unobtainiumMax", 0]]), {
    Compare: (x_14, y_14) => (comparePrimitives(x_14, y_14) | 0),
}), empty()), new SpaceBuildingDef("spaceBeacon", "kairo", ofArray([new Price("antimatter", 50), new Price("starchart", 25000), new Price("alloy", 25000), new Price("kerosene", 7500)]), empty(), ofList(ofArray([["scienceMax", 25000], ["starchartPerTickBaseSpace", 0.025], ["relicPerDay", 0]]), {
    Compare: (x_15, y_15) => (comparePrimitives(x_15, y_15) | 0),
}), empty()), new SpaceBuildingDef("terraformingStation", "yarn", ofArray([new Price("uranium", 5000), new Price("antimatter", 25), new Price("kerosene", 5000)]), singleton("terraformation"), ofList(singleton(["maxKittens", 1]), {
    Compare: (x_16, y_16) => (comparePrimitives(x_16, y_16) | 0),
}), empty()), new SpaceBuildingDef("hydroponics", "yarn", ofArray([new Price("unobtainium", 1), new Price("kerosene", 500)]), singleton("hydroponics"), ofList(ofArray([["catnipRatio", 0.025], ["catnipMaxRatio", 0.1], ["terraformingMaxKittensRatio", 0]]), {
    Compare: (x_17, y_17) => (comparePrimitives(x_17, y_17) | 0),
}), empty()), new SpaceBuildingDef("hrHarvester", "umbra", ofArray([new Price("antimatter", 1250), new Price("relic", 25)]), empty(), ofList(singleton(["energyProduction", 1]), {
    Compare: (x_18, y_18) => (comparePrimitives(x_18, y_18) | 0),
}), empty()), new SpaceBuildingDef("navigationRelay", "umbra", ofArray([new Price("titanium", 50000), new Price("concrate", 5000)]), empty(), empty_1({
    Compare: (x_19, y_19) => (comparePrimitives(x_19, y_19) | 0),
}), empty()), new SpaceBuildingDef("spaceShuttle", "umbra", ofArray([new Price("antimatter", 50), new Price("eludium", 500)]), empty(), empty_1({
    Compare: (x_20, y_20) => (comparePrimitives(x_20, y_20) | 0),
}), empty()), new SpaceBuildingDef("entangler", "charon", ofArray([new Price("antimatter", 5250), new Price("relic", 1250), new Price("eludium", 5000)]), singleton("quantumCryptography"), ofList(ofArray([["gflopsConsumption", 0.1], ["hashrate", 0], ["hashRateLevel", 0], ["nextHashLevelAt", 0], ["hrProgress", 0], ["energyConsumption", 25]]), {
    Compare: (x_21, y_21) => (comparePrimitives(x_21, y_21) | 0),
}), empty()), new SpaceBuildingDef("tectonic", "centaurusSystem", ofArray([new Price("antimatter", 500), new Price("thorium", 75000)]), singleton("terraformation"), ofList(singleton(["energyProduction", 0]), {
    Compare: (x_22, y_22) => (comparePrimitives(x_22, y_22) | 0),
}), empty()), new SpaceBuildingDef("moltenCore", "centaurusSystem", ofArray([new Price("uranium", 5000000), new Price("science", 25000000)]), singleton("exogeophysics"), ofList(singleton(["tectonicBonus", 0.05]), {
    Compare: (x_23, y_23) => (comparePrimitives(x_23, y_23) | 0),
}), empty())]);

export const planetDefs = ofArray([new PlanetDef("cath", 0), new PlanetDef("moon", 30), new PlanetDef("dune", 356), new PlanetDef("piscine", 256), new PlanetDef("helios", 1200), new PlanetDef("terminus", 2500), new PlanetDef("kairo", 5000), new PlanetDef("yarn", 3800), new PlanetDef("umbra", 7500), new PlanetDef("charon", 25000), new PlanetDef("centaurusSystem", 120000), new PlanetDef("furthestRing", 725000000)]);

