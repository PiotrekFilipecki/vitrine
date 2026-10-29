// Playwright globalSetup: bundle the React reference (shaders-react + React 19) for the compatibility
// tests and make sure the element has been built. Both outputs are gitignored.
import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

export default async function globalSetup() {
  const dist = `${root}packages/element/dist/index.js`;
  if (!existsSync(dist)) {
    throw new Error(`Missing ${dist}: run "pnpm build" before "pnpm test:e2e".`);
  }
  const nextBuild = `${root}examples/next-headless/.next/BUILD_ID`;
  if (!existsSync(nextBuild)) {
    throw new Error(
      `Missing ${nextBuild}: run "pnpm build" (it builds the Next example too) before "pnpm test:e2e".`
    );
  }
  await build({
    entryPoints: [`${root}packages/element/e2e/ref/ref-entry.js`],
    outfile: `${root}packages/element/e2e/ref/ref.bundle.js`,
    bundle: true,
    format: 'esm',
    target: 'es2022',
    minify: false,
    logLevel: 'error',
    define: { 'process.env.NODE_ENV': '"production"' },
  });
}
