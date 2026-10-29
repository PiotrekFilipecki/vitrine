// R0 · R4: screenshots of examples/static/r0-hero.html at 1440 and 390 px, plus a GIF of the hero glass parting.
// The GIF is driven frame by frame through window.__r0.hero.set(cx, gap) with the page's own easing (ease-out cubic),
// so every frame is exact; a small ring stands in for the cursor. Needs ffmpeg and cwebp.
// Committed: .webp copies of the screenshots (≤ 400 KB) and r0-hero-1440.mp4; PNG and GIF stay local (gitignored).
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { bundleR0 } from '../examples/r0/build.mjs';
import { describe, toWebp } from './r0-media.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = (name) => `${root}docs/media/r0-hero-${name}`;
const URL_ = 'http://localhost:4200/examples/static/r0-hero.html';

await bundleR0();
const server = spawn('node', [`${root}scripts/serve.mjs`, '4200'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 700));
const browser = await chromium.launch();
const errors = [];
const open = async (width, height, dpr, opts = {}) => {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: dpr, ...opts });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(URL_);
  await page.waitForFunction(() => window.__r0?.ready >= 1 || window.__r0?.error, null, { timeout: 60_000 });
  const err = await page.evaluate(() => window.__r0.error);
  if (err) throw new Error(err);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  return page;
};
try {
  // 1440: rest, hover (glass parted at the pointer), card hover, full page
  const d = await open(1440, 900, 2);
  await d.screenshot({ path: out('1440.png') });
  const box = await d.locator('#hero').boundingBox();
  await d.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.5);
  await d.waitForTimeout(900);
  await d.screenshot({ path: out('1440-hover.png') });
  await d.mouse.move(5, 5);
  await d.locator('#card').scrollIntoViewIfNeeded();
  await d.waitForFunction(() => window.__r0.ready >= 2, null, { timeout: 30_000 });
  await d.evaluate(() => window.scrollTo(0, 0));
  await d.waitForTimeout(400);
  await d.screenshot({ path: out('1440-full.png'), fullPage: true });
  await d.locator('#card').scrollIntoViewIfNeeded();
  await d.waitForTimeout(200);
  const cb = await d.locator('#card').boundingBox(); // viewport coordinates, so measure after scrolling
  await d.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await d.waitForTimeout(900);
  await d.locator('.objects').screenshot({ path: out('1440-card-open.png') });
  await d.close();

  // 390: rest, after a tap, full page
  const m = await open(390, 844, 3, { hasTouch: true, isMobile: true });
  await m.screenshot({ path: out('390.png') });
  const photoTop = await m.evaluate(() => document.getElementById('hero').getBoundingClientRect().top);
  console.log(`390 × 844: hero photo top at ${photoTop.toFixed(1)} px (top half ends at 422 px)`);
  await m.locator('#hero').tap({ position: { x: 230, y: 200 } });
  await m.waitForTimeout(900);
  await m.screenshot({ path: out('390-tap.png') });
  await m.locator('#hero').tap({ position: { x: 230, y: 200 } });
  await m.waitForTimeout(700);
  await m.locator('#card').scrollIntoViewIfNeeded();
  await m.waitForFunction(() => window.__r0.ready >= 2, null, { timeout: 30_000 });
  await m.evaluate(() => window.scrollTo(0, 0));
  await m.waitForTimeout(400);
  // fullPage resizes the viewport behind the scenes and drops touch emulation (hover: none flips, the mouse hint
  // shows); a tall viewport keeps the phone emulation intact
  const tall = await m.evaluate(() => document.documentElement.scrollHeight);
  await m.setViewportSize({ width: 390, height: tall });
  await m.waitForTimeout(300);
  await m.screenshot({ path: out('390-full.png') });
  await m.close();

  // GIF: hero at 1440 × 900, frames at 1×, 20 fps
  const g = await open(1440, 900, 1);
  await g.evaluate(() => {
    const ring = document.createElement('div');
    ring.id = 'ring';
    Object.assign(ring.style, {
      position: 'fixed',
      width: '18px',
      height: '18px',
      margin: '-9px 0 0 -9px',
      borderRadius: '50%',
      border: '1.5px solid #efebe4',
      boxShadow: '0 0 0 1px rgba(20,19,18,.5)',
      pointerEvents: 'none',
      zIndex: 9,
      opacity: '0',
    });
    document.body.append(ring);
  });
  const hb = await g.locator('#hero').boundingBox();
  const easeOut = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
  const seg = (s, a, b) => easeOut((s - a) / (b - a));
  const FPS = 20,
    SECONDS = 4.4;
  const dir = mkdtempSync(join(tmpdir(), 'r0-hero-'));
  for (let i = 0; i < FPS * SECONDS; i++) {
    const s = i / FPS;
    // enter at 0.4 s (gap → 0.2 in 520 ms), glide 1.0–2.0 s, click at 2.3 s (gap → 1 in 640 ms), click at 3.5 s (gap → 0 in 420 ms)
    let cx = 0.42 + 0.3 * seg(s, 1.0, 2.0);
    let gap =
      s < 2.3 ? 0.2 * seg(s, 0.4, 0.92) : s < 3.5 ? 0.2 + 0.8 * seg(s, 2.3, 2.94) : 1 - seg(s, 3.5, 3.92);
    const visible = s >= 0.3 && s < 4.1;
    await g.evaluate(
      ([cx, gap, x, y, visible]) => {
        window.__r0.hero.set(cx, gap);
        const r = document.getElementById('ring');
        Object.assign(r.style, { left: `${x}px`, top: `${y}px`, opacity: visible ? '1' : '0' });
        return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      },
      [cx, gap, hb.x + hb.width * cx, hb.y + hb.height * 0.48, visible]
    );
    await g.screenshot({ path: join(dir, `f${String(i).padStart(3, '0')}.png`) });
  }
  await g.close();
  const gif = out('1440.gif');
  let w = 720;
  for (;;) {
    execFileSync('ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-framerate',
      String(FPS),
      '-i',
      join(dir, 'f%03d.png'),
      '-vf',
      `scale=${w}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle`,
      gif,
    ]);
    if (statSync(gif).size <= 2 * 1024 * 1024 || w <= 480) break;
    w -= 80;
  }
  const mp4 = out('1440.mp4');
  execFileSync('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-framerate',
    String(FPS),
    '-i',
    join(dir, 'f%03d.png'),
    '-vf',
    'scale=960:-2:flags=lanczos',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '24',
    '-movflags',
    '+faststart',
    mp4,
  ]);
  rmSync(dir, { recursive: true, force: true });
  for (const f of [
    '1440.png',
    '1440-hover.png',
    '1440-full.png',
    '1440-card-open.png',
    '390.png',
    '390-tap.png',
    '390-full.png',
  ])
    console.log(`  → ${describe(toWebp(out(f)))}`);
  console.log(`r0-hero-1440.mp4 ${(statSync(mp4).size / 1e6).toFixed(2)} MB`);
  for (const f of [
    '1440.png',
    '1440-hover.png',
    '1440-full.png',
    '1440-card-open.png',
    '390.png',
    '390-tap.png',
    '390-full.png',
    '1440.gif',
  ])
    console.log(`r0-hero-${f.padEnd(22)} ${(statSync(out(f)).size / 1e6).toFixed(2)} MB`);
  console.log(
    `gif width ${w} px, ${FPS} fps, ${SECONDS} s · page errors: ${errors.length}${errors.length ? '\n  ' + errors.join('\n  ') : ''}`
  );
} finally {
  await browser.close();
  server.kill();
}
