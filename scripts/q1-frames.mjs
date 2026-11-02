// Q1 · frame time while the glass opens (Chrome, CPU ×4 through CDP), and live contexts after load.
// Opens the hero glass (the largest one on the page) and a catalogue card, 3 runs each, and records every
// requestAnimationFrame interval: the start (context creation, behind the baked frame) and the motion (pane moving →
// open) separately. Median of 3 runs.
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
  // Contexts after load: wait for the bake queue (cards near the viewport) and the baker idle timeout (1.5 s).
  await page.waitForTimeout(5000);
  const atRest = await page.evaluate(async () => {
    const { VitrineShader } = await import('/packages/element/dist/index.js');
    return { ...VitrineShader.stats(), canvases: document.querySelectorAll('canvas').length };
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const measure = async (sel) => {
    // Timeline of one opening: rAF timestamps, plus the moments the live host appears (context created), the baked
    // frame is hidden (the pane starts to move) and the glass reports open.
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      const r = (window.__frames = { t: [], created: null, moving: null, open: null, t0: performance.now() });
      new MutationObserver(() => {
        const now = performance.now();
        if (r.created === null && el.querySelector('.vitrine-live')) r.created = now;
        if (r.moving === null && el.querySelector('.vitrine-baked')?.style.visibility === 'hidden')
          r.moving = now;
        if (r.open === null && el.hasAttribute('data-vitrine-open')) r.open = now;
      }).observe(el, { subtree: true, childList: true, attributes: true });
      const tick = (t) => {
        r.t.push(t);
        if (r.open === null && t - r.t0 < 5000) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, sel);
    const b = await page.locator(sel).first().boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 2 });
    await page.waitForFunction(
      () => window.__frames.open !== null || performance.now() - window.__frames.t0 > 5000
    );
    const f = await page.evaluate(() => window.__frames);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(1500);
    const deltas = (from, to) => {
      const out = [];
      for (let i = 1; i < f.t.length; i++) if (f.t[i] > from && f.t[i] <= to) out.push(f.t[i] - f.t[i - 1]);
      return out;
    };
    const prep = deltas(f.created, f.moving);
    const move = deltas(f.moving, f.open);
    return {
      // hover → context created → pane moving (what the shopper waits for) → open
      createdMs: +(f.created - f.t0).toFixed(1),
      startMs: +(f.moving - f.t0).toFixed(1),
      openMs: +(f.open - f.moving).toFixed(1),
      prepMaxFrameMs: +Math.max(...prep).toFixed(1),
      frames: move.length,
      medianFrameMs: +median(move).toFixed(1),
      p95FrameMs: +pct(move, 0.95).toFixed(1),
      maxFrameMs: +Math.max(...move).toFixed(1),
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
      ['startMs', 'prepMaxFrameMs', 'medianFrameMs', 'p95FrameMs', 'maxFrameMs', 'frames'].map((f) => [
        f,
        pick(k, f),
      ])
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
