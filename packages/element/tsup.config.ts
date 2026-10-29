import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  // Shader runtime is bundled on purpose (a Liquid theme loads one file from assets/)
  noExternal: ['@paper-design/shaders'],
});
