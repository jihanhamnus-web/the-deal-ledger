// Local static file server for app/ using Node 22+ stdlib only.
// Usage: node serve.ts [--port 8080]

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const argv = process.argv.slice(2);
const portFlag = argv.indexOf('--port');
const parsedPort = portFlag === -1 ? 8080 : Number(argv[portFlag + 1]);
const listenPort = Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort < 65536 ? parsedPort : 8080;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

const server = createServer((req, res) => {
  const reqUrl = new URL(req.url ?? '/', 'http://localhost');
  let cleanPath: string;
  try {
    cleanPath = decodeURIComponent(reqUrl.pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  if (cleanPath.endsWith('/')) cleanPath += 'index.html';

  const targetPath = resolve(join(appRoot, normalize(cleanPath)));
  if (targetPath !== appRoot && !targetPath.startsWith(appRoot + sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  let fileSize = 0;
  try {
    const st = statSync(targetPath);
    if (!st.isFile()) throw new Error('Not a regular file');
    fileSize = st.size;
  } catch {
    res.writeHead(404).end('Not found');
    return;
  }

  const contentType = MIME_TYPES[extname(targetPath).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(200, {
    'content-type': contentType,
    'content-length': fileSize,
    'cache-control': 'no-store',
  });
  createReadStream(targetPath).pipe(res);
});

server.listen(listenPort, '127.0.0.1', () => {
  console.log(`Serving app/ on http://localhost:${listenPort}`);
});
