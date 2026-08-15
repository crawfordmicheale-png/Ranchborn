/**
 * Shared test fixtures.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseSpecies } from '../src/species.js';
import { createFounder } from '../src/monster.js';
import type { Genotype, Monster, RelationshipState, SpeciesDef } from '../src/types.js';

/** Repo root, resolved from this file's compiled location (dist/sim/test/). */
const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));

export function loadSpecies(id: string): SpeciesDef {
  const path = `${repoRoot}sim/data/species/${id}.json`;
  return parseSpecies(JSON.parse(readFileSync(path, 'utf8')), id);
}

export const bramblehorn: SpeciesDef = loadSpecies('bramblehorn');

/** Build a monster with an exact genotype, for constructing precise lineages. */
export function monsterWithGenotype(
  species: SpeciesDef,
  id: string,
  genotype: Genotype,
  seed = id,
): Monster {
  return createFounder(species, { id, seed, name: id, genotype });
}

/**
 * A full genotype where every slot is homozygous for its first listed allele,
 * used as a neutral base that individual tests then vary.
 */
export function baseGenotype(species: SpeciesDef): Genotype {
  const genotype: Record<string, readonly [string, string]> = {};
  for (const slot of species.slots) {
    const allele = slot.alleles.find((candidate) => candidate.mutation !== true)!;
    genotype[slot.id] = [allele.id, allele.id] as const;
  }
  return genotype;
}

/** Copy a genotype with specific slots overridden. */
export function withSlots(
  base: Genotype,
  overrides: Record<string, readonly [string, string]>,
): Genotype {
  return { ...base, ...overrides };
}

/** Make two monsters mutually related at the given relationship state (§14.3). */
export function relate(a: Monster, b: Monster, state: RelationshipState = 'comfortable'): void {
  a.relationships[b.id] = state;
  b.relationships[a.id] = state;
}

/** Look monsters up by id, for the lineage helpers. */
export function lookupFrom(monsters: Monster[]): (id: string) => Monster | undefined {
  const index = new Map(monsters.map((monster) => [monster.id, monster]));
  return (id) => index.get(id);
}
