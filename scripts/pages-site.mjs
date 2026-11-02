// Q0 · B7: assembles the GitHub Pages site for the static demo into _site/ (run after `pnpm build`).
// The demo imports the element as ../../packages/element/dist/index.js and the photos as ../fixtures/products/…, so the
// site keeps the repo paths instead of rewriting HTML: what is tested locally is what gets published.
// Usage: node scripts/pages-site.mjs [outDir=_site]
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = join(root, process.argv[2] ?? '_site');
rmSync(out, { recursive: true, force: true });

const copy = (rel, filter = () => true) => {
  const from = join(root, rel);
  if (!existsSync(from)) throw new Error(`missing ${rel}: run pnpm build first`);
  mkdirSync(dirname(join(out, rel)), { recursive: true });
  cpSync(from, join(out, rel), {
    recursive: true,
    filter: (src) => statSync(src).isDirectory() || filter(src),
  });
};

copy('examples/static', (f) => /\.(html|css|js)$/.test(f) && !f.endsWith('r0-hero.html'));
copy('examples/fixtures', (f) => /\.(webp|json|md)$/.test(f));
copy('examples/fonts');
copy('packages/element/dist', (f) => f.endsWith('.js')); // no source maps, no .d.ts
copy('presets'); // presets/README.md is harmless; the JSON is what Liquid and React read
copy('third_party/paper-shaders'); // LICENSE + NOTICE travel with every redistribution (CLAUDE.md)
copy('LICENSE');
copy('NOTICE');

writeFileSync(
  join(out, 'index.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>VITRINE demo</title>
    <meta http-equiv="refresh" content="0; url=examples/static/" />
    <link rel="canonical" href="examples/static/" />
  </head>
  <body>
    <p><a href="examples/static/">Store, a VITRINE demo: products behind reeded glass</a></p>
  </body>
</html>
`
);
writeFileSync(join(out, '.nojekyll'), ''); // serve folders as they are (no Jekyll processing)

let files = 0;
let bytes = 0;
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else {
      files += 1;
      bytes += s.size;
    }
  }
};
walk(out);
console.log(`pages-site: ${files} files, ${(bytes / 1024).toFixed(1)} KB → ${out}`);
