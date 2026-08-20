/**
 * Loading species definitions in the browser.
 *
 * Two delivery paths, one parser. The standalone build (`npm run bundle`)
 * inlines every species on `globalThis`, so the page opens from a file with no
 * server and no network. Served from `npm run serve`, the same code fetches the
 * JSON from disk, so editing species data during development needs no rebuild.
 */

import { parseSpecies } from '../../sim/src/species.js';
import type { SpeciesDef } from '../../sim/src/types.js';

/** Load order also decides the order species appear in the UI. */
export const SPECIES_IDS = ['bramblehorn', 'cinderpup', 'puddlekin'] as const;

declare global {
  // eslint-disable-next-line no-var
  var __RANCHBORN_SPECIES__: Record<string, unknown> | undefined;
}

async function rawSpecies(id: string): Promise<unknown> {
  const embedded = globalThis.__RANCHBORN_SPECIES__;
  if (embedded && embedded[id] !== undefined) return embedded[id];

  const response = await fetch(`/sim/data/species/${id}.json`);
  if (!response.ok) {
    throw new Error(
      `could not load species "${id}" (${response.status}). Run "npm run serve" from the repo root.`,
    );
  }
  return response.json();
}

export async function loadAllSpecies(): Promise<Map<string, SpeciesDef>> {
  const loaded = await Promise.all(
    SPECIES_IDS.map(async (id) => [id, parseSpecies(await rawSpecies(id), id)] as const),
  );
  return new Map(loaded);
}
