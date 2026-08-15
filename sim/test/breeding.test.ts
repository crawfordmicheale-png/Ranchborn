/**
 * Pairing rules (§16.1) and relatedness (§18.1).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { bramblehorn, lookupFrom, relate } from './helpers.js';
import { advanceLifeStage, createFounder, createOffspring } from '../src/monster.js';
import { canPair, compatibilityOf, forecastPairing } from '../src/breeding.js';
import { checkRelatedness } from '../src/lineage.js';
import type { Monster } from '../src/types.js';

function adult(id: string, seed = id): Monster {
  return createFounder(bramblehorn, { id, seed, name: id, lifeStage: 'adult' });
}

function toAdult(monster: Monster): Monster {
  return advanceLifeStage(advanceLifeStage(monster));
}

test('a comfortable, rested, unrelated adult pair may breed', () => {
  const a = adult('a');
  const b = adult('b');
  relate(a, b, 'comfortable');

  const check = canPair(a, b, { lookup: lookupFrom([a, b]) });
  assert.equal(check.allowed, true, check.blockers.join('; '));
  assert.deepEqual(check.blockers, []);
});

test('juveniles cannot be paired', () => {
  const a = createFounder(bramblehorn, { id: 'a', seed: 'a', lifeStage: 'juvenile' });
  const b = adult('b');
  relate(a, b);

  const check = canPair(a, b, { lookup: lookupFrom([a, b]) });
  assert.equal(check.allowed, false);
  assert.ok(check.blockers.some((blocker) => blocker.includes('not an adult')));
});

test('a tired monster cannot be paired', () => {
  const a = adult('a');
  const b = adult('b');
  relate(a, b);
  a.needs.rested = 20;

  const check = canPair(a, b, { lookup: lookupFrom([a, b]) });
  assert.equal(check.allowed, false);
  assert.ok(check.blockers.some((blocker) => blocker.includes('too tired')));
});

test('strangers and rivals cannot be paired', () => {
  const a = adult('a');
  const b = adult('b');

  const strangers = canPair(a, b, { lookup: lookupFrom([a, b]) });
  assert.equal(strangers.allowed, false);
  assert.ok(strangers.blockers.some((blocker) => blocker.includes('Comfortable or better')));

  relate(a, b, 'rival');
  const rivals = canPair(a, b, { lookup: lookupFrom([a, b]) });
  assert.equal(rivals.allowed, false);
});

test('pairing needs nursery space', () => {
  const a = adult('a');
  const b = adult('b');
  relate(a, b);

  const check = canPair(a, b, { lookup: lookupFrom([a, b]), nurserySpace: 0 });
  assert.equal(check.allowed, false);
  assert.ok(check.blockers.some((blocker) => blocker.includes('nursery space')));
});

test('every unmet requirement is reported at once', () => {
  // The UI should be able to show the whole list rather than one blocker at a
  // time, so a player is not made to fix problems serially.
  const a = createFounder(bramblehorn, { id: 'a', seed: 'a', lifeStage: 'juvenile' });
  const b = adult('b');
  a.needs.rested = 10;

  const check = canPair(a, b, { lookup: lookupFrom([a, b]), nurserySpace: 0 });
  assert.ok(check.blockers.length >= 4, `expected several blockers, got ${check.blockers.length}`);
});

test('a monster cannot be paired with itself', () => {
  const a = adult('a');
  const relatedness = checkRelatedness(a, a, lookupFrom([a]));
  assert.equal(relatedness.closeRelatives, true);
});

test('siblings are blocked', () => {
  const mother = adult('mother');
  const father = adult('father');
  const one = toAdult(createOffspring(bramblehorn, mother, father, { id: 'one', seed: 'one' }));
  const two = toAdult(createOffspring(bramblehorn, mother, father, { id: 'two', seed: 'two' }));
  relate(one, two, 'friendly');

  const lookup = lookupFrom([mother, father, one, two]);
  const relatedness = checkRelatedness(one, two, lookup);
  assert.equal(relatedness.closeRelatives, true);
  assert.match(relatedness.reason ?? '', /Siblings/);

  assert.equal(canPair(one, two, { lookup }).allowed, false);
});

test('a parent cannot be paired with its own offspring', () => {
  const mother = adult('mother');
  const father = adult('father');
  const child = toAdult(createOffspring(bramblehorn, mother, father, { id: 'child', seed: 'c' }));
  relate(mother, child, 'friendly');

  const lookup = lookupFrom([mother, father, child]);
  const relatedness = checkRelatedness(mother, child, lookup);
  assert.equal(relatedness.closeRelatives, true);
  assert.match(relatedness.reason ?? '', /direct ancestor/);
});

test('half siblings are blocked', () => {
  const shared = adult('shared');
  const otherA = adult('otherA');
  const otherB = adult('otherB');

  const one = toAdult(createOffspring(bramblehorn, shared, otherA, { id: 'one', seed: 'one' }));
  const two = toAdult(createOffspring(bramblehorn, shared, otherB, { id: 'two', seed: 'two' }));
  relate(one, two, 'friendly');

  const lookup = lookupFrom([shared, otherA, otherB, one, two]);
  const relatedness = checkRelatedness(one, two, lookup);
  assert.equal(relatedness.closeRelatives, true);
  assert.match(relatedness.reason ?? '', /Half siblings/);
});

test('a grandparent cannot be paired with its grandchild', () => {
  const gpA = adult('gpA');
  const gpB = adult('gpB');
  const outsider = adult('outsider');

  const parent = toAdult(createOffspring(bramblehorn, gpA, gpB, { id: 'p', seed: 'p' }));
  const grandchild = toAdult(
    createOffspring(bramblehorn, parent, outsider, { id: 'gc', seed: 'gc' }),
  );

  const lookup = lookupFrom([gpA, gpB, outsider, parent, grandchild]);
  const relatedness = checkRelatedness(gpA, grandchild, lookup);
  assert.equal(relatedness.closeRelatives, true);
  assert.match(relatedness.reason ?? '', /direct ancestor/);
});

test('cousins are allowed, so a bloodline can be concentrated deliberately', () => {
  // Line breeding through cousins is how a breeder fixes a trait, and §18.1
  // forces it: three generations from two founder branches makes the third
  // generation first cousins by construction.
  const gpA = adult('gpA');
  const gpB = adult('gpB');
  const outsider1 = adult('outsider1');
  const outsider2 = adult('outsider2');

  const parent1 = toAdult(createOffspring(bramblehorn, gpA, gpB, { id: 'p1', seed: 'p1' }));
  const parent2 = toAdult(createOffspring(bramblehorn, gpA, gpB, { id: 'p2', seed: 'p2' }));

  const cousin1 = toAdult(
    createOffspring(bramblehorn, parent1, outsider1, { id: 'c1', seed: 'c1' }),
  );
  const cousin2 = toAdult(
    createOffspring(bramblehorn, parent2, outsider2, { id: 'c2', seed: 'c2' }),
  );
  relate(cousin1, cousin2, 'comfortable');

  const lookup = lookupFrom([gpA, gpB, outsider1, outsider2, parent1, parent2, cousin1, cousin2]);
  const relatedness = checkRelatedness(cousin1, cousin2, lookup);
  assert.equal(relatedness.closeRelatives, false, relatedness.reason ?? '');
  assert.equal(canPair(cousin1, cousin2, { lookup }).allowed, true);
});

test('a breed is reachable from the §18.1 minimum of two founder branches', () => {
  // The registration floor: three generations, six qualifying monsters, two
  // founder branches, no close-relative pairing. If the relatedness rule made
  // this impossible, breed registration would be unreachable as specified.
  const branch1 = [adult('f1a'), adult('f1b')] as const;
  const branch2 = [adult('f2a'), adult('f2b')] as const;

  const gen1 = [
    toAdult(createOffspring(bramblehorn, branch1[0], branch1[1], { id: 'g1a', seed: 'g1a' })),
    toAdult(createOffspring(bramblehorn, branch1[0], branch1[1], { id: 'g1b', seed: 'g1b' })),
    toAdult(createOffspring(bramblehorn, branch2[0], branch2[1], { id: 'g1c', seed: 'g1c' })),
    toAdult(createOffspring(bramblehorn, branch2[0], branch2[1], { id: 'g1d', seed: 'g1d' })),
  ];

  // Generation 2 crosses the two branches — entirely unrelated pairings.
  const gen2 = [
    toAdult(createOffspring(bramblehorn, gen1[0]!, gen1[2]!, { id: 'g2a', seed: 'g2a' })),
    toAdult(createOffspring(bramblehorn, gen1[1]!, gen1[3]!, { id: 'g2b', seed: 'g2b' })),
  ];

  const everyone = [...branch1, ...branch2, ...gen1, ...gen2];
  const lookup = lookupFrom(everyone);

  // Generation 3 pairs the two gen-2 monsters. They are first cousins.
  relate(gen2[0]!, gen2[1]!, 'comfortable');
  const check = canPair(gen2[0]!, gen2[1]!, { lookup });
  assert.equal(check.allowed, true, check.blockers.join('; '));

  const gen3 = createOffspring(bramblehorn, gen2[0]!, gen2[1]!, { id: 'g3', seed: 'g3' });
  assert.equal(gen3.parentIds?.length, 2);
  assert.ok(everyone.length + 1 >= 6, 'enough qualifying monsters for registration');
});

test('compatibility rises with the relationship but never blocks a pairing', () => {
  const a = adult('a');
  const b = adult('b');

  relate(a, b, 'comfortable');
  const comfortable = compatibilityOf(a, b);

  relate(a, b, 'bonded');
  const bonded = compatibilityOf(a, b);

  assert.ok(bonded > comfortable, 'a stronger bond suits them better');

  relate(a, b, 'comfortable');
  const check = canPair(a, b, { lookup: lookupFrom([a, b]) });
  assert.equal(check.allowed, true, 'low compatibility still permits a reasonable pairing (§16.1)');
});

test('the forecast reports temperament tendency and expected stats', () => {
  const a = adult('a');
  const b = adult('b');
  const forecast = forecastPairing(bramblehorn, a, b);

  assert.ok(forecast.likelyTags.length > 0);
  assert.ok(forecast.expectedStats.might > 0);
  assert.equal(forecast.slots.length, bramblehorn.slots.length);

  const midpoint = (a.personality.calmIntense + b.personality.calmIntense) / 2;
  assert.ok(Math.abs(forecast.temperamentTendency.calmIntense - midpoint) < 0.001);
});
