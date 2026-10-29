import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// `#paper/*` = deep imports into the pinned @paper-design/shaders dist (see packages/element/tsconfig.json paths).
const paperDist = fileURLToPath(
  new URL('./packages/element/node_modules/@paper-design/shaders/dist/', import.meta.url)
);

export default defineConfig({
  resolve: {
    alias: [{ find: /^#paper\/(.*)$/, replacement: `${paperDist}$1` }],
  },
  test: {
    include: ['packages/*/src/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
});
