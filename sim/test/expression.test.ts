/**
 * Trait expression: the four modes from §17.2, plus determinism.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { bramblehorn, baseGenotype, monsterWithGenotype, withSlots } from './helpers.js';
import { blendHex, expressGenotype, expressSlot, findSlot } from '../src/genetics.js';
import { createFounder } from '../src/monster.js';
import { parseSpecies } from '../src/species.js';

test('species data loads and validates', () => {
  assert.equal(bramblehorn.id, 'bramblehorn');
  assert.equal(bramblehorn.slots.length, 10, 'ten controlled trait slots per §17.1');
  for (const slot of bramblehorn.slots) {
    assert.ok(slot.alleles.length > 0, `${slot.id} has alleles`);
  }
});

test('mutation alleles are never rollable for founders', () => {
  // Enforced by the loader, since a mutation with founder weight would let a
  // player buy or luck into one rather than breed for it (§17.3).
  const broken = {
    id: 'x', name: 'X', creatureType: 'test',
    baseStats: { might: 10, agility: 10, focus: 10, heart: 10, instinct: 10 },
    statVariance: 0, affinities: ['bloom'], mutationRate: 0.1,
    slots: [{
      id: 's', label: 'S', expression: 'dominant',
      alleles: [
        { id: 'a', label: 'A', dominance: 10, weight: 10 },
        { id: 'm', label: 'M', dominance: 20, weight: 5, mutation: true },
      ],
    }],
  };
  assert.throws(() => parseSpecies(broken), /mutation alleles must have weight 0/);
});

test('dominant slots express the higher rank and carry the lower', () => {
  const slot = findSlot(bramblehorn, 'horns');
  // horn_broad (40) over horn_stub (10).
  const trait = expressSlot(slot, ['horn_stub', 'horn_broad']);
  assert.equal(trait.value, 'broad');
  assert.deepEqual(trait.alleleIds, ['horn_broad']);
  assert.equal(trait.carriedAlleleId, 'horn_stub', 'the recessive stays as a carrier');
  assert.equal(trait.isMutation, false);
});

test('dominant expression ignores which parent contributed which side', () => {
  const slot = findSlot(bramblehorn, 'horns');
  const forwards = expressSlot(slot, ['horn_stub', 'horn_broad']);
  const backwards = expressSlot(slot, ['horn_broad', 'horn_stub']);
  assert.deepEqual(forwards, backwards);
});

test('blended slots average their two colours', () => {
  const slot = findSlot(bramblehorn, 'coatPrimary');
  // moss #7d9b62 averaged with cream #e6d7b8.
  const trait = expressSlot(slot, ['coat_moss', 'coat_cream']);
  assert.equal(trait.value, '#b2b98d');
  assert.deepEqual(trait.alleleIds.sort(), ['coat_cream', 'coat_moss']);
});

test('blended slots with a matched pair keep the pure colour', () => {
  const slot = findSlot(bramblehorn, 'coatPrimary');
  const trait = expressSlot(slot, ['coat_moss', 'coat_moss']);
  assert.equal(trait.value, '#7d9b62');
});

test('blendHex rejects anything that is not a colour', () => {
  assert.throws(() => blendHex('#7d9b62', 'moss'), /need #rrggbb colours/);
});

test('co-expressed slots show both alleles at once', () => {
  const slot = findSlot(bramblehorn, 'accent');
  const trait = expressSlot(slot, ['accent_stone', 'accent_bloom']);
  assert.equal(trait.value, 'bloom+stone', 'sorted, so parent order cannot change it');
  assert.equal(trait.alleleIds.length, 2);
});

test('environmental alleles activate only in their habitat', () => {
  const slot = findSlot(bramblehorn, 'surface');
  const pair = ['surface_plain', 'surface_mossy'] as const;

  const inOrchard = expressSlot(slot, pair, { habitat: 'orchard' });
  assert.equal(inOrchard.value, 'mossy', 'moss grows in the orchard (§17.4)');

  const inQuarry = expressSlot(slot, pair, { habitat: 'quarry' });
  assert.equal(inQuarry.value, 'plain', 'same genotype, different habitat');
  assert.equal(inQuarry.carriedAlleleId, 'surface_mossy', 'still carried, just not showing');

  const nowhere = expressSlot(slot, pair);
  assert.equal(nowhere.value, 'plain');
});

test('a monster looks identical wherever the same genotype appears', () => {
  // Expression must depend on genotype and habitat alone — never the RNG —
  // or family resemblance stops being legible (§3.3).
  const genotype = withSlots(baseGenotype(bramblehorn), {
    horns: ['horn_curved', 'horn_stub'] as const,
    coatPrimary: ['coat_moss', 'coat_russet'] as const,
  });
  const first = expressGenotype(bramblehorn, genotype);
  const second = expressGenotype(bramblehorn, genotype);
  assert.deepEqual(first, second);
});

test('the same seed always produces the same monster', () => {
  const a = createFounder(bramblehorn, { id: 'a', seed: 'ranchborn-demo-7' });
  const b = createFounder(bramblehorn, { id: 'a', seed: 'ranchborn-demo-7' });
  assert.deepEqual(a, b, 'appearance seed fully reproduces the monster (§37.2)');
});

test('different seeds produce different monsters', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 50; i++) {
    const monster = createFounder(bramblehorn, { id: `f${i}`, seed: `founder-${i}` });
    seen.add(JSON.stringify(monster.genotype));
  }
  assert.ok(seen.size > 35, `expected varied founders, got ${seen.size} distinct genotypes of 50`);
});

test('founders never carry a mutation', () => {
  const mutationIds = new Set(
    bramblehorn.slots.flatMap((slot) =>
      slot.alleles.filter((allele) => allele.mutation === true).map((allele) => allele.id),
    ),
  );
  assert.ok(mutationIds.size > 0, 'the fixture species has mutations to look for');

  for (let i = 0; i < 400; i++) {
    const founder = createFounder(bramblehorn, { id: `f${i}`, seed: `wild-${i}` });
    for (const pair of Object.values(founder.genotype)) {
      for (const alleleId of pair) {
        assert.ok(!mutationIds.has(alleleId), `founder ${i} spawned with mutation ${alleleId}`);
      }
    }
  }
});

test('heavy builds trade agility for might (§17.5)', () => {
  const base = baseGenotype(bramblehorn);
  const seed = 'tradeoff-fixed-seed';

  const broad = monsterWithGenotype(
    bramblehorn,
    'broad',
    withSlots(base, { bodyBuild: ['build_broad', 'build_broad'] as const }),
    seed,
  );
  const compact = monsterWithGenotype(
    bramblehorn,
    'compact',
    withSlots(base, { bodyBuild: ['build_compact', 'build_compact'] as const }),
    seed,
  );

  assert.ok(
    broad.statPotential.might > compact.statPotential.might,
    'broad builds haul better',
  );
  assert.ok(
    compact.statPotential.agility > broad.statPotential.agility,
    'compact builds move better',
  );

  // Neither is strictly better — that is the whole point of §17.5.
  const broadTotal = broad.statPotential.might + broad.statPotential.agility;
  const compactTotal = compact.statPotential.might + compact.statPotential.agility;
  assert.ok(
    Math.abs(broadTotal - compactTotal) <= 6,
    `specialisation should not create raw superiority (${broadTotal} vs ${compactTotal})`,
  );
});
