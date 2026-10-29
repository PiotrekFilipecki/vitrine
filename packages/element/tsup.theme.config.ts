import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

/**
 * Build for shopify-theme/assets/vitrine.js: one ESM file (Shopify's assets/ folder is flat and the CDN appends
 * `?v=` to asset_url, so chunked dynamic imports are not relied on; see P2 devlog). Header carries the VITRINE
 * licence and the NOTICE of Paper Shaders (PLAN D11).
 */
const notice = readFileSync(new URL('../../third_party/paper-shaders/NOTICE', import.meta.url), 'utf8')
  .trim()
  .split('\n')
  .map((l) => ` * ${l}`.trimEnd())
  .join('\n');

const banner = `/*!
 * vitrine.js · VITRINE for Shopify themes · Apache-2.0 · Copyright 2026 Piotr Filipecki
 * https://github.com/PiotrekFilipecki/vitrine · <vitrine-shader> effect="dither|halftone|mesh|paper"
 * Powered by Paper Shaders (https://shaders.paper.design), @paper-design/shaders 0.0.82, Apache-2.0.
 * NOTICE of Paper Shaders, reproduced as required by its licence:
${notice}
 */`;

export default defineConfig({
  entry: { vitrine: 'src/index.ts' },
  outDir: '../../shopify-theme/assets',
  format: ['esm'],
  dts: false,
  clean: false,
  sourcemap: false,
  splitting: false,
  minify: true,
  target: 'es2022',
  banner: { js: banner },
  noExternal: ['@paper-design/shaders'],
});
