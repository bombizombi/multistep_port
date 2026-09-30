# Plan — the view layer over the verified core (2026-10-01)

## Where we are

`kittens_land` is a bit-exact port of the game MODEL: 294/294 ledger units carry
a status, and every unit with an oracle surface (state, controller predicates,
data slices, save/migration byte formats) is proven identical to orig across the
52-scenario suite. What does not exist is the VIEW: the ~56 shell units
(ui-01..14, jsx-01..10, html-*, toolbar, tab/panel DOM) are scope-noted as
"out of oracle scope" because the harness has no F# DOM layer to diff against.

The Elmish.Land + Feliz + Vite scaffold already exists in `kittens_land/`
(`src/Pages/`, `index.html`, `elmish-land.json`, Feliz as the view engine).
The plan slots the game UI into it.

## Goal

A playable F#/Feliz UI over the verified `Game` library, with the DOM itself
brought under the oracle: orig renders into jsdom, the F# view renders the same
game state, and a new diff tool compares **DOM structure** (element tree,
classes, text content, data attributes) — not pixels. This upgrades the 56
scope-noted units from "state verified" to "state + rendered structure
verified".

## Architecture

1. **State → view-model seam (new, small).** A `Game.ViewModel` module that
   projects the existing pools (resPool, bpool, vpool, …) into plain display
   records: rows for the res bar (value/cap/unlocked/perTick), per-tab button
   lists (name/label/prices/enabled/visible — the same fields the controller
   probes already verify), calendar header, console log, tooltips. This module
   is PURE and oracle-diffable on its own — it is where most of the remaining
   display logic (game-11 stacks, game-12 formatting, census/government info)
   lands and gets verified like everything else.

2. **Feliz views (thin).** `Pages/*` render the view-model. No game logic in
   the views — they map view-model → React elements. Interactions dispatch
   into the SAME verified move functions the fs-runner uses (buy/craft/research
   …), so clicks go through already-proven code paths.

3. **DOM oracle (the new verification surface).**
   - orig side: `orig-driver.js --dom` renders the real game into jsdom
     (`game.ui.render()` — requires extending the harness dojo mock with
     create/destroy/place/query, which is D014-legal harness work), then dumps
     a normalized DOM tree (tag, class, trimmed text, order).
   - F# side: render the Feliz tree for the same scenario state (render to
     static markup under node via Fable) and dump the same normalized tree.
   - `tools/diff-dom.js` compares with an explicit ignore-list (orig chrome
     that carries no game semantics: script tags, react internals).
   - Milestone scenarios mirror the existing .cat files: same moves, snapshot
     = game snapshot + DOM snapshot.

## Milestones

| # | milestone | verified by |
|---|---|---|
| V1 | ViewModel for the res bar + calendar + Bonfire tab; Feliz pages render it | DOM diff on fresh-100-ticks + gather-hut-field |
| V2 | Village + Science + Workshop tabs (views over verified controllers) | DOM diff on village-leaders, first-research, workshop-economy |
| V3 | Diplomacy + Religion + Space + Time + Challenges tabs | DOM diff on trade-embassies, religion-faith, space-program, shatter-economy, challenge-completions |
| V4 | Console/log, tooltips (game-11/12 surface), queue tab (time-14/15/16 views) | DOM diff on queue.cat + tooltip probes |
| V5 | Options/settings UI + save/export/reset dialogs | DOM diff on settings-opts + reset.cat |

Each milestone lands only when its DOM diff is IDENTICAL; ledger shell units
flip their scope note to "rendered structure verified" as they're covered.

## Risks / notes

- The dojo mock extension for `game.ui.render()` is the biggest orig-side
  lift; if jsdom rendering proves too brittle, fall back to diffing at the
  view-model layer only (F# view-model vs orig's controller/fetchModel probes)
  and keep DOM as a smoke check rather than an equality gate.
- React version skew between orig's react.min.js and Feliz's renderer doesn't
  matter — we diff the DOM output, not the framework.
- i18n stays the $I-mock seam: the DOM diff compares $key$ placeholders, which
  is exactly the label-key parity already proven.

## First concrete step

V1: add `Game.ViewModel` with the res-bar + calendar projection, a
`--dom` dump mode on the orig driver, and `tools/diff-dom.js`. The Bonfire tab
(gather/refine + building buttons) is the smallest complete vertical slice.
