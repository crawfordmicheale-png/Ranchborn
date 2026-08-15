#!/usr/bin/env node
/**
 * Renders a contact sheet of every trait variant, one monster per allele, with
 * all other slots held constant.
 *
 * Art review tool: it is the fastest way to check that each variant is
 * distinguishable at card size (§30.2) and that no allele silently renders as
 * nothing. Run `npm run build` first, then `node scripts/variant-sheet.js`.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const { parseSpecies } = await import(`${root}dist/sim/src/species.js`);
const { expressGenotype } = await import(`${root}dist/sim/src/genetics.js`);
const { renderBramblehorn } = await import(`${root}dist/prototype/src/render.js`);

const speciesId = process.argv[2] ?? 'bramblehorn';
const species = parseSpecies(
  JSON.parse(await readFile(`${root}sim/data/species/${speciesId}.json`, 'utf8')),
  speciesId,
);

/**
 * Baseline: the most common ordinary allele in each slot, so every card is a
 * typical Bramblehorn varying in exactly one place. Picking the *first* allele
 * instead would put a rare hallmark (the gold facial stripe) on every card.
 */
const base = {};
for (const slot of species.slots) {
  const allele = slot.alleles
    .filter((candidate) => candidate.mutation !== true)
    .reduce((best, candidate) => (candidate.weight > best.weight ? candidate : best));
  base[slot.id] = [allele.id, allele.id];
}

const sections = species.slots
  .map((slot) => {
    const cells = slot.alleles
      .map((allele) => {
        // Environmental alleles only show in their habitat, so render them there.
        const habitat = allele.requiresHabitat;
        const genotype = { ...base, [slot.id]: [allele.id, allele.id] };
        const phenotype = expressGenotype(species, genotype, habitat ? { habitat } : {});
        return `
          <figure>
            ${renderBramblehorn(phenotype, { size: 190 })}
            <figcaption>
              <strong>${allele.label}</strong>${allele.mutation ? ' <em>mutation</em>' : ''}
              <span>${allele.id}${habitat ? ` · in ${habitat}` : ''}</span>
            </figcaption>
          </figure>`;
      })
      .join('');
    return `<section><h2>${slot.label} <em>(${slot.expression})</em></h2><div class="row">${cells}</div></section>`;
  })
  .join('');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<title>${species.name} — variant sheet</title>
<link rel="icon" href="data:,"/>
<style>
  body { margin:0; padding:24px; background:#f6efe2; color:#3b3128;
         font:15px/1.5 ui-rounded,"Segoe UI",system-ui,sans-serif; }
  h1 { margin:0 0 4px; } .lede { color:#6d5f50; margin:0 0 24px; }
  section { margin-bottom:28px; }
  h2 { font-size:.9rem; text-transform:uppercase; letter-spacing:.08em; color:#6d5f50;
       border-bottom:2px solid #d8c8ac; padding-bottom:6px; }
  h2 em { text-transform:none; letter-spacing:0; font-weight:400; }
  .row { display:flex; flex-wrap:wrap; gap:12px; margin-top:12px; }
  figure { margin:0; background:#fffaf0; border:2px solid #d8c8ac; border-radius:14px; padding:8px;
           width:206px; box-shadow:0 2px 0 rgba(90,70,45,.18); }
  figure svg { display:block; margin:0 auto; background:linear-gradient(180deg,#eaf1dc,#dce7c8);
               border-radius:10px; max-width:100%; height:auto; }
  figcaption { text-align:center; margin-top:6px; font-size:.78rem; }
  figcaption span { display:block; color:#6d5f50; font-family:ui-monospace,Menlo,monospace; font-size:.7rem; }
  figcaption em { color:#b4543a; font-style:normal; font-weight:700; }
</style></head>
<body>
  <h1>${species.name} — variant sheet</h1>
  <p class="lede">Every allele rendered in isolation, all other slots held constant.
     ${species.slots.length} trait slots ·
     ${species.slots.reduce((total, slot) => total + slot.alleles.length, 0)} alleles.</p>
  ${sections}
</body></html>`;

await mkdir(`${root}dist`, { recursive: true });
const out = `${root}dist/variant-sheet.html`;
await writeFile(out, html, 'utf8');
console.log(`wrote ${out}`);
