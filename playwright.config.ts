import { defineConfig, devices } from '@playwright/test';

/**
 * Spikes and e2e run against a dependency-free static server (scripts/serve.mjs)
 * that serves the repo root, so pages can import @paper-design/shaders from node_modules.
 * Workers = 1 on purpose: WebGL context budgets are per browser process and tests count them.
 */
export default defineConfig({
  testDir: '.',
  testMatch: ['examples/spikes/**/*.spec.ts', 'packages/*/e2e/**/*.spec.ts'],
  testIgnore: ['**/node_modules/**', '**/dist/**'],
  outputDir: 'test-results',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  timeout: 90_000,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'node scripts/serve.mjs 4173',
      url: 'http://localhost:4173/examples/spikes/',
      reuseExistingServer: true,
      timeout: 15_000,
    },
    {
      // Second origin WITHOUT CORS headers, used by the negative CORS test (Spike C).
      command: 'node scripts/serve.mjs 4174',
      url: 'http://localhost:4174/examples/spikes/',
      reuseExistingServer: true,
      timeout: 15_000,
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
