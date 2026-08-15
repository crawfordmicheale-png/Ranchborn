/**
 * Species definition loading and validation (§37.1).
 *
 * Species live in editable JSON so designers can add creatures, trait slots,
 * and mutations without touching code. Because that data is hand-authored, it
 * gets validated on the way in — a typo in a dominance rank or a mutation with
 * a non-zero founder weight should fail loudly here rather than quietly produce
 * a bloodline that behaves wrongly ten generations later.
 *
 * `parseSpecies` takes already-parsed JSON rather than a file path, so the same
 * function serves Node (fs) and the browser (fetch) without either environment
 * leaking into the core.
 */

import type { Allele, AffinityId, SpeciesDef, StatBlock, TraitSlot } from './types.js';
import { AFFINITY_IDS, STAT_IDS } from './types.js';

const EXPRESSION_MODES = ['dominant', 'blended', 'co-expressed', 'environmental'] as const;

class SpeciesDataError extends Error {
  constructor(path: string, message: string) {
    super(`species data at ${path}: ${message}`);
    this.name = 'SpeciesDataError';
  }
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new SpeciesDataError(path, 'expected an object');
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new SpeciesDataError(path, 'expected a non-empty string');
  }
  return value;
}

function asNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new SpeciesDataError(path, 'expected a finite number');
  }
  return value;
}

function asArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new SpeciesDataError(path, 'expected an array');
  return value;
}

function parseStatBlock(value: unknown, path: string): StatBlock {
  const raw = asRecord(value, path);
  const stats = {} as StatBlock;
  for (const statId of STAT_IDS) {
    stats[statId] = asNumber(raw[statId], `${path}.${statId}`);
  }
  return stats;
}

function parseStatMods(value: unknown, path: string): Partial<StatBlock> {
  const raw = asRecord(value, path);
  const mods: Partial<StatBlock> = {};
  for (const [key, entry] of Object.entries(raw)) {
    if (!(STAT_IDS as readonly string[]).includes(key)) {
      throw new SpeciesDataError(`${path}.${key}`, `unknown stat (expected one of ${STAT_IDS.join(', ')})`);
    }
    mods[key as keyof StatBlock] = asNumber(entry, `${path}.${key}`);
  }
  return mods;
}

function parseAllele(value: unknown, path: string): Allele {
  const raw = asRecord(value, path);
  const allele: Allele = {
    id: asString(raw['id'], `${path}.id`),
    label: asString(raw['label'], `${path}.label`),
    dominance: asNumber(raw['dominance'], `${path}.dominance`),
    weight: asNumber(raw['weight'], `${path}.weight`),
  };

  if (allele.weight < 0) throw new SpeciesDataError(`${path}.weight`, 'must be >= 0');

  if (raw['value'] !== undefined) allele.value = asString(raw['value'], `${path}.value`);
  if (raw['mutation'] !== undefined) {
    if (typeof raw['mutation'] !== 'boolean') {
      throw new SpeciesDataError(`${path}.mutation`, 'expected a boolean');
    }
    allele.mutation = raw['mutation'];
  }
  if (raw['statMods'] !== undefined) {
    allele.statMods = parseStatMods(raw['statMods'], `${path}.statMods`);
  }
  if (raw['requiresHabitat'] !== undefined) {
    allele.requiresHabitat = asString(raw['requiresHabitat'], `${path}.requiresHabitat`);
  }

  // Mutations must never be rollable for founders: a mutation has to arise on
  // the player's own ranch to be worth anything (§17.3).
  if (allele.mutation === true && allele.weight !== 0) {
    throw new SpeciesDataError(`${path}.weight`, 'mutation alleles must have weight 0');
  }

  return allele;
}

function parseSlot(value: unknown, path: string): TraitSlot {
  const raw = asRecord(value, path);
  const id = asString(raw['id'], `${path}.id`);
  const expression = asString(raw['expression'], `${path}.expression`);
  if (!(EXPRESSION_MODES as readonly string[]).includes(expression)) {
    throw new SpeciesDataError(
      `${path}.expression`,
      `unknown mode "${expression}" (expected one of ${EXPRESSION_MODES.join(', ')})`,
    );
  }

  const alleles = asArray(raw['alleles'], `${path}.alleles`).map((entry, index) =>
    parseAllele(entry, `${path}.alleles[${index}]`),
  );

  if (alleles.length === 0) throw new SpeciesDataError(`${path}.alleles`, 'must not be empty');

  const seen = new Set<string>();
  for (const allele of alleles) {
    if (seen.has(allele.id)) {
      throw new SpeciesDataError(`${path}.alleles`, `duplicate allele id "${allele.id}"`);
    }
    seen.add(allele.id);
  }

  if (!alleles.some((allele) => allele.mutation !== true && allele.weight > 0)) {
    throw new SpeciesDataError(
      `${path}.alleles`,
      'needs at least one ordinary allele with weight > 0, or founders cannot be rolled',
    );
  }

  const slot: TraitSlot = {
    id,
    label: asString(raw['label'], `${path}.label`),
    expression: expression as TraitSlot['expression'],
    alleles,
  };

  // A blended slot averages hex colours, so every allele needs one.
  if (slot.expression === 'blended') {
    for (const allele of alleles) {
      if (allele.value === undefined || !/^#[0-9a-f]{6}$/i.test(allele.value)) {
        throw new SpeciesDataError(
          `${path}.alleles`,
          `blended slot requires #rrggbb values; allele "${allele.id}" has "${allele.value ?? '(none)'}"`,
        );
      }
    }
  }

  // An environmental slot is pointless unless something actually activates, and
  // it needs an inert fallback for every other habitat.
  if (slot.expression === 'environmental') {
    if (!alleles.some((allele) => allele.requiresHabitat !== undefined)) {
      throw new SpeciesDataError(
        `${path}.alleles`,
        'environmental slot needs at least one allele with requiresHabitat',
      );
    }
    if (!alleles.some((allele) => allele.requiresHabitat === undefined)) {
      throw new SpeciesDataError(
        `${path}.alleles`,
        'environmental slot needs a fallback allele without requiresHabitat',
      );
    }
  }

  return slot;
}

export function parseSpecies(value: unknown, sourceLabel = 'species'): SpeciesDef {
  const raw = asRecord(value, sourceLabel);

  const affinities = asArray(raw['affinities'], `${sourceLabel}.affinities`).map((entry, index) => {
    const affinity = asString(entry, `${sourceLabel}.affinities[${index}]`);
    if (!(AFFINITY_IDS as readonly string[]).includes(affinity)) {
      throw new SpeciesDataError(
        `${sourceLabel}.affinities[${index}]`,
        `unknown affinity "${affinity}" (expected one of ${AFFINITY_IDS.join(', ')})`,
      );
    }
    return affinity as AffinityId;
  });

  const slots = asArray(raw['slots'], `${sourceLabel}.slots`).map((entry, index) =>
    parseSlot(entry, `${sourceLabel}.slots[${index}]`),
  );

  if (slots.length === 0) throw new SpeciesDataError(`${sourceLabel}.slots`, 'must not be empty');

  const seenSlots = new Set<string>();
  for (const slot of slots) {
    if (seenSlots.has(slot.id)) {
      throw new SpeciesDataError(`${sourceLabel}.slots`, `duplicate slot id "${slot.id}"`);
    }
    seenSlots.add(slot.id);
  }

  const mutationRate = asNumber(raw['mutationRate'], `${sourceLabel}.mutationRate`);
  if (mutationRate < 0 || mutationRate > 1) {
    throw new SpeciesDataError(`${sourceLabel}.mutationRate`, 'must be between 0 and 1');
  }

  return {
    id: asString(raw['id'], `${sourceLabel}.id`),
    name: asString(raw['name'], `${sourceLabel}.name`),
    creatureType: asString(raw['creatureType'], `${sourceLabel}.creatureType`),
    baseStats: parseStatBlock(raw['baseStats'], `${sourceLabel}.baseStats`),
    statVariance: asNumber(raw['statVariance'], `${sourceLabel}.statVariance`),
    affinities,
    slots,
    mutationRate,
  };
}
