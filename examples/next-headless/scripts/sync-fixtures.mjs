// Copies the NIWWTS fixtures (examples/spikes/fixtures, see its README for the source) into public/fixtures,
// so the example serves them itself (works on Vercel, no symlinks). public/fixtures is gitignored.
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('..', import.meta.url));
const src = `${here}../spikes/fixtures/`;
const dst = `${here}public/fixtures/`;
mkdirSync(dst, { recursive: true });
let n = 0;
for (const f of readdirSync(src)) {
  if (f.endsWith('.webp') || f === 'fixtures.json') {
    copyFileSync(src + f, dst + f);
    n += 1;
  }
}
console.log(`sync-fixtures: ${n} files → public/fixtures/`);
