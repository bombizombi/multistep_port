"use strict";
/**
 * scenario.js — scenario file format + parser (oracle-02).
 *
 * Format (see ../README.md):
 *   # name: gather-hut-field          <- header lines start with '#'
 *   # seed: 20260927                  <- 32-bit seed for the PRNG stream
 *   # checkpoints: 0, 50, 100         <- ticks at which a snapshot is dumped
 *   0   gather 10                     <- moves: "<tick> <action> [args...]"
 *   20  buy field
 *
 * Move semantics (pinned): moves listed at tick T are executed BEFORE the
 * game.tick() of tick T; a snapshot at tick T is taken AFTER that tick().
 * A snapshot at tick 0 (fresh state, zero ticks) is always taken.
 *
 * Action vocabulary v1.1 (oracle-02 contract + D014 test hook):
 *   gather [n]        gather catnip n times (default 1)
 *   buy <bld> [n]     buy n units of a building via its modern controller
 *   craft <res> [n]   craft n of a resource
 *   assign <job> [n]  assign n kittens to a job
 *   research <tech>   research a tech (button controller buy path)
 *   upgrade <name>    buy a workshop upgrade
 *   policy <name>     research a policy
 *   hunt              send all hunters
 *   praise            praise the sun (faith)
 *   observe           no-op (explicit waiting)
 *   save / load       localStorage roundtrip (LCstorage-backed)
 *   resop <fn> <res> <v>  TEST HOOK (D014): direct resPool call —
 *                     fn ∈ addRes | addResEvent | addResPerTick; used only by
 *                     unit-* verification scenarios, never by player scenarios.
 */

const ACTIONS = new Set([
  "gather", "buy", "craft", "craftall", "assign", "speciality", "research",
  "upgrade", "policy", "hunt", "praise", "adore", "transcend", "worship",
  "ziggurat", "embassy", "trade", "tradeall", "perk", "festival",
  "feedelder", "undo", "pact", "accelerate", "observe", "save", "load",
  "resop", "refine",
]);

function parseScenario(text) {
  const scenario = { name: "unnamed", seed: 20260927, checkpoints: [], moves: [] };
  const seenAt = new Set();
  const problems = [];
  let maxTick = 0;

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNo = i + 1;
    const line = raw.trim();
    if (line === "") continue;
    if (line.startsWith("#")) {
      const m = line.match(/^#\s*([A-Za-z_]+)\s*:\s*(.*)$/);
      if (!m) continue; // plain comment
      const [, key, value] = m;
      if (key === "name") scenario.name = value.trim();
      else if (key === "seed") {
        const s = Number(value.trim());
        if (!Number.isInteger(s) || s < 0) problems.push(`line ${lineNo}: bad seed "${value}"`);
        else scenario.seed = s >>> 0;
      } else if (key === "checkpoints") {
        for (const part of value.split(",")) {
          const t = Number(part.trim());
          if (!Number.isInteger(t) || t < 0) problems.push(`line ${lineNo}: bad checkpoint "${part}"`);
          else { scenario.checkpoints.push(t); maxTick = Math.max(maxTick, t); }
        }
      } else {
        problems.push(`line ${lineNo}: unknown header "${key}" (ignored)`);
      }
      continue;
    }
    const parts = line.split(/\s+/);
    const tick = Number(parts[0]);
    const action = parts[1];
    const args = parts.slice(2);
    if (!Number.isInteger(tick) || tick < 0) { problems.push(`line ${lineNo}: tick must be a non-negative integer`); continue; }
    if (!action || !ACTIONS.has(action)) { problems.push(`line ${lineNo}: unknown action "${action}"`); continue; }
    if ((action === "buy" || action === "craft" || action === "assign") && args.length < 1) {
      problems.push(`line ${lineNo}: "${action}" needs an argument`); continue;
    }
    if ((action === "research" || action === "upgrade" || action === "policy") && args.length !== 1) {
      problems.push(`line ${lineNo}: "${action}" needs exactly one name`); continue;
    }
    if (action === "resop" && args.length < 1) {
      problems.push(`line ${lineNo}: "resop" needs <fn> plus fn-specific args`); continue;
    }
    scenario.moves.push({ tick, action, args });
    maxTick = Math.max(maxTick, tick);
  }

  // duplicate checkpoint de-dup (keep first) + always add 0 and maxTick
  const cps = new Set(scenario.checkpoints);
  cps.add(0); cps.add(maxTick);
  scenario.checkpoints = [...cps].sort((a, b) => a - b);
  scenario.moves.sort((a, b) => a.tick - b.tick); // stable enough: equal-tick moves keep insertion order in V8
  scenario.maxTick = maxTick;
  scenario.problems = problems;
  return scenario;
}

module.exports = { parseScenario, ACTIONS };
