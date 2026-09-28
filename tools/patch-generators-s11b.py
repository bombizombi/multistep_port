import io

p = 'tools/gen-world-catalogs.js'
s = open(p, encoding='utf8', newline='').read()

# 1. perk/ach/stats emitter lines (extended fields)
old = """const perks = src.perks.map((p) =>
  `      { Name = ${fstr(p.name)}; Prices = ${fprices(p.prices)}; Effects = ${p.effects ? fmap(p.effects) : "Map.empty"} }`);

const achievements = src.achievements.map((a) =>
  `      { Name = ${fstr(a.name)}; Starred = ${fbool(a.starred)} }`);

const stats = src.stats.map((s) =>
  `      { Name = ${fstr(s.name)}; InitialVal = ${s.val || 0} }`);"""
new = """const perks = src.perks.map((p) =>
  `      { Name = ${fstr(p.name)}; Prices = ${fprices(p.prices)}; Effects = ${p.effects ? fmap(p.effects) : "Map.empty"}; StartsUnlocked = ${fbool(p.defaultUnlocked)}; Unlocks = ${funlocks(p.unlocks)}; Upgrades = ${funlocks(p.upgrades)}; HasHandler = ${fbool(p.hasHandler)} }`);

const achievements = src.achievements.map((a) =>
  `      { Name = ${fstr(a.name)}; Hidden = ${fbool(a.hidden)}; HasCondition = ${fbool(a.hasCondition)}; HasStarCondition = ${fbool(a.hasStarCondition)} }`);

const badges = (src.badges || []).map((b) =>
  `      { Name = ${fstr(b.name)}; Difficulty = ${b.difficulty === null || b.difficulty === undefined ? "None" : `Some ${fstr(b.difficulty)}`}; HasCondition = ${fbool(b.hasCondition)} }`);

const stats = src.stats.map((s) =>
  `      { Name = ${fstr(s.name)}; InitialVal = ${s.val || 0}; StartsUnlocked = ${fbool(s.defaultUnlocked)}; HasCalculate = ${fbool(s.hasCalculate)} }`);

const statsCurrent = (src.statsCurrent || []).map((s) =>
  `      { Name = ${fstr(s.name)}; HasCalculate = ${fbool(s.hasCalculate)} }`);"""
assert old in s, "emitters"
s = s.replace(old, new)

# 2. types
old = """type PerkDef = { Name: string; Prices: Price list; Effects: Map<string, float> }
type AchievementDef = { Name: string; Starred: bool }
type StatDef = { Name: string; InitialVal: float }"""
new = """type PerkDef =
    { Name: string; Prices: Price list; Effects: Map<string, float>
      StartsUnlocked: bool; Unlocks: UnlockList option; Upgrades: UnlockList option
      HasHandler: bool }

type AchievementDef =
    { Name: string; Hidden: bool; HasCondition: bool; HasStarCondition: bool }

type BadgeDef = { Name: string; Difficulty: string option; HasCondition: bool }

type StatDef =
    { Name: string; InitialVal: float; StartsUnlocked: bool; HasCalculate: bool }

type StatCurrentDef = { Name: string; HasCalculate: bool }"""
assert old in s, "types"
s = s.replace(old, new)

# 3. sections: add badges + statsCurrent after the existing ones
old = """let achievementDefs : AchievementDef list =
    [
${achievements.join("\\n")}
    ]"""
new = """let achievementDefs : AchievementDef list =
    [
${achievements.join("\\n")}
    ]

let badgeDefs : BadgeDef list =
    [
${badges.join("\\n")}
    ]"""
assert old in s, "ach section"
s = s.replace(old, new)

old = """let statDefs : StatDef list =
    [
${stats.join("\\n")}
    ]"""
new = """let statDefs : StatDef list =
    [
${stats.join("\\n")}
    ]

let statCurrentDefs : StatCurrentDef list =
    [
${statsCurrent.join("\\n")}
    ]"""
assert old in s, "stats section"
s = s.replace(old, new)

open(p, 'w', encoding='utf8', newline='\n').write(s)
print('world gen patched')

# --- gen-defs-catalogs.js: PolicyDef.IsRelation ---
p = 'tools/gen-defs-catalogs.js'
s = open(p, encoding='utf8', newline='').read()
old = """const policyLines = src.policies.map((p) =>
  `      { Name = ${fstr(p.name)}; Prices = ${fprices(p.prices)}; Unlocks = ${funlocks(p.unlocks)} }`);"""
new = """const policyLines = src.policies.map((p) =>
  `      { Name = ${fstr(p.name)}; Prices = ${fprices(p.prices)}; IsRelation = ${fbool(p.isRelation)}; Unlocks = ${funlocks(p.unlocks)} }`);"""
assert old in s, "policy line"
s = s.replace(old, new)
open(p, 'w', encoding='utf8', newline='\n').write(s)
print('defs gen patched')
