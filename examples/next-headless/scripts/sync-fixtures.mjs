// Copies the demo photographs (examples/fixtures/products, Unsplash License, see examples/fixtures/CREDITS.md) and
// the shared catalogue (examples/fixtures/catalog.json) into public/fixtures, so the example serves them itself
// (works on Vercel, no symlinks). public/fixtures is gitignored.
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('..', import.meta.url));
const src = `${here}../fixtures/`;
const dst = `${here}public/fixtures/`;
mkdirSync(`${dst}products`, { recursive: true });
let n = 0;
copyFileSync(`${src}catalog.json`, `${dst}catalog.json`);
n += 1;
// The 1600 px originals only: next/image makes the smaller sizes.
for (const f of readdirSync(`${src}products`)) {
  if (f.endsWith('.webp')) {
    copyFileSync(`${src}products/${f}`, `${dst}products/${f}`);
    n += 1;
  }
}
console.log(`sync-fixtures: ${n} files → public/fixtures/`);
