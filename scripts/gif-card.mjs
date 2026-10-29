// README GIF: a dithered card turns into the photo on hover (examples/static). Playwright video → ffmpeg → GIF ≤ 4 MB.
// Usage: node scripts/gif-card.mjs   (needs `pnpm build` and ffmpeg; starts its own static server on :4197)
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4197;
const tmp = `${root}.lighthouse/gif-card`;
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const server = spawn('node', [`${root}scripts/serve.mjs`, String(PORT)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 960, height: 600 },
  deviceScaleFactor: 1,
  recordVideo: { dir: tmp, size: { width: 960, height: 600 } },
});
const page = await ctx.newPage();
try {
  await page.goto(`http://localhost:${PORT}/examples/static/`, { waitUntil: 'load' });
  await page.waitForFunction(
    () => document.querySelectorAll('.grid vitrine-shader[data-vitrine-state="baked"]').length >= 8,
    null,
    { timeout: 60_000 }
  );
  const grid = page.locator('#catalogue');
  await grid.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 70));
  await page.waitForTimeout(900);
  const cards = page.locator('.card');
  for (const i of [1, 2, 3]) {
    const card = cards.nth(i);
    await card.hover();
    await page.waitForTimeout(1100);
  }
  await page.mouse.move(10, 10);
  await page.waitForTimeout(900);
} finally {
  await ctx.close();
  await browser.close();
  server.kill();
}
const webm = `${tmp}/${readdirSync(tmp).find((f) => f.endsWith('.webm'))}`;
const out = `${root}docs/media/vitrine-card-reveal.gif`;
// 2-pass palette for a clean 2-tone dither; 15 fps, 800 px wide.
execFileSync(
  'ffmpeg',
  ['-y', '-i', webm, '-vf', 'fps=15,scale=800:-1:flags=lanczos,palettegen=max_colors=96', `${tmp}/pal.png`],
  { stdio: 'ignore' }
);
execFileSync(
  'ffmpeg',
  [
    '-y',
    '-i',
    webm,
    '-i',
    `${tmp}/pal.png`,
    '-lavfi',
    'fps=15,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3',
    out,
  ],
  { stdio: 'ignore' }
);
console.log(out, `${(statSync(out).size / 1024 / 1024).toFixed(2)} MB`);
