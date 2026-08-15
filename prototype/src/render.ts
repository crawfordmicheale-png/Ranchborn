/**
 * Draws a Bramblehorn from its phenotype.
 *
 * This is a stand-in for the real pipeline, not a preview of the final art. It
 * is built the way §30.3 describes the 3D pipeline — one shared body, swappable
 * species parts, pattern masks over a palette — so that what the prototype
 * proves about inheritance carries over when these become actual models.
 *
 * Rendering is a pure function of the phenotype. No randomness: two monsters
 * with the same genotype must be indistinguishable, or family resemblance stops
 * meaning anything (§3.3).
 */

import type { Phenotype } from '../../sim/src/types.js';

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function parseHex(hex: string): [number, number, number] {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return [140, 140, 140];
  const value = Number.parseInt(match[1]!, 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((channel) => clampByte(channel).toString(16).padStart(2, '0')).join('')}`;
}

/** Positive amount lightens, negative darkens. */
function shade(hex: string, amount: number): string {
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

interface BuildSpec {
  bodyRx: number;
  bodyRy: number;
  legWidth: number;
  legHeight: number;
  scale: number;
}

const BUILDS: Record<string, BuildSpec> = {
  compact: { bodyRx: 46, bodyRy: 37, legWidth: 12, legHeight: 26, scale: 0.94 },
  standard: { bodyRx: 55, bodyRy: 41, legWidth: 14, legHeight: 30, scale: 1 },
  broad: { bodyRx: 65, bodyRy: 46, legWidth: 17, legHeight: 28, scale: 1.06 },
};

interface HeadSpec {
  rx: number;
  ry: number;
  muzzleRx: number;
  muzzleRy: number;
}

const HEADS: Record<string, HeadSpec> = {
  round: { rx: 27, ry: 25, muzzleRx: 15, muzzleRy: 12 },
  long: { rx: 29, ry: 22, muzzleRx: 20, muzzleRy: 12 },
  broad: { rx: 31, ry: 27, muzzleRx: 18, muzzleRy: 14 },
  fine: { rx: 24, ry: 21, muzzleRx: 13, muzzleRy: 10 },
};

const HEAD_X = 62;
const HEAD_Y = 74;
const BODY_X = 122;
const BODY_Y = 118;

function pick<T>(table: Record<string, T>, key: string, fallback: string): T {
  return table[key] ?? table[fallback]!;
}

// ---------------------------------------------------------------------------
// Parts
// ---------------------------------------------------------------------------

function drawHorns(kind: string, outline: string): string {
  const bone = '#efe4cf';
  const boneDark = '#cbb894';
  const stroke = `stroke="${outline}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;

  // Horns are the species' silhouette read (§30.2), so every variant has to
  // clear the top of the head rather than sweep across it — anything drawn at
  // head height disappears behind the skull at card size.
  switch (kind) {
    case 'broad':
      // Thick at the skull, tapering to a point — a horn, not an antenna.
      return `
        <path d="M40 60 C 26 52, 10 40, 6 16 C 18 30, 34 44, 58 54 Z" fill="${bone}" ${stroke}/>
        <path d="M86 60 C 100 52, 116 40, 120 16 C 108 30, 92 44, 68 54 Z" fill="${bone}" ${stroke}/>`;
    case 'curved':
      return `
        <path d="M42 60 C 30 46, 22 28, 30 8 C 36 26, 46 42, 57 55 Z" fill="${bone}" ${stroke}/>
        <path d="M84 60 C 96 46, 104 28, 96 8 C 90 26, 80 42, 69 55 Z" fill="${bone}" ${stroke}/>`;
    case 'straight':
      return `
        <path d="M40 58 C 38 36, 38 20, 40 8 C 48 22, 54 40, 57 55 Z" fill="${bone}" ${stroke}/>
        <path d="M86 58 C 88 36, 88 20, 86 8 C 78 22, 72 40, 69 55 Z" fill="${bone}" ${stroke}/>`;
    case 'stub':
      // Small, but still has to poke above the skull line to be legible.
      return `
        <ellipse cx="50" cy="42" rx="9" ry="13" fill="${bone}" ${stroke}/>
        <ellipse cx="78" cy="40" rx="9" ry="13" fill="${bone}" ${stroke}/>`;
    case 'blossom': {
      // The mutation: antlers that branch and flower (§17.3).
      const petal = '#ffd7e6';
      const petalCore = '#ffb43f';
      const flower = (x: number, y: number, r: number): string => `
        <g>
          ${[0, 72, 144, 216, 288]
            .map(
              (angle) =>
                `<ellipse cx="${x}" cy="${y - r}" rx="${r * 0.62}" ry="${r}" fill="${petal}" transform="rotate(${angle} ${x} ${y})"/>`,
            )
            .join('')}
          <circle cx="${x}" cy="${y}" r="${r * 0.62}" fill="${petalCore}"/>
        </g>`;
      return `
        <path d="M50 54 C 40 34, 28 30, 20 34 M50 54 C 46 30, 40 20, 30 14 M50 54 L 50 30"
              fill="none" ${stroke} stroke-width="5" stroke="${boneDark}"/>
        <path d="M76 52 C 86 32, 98 28, 106 32 M76 52 C 80 28, 86 18, 96 12 M76 52 L 76 28"
              fill="none" stroke="${boneDark}" stroke-width="5" stroke-linecap="round"/>
        ${flower(20, 32, 7)}
        ${flower(30, 12, 6)}
        ${flower(106, 30, 7)}
        ${flower(96, 10, 6)}
        ${flower(50, 28, 5)}
        ${flower(76, 26, 5)}`;
    }
    default:
      return '';
  }
}

function drawEars(kind: string, coat: string, inner: string, outline: string): string {
  const stroke = `stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"`;
  switch (kind) {
    case 'leaf':
      return `
        <path d="M40 62 C 22 54, 14 62, 20 74 C 28 80, 38 74, 40 62 Z" fill="${coat}" ${stroke}/>
        <path d="M86 60 C 104 50, 114 58, 108 70 C 100 78, 88 72, 86 60 Z" fill="${coat}" ${stroke}/>`;
    case 'round':
      return `
        <circle cx="34" cy="62" r="12" fill="${coat}" ${stroke}/>
        <circle cx="92" cy="60" r="12" fill="${coat}" ${stroke}/>
        <circle cx="34" cy="62" r="6" fill="${inner}"/>
        <circle cx="92" cy="60" r="6" fill="${inner}"/>`;
    case 'tufted':
      return `
        <path d="M40 62 L 22 40 L 36 46 L 42 60 Z" fill="${coat}" ${stroke}/>
        <path d="M86 60 L 104 38 L 106 52 L 90 60 Z" fill="${coat}" ${stroke}/>
        <path d="M26 44 L 20 34 L 32 40 Z" fill="${inner}"/>
        <path d="M102 42 L 108 32 L 110 44 Z" fill="${inner}"/>`;
    case 'drooped':
      return `
        <ellipse cx="32" cy="76" rx="10" ry="17" fill="${coat}" ${stroke} transform="rotate(-18 32 76)"/>
        <ellipse cx="94" cy="74" rx="10" ry="17" fill="${coat}" ${stroke} transform="rotate(18 94 74)"/>`;
    default:
      return '';
  }
}

function drawTail(kind: string, coat: string, tuft: string, outline: string): string {
  const stroke = `stroke="${outline}" stroke-width="2.5" stroke-linecap="round"`;
  switch (kind) {
    case 'long':
      return `
        <path d="M184 108 C 208 96, 214 72, 200 58" fill="none" ${stroke} stroke-width="7" stroke="${coat}"/>
        <circle cx="199" cy="56" r="9" fill="${tuft}" ${stroke}/>`;
    case 'tuft':
      return `
        <path d="M182 106 C 198 100, 204 88, 200 78" fill="none" stroke="${coat}" stroke-width="8" stroke-linecap="round"/>
        <circle cx="201" cy="74" r="12" fill="${tuft}" ${stroke}/>`;
    case 'short':
      return `<circle cx="186" cy="100" r="10" fill="${tuft}" ${stroke}/>`;
    default:
      return '';
  }
}

/**
 * Coat patterns, drawn inside a clip so they follow the body (§30.3 pattern
 * masks). `gold_stripe` is the exception — it is a facial marking, and one of
 * the four hallmarks of the Sunorchard Bramblehorn in §18.2.
 */
function drawBodyPattern(kind: string, build: BuildSpec, mark: string): string {
  switch (kind) {
    case 'patch':
      return `
        <ellipse cx="${BODY_X - 22}" cy="${BODY_Y - 10}" rx="24" ry="19" fill="${mark}"/>
        <ellipse cx="${BODY_X + 26}" cy="${BODY_Y + 12}" rx="19" ry="15" fill="${mark}"/>`;
    case 'dapple':
      return [
        [-30, -14, 8], [-8, -20, 6], [14, -12, 9], [34, -2, 7],
        [-24, 10, 7], [0, 6, 6], [22, 16, 8], [42, 14, 5],
      ]
        .map(([dx, dy, r]) => `<circle cx="${BODY_X + dx!}" cy="${BODY_Y + dy!}" r="${r}" fill="${mark}"/>`)
        .join('');
    case 'stripe':
      return [-34, -16, 2, 20, 38]
        .map(
          (dx) =>
            `<rect x="${BODY_X + dx - 5}" y="${BODY_Y - build.bodyRy}" width="10" height="${build.bodyRy * 2}" rx="5" fill="${mark}"/>`,
        )
        .join('');
    case 'moonlit':
      // The mutation pattern: soft glowing crescents (§17.3).
      return [
        [-26, -12, 11], [6, -18, 9], [28, 4, 12], [-6, 14, 8],
      ]
        .map(
          ([dx, dy, r]) => `
            <circle cx="${BODY_X + dx!}" cy="${BODY_Y + dy!}" r="${r}" fill="#dff0ff" opacity="0.85"/>
            <circle cx="${BODY_X + dx! + r! * 0.35}" cy="${BODY_Y + dy!}" r="${r! * 0.82}" fill="${mark}"/>`,
        )
        .join('');
    default:
      return '';
  }
}

function drawFacialStripe(kind: string): string {
  if (kind !== 'gold_stripe') return '';
  return `<path d="M${HEAD_X} ${HEAD_Y - 24} C ${HEAD_X - 4} ${HEAD_Y - 6}, ${HEAD_X - 6} ${HEAD_Y + 8}, ${HEAD_X - 10} ${HEAD_Y + 20}"
            stroke="#f5c542" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.95"/>`;
}

function drawAccents(value: string): string {
  const parts = value.split('+');
  let out = '';

  if (parts.includes('bloom')) {
    const bloom = (x: number, y: number, r: number): string =>
      `<g>${[0, 60, 120, 180, 240, 300]
        .map(
          (angle) =>
            `<ellipse cx="${x}" cy="${y - r}" rx="${r * 0.5}" ry="${r * 0.9}" fill="#ffd9ec" transform="rotate(${angle} ${x} ${y})"/>`,
        )
        .join('')}<circle cx="${x}" cy="${y}" r="${r * 0.5}" fill="#ffc94d"/></g>`;
    out += bloom(150, 88, 7) + bloom(168, 100, 5) + bloom(134, 82, 5);
  }

  if (parts.includes('stone')) {
    out += `
      <path d="M96 108 L 106 100 L 116 108 L 110 118 L 99 117 Z" fill="#9aa4ad" stroke="#6f7981" stroke-width="2"/>
      <path d="M118 128 L 126 122 L 133 130 L 127 137 Z" fill="#9aa4ad" stroke="#6f7981" stroke-width="2"/>`;
  }

  if (parts.includes('glow')) {
    // Spirit glow mutation — soft light along the flank.
    out += `
      <g opacity="0.9">
        ${[[100, 96], [122, 90], [144, 96], [156, 112], [112, 136], [138, 140]]
          .map(
            ([x, y]) => `
            <circle cx="${x}" cy="${y}" r="9" fill="#9ff2ff" opacity="0.35"/>
            <circle cx="${x}" cy="${y}" r="3.5" fill="#e8ffff"/>`,
          )
          .join('')}
      </g>`;
  }

  return out;
}

function drawMoss(surface: string): string {
  if (surface !== 'mossy') return '';
  return `
    <g opacity="0.92">
      <path d="M92 92 C 104 80, 128 78, 148 84 C 164 88, 176 96, 178 104
               C 160 98, 140 96, 120 98 C 106 100, 96 98, 92 92 Z" fill="#6f9152"/>
      <circle cx="106" cy="88" r="6" fill="#83a862"/>
      <circle cx="132" cy="84" r="7" fill="#83a862"/>
      <circle cx="158" cy="92" r="6" fill="#83a862"/>
    </g>`;
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

export interface RenderOptions {
  /** Rendered pixel size. The viewBox is fixed, so this only scales. */
  size?: number;
  /** Extra classes on the root <svg>. */
  className?: string;
}

/**
 * Build the full SVG for one monster. Layer order runs back to front so parts
 * overlap the way a real rig would: tail, far legs, body, near legs, neck,
 * head, ears, horns, face.
 */
export function renderBramblehorn(phenotype: Phenotype, options: RenderOptions = {}): string {
  const valueOf = (slotId: string, fallback: string): string =>
    phenotype[slotId]?.value ?? fallback;

  const build = pick(BUILDS, valueOf('bodyBuild', 'standard'), 'standard');
  const head = pick(HEADS, valueOf('headShape', 'round'), 'round');

  const coat = valueOf('coatPrimary', '#7d9b62');
  const under = valueOf('coatSecondary', '#f0e6cd');
  // Pale coats need a harder outline or the silhouette stops reading at card
  // size, which is the one thing §30.2 will not tolerate.
  const outline = shade(coat, -0.52);
  const legColour = shade(coat, -0.16);
  const mark = shade(coat, -0.24);
  const innerEar = shade(under, -0.1);
  const hoof = shade(coat, -0.55);

  const pattern = valueOf('pattern', 'none');
  const size = options.size ?? 260;
  const className = options.className ? ` class="${options.className}"` : '';

  // A stable id keeps multiple monsters on one page from sharing a clip path.
  const clipId = `body-clip-${Math.abs(hashString(JSON.stringify(phenotype)))}`;

  const legY = BODY_Y + build.bodyRy - 6;
  const leg = (x: number, colour: string): string => `
    <rect x="${x}" y="${legY}" width="${build.legWidth}" height="${build.legHeight}"
          rx="${build.legWidth / 2}" fill="${colour}" stroke="${outline}" stroke-width="2.5"/>
    <rect x="${x}" y="${legY + build.legHeight - 8}" width="${build.legWidth}" height="8"
          rx="4" fill="${hoof}"/>`;

  return `
<svg${className} viewBox="0 0 240 210" width="${size}" height="${(size * 210) / 240}"
     xmlns="http://www.w3.org/2000/svg" role="img">
  <defs>
    <clipPath id="${clipId}">
      <ellipse cx="${BODY_X}" cy="${BODY_Y}" rx="${build.bodyRx}" ry="${build.bodyRy}"/>
    </clipPath>
  </defs>

  <g transform="translate(120 105) scale(${build.scale}) translate(-120 -105)">
    ${drawTail(valueOf('tail', 'tuft'), coat, shade(coat, 0.22), outline)}

    <!-- Far legs sit behind the body. -->
    ${leg(BODY_X - 34, shade(legColour, -0.12))}
    ${leg(BODY_X + 20, shade(legColour, -0.12))}

    <!-- Neck sits behind the body so the join is hidden rather than drawn over it. -->
    <path d="M${HEAD_X + 8} ${HEAD_Y + 14} L ${BODY_X - build.bodyRx + 10} ${BODY_Y - 22}
             L ${BODY_X - build.bodyRx + 30} ${BODY_Y + 14} L ${HEAD_X + 14} ${HEAD_Y + 34} Z"
          fill="${coat}" stroke="${outline}" stroke-width="3" stroke-linejoin="round"/>

    <ellipse cx="${BODY_X}" cy="${BODY_Y}" rx="${build.bodyRx}" ry="${build.bodyRy}"
             fill="${coat}" stroke="${outline}" stroke-width="3"/>

    <g clip-path="url(#${clipId})">
      <ellipse cx="${BODY_X - 4}" cy="${BODY_Y + build.bodyRy * 0.55}"
               rx="${build.bodyRx * 0.82}" ry="${build.bodyRy * 0.55}" fill="${under}"/>
      ${drawBodyPattern(pattern, build, mark)}
    </g>
    ${drawMoss(valueOf('surface', 'plain'))}
    <ellipse cx="${BODY_X}" cy="${BODY_Y}" rx="${build.bodyRx}" ry="${build.bodyRy}"
             fill="none" stroke="${outline}" stroke-width="3"/>

    ${leg(BODY_X - 46, legColour)}
    ${leg(BODY_X + 8, legColour)}

    ${drawEars(valueOf('ears', 'round'), coat, innerEar, outline)}
    ${drawHorns(valueOf('horns', 'curved'), outline)}

    <ellipse cx="${HEAD_X}" cy="${HEAD_Y}" rx="${head.rx}" ry="${head.ry}"
             fill="${coat}" stroke="${outline}" stroke-width="3"/>
    ${drawFacialStripe(pattern)}
    <ellipse cx="${HEAD_X - head.rx * 0.42}" cy="${HEAD_Y + head.ry * 0.46}"
             rx="${head.muzzleRx}" ry="${head.muzzleRy}" fill="${under}"
             stroke="${outline}" stroke-width="2.5"/>
    <ellipse cx="${HEAD_X - head.rx * 0.62}" cy="${HEAD_Y + head.ry * 0.34}" rx="4" ry="3" fill="${outline}"/>

    <!-- Large, simple eyes: the main mood read at phone scale (§30.2). -->
    <circle cx="${HEAD_X - 9}" cy="${HEAD_Y - 4}" r="6.5" fill="#2c2620"/>
    <circle cx="${HEAD_X + 15}" cy="${HEAD_Y - 6}" r="6.5" fill="#2c2620"/>
    <circle cx="${HEAD_X - 7}" cy="${HEAD_Y - 6.5}" r="2.4" fill="#ffffff"/>
    <circle cx="${HEAD_X + 17}" cy="${HEAD_Y - 8.5}" r="2.4" fill="#ffffff"/>

    ${drawAccents(valueOf('accent', 'none'))}
  </g>
</svg>`.trim();
}

function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash | 0;
}
