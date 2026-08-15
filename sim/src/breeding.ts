/**
 * Pairing rules and the offspring forecast (§16).
 */

import type {
  AlleleId,
  Monster,
  PersonalityAxes,
  SlotId,
  SpeciesDef,
  StatBlock,
  TraitSlot,
} from './types.js';
import { PAIRABLE_RELATIONSHIPS, STAT_IDS } from './types.js';
import { expressSlot, findAllele } from './genetics.js';
import type { ExpressionContext, MutationContext } from './genetics.js';
import { personalityTags } from './personality.js';
import { checkRelatedness } from './lineage.js';
import type { MonsterLookup } from './lineage.js';

/** Below this, a monster is too tired to pair (§16.1). */
export const RESTED_THRESHOLD = 50;

// ---------------------------------------------------------------------------
// Pairing eligibility
// ---------------------------------------------------------------------------

export interface PairCheckOptions {
  lookup: MonsterLookup;
  /** Free nursery slots. Pairing needs at least one (§16.1). */
  nurserySpace?: number;
}

export interface PairCheck {
  allowed: boolean;
  /** Every unmet requirement, so the UI can show all of them at once. */
  blockers: string[];
  /** 0–1. Affects pairing speed and how predictable the result is (§16.1). */
  compatibility: number;
}

function relationshipScore(monster: Monster, otherId: string): number {
  const state = monster.relationships[otherId] ?? 'unfamiliar';
  switch (state) {
    case 'bonded':
      return 0.95;
    case 'protective':
      return 0.85;
    case 'mentor':
      return 0.75;
    case 'friendly':
      return 0.7;
    case 'family':
      return 0.6;
    case 'comfortable':
      return 0.5;
    case 'rival':
      return 0.1;
    case 'unfamiliar':
      return 0.0;
  }
}

/**
 * How well two monsters suit each other.
 *
 * Weighted mostly on their relationship, with a nudge from temperament
 * similarity. Note this only ever affects speed, predictability, and
 * temperament outcomes — a low score never blocks a reasonable pairing (§16.1).
 */
export function compatibilityOf(a: Monster, b: Monster): number {
  const relationship = (relationshipScore(a, b.id) + relationshipScore(b, a.id)) / 2;

  const axes: (keyof PersonalityAxes)[] = ['socialIndependent', 'calmIntense', 'cautiousCurious'];
  const distance =
    axes.reduce((total, axis) => total + Math.abs(a.personality[axis] - b.personality[axis]), 0) /
    axes.length;
  // distance runs 0–2; halve it to get a 0–1 dissimilarity.
  const temperament = 1 - distance / 2;

  return Number((relationship * 0.65 + temperament * 0.35).toFixed(3));
}

/** Check every §16.1 requirement, reporting all failures rather than the first. */
export function canPair(a: Monster, b: Monster, options: PairCheckOptions): PairCheck {
  const blockers: string[] = [];

  if (a.speciesId !== b.speciesId) {
    blockers.push('Monsters must be the same species');
  }

  for (const monster of [a, b]) {
    if (monster.lifeStage !== 'adult') {
      blockers.push(`${monster.name} is not an adult`);
    }
    if (monster.needs.rested < RESTED_THRESHOLD) {
      blockers.push(`${monster.name} is too tired`);
    }
  }

  const relatedness = checkRelatedness(a, b, options.lookup);
  if (relatedness.closeRelatives) {
    blockers.push(relatedness.reason ?? 'Too closely related');
  }

  const relationshipA = a.relationships[b.id] ?? 'unfamiliar';
  const relationshipB = b.relationships[a.id] ?? 'unfamiliar';
  if (
    !PAIRABLE_RELATIONSHIPS.includes(relationshipA) ||
    !PAIRABLE_RELATIONSHIPS.includes(relationshipB)
  ) {
    blockers.push('Their relationship must be Comfortable or better');
  }

  const nurserySpace = options.nurserySpace ?? 1;
  if (nurserySpace < 1) {
    blockers.push('No nursery space available');
  }

  return {
    allowed: blockers.length === 0,
    blockers,
    compatibility: compatibilityOf(a, b),
  };
}

// ---------------------------------------------------------------------------
// Offspring forecast (§16.3, §16.4)
// ---------------------------------------------------------------------------

export interface TraitOutcome {
  /** Renderer payload — a part id, or a blended hex colour. */
  value: string;
  label: string;
  probability: number;
  isMutation: boolean;
}

export interface SlotForecast {
  slotId: SlotId;
  label: string;
  /** Possible results, most likely first. */
  outcomes: TraitOutcome[];
}

export interface PairingForecast {
  slots: SlotForecast[];
  compatibility: number;
  /** Expected temperament midpoint, before drift. */
  temperamentTendency: PersonalityAxes;
  likelyTags: string[];
  /** Expected stat potential, averaged over every possible outcome. */
  expectedStats: StatBlock;
  /**
   * Mutation alleles either parent already carries. These are heritable like
   * anything else, so a forecast that hid them would mislead a breeder (§16.4).
   */
  carriedMutations: string[];
}

/**
 * Probability of each allele a parent can pass for one slot.
 *
 * Mirrors `inheritGenotype` exactly: normally one of the parent's two alleles
 * at even odds, but a mutation roll replaces it outright. Keeping these two
 * functions in step is what makes the forecast trustworthy rather than
 * decorative — the tests assert they agree.
 */
function alleleDistribution(
  slot: TraitSlot,
  pair: readonly [AlleleId, AlleleId],
  mutationChance: number,
): Map<AlleleId, number> {
  const mutations = slot.alleles.filter((allele) => allele.mutation === true);
  const effectiveChance = mutations.length > 0 ? mutationChance : 0;
  const distribution = new Map<AlleleId, number>();

  const add = (alleleId: AlleleId, probability: number): void => {
    distribution.set(alleleId, (distribution.get(alleleId) ?? 0) + probability);
  };

  for (const alleleId of pair) add(alleleId, (1 - effectiveChance) / 2);
  for (const mutant of mutations) add(mutant.id, effectiveChance / mutations.length);

  return distribution;
}

export function forecastPairing(
  species: SpeciesDef,
  parentA: Monster,
  parentB: Monster,
  options: { context?: ExpressionContext; mutation?: MutationContext } = {},
): PairingForecast {
  const context = options.context ?? {};
  const mutation = options.mutation ?? {};
  const mutationChance =
    species.mutationRate *
    (mutation.habitatMultiplier ?? 1) *
    (mutation.feedMultiplier ?? 1) *
    (mutation.lineageMultiplier ?? 1);

  const slots: SlotForecast[] = [];
  const expectedStats = { ...species.baseStats };
  const carriedMutations = new Set<string>();

  for (const slot of species.slots) {
    const pairA = parentA.genotype[slot.id];
    const pairB = parentB.genotype[slot.id];
    if (!pairA || !pairB) throw new Error(`both parents need trait slot "${slot.id}"`);

    for (const alleleId of [...pairA, ...pairB]) {
      const allele = findAllele(slot, alleleId);
      if (allele.mutation === true) carriedMutations.add(allele.label);
    }

    const distA = alleleDistribution(slot, pairA, mutationChance);
    const distB = alleleDistribution(slot, pairB, mutationChance);

    // Every combination of one allele from each side, weighted by its odds.
    const tally = new Map<string, TraitOutcome>();
    for (const [alleleA, probA] of distA) {
      for (const [alleleB, probB] of distB) {
        const probability = probA * probB;
        if (probability <= 0) continue;

        const expressed = expressSlot(slot, [alleleA, alleleB] as const, context);
        const existing = tally.get(expressed.value);
        if (existing) {
          existing.probability += probability;
        } else {
          tally.set(expressed.value, {
            value: expressed.value,
            label: expressed.alleleIds.map((id) => findAllele(slot, id).label).join(' + '),
            probability,
            isMutation: expressed.isMutation,
          });
        }

        // Expected stat contribution from whatever ends up expressed.
        for (const alleleId of expressed.alleleIds) {
          const mods = findAllele(slot, alleleId).statMods;
          if (!mods) continue;
          for (const statId of STAT_IDS) {
            const delta = mods[statId];
            if (delta !== undefined) expectedStats[statId] += delta * probability;
          }
        }
      }
    }

    const outcomes = [...tally.values()]
      .map((outcome) => ({ ...outcome, probability: Number(outcome.probability.toFixed(4)) }))
      .sort((left, right) => right.probability - left.probability);

    slots.push({ slotId: slot.id, label: slot.label, outcomes });
  }

  for (const statId of STAT_IDS) {
    expectedStats[statId] = Math.round(expectedStats[statId]);
  }

  const temperamentTendency: PersonalityAxes = {
    socialIndependent: Number(
      ((parentA.personality.socialIndependent + parentB.personality.socialIndependent) / 2).toFixed(3),
    ),
    calmIntense: Number(
      ((parentA.personality.calmIntense + parentB.personality.calmIntense) / 2).toFixed(3),
    ),
    cautiousCurious: Number(
      ((parentA.personality.cautiousCurious + parentB.personality.cautiousCurious) / 2).toFixed(3),
    ),
  };

  return {
    slots,
    compatibility: compatibilityOf(parentA, parentB),
    temperamentTendency,
    likelyTags: personalityTags(temperamentTendency),
    expectedStats,
    carriedMutations: [...carriedMutations],
  };
}
