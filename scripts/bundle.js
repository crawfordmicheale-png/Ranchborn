#!/usr/bin/env node
/**
 * Builds a single self-contained HTML file for the prototype.
 *
 * The served version needs a build step, a local server, and a fetch for the
 * species data — fine for development, useless for handing the prototype to
 * someone. This inlines the compiled script, the stylesheet, and the species
 * JSON into one file that opens straight from disk with no server, no network,
 * and no install.
 *
 * The stylesheet and markup shell are read from prototype/index.html rather
 * than duplicated here, so the served page and the standalone build cannot
 * drift apart.
 */

import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const speciesId = 'bramblehorn';

// Bundle to an IIFE, not an ES module: modules are blocked by CORS over
// file://, which would defeat the entire point of a standalone build.
const bundled = await build({
  entryPoints: [`${root}prototype/src/app.ts`],
  bundle: true,
  format: 'iife',
  target: ['es2022'],
  platform: 'browser',
  write: false,
  legalComments: 'none',
  logLevel: 'warning',
});

const script = bundled.outputFiles[0].text;

const speciesJson = await readFile(`${root}sim/data/species/${speciesId}.json`, 'utf8');

// Reuse the stylesheet from the served page so there is one source of truth.
const shell = await readFile(`${root}prototype/index.html`, 'utf8');
const styleMatch = /<style>([\s\S]*?)<\/style>/.exec(shell);
if (!styleMatch) throw new Error('could not find a <style> block in prototype/index.html');
const styles = styleMatch[1].trim();

/**
 * Emitted without <html>, <head>, or <body>. Browsers create those implicitly,
 * and leaving them out lets the same file be published as an artifact, which
 * supplies its own document skeleton.
 */
const html = `<title>Ranchborn Nursery</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
${styles}
</style>

<div id="app"></div>

<script>
// Species data inlined so the page needs no server and no network.
globalThis.__RANCHBORN_SPECIES__ = ${speciesJson.trim()};
</script>
<script>
${script}
</script>
`;

await mkdir(`${root}dist`, { recursive: true });
const out = `${root}dist/ranchborn-nursery.html`;
await writeFile(out, html, 'utf8');

const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
console.log(`wrote ${out} (${kb} KB, self-contained)`);
