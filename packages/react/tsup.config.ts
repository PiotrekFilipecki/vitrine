import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  // `vitrine-shaders` stays a dynamic import of the host app (one async chunk, loaded after hydration).
  external: ['react', 'react-dom', 'react/jsx-runtime', 'vitrine-shaders'],
  banner: { js: "'use client';" },
});
