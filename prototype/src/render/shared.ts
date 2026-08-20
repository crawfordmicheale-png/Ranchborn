/**
 * Rendering helpers shared by every species.
 *
 * Colour maths, the options type, and the deterministic id hash live here so
 * that adding a species means adding one drawing module, not duplicating the
 * plumbing.
 */

export function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function parseHex(hex: string): [number, number, number] {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return [140, 140, 140];
  const value = Number.parseInt(match[1]!, 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

export function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((channel) => clampByte(channel).toString(16).padStart(2, '0')).join('')}`;
}

/** Positive amount lightens, negative darkens. */
export function shade(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  const target = amount > 0 ? 255 : 0;
  const ratio = Math.abs(amount);
  return toHex([
    r + (target - r) * ratio,
    g + (target - g) * ratio,
    b + (target - b) * ratio,
  ]);
}

// ---------------------------------------------------------------------------
// Part geometry
// ---------------------------------------------------------------------------

export function pick<T>(table: Record<string, T>, key: string, fallback: string): T {
  return table[key] ?? table[fallback]!;
}

// ---------------------------------------------------------------------------
// Parts
// ---------------------------------------------------------------------------

export interface RenderOptions {
  /** Rendered pixel size. The viewBox is fixed, so this only scales. */
  size?: number;
  /** Extra classes on the root <svg>. */
  className?: string;
}

export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash | 0;
}
