// R0 · proof sheets of the candidate effects (docs/vitrine/KIERUNEK-v2.md), rendered with @paper-design/shaders-react
// in Chromium. One sheet per effect: three photos × (no effect + three presets).
// Usage: node scripts/r0-sheets.mjs [effect-id ...]   → docs/media/r0-<id>.png (local, gitignored), r0-<id>.webp
// (≤ 400 KB, committed) and r0-<id>.json with the exact props.
import { spawn } from 'node:child_process';
import { writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { bundleR0 } from '../examples/r0/build.mjs';
import { EFFECTS } from '../examples/r0/effects.js';
import { describe, toWebp } from './r0-media.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
// Tuning: R0_TUNE='{"effect":"fluted-glass","presets":[...],"photos":"a,b","out":"/path.png"}' renders candidates elsewhere.
const tune = process.env.R0_TUNE ? JSON.parse(process.env.R0_TUNE) : null;
const ids = tune
  ? [tune.effect]
  : process.argv.slice(2).length
    ? process.argv.slice(2)
    : EFFECTS.map((e) => e.id);
const DPR = Number(process.env.R0_DPR ?? 2);

await bundleR0();
const server = spawn('node', [`${root}scripts/serve.mjs`, '4198'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 700));
const browser = await chromium.launch();
try {
  for (const id of ids) {
    const effect = EFFECTS.find((e) => e.id === id);
    if (!effect) throw new Error(`unknown effect ${id}`);
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: DPR });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    const t0 = Date.now();
    const extra = tune
      ? `&presets=${encodeURIComponent(JSON.stringify(tune.presets))}&cols=${tune.presets.length + 1}` +
        (tune.photos ? `&photos=${tune.photos}` : '')
      : '';
    await page.goto(`http://localhost:4198/examples/r0/sheet.html?effect=${id}${extra}`);
    await page.waitForFunction(() => window.__sheet?.done, null, { timeout: 120_000 });
    const result = await page.evaluate(() => window.__sheet);
    if (result.error) throw new Error(`${id}: ${result.error}`);
    const out = tune ? tune.out : `${root}docs/media/r0-${id}.png`;
    await page.screenshot({ path: out, fullPage: true });
    const json = {
      effect: id,
      renderer: '@paper-design/shaders-react 0.0.82, Chromium (Playwright), deviceScaleFactor ' + DPR,
      photos: effect.photos,
      base: effect.base,
      presets: effect.presets.map((p, i) => ({
        name: p.name,
        props: p.props,
        resolvedPerPhoto: result.resolved[i],
      })),
      consoleErrors: errors,
    };
    if (!tune) writeFileSync(out.replace(/\.png$/, '.json'), JSON.stringify(json, null, 2));
    console.log(
      `${id.padEnd(22)} ${((Date.now() - t0) / 1000).toFixed(1)} s  ${(statSync(out).size / 1e6).toFixed(2)} MB  errors ${errors.length}`
    );
    if (errors.length) console.log('  ' + errors.join('\n  '));
    if (!tune) console.log(`  → ${describe(toWebp(out))}`);
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
