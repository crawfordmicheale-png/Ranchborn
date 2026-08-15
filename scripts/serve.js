#!/usr/bin/env node
/**
 * Minimal static file server for the prototype. No dependencies — it exists so
 * `npm run serve` works out of the box, not to be a real web server.
 *
 * Serves from the repo root so that /prototype/index.html can load compiled
 * modules from /dist and species data from /sim/data.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.env['PORT'] ?? 8123);

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.map': 'application/json; charset=utf-8',
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const requested = url.pathname === '/' ? '/prototype/index.html' : url.pathname;

  // Resolve inside the repo root and reject anything that escapes it.
  const absolute = join(root, normalize(decodeURIComponent(requested)));
  if (!absolute.startsWith(root.endsWith(sep) ? root : root + sep)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const body = await readFile(absolute);
    const type = CONTENT_TYPES[extname(absolute)] ?? 'application/octet-stream';
    response.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' }).end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Ranchborn prototype: http://localhost:${port}/`);
});
