/**
 * Ranchborn breeding prototype.
 *
 * A deliberately narrow slice: no ranch jobs, no competitions, no needs decay.
 * The one question it exists to answer is whether the inheritance model
 * actually reads on screen — whether a player can look at a hatchling and see
 * its parents and grandparents in it (§3.3, §43).
 */

import { expressGenotype } from '../../sim/src/genetics.js';
import {
  advanceLifeStage,
  createFounder,
  createOffspring,
  generateName,
} from '../../sim/src/monster.js';
import { canPair, forecastPairing } from '../../sim/src/breeding.js';
import { grandparentsOf, parentsOf } from '../../sim/src/lineage.js';
import {
  applyBreedToMembers,
  evaluateBreed,
  proposeStandard,
  qualifyingMembers,
  registerBreed,
} from '../../sim/src/breed.js';
import type { RegisteredBreed } from '../../sim/src/breed.js';
import type { Monster, Phenotype, SpeciesDef } from '../../sim/src/types.js';
import { renderSpecies } from './render/index.js';
import { loadAllSpecies, SPECIES_IDS } from './species-data.js';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface State {
  /** Every loaded species, keyed by id. Breeding never crosses species (§16.1). */
  speciesById: Map<string, SpeciesDef>;
  monsters: Map<string, Monster>;
  order: string[];
  selectedA: string | null;
  selectedB: string | null;
  inspecting: string | null;
  habitat: string;
  advanced: boolean;
  showGuide: boolean;
  ranchDay: number;
  log: string[];
  /** Breeds the player has registered (§18). */
  breeds: RegisteredBreed[];
  /** Draft name in the registry form. */
  breedName: string;
}

let state: State;
let nextId = 0;

const HABITATS = ['homestead', 'orchard', 'wetlands', 'quarry', 'emberyard'] as const;

/** Crest glyphs, handed out in order as breeds are registered (§18.2). */
const CRESTS = ['✿', '❖', '✦', '❂', '✤', '⬟'];

const lookup = (id: string): Monster | undefined => state.monsters.get(id);

function breedOf(monster: Monster): RegisteredBreed | undefined {
  if (!monster.registeredBreedId) return undefined;
  return state.breeds.find((breed) => breed.id === monster.registeredBreedId);
}

function speciesOf(monster: Monster): SpeciesDef {
  const species = state.speciesById.get(monster.speciesId);
  if (!species) throw new Error(`no species data loaded for "${monster.speciesId}"`);
  return species;
}

function phenotypeOf(monster: Monster): Phenotype {
  return expressGenotype(speciesOf(monster), monster.genotype, { habitat: state.habitat });
}

function addMonster(monster: Monster): Monster {
  state.monsters.set(monster.id, monster);
  state.order.push(monster.id);
  return monster;
}

/**
 * Prototype shortcut: everyone on the ranch is at least Comfortable with
 * everyone else, so the §16.1 relationship gate does not block experimenting.
 * In the real game these grow through shared habitats and work (§14.3).
 */
function socialise(): void {
  const all = [...state.monsters.values()];
  for (const a of all) {
    for (const b of all) {
      if (a.id === b.id) continue;
      a.relationships[b.id] ??= 'comfortable';
    }
  }
}

/**
 * Names come from a small pool, so collisions arrive quickly on a busy ranch.
 * Players are supposed to remember monsters by name (§43); two Bramdowns break
 * that, so later duplicates get a numeral the way real herd books do.
 */
function uniqueName(seed: string): string {
  const base = generateName(seed);
  const taken = new Set([...state.monsters.values()].map((monster) => monster.name));
  if (!taken.has(base)) return base;
  const suffixes = ['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  for (const suffix of suffixes) {
    const candidate = `${base} ${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base} ${taken.size}`;
}

function newFounder(speciesId: string, name?: string): Monster {
  const species = state.speciesById.get(speciesId);
  if (!species) throw new Error(`cannot rescue an unknown species "${speciesId}"`);
  const id = `m${nextId++}`;
  const seed = `${id}-${Math.floor(Math.random() * 1e9)}`;
  const options = { id, seed, lifeStage: 'adult' as const, name: name ?? uniqueName(seed) };
  const monster = addMonster(createFounder(species, options));
  socialise();
  return monster;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const STAGE_LABEL: Record<string, string> = {
  hatchling: 'Hatchling',
  juvenile: 'Juvenile',
  adult: 'Adult',
  veteran: 'Veteran',
};

function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char,
  );
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** Human-readable names for a slot's alleles — never show raw ids in the UI. */
function alleleLabels(species: SpeciesDef, slotId: string, alleleIds: string[]): string {
  const slot = species.slots.find((candidate) => candidate.id === slotId);
  return alleleIds
    .map((id) => slot?.alleles.find((allele) => allele.id === id)?.label ?? id)
    .join(' + ');
}

/**
 * The traits worth naming on a card.
 *
 * Derived from the species' own slot list rather than a hardcoded set, because
 * the three species share no slot names — a Bramblehorn has horns, a Cinderpup
 * a mane, a Puddlekin frills and fins. Blended slots are skipped: "Moss + Bark"
 * is a colour, and the swatch on the portrait already says it better.
 */
function traitSummary(species: SpeciesDef, phenotype: Phenotype): string[] {
  return species.slots
    .filter((slot) => slot.expression !== 'blended')
    .slice(0, 5)
    .map((slot) => phenotype[slot.id])
    .filter((trait): trait is NonNullable<typeof trait> => trait !== undefined)
    .map(
      (trait) =>
        `${alleleLabels(species, trait.slotId, trait.alleleIds)}${trait.isMutation ? ' ✦' : ''}`,
    );
}

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

function monsterCard(monster: Monster, options: { compact?: boolean; role?: string } = {}): string {
  const species = speciesOf(monster);
  const phenotype = phenotypeOf(monster);
  const isA = state.selectedA === monster.id;
  const isB = state.selectedB === monster.id;
  const selectedClass = isA ? ' is-parent-a' : isB ? ' is-parent-b' : '';
  const mutations = Object.values(phenotype).filter((trait) => trait.isMutation);

  const roleBadge = options.role ? `<span class="role">${escapeHtml(options.role)}</span>` : '';
  const parentBadge = isA ? '<span class="pick pick-a">Parent A</span>'
    : isB ? '<span class="pick pick-b">Parent B</span>' : '';

  return `
    <article class="card${selectedClass}${options.compact ? ' compact' : ''}"
             data-action="select" data-id="${monster.id}" tabindex="0">
      ${roleBadge}${parentBadge}${
        breedOf(monster)
          ? `<span class="crest" title="${escapeHtml(breedOf(monster)!.name)}">${escapeHtml(
              breedOf(monster)!.crest,
            )}</span>`
          : ''
      }
      <div class="portrait">${renderSpecies(monster.speciesId, phenotype, {
        size: options.compact ? 150 : 210,
      })}</div>
      <h3>${escapeHtml(monster.name)}</h3>
      <p class="stage"><span class="species-tag">${escapeHtml(species.name)}</span> ${
        STAGE_LABEL[monster.lifeStage]
      }${monster.parentIds ? '' : ' · Founder'}${
        mutations.length > 0 ? ' · <span class="mutation">Mutation</span>' : ''
      }</p>
      ${options.compact ? '' : `
        <ul class="traits">
          ${traitSummary(species, phenotype).map((trait) => `<li>${escapeHtml(trait)}</li>`).join('')}
        </ul>
        <p class="tags">${monster.personalityTags.map(escapeHtml).join(' · ')}</p>
      `}
    </article>`;
}

function forecastView(a: Monster, b: Monster): string {
  const check = canPair(a, b, { lookup });

  if (!check.allowed) {
    return `
      <div class="blocked">
        <h3>Cannot pair yet</h3>
        <ul>${check.blockers.map((blocker) => `<li>${escapeHtml(blocker)}</li>`).join('')}</ul>
        <p class="hint">Pairing rules come from §16.1.</p>
      </div>`;
  }

  const forecast = forecastPairing(speciesOf(a), a, b, {
    context: { habitat: state.habitat },
  });

  // Slots where the result is genuinely uncertain are the interesting ones.
  const interesting = forecast.slots.filter((slot) => slot.outcomes.length > 1);
  const certain = forecast.slots.filter((slot) => slot.outcomes.length === 1);

  const rows = interesting
    .map(
      (slot) => `
        <div class="forecast-slot">
          <span class="slot-name">${escapeHtml(slot.label)}</span>
          <div class="bars">
            ${slot.outcomes
              .slice(0, 4)
              .map(
                (outcome) => `
                  <div class="bar-row${outcome.isMutation ? ' is-mutation' : ''}">
                    <span class="bar-label">${escapeHtml(outcome.label)}</span>
                    <span class="bar-track"><span class="bar-fill" style="width:${outcome.probability * 100}%"></span></span>
                    <span class="bar-value">${percent(outcome.probability)}</span>
                  </div>`,
              )
              .join('')}
          </div>
        </div>`,
    )
    .join('');

  return `
    <div class="forecast">
      <div class="forecast-head">
        <h3>Offspring forecast</h3>
        <span class="compat">Compatibility ${percent(forecast.compatibility)}</span>
      </div>
      ${rows || '<p class="hint">Every trait is already fixed in this pairing.</p>'}
      ${
        certain.length > 0
          ? `<p class="hint">Certain: ${certain
              .map((slot) => `${escapeHtml(slot.label)} — ${escapeHtml(slot.outcomes[0]!.label)}`)
              .join(' · ')}</p>`
          : ''
      }
      ${
        forecast.carriedMutations.length > 0
          ? `<p class="carried">Carried mutations: ${forecast.carriedMutations
              .map(escapeHtml)
              .join(', ')}</p>`
          : ''
      }
      <p class="tendency">Likely temperament: ${forecast.likelyTags.map(escapeHtml).join(' · ')}</p>
      <button class="primary" data-action="breed">Pair and hatch</button>
    </div>`;
}

function lineageView(monster: Monster): string {
  const parents = parentsOf(monster, lookup);
  const grandparents = grandparentsOf(monster, lookup);

  if (parents.length === 0) {
    return `<p class="hint">${escapeHtml(monster.name)} is a founder — no recorded lineage.</p>`;
  }

  const phenotype = phenotypeOf(monster);
  const parentPhenotypes = parents.map(phenotypeOf);
  const grandparentPhenotypes = grandparents.map(phenotypeOf);

  // Call out any visible trait that skipped the parents — the payoff moment.
  const species = speciesOf(monster);
  const skipped: string[] = [];
  for (const slot of species.slots) {
    const mine = phenotype[slot.id];
    if (!mine) continue;
    const inParents = parentPhenotypes.some((parent) => parent[slot.id]?.value === mine.value);
    const inGrandparents = grandparentPhenotypes.some(
      (grandparent) => grandparent[slot.id]?.value === mine.value,
    );
    if (!inParents && inGrandparents) {
      skipped.push(`${slot.label} — ${alleleLabels(species, slot.id, mine.alleleIds)}`);
    }
  }

  return `
    ${
      skipped.length > 0
        ? `<div class="callout">
             <strong>Skipped a generation.</strong>
             ${escapeHtml(monster.name)} shows a trait neither parent has, but a grandparent does —
             ${skipped.map(escapeHtml).join('; ')}.
           </div>`
        : ''
    }
    <div class="tree">
      <div class="tier">
        <h4>Grandparents</h4>
        <div class="row">
          ${
            grandparents.length > 0
              ? grandparents.map((gp) => monsterCard(gp, { compact: true })).join('')
              : '<p class="hint">None recorded.</p>'
          }
        </div>
      </div>
      <div class="tier">
        <h4>Parents</h4>
        <div class="row">${parents.map((p) => monsterCard(p, { compact: true })).join('')}</div>
      </div>
      <div class="tier">
        <h4>${escapeHtml(monster.name)}</h4>
        <div class="row">${monsterCard(monster, { compact: true })}</div>
      </div>
    </div>`;
}

function advancedView(monster: Monster): string {
  const species = speciesOf(monster);
  const phenotype = phenotypeOf(monster);
  const rows = species.slots
    .map((slot) => {
      const pair = monster.genotype[slot.id]!;
      const trait = phenotype[slot.id]!;
      const carried = trait.carriedAlleleId;
      return `
        <tr${carried ? ' class="has-carrier"' : ''}>
          <td>${escapeHtml(slot.label)}</td>
          <td class="mono">${escapeHtml(pair.join(' / '))}</td>
          <td>${escapeHtml(trait.value)}${trait.isMutation ? ' ✦' : ''}</td>
          <td>${carried ? `<span class="carrier">carries ${escapeHtml(carried)}</span>` : '—'}</td>
        </tr>`;
    })
    .join('');

  const stats = Object.entries(monster.statPotential)
    .map(
      ([stat, value]) =>
        `<li><span>${escapeHtml(stat)}</span><strong>${monster.statsTrained[stat as keyof typeof monster.statsTrained]}</strong> / ${value}</li>`,
    )
    .join('');

  return `
    <div class="advanced">
      <h4>Genotype — ${escapeHtml(monster.name)}</h4>
      <table>
        <thead><tr><th>Slot</th><th>Inherited pair</th><th>Expressed</th><th>Hidden</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <h4>Stats — trained / potential (§12)</h4>
      <ul class="stats">${stats}</ul>
      ${
        monster.quirks.length > 0
          ? `<h4>Quirks</h4><ul class="quirks">${monster.quirks
              .map((quirk) => `<li>${escapeHtml(quirk)}</li>`)
              .join('')}</ul>`
          : ''
      }
      <p class="hint mono">seed: ${escapeHtml(monster.appearanceSeed)}</p>
    </div>`;
}

/**
 * The registry panel (§18).
 *
 * Reads a candidate standard off the inspected monster, finds everyone on the
 * ranch who meets it, and shows the §18.1 checklist. Presented as progress
 * rather than a pass/fail, so a player can see what the line still needs.
 */
function registryView(exemplar: Monster): string {
  const species = speciesOf(exemplar);
  const proposal = proposeStandard(species, exemplar, phenotypeOf);
  const roster = state.order.map((id) => state.monsters.get(id)!);
  const members = qualifyingMembers(species.id, proposal.hallmarks, roster, phenotypeOf);
  const evaluation = evaluateBreed(proposal.hallmarks, members, lookup);

  const existing = breedOf(exemplar);
  if (existing) {
    return breedCard(existing, members.length);
  }

  const checklist = evaluation.requirements
    .map(
      (requirement) => `
        <li class="${requirement.met ? 'met' : 'unmet'}">
          <span class="tick">${requirement.met ? '✓' : '○'}</span>
          <span class="req-label">${escapeHtml(requirement.label)}</span>
          <span class="req-detail">${escapeHtml(requirement.detail)}</span>
        </li>`,
    )
    .join('');

  return `
    <div class="registry">
      <p class="hint">A standard read from ${escapeHtml(exemplar.name)}. Any monster on the
         ranch matching all four hallmarks counts towards the breed.</p>

      <h4>Hallmark traits</h4>
      <ul class="hallmarks">
        ${proposal.hallmarks
          .map(
            (hallmark) =>
              `<li><span>${escapeHtml(
                species.slots.find((slot) => slot.id === hallmark.slotId)?.label ?? hallmark.slotId,
              )}</span><strong>${escapeHtml(hallmark.label)}</strong></li>`,
          )
          .join('')}
      </ul>

      <h4>Standard</h4>
      <p class="standard-line">
        ${escapeHtml(proposal.temperament)} ·
        ${escapeHtml(proposal.primarySpecialty)} ·
        ${escapeHtml(proposal.secondarySpecialty)}
      </p>

      <h4>Requirements (§18.1)</h4>
      <ul class="requirements">${checklist}</ul>

      <div class="register-form">
        <input type="text" data-action="breed-name" placeholder="Name this breed"
               value="${escapeHtml(state.breedName)}" maxlength="40"
               aria-label="Breed name"${evaluation.eligible ? '' : ' disabled'}/>
        <button class="primary" data-action="register-breed" data-id="${exemplar.id}"
                ${evaluation.eligible && state.breedName.trim().length > 0 ? '' : 'disabled'}>
          ${evaluation.eligible ? 'Register breed' : 'Not yet eligible'}
        </button>
      </div>
    </div>`;
}

const RANK_LABEL: Record<string, string> = {
  emerging: 'Emerging',
  recognized: 'Recognized',
  heritage: 'Heritage',
};

function breedCard(breed: RegisteredBreed, memberCount: number): string {
  return `
    <div class="breed-card">
      <div class="breed-head">
        <span class="breed-crest">${escapeHtml(breed.crest)}</span>
        <div>
          <h3>${escapeHtml(breed.name)}</h3>
          <span class="rank rank-${breed.rank}">${RANK_LABEL[breed.rank]}</span>
        </div>
      </div>
      <ul class="hallmarks">
        ${breed.hallmarks
          .map((hallmark) => `<li><strong>${escapeHtml(hallmark.label)}</strong></li>`)
          .join('')}
      </ul>
      <p class="standard-line">
        ${escapeHtml(breed.temperament)} ·
        ${escapeHtml(breed.primarySpecialty)} ·
        ${escapeHtml(breed.secondarySpecialty)}
      </p>
      <p class="hint">${memberCount} qualifying ${memberCount === 1 ? 'monster' : 'monsters'} ·
         registered on ranch day ${breed.registeredOnDay}</p>
    </div>`;
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function render(): void {
  const app = document.getElementById('app')!;
  const a = state.selectedA ? state.monsters.get(state.selectedA) : undefined;
  const b = state.selectedB ? state.monsters.get(state.selectedB) : undefined;
  const inspecting = state.inspecting ? state.monsters.get(state.inspecting) : undefined;

  app.innerHTML = `
    <header class="bar">
      <div class="brand">
        <h1>Ranchborn</h1>
        <span>Breeding prototype</span>
      </div>
      <div class="controls">
        <label>Habitat
          <select data-action="habitat">
            ${HABITATS.map(
              (habitat) =>
                `<option value="${habitat}"${habitat === state.habitat ? ' selected' : ''}>${habitat}</option>`,
            ).join('')}
          </select>
        </label>
        <span class="day">Ranch day ${state.ranchDay}</span>
        <button data-action="end-day">End ranch day</button>
        <span class="rescue">Rescue
          ${SPECIES_IDS.map(
            (id) =>
              `<button data-action="add-founder" data-species="${id}">${escapeHtml(
                state.speciesById.get(id)?.name ?? id,
              )}</button>`,
          ).join('')}
        </span>
        <button data-action="carrier-demo">Set up carrier lineage</button>
        <label class="toggle">
          <input type="checkbox" data-action="advanced"${state.advanced ? ' checked' : ''}/>
          Advanced breeder view
        </label>
      </div>
    </header>

    <main>
      <section class="roster">
        ${
          state.showGuide
            ? `<div class="guide">
                 <button class="dismiss" data-action="dismiss-guide" aria-label="Dismiss">×</button>
                 <h2>What this is</h2>
                 <p>Every monster here is drawn from its own genotype. Nothing is hand-authored —
                    change the genes and the picture changes with them. To see the point of it:</p>
                 <ol>
                   <li>Press <strong>Set up carrier lineage</strong>. It seeds two unrelated families
                       whose grandparents had stub horns.</li>
                   <li>Press <strong>Pair and hatch</strong> a dozen times. Both parents have broad
                       horns, so every hatchling should too.</li>
                   <li>Watch for a hatchling with <strong>stub horns</strong> — a trait neither parent
                       has, back from its grandparents. Roughly one in four.</li>
                 </ol>
               </div>`
            : ''
        }
        <h2>The ranch <span class="count">${state.order.length} monsters</span></h2>
        <p class="hint">Tap a monster to set Parent A, then another for Parent B. Tap again to inspect.</p>
        <div class="grid">
          ${state.order.map((id) => monsterCard(state.monsters.get(id)!)).join('')}
        </div>
      </section>

      <aside class="panel">
        <section class="pairing">
          <h2>Nursery</h2>
          ${
            a && b
              ? forecastView(a, b)
              : `<p class="hint">Select two adults to see what they would produce.
                 ${a ? `Parent A is ${escapeHtml(a.name)}.` : ''}</p>`
          }
        </section>

        ${
          inspecting
            ? `<section class="lineage">
                 <h2>Lineage</h2>
                 ${lineageView(inspecting)}
                 ${state.advanced ? advancedView(inspecting) : ''}
               </section>`
            : ''
        }

        ${
          inspecting
            ? `<section class="registry-section">
                 <h2>Breed registry</h2>
                 ${registryView(inspecting)}
               </section>`
            : ''
        }

        ${
          state.log.length > 0
            ? `<section class="log">
                 <h2>Ranch log</h2>
                 <ul>${state.log.slice(-8).reverse().map((entry) => `<li>${escapeHtml(entry)}</li>`).join('')}</ul>
               </section>`
            : ''
        }
      </aside>
    </main>`;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function selectMonster(id: string): void {
  if (state.selectedA === id) {
    state.inspecting = id;
    state.selectedA = null;
  } else if (state.selectedB === id) {
    state.inspecting = id;
    state.selectedB = null;
  } else if (state.selectedA === null) {
    state.selectedA = id;
    state.inspecting = id;
  } else if (state.selectedB === null) {
    state.selectedB = id;
    state.inspecting = id;
  } else {
    state.selectedA = state.selectedB;
    state.selectedB = id;
    state.inspecting = id;
  }
}

function breed(): void {
  const a = state.selectedA ? state.monsters.get(state.selectedA) : undefined;
  const b = state.selectedB ? state.monsters.get(state.selectedB) : undefined;
  if (!a || !b) return;
  if (!canPair(a, b, { lookup }).allowed) return;

  const id = `m${nextId++}`;
  const seed = `${id}-${Math.floor(Math.random() * 1e9)}`;
  const child = createOffspring(speciesOf(a), a, b, {
    id,
    seed,
    name: uniqueName(seed),
    birthDay: state.ranchDay,
    habitat: state.habitat,
  });

  addMonster(child);
  socialise();

  state.inspecting = child.id;
  state.log.push(
    `Day ${state.ranchDay}: ${child.name} hatched — ${a.name} × ${b.name}` +
      (child.mutationHistory.length > 0 ? ' (mutation!)' : ''),
  );
  render();
}

function doRegisterBreed(exemplarId: string): void {
  const exemplar = state.monsters.get(exemplarId);
  if (!exemplar) return;

  const species = speciesOf(exemplar);
  const proposal = proposeStandard(species, exemplar, phenotypeOf);
  const roster = state.order.map((id) => state.monsters.get(id)!);
  const members = qualifyingMembers(species.id, proposal.hallmarks, roster, phenotypeOf);
  const evaluation = evaluateBreed(proposal.hallmarks, members, lookup);
  if (!evaluation.eligible) return;

  const breed = registerBreed(species, proposal, evaluation, {
    id: `breed-${state.breeds.length + 1}`,
    name: state.breedName.trim(),
    crest: CRESTS[state.breeds.length % CRESTS.length]!,
    ranchDay: state.ranchDay,
  });

  state.breeds.push(breed);
  for (const member of applyBreedToMembers(breed, members)) {
    state.monsters.set(member.id, member);
  }

  state.log.push(
    `Day ${state.ranchDay}: registered ${breed.name} — ${members.length} qualifying monsters.`,
  );
  state.breedName = '';
  render();
}

function endRanchDay(): void {
  state.ranchDay++;
  // Growth resolves on day end, like the rest of the simulation (§6.1).
  for (const id of state.order) {
    const monster = state.monsters.get(id)!;
    if (monster.lifeStage !== 'adult' && monster.lifeStage !== 'veteran') {
      state.monsters.set(id, advanceLifeStage(monster));
    }
  }
  socialise();
  render();
}

/**
 * Seed the ranch with the setup from the inheritance tests: two unrelated lines
 * that each hide horn_stub behind dominant broad horns. Breed the two carriers
 * and roughly a quarter of the hatchlings show the grandparents' stub horns.
 */
function carrierDemo(): void {
  // The demonstration is Bramblehorn-specific: it relies on horn_stub being the
  // lowest-ranked horn allele. Other species have their own recessives, but
  // scripting one lineage is enough to show the mechanism.
  const species = state.speciesById.get('bramblehorn');
  if (!species) return;

  const base: Record<string, readonly [string, string]> = {};
  for (const slot of species.slots) {
    const allele = slot.alleles.find((candidate) => candidate.mutation !== true)!;
    base[slot.id] = [allele.id, allele.id] as const;
  }

  const makeLine = (label: string): Monster => {
    const stubId = `m${nextId++}`;
    const broadId = `m${nextId++}`;
    const stub = addMonster(
      createFounder(species, {
        id: stubId,
        seed: `${label}-stub`,
        name: `${label} Stubhorn`,
        genotype: { ...base, horns: ['horn_stub', 'horn_stub'] as const },
      }),
    );
    const broad = addMonster(
      createFounder(species, {
        id: broadId,
        seed: `${label}-broad`,
        name: `${label} Broadhorn`,
        genotype: {
          ...base,
          horns: ['horn_broad', 'horn_broad'] as const,
          coatPrimary: ['coat_bark', 'coat_bark'] as const,
        },
      }),
    );

    const childId = `m${nextId++}`;
    let child = createOffspring(species, stub, broad, {
      id: childId,
      seed: `${label}-carrier`,
      name: `${label} Carrier`,
      mutation: { habitatMultiplier: 0 },
    });
    child = advanceLifeStage(advanceLifeStage(child));
    return addMonster(child);
  };

  const carrierA = makeLine('Ash');
  const carrierB = makeLine('Fen');
  socialise();

  state.selectedA = carrierA.id;
  state.selectedB = carrierB.id;
  state.inspecting = carrierA.id;
  state.log.push(
    'Set up two carrier lines. Both parents show broad horns; their grandparents had stub horns.',
  );
  render();
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

async function boot(): Promise<void> {
  const speciesById = await loadAllSpecies();

  state = {
    speciesById,
    monsters: new Map(),
    order: [],
    selectedA: null,
    selectedB: null,
    inspecting: null,
    habitat: 'homestead',
    advanced: false,
    showGuide: true,
    ranchDay: 1,
    log: [],
    breeds: [],
    breedName: '',
  };

  // Two adults of each species, so every one of them can be bred immediately.
  for (const speciesId of SPECIES_IDS) {
    newFounder(speciesId);
    newFounder(speciesId);
  }

  const app = document.getElementById('app')!;

  app.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!target) return;
    const action = target.dataset['action'];

    switch (action) {
      case 'select': {
        const id = target.dataset['id'];
        if (id) {
          selectMonster(id);
          render();
        }
        break;
      }
      case 'breed':
        breed();
        break;
      case 'end-day':
        endRanchDay();
        break;
      case 'add-founder': {
        const speciesId = target.dataset['species'];
        if (speciesId) {
          newFounder(speciesId);
          render();
        }
        break;
      }
      case 'carrier-demo':
        carrierDemo();
        break;
      case 'register-breed': {
        const id = target.dataset['id'];
        if (id) doRegisterBreed(id);
        break;
      }
      case 'dismiss-guide':
        state.showGuide = false;
        render();
        break;
      default:
        break;
    }
  });

  app.addEventListener('change', (event) => {
    const target = event.target as HTMLElement;
    const action = target.dataset['action'];
    if (action === 'habitat') {
      state.habitat = (target as HTMLSelectElement).value;
      render();
    } else if (action === 'advanced') {
      state.advanced = (target as HTMLInputElement).checked;
      render();
    }
  });

  // Typing the breed name must not trigger a re-render — that would move focus
  // out of the field on every keystroke. Update state and toggle the button.
  app.addEventListener('input', (event) => {
    const target = event.target as HTMLElement;
    if (target.dataset['action'] !== 'breed-name') return;
    state.breedName = (target as HTMLInputElement).value;
    const button = app.querySelector<HTMLButtonElement>('[data-action="register-breed"]');
    if (button) button.disabled = state.breedName.trim().length === 0;
  });

  // Keyboard parity with tapping, per the accessibility notes (§33).
  app.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action="select"]');
    if (!target?.dataset['id']) return;
    event.preventDefault();
    selectMonster(target.dataset['id']);
    render();
  });

  render();
}

void boot();
