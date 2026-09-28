
import { Record } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Types.js";
import { record_type, class_type, float64_type, int32_type, list_type, bool_type, string_type } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Reflection.js";
import { Price, Price_$reflection } from "./Game.Types.fs.js";
import { ofArray, empty as empty_1, singleton } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/List.js";
import { ofList, empty } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Map.js";
import { comparePrimitives } from "../../.elmish-land/App/fable_modules/fable-library-js.5.17.0/Util.js";

export class RaceDef extends Record {
    constructor(Name, StartsUnlocked, EmbassyPrices, EmbassyLevel, RaceEffects) {
        super();
        this.Name = Name;
        this.StartsUnlocked = StartsUnlocked;
        this.EmbassyPrices = EmbassyPrices;
        this.EmbassyLevel = (EmbassyLevel | 0);
        this.RaceEffects = RaceEffects;
    }
}

export function RaceDef_$reflection() {
    return record_type("Game.Catalog.World.RaceDef", [], RaceDef, () => [["Name", string_type], ["StartsUnlocked", bool_type], ["EmbassyPrices", list_type(Price_$reflection())], ["EmbassyLevel", int32_type], ["RaceEffects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class ZUDef extends Record {
    constructor(Name, Prices, Effects) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
    }
}

export function ZUDef_$reflection() {
    return record_type("Game.Catalog.World.ZUDef", [], ZUDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class RUDef extends Record {
    constructor(Name, Prices, Effects) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
    }
}

export function RUDef_$reflection() {
    return record_type("Game.Catalog.World.RUDef", [], RUDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class TUDef extends Record {
    constructor(Name, Prices, Effects) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
    }
}

export function TUDef_$reflection() {
    return record_type("Game.Catalog.World.TUDef", [], TUDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class PactDef extends Record {
    constructor(Name, Prices, Effects) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
    }
}

export function PactDef_$reflection() {
    return record_type("Game.Catalog.World.PactDef", [], PactDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class ProgramDef extends Record {
    constructor(Name, Prices) {
        super();
        this.Name = Name;
        this.Prices = Prices;
    }
}

export function ProgramDef_$reflection() {
    return record_type("Game.Catalog.World.ProgramDef", [], ProgramDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())]]);
}

export class PlanetDef extends Record {
    constructor(Name, Buildings) {
        super();
        this.Name = Name;
        this.Buildings = Buildings;
    }
}

export function PlanetDef_$reflection() {
    return record_type("Game.Catalog.World.PlanetDef", [], PlanetDef, () => [["Name", string_type], ["Buildings", list_type(string_type)]]);
}

export class SpaceBuildingDef extends Record {
    constructor(Name, Planet, Prices, Effects) {
        super();
        this.Name = Name;
        this.Planet = Planet;
        this.Prices = Prices;
        this.Effects = Effects;
    }
}

export function SpaceBuildingDef_$reflection() {
    return record_type("Game.Catalog.World.SpaceBuildingDef", [], SpaceBuildingDef, () => [["Name", string_type], ["Planet", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class PerkDef extends Record {
    constructor(Name, Prices, Effects) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
    }
}

export function PerkDef_$reflection() {
    return record_type("Game.Catalog.World.PerkDef", [], PerkDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class AchievementDef extends Record {
    constructor(Name, Starred) {
        super();
        this.Name = Name;
        this.Starred = Starred;
    }
}

export function AchievementDef_$reflection() {
    return record_type("Game.Catalog.World.AchievementDef", [], AchievementDef, () => [["Name", string_type], ["Starred", bool_type]]);
}

export class StatDef extends Record {
    constructor(Name, InitialVal) {
        super();
        this.Name = Name;
        this.InitialVal = InitialVal;
    }
}

export function StatDef_$reflection() {
    return record_type("Game.Catalog.World.StatDef", [], StatDef, () => [["Name", string_type], ["InitialVal", float64_type]]);
}

export class CFUDef extends Record {
    constructor(Name, Prices, Effects) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
    }
}

export function CFUDef_$reflection() {
    return record_type("Game.Catalog.World.CFUDef", [], CFUDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class VSUDef extends Record {
    constructor(Name, Prices, Effects) {
        super();
        this.Name = Name;
        this.Prices = Prices;
        this.Effects = Effects;
    }
}

export function VSUDef_$reflection() {
    return record_type("Game.Catalog.World.VSUDef", [], VSUDef, () => [["Name", string_type], ["Prices", list_type(Price_$reflection())], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export class CycleDef extends Record {
    constructor(Name, Effects) {
        super();
        this.Name = Name;
        this.Effects = Effects;
    }
}

export function CycleDef_$reflection() {
    return record_type("Game.Catalog.World.CycleDef", [], CycleDef, () => [["Name", string_type], ["Effects", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, float64_type])]]);
}

export const raceDefs = ofArray([new RaceDef("lizards", false, singleton(new Price("culture", 100)), 0, empty({
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
})), new RaceDef("sharks", false, singleton(new Price("culture", 100)), 0, empty({
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new RaceDef("griffins", false, singleton(new Price("culture", 1000)), 0, empty({
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new RaceDef("nagas", false, singleton(new Price("culture", 500)), 0, empty({
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
})), new RaceDef("zebras", false, singleton(new Price("culture", 25000)), 0, empty({
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
})), new RaceDef("spiders", false, singleton(new Price("culture", 5000)), 0, empty({
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
})), new RaceDef("dragons", false, singleton(new Price("culture", 7500)), 0, empty({
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
})), new RaceDef("leviathans", false, empty_1(), 0, empty({
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
}))]);

export const zuDefs = ofArray([new ZUDef("unicornTomb", ofArray([new Price("ivory", 500), new Price("tears", 5)]), ofList(ofArray([["unicornsRatioReligion", 0.05], ["faithMax", 0], ["tearsMax", 0]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
})), new ZUDef("ivoryTower", ofArray([new Price("ivory", 25000), new Price("tears", 25)]), ofList(ofArray([["unicornsRatioReligion", 0.1], ["riftChance", 0.0005], ["tearsMax", 0]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new ZUDef("ivoryCitadel", ofArray([new Price("ivory", 50000), new Price("tears", 50)]), ofList(ofArray([["unicornsRatioReligion", 0.25], ["ivoryMeteorChance", 0.0005], ["unicornsMax", 0], ["tearsMax", 0]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new ZUDef("skyPalace", ofArray([new Price("ivory", 125000), new Price("tears", 500), new Price("megalith", 5)]), ofList(ofArray([["goldMaxRatio", 0], ["unicornsRatioReligion", 0], ["alicornChance", 0], ["alicornPerTick", 0], ["ivoryMeteorRatio", 0], ["unicornsMax", 0], ["tearsMax", 0], ["alicornMax", 0]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
})), new ZUDef("unicornUtopia", ofArray([new Price("gold", 500), new Price("ivory", 1000000), new Price("tears", 5000)]), ofList(ofArray([["unicornsRatioReligion", 0], ["alicornChance", 0], ["alicornPerTick", 0], ["tcRefineRatio", 0], ["ivoryMeteorRatio", 0], ["unicornsMax", 0], ["tearsMax", 0], ["alicornMax", 0]]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
})), new ZUDef("sunspire", ofArray([new Price("gold", 1250), new Price("ivory", 750000), new Price("tears", 25000)]), ofList(ofArray([["unicornsRatioReligion", 0], ["alicornChance", 0], ["alicornPerTick", 0], ["tcRefineRatio", 0], ["ivoryMeteorRatio", 0], ["unicornsMaxRatio", 0], ["tearsMax", 0], ["alicornMax", 0]]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
})), new ZUDef("marker", ofArray([new Price("unobtainium", 2500), new Price("spice", 50000), new Price("tears", 5000), new Price("megalith", 750)]), ofList(singleton(["corruptionRatio", 1E-06]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
})), new ZUDef("unicornGraveyard", ofArray([new Price("necrocorn", 5), new Price("megalith", 1000)]), ofList(ofArray([["cultureMaxRatioBonus", 0.01], ["blackLibraryBonus", 0.02]]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
})), new ZUDef("unicornNecropolis", ofArray([new Price("alicorn", 100), new Price("necrocorn", 15), new Price("void", 5), new Price("megalith", 2500)]), ofList(singleton(["corruptionBoostRatio", 0.1]), {
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
})), new ZUDef("blackPyramid", ofArray([new Price("unobtainium", 5000), new Price("spice", 150000), new Price("sorrow", 5), new Price("megalith", 2500)]), ofList(ofArray([["pyramidGlobalResourceRatio", 0], ["pyramidGlobalProductionRatio", 0], ["pyramidFaithRatio", 0], ["deficitRecoveryRatio", 0], ["blackLibraryBonus", 0], ["pyramidSpaceCompendiumRatio", 0], ["craftRatio", 0], ["UniversalKnowHow", 0], ["pyramidPerYearRatio", 0], ["timeRatio", 0]]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
}))]);

export const ruDefs = ofArray([new RUDef("solarchant", singleton(new Price("faith", 100)), ofList(singleton(["faithRatioReligion", 0.1]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
})), new RUDef("scholasticism", singleton(new Price("faith", 250)), empty({
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new RUDef("goldenSpire", ofArray([new Price("gold", 150), new Price("faith", 350)]), empty({
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new RUDef("sunAltar", ofArray([new Price("gold", 250), new Price("faith", 500)]), empty({
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
})), new RUDef("stainedGlass", ofArray([new Price("gold", 250), new Price("faith", 500)]), empty({
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
})), new RUDef("solarRevolution", ofArray([new Price("gold", 500), new Price("faith", 750)]), ofList(singleton(["solarRevolutionRatio", 0]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
})), new RUDef("basilica", ofArray([new Price("gold", 750), new Price("faith", 1250)]), empty({
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
})), new RUDef("templars", ofArray([new Price("gold", 3000), new Price("faith", 3500)]), empty({
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
})), new RUDef("apocripha", ofArray([new Price("gold", 5000), new Price("faith", 5000)]), empty({
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
})), new RUDef("transcendence", ofArray([new Price("gold", 7500), new Price("faith", 7500)]), empty({
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
})), new RUDef("frescoes", ofArray([new Price("gold", 5000), new Price("faith", 4000), new Price("spice", 8000)]), empty({
    Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
}))]);

export const tuDefs = ofArray([new TUDef("blackObelisk", singleton(new Price("relic", 100)), ofList(singleton(["solarRevolutionLimit", 0.05]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
})), new TUDef("blackNexus", singleton(new Price("relic", 5000)), ofList(singleton(["relicRefineRatio", 1]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new TUDef("blackCore", singleton(new Price("relic", 10000)), ofList(singleton(["blsLimit", 1]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new TUDef("singularity", singleton(new Price("relic", 25000)), ofList(singleton(["globalResourceRatio", 0.1]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
})), new TUDef("blackLibrary", singleton(new Price("relic", 30000)), ofList(singleton(["compendiaTTBoostRatio", 0.02]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
})), new TUDef("blackRadiance", singleton(new Price("relic", 37500)), ofList(singleton(["blsCorruptionRatio", 0.0012]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
})), new TUDef("blazar", singleton(new Price("relic", 50000)), ofList(ofArray([["timeRatio", 0.1], ["rrRatio", 0.02]]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
})), new TUDef("darkNova", ofArray([new Price("relic", 75000), new Price("void", 7500)]), ofList(singleton(["energyProductionRatio", 0.02]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
})), new TUDef("mausoleum", ofArray([new Price("relic", 50000), new Price("void", 12500), new Price("necrocorn", 10)]), ofList(singleton(["pactsAvailable", 1]), {
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
})), new TUDef("holyGenocide", ofArray([new Price("relic", 100000), new Price("void", 25000)]), ofList(ofArray([["maxKittensRatio", -0.01], ["simScalingRatio", 0.02], ["activeHG", 0]]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
})), new TUDef("darkParacosm", ofArray([new Price("relic", 230000), new Price("void", 29000), new Price("paragon", 8)]), ofList(singleton(["milleninumParagon", 1]), {
    Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
}))]);

export const pactDefs = ofArray([new PactDef("pactOfCleansing", singleton(new Price("relic", 100)), ofList(ofArray([["pactsAvailable", -1], ["necrocornPerDay", 0], ["pactDeficitRecoveryRatio", 0.003], ["pactGlobalResourceRatio", 0.0005]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
})), new PactDef("pactOfDestruction", singleton(new Price("relic", 100)), ofList(ofArray([["pactsAvailable", -1], ["necrocornPerDay", 0], ["pactDeficitRecoveryRatio", -0.0001], ["pactGlobalProductionRatio", 0.0005]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new PactDef("pactOfExtermination", singleton(new Price("relic", 100)), ofList(ofArray([["pactsAvailable", -1], ["necrocornPerDay", 0], ["pactFaithRatio", 0.001]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new PactDef("pactOfPurity", singleton(new Price("relic", 100)), ofList(ofArray([["pactsAvailable", -1], ["necrocornPerDay", 0], ["pactDeficitRecoveryRatio", 0.005], ["pactBlackLibraryBoost", 0.0005], ["pactSpaceCompendiumRatio", 0.001]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
})), new PactDef("pactOfArcane", singleton(new Price("relic", 100)), ofList(ofArray([["pactsAvailable", -1], ["necrocornPerDay", 0], ["pactcraftRatio", 0.001], ["pactUniversalKnowHow", 0.1]]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
})), new PactDef("pactOfChronicler", singleton(new Price("relic", 100)), ofList(ofArray([["pactsAvailable", -1], ["necrocornPerDay", 0], ["pactPerYearRatio", 0.003], ["umbraBoostRatio", 0.1], ["pacttimeRatio", 0.1]]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
})), new PactDef("payDebt", singleton(new Price("necrocorn", 0)), ofList(singleton(["pactsAvailable", 0]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
})), new PactDef("fractured", singleton(new Price("catnip", 1)), ofList(ofArray([["pyramidGlobalResourceRatio", -0.5], ["pyramidGlobalProductionRatio", -0.5], ["pyramidFaithRatio", -0.5], ["pactsAvailable", 0]]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
}))]);

export const programDefs = ofArray([new ProgramDef("orbitalLaunch", ofArray([new Price("oil", 15000), new Price("manpower", 5000), new Price("science", 100000), new Price("starchart", 250)])), new ProgramDef("moonMission", ofArray([new Price("titanium", 5000), new Price("oil", 45000), new Price("science", 125000), new Price("starchart", 500)])), new ProgramDef("duneMission", ofArray([new Price("titanium", 7000), new Price("science", 175000), new Price("starchart", 1000), new Price("kerosene", 75)])), new ProgramDef("piscineMission", ofArray([new Price("titanium", 9000), new Price("science", 200000), new Price("starchart", 1500), new Price("kerosene", 250)])), new ProgramDef("heliosMission", ofArray([new Price("titanium", 15000), new Price("science", 250000), new Price("starchart", 3000), new Price("kerosene", 1250)])), new ProgramDef("terminusMission", ofArray([new Price("titanium", 12000), new Price("science", 225000), new Price("starchart", 2500), new Price("kerosene", 750)])), new ProgramDef("kairoMission", ofArray([new Price("titanium", 20000), new Price("science", 300000), new Price("starchart", 5000), new Price("kerosene", 7500)])), new ProgramDef("rorschachMission", ofArray([new Price("titanium", 80000), new Price("science", 500000), new Price("starchart", 15000), new Price("kerosene", 25000)])), new ProgramDef("yarnMission", ofArray([new Price("titanium", 35000), new Price("science", 350000), new Price("starchart", 7500), new Price("kerosene", 12000)])), new ProgramDef("umbraMission", ofArray([new Price("science", 500000), new Price("starchart", 25000), new Price("kerosene", 25000), new Price("thorium", 15000)])), new ProgramDef("charonMission", ofArray([new Price("science", 750000), new Price("starchart", 75000), new Price("kerosene", 35000), new Price("thorium", 35000)])), new ProgramDef("centaurusSystemMission", ofArray([new Price("titanium", 40000), new Price("science", 800000), new Price("starchart", 100000), new Price("kerosene", 50000), new Price("thorium", 50000)])), new ProgramDef("furthestRingMission", ofArray([new Price("science", 1250000), new Price("starchart", 500000), new Price("kerosene", 75000), new Price("thorium", 75000)]))]);

export const planetDefs = ofArray([new PlanetDef("cath", ofArray(["spaceElevator", "sattelite", "spaceStation"])), new PlanetDef("moon", ofArray(["moonOutpost", "moonBase"])), new PlanetDef("dune", ofArray(["planetCracker", "hydrofracturer", "spiceRefinery"])), new PlanetDef("piscine", ofArray(["researchVessel", "orbitalArray"])), new PlanetDef("helios", ofArray(["sunlifter", "containmentChamber", "heatsink", "sunforge"])), new PlanetDef("terminus", singleton("cryostation")), new PlanetDef("kairo", singleton("spaceBeacon")), new PlanetDef("yarn", ofArray(["terraformingStation", "hydroponics"])), new PlanetDef("umbra", ofArray(["hrHarvester", "navigationRelay", "spaceShuttle"])), new PlanetDef("charon", singleton("entangler")), new PlanetDef("centaurusSystem", ofArray(["tectonic", "moltenCore"])), new PlanetDef("furthestRing", empty_1())]);

export const spaceBuildingDefs = ofArray([new SpaceBuildingDef("spaceElevator", "cath", ofArray([new Price("titanium", 6000), new Price("unobtainium", 50), new Price("science", 75000)]), ofList(ofArray([["oilReductionRatio", 0], ["spaceRatio", 0], ["prodTransferBonus", 0]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
})), new SpaceBuildingDef("sattelite", "cath", ofArray([new Price("titanium", 2500), new Price("oil", 15000), new Price("science", 100000), new Price("starchart", 325)]), ofList(ofArray([["observatoryRatio", 0], ["starchartPerTickBaseSpace", 0], ["energyConsumption", 0], ["energyProduction", 0]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new SpaceBuildingDef("spaceStation", "cath", ofArray([new Price("oil", 35000), new Price("science", 150000), new Price("starchart", 425), new Price("alloy", 750)]), ofList(ofArray([["scienceRatio", 0], ["maxKittens", 0], ["energyConsumption", 0]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new SpaceBuildingDef("moonOutpost", "moon", ofArray([new Price("oil", 55000), new Price("uranium", 500), new Price("science", 100000), new Price("starchart", 650), new Price("concrate", 150), new Price("alloy", 750)]), ofList(ofArray([["uraniumPerTickCon", 0], ["unobtainiumPerTickSpace", 0], ["energyConsumption", 0]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
})), new SpaceBuildingDef("moonBase", "moon", ofArray([new Price("titanium", 9500), new Price("oil", 70000), new Price("unobtainium", 50), new Price("science", 100000), new Price("starchart", 700), new Price("concrate", 250)]), ofList(ofArray([["catnipMax", 0], ["woodMax", 0], ["mineralsMax", 0], ["coalMax", 0], ["ironMax", 0], ["titaniumMax", 0], ["oilMax", 0], ["unobtainiumMax", 0], ["energyConsumption", 0]]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
})), new SpaceBuildingDef("planetCracker", "dune", ofArray([new Price("science", 125000), new Price("starchart", 2500), new Price("alloy", 1750), new Price("kerosene", 50)]), ofList(ofArray([["uraniumPerTickSpace", 0], ["uraniumMax", 0]]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
})), new SpaceBuildingDef("hydrofracturer", "dune", ofArray([new Price("science", 150000), new Price("starchart", 750), new Price("alloy", 1025), new Price("kerosene", 100)]), ofList(singleton(["oilPerTickAutoprodSpace", 0]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
})), new SpaceBuildingDef("spiceRefinery", "dune", ofArray([new Price("science", 75000), new Price("starchart", 500), new Price("alloy", 500), new Price("kerosene", 125)]), ofList(singleton(["spicePerTickAutoprodSpace", 0]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
})), new SpaceBuildingDef("researchVessel", "piscine", ofArray([new Price("titanium", 12500), new Price("starchart", 100), new Price("alloy", 2500), new Price("kerosene", 250)]), ofList(ofArray([["scienceMax", 0], ["starchartPerTickBaseSpace", 0]]), {
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
})), new SpaceBuildingDef("orbitalArray", "piscine", ofArray([new Price("science", 250000), new Price("starchart", 2000), new Price("eludium", 100), new Price("kerosene", 500)]), ofList(ofArray([["spaceRatio", 0], ["energyConsumption", 0]]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
})), new SpaceBuildingDef("sunlifter", "helios", ofArray([new Price("science", 500000), new Price("eludium", 225), new Price("kerosene", 2500)]), ofList(ofArray([["antimatterProduction", 0], ["energyProduction", 0]]), {
    Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
})), new SpaceBuildingDef("containmentChamber", "helios", ofArray([new Price("science", 500000), new Price("kerosene", 2500)]), ofList(ofArray([["antimatterMax", 0], ["energyConsumption", 0]]), {
    Compare: (x_11, y_11) => (comparePrimitives(x_11, y_11) | 0),
})), new SpaceBuildingDef("heatsink", "helios", ofArray([new Price("science", 125000), new Price("relic", 1), new Price("kerosene", 5000), new Price("thorium", 12500)]), empty({
    Compare: (x_12, y_12) => (comparePrimitives(x_12, y_12) | 0),
})), new SpaceBuildingDef("sunforge", "helios", ofArray([new Price("antimatter", 250), new Price("science", 100000), new Price("relic", 1), new Price("kerosene", 1250)]), ofList(singleton(["baseMetalMaxRatio", 0.01]), {
    Compare: (x_13, y_13) => (comparePrimitives(x_13, y_13) | 0),
})), new SpaceBuildingDef("cryostation", "terminus", ofArray([new Price("science", 200000), new Price("concrate", 1500), new Price("eludium", 25), new Price("kerosene", 500)]), ofList(ofArray([["woodMax", 0], ["mineralsMax", 0], ["coalMax", 0], ["ironMax", 0], ["titaniumMax", 0], ["oilMax", 0], ["uraniumMax", 0], ["unobtainiumMax", 0]]), {
    Compare: (x_14, y_14) => (comparePrimitives(x_14, y_14) | 0),
})), new SpaceBuildingDef("spaceBeacon", "kairo", ofArray([new Price("antimatter", 50), new Price("starchart", 25000), new Price("alloy", 25000), new Price("kerosene", 7500)]), ofList(ofArray([["scienceMax", 25000], ["starchartPerTickBaseSpace", 0.025], ["relicPerDay", 0]]), {
    Compare: (x_15, y_15) => (comparePrimitives(x_15, y_15) | 0),
})), new SpaceBuildingDef("terraformingStation", "yarn", ofArray([new Price("uranium", 5000), new Price("antimatter", 25), new Price("kerosene", 5000)]), ofList(singleton(["maxKittens", 1]), {
    Compare: (x_16, y_16) => (comparePrimitives(x_16, y_16) | 0),
})), new SpaceBuildingDef("hydroponics", "yarn", ofArray([new Price("unobtainium", 1), new Price("kerosene", 500)]), ofList(ofArray([["catnipRatio", 0.025], ["catnipMaxRatio", 0.1], ["terraformingMaxKittensRatio", 0]]), {
    Compare: (x_17, y_17) => (comparePrimitives(x_17, y_17) | 0),
})), new SpaceBuildingDef("hrHarvester", "umbra", ofArray([new Price("antimatter", 1250), new Price("relic", 25)]), ofList(singleton(["energyProduction", 1]), {
    Compare: (x_18, y_18) => (comparePrimitives(x_18, y_18) | 0),
})), new SpaceBuildingDef("navigationRelay", "umbra", ofArray([new Price("titanium", 50000), new Price("concrate", 5000)]), empty({
    Compare: (x_19, y_19) => (comparePrimitives(x_19, y_19) | 0),
})), new SpaceBuildingDef("spaceShuttle", "umbra", ofArray([new Price("antimatter", 50), new Price("eludium", 500)]), empty({
    Compare: (x_20, y_20) => (comparePrimitives(x_20, y_20) | 0),
})), new SpaceBuildingDef("entangler", "charon", ofArray([new Price("antimatter", 5250), new Price("relic", 1250), new Price("eludium", 5000)]), ofList(ofArray([["gflopsConsumption", 0.1], ["hashrate", 0], ["hashRateLevel", 0], ["nextHashLevelAt", 0], ["hrProgress", 0], ["energyConsumption", 25]]), {
    Compare: (x_21, y_21) => (comparePrimitives(x_21, y_21) | 0),
})), new SpaceBuildingDef("tectonic", "centaurusSystem", ofArray([new Price("antimatter", 500), new Price("thorium", 75000)]), ofList(singleton(["energyProduction", 0]), {
    Compare: (x_22, y_22) => (comparePrimitives(x_22, y_22) | 0),
})), new SpaceBuildingDef("moltenCore", "centaurusSystem", ofArray([new Price("uranium", 5000000), new Price("science", 25000000)]), ofList(singleton(["tectonicBonus", 0.05]), {
    Compare: (x_23, y_23) => (comparePrimitives(x_23, y_23) | 0),
}))]);

export const perkDefs = ofArray([new PerkDef("engeneering", singleton(new Price("paragon", 5)), ofList(singleton(["priceRatio", -0.01]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
})), new PerkDef("codexVox", singleton(new Price("paragon", 25)), ofList(ofArray([["manuscriptCraftRatio", 0.25], ["manuscriptGlobalCraftRatio", 0.05]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new PerkDef("codexLogos", singleton(new Price("paragon", 50)), ofList(ofArray([["manuscriptGlobalCraftRatio", 0.05], ["compediumCraftRatio", 0.25], ["compediumGlobalCraftRatio", 0.05]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new PerkDef("codexAgrum", singleton(new Price("paragon", 75)), ofList(ofArray([["manuscriptGlobalCraftRatio", 0.05], ["compediumGlobalCraftRatio", 0.05], ["blueprintCraftRatio", 0.25], ["blueprintGlobalCraftRatio", 0.05]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
})), new PerkDef("megalomania", singleton(new Price("paragon", 10)), empty({
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
})), new PerkDef("blackCodex", singleton(new Price("paragon", 25)), empty({
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
})), new PerkDef("codexLeviathanianus", singleton(new Price("paragon", 75)), empty({
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
})), new PerkDef("goldenRatio", singleton(new Price("paragon", 50)), ofList(ofArray([["priceRatio", -0.016180339887498948], ["queueCap", 1]]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
})), new PerkDef("divineProportion", singleton(new Price("paragon", 100)), ofList(ofArray([["priceRatio", -0.017777777777777778], ["queueCap", 2]]), {
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
})), new PerkDef("vitruvianFeline", singleton(new Price("paragon", 250)), ofList(singleton(["priceRatio", -0.02]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
})), new PerkDef("renaissance", singleton(new Price("paragon", 750)), ofList(ofArray([["priceRatio", -0.0225], ["queueCap", 2]]), {
    Compare: (x_10, y_10) => (comparePrimitives(x_10, y_10) | 0),
})), new PerkDef("diplomacy", singleton(new Price("paragon", 5)), ofList(singleton(["standingRatio", 0.1]), {
    Compare: (x_11, y_11) => (comparePrimitives(x_11, y_11) | 0),
})), new PerkDef("zebraDiplomacy", singleton(new Price("paragon", 35)), empty({
    Compare: (x_12, y_12) => (comparePrimitives(x_12, y_12) | 0),
})), new PerkDef("zebraCovenant", singleton(new Price("paragon", 75)), empty({
    Compare: (x_13, y_13) => (comparePrimitives(x_13, y_13) | 0),
})), new PerkDef("navigationDiplomacy", singleton(new Price("paragon", 300)), empty({
    Compare: (x_14, y_14) => (comparePrimitives(x_14, y_14) | 0),
})), new PerkDef("ambassadors", singleton(new Price("paragon", 100)), empty({
    Compare: (x_15, y_15) => (comparePrimitives(x_15, y_15) | 0),
})), new PerkDef("treaties", singleton(new Price("paragon", 500)), ofList(ofArray([["embassiesPerAmbassadorSlot", 30], ["ambassadorBoostPerRank", 0.1]]), {
    Compare: (x_16, y_16) => (comparePrimitives(x_16, y_16) | 0),
})), new PerkDef("chronomancy", singleton(new Price("paragon", 25)), empty({
    Compare: (x_17, y_17) => (comparePrimitives(x_17, y_17) | 0),
})), new PerkDef("astromancy", singleton(new Price("paragon", 50)), empty({
    Compare: (x_18, y_18) => (comparePrimitives(x_18, y_18) | 0),
})), new PerkDef("unicornmancy", singleton(new Price("paragon", 125)), empty({
    Compare: (x_19, y_19) => (comparePrimitives(x_19, y_19) | 0),
})), new PerkDef("alicornmancy", singleton(new Price("paragon", 200)), empty({
    Compare: (x_20, y_20) => (comparePrimitives(x_20, y_20) | 0),
})), new PerkDef("anachronomancy", singleton(new Price("paragon", 125)), empty({
    Compare: (x_21, y_21) => (comparePrimitives(x_21, y_21) | 0),
})), new PerkDef("carnivals", singleton(new Price("paragon", 25)), empty({
    Compare: (x_22, y_22) => (comparePrimitives(x_22, y_22) | 0),
})), new PerkDef("willenfluff", singleton(new Price("paragon", 150)), ofList(singleton(["kittenGrowthRatio", 0.75]), {
    Compare: (x_23, y_23) => (comparePrimitives(x_23, y_23) | 0),
})), new PerkDef("pawgan", singleton(new Price("paragon", 400)), ofList(singleton(["kittenGrowthRatio", 1.5]), {
    Compare: (x_24, y_24) => (comparePrimitives(x_24, y_24) | 0),
})), new PerkDef("numerology", singleton(new Price("paragon", 50)), empty({
    Compare: (x_25, y_25) => (comparePrimitives(x_25, y_25) | 0),
})), new PerkDef("numeromancy", singleton(new Price("paragon", 250)), empty({
    Compare: (x_26, y_26) => (comparePrimitives(x_26, y_26) | 0),
})), new PerkDef("malkuth", singleton(new Price("paragon", 500)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_27, y_27) => (comparePrimitives(x_27, y_27) | 0),
})), new PerkDef("yesod", singleton(new Price("paragon", 750)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_28, y_28) => (comparePrimitives(x_28, y_28) | 0),
})), new PerkDef("hod", singleton(new Price("paragon", 1250)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_29, y_29) => (comparePrimitives(x_29, y_29) | 0),
})), new PerkDef("netzach", singleton(new Price("paragon", 1750)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_30, y_30) => (comparePrimitives(x_30, y_30) | 0),
})), new PerkDef("tiferet", singleton(new Price("paragon", 2500)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_31, y_31) => (comparePrimitives(x_31, y_31) | 0),
})), new PerkDef("gevurah", singleton(new Price("paragon", 5000)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_32, y_32) => (comparePrimitives(x_32, y_32) | 0),
})), new PerkDef("chesed", singleton(new Price("paragon", 7500)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_33, y_33) => (comparePrimitives(x_33, y_33) | 0),
})), new PerkDef("binah", singleton(new Price("paragon", 15000)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_34, y_34) => (comparePrimitives(x_34, y_34) | 0),
})), new PerkDef("chokhmah", singleton(new Price("paragon", 30000)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_35, y_35) => (comparePrimitives(x_35, y_35) | 0),
})), new PerkDef("keter", singleton(new Price("paragon", 60000)), ofList(singleton(["paragonRatio", 0.05]), {
    Compare: (x_36, y_36) => (comparePrimitives(x_36, y_36) | 0),
})), new PerkDef("voidOrder", singleton(new Price("paragon", 75)), empty({
    Compare: (x_37, y_37) => (comparePrimitives(x_37, y_37) | 0),
})), new PerkDef("adjustmentBureau", singleton(new Price("paragon", 5)), empty({
    Compare: (x_38, y_38) => (comparePrimitives(x_38, y_38) | 0),
})), new PerkDef("ascoh", singleton(new Price("paragon", 5)), empty({
    Compare: (x_39, y_39) => (comparePrimitives(x_39, y_39) | 0),
}))]);

export const achievementDefs = ofArray([new AchievementDef("theElderLegacy", false), new AchievementDef("unicornConspiracy", false), new AchievementDef("uniception", false), new AchievementDef("sinsOfEmpire", false), new AchievementDef("anachronox", false), new AchievementDef("deadSpace", false), new AchievementDef("sadnessAbyss", false), new AchievementDef("ironWill", false), new AchievementDef("uberkatzhen", false), new AchievementDef("hundredYearsSolitude", false), new AchievementDef("soilUptuned", false), new AchievementDef("atlasUnmeowed", false), new AchievementDef("meowMeowRevolution", false), new AchievementDef("spaceOddity", false), new AchievementDef("jupiterAscending", false), new AchievementDef("veryLargeArray", false), new AchievementDef("shadowOfTheColossus", false), new AchievementDef("sunGod", false), new AchievementDef("heartOfDarkness", false), new AchievementDef("winterIsComing", false), new AchievementDef("youMonster", false), new AchievementDef("superUnethicalClimax", false), new AchievementDef("systemShock", false), new AchievementDef("lotusMachine", false), new AchievementDef("serenity", false), new AchievementDef("utopiaProject", false), new AchievementDef("deathStranding", false), new AchievementDef("cathammer", false), new AchievementDef("eternalBacchanalia", false), new AchievementDef("challenger", false), new AchievementDef("betterSafeThanSorry", false)]);

export const statDefs = ofArray([new StatDef("totalKittens", 0), new StatDef("kittensDead", 0), new StatDef("totalYears", 0), new StatDef("totalResets", 0), new StatDef("totalParagon", 0), new StatDef("eventsObserved", 0), new StatDef("unicornsSacrificed", 0), new StatDef("buildingsConstructed", 0), new StatDef("totalClicks", 0), new StatDef("totalTrades", 0), new StatDef("totalCrafts", 0), new StatDef("averageKittens", 0), new StatDef("transcendenceTier", 0), new StatDef("totalChallengesCompleted", 0)]);

export const cfuDefs = ofArray([new CFUDef("temporalBattery", singleton(new Price("timeCrystal", 5)), ofList(singleton(["temporalFluxMax", 750]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
})), new CFUDef("blastFurnace", ofArray([new Price("timeCrystal", 25), new Price("relic", 5)]), ofList(ofArray([["heatPerTick", 0.02], ["heatMax", 100]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new CFUDef("timeBoiler", singleton(new Price("timeCrystal", 25000)), ofList(ofArray([["heatMaxExpansion", 10], ["energyConsumption", 1]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new CFUDef("controlledDelay", ofArray([new Price("timeCrystal", 1), new Price("gear", 10)]), ofList(singleton(["energyConsumption", 0.75]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
})), new CFUDef("temporalAccelerator", ofArray([new Price("timeCrystal", 10), new Price("relic", 1000)]), ofList(singleton(["timeRatio", 0.05]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
})), new CFUDef("temporalImpedance", ofArray([new Price("timeCrystal", 100), new Price("relic", 250)]), ofList(singleton(["timeImpedance", 1000]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
})), new CFUDef("ressourceRetrieval", singleton(new Price("timeCrystal", 1000)), ofList(singleton(["shatterTCGain", 0.01]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
})), new CFUDef("temporalPress", ofArray([new Price("timeCrystal", 100), new Price("void", 10)]), ofList(ofArray([["shatterYearBoost", 0], ["energyConsumption", 5]]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
}))]);

export const vsuDefs = ofArray([new VSUDef("cryochambers", ofArray([new Price("karma", 1), new Price("timeCrystal", 2), new Price("void", 100)]), ofList(singleton(["maxKittens", 1]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
})), new VSUDef("usedCryochambers", empty_1(), empty({
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new VSUDef("voidHoover", ofArray([new Price("antimatter", 1000), new Price("timeCrystal", 10), new Price("void", 250)]), ofList(singleton(["temporalParadoxVoid", 1]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new VSUDef("voidRift", singleton(new Price("void", 75)), ofList(ofArray([["umbraBoostRatio", 0.1], ["globalResourceRatio", 0.02]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
})), new VSUDef("chronocontrol", ofArray([new Price("temporalFlux", 3000), new Price("timeCrystal", 30), new Price("void", 500)]), ofList(ofArray([["temporalParadoxDay", 0], ["energyConsumption", 15]]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
})), new VSUDef("voidResonator", ofArray([new Price("timeCrystal", 1000), new Price("relic", 10000), new Price("void", 50)]), ofList(singleton(["voidResonance", 0.1]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
}))]);

export const cycleDefs = ofArray([new CycleDef("charon", ofList(ofArray([["moonOutpost-unobtainiumPerTickSpace", 0.9], ["entangler-gflopsConsumption", 2]]), {
    Compare: (x, y) => (comparePrimitives(x, y) | 0),
})), new CycleDef("umbra", ofList(ofArray([["hydrofracturer-oilPerTickAutoprodSpace", 0.75], ["planetCracker-uraniumPerTickSpace", 0.9], ["hrHarvester-energyProduction", 1.5]]), {
    Compare: (x_1, y_1) => (comparePrimitives(x_1, y_1) | 0),
})), new CycleDef("yarn", ofList(ofArray([["hydroponics-catnipRatio", 2], ["researchVessel-starchartPerTickBaseSpace", 0.5]]), {
    Compare: (x_2, y_2) => (comparePrimitives(x_2, y_2) | 0),
})), new CycleDef("helios", ofList(ofArray([["cryostation-woodMax", 0.9], ["cryostation-mineralsMax", 0.9], ["cryostation-coalMax", 0.9], ["cryostation-ironMax", 0.9], ["cryostation-titaniumMax", 0.9], ["cryostation-oilMax", 0.9], ["cryostation-uraniumMax", 0.9], ["cryostation-unobtainiumMax", 0.9], ["sunlifter-energyProduction", 1.5]]), {
    Compare: (x_3, y_3) => (comparePrimitives(x_3, y_3) | 0),
})), new CycleDef("cath", ofList(ofArray([["spaceStation-scienceRatio", 1.5], ["sattelite-observatoryRatio", 2], ["sattelite-starchartPerTickBaseSpace", 2], ["spaceBeacon-starchartPerTickBaseSpace", 0.1], ["spaceElevator-prodTransferBonus", 2]]), {
    Compare: (x_4, y_4) => (comparePrimitives(x_4, y_4) | 0),
})), new CycleDef("redmoon", ofList(ofArray([["moonOutpost-unobtainiumPerTickSpace", 1.2], ["entangler-gflopsConsumption", 0.5]]), {
    Compare: (x_5, y_5) => (comparePrimitives(x_5, y_5) | 0),
})), new CycleDef("dune", ofList(ofArray([["hydrofracturer-oilPerTickAutoprodSpace", 1.5], ["planetCracker-uraniumPerTickSpace", 1.1], ["hrHarvester-energyProduction", 0.75]]), {
    Compare: (x_6, y_6) => (comparePrimitives(x_6, y_6) | 0),
})), new CycleDef("piscine", ofList(ofArray([["hydroponics-catnipRatio", 0.5], ["researchVessel-starchartPerTickBaseSpace", 1.5]]), {
    Compare: (x_7, y_7) => (comparePrimitives(x_7, y_7) | 0),
})), new CycleDef("terminus", ofList(ofArray([["cryostation-woodMax", 1.2], ["cryostation-mineralsMax", 1.2], ["cryostation-coalMax", 1.2], ["cryostation-ironMax", 1.2], ["cryostation-titaniumMax", 1.2], ["cryostation-oilMax", 1.2], ["cryostation-uraniumMax", 1.2], ["cryostation-unobtainiumMax", 1.2], ["sunlifter-energyProduction", 0.5]]), {
    Compare: (x_8, y_8) => (comparePrimitives(x_8, y_8) | 0),
})), new CycleDef("kairo", ofList(ofArray([["spaceStation-scienceRatio", 0.75], ["sattelite-observatoryRatio", 0.75], ["sattelite-starchartPerTickBaseSpace", 0.75], ["spaceBeacon-starchartPerTickBaseSpace", 5], ["spaceElevator-prodTransferBonus", 0.5]]), {
    Compare: (x_9, y_9) => (comparePrimitives(x_9, y_9) | 0),
}))]);

