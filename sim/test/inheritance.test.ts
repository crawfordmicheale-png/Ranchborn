/**
 * Inheritance across generations — the claims the whole game rests on.
 *
 * Milestone 004 asks the build to "demonstrate visible grandparent
 * inheritance" (§42). These tests are that demonstration, in executable form.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { bramblehorn, baseGenotype, monsterWithGenotype, withSlots } from './helpers.js';
import { advanceLifeStage, createOffspring } from '../src/monster.js';
import { expressGenotype } from '../src/genetics.js';
import { forecastPairing } from '../src/breeding.js';
import type { Monster } from '../src/types.js';

/** Mutation switched off, so a test can isolate plain Mendelian inheritance. */
const NO_MUTATION = { habitatMultiplier: 0 } as const;

function hornsOf(monster: Monster): string {
  return expressGenotype(bramblehorn, monster.genotype)['horns']!.value;
}

/**
 * Build the classic setup: a recessive trait visible in one grandparent,
 * hidden in the parent, and able to resurface in the grandchild.
 *
 * horn_stub is the lowest-ranked horn allele (dominance 10), so it only shows
 * when a monster inherits it from both sides.
 */
function buildCarrierParent(label: string): { carrier: Monster; grandparents: Monster[] } {
  const base = baseGenotype(bramblehorn);

  const stubGrandparent = monsterWithGenotype(
    bramblehorn,
    `${label}-gp-stub`,
    withSlots(base, { horns: ['horn_stub', 'horn_stub'] as const }),
  );
  const broadGrandparent = monsterWithGenotype(
    bramblehorn,
    `${label}-gp-broad`,
    withSlots(base, { horns: ['horn_broad', 'horn_broad'] as const }),
  );

  const carrier = advanceLifeStage(
    advanceLifeStage(
      createOffspring(bramblehorn, stubGrandparent, broadGrandparent, {
        id: `${label}-parent`,
        seed: `${label}-parent-seed`,
        mutation: NO_MUTATION,
      }),
    ),
  );

  return { carrier, grandparents: [stubGrandparent, broadGrandparent] };
}

test('a recessive trait hides in the parent generation', () => {
  const { carrier, grandparents } = buildCarrierParent('line-a');

  assert.equal(hornsOf(grandparents[0]!), 'stub', 'grandparent visibly has stub horns');
  assert.equal(hornsOf(grandparents[1]!), 'broad');
  assert.equal(hornsOf(carrier), 'broad', 'the parent shows broad horns');

  const carried = expressGenotype(bramblehorn, carrier.genotype)['horns']!.carriedAlleleId;
  assert.equal(carried, 'horn_stub', 'but quietly carries the grandparent trait');
});

test('a grandparent trait reappears in roughly a quarter of grandchildren', () => {
  // Two unrelated lines, each carrying horn_stub from one grandparent.
  const lineA = buildCarrierParent('line-a');
  const lineB = buildCarrierParent('line-b');

  assert.equal(hornsOf(lineA.carrier), 'broad');
  assert.equal(hornsOf(lineB.carrier), 'broad');

  const samples = 2000;
  let reappeared = 0;
  let firstExample: Monster | undefined;

  for (let i = 0; i < samples; i++) {
    const child = createOffspring(bramblehorn, lineA.carrier, lineB.carrier, {
      id: `gc-${i}`,
      seed: `grandchild-${i}`,
      mutation: NO_MUTATION,
    });
    if (hornsOf(child) === 'stub') {
      reappeared++;
      firstExample ??= child;
    }
  }

  const rate = reappeared / samples;
  assert.ok(
    Math.abs(rate - 0.25) < 0.035,
    `expected the recessive to resurface about 25% of the time, saw ${(rate * 100).toFixed(1)}%`,
  );

  // The headline claim, stated plainly: a trait neither parent shows, that both
  // grandparents' generation did, visible again in the grandchild.
  assert.ok(firstExample, 'at least one grandchild should show the grandparent trait');
  assert.equal(hornsOf(firstExample), 'stub');
  assert.deepEqual(firstExample.genotype['horns'], ['horn_stub', 'horn_stub']);
});

test('offspring resemble their parents in blended traits', () => {
  const base = baseGenotype(bramblehorn);
  const dark = monsterWithGenotype(
    bramblehorn,
    'dark',
    withSlots(base, { coatPrimary: ['coat_bark', 'coat_bark'] as const }),
  );
  const pale = monsterWithGenotype(
    bramblehorn,
    'pale',
    withSlots(base, { coatPrimary: ['coat_cream', 'coat_cream'] as const }),
  );

  const child = createOffspring(bramblehorn, dark, pale, {
    id: 'blend-child',
    seed: 'blend-seed',
    mutation: NO_MUTATION,
  });

  // Only one allele available from each side, so the coat must be the mix.
  const coat = expressGenotype(bramblehorn, child.genotype)['coatPrimary']!.value;
  assert.equal(coat, '#bea684', 'bark #96754f blended with cream #e6d7b8');
});

test('breeding is deterministic given the same parents and seed', () => {
  const lineA = buildCarrierParent('det-a');
  const lineB = buildCarrierParent('det-b');

  const first = createOffspring(bramblehorn, lineA.carrier, lineB.carrier, {
    id: 'c',
    seed: 'same-seed',
  });
  const second = createOffspring(bramblehorn, lineA.carrier, lineB.carrier, {
    id: 'c',
    seed: 'same-seed',
  });
  assert.deepEqual(first, second);
});

test('mutations arise on the ranch and are then heritable', () => {
  const lineA = buildCarrierParent('mut-a');
  const lineB = buildCarrierParent('mut-b');

  let mutants = 0;
  const samples = 3000;
  for (let i = 0; i < samples; i++) {
    const child = createOffspring(bramblehorn, lineA.carrier, lineB.carrier, {
      id: `m-${i}`,
      seed: `mutation-${i}`,
    });
    if (child.mutationHistory.length > 0) mutants++;
  }

  const rate = mutants / samples;
  assert.ok(rate > 0, 'mutations should actually occur at the default rate');
  assert.ok(rate < 0.25, `mutations should stay rare, saw ${(rate * 100).toFixed(1)}%`);

  // Once a mutation exists it inherits like any other allele — which is what
  // makes a mutant worth breeding from rather than just worth looking at.
  const base = baseGenotype(bramblehorn);
  const blossomed = monsterWithGenotype(
    bramblehorn,
    'blossomed',
    withSlots(base, { horns: ['horn_blossom', 'horn_blossom'] as const }),
  );
  const plain = monsterWithGenotype(
    bramblehorn,
    'plain',
    withSlots(base, { horns: ['horn_straight', 'horn_straight'] as const }),
  );
  const child = createOffspring(bramblehorn, blossomed, plain, {
    id: 'blossom-child',
    seed: 'blossom-seed',
    mutation: NO_MUTATION,
  });
  // horn_blossom (35) outranks horn_straight (20).
  assert.equal(hornsOf(child), 'blossom', 'the mutation passed to the next generation');
});

test('the forecast matches what breeding actually produces', () => {
  // The forecast is only worth showing a player if it is a real prediction.
  // Sample a few thousand offspring and check every slot's predicted
  // distribution against the observed one.
  const lineA = buildCarrierParent('fc-a');
  const lineB = buildCarrierParent('fc-b');

  const forecast = forecastPairing(bramblehorn, lineA.carrier, lineB.carrier);

  const samples = 4000;
  const observed = new Map<string, Map<string, number>>();
  for (let i = 0; i < samples; i++) {
    const child = createOffspring(bramblehorn, lineA.carrier, lineB.carrier, {
      id: `s-${i}`,
      seed: `forecast-${i}`,
    });
    const phenotype = expressGenotype(bramblehorn, child.genotype);
    for (const [slotId, trait] of Object.entries(phenotype)) {
      const bucket = observed.get(slotId) ?? new Map<string, number>();
      bucket.set(trait.value, (bucket.get(trait.value) ?? 0) + 1);
      observed.set(slotId, bucket);
    }
  }

  for (const slot of forecast.slots) {
    const bucket = observed.get(slot.slotId)!;

    // Total variation distance between predicted and observed.
    let divergence = 0;
    const values = new Set([
      ...slot.outcomes.map((outcome) => outcome.value),
      ...bucket.keys(),
    ]);
    for (const value of values) {
      const predicted = slot.outcomes.find((outcome) => outcome.value === value)?.probability ?? 0;
      const actual = (bucket.get(value) ?? 0) / samples;
      divergence += Math.abs(predicted - actual);
    }
    divergence /= 2;

    assert.ok(
      divergence < 0.04,
      `slot "${slot.slotId}" forecast diverges from reality by ${divergence.toFixed(3)}`,
    );

    // Nothing should ever appear that the forecast called impossible.
    for (const value of bucket.keys()) {
      assert.ok(
        slot.outcomes.some((outcome) => outcome.value === value),
        `slot "${slot.slotId}" produced "${value}", which the forecast did not list`,
      );
    }
  }

  // Probabilities within a slot must sum to 1.
  for (const slot of forecast.slots) {
    const total = slot.outcomes.reduce((sum, outcome) => sum + outcome.probability, 0);
    assert.ok(Math.abs(total - 1) < 0.01, `slot "${slot.slotId}" sums to ${total}`);
  }
});

test('the forecast predicts the recessive resurfacing before it happens', () => {
  const lineA = buildCarrierParent('pred-a');
  const lineB = buildCarrierParent('pred-b');

  const forecast = forecastPairing(bramblehorn, lineA.carrier, lineB.carrier);
  const horns = forecast.slots.find((slot) => slot.slotId === 'horns')!;
  const stub = horns.outcomes.find((outcome) => outcome.value === 'stub');

  assert.ok(stub, 'the breeder should be told the grandparent trait is possible');
  assert.ok(
    Math.abs(stub.probability - 0.24) < 0.03,
    `expected roughly a 24% chance, forecast said ${(stub.probability * 100).toFixed(1)}%`,
  );
});

test('the forecast surfaces mutations a parent carries', () => {
  const base = baseGenotype(bramblehorn);
  const carrier = monsterWithGenotype(
    bramblehorn,
    'carrier',
    withSlots(base, { horns: ['horn_blossom', 'horn_straight'] as const }),
  );
  const other = monsterWithGenotype(
    bramblehorn,
    'other',
    withSlots(base, { horns: ['horn_curved', 'horn_curved'] as const }),
  );

  const forecast = forecastPairing(bramblehorn, carrier, other);
  assert.ok(
    forecast.carriedMutations.includes('Blossom antlers'),
    'a carried mutation must be disclosed (§16.4)',
  );
});
