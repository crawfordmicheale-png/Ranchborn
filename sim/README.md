# Simulation core

Engine-agnostic TypeScript implementing the genetics and breeding rules from
[the game bible](../docs/design/game-bible.md). No DOM, no engine, no
dependencies — plain functions over plain data, so this ports to C#, GDScript,
or anything else when an engine is chosen.

## Layout

| Path | Contents |
|---|---|
| `data/species/*.json` | Species definitions: trait slots, alleles, dominance ranks, stat modifiers. Hand-editable per §37.1. Three species, each with its own slot vocabulary. |
| `src/rng.ts` | Seeded deterministic PRNG. `Math.random()` appears nowhere in `sim/`. |
| `src/types.ts` | Domain model — monster record, genotype, phenotype, species definition. |
| `src/species.ts` | Loads and validates species JSON, failing loudly on bad data. |
| `src/genetics.ts` | Trait expression, inheritance, mutation, stat derivation. |
| `src/monster.ts` | Creating founders and offspring; life-stage advancement. |
| `src/breeding.ts` | Pairing eligibility and the offspring forecast. |
| `src/personality.ts` | Temperament axes, tags, quirks. |
| `src/lineage.ts` | Family trees, relatedness, lineage concentration. |
| `src/breed.ts` | Player-created breeds: standards, qualification, registration, ranks. |
| `test/` | 68 tests, run with `npm test`. |

## The genetics model

A species declares a fixed set of **trait slots** (§17.1). A genotype is exactly
one inherited **pair of alleles** per slot. Each parent contributes one side.
This is what keeps offspring from coming out malformed or unanimatable while
still leaving room for surprises.

Each slot declares how its pair resolves into what you see:

| Mode | Behaviour |
|---|---|
| `dominant` | Higher `dominance` rank wins. The loser stays as a hidden carrier. |
| `blended` | The two colours are averaged. |
| `co-expressed` | Both alleles show at once. |
| `environmental` | An allele activates only in its habitat, and is carried everywhere else. |

The bible lists five modes, including *recessive*. There are four here because
dominant and recessive are two ends of one mechanism rather than separate rules:
a low-ranked allele **is** the recessive, and it expresses when it is not paired
against a higher rank. That is what lets a plain-looking monster carry a rare
trait and pass it on.

### Why that matters

`horn_stub` has the lowest dominance rank of the Bramblehorn horn alleles, so it
only shows when inherited from both sides. A monster can carry it invisibly for
a generation and have it resurface in a grandchild — the mechanism behind
"grandparent traits can reappear unexpectedly, making family trees meaningful"
(§17.2), and the thing Milestone 004 asks the build to demonstrate.

`test/inheritance.test.ts` is that demonstration: it builds two unrelated
carrier lines, breeds them 2,000 times, and asserts the grandparent trait
resurfaces in about a quarter of grandchildren.

## Determinism

Every random decision flows through a seeded RNG derived from the monster's
`appearanceSeed`. The same parents and the same seed always produce the same
child, and expression depends only on genotype and habitat — never on the RNG.
Without that, family resemblance would not be legible and the forecast could not
be trusted.

## The forecast is a real prediction

`forecastPairing` computes exact probabilities by enumerating every allele
combination and weighting it, rather than sampling. It mirrors `inheritGenotype`
including the mutation roll, and a test samples 4,000 offspring and asserts the
predicted distribution matches the observed one for every slot.

## Breeds (§18)

Registration runs the way a real registry does, which is the reverse of what you
might expect. You do not hand the registry a group of animals and ask what they
have in common — you write a **standard**, and whichever monsters meet it are
the breed. That is what makes a breed something a player authors rather than
something the game notices for them.

1. Pick an exemplar — the monster that best embodies the intent.
2. `proposeStandard` reads four hallmark traits off it, favouring rare ones.
3. `qualifyingMembers` finds everyone who meets that standard.
4. `evaluateBreed` checks the group against all six §18.1 requirements.
5. `registerBreed` writes the standard once it is eligible.

Blended colour slots are never hallmarks: blending two parents rarely lands on
the same hex twice, so a breed defined by an exact averaged colour would be
unreachable. Registration confers identity and nothing else — a test asserts no
stat changes when a breed is applied (§18.3).

## Design decisions not settled by the bible

**Close relatives.** §16.1 blocks pairing "close relatives" without defining the
term. This blocks a pairing when the two share a parent, or when one descends
from the other. Cousins are allowed. That is deliberate: line breeding through
cousins is how a breeder actually fixes a trait, and §18.1 forces it — three
generations from "at least two founder branches" makes the third generation
first cousins by construction, so blocking cousins would make the bible's own
registration minimum unreachable.

**What "consistent tendencies" means.** §18.1 asks for "two consistent
behavioural, work, or competition tendencies" without saying how consistent.
Playtesting the strict reading — every single member sharing them — showed it
punishes success: temperament drifts a little each generation, so the
intersection across a large family empties out and a thriving twenty-strong line
becomes harder to register than a struggling six-strong one. Two changes fixed
it. A tendency now counts when a strong majority (70%) of members show it, as
real breed standards describe typical temperament rather than a universal
property; and both of a monster's specialties count, not just its leading one,
since §18.2 records a primary *and* secondary specialty and those follow
inherited stat potential, so a line breeding true for its traits breeds true for
its aptitudes.

**Deferred monster-record fields.** §37.2 lists current job, awards, competition
techniques, and cosmetic equipment. They are not modelled because nothing here
reads them; they belong with ranch jobs (§19) and competitions (§21–22).
