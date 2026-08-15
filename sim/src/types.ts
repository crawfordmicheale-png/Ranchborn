/**
 * Domain model for the Ranchborn simulation core.
 *
 * Everything here is plain data with no DOM or engine dependency, so the same
 * types describe a monster in the browser prototype today and in an engine
 * later. Section references point at docs/design/game-bible.md.
 */

// ---------------------------------------------------------------------------
// Stats and affinities
// ---------------------------------------------------------------------------

/** The five primary stats (§12). */
export const STAT_IDS = ['might', 'agility', 'focus', 'heart', 'instinct'] as const;
export type StatId = (typeof STAT_IDS)[number];

export type StatBlock = Record<StatId, number>;

/** Initial affinity families (§13). */
export const AFFINITY_IDS = ['bloom', 'ember', 'tide', 'stone', 'gale'] as const;
export type AffinityId = (typeof AFFINITY_IDS)[number];

/** Life stages (§10). */
export const LIFE_STAGES = ['hatchling', 'juvenile', 'adult', 'veteran'] as const;
export type LifeStage = (typeof LIFE_STAGES)[number];

// ---------------------------------------------------------------------------
// Genetics
// ---------------------------------------------------------------------------

export type SlotId = string;
export type AlleleId = string;

/**
 * How a trait slot resolves its two inherited alleles into what you see (§17.2).
 *
 * The bible lists five modes: dominant, recessive, blended, co-expressed, and
 * environmentally activated. Only four appear here because dominant and
 * recessive are two ends of one mechanism rather than separate rules — an
 * allele with a low `dominance` rank IS the recessive one, and it expresses
 * when it is not paired against a higher rank. That is what makes a plain-
 * looking monster able to carry a hidden trait and pass it on (§17.2), which
 * the inheritance tests exercise directly.
 */
export type ExpressionMode = 'dominant' | 'blended' | 'co-expressed' | 'environmental';

export interface Allele {
  id: AlleleId;
  label: string;
  /**
   * Higher rank wins when two alleles meet in a `dominant` slot. Low-ranked
   * alleles are the recessives that hide in a lineage for generations.
   */
  dominance: number;
  /** Relative likelihood when rolling a founder monster. Mutations use 0. */
  weight: number;
  /**
   * Payload the renderer reads. For `blended` slots this must be a hex colour;
   * for the rest it is an arbitrary part or pattern identifier.
   */
  value?: string;
  /** Marks a rare mutation allele (§17.3). Never rolled for founders. */
  mutation?: boolean;
  /** Stat potential shifts, the source of the §17.5 specialisation tradeoffs. */
  statMods?: Partial<StatBlock>;
  /** For `environmental` slots: the habitat that activates this allele (§17.2). */
  requiresHabitat?: string;
}

export interface TraitSlot {
  id: SlotId;
  label: string;
  expression: ExpressionMode;
  alleles: Allele[];
}

/** One inherited pair per slot. Each parent contributes one side (§17.2). */
export type Genotype = Record<SlotId, readonly [AlleleId, AlleleId]>;

/** What a genotype actually looks like once expressed. */
export interface ExpressedTrait {
  slotId: SlotId;
  label: string;
  /** Alleles actually showing. One for most slots, two when co-expressed. */
  alleleIds: AlleleId[];
  /** Renderer payload: a part id, or a blended hex colour. */
  value: string;
  /** True when a rare mutation is on display (§17.3). */
  isMutation: boolean;
  /** Present but not visible — the carried recessive, if any (§16.4). */
  carriedAlleleId?: AlleleId;
}

export type Phenotype = Record<SlotId, ExpressedTrait>;

// ---------------------------------------------------------------------------
// Species definition (data-driven per §37.1)
// ---------------------------------------------------------------------------

export interface SpeciesDef {
  id: string;
  name: string;
  creatureType: string;
  /** Baseline stat potential before allele modifiers. */
  baseStats: StatBlock;
  /** Random spread applied to founder stat potential. */
  statVariance: number;
  affinities: AffinityId[];
  slots: TraitSlot[];
  /** Base per-slot mutation probability before modifiers (§17.3). */
  mutationRate: number;
}

// ---------------------------------------------------------------------------
// Personality (§14)
// ---------------------------------------------------------------------------

/**
 * The three temperament axes (§14.1), each in [-1, 1].
 * Negative is the first-named pole, positive the second.
 */
export interface PersonalityAxes {
  /** -1 social … +1 independent */
  socialIndependent: number;
  /** -1 calm … +1 intense */
  calmIntense: number;
  /** -1 cautious … +1 curious */
  cautiousCurious: number;
}

// ---------------------------------------------------------------------------
// Needs and relationships (§11, §14.3)
// ---------------------------------------------------------------------------

/**
 * The three broad needs (§11), each 0–100.
 *
 * Stored numerically but never shown as a number — the quick card renders a
 * descriptive state instead (§11.3). Low values slow a monster down; nothing
 * here ever causes permanent harm (§3.5).
 */
export interface Needs {
  fed: number;
  rested: number;
  content: number;
}

/** Relationship states (§14.3). */
export const RELATIONSHIP_STATES = [
  'unfamiliar',
  'comfortable',
  'friendly',
  'bonded',
  'rival',
  'protective',
  'mentor',
  'family',
] as const;
export type RelationshipState = (typeof RELATIONSHIP_STATES)[number];

/**
 * States that count as "Comfortable or better" for the pairing gate (§16.1).
 * Rival and unfamiliar are excluded; the rest all imply an established bond.
 */
export const PAIRABLE_RELATIONSHIPS: readonly RelationshipState[] = [
  'comfortable',
  'friendly',
  'bonded',
  'protective',
  'mentor',
  'family',
];

// ---------------------------------------------------------------------------
// Monster record (§37.2)
// ---------------------------------------------------------------------------

/**
 * The persistent record for one monster.
 *
 * This covers the §37.2 fields the breeding prototype actually exercises.
 * Deliberately not modelled yet, because no system here reads them: current
 * job, awards, competition techniques, and cosmetic equipment. They belong with
 * ranch jobs (§19) and competitions (§21–22).
 */
export interface Monster {
  id: string;
  name: string;
  speciesId: string;
  lifeStage: LifeStage;
  /** Birth date measured in ranch days (§6.1). Founders are day 0. */
  birthDay: number;
  /** Both parents, or null for a founder. */
  parentIds: readonly [string, string] | null;
  genotype: Genotype;
  /** Inherited ceiling. Ranch activity decides how much is realised (§12). */
  statPotential: StatBlock;
  /** Currently developed values, always <= potential (§12). */
  statsTrained: StatBlock;
  personality: PersonalityAxes;
  personalityTags: string[];
  quirks: string[];
  /** Player bond, 0–100 (§15). */
  bond: number;
  needs: Needs;
  /** Relationship state keyed by the other monster's id (§14.3). */
  relationships: Record<string, RelationshipState>;
  /** Traits gained from upbringing rather than inheritance (§17.4). */
  acquiredTraits: string[];
  /** Drives all deterministic appearance decisions (§37.2). */
  appearanceSeed: string;
  /** Slots where a mutation expressed, for registry history (§37.2). */
  mutationHistory: SlotId[];
  registeredBreedId: string | null;
}

/** A monster paired with its resolved appearance, ready to render. */
export interface RenderedMonster {
  monster: Monster;
  phenotype: Phenotype;
}
