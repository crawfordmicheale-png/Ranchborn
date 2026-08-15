/**
 * Inheritance and trait expression (§17).
 *
 * The model is deliberately "controlled trait slots" (§17.1) rather than free-
 * form gene soup: every species declares a fixed set of slots, each slot
 * declares its legal alleles, and a genotype is exactly one inherited pair per
 * slot. That is what keeps offspring from coming out malformed or unanimatable
 * while still leaving room for surprises.
 */

import type {
  Allele,
  AlleleId,
  ExpressedTrait,
  Genotype,
  Phenotype,
  SlotId,
  SpeciesDef,
  StatBlock,
  TraitSlot,
} from './types.js';
import { STAT_IDS } from './types.js';
import type { Rng } from './rng.js';
import { createRng } from './rng.js';

/** Conditions that can switch on an environmentally activated allele (§17.2). */
export interface ExpressionContext {
  /** Habitat the monster was raised in — the Ember Yard, the Wetlands, etc. */
  habitat?: string;
}

/** Modifiers on mutation likelihood (§17.3). */
export interface MutationContext {
  /** Habitat multiplier — Moonwood is the rare-mutation habitat (§7.7). */
  habitatMultiplier?: number;
  /** Special feed multiplier. */
  feedMultiplier?: number;
  /** Lineage multiplier: concentrated bloodlines surface mutations more often. */
  lineageMultiplier?: number;
}

export function findSlot(species: SpeciesDef, slotId: SlotId): TraitSlot {
  const slot = species.slots.find((candidate) => candidate.id === slotId);
  if (!slot) throw new Error(`species "${species.id}" has no trait slot "${slotId}"`);
  return slot;
}

export function findAllele(slot: TraitSlot, alleleId: AlleleId): Allele {
  const allele = slot.alleles.find((candidate) => candidate.id === alleleId);
  if (!allele) throw new Error(`trait slot "${slot.id}" has no allele "${alleleId}"`);
  return allele;
}

// ---------------------------------------------------------------------------
// Expression
// ---------------------------------------------------------------------------

/** Average two #rrggbb colours, for `blended` slots. */
export function blendHex(left: string, right: string): string {
  const parse = (hex: string): [number, number, number] => {
    const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!match) throw new Error(`blended slots need #rrggbb colours, got "${hex}"`);
    const value = Number.parseInt(match[1]!, 16);
    return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
  };
  const [r1, g1, b1] = parse(left);
  const [r2, g2, b2] = parse(right);
  const mix = (a: number, b: number): string =>
    Math.round((a + b) / 2)
      .toString(16)
      .padStart(2, '0');
  return `#${mix(r1, r2)}${mix(g1, g2)}${mix(b1, b2)}`;
}

/**
 * Resolve one slot's inherited pair into what is actually visible.
 *
 * Expression depends only on the genotype and the habitat — never on the RNG.
 * Two monsters carrying the same pair must look the same, which is precisely
 * what makes family resemblance legible to the player (§3.3).
 */
export function expressSlot(
  slot: TraitSlot,
  pair: readonly [AlleleId, AlleleId],
  context: ExpressionContext = {},
): ExpressedTrait {
  const left = findAllele(slot, pair[0]);
  const right = findAllele(slot, pair[1]);

  const base = { slotId: slot.id, label: slot.label };

  switch (slot.expression) {
    case 'dominant': {
      // Higher dominance wins; the loser stays in the lineage as a carrier.
      // Equal ranks tie-break on allele id so expression stays a pure function
      // of the genotype. A tie here means the data should probably have used
      // 'blended' or 'co-expressed' instead.
      let winner = left;
      let hidden = right;
      if (right.dominance > left.dominance) {
        winner = right;
        hidden = left;
      } else if (right.dominance === left.dominance && right.id < left.id) {
        winner = right;
        hidden = left;
      }
      const trait: ExpressedTrait = {
        ...base,
        alleleIds: [winner.id],
        value: winner.value ?? winner.id,
        isMutation: winner.mutation === true,
      };
      if (hidden.id !== winner.id) trait.carriedAlleleId = hidden.id;
      return trait;
    }

    case 'blended': {
      const value =
        left.id === right.id
          ? (left.value ?? left.id)
          : blendHex(left.value ?? '#ffffff', right.value ?? '#ffffff');
      return {
        ...base,
        alleleIds: left.id === right.id ? [left.id] : [left.id, right.id],
        value,
        isMutation: left.mutation === true || right.mutation === true,
      };
    }

    case 'co-expressed': {
      if (left.id === right.id) {
        return {
          ...base,
          alleleIds: [left.id],
          value: left.value ?? left.id,
          isMutation: left.mutation === true,
        };
      }
      // Sorted so the pair renders identically regardless of which parent
      // contributed which side.
      const [first, second] = [left, right].sort((a, b) => (a.id < b.id ? -1 : 1)) as [
        Allele,
        Allele,
      ];
      return {
        ...base,
        alleleIds: [first.id, second.id],
        value: `${first.value ?? first.id}+${second.value ?? second.id}`,
        isMutation: first.mutation === true || second.mutation === true,
      };
    }

    case 'environmental': {
      // An allele that only switches on in the habitat that earned it. The
      // monster still carries it everywhere else — this is how a bloodline can
      // look ordinary on one ranch and distinctive on another.
      const activated = [left, right].find(
        (allele) => allele.requiresHabitat !== undefined && allele.requiresHabitat === context.habitat,
      );
      if (activated) {
        const other = activated === left ? right : left;
        const trait: ExpressedTrait = {
          ...base,
          alleleIds: [activated.id],
          value: activated.value ?? activated.id,
          isMutation: activated.mutation === true,
        };
        if (other.id !== activated.id) trait.carriedAlleleId = other.id;
        return trait;
      }
      const inert = [left, right].find((allele) => allele.requiresHabitat === undefined) ?? left;
      const other = inert === left ? right : left;
      const trait: ExpressedTrait = {
        ...base,
        alleleIds: [inert.id],
        value: inert.value ?? inert.id,
        isMutation: false,
      };
      if (other.id !== inert.id) trait.carriedAlleleId = other.id;
      return trait;
    }
  }
}

export function expressGenotype(
  species: SpeciesDef,
  genotype: Genotype,
  context: ExpressionContext = {},
): Phenotype {
  const phenotype: Phenotype = {};
  for (const slot of species.slots) {
    const pair = genotype[slot.id];
    if (!pair) throw new Error(`genotype is missing trait slot "${slot.id}"`);
    phenotype[slot.id] = expressSlot(slot, pair, context);
  }
  return phenotype;
}

// ---------------------------------------------------------------------------
// Inheritance
// ---------------------------------------------------------------------------

function mutationAlleles(slot: TraitSlot): Allele[] {
  return slot.alleles.filter((allele) => allele.mutation === true);
}

function ordinaryAlleles(slot: TraitSlot): Allele[] {
  return slot.alleles.filter((allele) => allele.mutation !== true && allele.weight > 0);
}

/**
 * Roll a founder monster's genotype — the wild-caught or rescued stock a player
 * starts a bloodline from. Founders never spawn with mutations; a mutation has
 * to arise on the player's own ranch, which is what makes one worth keeping.
 */
export function rollFounderGenotype(species: SpeciesDef, rng: Rng): Genotype {
  const genotype: Record<SlotId, readonly [AlleleId, AlleleId]> = {};
  for (const slot of species.slots) {
    const pool = ordinaryAlleles(slot);
    if (pool.length === 0) throw new Error(`trait slot "${slot.id}" has no rollable alleles`);
    const left = rng.pickWeighted(pool, (allele) => allele.weight);
    const right = rng.pickWeighted(pool, (allele) => allele.weight);
    genotype[slot.id] = [left.id, right.id] as const;
  }
  return genotype;
}

/**
 * Produce a child genotype from two parents.
 *
 * Each parent contributes one allele per slot, picked at random from its pair —
 * so a recessive a parent merely carries has a real chance of being passed on,
 * and can meet a matching copy from the other side and reappear generations
 * later. That is the mechanism behind "grandparent traits can reappear
 * unexpectedly, making family trees meaningful" (§17.2).
 */
export function inheritGenotype(
  species: SpeciesDef,
  parentA: Genotype,
  parentB: Genotype,
  rng: Rng,
  mutation: MutationContext = {},
): Genotype {
  const multiplier =
    (mutation.habitatMultiplier ?? 1) *
    (mutation.feedMultiplier ?? 1) *
    (mutation.lineageMultiplier ?? 1);
  const mutationChance = species.mutationRate * multiplier;

  const genotype: Record<SlotId, readonly [AlleleId, AlleleId]> = {};

  for (const slot of species.slots) {
    const pairA = parentA[slot.id];
    const pairB = parentB[slot.id];
    if (!pairA) throw new Error(`parent A genotype is missing trait slot "${slot.id}"`);
    if (!pairB) throw new Error(`parent B genotype is missing trait slot "${slot.id}"`);

    // Independent streams per slot and per side keep a mutation roll on the
    // horns from shifting which tail the child would otherwise have inherited.
    const slotRng = rng.fork(slot.id);
    let fromA = pairA[slotRng.nextInt(2)]!;
    let fromB = pairB[slotRng.nextInt(2)]!;

    const mutations = mutationAlleles(slot);
    if (mutations.length > 0) {
      if (slotRng.chance(mutationChance)) fromA = slotRng.pick(mutations).id;
      if (slotRng.chance(mutationChance)) fromB = slotRng.pick(mutations).id;
    }

    genotype[slot.id] = [fromA, fromB] as const;
  }

  return genotype;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

/**
 * Derive inherited stat potential (§12) from species baseline plus the modifiers
 * carried by every expressed allele.
 *
 * Allele modifiers are where §17.5 lives: a heavy build raises Might and lowers
 * Agility in the same breath, so breeding produces specialists rather than a
 * strictly-better monster each generation.
 */
export function deriveStatPotential(
  species: SpeciesDef,
  phenotype: Phenotype,
  rng: Rng,
): StatBlock {
  const stats: StatBlock = { ...species.baseStats };

  for (const slot of species.slots) {
    const trait = phenotype[slot.id];
    if (!trait) continue;
    for (const alleleId of trait.alleleIds) {
      const mods = findAllele(slot, alleleId).statMods;
      if (!mods) continue;
      for (const statId of STAT_IDS) {
        const delta = mods[statId];
        if (delta !== undefined) stats[statId] += delta;
      }
    }
  }

  // A little individual spread so littermates are not carbon copies.
  const variance = species.statVariance;
  for (const statId of STAT_IDS) {
    const jitter = (rng.next() * 2 - 1) * variance;
    stats[statId] = Math.max(1, Math.round(stats[statId] + jitter));
  }

  return stats;
}

/** Convenience: a deterministic RNG derived from a monster's appearance seed. */
export function rngForSeed(appearanceSeed: string, purpose: string): Rng {
  return createRng(`${appearanceSeed}:${purpose}`);
}
