/**
 * Creating monsters — founders and offspring (§37.2).
 */

import type {
  Genotype,
  LifeStage,
  Monster,
  Needs,
  SpeciesDef,
  StatBlock,
} from './types.js';
import { STAT_IDS } from './types.js';
import {
  deriveStatPotential,
  expressGenotype,
  inheritGenotype,
  rollFounderGenotype,
  rngForSeed,
} from './genetics.js';
import type { ExpressionContext, MutationContext } from './genetics.js';
import { inheritPersonality, personalityTags, rollPersonality, rollQuirks } from './personality.js';
import { createRng } from './rng.js';

/**
 * How much of a monster's inherited potential is already developed at creation
 * (§12: potential is inherited, trained values come from ranch activity).
 * A rescued adult has had a working life; a hatchling has not.
 */
const REALISED_POTENTIAL: Record<LifeStage, number> = {
  hatchling: 0.2,
  juvenile: 0.4,
  adult: 0.62,
  veteran: 0.78,
};

function trainedFromPotential(potential: StatBlock, lifeStage: LifeStage): StatBlock {
  const ratio = REALISED_POTENTIAL[lifeStage];
  const trained = {} as StatBlock;
  for (const statId of STAT_IDS) {
    trained[statId] = Math.max(1, Math.round(potential[statId] * ratio));
  }
  return trained;
}

const NAME_HEADS = [
  'Moss', 'Bram', 'Fern', 'Thistle', 'Clover', 'Hazel', 'Pip', 'Sorrel',
  'Bracken', 'Juniper', 'Rowan', 'Amber', 'Willow', 'Nettle', 'Barley', 'Poppy',
];
const NAME_TAILS = ['bell', 'wick', 'down', 'field', 'burr', 'step', 'song', 'root'];

export function generateName(seed: string): string {
  const rng = createRng(`${seed}:name`);
  return `${rng.pick(NAME_HEADS)}${rng.pick(NAME_TAILS)}`;
}

const HEALTHY_NEEDS: Needs = { fed: 85, rested: 85, content: 80 };

export interface CreateFounderOptions {
  id: string;
  /** Drives every deterministic decision about this monster (§37.2). */
  seed: string;
  name?: string;
  lifeStage?: LifeStage;
  birthDay?: number;
  /** Habitat the monster is being raised in, for environmental traits (§17.2). */
  habitat?: string;
  needs?: Needs;
  /**
   * Use this exact genotype instead of rolling one. Needed for restoring a
   * saved monster, for story-scripted monsters, and for tests that have to
   * construct a precise lineage.
   */
  genotype?: Genotype;
}

/**
 * A founder: rescued or wild-caught stock with no recorded parents. Founders
 * never carry mutations — those have to arise on the player's ranch (§17.3).
 */
export function createFounder(species: SpeciesDef, options: CreateFounderOptions): Monster {
  const { id, seed } = options;
  const lifeStage = options.lifeStage ?? 'adult';

  const genotype = options.genotype ?? rollFounderGenotype(species, rngForSeed(seed, 'genotype'));
  const context: ExpressionContext = options.habitat !== undefined ? { habitat: options.habitat } : {};
  const phenotype = expressGenotype(species, genotype, context);
  const statPotential = deriveStatPotential(species, phenotype, rngForSeed(seed, 'stats'));
  const personality = rollPersonality(rngForSeed(seed, 'personality'));

  return {
    id,
    name: options.name ?? generateName(seed),
    speciesId: species.id,
    lifeStage,
    birthDay: options.birthDay ?? 0,
    parentIds: null,
    genotype,
    statPotential,
    statsTrained: trainedFromPotential(statPotential, lifeStage),
    personality,
    personalityTags: personalityTags(personality),
    quirks: rollQuirks(rngForSeed(seed, 'quirks')),
    bond: 0,
    needs: options.needs ?? { ...HEALTHY_NEEDS },
    relationships: {},
    acquiredTraits: [],
    appearanceSeed: seed,
    mutationHistory: [],
    registeredBreedId: null,
  };
}

export interface CreateOffspringOptions {
  id: string;
  seed: string;
  name?: string;
  birthDay?: number;
  habitat?: string;
  mutation?: MutationContext;
}

/**
 * Produce a hatchling from two parents.
 *
 * Callers should gate this on `canPair` (§16.1); this function assumes the
 * pairing was already judged legal so that tests can construct lineages freely.
 */
export function createOffspring(
  species: SpeciesDef,
  parentA: Monster,
  parentB: Monster,
  options: CreateOffspringOptions,
): Monster {
  const { id, seed } = options;

  const genotype = inheritGenotype(
    species,
    parentA.genotype,
    parentB.genotype,
    rngForSeed(seed, 'genotype'),
    options.mutation ?? {},
  );

  const context: ExpressionContext = options.habitat !== undefined ? { habitat: options.habitat } : {};
  const phenotype = expressGenotype(species, genotype, context);
  const statPotential = deriveStatPotential(species, phenotype, rngForSeed(seed, 'stats'));
  const personality = inheritPersonality(
    parentA.personality,
    parentB.personality,
    rngForSeed(seed, 'personality'),
  );

  const mutationHistory = Object.values(phenotype)
    .filter((trait) => trait.isMutation)
    .map((trait) => trait.slotId);

  return {
    id,
    name: options.name ?? generateName(seed),
    speciesId: species.id,
    lifeStage: 'hatchling',
    birthDay: options.birthDay ?? 0,
    parentIds: [parentA.id, parentB.id] as const,
    genotype,
    statPotential,
    statsTrained: trainedFromPotential(statPotential, 'hatchling'),
    personality,
    personalityTags: personalityTags(personality),
    quirks: rollQuirks(rngForSeed(seed, 'quirks')),
    bond: 0,
    needs: { ...HEALTHY_NEEDS },
    // Offspring start out family with both parents (§14.3).
    relationships: { [parentA.id]: 'family', [parentB.id]: 'family' },
    acquiredTraits: [],
    appearanceSeed: seed,
    mutationHistory,
    registeredBreedId: null,
  };
}

/** Re-express an existing monster, e.g. after moving it to another habitat. */
export function renderMonster(
  species: SpeciesDef,
  monster: Monster,
  habitat?: string,
): { monster: Monster; phenotype: ReturnType<typeof expressGenotype> } {
  const context: ExpressionContext = habitat !== undefined ? { habitat } : {};
  return { monster, phenotype: expressGenotype(species, monster.genotype, context) };
}

/** Advance a monster to the next life stage (§10), developing its potential. */
export function advanceLifeStage(monster: Monster): Monster {
  const order: LifeStage[] = ['hatchling', 'juvenile', 'adult', 'veteran'];
  const index = order.indexOf(monster.lifeStage);
  if (index === -1 || index === order.length - 1) return monster;
  const next = order[index + 1]!;
  return {
    ...monster,
    lifeStage: next,
    statsTrained: trainedFromPotential(monster.statPotential, next),
  };
}

export type { Genotype };
