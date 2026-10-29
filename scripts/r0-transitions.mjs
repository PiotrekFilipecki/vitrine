// R0 · transitions of fluted-glass, lens-distortion and water: a five-frame strip (docs/media/r0-<id>-strip.png)
// and a short clip (docs/media/r0-<id>.mp4 + .gif, each ≤ 2 MB), rendered with @paper-design/shaders-react in Chromium.
// Committed: the strip as .webp (≤ 400 KB) and the MP4; the PNG strip and the GIF stay local (gitignored).
// Usage: node scripts/r0-transitions.mjs [effect-id ...]   (needs ffmpeg on PATH)
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { bundleR0 } from '../examples/r0/build.mjs';
import { EFFECTS } from '../examples/r0/effects.js';
import { describe, toWebp } from './r0-media.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const withTransition = EFFECTS.filter((e) => e.transition);
const ids = process.argv.slice(2).length ? process.argv.slice(2) : withTransition.map((e) => e.id);
const FPS = 30;
const SECONDS = 2.5;
const LIMIT = 2 * 1024 * 1024;

await bundleR0();
const server = spawn('node', [`${root}scripts/serve.mjs`, '4199'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 700));
const browser = await chromium.launch();
try {
  for (const id of ids) {
    // strip
    const sp = await browser.newPage({ viewport: { width: 1400, height: 200 }, deviceScaleFactor: 2 });
    await sp.goto(`http://localhost:4199/examples/r0/strip.html?effect=${id}`);
    await sp.waitForFunction(() => window.__ready, null, { timeout: 60_000 });
    const sr = await sp.evaluate(() => window.__ready);
    if (sr !== true) throw new Error(`${id} strip: ${sr}`);
    const strip = `${root}docs/media/r0-${id}-strip.png`;
    await sp.screenshot({ path: strip, fullPage: true });
    await sp.close();

    // clip: frames at 2× (480 × 600 CSS px), encoded at 480 px wide
    const vp = await browser.newPage({ viewport: { width: 480, height: 600 }, deviceScaleFactor: 2 });
    await vp.goto(`http://localhost:4199/examples/r0/transition.html?effect=${id}&w=480`);
    await vp.waitForFunction(() => window.__ready, null, { timeout: 60_000 });
    const vr = await vp.evaluate(() => window.__ready);
    if (vr !== true) throw new Error(`${id} clip: ${vr}`);
    const dir = mkdtempSync(join(tmpdir(), `r0-${id}-`));
    const cell = vp.locator('#cell > div');
    const n = Math.round(FPS * SECONDS);
    for (let i = 0; i < n; i++) {
      await vp.evaluate((sec) => window.__video(sec), i / FPS);
      await cell.screenshot({ path: join(dir, `f${String(i).padStart(3, '0')}.png`) });
    }
    await vp.close();
    const mp4 = `${root}docs/media/r0-${id}.mp4`;
    const gif = `${root}docs/media/r0-${id}.gif`;
    const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
    ff([
      '-framerate',
      String(FPS),
      '-i',
      join(dir, 'f%03d.png'),
      '-vf',
      'scale=480:-2:flags=lanczos',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-crf',
      '22',
      '-movflags',
      '+faststart',
      mp4,
    ]);
    let gifW = 400;
    for (;;) {
      ff([
        '-framerate',
        String(FPS),
        '-i',
        join(dir, 'f%03d.png'),
        '-vf',
        `fps=20,scale=${gifW}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle`,
        gif,
      ]);
      if (statSync(gif).size <= LIMIT || gifW <= 280) break;
      gifW -= 40;
    }
    rmSync(dir, { recursive: true, force: true });
    const mb = (f) => (statSync(f).size / 1e6).toFixed(2);
    console.log(`  → ${describe(toWebp(strip))}`);
    console.log(
      `${id.padEnd(16)} strip ${mb(strip)} MB · mp4 ${mb(mp4)} MB · gif ${mb(gif)} MB (${gifW} px, 20 fps) · ${n} frames`
    );
  }
} finally {
  await browser.close();
  server.kill();
}
