// generate src/Game.Labels.fs with the label subset we render
const fs = require("fs");
const j = require(require("path").resolve(__dirname, "..", "..", "orig_project", "kittensgame", "res", "i18n", "en.json"));
const defs = require(require("path").resolve(__dirname, "..", "oracle", "fixtures", "defs-orig.json"));
const entries = [];
const add = (k, v) => entries.push([k, v]);

for (const r of ["catnip","wood","minerals","coal","iron","titanium","gold","oil","uranium","unobtainium","antimatter","manpower","science","culture","faith","kittens","furs","ivory","spice","unicorns","tears","timeCrystal","void","temporalFlux","paragon","burnedParagon","karma","zebras","starchart","gflops","hashrates","necrocorn","alicorn","sorrow","relic","elderBox","wrappingPaper"]) {
  const v = j[`resources.${r}.title`];
  if (v) add(`res.${r}`, v);
}
for (const b of defs.buildings) add(`bld.${b.name}`, j[`buildings.${b.name}.label`] || b.name);
for (const t of defs.techs) add(`tech.${t.name}`, j[`science.${t.name}.label`] || t.name);
for (const p of defs.policies) add(`pol.${p.name}`, j[`policy.${p.name}.label`] || j[`policies.${p.name}.label`] || p.name);
for (const u of defs.upgrades) add(`up.${u.name}`, j[`workshop.${u.name}.label`] || u.name);
for (const c of defs.crafts) add(`craft.${c.name}`, j[`crafts.${c.name}.title`] || j[`resources.${c.name}.title`] || c.name);
for (const job of ["woodcutter","farmer","fisher","hunter","miner","scholar","priest","geologist","engineer","ambassador"]) {
  add(`job.${job}`, j[`village.jobs.${job}`] || job);
}

// V3 label sets
for (const r of ["lizards","zebras","sharks","griffins","nagas","spiders","dragons","leviathans"]) add(`race.` + r, j[`trade.race.` + r] || r);
for (const m of ["moonMission","orbitalLaunch","kuiperMission","outerPlanetaryMission","duneMission","piscineMission","terminusMission","kairoMission","rorschachMission","centaurusSystemMission","charonMission","focusMission","yarnMission","catnipMission","sunMission","forestMission","cruelMissions","umbrellaMission","kitchenMission","outerFlareMission","ellipseMission"]) { if (j[`space.` + m + `.label`]) add(`mission.` + m, j[`space.` + m + `.label`]); }
for (const c of ["blastFurnace","timeBoiler","temporalAccelerator","temporalImpedance","temporalPress","temporalBattery","ressourceRetriever"]) add(`cfu.` + c, j[`time.cfu.` + c + `.label`] || c);
for (const v of ["cryochambers","usedCryochambers","voidRift","tachyonParticleAccelerator","voidSpaceElevator"]) add(`vsu.` + v, j[`time.vsu.` + v + `.label`] || v);
for (const c of ["ironWill","winterIsComing","anarchy","energy","atheism","1000Years","blackSky","pacifism","unicornTears","postApocalypse"]) add(`challenge.` + c, j[`challendge.` + c + `.label`] || c);
for (const z of ["unicornTomb","ivoryTower","ivoryCitadel","skyPalace","unicornUtopia","sunspire","marker","unicornGraveyard","unicornNecropolis","blackPyramid","blackObelisk","blackNexus","blackCore","blackLibrary","blackRadiance","blazar","darkNova","mausoleum","holyGenocide","unicornmancy"]) add(`zu.` + z, j[`religion.zu.` + z + `.label`] || j[`religion.tu.` + z + `.label`] || z);
for (const r of ["solarchant","sunAltar","stoneLazarus","basilica","goldenSpire","scholasticism","transcendence","apocripha","frescoes","solarRevolution","stainedGlass","standardizedBlessing","solarChant2","templature","holyFires","righteousFire"]){ if (j[`religion.ru.` + r + `.label`]) add(`ru.` + r, j[`religion.ru.` + r + `.label`]); }
for (const s of ["moonOutpost","moonBase","spaceElevator","sattelite","spaceStation","hydroPlant","oilRig","moonWorkerStation","saplingPost","planetCracker","fuelRefinery","orbitalArray","moonReactor","crystalSpaceHeater","moltenSaltReactor","uraniumMine","spaceHub","reliquary"]){ if (j[`space.` + s + `.label`]) add(`sbld.` + s, j[`space.` + s + `.label`]); }

const esc = (s) => String(s).split("\\").join("\\\\").split('"').join("\\\"");
let out = [
  "// GENERATED from orig res/i18n/en.json by the V2 view slice — display labels",
  "// for the tabs rendered by the Feliz views. NOT the i18n unit (that stays the",
  "// $I-mock seam in the oracle); this is browser-UI display data only.",
  "module Game.Labels",
  "",
  "let labels : Map<string, string> =",
  "  Map.ofList [",
];
for (const [k, v] of entries) out.push(`    ("${k}", "${esc(v)}");`);
out.push("  ]");
out.push("");
out.push("let get (key: string) : string = labels |> Map.tryFind key |> Option.defaultValue key");
out.push("");
fs.writeFileSync("kittens_land/src/Game.Labels.fs", out.join("\n") + "\n");
console.log("labels:", entries.length);
