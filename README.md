# Ranchborn

> Raise them. Shape their lineage. Build a ranch that remembers.

A cozy monster-ranch simulation for iOS and Android. Players inherit a neglected
ranch, raise expressive creatures, develop distinctive bloodlines across
generations, and register breeds of their own creation.

Battling exists, but it is an optional activity rather than a progression gate.
A monster can be valuable as a worker, companion, show animal, explorer, parent,
mentor, racer, or fighter.

## Status

Pre-production. No engine has been chosen yet. What exists is the design bible
plus a browser prototype of the genetics and breeding systems, built to test the
central hook before committing to an engine.

## Quick start

```bash
npm install
npm test          # 37 tests covering inheritance, expression, and pairing rules
npm run serve     # then open http://localhost:8123/
```

Once the prototype is open, click **Set up carrier lineage**, then **Pair and
hatch** a dozen times. Roughly a quarter of the hatchlings will show stub horns
that neither parent has — a trait that skipped a generation and came back from
the grandparents. That is the game's central promise, working.

### Just want to look at it?

```bash
npm install && npm run bundle
```

That writes `dist/ranchborn-nursery.html` — a single self-contained file with
the code, styles, and species data inlined. Open it directly in a browser. No
server, no network, nothing to install on the machine you open it on, so it can
be emailed to a playtester or opened on a phone.

`npm run variant-sheet` renders every trait variant to `dist/variant-sheet.html`
for art review.

## Documentation

| Document | Contents |
|---|---|
| [Game Bible v0.1](docs/design/game-bible.md) | The complete design document: pillars, systems, species, genetics, art and audio direction, scope, and milestones. |
| [Simulation core](sim/README.md) | How the genetics model works, and the design decisions the bible left open. |

## Code

| Path | Contents |
|---|---|
| `sim/` | Engine-agnostic genetics and breeding core, plus species data as editable JSON (§37.1). No DOM, no dependencies. |
| `prototype/` | Browser prototype: SVG monsters rendered from genotype, a pairing forecast, and a family tree. |
| `scripts/` | Static file server, the standalone bundler, and the variant contact sheet. |

The simulation core is deliberately free of any engine or browser dependency, so
choosing Unity or Godot later means porting pure functions and reusing the JSON
species data as-is. The SVG renderer is a stand-in for the real art, but it is
built the way §30.3 describes the 3D pipeline — one shared body, swappable
parts, pattern masks over a palette — so what the prototype proves about
inheritance carries over.

### What is and is not modelled

Built: trait slots and alleles, the four expression modes, mutation, stat
potential and the §17.5 tradeoffs, personality axes and quirks, pairing rules,
relatedness, the offspring forecast, family trees, ranch days, life stages.

Not built: ranch jobs, needs decay, competitions, the economy, breed
registration, automation, story. The prototype answers one question — whether
inherited traits read on screen — and stops there.

### Where to start

- **New to the project** — read sections 1–3 (High Concept, Player Fantasy, Core
  Design Pillars) and section 45 (Final Vision).
- **Building the first slice** — see section 39 (Vertical Slice Scope),
  section 40 (Vertical Slice Art Requirements), and section 42 (Development
  Milestones).
- **Working on systems** — sections 16–18 cover breeding, genetics, and
  player-created breeds, the mechanical heart of the game.
- **Before proposing a feature** — check section 44 (Features Deliberately
  Excluded) and section 43 (Design Success Criteria).

## Design constraints worth knowing up front

These recur throughout the bible and constrain most feature work:

- **The ranch is the interface.** 70–80% of ordinary playtime should happen on
  the ranch screen, not in menus.
- **Every monster has value.** No monster is made worthless by a poor battle
  stat roll.
- **Competition is optional.** Every essential progression path has a noncombat
  route.
- **The game respects the player's time.** No permanent death, no mandatory
  energy systems, no punishing streaks, no real-time timers demanding midnight
  check-ins.
- **Cosmetic-first monetization.** Premium currency never buys stats, mutation
  odds, offspring quality, or arena outcomes.

## Versioning

The game bible is versioned in its header. Substantive design changes should
bump that version and land as their own commit so the reasoning stays traceable
in history.
