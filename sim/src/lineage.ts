/**
 * Family trees and relatedness (§29.3 Lineage, §16.1 pairing rules).
 */

import type { Monster } from './types.js';

/** How the caller resolves a monster id. Keeps the core free of any store. */
export type MonsterLookup = (id: string) => Monster | undefined;

/**
 * Every ancestor within `depth` generations, nearest first.
 * Depth 1 is parents, depth 2 adds grandparents.
 */
export function ancestorsOf(monster: Monster, lookup: MonsterLookup, depth = 2): Monster[] {
  const found: Monster[] = [];
  const seen = new Set<string>();

  let frontier: Monster[] = [monster];
  for (let generation = 0; generation < depth; generation++) {
    const next: Monster[] = [];
    for (const current of frontier) {
      if (!current.parentIds) continue;
      for (const parentId of current.parentIds) {
        if (seen.has(parentId)) continue;
        seen.add(parentId);
        const parent = lookup(parentId);
        if (!parent) continue;
        found.push(parent);
        next.push(parent);
      }
    }
    frontier = next;
    if (frontier.length === 0) break;
  }

  return found;
}

export function ancestorIdsOf(monster: Monster, lookup: MonsterLookup, depth = 2): Set<string> {
  return new Set(ancestorsOf(monster, lookup, depth).map((ancestor) => ancestor.id));
}

/** Both parents, in order, where they are still resolvable. */
export function parentsOf(monster: Monster, lookup: MonsterLookup): Monster[] {
  if (!monster.parentIds) return [];
  return monster.parentIds
    .map((id) => lookup(id))
    .filter((parent): parent is Monster => parent !== undefined);
}

export function grandparentsOf(monster: Monster, lookup: MonsterLookup): Monster[] {
  return parentsOf(monster, lookup).flatMap((parent) => parentsOf(parent, lookup));
}

export interface Relatedness {
  /** True when the pair is too close to breed (§16.1). */
  closeRelatives: boolean;
  /** Human-readable reason, for the pairing UI. */
  reason?: string;
}

/** How many generations back the direct-ancestor check looks. */
const ANCESTOR_SEARCH_DEPTH = 4;

/**
 * Close-relative test for pairing (§16.1).
 *
 * "Close relative" is left undefined by the bible, so this draws the line where
 * animal husbandry draws it: a pairing is blocked when the two share a parent
 * (full or half siblings) or when one descends from the other. Cousins are
 * allowed.
 *
 * Permitting cousins is deliberate rather than lax. Line breeding — deliberately
 * concentrating a bloodline through cousins — is how a breeder actually fixes a
 * trait, which is the entire activity §18 is built around. It is also forced by
 * the registration requirements: §18.1 asks for three generations from "at least
 * two founder branches", and with exactly two branches every third-generation
 * pairing is between first cousins. Blocking cousins would make the bible's own
 * minimum unreachable.
 *
 * Unlike compatibility, which only slows a pairing down, this is a hard block.
 */
export function checkRelatedness(a: Monster, b: Monster, lookup: MonsterLookup): Relatedness {
  if (a.id === b.id) {
    return { closeRelatives: true, reason: 'A monster cannot be paired with itself' };
  }

  if (ancestorIdsOf(a, lookup, ANCESTOR_SEARCH_DEPTH).has(b.id)) {
    return { closeRelatives: true, reason: `${b.name} is a direct ancestor of ${a.name}` };
  }
  if (ancestorIdsOf(b, lookup, ANCESTOR_SEARCH_DEPTH).has(a.id)) {
    return { closeRelatives: true, reason: `${a.name} is a direct ancestor of ${b.name}` };
  }

  const parentsA = new Set(a.parentIds ?? []);
  for (const parentId of b.parentIds ?? []) {
    if (parentsA.has(parentId)) {
      const shared = lookup(parentId);
      const fullSiblings = (b.parentIds ?? []).every((id) => parentsA.has(id));
      return {
        closeRelatives: true,
        reason: `${fullSiblings ? 'Siblings' : 'Half siblings'} — both are offspring of ${
          shared?.name ?? parentId
        }`,
      };
    }
  }

  return { closeRelatives: false };
}

/**
 * Share of a monster's two-generation ancestry traceable to one founder.
 * Surfaces as "lineage concentration" in the advanced breeder view (§16.4).
 */
export function lineageConcentration(
  monster: Monster,
  founderId: string,
  lookup: MonsterLookup,
  depth = 3,
): number {
  const ancestors = ancestorsOf(monster, lookup, depth);
  if (ancestors.length === 0) return monster.id === founderId ? 1 : 0;
  const matches = ancestors.filter((ancestor) => ancestor.id === founderId).length;
  return matches / ancestors.length;
}
