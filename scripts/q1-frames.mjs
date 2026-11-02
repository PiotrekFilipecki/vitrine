// Q1 · frame time while the glass opens (Chrome, CPU ×4 through CDP), and live contexts after load.
// Opens the hero glass (the largest one on the page) and a catalogue card, 3 runs each, and records every
// requestAnimationFrame interval from the first live frame to the end of the 520 ms opening. Median of 3 runs.
// Usage: node scripts/q1-frames.mjs   (needs `pnpm build` and `pnpm serve` on :4173). Writes docs/media/q1-frames.json.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const BASE = process.env.VITRINE_BASE ?? 'http://localhost:4173/examples/static/';
const RUNS = 3;
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const pct = (a, p) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * p))];

const browser = await chromium.launch();
const out = { cpu: 4, viewport: '1440×900 @2x', runs: [] };
for (let run = 0; run < RUNS; run++) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForFunction(
    () => document.querySelector('.hero__photo vitrine-shader')?.dataset.vitrineState === 'baked',
    null,
    {
      timeout: 60_000,
    }
  );
  await page.waitForTimeout(2200); // baker idle
  const atRest = await page.evaluate(async () => {
    const { VitrineShader } = await import('/packages/element/dist/index.js');
    return { ...VitrineShader.stats(), canvases: document.querySelectorAll('canvas').length };
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const measure = async (sel) => {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      const r = (window.__frames = { deltas: [], liveAt: null, openAt: null, t0: performance.now() });
      let last = 0;
      const tick = (t) => {
        if (
          r.liveAt === null &&
          el.querySelector('.vitrine-live canvas') &&
          el.querySelector('.vitrine-live').style.visibility === ''
        )
          r.liveAt = t;
        if (r.liveAt !== null && r.openAt === null && last) r.deltas.push(t - last);
        if (el.hasAttribute('data-vitrine-open') && r.openAt === null) r.openAt = t;
        last = t;
        if (r.openAt === null && t - r.t0 < 5000) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, sel);
    const b = await page.locator(sel).boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 2 });
    await page.waitForFunction(
      () => window.__frames.openAt !== null || performance.now() - window.__frames.t0 > 5000
    );
    const f = await page.evaluate(() => window.__frames);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(1500);
    return {
      startMs: +(f.liveAt - f.t0).toFixed(1), // pointer → first live frame (context + shader + texture)
      openMs: +(f.openAt - f.liveAt).toFixed(1),
      frames: f.deltas.length,
      medianFrameMs: +median(f.deltas).toFixed(1),
      p95FrameMs: +pct(f.deltas, 0.95).toFixed(1),
      maxFrameMs: +Math.max(...f.deltas).toFixed(1),
    };
  };
  const hero = await measure('.hero__photo vitrine-shader');
  await page.evaluate(() => document.querySelector('#objects').scrollIntoView());
  await page.waitForTimeout(600);
  const card = await measure('.catalogue vitrine-shader');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  out.runs.push({ atRest, hero, card });
  console.log(`run ${run + 1}`, JSON.stringify({ atRest, hero, card }));
  await ctx.close();
}
await browser.close();
const pick = (k, f) => +median(out.runs.map((r) => r[k][f])).toFixed(1);
out.median = Object.fromEntries(
  ['hero', 'card'].map((k) => [
    k,
    Object.fromEntries(
      ['startMs', 'medianFrameMs', 'p95FrameMs', 'maxFrameMs', 'frames'].map((f) => [f, pick(k, f)])
    ),
  ])
);
out.median.contextsAtRest = median(
  out.runs.map(
    (r) => r.atRest.canvases + r.atRest.bakerContexts + r.atRest.liveMounts + r.atRest.interactionMounts
  )
);
console.log('median', JSON.stringify(out.median));
writeFileSync('docs/media/q1-frames.json', JSON.stringify(out, null, 2));
