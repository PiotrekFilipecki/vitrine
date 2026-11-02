// Q1 · screenshots and clips of the Store demo for the devlog and the gate (docs/media/q1-*).
// Stills: PNG (gitignored) + WebP ≤ 400 kB (committed), 390 and 1440 px, deviceScaleFactor 2.
// Clips: Playwright video (real time, the element's own motion) → MP4 (committed) and GIF (gitignored), each ≤ 2 MB.
// Needs `pnpm build`, `pnpm serve` on :4173, ffmpeg and cwebp on PATH.
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { describe, toWebp } from './r0-media.mjs';

const BASE = process.env.VITRINE_BASE ?? 'http://localhost:4173/examples/static/';
const MEDIA = 'docs/media';
const TMP = 'test-results/q1-video';
const CLIP_LIMIT = 2_000_000;
mkdirSync(MEDIA, { recursive: true });

async function settle(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(
    () => window.__vitrine && window.__vitrine.readyCount >= window.__vitrine.elements,
    null,
    {
      timeout: 60_000,
    }
  );
  await page.waitForTimeout(1800);
}

async function still(page, name, opts = {}) {
  const png = `${MEDIA}/${name}.png`;
  if (opts.locator) await opts.locator.screenshot({ path: png });
  else await page.screenshot({ path: png, fullPage: Boolean(opts.fullPage) });
  console.log(`  → ${describe(toWebp(png))}`);
}

const browser = await chromium.launch();
const errors = [];

for (const width of [1440, 390]) {
  const mobile = width < 600;
  const ctx = await browser.newContext({
    viewport: { width, height: mobile ? 844 : 900 },
    deviceScaleFactor: 2,
    hasTouch: mobile,
    isMobile: mobile,
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(BASE, { waitUntil: 'load' });
  await settle(page);
  console.log(`${width} px`);
  await still(page, `q1-hero-${width}`);
  const hero = page.locator('.hero__photo vitrine-shader');
  if (mobile) await hero.tap();
  else await hero.hover();
  await page.waitForFunction(() =>
    document.querySelector('.hero__photo vitrine-shader').hasAttribute('data-vitrine-open')
  );
  await page.waitForTimeout(300);
  await still(page, `q1-hero-${width}-open`);
  if (mobile) await page.locator('.bar').tap();
  else await page.mouse.move(2, 2);
  await page.waitForTimeout(900);
  await page.locator('#objects').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await still(page, `q1-catalogue-${width}`, { locator: page.locator('#objects') });
  await page.locator('#pre-order').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await still(page, `q1-preorder-${width}`, { locator: page.locator('#pre-order') });
  await page.goto(`${BASE}products/satchel.html`, { waitUntil: 'load' });
  await page.waitForFunction(
    () => document.querySelector('vitrine-shader')?.dataset.vitrineState === 'interactive'
  );
  const pdp = page.locator('.pdp__media vitrine-shader');
  const b = await pdp.boundingBox();
  if (!mobile) {
    await page.mouse.move(b.x + b.width * 0.55, b.y + b.height * 0.5, { steps: 4 });
    await page.waitForTimeout(600);
  } else {
    // A held touch through CDP: touchStart, wait past the 350 ms hold, then a screenshot with the loupe out.
    const cdp = await ctx.newCDPSession(page);
    const pt = { x: b.x + b.width * 0.5, y: b.y + b.height * 0.55 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt] });
    await page.waitForTimeout(900);
    await still(page, `q1-pdp-${width}-hold`);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(600);
  }
  await still(page, `q1-pdp-${width}`);
  await ctx.close();
}

// Clips: real-time recordings of the glass (hero + a card) and of the loupe.
async function clip(name, size, run) {
  rmSync(TMP, { recursive: true, force: true });
  const ctx = await browser.newContext({
    viewport: size,
    deviceScaleFactor: 1,
    recordVideo: { dir: TMP, size },
  });
  const page = await ctx.newPage();
  await run(page);
  await ctx.close();
  const webm = `${TMP}/${readdirSync(TMP).find((f) => f.endsWith('.webm'))}`;
  const mp4 = `${MEDIA}/${name}.mp4`;
  const gif = `${MEDIA}/${name}.gif`;
  // Trim the loading second, 720 px wide H.264.
  execFileSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-ss',
    '1.2',
    '-i',
    webm,
    '-vf',
    'scale=720:-2',
    '-c:v',
    'libx264',
    '-crf',
    '24',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    mp4,
  ]);
  for (const [w, fps] of [
    [480, 15],
    [400, 12],
    [360, 10],
  ]) {
    execFileSync('ffmpeg', [
      '-y',
      '-loglevel',
      'error',
      '-i',
      mp4,
      '-vf',
      `fps=${fps},scale=${w}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer`,
      gif,
    ]);
    if (statSync(gif).size <= CLIP_LIMIT) break;
  }
  const dur = execFileSync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'csv=p=0',
    mp4,
  ])
    .toString()
    .trim();
  console.log(
    `${name}: mp4 ${(statSync(mp4).size / 1e6).toFixed(2)} MB · gif ${(statSync(gif).size / 1e6).toFixed(2)} MB · ${(+dur).toFixed(1)} s`
  );
  if (statSync(mp4).size > CLIP_LIMIT || statSync(gif).size > CLIP_LIMIT)
    throw new Error(`${name} over 2 MB`);
}

const size = { width: 1280, height: 800 };
await clip('q1-glass', size, async (page) => {
  await page.goto(BASE, { waitUntil: 'load' });
  await settle(page);
  const h = await page.locator('.hero__photo vitrine-shader').boundingBox();
  await page.waitForTimeout(600);
  await page.mouse.move(h.x + h.width * 0.4, h.y + h.height * 0.5, { steps: 10 });
  await page.waitForTimeout(1300);
  await page.mouse.move(h.x - 120, h.y + h.height * 0.6, { steps: 10 });
  await page.waitForTimeout(1100);
  await page.evaluate(() => document.querySelector('#objects').scrollIntoView());
  await page.waitForTimeout(700);
  const cards = page.locator('.catalogue vitrine-shader');
  for (const i of [0, 4, 8]) {
    const c = await cards.nth(i).boundingBox();
    await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2, { steps: 8 });
    await page.waitForTimeout(1000);
  }
  await page.mouse.move(640, 20, { steps: 8 });
  await page.waitForTimeout(900);
});
await clip('q1-loupe', size, async (page) => {
  await page.goto(`${BASE}products/satchel.html`, { waitUntil: 'load' });
  await page.waitForFunction(
    () => document.querySelector('vitrine-shader')?.dataset.vitrineState === 'interactive'
  );
  await page.waitForTimeout(800);
  const b = await page.locator('.pdp__media vitrine-shader').boundingBox();
  await page.mouse.move(b.x + b.width * 0.3, b.y + b.height * 0.45, { steps: 6 });
  await page.waitForTimeout(700);
  for (const [fx, fy] of [
    [0.5, 0.42],
    [0.65, 0.6],
    [0.32, 0.68],
    [0.45, 0.35],
  ]) {
    await page.mouse.move(b.x + b.width * fx, b.y + b.height * fy, { steps: 30 });
    await page.waitForTimeout(250);
  }
  await page.mouse.move(b.x + b.width + 160, b.y + 80, { steps: 8 });
  await page.waitForTimeout(900);
});

await browser.close();
rmSync(TMP, { recursive: true, force: true });
console.log(`page errors: ${errors.length}${errors.length ? `\n${errors.join('\n')}` : ''}`);
