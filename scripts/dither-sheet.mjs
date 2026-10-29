// Q0 · B2: contact sheets of the 12 NIWWTS mockups in dithering, one row per parameter set, with the share of
// background pixels that print as raster instead of clean paper. Needs `pnpm build` (element dist).
// Usage: node scripts/dither-sheet.mjs variants   → docs/media/q0-dither-variants.{png,json}
//        node scripts/dither-sheet.mjs before-after → docs/media/q0-dither-before-after.{png,json}
// Rows without the option pass whitePoint 1 explicitly: since Q0 the newsprint preset ships with whitePoint 0.9.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const which = process.argv[2] ?? 'before-after';
const SHEETS = {
  variants: [
    { label: 'v0.1 newsprint', note: '8×8, size 2, 3 steps', params: { whitePoint: 1 } },
    { label: 'colorSteps 2', note: 'newsprint, 2 steps', params: { whitePoint: 1, colorSteps: 2 } },
    { label: 'colorSteps 1', note: 'newsprint, 1 step', params: { whitePoint: 1, colorSteps: 1 } },
    { label: 'colorSteps 7', note: 'newsprint, 7 steps', params: { whitePoint: 1, colorSteps: 7 } },
    { label: '4×4, size 3', note: 'newsprint, 3 steps', params: { whitePoint: 1, type: '4x4', size: 3 } },
    { label: 'random', note: 'newsprint, 3 steps', params: { whitePoint: 1, type: 'random' } },
    { label: 'size 1', note: 'newsprint, finer grid', params: { whitePoint: 1, size: 1 } },
    {
      label: 'highlight #fff',
      note: 'colorHighlight white',
      params: { whitePoint: 1, colorHighlight: '#ffffff' },
    },
    { label: 'whitePoint 0.92', note: 'newsprint + whitePoint', params: { whitePoint: 0.92 } },
    { label: 'whitePoint 0.9', note: 'newsprint + whitePoint', params: { whitePoint: 0.9 } },
    { label: 'whitePoint 0.85', note: 'newsprint + whitePoint', params: { whitePoint: 0.85 } },
  ],
  'before-after': [
    { label: 'before · v0.1', note: 'newsprint without whitePoint', params: { whitePoint: 1 } },
    { label: 'after · v0.2', note: 'newsprint as shipped', params: {} },
  ],
};
const rows = SHEETS[which];
if (!rows) throw new Error(`unknown sheet "${which}"`);

const server = spawn('node', [`${root}scripts/serve.mjs`, '4197'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 700));
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1740, height: 400 }, deviceScaleFactor: 2 });
  await page.goto(
    `http://localhost:4197/packages/element/e2e/pages/dither-sheet.html?rows=${encodeURIComponent(JSON.stringify(rows))}`
  );
  await page.waitForFunction(() => window.__sheet?.done, null, { timeout: 120_000 });
  const result = await page.evaluate(() => window.__sheet);
  if (result.error) throw new Error(result.error);
  await page.screenshot({ path: `${root}docs/media/q0-dither-${which}.png`, fullPage: true });
  writeFileSync(`${root}docs/media/q0-dither-${which}.json`, JSON.stringify(result, null, 2));
  for (const r of rows) {
    const got = result.rows.find((x) => x.label === r.label);
    console.log(
      `${r.label.padEnd(18)} background raster mean ${String(got.meanDirtyPct).padStart(6)} %  ` +
        `min ${Math.min(...got.cards.map((c) => c.dirtyPct))} %  max ${Math.max(...got.cards.map((c) => c.dirtyPct))} %`
    );
  }
} finally {
  await browser.close();
  server.kill();
}
