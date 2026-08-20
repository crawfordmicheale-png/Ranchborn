/**
 * Player-created breeds (§18).
 *
 * The flow mirrors how a real registry works, and it is the reverse of what you
 * might expect: you do not hand the registry a group of animals and ask what
 * they have in common. You write a **standard**, and then whichever monsters
 * meet it are the breed. That is what makes a breed something a player authors
 * rather than something the game notices on their behalf.
 *
 *   1. Pick an exemplar — the monster that best embodies the intent.
 *   2. `proposeStandard` reads four hallmark traits off it, favouring the
 *      distinctive ones, plus a temperament.
 *   3. `qualifyingMembers` finds every monster that meets that standard.
 *   4. `evaluateBreed` checks that group against the §18.1 requirements.
 *   5. `registerBreed` writes the standard once it is eligible.
 *
 * Registration deliberately grants no stat bonus (§18.3). Its rewards are
 * identity, predictability, and prestige.
 */

import type {
  Monster,
  Phenotype,
  SlotId,
  SpeciesDef,
  StatBlock,
  StatId,
} from './types.js';
import { STAT_IDS } from './types.js';
import { checkRelatedness } from './lineage.js';
import type { MonsterLookup } from './lineage.js';

/** How the caller resolves a monster's visible traits. */
export type PhenotypeLookup = (monster: Monster) => Phenotype;

/** §18.4 recognition levels. */
export type BreedRank = 'emerging' | 'recognized' | 'heritage';

/** One hallmark: a slot, and the value a qualifying monster must express. */
export interface Hallmark {
  slotId: SlotId;
  /** Expressed value, not an allele id — what you can actually see. */
  value: string;
  label: string;
}

export interface BreedStandard {
  id: string;
  name: string;
  speciesId: string;
  crest: string;
  founderIds: string[];
  /** Exactly four, per §18.2. */
  hallmarks: Hallmark[];
  temperament: string;
  primarySpecialty: string;
  secondarySpecialty: string;
  description: string;
  registeredOnDay: number;
}

export interface RegisteredBreed extends BreedStandard {
  rank: BreedRank;
  memberIds: string[];
}

/** Hallmark count required by §18.2. */
export const HALLMARK_COUNT = 4;

/**
 * Work tendencies, derived from whichever stat leads (§3.2 — a monster's value
 * is rarely combat). Paired with personality tags to give §18.1 its "behavioural,
 * work, or competition tendencies".
 */
const SPECIALTY_BY_STAT: Record<StatId, string> = {
  might: 'Hauling',
  agility: 'Racing',
  focus: 'Crafting',
  heart: 'Nursery care',
  instinct: 'Gathering',
};

export function leadingStat(stats: StatBlock): StatId {
  return STAT_IDS.reduce((best, stat) => (stats[stat] > stats[best] ? stat : best), STAT_IDS[0]);
}

export function specialtyOf(monster: Monster): string {
  return SPECIALTY_BY_STAT[leadingStat(monster.statPotential)];
}

/** Primary and secondary specialty, from the two leading stats (§18.2). */
export function specialtiesOf(monster: Monster): [string, string] {
  const stats = monster.statPotential;
  const ranked = [...STAT_IDS].sort((a, b) => stats[b] - stats[a]);
  return [SPECIALTY_BY_STAT[ranked[0]!], SPECIALTY_BY_STAT[ranked[1]!]];
}

/**
 * Everything a monster contributes to its breed's tendencies.
 *
 * Both specialties count, not just the leading one. A breed is defined first by
 * what it is *for* — §18.2 records a primary and a secondary specialty — and
 * those come from inherited stat potential, so a line breeding true for its
 * traits breeds true for its aptitudes too. Temperament is included as well,
 * but it drifts each generation and cannot carry the requirement alone.
 */
export function tendenciesOf(monster: Monster): string[] {
  return [...monster.personalityTags, ...specialtiesOf(monster)];
}

// ---------------------------------------------------------------------------
// Generations and founders
// ---------------------------------------------------------------------------

/** Founders are generation 0; every offspring is one deeper than its parents. */
export function generationOf(monster: Monster, lookup: MonsterLookup, seen = new Set<string>()): number {
  if (!monster.parentIds || seen.has(monster.id)) return 0;
  seen.add(monster.id);
  const depths = monster.parentIds
    .map((id) => lookup(id))
    .filter((parent): parent is Monster => parent !== undefined)
    .map((parent) => generationOf(parent, lookup, seen));
  return depths.length === 0 ? 0 : 1 + Math.max(...depths);
}

/** Distinct founding stock behind a set of monsters — the "founder branches". */
export function founderIdsBehind(monsters: Monster[], lookup: MonsterLookup): string[] {
  const founders = new Set<string>();
  const visited = new Set<string>();

  const walk = (monster: Monster): void => {
    if (visited.has(monster.id)) return;
    visited.add(monster.id);
    if (!monster.parentIds) {
      founders.add(monster.id);
      return;
    }
    for (const id of monster.parentIds) {
      const parent = lookup(id);
      if (parent) walk(parent);
    }
  };

  for (const monster of monsters) walk(monster);
  return [...founders];
}

// ---------------------------------------------------------------------------
// Proposing a standard
// ---------------------------------------------------------------------------

/**
 * How rare a slot value is, judged by the founder weights that can produce it.
 * Used to prefer distinctive hallmarks: a breed defined by "Plain coat, Standard
 * build" is not a breed anybody would recognise.
 */
function valueRarity(species: SpeciesDef, slotId: SlotId, value: string): number {
  const slot = species.slots.find((candidate) => candidate.id === slotId);
  if (!slot) return 1;
  const total = slot.alleles.reduce((sum, allele) => sum + allele.weight, 0) || 1;
  const matching = slot.alleles
    .filter((allele) => (allele.value ?? allele.id) === value || value.includes(allele.value ?? allele.id))
    .reduce((sum, allele) => sum + allele.weight, 0);
  return matching / total;
}

export interface ProposedStandard {
  hallmarks: Hallmark[];
  temperament: string;
  primarySpecialty: string;
  secondarySpecialty: string;
}

/**
 * Read a candidate standard off one exemplar monster.
 *
 * Blended slots are excluded: a breed defined by an exact averaged colour would
 * be unreachable, since blending two parents rarely lands on the same hex twice.
 * Structural traits are what a breed is actually recognised by.
 */
export function proposeStandard(
  species: SpeciesDef,
  exemplar: Monster,
  phenotypeOf: PhenotypeLookup,
): ProposedStandard {
  const phenotype = phenotypeOf(exemplar);

  const candidates = species.slots
    .filter((slot) => slot.expression !== 'blended')
    .map((slot) => phenotype[slot.id])
    .filter((trait): trait is NonNullable<typeof trait> => trait !== undefined)
    .map((trait) => {
      const slot = species.slots.find((candidate) => candidate.id === trait.slotId)!;
      const label = trait.alleleIds
        .map((id) => slot.alleles.find((allele) => allele.id === id)?.label ?? id)
        .join(' + ');
      return {
        hallmark: { slotId: trait.slotId, value: trait.value, label },
        rarity: valueRarity(species, trait.slotId, trait.value),
      };
    })
    // Rarest first — the traits that actually distinguish this line.
    .sort((a, b) => a.rarity - b.rarity);

  const hallmarks = candidates.slice(0, HALLMARK_COUNT).map((candidate) => candidate.hallmark);

  const stats = exemplar.statPotential;
  const ranked = [...STAT_IDS].sort((a, b) => stats[b] - stats[a]);

  return {
    hallmarks,
    temperament: exemplar.personalityTags[0] ?? 'Even-tempered',
    primarySpecialty: SPECIALTY_BY_STAT[ranked[0]!],
    secondarySpecialty: SPECIALTY_BY_STAT[ranked[1]!],
  };
}

// ---------------------------------------------------------------------------
// Qualifying members
// ---------------------------------------------------------------------------

/** Does this monster meet every hallmark of the standard? */
export function meetsStandard(
  monster: Monster,
  speciesId: string,
  hallmarks: Hallmark[],
  phenotypeOf: PhenotypeLookup,
): boolean {
  if (monster.speciesId !== speciesId) return false;
  const phenotype = phenotypeOf(monster);
  return hallmarks.every((hallmark) => phenotype[hallmark.slotId]?.value === hallmark.value);
}

export function qualifyingMembers(
  speciesId: string,
  hallmarks: Hallmark[],
  roster: Monster[],
  phenotypeOf: PhenotypeLookup,
): Monster[] {
  return roster.filter((monster) => meetsStandard(monster, speciesId, hallmarks, phenotypeOf));
}

// ---------------------------------------------------------------------------
// Evaluation against §18.1
// ---------------------------------------------------------------------------

export const MIN_GENERATIONS = 3;
export const MIN_MEMBERS = 6;
export const MIN_FOUNDER_BRANCHES = 2;
export const MIN_TENDENCIES = 2;

/**
 * Share of members that must show a tendency for it to count as the breed's.
 *
 * Not 100%. Requiring every single member to share a trait punishes success:
 * temperament drifts a little each generation (§16.1), so the intersection
 * across a large family empties out, and a thriving twenty-strong line would be
 * harder to register than a struggling six-strong one. Real breed standards
 * describe typical temperament rather than a property no individual may lack,
 * and this follows them.
 */
export const TENDENCY_CONSISTENCY = 0.7;

export interface BreedRequirement {
  id: string;
  label: string;
  met: boolean;
  /** Progress wording for the UI, e.g. "4 of 6". */
  detail: string;
}

export interface BreedEvaluation {
  eligible: boolean;
  requirements: BreedRequirement[];
  members: Monster[];
  generations: number;
  founderIds: string[];
  /** Tendencies every qualifying monster shares. */
  consistentTendencies: string[];
}

/**
 * Check a candidate group against every §18.1 requirement.
 *
 * Reports all of them, met or not, so the registry screen can show a checklist
 * a player can work towards rather than a single blunt refusal.
 */
export function evaluateBreed(
  hallmarks: Hallmark[],
  members: Monster[],
  lookup: MonsterLookup,
): BreedEvaluation {
  const generations =
    members.length === 0 ? 0 : Math.max(...members.map((m) => generationOf(m, lookup))) + 1;
  const founderIds = founderIdsBehind(members, lookup);

  // Tendencies shown by a strong majority of members — the breed's character,
  // not a property every last individual must have.
  const tendencyCounts = new Map<string, number>();
  for (const member of members) {
    for (const tendency of new Set(tendenciesOf(member))) {
      tendencyCounts.set(tendency, (tendencyCounts.get(tendency) ?? 0) + 1);
    }
  }
  const threshold = members.length * TENDENCY_CONSISTENCY;
  const consistentTendencies = [...tendencyCounts.entries()]
    .filter(([, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1])
    .map(([tendency]) => tendency);

  // No member may be the product of a close-relative pairing.
  const closePairings = members.filter((member) => {
    if (!member.parentIds) return false;
    const [a, b] = member.parentIds.map((id) => lookup(id));
    if (!a || !b) return false;
    return checkRelatedness(a, b, lookup).closeRelatives;
  });

  const requirements: BreedRequirement[] = [
    {
      id: 'generations',
      label: `At least ${MIN_GENERATIONS} generations`,
      met: generations >= MIN_GENERATIONS,
      detail: `${generations} of ${MIN_GENERATIONS}`,
    },
    {
      id: 'members',
      label: `At least ${MIN_MEMBERS} qualifying monsters`,
      met: members.length >= MIN_MEMBERS,
      detail: `${members.length} of ${MIN_MEMBERS}`,
    },
    {
      id: 'founders',
      label: `At least ${MIN_FOUNDER_BRANCHES} founder branches`,
      met: founderIds.length >= MIN_FOUNDER_BRANCHES,
      detail: `${founderIds.length} of ${MIN_FOUNDER_BRANCHES}`,
    },
    {
      id: 'hallmarks',
      label: `${HALLMARK_COUNT} consistent visual traits`,
      met: hallmarks.length >= HALLMARK_COUNT,
      detail: `${hallmarks.length} of ${HALLMARK_COUNT}`,
    },
    {
      id: 'tendencies',
      label: `${MIN_TENDENCIES} consistent tendencies`,
      met: consistentTendencies.length >= MIN_TENDENCIES,
      // Listing every shared tendency swamps the row; the count is the
      // requirement, the first few are the flavour.
      detail:
        consistentTendencies.length > 0
          ? consistentTendencies.slice(0, 2).join(', ') +
            (consistentTendencies.length > 2 ? ` +${consistentTendencies.length - 2}` : '')
          : `0 of ${MIN_TENDENCIES}`,
    },
    {
      id: 'no-close-pairing',
      label: 'No close-relative pairing in the lineage',
      met: closePairings.length === 0,
      detail:
        closePairings.length === 0
          ? 'Clear'
          : `${closePairings.length} affected`,
    },
  ];

  return {
    eligible: requirements.every((requirement) => requirement.met),
    requirements,
    members,
    generations,
    founderIds,
    consistentTendencies,
  };
}

// ---------------------------------------------------------------------------
// Registration and ranking
// ---------------------------------------------------------------------------

/** §18.4 thresholds. Tunable — these are a first pass, not a balance decision. */
export const RANK_THRESHOLDS = {
  recognized: { members: 9, generations: 4 },
  heritage: { members: 12, generations: 5 },
} as const;

export function breedRank(members: number, generations: number): BreedRank {
  const { recognized, heritage } = RANK_THRESHOLDS;
  if (members >= heritage.members && generations >= heritage.generations) return 'heritage';
  if (members >= recognized.members && generations >= recognized.generations) return 'recognized';
  return 'emerging';
}

export interface RegisterBreedOptions {
  id: string;
  name: string;
  crest: string;
  description?: string;
  ranchDay: number;
}

/**
 * Write the standard.
 *
 * Throws if the group is not eligible — callers show `evaluateBreed`'s
 * checklist first, so reaching here with an ineligible group is a bug rather
 * than a player mistake.
 */
export function registerBreed(
  species: SpeciesDef,
  proposal: ProposedStandard,
  evaluation: BreedEvaluation,
  options: RegisterBreedOptions,
): RegisteredBreed {
  if (!evaluation.eligible) {
    const unmet = evaluation.requirements.filter((r) => !r.met).map((r) => r.label);
    throw new Error(`breed is not eligible for registration: ${unmet.join('; ')}`);
  }

  return {
    id: options.id,
    name: options.name,
    speciesId: species.id,
    crest: options.crest,
    founderIds: evaluation.founderIds,
    hallmarks: proposal.hallmarks,
    temperament: proposal.temperament,
    primarySpecialty: proposal.primarySpecialty,
    secondarySpecialty: proposal.secondarySpecialty,
    description: options.description ?? '',
    registeredOnDay: options.ranchDay,
    rank: breedRank(evaluation.members.length, evaluation.generations),
    memberIds: evaluation.members.map((member) => member.id),
  };
}

/**
 * Stamp the breed onto its qualifying members.
 *
 * Returns new records rather than mutating, and touches nothing but
 * `registeredBreedId` — registration confers identity, never stats (§18.3).
 */
export function applyBreedToMembers(breed: RegisteredBreed, members: Monster[]): Monster[] {
  const qualifying = new Set(breed.memberIds);
  return members.map((member) =>
    qualifying.has(member.id) ? { ...member, registeredBreedId: breed.id } : member,
  );
}
