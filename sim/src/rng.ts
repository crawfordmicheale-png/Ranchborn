/**
 * Deterministic pseudo-random number generation.
 *
 * Every random decision in the simulation flows through here so that a monster's
 * appearance seed (game bible §37.2) fully reproduces its appearance. Given the
 * same parents and the same seed, breeding must always yield the same child —
 * that property is what lets the breeding forecast (§16.3) be trustworthy and
 * what makes the test suite meaningful.
 *
 * Math.random() is never used anywhere in sim/.
 */

/** A seeded random source. Calling it advances the stream. */
export interface Rng {
  /** Next float in [0, 1). */
  next(): number;
  /** Next integer in [0, max). */
  nextInt(max: number): number;
  /** Uniform choice from a non-empty array. */
  pick<T>(items: readonly T[]): T;
  /** Weighted choice. Weights must be non-negative and not all zero. */
  pickWeighted<T>(items: readonly T[], weightOf: (item: T) => number): T;
  /** True with the given probability. */
  chance(probability: number): boolean;
  /** A fresh independent stream, derived deterministically from this one. */
  fork(label: string): Rng;
}

/**
 * mulberry32 — small, fast, and good enough for trait selection. Chosen for
 * being trivially portable: the whole algorithm is four lines of integer math,
 * so a future C#/GDScript port produces identical streams from identical seeds.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * FNV-1a. Turns an arbitrary string into a 32-bit seed so that seeds can be
 * human-readable ("bramblehorn-founder-3") rather than opaque numbers.
 */
export function hashSeed(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function createRng(seed: number | string): Rng {
  const numericSeed = typeof seed === 'string' ? hashSeed(seed) : seed >>> 0;
  const next = mulberry32(numericSeed);

  const rng: Rng = {
    next,

    nextInt(max: number): number {
      if (max <= 0) throw new RangeError(`nextInt requires max > 0, got ${max}`);
      return Math.floor(next() * max);
    },

    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new RangeError('pick requires a non-empty array');
      // Length is checked above, so the index is always in range.
      return items[rng.nextInt(items.length)]!;
    },

    pickWeighted<T>(items: readonly T[], weightOf: (item: T) => number): T {
      if (items.length === 0) throw new RangeError('pickWeighted requires a non-empty array');
      let total = 0;
      for (const item of items) {
        const weight = weightOf(item);
        if (weight < 0) throw new RangeError(`weights must be non-negative, got ${weight}`);
        total += weight;
      }
      if (total <= 0) throw new RangeError('pickWeighted requires at least one positive weight');

      let roll = next() * total;
      for (const item of items) {
        roll -= weightOf(item);
        if (roll < 0) return item;
      }
      // Floating-point drift only; the last positive-weight item is the answer.
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i]!;
        if (weightOf(item) > 0) return item;
      }
      throw new Error('unreachable: no positive weight found after validation');
    },

    chance(probability: number): boolean {
      return next() < probability;
    },

    fork(label: string): Rng {
      // Mixing the label into the current seed keeps sub-streams independent:
      // drawing colours must not shift which horns a sibling inherits.
      return createRng(hashSeed(`${numericSeed}:${label}`));
    },
  };

  return rng;
}
