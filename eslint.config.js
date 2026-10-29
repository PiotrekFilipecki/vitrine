import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'test-results/**',
      '_site/**',
      'playwright-report/**',
      'docs/**',
      'examples/spikes/fixtures/**',
      'packages/element/e2e/ref/ref.bundle.js',
      'examples/r0/r0.bundle.js',
      '**/.next/**',
      'examples/theme-test/**',
      'shopify-theme/assets/vitrine.js',
      'examples/next-headless/next-env.d.ts',
      'examples/next-headless/public/fixtures/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
]);
