/**
 * Player-created breeds (§18).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { bramblehorn, baseGenotype, lookupFrom, withSlots } from './helpers.js';
import { advanceLifeStage, createFounder, createOffspring } from '../src/monster.js';
import { expressGenotype } from '../src/genetics.js';
import { personalityTags } from '../src/personality.js';
import {
  applyBreedToMembers,
  breedRank,
  evaluateBreed,
  generationOf,
  meetsStandard,
  proposeStandard,
  qualifyingMembers,
  registerBreed,
  tendenciesOf,
  HALLMARK_COUNT,
  MIN_TENDENCIES,
} from '../src/breed.js';
import type { Monster } from '../src/types.js';

const NO_MUTATION = { habitatMultiplier: 0 } as const;
const phenotypeOf = (monster: Monster) => expressGenotype(bramblehorn, monster.genotype);

/** A distinctive, fully homozygous stock so the whole line breeds true. */
function stockGenotype() {
  return withSlots(baseGenotype(bramblehorn), {
    bodyBuild: ['build_compact', 'build_compact'] as const,
    horns: ['horn_stub', 'horn_stub'] as const,
    ears: ['ear_drooped', 'ear_drooped'] as const,
  });
}

/**
 * Give a monster a settled temperament, so the lineage has the consistent
 * tendencies §18.1 asks for. Temperament inheritance is tested elsewhere; here
 * it would only add noise.
 */
function settle(monster: Monster): Monster {
  const personality = { socialIndependent: -0.8, calmIntense: -0.8, cautiousCurious: 0.1 };
  return { ...monster, personality, personalityTags: personalityTags(personality) };
}

/**
 * Two founder branches, crossed, then their offspring crossed again — the
 * §18.1 minimum shape: three generations, two branches, no close pairings.
 */
function buildBloodline(): { roster: Monster[]; exemplar: Monster } {
  const genotype = stockGenotype();
  const founders = ['f1a', 'f1b', 'f2a', 'f2b'].map((id) =>
    settle(createFounder(bramblehorn, { id, seed: id, name: id, genotype })),
  );

  const child = (id: string, a: Monster, b: Monster): Monster =>
    settle(
      advanceLifeStage(
        advanceLifeStage(
          createOffspring(bramblehorn, a, b, { id, seed: id, name: id, mutation: NO_MUTATION }),
        ),
      ),
    );

  const [f1a, f1b, f2a, f2b] = founders as [Monster, Monster, Monster, Monster];
  const g1a = child('g1a', f1a, f1b);
  const g1b = child('g1b', f1a, f1b);
  const g1c = child('g1c', f2a, f2b);
  const g1d = child('g1d', f2a, f2b);

  // Cross the branches: unrelated pairings.
  const g2a = child('g2a', g1a, g1c);
  const g2b = child('g2b', g1b, g1d);

  // Third generation, from cousins — permitted, and how a line is fixed.
  const g3 = child('g3', g2a, g2b);

  return { roster: [...founders, g1a, g1b, g1c, g1d, g2a, g2b, g3], exemplar: g3 };
}

test('a proposed standard names four visible traits', () => {
  const { exemplar } = buildBloodline();
  const proposal = proposeStandard(bramblehorn, exemplar, phenotypeOf);

  assert.equal(proposal.hallmarks.length, HALLMARK_COUNT, 'exactly four hallmarks (§18.2)');
  assert.ok(proposal.temperament.length > 0);
  assert.ok(proposal.primarySpecialty.length > 0);
  assert.notEqual(proposal.primarySpecialty, proposal.secondarySpecialty);

  // Blended colour slots must never become hallmarks: a breed defined by an
  // exact averaged hex would be unreachable, since blending rarely repeats.
  const blended = new Set(
    bramblehorn.slots.filter((slot) => slot.expression === 'blended').map((slot) => slot.id),
  );
  for (const hallmark of proposal.hallmarks) {
    assert.ok(!blended.has(hallmark.slotId), `${hallmark.slotId} is a blended slot`);
  }
});

test('the standard favours distinctive traits over common ones', () => {
  const { exemplar } = buildBloodline();
  const proposal = proposeStandard(bramblehorn, exemplar, phenotypeOf);
  const slots = proposal.hallmarks.map((hallmark) => hallmark.slotId);

  // The stock was built around three deliberately uncommon traits; a standard
  // that ignored them in favour of "Plain" would not describe this line.
  assert.ok(
    slots.includes('horns') || slots.includes('bodyBuild') || slots.includes('ears'),
    `expected a distinctive slot among ${slots.join(', ')}`,
  );
});

test('qualifying members are the ones that meet the standard', () => {
  const { roster, exemplar } = buildBloodline();
  const proposal = proposeStandard(bramblehorn, exemplar, phenotypeOf);

  const members = qualifyingMembers('bramblehorn', proposal.hallmarks, roster, phenotypeOf);
  assert.equal(members.length, roster.length, 'the whole line breeds true');

  // An outsider with different traits does not qualify, even of the same species.
  const outsider = createFounder(bramblehorn, {
    id: 'outsider',
    seed: 'outsider',
    genotype: withSlots(baseGenotype(bramblehorn), {
      horns: ['horn_broad', 'horn_broad'] as const,
    }),
  });
  assert.equal(meetsStandard(outsider, 'bramblehorn', proposal.hallmarks, phenotypeOf), false);

  // Nor does a monster of another species.
  const otherSpecies = { ...outsider, id: 'other', speciesId: 'cinderpup' };
  assert.equal(meetsStandard(otherSpecies, 'bramblehorn', proposal.hallmarks, phenotypeOf), false);
});

test('generations are counted from the founders', () => {
  const { roster } = buildBloodline();
  const lookup = lookupFrom(roster);
  const byId = new Map(roster.map((m) => [m.id, m]));

  assert.equal(generationOf(byId.get('f1a')!, lookup), 0, 'founders are generation zero');
  assert.equal(generationOf(byId.get('g1a')!, lookup), 1);
  assert.equal(generationOf(byId.get('g2a')!, lookup), 2);
  assert.equal(generationOf(byId.get('g3')!, lookup), 3);
});

test('a bloodline built to the §18.1 minimum is eligible', () => {
  const { roster, exemplar } = buildBloodline();
  const lookup = lookupFrom(roster);
  const proposal = proposeStandard(bramblehorn, exemplar, phenotypeOf);
  const members = qualifyingMembers('bramblehorn', proposal.hallmarks, roster, phenotypeOf);

  const evaluation = evaluateBreed(proposal.hallmarks, members, lookup);
  const unmet = evaluation.requirements.filter((r) => !r.met).map((r) => `${r.label} (${r.detail})`);
  assert.equal(evaluation.eligible, true, `unmet: ${unmet.join('; ')}`);

  assert.ok(evaluation.generations >= 3);
  assert.ok(evaluation.members.length >= 6);
  assert.ok(evaluation.founderIds.length >= 2);
  assert.ok(evaluation.consistentTendencies.length >= 2);
});

test('an unfinished lineage reports every requirement it still misses', () => {
  // Two founders and one child: nowhere near the bar.
  const genotype = stockGenotype();
  const a = settle(createFounder(bramblehorn, { id: 'a', seed: 'a', name: 'a', genotype }));
  const b = settle(createFounder(bramblehorn, { id: 'b', seed: 'b', name: 'b', genotype }));
  const c = settle(
    createOffspring(bramblehorn, a, b, { id: 'c', seed: 'c', name: 'c', mutation: NO_MUTATION }),
  );
  const roster = [a, b, c];
  const lookup = lookupFrom(roster);

  const proposal = proposeStandard(bramblehorn, c, phenotypeOf);
  const evaluation = evaluateBreed(proposal.hallmarks, roster, lookup);

  assert.equal(evaluation.eligible, false);

  // The checklist should be actionable, not a single blunt refusal.
  const byId = new Map(evaluation.requirements.map((r) => [r.id, r]));
  assert.equal(byId.get('generations')?.met, false);
  assert.equal(byId.get('members')?.met, false);
  assert.equal(byId.get('hallmarks')?.met, true, 'four hallmarks were still proposed');
  assert.equal(evaluation.requirements.length, 6, 'all six §18.1 requirements reported');
});

test('registering an ineligible breed is refused', () => {
  const genotype = stockGenotype();
  const a = createFounder(bramblehorn, { id: 'a', seed: 'a', genotype });
  const lookup = lookupFrom([a]);
  const proposal = proposeStandard(bramblehorn, a, phenotypeOf);
  const evaluation = evaluateBreed(proposal.hallmarks, [a], lookup);

  assert.throws(
    () =>
      registerBreed(bramblehorn, proposal, evaluation, {
        id: 'b1',
        name: 'Too Soon',
        crest: '✦',
        ranchDay: 3,
      }),
    /not eligible/,
  );
});

test('registration confers identity, never stats (§18.3)', () => {
  const { roster, exemplar } = buildBloodline();
  const lookup = lookupFrom(roster);
  const proposal = proposeStandard(bramblehorn, exemplar, phenotypeOf);
  const members = qualifyingMembers('bramblehorn', proposal.hallmarks, roster, phenotypeOf);
  const evaluation = evaluateBreed(proposal.hallmarks, members, lookup);

  const breed = registerBreed(bramblehorn, proposal, evaluation, {
    id: 'sunorchard',
    name: 'Sunorchard Bramblehorn',
    crest: '✿',
    description: 'Calm orchard workers.',
    ranchDay: 40,
  });

  const before = roster.map((m) => JSON.stringify({ p: m.statPotential, t: m.statsTrained }));
  const after = applyBreedToMembers(breed, roster);
  const afterStats = after.map((m) => JSON.stringify({ p: m.statPotential, t: m.statsTrained }));

  assert.deepEqual(afterStats, before, 'no stat may change on registration');
  assert.ok(after.every((m) => m.registeredBreedId === 'sunorchard'));
  assert.equal(breed.speciesId, 'bramblehorn');
  assert.equal(breed.hallmarks.length, HALLMARK_COUNT);
});

test('a newly registered breed is Emerging, and rank climbs with the lineage', () => {
  assert.equal(breedRank(6, 3), 'emerging');
  assert.equal(breedRank(9, 4), 'recognized');
  assert.equal(breedRank(12, 5), 'heritage');

  // Both dimensions have to be met, not just one.
  assert.equal(breedRank(40, 3), 'emerging', 'numbers alone are not a heritage line');
  assert.equal(breedRank(6, 9), 'emerging', 'depth alone is not either');
});

test('tendencies combine temperament with both of a monster\'s specialties', () => {
  const { exemplar } = buildBloodline();
  const tendencies = tendenciesOf(exemplar);
  const work = ['Hauling', 'Racing', 'Crafting', 'Nursery care', 'Gathering'];

  assert.ok(tendencies.length > 2);
  const found = tendencies.filter((t) => work.includes(t));
  assert.equal(found.length, 2, `expected a primary and secondary specialty, got ${found.join(', ')}`);
  assert.notEqual(found[0], found[1]);
});

test('a large, naturally varied line can still show consistent tendencies', () => {
  // Regression for a rule that punished success: when "consistent" meant every
  // single member, temperament drift emptied the intersection as a breed grew,
  // so a thriving line was harder to register than a struggling one.
  const genotype = stockGenotype();
  const founders = ['a1', 'a2', 'b1', 'b2'].map((id) =>
    createFounder(bramblehorn, { id, seed: id, name: id, genotype }),
  );
  const [a1, a2, b1, b2] = founders as [Monster, Monster, Monster, Monster];

  const grow = (id: string, x: Monster, y: Monster): Monster =>
    advanceLifeStage(
      advanceLifeStage(
        createOffspring(bramblehorn, x, y, { id, seed: id, name: id, mutation: NO_MUTATION }),
      ),
    );

  // Personalities are left to drift exactly as breeding produces them.
  const roster: Monster[] = [...founders];
  const gen1 = [grow('g1a', a1, a2), grow('g1b', a1, a2), grow('g1c', b1, b2), grow('g1d', b1, b2)];
  roster.push(...gen1);
  const gen2 = [grow('g2a', gen1[0]!, gen1[2]!), grow('g2b', gen1[1]!, gen1[3]!)];
  roster.push(...gen2);
  for (let i = 0; i < 8; i++) roster.push(grow(`g3-${i}`, gen2[0]!, gen2[1]!));

  const lookup = lookupFrom(roster);
  const proposal = proposeStandard(bramblehorn, roster[roster.length - 1]!, phenotypeOf);
  const members = qualifyingMembers('bramblehorn', proposal.hallmarks, roster, phenotypeOf);
  const evaluation = evaluateBreed(proposal.hallmarks, members, lookup);

  assert.ok(members.length >= 12, `expected a large line, got ${members.length}`);
  assert.ok(
    evaluation.consistentTendencies.length >= MIN_TENDENCIES,
    `a ${members.length}-strong line found only ${evaluation.consistentTendencies.length} tendencies`,
  );
});
