import { defineConfig } from 'tsup';

const banner = `/*!
 * vitrine-shaders · Apache-2.0 · Copyright 2026 Piotr Filipecki
 * Powered by Paper Shaders (https://shaders.paper.design), @paper-design/shaders 0.0.82, Apache-2.0.
 * Paper Shaders LICENSE and NOTICE ship with this package (see NOTICE).
 */`;

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  target: 'es2022',
  banner: { js: banner },
  // Shader runtime is bundled on purpose (a Liquid theme loads one file from assets/)
  noExternal: ['@paper-design/shaders'],
  esbuildOptions(options) {
    // Each effect is a named chunk so the size table in the devlog is readable.
    options.chunkNames = 'chunks/[name]-[hash]';
  },
});
