/**
 * Temperament, tags, and quirks (§14).
 *
 * Personality is stored as three continuous axes and only turned into words at
 * the edges. That matters for the same reason the needs meters stay hidden
 * (§11.3): the player should meet "a stubborn one" rather than read a number.
 */

import type { PersonalityAxes } from './types.js';
import type { Rng } from './rng.js';

const clamp = (value: number, min = -1, max = 1): number => Math.min(max, Math.max(min, value));

/** Roll a founder's temperament. Founders spread across the whole range. */
export function rollPersonality(rng: Rng): PersonalityAxes {
  const axis = (): number => Number((rng.next() * 2 - 1).toFixed(3));
  return {
    socialIndependent: axis(),
    calmIntense: axis(),
    cautiousCurious: axis(),
  };
}

/**
 * Offspring temperament leans on the parents' average, with enough drift that a
 * pairing tends toward a temperament without ever guaranteeing it — "compatibility
 * affects temperament outcomes" (§16.1) rather than dictating them.
 */
export function inheritPersonality(
  parentA: PersonalityAxes,
  parentB: PersonalityAxes,
  rng: Rng,
  drift = 0.35,
): PersonalityAxes {
  const blend = (a: number, b: number): number => {
    const midpoint = (a + b) / 2;
    const jitter = (rng.next() * 2 - 1) * drift;
    return Number(clamp(midpoint + jitter).toFixed(3));
  };
  return {
    socialIndependent: blend(parentA.socialIndependent, parentB.socialIndependent),
    calmIntense: blend(parentA.calmIntense, parentB.calmIntense),
    cautiousCurious: blend(parentA.cautiousCurious, parentB.cautiousCurious),
  };
}

const STRONG = 0.4;

/**
 * Turn axes into the readable tags from §14.1. Single-axis tags come from any
 * axis that leans strongly; combination tags come from pairs of axes and are
 * what give a monster a personality rather than a stat line.
 */
export function personalityTags(axes: PersonalityAxes): string[] {
  const tags: string[] = [];
  const { socialIndependent: social, calmIntense: intensity, cautiousCurious: curiosity } = axes;

  if (social <= -STRONG) tags.push('Affectionate');
  if (social >= STRONG) tags.push('Reserved');
  if (intensity <= -STRONG) tags.push('Patient');
  if (intensity >= STRONG) tags.push('Competitive');
  if (curiosity <= -STRONG) tags.push('Timid');
  if (curiosity >= STRONG) tags.push('Adventurous');

  if (social <= -STRONG && intensity <= -STRONG) tags.push('Protective');
  if (social >= STRONG && intensity >= STRONG) tags.push('Stubborn');
  if (social <= -STRONG && curiosity >= STRONG) tags.push('Playful');
  if (social >= STRONG && curiosity >= STRONG) tags.push('Mischievous');

  // A monster sitting near the middle of every axis still deserves a word.
  if (tags.length === 0) tags.push('Even-tempered');

  return tags;
}

/**
 * Quirks (§14.2) are flavour, not penalties — they exist so players remember
 * individuals. Drawn from a flat list rather than derived from stats, because a
 * quirk that could be optimised for would stop being a quirk.
 */
export const QUIRKS: readonly string[] = [
  'Sleeps beside the orchard gate',
  'Hides toys in the barn',
  'Refuses blue fruit',
  'Follows one particular companion',
  'Loves thunderstorms',
  'Dislikes crowded pens',
  'Greets every visitor',
  'Protects hatchlings',
  'Stares into reflective water',
  'Tries to open gates',
  'Carries sticks everywhere',
  'Becomes excited near the arena',
];

/** Most monsters get one quirk; a few get two, and a few get none. */
export function rollQuirks(rng: Rng): string[] {
  const roll = rng.next();
  const count = roll < 0.2 ? 0 : roll < 0.85 ? 1 : 2;
  const chosen: string[] = [];
  const pool = [...QUIRKS];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = rng.nextInt(pool.length);
    chosen.push(pool[index]!);
    pool.splice(index, 1);
  }
  return chosen;
}
