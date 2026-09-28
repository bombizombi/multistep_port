import io

p = 'oracle/runner/_world-driver.js'
s = open(p, encoding='utf8', newline='').read()

old = """  const perks = game.prestige.perks.map((p) => ({
    name: p.name, prices: clone(p.prices) || [], unlocked: !!p.unlocked, researched: !!p.researched,
    effects: clone(p.effects) || null,
  }));
  const achievements = game.achievements.achievements.map((a) => ({
    name: a.name, unlocked: !!a.unlocked, starred: !!a.starred || false,
  }));
  const stats = (game.stats.stats || game.stats.getStats ? game.stats.stats : []).map((s) => ({
    name: s.name, val: s.val || 0,
  }));"""
new = """  const perks = game.prestige.perks.map((p) => ({
    name: p.name, prices: clone(p.prices) || [], unlocked: !!p.unlocked, researched: !!p.researched,
    effects: clone(p.effects) || null,
    defaultUnlocked: !!p.defaultUnlocked,
    unlocks: unlockShape(p.unlocks), upgrades: unlockShape(p.upgrades),
    hasHandler: typeof p.handler === "function",
  }));
  const achievements = game.achievements.achievements.map((a) => ({
    name: a.name, unlocked: !!a.unlocked, starred: !!a.starred || false,
    hidden: !!a.hidden, hasCondition: typeof a.condition === "function",
    hasStarCondition: typeof a.starCondition === "function",
  }));
  const badges = game.achievements.badges.map((b) => ({
    name: b.name, difficulty: b.difficulty === undefined ? null : b.difficulty,
    unlocked: !!b.unlocked, hasCondition: typeof b.condition === "function",
  }));
  const stats = (game.stats.stats || game.stats.getStats ? game.stats.stats : []).map((s) => ({
    name: s.name, val: s.val || 0,
    defaultUnlocked: !!s.defaultUnlocked, hasCalculate: typeof s.calculate === "function",
  }));
  const statsCurrent = (game.stats.statsCurrent || []).map((s) => ({
    name: s.name, hasCalculate: typeof s.calculate === "function",
  }));"""
assert old in s, "perks block"
s = s.replace(old, new)

old = """    races, zu, ru, tu, pacts, programs, planets, spaceBuildings, perks, achievements, stats, cfu, vsu, cycles,"""
new = """    races, zu, ru, tu, pacts, programs, planets, spaceBuildings, perks, achievements, badges, stats, statsCurrent, cfu, vsu, cycles,"""
assert old in s, "emission list"
s = s.replace(old, new)

# unlockShape exists in this file? It was defined for --dump-defs in orig-driver;
# _world-driver needs one.
if 'const unlockShape' not in s:
    old = """  const clone = (o) => JSON.parse(JSON.stringify(o === undefined ? null : o));
  const races = game.diplomacy.races.map((r) => ({"""
    new = """  const clone = (o) => JSON.parse(JSON.stringify(o === undefined ? null : o));
  const unlockShape = (u) => (u ? { buildings: u.buildings || [], tabs: u.tabs || [], jobs: u.jobs || [], tech: u.tech || [], policies: u.policies || [], upgrades: u.upgrades || [], zebraUpgrades: u.zebraUpgrades || [], religion: u.religion || [], crafts: u.crafts || [], perks: u.perks || [], stages: [] } : null);
  const races = game.diplomacy.races.map((r) => ({"""
    assert old in s, "clone anchor"
    s = s.replace(old, new)

# log line
old = 'console.log("world -> " + outPath + " (races " + races.length'
new = 'console.log("world -> " + outPath + " (races " + races.length + ", badges " + badges.length'
assert old in s
s = s.replace(old, new)

open(p, 'w', encoding='utf8', newline='\n').write(s)
print('world dump ok')

# --- orig-driver --dump-defs: policies gain isRelation ---
p = 'oracle/runner/orig-driver.js'
s = open(p, encoding='utf8', newline='').read()
old = """  const policies = g.science.policies.map((p) => ({
    name: p.name, prices: clone(p.prices) || [], unlocked: !!p.unlocked, researched: !!p.researched,
    unlocks: unlockShape(p.unlocks),
  }));"""
new = """  const policies = g.science.policies.map((p) => ({
    name: p.name, prices: clone(p.prices) || [], unlocked: !!p.unlocked, researched: !!p.researched,
    unlocks: unlockShape(p.unlocks), isRelation: !!p.isRelation,
  }));"""
assert old in s, "policies dump"
s = s.replace(old, new)
open(p, 'w', encoding='utf8', newline='\n').write(s)
print('defs dump ok')
