# Ranchborn

> Raise them. Shape their lineage. Build a ranch that remembers.

A cozy monster-ranch simulation for iOS and Android. Players inherit a neglected
ranch, raise expressive creatures, develop distinctive bloodlines across
generations, and register breeds of their own creation.

Battling exists, but it is an optional activity rather than a progression gate.
A monster can be valuable as a worker, companion, show animal, explorer, parent,
mentor, racer, or fighter.

## Status

Pre-production. This repository currently holds design documentation only — no
engine or client code yet.

## Documentation

| Document | Contents |
|---|---|
| [Game Bible v0.1](docs/design/game-bible.md) | The complete design document: pillars, systems, species, genetics, art and audio direction, scope, and milestones. |

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
