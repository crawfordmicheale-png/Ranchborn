/**
 * Draws a Puddlekin — an amphibious gatherer — from its phenotype.
 *
 * The third chassis, and the one that departs furthest from the other two: a
 * squat seated body rather than a standing quadruped, eyes that dome above the
 * skull rather than sitting in it, and haunches instead of four even legs.
 * Three species sharing one body outline would fail §9.1 no matter how many
 * parts were swapped on top.
 */

import type { Phenotype } from '../../../sim/src/types.js';
import { hashString, pick, shade } from './shared.js';
import type { RenderOptions } from './shared.js';

interface BuildSpec {
  bodyRx: number;
  bodyRy: number;
  scale: number;
}

const BUILDS: Record<string, BuildSpec> = {
  slim: { bodyRx: 48, bodyRy: 31, scale: 0.96 },
  standard: { bodyRx: 56, bodyRy: 38, scale: 1 },
  round: { bodyRx: 64, bodyRy: 46, scale: 1.04 },
};

interface HeadSpec {
  rx: number;
  ry: number;
  /** Horizontal spread of the eye domes. */
  eyeSpread: number;
  eyeRadius: number;
}

const HEADS: Record<string, HeadSpec> = {
  wide: { rx: 36, ry: 24, eyeSpread: 20, eyeRadius: 11 },
  domed: { rx: 28, ry: 30, eyeSpread: 14, eyeRadius: 10 },
  flat: { rx: 33, ry: 19, eyeSpread: 18, eyeRadius: 9 },
  tapered: { rx: 24, ry: 24, eyeSpread: 12, eyeRadius: 8 },
};

const HEAD_X = 78;
const HEAD_Y = 100;
const BODY_X = 136;
const BODY_Y = 138;

function drawFrills(kind: string, coat: string, edge: string, outline: string): string {
  const stroke = `stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"`;
  switch (kind) {
    case 'fan':
      // A broad scalloped fan sweeping back from the cheek.
      return `
        <path d="M92 108 C 108 92, 126 88, 138 94 C 128 100, 126 108, 130 116
                 C 118 114, 106 118, 98 124 Z" fill="${edge}" ${stroke}/>
        <path d="M64 110 C 46 96, 28 94, 18 102 C 30 106, 32 114, 28 122
                 C 40 118, 54 122, 62 126 Z" fill="${edge}" ${stroke}/>`;
    case 'feathered':
      return `
        <g fill="${edge}" ${stroke}>
          <path d="M92 106 C 106 96, 118 94, 126 98 C 116 104, 110 110, 108 118 Z"/>
          <path d="M94 116 C 108 110, 120 112, 126 118 C 114 120, 106 124, 102 130 Z"/>
          <path d="M64 108 C 50 98, 38 96, 30 100 C 40 106, 46 112, 48 120 Z"/>
          <path d="M62 118 C 48 112, 36 114, 30 120 C 42 122, 50 126, 54 132 Z"/>
        </g>`;
    case 'spined':
      return `
        <g fill="${edge}" ${stroke}>
          <path d="M92 104 L 124 88 L 112 108 L 132 106 L 108 122 Z"/>
          <path d="M64 106 L 32 88 L 44 108 L 24 106 L 48 122 Z"/>
        </g>`;
    case 'smooth':
      return `
        <path d="M92 110 C 104 106, 114 108, 118 114 C 108 116, 100 120, 96 124 Z"
              fill="${edge}" ${stroke}/>
        <path d="M64 112 C 52 108, 42 110, 38 116 C 48 118, 56 122, 60 126 Z"
              fill="${edge}" ${stroke}/>`;
    default:
      return '';
  }
}

function drawFins(kind: string, build: BuildSpec, coat: string, outline: string): string {
  const fin = shade(coat, 0.28);
  const stroke = `stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"`;
  const top = BODY_Y - build.bodyRy;
  switch (kind) {
    case 'crested':
      // A tall ridge running the length of the spine.
      return `
        <path d="M${BODY_X - 40} ${top + 8} L ${BODY_X - 30} ${top - 26}
                 L ${BODY_X - 12} ${top - 4} L ${BODY_X + 2} ${top - 34}
                 L ${BODY_X + 18} ${top - 6} L ${BODY_X + 32} ${top - 28}
                 L ${BODY_X + 42} ${top + 6} Z" fill="${fin}" ${stroke}/>`;
    case 'dorsal':
      return `
        <path d="M${BODY_X - 24} ${top + 6} C ${BODY_X - 10} ${top - 32},
                 ${BODY_X + 18} ${top - 30}, ${BODY_X + 30} ${top + 4} Z"
              fill="${fin}" ${stroke}/>`;
    case 'paired':
      return `
        <path d="M${BODY_X - 30} ${BODY_Y + 4} C ${BODY_X - 54} ${BODY_Y + 14},
                 ${BODY_X - 62} ${BODY_Y + 30}, ${BODY_X - 52} ${BODY_Y + 38}
                 C ${BODY_X - 44} ${BODY_Y + 26}, ${BODY_X - 34} ${BODY_Y + 18}, ${BODY_X - 24} ${BODY_Y + 16} Z"
              fill="${fin}" ${stroke}/>
        <path d="M${BODY_X + 26} ${BODY_Y + 2} C ${BODY_X + 50} ${BODY_Y + 12},
                 ${BODY_X + 58} ${BODY_Y + 28}, ${BODY_X + 48} ${BODY_Y + 36}
                 C ${BODY_X + 40} ${BODY_Y + 24}, ${BODY_X + 30} ${BODY_Y + 16}, ${BODY_X + 20} ${BODY_Y + 14} Z"
              fill="${fin}" ${stroke}/>`;
    case 'crystal': {
      // Mutation: faceted translucent fins.
      const shard = (x: number, y: number, h: number, w: number): string =>
        `<path d="M${x} ${y} L ${x - w} ${y - h * 0.55} L ${x} ${y - h} L ${x + w} ${y - h * 0.55} Z"
               fill="#bfeaf5" stroke="#6fb8cc" stroke-width="2" opacity="0.92"/>`;
      return `
        ${shard(BODY_X - 26, top + 6, 34, 11)}
        ${shard(BODY_X, top + 2, 44, 13)}
        ${shard(BODY_X + 26, top + 6, 32, 10)}
        ${shard(BODY_X - 48, BODY_Y + 26, 26, 9)}`;
    }
    default:
      return '';
  }
}

function drawTail(kind: string, coat: string, outline: string): string {
  const fin = shade(coat, 0.22);
  const stroke = `stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"`;
  switch (kind) {
    case 'paddle':
      return `<path d="M188 138 C 210 122, 224 128, 226 144 C 224 162, 208 166, 188 150 Z"
                    fill="${fin}" ${stroke}/>`;
    case 'long':
      return `
        <path d="M188 140 C 208 136, 220 124, 224 106" fill="none" stroke="${coat}"
              stroke-width="9" stroke-linecap="round"/>
        <path d="M216 118 C 226 108, 230 100, 228 92 C 220 100, 214 110, 212 120 Z"
              fill="${fin}" ${stroke}/>`;
    case 'stub':
      return `<ellipse cx="192" cy="140" rx="13" ry="11" fill="${fin}" ${stroke}/>`;
    default:
      return '';
  }
}

function drawPattern(kind: string, build: BuildSpec, mark: string): string {
  switch (kind) {
    case 'spots':
      return [
        [-30, -12, 9], [-6, -18, 7], [18, -10, 10], [36, 0, 7],
        [-20, 8, 8], [6, 6, 7], [28, 14, 8],
      ]
        .map(([dx, dy, r]) => `<circle cx="${BODY_X + dx!}" cy="${BODY_Y + dy!}" r="${r}" fill="${mark}"/>`)
        .join('');
    case 'speckle':
      return [
        [-34, -6, 4], [-22, -16, 3], [-10, -4, 4], [2, -14, 3], [14, -2, 4],
        [26, -12, 3], [38, 4, 4], [-28, 10, 3], [-6, 14, 4], [16, 16, 3], [32, 18, 4],
      ]
        .map(([dx, dy, r]) => `<circle cx="${BODY_X + dx!}" cy="${BODY_Y + dy!}" r="${r}" fill="${mark}"/>`)
        .join('');
    case 'bands':
      return [-30, -8, 14, 34]
        .map(
          (dx) => `<path d="M${BODY_X + dx} ${BODY_Y - build.bodyRy}
                            q 9 ${build.bodyRy} 0 ${build.bodyRy * 2}
                            l 11 0 q 9 -${build.bodyRy} 0 -${build.bodyRy * 2} Z" fill="${mark}"/>`,
        )
        .join('');
    case 'marbled':
      return `
        <path d="M${BODY_X - 44} ${BODY_Y - 6} C ${BODY_X - 26} ${BODY_Y - 26}, ${BODY_X - 6} ${BODY_Y + 6},
                 ${BODY_X + 14} ${BODY_Y - 16} C ${BODY_X + 32} ${BODY_Y - 4}, ${BODY_X + 40} ${BODY_Y + 12},
                 ${BODY_X + 52} ${BODY_Y + 4} L ${BODY_X + 52} ${BODY_Y + 30} L ${BODY_X - 44} ${BODY_Y + 30} Z"
              fill="${mark}" opacity="0.85"/>`;
    case 'moonpool':
      // Mutation: a pale iridescent sheen with ripple rings.
      return `
        <ellipse cx="${BODY_X}" cy="${BODY_Y - 4}" rx="${build.bodyRx * 0.9}" ry="${build.bodyRy * 0.7}"
                 fill="#dff4ff" opacity="0.55"/>
        ${[[-22, -6, 12], [10, 4, 15], [34, -8, 10]]
          .map(
            ([dx, dy, r]) =>
              `<circle cx="${BODY_X + dx!}" cy="${BODY_Y + dy!}" r="${r}" fill="none"
                       stroke="#ffffff" stroke-width="2.5" opacity="0.85"/>`,
          )
          .join('')}`;
    default:
      return '';
  }
}

function drawGloss(surface: string, build: BuildSpec): string {
  if (surface !== 'glossy') return '';
  return `
    <ellipse cx="${BODY_X - 14}" cy="${BODY_Y - build.bodyRy * 0.55}"
             rx="${build.bodyRx * 0.42}" ry="${build.bodyRy * 0.22}" fill="#ffffff" opacity="0.45"/>
    <ellipse cx="${HEAD_X + 6}" cy="${HEAD_Y - 12}" rx="12" ry="5" fill="#ffffff" opacity="0.4"/>`;
}

function drawAccents(value: string): string {
  const parts = value.split('+');
  let out = '';

  if (parts.includes('tide')) {
    out += `
      <g fill="none" stroke="#7fc7de" stroke-width="3.5" stroke-linecap="round" opacity="0.95">
        <path d="M168 92 C 180 84, 192 88, 198 96"/>
        <path d="M176 106 C 188 98, 200 102, 206 110"/>
      </g>`;
  }

  if (parts.includes('bloom')) {
    const bloom = (x: number, y: number, r: number): string =>
      `<g>${[0, 60, 120, 180, 240, 300]
        .map(
          (angle) =>
            `<ellipse cx="${x}" cy="${y - r}" rx="${r * 0.5}" ry="${r * 0.9}" fill="#ffd9ec" transform="rotate(${angle} ${x} ${y})"/>`,
        )
        .join('')}<circle cx="${x}" cy="${y}" r="${r * 0.5}" fill="#ffc94d"/></g>`;
    out += bloom(122, 104, 7) + bloom(146, 112, 5);
  }

  if (parts.includes('lumen')) {
    out += `
      <g opacity="0.92">
        ${[[104, 128], [130, 120], [158, 128], [118, 156], [148, 154]]
          .map(
            ([x, y]) => `
            <circle cx="${x}" cy="${y}" r="10" fill="#9ff2ff" opacity="0.35"/>
            <circle cx="${x}" cy="${y}" r="3.5" fill="#eaffff"/>`,
          )
          .join('')}
      </g>`;
  }

  return out;
}

export function renderPuddlekin(phenotype: Phenotype, options: RenderOptions = {}): string {
  const valueOf = (slotId: string, fallback: string): string => phenotype[slotId]?.value ?? fallback;

  const build = pick(BUILDS, valueOf('bodyBuild', 'standard'), 'standard');
  const head = pick(HEADS, valueOf('headShape', 'domed'), 'domed');

  const coat = valueOf('coatPrimary', '#5f9070');
  const under = valueOf('coatSecondary', '#eef2e4');
  const outline = shade(coat, -0.52);
  const mark = shade(coat, -0.28);
  const limb = shade(coat, -0.12);

  const pattern = valueOf('pattern', 'none');
  const size = options.size ?? 260;
  const className = options.className ? ` class="${options.className}"` : '';
  const clipId = `pk-clip-${Math.abs(hashString(JSON.stringify(phenotype)))}`;

  const footY = BODY_Y + build.bodyRy + 6;
  // Webbed foot: three toes fanned from a pad.
  const foot = (x: number): string => `
    <path d="M${x - 15} ${footY} C ${x - 17} ${footY + 12}, ${x + 17} ${footY + 12}, ${x + 15} ${footY}
             C ${x + 8} ${footY - 6}, ${x - 8} ${footY - 6}, ${x - 15} ${footY} Z"
          fill="${limb}" stroke="${outline}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M${x - 7} ${footY + 9} L ${x - 7} ${footY + 2} M${x} ${footY + 11} L ${x} ${footY + 2}
             M${x + 7} ${footY + 9} L ${x + 7} ${footY + 2}"
          stroke="${outline}" stroke-width="2" opacity="0.6"/>`;

  return `
<svg${className} viewBox="0 0 240 210" width="${size}" height="${(size * 210) / 240}"
     xmlns="http://www.w3.org/2000/svg" role="img">
  <defs>
    <clipPath id="${clipId}">
      <ellipse cx="${BODY_X}" cy="${BODY_Y}" rx="${build.bodyRx}" ry="${build.bodyRy}"/>
    </clipPath>
  </defs>

  <g transform="translate(120 108) scale(${build.scale}) translate(-120 -108)">
    ${drawTail(valueOf('tail', 'paddle'), coat, outline)}
    ${drawFins(valueOf('fins', 'dorsal'), build, coat, outline)}

    <!-- Haunch, then the body it belongs to. -->
    <ellipse cx="${BODY_X + build.bodyRx * 0.5}" cy="${BODY_Y + build.bodyRy * 0.42}"
             rx="${build.bodyRx * 0.46}" ry="${build.bodyRy * 0.76}"
             fill="${limb}" stroke="${outline}" stroke-width="2.5"/>

    <ellipse cx="${BODY_X}" cy="${BODY_Y}" rx="${build.bodyRx}" ry="${build.bodyRy}"
             fill="${coat}" stroke="${outline}" stroke-width="3"/>

    <g clip-path="url(#${clipId})">
      <ellipse cx="${BODY_X - 4}" cy="${BODY_Y + build.bodyRy * 0.62}"
               rx="${build.bodyRx * 0.84}" ry="${build.bodyRy * 0.58}" fill="${under}"/>
      ${drawPattern(pattern, build, mark)}
    </g>
    <ellipse cx="${BODY_X}" cy="${BODY_Y}" rx="${build.bodyRx}" ry="${build.bodyRy}"
             fill="none" stroke="${outline}" stroke-width="3"/>

    ${foot(BODY_X - 34)}
    ${foot(BODY_X + 26)}

    ${drawFrills(valueOf('frills', 'feathered'), coat, shade(coat, 0.2), outline)}

    <ellipse cx="${HEAD_X}" cy="${HEAD_Y}" rx="${head.rx}" ry="${head.ry}"
             fill="${coat}" stroke="${outline}" stroke-width="3"/>

    <!-- Throat -->
    <ellipse cx="${HEAD_X - 2}" cy="${HEAD_Y + head.ry * 0.5}"
             rx="${head.rx * 0.66}" ry="${head.ry * 0.42}" fill="${under}" opacity="0.9"/>
    <path d="M${HEAD_X - head.rx * 0.62} ${HEAD_Y + head.ry * 0.24}
             Q ${HEAD_X - 2} ${HEAD_Y + head.ry * 0.62}, ${HEAD_X + head.rx * 0.56} ${HEAD_Y + head.ry * 0.2}"
          fill="none" stroke="${outline}" stroke-width="2.5" stroke-linecap="round"/>

    <!-- Eyes dome above the skull rather than sitting inside it. -->
    <circle cx="${HEAD_X - head.eyeSpread}" cy="${HEAD_Y - head.ry * 0.72}" r="${head.eyeRadius}"
            fill="${coat}" stroke="${outline}" stroke-width="2.5"/>
    <circle cx="${HEAD_X + head.eyeSpread}" cy="${HEAD_Y - head.ry * 0.78}" r="${head.eyeRadius}"
            fill="${coat}" stroke="${outline}" stroke-width="2.5"/>
    <circle cx="${HEAD_X - head.eyeSpread}" cy="${HEAD_Y - head.ry * 0.72 - 1}" r="${head.eyeRadius * 0.58}" fill="#2a2b26"/>
    <circle cx="${HEAD_X + head.eyeSpread}" cy="${HEAD_Y - head.ry * 0.78 - 1}" r="${head.eyeRadius * 0.58}" fill="#2a2b26"/>
    <circle cx="${HEAD_X - head.eyeSpread + 2.5}" cy="${HEAD_Y - head.ry * 0.72 - 3.5}" r="${head.eyeRadius * 0.22}" fill="#ffffff"/>
    <circle cx="${HEAD_X + head.eyeSpread + 2.5}" cy="${HEAD_Y - head.ry * 0.78 - 3.5}" r="${head.eyeRadius * 0.22}" fill="#ffffff"/>

    <circle cx="${HEAD_X - head.rx * 0.34}" cy="${HEAD_Y - head.ry * 0.1}" r="2.4" fill="${outline}"/>
    <circle cx="${HEAD_X - head.rx * 0.1}" cy="${HEAD_Y - head.ry * 0.14}" r="2.4" fill="${outline}"/>

    ${drawGloss(valueOf('surface', 'plain'), build)}
    ${drawAccents(valueOf('accent', 'none'))}
  </g>
</svg>`.trim();
}
