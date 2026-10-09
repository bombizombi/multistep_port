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

// V6 tooltip + shell strings: descriptions, flavors, effect texts, tab titles
for (const b of defs.buildings) {
  for (const suffix of ["desc", "flavor", "effectDesc"]) {
    const v = j[`buildings.${b.name}.${suffix}`];
    if (v) add(`bld.${b.name}.${suffix}`, v);
  }
}
for (const t of defs.techs) {
  for (const suffix of ["desc", "flavor", "effectDesc"]) {
    const v = j[`science.${t.name}.${suffix}`];
    if (v) add(`tech.${t.name}.${suffix}`, v);
  }
}
for (const u of defs.upgrades) {
  for (const suffix of ["desc", "flavor", "effectDesc", "hint"]) {
    const v = j[`workshop.${u.name}.${suffix}`];
    if (v) add(`up.${u.name}.${suffix}`, v);
  }
}
add("tab.Bonfire", j["buildings.tabName"] || "Bonfire");
add("tab.Village", j["village.tab.title.smallvillage"] || "Village");
for (const t of ["science","workshop","trade","religion","space","time","challenges","stats","achievements","queue"]) {
  if (j[`tab.name.` + t]) add(`tab.${t[0].toUpperCase() + t.slice(1)}`, j[`tab.name.` + t]);
}
add("calendar.year.full", j["calendar.year.full"] || "Year {0} - {1}, day {2}");
for (const s of ["spring","summer","autumn","winter"]) {
  if (j[`calendar.season.` + s]) add(`season.${s}`, j[`calendar.season.` + s]);
}
add("console.intro", j["console.intro"] || "You are a kitten in a catnip forest.");
add("bld.gatherCatnip", j["buildings.gatherCatnip.label"] || "Gather catnip");
add("bld.gatherCatnip.desc", j["buildings.gatherCatnip.desc"] || "");
add("bld.refineCatnip", j["buildings.refineCatnip.label"] || "Refine catnip");
add("bld.refineCatnip.desc", j["buildings.refineCatnip.desc"] || "");

// job tooltips (desc/flavor); woodcutter's flavor lives at village.woodcutter.*
for (const job of ["woodcutter","farmer","fisher","hunter","miner","scholar","priest","geologist","engineer","ambassador"]) {
  for (const suffix of ["desc", "flavor"]) {
    const v = j[`village.job.${job}.${suffix}`] || j[`village.${job}.${suffix}`];
    if (v) add(`job.${job}.${suffix}`, v);
  }
}

// resource panel tooltip strings
for (const [k, v] of Object.entries({
  "res.stack.production": "Production",
  "res.stack.village": "Village",
  "res.stack.weather": "Weather",
  "res.toZero": "To zero",
  "res.toCap": "To cap",
  "res.toNextKitten": "To next kitten"
})) add(k, v);

// village tab title ladder (village.js getVillageTitle)
for (const [k, v] of Object.entries({
  outpost: "Outpost", smallvillage: "Small Village", village: "Village",
  settlement: "Settlement", smalltown: "Small Town", town: "Town",
  city: "City", metropolis: "Metropolis", megapolis: "Megapolis",
  empire: "Empire", imperium: "Imperium", dominion: "Dominion",
  hegemony: "Hegemony", federation: "Federation", reich: "Reich",
  society: "Society", civilisation: "Civilisation", consortium: "Consortium",
  council: "Planetary Council", union: "Galactic Union", elders: "Elders",
  deities: "Deities"
})) {
  if (j[`village.tab.title.` + k]) add(`vtab.` + k, j[`village.tab.title.` + k]);
}

// library tab misc (hide-researched checkbox, complete marker, effect label)
for (const [k, v] of Object.entries({
  "science.toggleResearched.label": "Hide researched techs",
  "btn.complete.capital": "(Complete)",
  "res.effect": "Effect"
})) add(k, v);

// building group filters (Bonfire) + hunt button
for (const f of ["all", "available", "enabled", "togglable"]) {
  if (j[`ui.filter.` + f]) add(`filter.` + f, j[`ui.filter.` + f]);
}
add("village.hunt", j["village.btn.hunters"] || "Send hunters");

// planet names for the space tab group headers
for (const k in j) {
  const m = /^space\.planet\.([a-zA-Z]+)\.label$/.exec(k);
  if (m) add(`planet.` + m[1], j[k]);
}

// festival + sell + religion adore/transcend + metaphysics labels
for (const k of [
  "village.btn.festival", "village.btn.festival.desc",
  "village.festival.msg.start", "village.festival.msg.ext",
  "btn.sell", "religion.adoreBtn.label", "religion.adoreBtn.desc",
  "religion.transcendBtn.label", "religion.transcendBtn.desc",
  "prestige.panel.label"
]) { if (j[k]) add(k, j[k]); }
for (const k in j) {
  const m = /^prestige\.([a-zA-Z]+)\.label$/.exec(k);
  if (m) add(`perk.` + m[1], j[k]);
}

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
