/**
 * Draws a Cinderpup — an ember canine — from its phenotype.
 *
 * Deliberately built on a different chassis to the Bramblehorn: longer legs, a
 * shallower body, a projecting muzzle and a mane at the shoulders. If both
 * species shared a body and only swapped parts, the roster would read as one
 * creature in costumes, which is exactly what §9.1's "recognisable silhouette"
 * rules out.
 */

import type { Phenotype } from '../../../sim/src/types.js';
import { hashString, pick, shade } from './shared.js';
import type { RenderOptions } from './shared.js';

interface BuildSpec {
  bodyRx: number;
  bodyRy: number;
  legWidth: number;
  legHeight: number;
  scale: number;
}

const BUILDS: Record<string, BuildSpec> = {
  whippet: { bodyRx: 52, bodyRy: 29, legWidth: 9, legHeight: 42, scale: 0.95 },
  standard: { bodyRx: 58, bodyRy: 34, legWidth: 11, legHeight: 37, scale: 1 },
  sturdy: { bodyRx: 63, bodyRy: 40, legWidth: 14, legHeight: 30, scale: 1.05 },
};

interface HeadSpec {
  rx: number;
  ry: number;
  /** Snout length and depth — the main separator between canine muzzles. */
  snoutLength: number;
  snoutDepth: number;
}

const HEADS: Record<string, HeadSpec> = {
  blunt: { rx: 27, ry: 25, snoutLength: 16, snoutDepth: 15 },
  fox: { rx: 24, ry: 22, snoutLength: 30, snoutDepth: 10 },
  round: { rx: 26, ry: 26, snoutLength: 18, snoutDepth: 13 },
  narrow: { rx: 21, ry: 21, snoutLength: 26, snoutDepth: 8 },
};

const HEAD_X = 62;
const HEAD_Y = 70;
const BODY_X = 136;
const BODY_Y = 118;

function drawEars(kind: string, coat: string, inner: string, outline: string): string {
  const stroke = `stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"`;
  switch (kind) {
    case 'tall':
      return `
        <path d="M46 52 L 34 4 L 60 34 Z" fill="${coat}" ${stroke}/>
        <path d="M76 50 L 92 4 L 90 40 Z" fill="${coat}" ${stroke}/>
        <path d="M48 46 L 40 18 L 56 34 Z" fill="${inner}"/>
        <path d="M78 44 L 86 18 L 84 38 Z" fill="${inner}"/>`;
    case 'pricked':
      return `
        <path d="M46 54 L 40 22 L 64 40 Z" fill="${coat}" ${stroke}/>
        <path d="M78 52 L 88 22 L 88 46 Z" fill="${coat}" ${stroke}/>
        <path d="M48 48 L 45 30 L 58 40 Z" fill="${inner}"/>
        <path d="M79 46 L 84 30 L 84 44 Z" fill="${inner}"/>`;
    case 'wide':
      // Set low and angled outward — a much wider head silhouette.
      return `
        <path d="M42 60 L 6 40 L 40 74 Z" fill="${coat}" ${stroke}/>
        <path d="M82 58 L 118 38 L 86 72 Z" fill="${coat}" ${stroke}/>
        <path d="M40 62 L 18 50 L 38 68 Z" fill="${inner}"/>
        <path d="M84 60 L 106 48 L 86 66 Z" fill="${inner}"/>`;
    case 'folded':
      // Upright base with the top third flopped over.
      return `
        <path d="M46 54 C 42 34, 48 28, 58 30 C 54 40, 56 46, 64 42
                 C 62 52, 54 56, 46 54 Z" fill="${coat}" ${stroke}/>
        <path d="M80 52 C 84 32, 78 26, 68 28 C 72 38, 70 44, 62 40
                 C 64 50, 72 54, 80 52 Z" fill="${coat}" ${stroke}/>`;
    default:
      return '';
  }
}

/** The mane sits at the shoulders, bridging head and body. */
function drawMane(kind: string, coat: string, outline: string, ember: string): string {
  const dark = shade(coat, -0.34);
  const stroke = `stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"`;
  switch (kind) {
    case 'full':
      // A deep collar with a scalloped edge, well proud of the shoulder line.
      return `
        <path d="M96 52 C 128 56, 142 82, 136 106 C 142 112, 136 124, 126 126
                 C 116 140, 76 140, 66 126 C 56 124, 50 112, 56 106
                 C 50 82, 64 56, 96 52 Z" fill="${dark}" ${stroke}/>
        <ellipse cx="96" cy="96" rx="22" ry="21" fill="${coat}" opacity="0.5"/>`;
    case 'ruff':
      return `<ellipse cx="96" cy="96" rx="25" ry="23" fill="${dark}" ${stroke}/>`;
    case 'spiked':
      return `
        <path d="M74 96 L 84 62 L 92 88 L 104 60 L 110 90 L 122 68 L 122 108 L 76 110 Z"
              fill="${dark}" ${stroke}/>`;
    case 'sleek':
      // Barely there — a thin band, so "sleek" reads as an absence.
      return `<path d="M76 104 C 90 96, 106 96, 118 102 L 116 112 L 78 112 Z" fill="${dark}" ${stroke}/>`;
    case 'embercrown': {
      // Mutation: a mane of standing embers.
      const spike = (x: number, y: number, h: number): string =>
        `<path d="M${x - 7} ${y} L ${x} ${y - h} L ${x + 7} ${y} Z" fill="${ember}" opacity="0.92"/>`;
      return `
        <ellipse cx="96" cy="98" rx="28" ry="25" fill="${dark}" ${stroke}/>
        ${spike(78, 78, 26)}${spike(94, 70, 34)}${spike(110, 76, 28)}${spike(122, 90, 20)}
        <ellipse cx="96" cy="96" rx="18" ry="16" fill="${ember}" opacity="0.35"/>`;
    }
    default:
      return '';
  }
}

function drawBrush(kind: string, coat: string, tip: string, outline: string): string {
  const stroke = `stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"`;
  switch (kind) {
    case 'plume':
      return `
        <path d="M188 112 C 214 108, 228 84, 220 56 C 210 78, 200 92, 184 100 Z"
              fill="${coat}" ${stroke}/>
        <path d="M206 76 C 214 64, 218 58, 219 58 C 216 74, 210 86, 200 94 Z" fill="${tip}"/>`;
    case 'curl':
      return `
        <path d="M190 106 C 216 104, 224 82, 210 70 C 220 88, 206 96, 188 96 Z"
              fill="${coat}" ${stroke}/>`;
    case 'whip':
      return `
        <path d="M190 110 C 214 104, 226 86, 224 62" fill="none" stroke="${coat}"
              stroke-width="7" stroke-linecap="round"/>
        <path d="M190 110 C 214 104, 226 86, 224 62" fill="none" stroke="${outline}"
              stroke-width="2" stroke-linecap="round" opacity="0.5"/>`;
    default:
      return '';
  }
}

function drawPattern(kind: string, build: BuildSpec, mark: string, ember: string): string {
  switch (kind) {
    case 'dorsal':
      return `<path d="M${BODY_X - build.bodyRx + 8} ${BODY_Y - build.bodyRy * 0.62}
                       Q ${BODY_X} ${BODY_Y - build.bodyRy * 1.05},
                         ${BODY_X + build.bodyRx - 8} ${BODY_Y - build.bodyRy * 0.55}
                       L ${BODY_X + build.bodyRx - 8} ${BODY_Y - build.bodyRy * 0.15}
                       Q ${BODY_X} ${BODY_Y - build.bodyRy * 0.55},
                         ${BODY_X - build.bodyRx + 8} ${BODY_Y - build.bodyRy * 0.2} Z"
                    fill="${mark}"/>`;
    case 'flecks':
      return [
        [-32, -8, 5], [-14, -16, 4], [4, -6, 6], [24, -14, 4],
        [38, 2, 5], [-24, 8, 4], [10, 12, 5], [30, 16, 4],
      ]
        .map(([dx, dy, r]) => `<circle cx="${BODY_X + dx!}" cy="${BODY_Y + dy!}" r="${r}" fill="${ember}" opacity="0.85"/>`)
        .join('');
    case 'cinderveil':
      // Mutation: a shimmering veil down the flank.
      return `
        <path d="M${BODY_X - build.bodyRx} ${BODY_Y - 6} Q ${BODY_X - 10} ${BODY_Y - build.bodyRy},
                 ${BODY_X + build.bodyRx} ${BODY_Y - 10} L ${BODY_X + build.bodyRx} ${BODY_Y + build.bodyRy}
                 L ${BODY_X - build.bodyRx} ${BODY_Y + build.bodyRy} Z"
              fill="#ffb347" opacity="0.4"/>
        ${[[-26, 4], [0, -4], [22, 8], [40, -2]]
          .map(([dx, dy]) => `<circle cx="${BODY_X + dx!}" cy="${BODY_Y + dy!}" r="6" fill="#fff0c4" opacity="0.8"/>`)
          .join('')}`;
    default:
      return '';
  }
}

/** Socks and mask sit on the legs and face, so they draw outside the body clip. */
function drawSocks(kind: string, build: BuildSpec, legs: number[], under: string, outline: string): string {
  if (kind !== 'socks') return '';
  const legY = BODY_Y + build.bodyRy - 6;
  return legs
    .map(
      (x) => `<rect x="${x}" y="${legY + build.legHeight - 16}" width="${build.legWidth}" height="16"
                    rx="${build.legWidth / 2}" fill="${under}" stroke="${outline}" stroke-width="2"/>`,
    )
    .join('');
}

function drawMask(kind: string, head: HeadSpec, mark: string): string {
  if (kind !== 'mask') return '';
  return `<ellipse cx="${HEAD_X - head.rx * 0.3}" cy="${HEAD_Y + head.ry * 0.2}"
                   rx="${head.rx * 0.9}" ry="${head.ry * 0.7}" fill="${mark}" opacity="0.75"/>`;
}

function drawScorch(surface: string): string {
  if (surface !== 'scorched') return '';
  return `
    <g opacity="0.85">
      <path d="M108 100 C 124 92, 150 92, 168 100 C 156 106, 130 108, 108 100 Z" fill="#3a3230"/>
      <circle cx="120" cy="112" r="5" fill="#3a3230"/>
      <circle cx="150" cy="110" r="6" fill="#3a3230"/>
      <circle cx="168" cy="118" r="4" fill="#3a3230"/>
    </g>`;
}

function drawAccents(value: string): string {
  const parts = value.split('+');
  let out = '';

  if (parts.includes('ember')) {
    out += [[172, 78, 7], [186, 66, 5], [160, 68, 4]]
      .map(
        ([x, y, r]) => `
        <path d="M${x} ${y! + r!} C ${x! - r!} ${y}, ${x! - r! * 0.4} ${y! - r!}, ${x} ${y! - r! * 1.9}
                 C ${x! + r! * 0.4} ${y! - r!}, ${x! + r!} ${y}, ${x} ${y! + r!} Z"
              fill="#ff9c3f" opacity="0.9"/>`,
      )
      .join('');
  }

  if (parts.includes('gale')) {
    out += `
      <g fill="none" stroke="#bcd8e6" stroke-width="3.5" stroke-linecap="round" opacity="0.9">
        <path d="M96 62 C 112 54, 128 58, 134 66"/>
        <path d="M104 48 C 120 40, 138 44, 144 52"/>
      </g>`;
  }

  if (parts.includes('ashglow')) {
    out += `
      <g opacity="0.9">
        ${[[110, 100], [136, 94], [162, 102], [124, 134], [152, 132]]
          .map(
            ([x, y]) => `
            <circle cx="${x}" cy="${y}" r="9" fill="#ffd9a0" opacity="0.35"/>
            <circle cx="${x}" cy="${y}" r="3.5" fill="#fff4dd"/>`,
          )
          .join('')}
      </g>`;
  }

  return out;
}

export function renderCinderpup(phenotype: Phenotype, options: RenderOptions = {}): string {
  const valueOf = (slotId: string, fallback: string): string => phenotype[slotId]?.value ?? fallback;

  const build = pick(BUILDS, valueOf('bodyBuild', 'standard'), 'standard');
  const head = pick(HEADS, valueOf('headShape', 'fox'), 'fox');

  const coat = valueOf('coatPrimary', '#c9542a');
  const under = valueOf('coatSecondary', '#f2e2c8');
  const outline = shade(coat, -0.52);
  const legColour = shade(coat, -0.14);
  const mark = shade(coat, -0.42);
  const innerEar = shade(under, -0.08);
  const paw = shade(coat, -0.55);
  const ember = '#ff9c3f';

  const pattern = valueOf('pattern', 'none');
  const size = options.size ?? 260;
  const className = options.className ? ` class="${options.className}"` : '';
  const clipId = `cp-clip-${Math.abs(hashString(JSON.stringify(phenotype)))}`;

  const legY = BODY_Y + build.bodyRy - 6;
  const legXs = [BODY_X - 44, BODY_X - 12, BODY_X + 16, BODY_X + 40];
  const leg = (x: number, colour: string): string => `
    <rect x="${x}" y="${legY}" width="${build.legWidth}" height="${build.legHeight}"
          rx="${build.legWidth / 2}" fill="${colour}" stroke="${outline}" stroke-width="2.5"/>
    <ellipse cx="${x + build.legWidth / 2}" cy="${legY + build.legHeight}"
             rx="${build.legWidth * 0.75}" ry="4.5" fill="${paw}"/>`;

  return `
<svg${className} viewBox="0 0 240 210" width="${size}" height="${(size * 210) / 240}"
     xmlns="http://www.w3.org/2000/svg" role="img">
  <defs>
    <clipPath id="${clipId}">
      <ellipse cx="${BODY_X}" cy="${BODY_Y}" rx="${build.bodyRx}" ry="${build.bodyRy}"/>
    </clipPath>
  </defs>

  <g transform="translate(120 105) scale(${build.scale}) translate(-120 -105)">
    ${drawBrush(valueOf('brush', 'plume'), coat, shade(coat, 0.3), outline)}

    ${leg(legXs[1]!, shade(legColour, -0.14))}
    ${leg(legXs[3]!, shade(legColour, -0.14))}

    <!-- Neck runs behind the body and mane. -->
    <path d="M${HEAD_X + 10} ${HEAD_Y + 12} L ${BODY_X - build.bodyRx + 4} ${BODY_Y - 26}
             L ${BODY_X - build.bodyRx + 26} ${BODY_Y + 12} L ${HEAD_X + 16} ${HEAD_Y + 32} Z"
          fill="${coat}" stroke="${outline}" stroke-width="3" stroke-linejoin="round"/>

    <ellipse cx="${BODY_X}" cy="${BODY_Y}" rx="${build.bodyRx}" ry="${build.bodyRy}"
             fill="${coat}" stroke="${outline}" stroke-width="3"/>

    <g clip-path="url(#${clipId})">
      <ellipse cx="${BODY_X - 2}" cy="${BODY_Y + build.bodyRy * 0.6}"
               rx="${build.bodyRx * 0.85}" ry="${build.bodyRy * 0.6}" fill="${under}"/>
      ${drawPattern(pattern, build, mark, ember)}
    </g>
    ${drawScorch(valueOf('surface', 'plain'))}
    <ellipse cx="${BODY_X}" cy="${BODY_Y}" rx="${build.bodyRx}" ry="${build.bodyRy}"
             fill="none" stroke="${outline}" stroke-width="3"/>

    ${leg(legXs[0]!, legColour)}
    ${leg(legXs[2]!, legColour)}
    ${drawSocks(pattern, build, legXs, under, outline)}

    ${drawMane(valueOf('mane', 'ruff'), coat, outline, ember)}

    ${drawEars(valueOf('ears', 'pricked'), coat, innerEar, outline)}

    <ellipse cx="${HEAD_X}" cy="${HEAD_Y}" rx="${head.rx}" ry="${head.ry}"
             fill="${coat}" stroke="${outline}" stroke-width="3"/>
    ${drawMask(pattern, head, mark)}

    <!-- Snout: length and depth are what separate the muzzle variants. -->
    <path d="M${HEAD_X - head.rx * 0.2} ${HEAD_Y + 2}
             L ${HEAD_X - head.rx * 0.2 - head.snoutLength} ${HEAD_Y + head.ry * 0.35}
             L ${HEAD_X - head.rx * 0.2 - head.snoutLength} ${HEAD_Y + head.ry * 0.35 + head.snoutDepth}
             L ${HEAD_X - head.rx * 0.15} ${HEAD_Y + head.ry * 0.72} Z"
          fill="${under}" stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="${HEAD_X - head.rx * 0.2 - head.snoutLength + 2}"
             cy="${HEAD_Y + head.ry * 0.35 + head.snoutDepth * 0.35}"
             rx="4.5" ry="3.5" fill="${outline}"/>

    <circle cx="${HEAD_X - 8}" cy="${HEAD_Y - 6}" r="6" fill="#2a2320"/>
    <circle cx="${HEAD_X + 14}" cy="${HEAD_Y - 8}" r="6" fill="#2a2320"/>
    <circle cx="${HEAD_X - 6}" cy="${HEAD_Y - 8}" r="2.2" fill="#ffffff"/>
    <circle cx="${HEAD_X + 16}" cy="${HEAD_Y - 10}" r="2.2" fill="#ffffff"/>

    ${drawAccents(valueOf('accent', 'none'))}
  </g>
</svg>`.trim();
}
