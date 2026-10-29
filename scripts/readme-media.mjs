// README stills from examples/static (Q0): docs/media/readme-hero.jpg (the proof print with the loupe) and
// docs/media/readme-grid.jpg (the catalogue, one card revealed). Needs `pnpm build`, ImageMagick (`magick`).
// Usage: node scripts/readme-media.mjs
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const tmp = `${root}.lighthouse/readme-media`;
mkdirSync(tmp, { recursive: true });
const server = spawn('node', [`${root}scripts/serve.mjs`, '4193'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 700));
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4193/examples/static/');
  await page.waitForFunction(() => window.__vitrine?.readyCount >= 15, null, { timeout: 60_000 });
  // Loupe over the orange of the swirl, the way a visitor would leave it.
  const frame = page.locator('.proof__frame');
  const box = await frame.boundingBox();
  await page.mouse.move(box.x + box.width * 0.36, box.y + box.height * 0.4);
  await page.waitForTimeout(400);
  const hero = await page.locator('.proof').boundingBox();
  await page.screenshot({
    path: `${tmp}/hero.png`,
    clip: { x: 0, y: 0, width: 1440, height: Math.round(hero.y + hero.height + 8) },
  });
  await page.mouse.move(5, 5);
  const card = page.locator('.card').nth(2);
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await page.waitForTimeout(600);
  const grid = await page.locator('.grid').boundingBox();
  await page.screenshot({
    path: `${tmp}/grid.png`,
    clip: { x: grid.x, y: grid.y, width: grid.width, height: Math.min(grid.height, 820) },
  });
} finally {
  await browser.close();
  server.kill();
}
for (const name of ['hero', 'grid']) {
  const out = `${root}docs/media/readme-${name}.jpg`;
  execFileSync('magick', [`${tmp}/${name}.png`, '-quality', '86', out]);
  console.log(out, `${Math.round(statSync(out).size / 1024)} KB`);
}
