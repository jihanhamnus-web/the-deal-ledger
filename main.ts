// Entry program for black-friday-deal-finder-01 (Node 22+, stdlib only).
// Copies static site assets under app/ and screenshots/ into the output directory
// and emits dossier.json using the unmodified vendored makefun-frontend library.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

function packageEntry(): void {
  mkdirSync(outDir, { recursive: true });
  cpSync(join(rootDir, 'app'), join(outDir, 'app'), { recursive: true });

  const screensOut = join(outDir, 'screenshots');
  mkdirSync(screensOut, { recursive: true });
  const screensSrc = join(rootDir, 'screenshots');
  if (existsSync(screensSrc)) {
    cpSync(screensSrc, screensOut, { recursive: true });
  }

  const dossierJson = buildDossier(outDir, DOSSIER_LIMITS);
  writeFileSync(join(outDir, 'dossier.json'), dossierJson);
}

packageEntry();
