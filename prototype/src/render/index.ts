/**
 * Species renderer registry.
 *
 * Adding a species means adding a drawing module and one line here. The app
 * never branches on species itself.
 */

import type { Phenotype } from '../../../sim/src/types.js';
import type { RenderOptions } from './shared.js';
import { renderBramblehorn } from './bramblehorn.js';
import { renderCinderpup } from './cinderpup.js';
import { renderPuddlekin } from './puddlekin.js';

export type SpeciesRenderer = (phenotype: Phenotype, options?: RenderOptions) => string;

const RENDERERS: Record<string, SpeciesRenderer> = {
  bramblehorn: renderBramblehorn,
  cinderpup: renderCinderpup,
  puddlekin: renderPuddlekin,
};

export function hasRenderer(speciesId: string): boolean {
  return speciesId in RENDERERS;
}

/**
 * Draw any monster. A species with data but no drawing module is a build error
 * worth surfacing loudly rather than rendering an empty box.
 */
export function renderSpecies(
  speciesId: string,
  phenotype: Phenotype,
  options: RenderOptions = {},
): string {
  const renderer = RENDERERS[speciesId];
  if (!renderer) throw new Error(`no renderer registered for species "${speciesId}"`);
  return renderer(phenotype, options);
}

export type { RenderOptions };
