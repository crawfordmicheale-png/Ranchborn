/**
 * Invariants that must hold for every species, not just the first one.
 *
 * Adding a species should not require adding a test for it. These run the same
 * checks across everything in sim/data/species, so a new creature either
 * satisfies the model or fails here.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { loadSpecies } from './helpers.js';
import { createFounder, createOffspring, advanceLifeStage } from '../src/monster.js';
import { expressGenotype } from '../src/genetics.js';
import { forecastPairing } from '../src/breeding.js';
import type { SpeciesDef } from '../src/types.js';

const dataDir = fileURLToPath(new URL('../../../sim/data/species/', import.meta.url));
const SPECIES_IDS = readdirSync(dataDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => file.replace(/\.json$/, ''))
  .sort();

test('every species file on disk loads and validates', () => {
  assert.ok(SPECIES_IDS.length >= 3, `expected the vertical-slice species, found ${SPECIES_IDS}`);
  for (const id of SPECIES_IDS) {
    const species = loadSpecies(id);
    assert.equal(species.id, id, 'the id inside the file must match its filename');
  }
});

for (const id of SPECIES_IDS) {
  const species: SpeciesDef = loadSpecies(id);

  test(`${id}: has enough slots and alleles to breed interestingly`, () => {
    assert.ok(species.slots.length >= 8, `${id} has only ${species.slots.length} trait slots`);
    const alleles = species.slots.reduce((total, slot) => total + slot.alleles.length, 0);
    assert.ok(alleles >= 30, `${id} has only ${alleles} alleles`);
  });

  test(`${id}: has recessives available to hide in a lineage`, () => {
    // Without a low-ranked allele in a dominant slot, nothing can skip a
    // generation, and the game's central hook does not exist for this species.
    const withRecessives = species.slots.filter((slot) => {
      if (slot.expression !== 'dominant') return false;
      const ranks = new Set(slot.alleles.map((allele) => allele.dominance));
      return ranks.size > 1;
    });
    assert.ok(withRecessives.length >= 3, `${id} has only ${withRecessives.length} graded slots`);
  });

  test(`${id}: founders never carry mutations`, () => {
    const mutationIds = new Set(
      species.slots.flatMap((slot) =>
        slot.alleles.filter((allele) => allele.mutation === true).map((allele) => allele.id),
      ),
    );
    assert.ok(mutationIds.size > 0, `${id} defines no mutations`);

    for (let i = 0; i < 200; i++) {
      const founder = createFounder(species, { id: `f${i}`, seed: `${id}-wild-${i}` });
      for (const pair of Object.values(founder.genotype)) {
        for (const alleleId of pair) {
          assert.ok(!mutationIds.has(alleleId), `${id} founder spawned with ${alleleId}`);
        }
      }
    }
  });

  test(`${id}: breeding is deterministic and produces valid genotypes`, () => {
    const a = advanceLifeStage(createFounder(species, { id: 'a', seed: `${id}-a` }));
    const b = createFounder(species, { id: 'b', seed: `${id}-b` });

    const first = createOffspring(species, a, b, { id: 'c', seed: `${id}-c` });
    const second = createOffspring(species, a, b, { id: 'c', seed: `${id}-c` });
    assert.deepEqual(first, second);

    // Every slot filled, every allele legal for that slot.
    for (const slot of species.slots) {
      const pair = first.genotype[slot.id];
      assert.ok(pair, `${id} offspring missing slot ${slot.id}`);
      for (const alleleId of pair) {
        assert.ok(
          slot.alleles.some((allele) => allele.id === alleleId),
          `${id} offspring has allele ${alleleId} not declared on slot ${slot.id}`,
        );
      }
    }
  });

  test(`${id}: the forecast matches what breeding actually produces`, () => {
    const a = createFounder(species, { id: 'pa', seed: `${id}-parent-a` });
    const b = createFounder(species, { id: 'pb', seed: `${id}-parent-b` });
    const forecast = forecastPairing(species, a, b);

    const samples = 1500;
    const observed = new Map<string, Map<string, number>>();
    for (let i = 0; i < samples; i++) {
      const child = createOffspring(species, a, b, { id: `s${i}`, seed: `${id}-sample-${i}` });
      for (const [slotId, trait] of Object.entries(expressGenotype(species, child.genotype))) {
        const bucket = observed.get(slotId) ?? new Map<string, number>();
        bucket.set(trait.value, (bucket.get(trait.value) ?? 0) + 1);
        observed.set(slotId, bucket);
      }
    }

    for (const slot of forecast.slots) {
      const bucket = observed.get(slot.slotId)!;
      let divergence = 0;
      const values = new Set([...slot.outcomes.map((o) => o.value), ...bucket.keys()]);
      for (const value of values) {
        const predicted = slot.outcomes.find((o) => o.value === value)?.probability ?? 0;
        divergence += Math.abs(predicted - (bucket.get(value) ?? 0) / samples);
      }
      assert.ok(
        divergence / 2 < 0.06,
        `${id} slot "${slot.slotId}" forecast diverges by ${(divergence / 2).toFixed(3)}`,
      );
    }
  });

  test(`${id}: environmental traits need their habitat`, () => {
    const environmental = species.slots.filter((slot) => slot.expression === 'environmental');
    for (const slot of environmental) {
      const activated = slot.alleles.find((allele) => allele.requiresHabitat !== undefined)!;
      const inert = slot.alleles.find((allele) => allele.requiresHabitat === undefined)!;
      const genotype = {
        ...Object.fromEntries(
          species.slots.map((s) => {
            const allele = s.alleles.find((a) => a.mutation !== true)!;
            return [s.id, [allele.id, allele.id] as const];
          }),
        ),
        [slot.id]: [activated.id, inert.id] as const,
      };

      const inHabitat = expressGenotype(species, genotype, {
        habitat: activated.requiresHabitat!,
      })[slot.id]!;
      const elsewhere = expressGenotype(species, genotype, { habitat: 'nowhere' })[slot.id]!;

      assert.equal(inHabitat.value, activated.value);
      assert.equal(elsewhere.value, inert.value);
      assert.equal(elsewhere.carriedAlleleId, activated.id, 'still carried, just not showing');
    }
  });
}

test('species do not share slot vocabularies', () => {
  // If every species used the same slot names, the data-driven claim would be
  // untested — the engine would only ever have seen one shape of creature.
  const slotSets = SPECIES_IDS.map((id) => new Set(loadSpecies(id).slots.map((slot) => slot.id)));
  const [first, ...rest] = slotSets;
  const identical = rest.every(
    (set) => set.size === first!.size && [...set].every((slotId) => first!.has(slotId)),
  );
  assert.ok(!identical, 'at least one species should define slots the others do not');
});
