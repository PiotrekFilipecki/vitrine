import { expect, test } from '@playwright/test';
import { collectConsole, MEDIA, saveJson, savePngFromDataUrl, waitForDone } from './shared';

/**
 * PLAN §5 gate: element vs @paper-design/shaders-react on the same params → ≤ 1 % differing pixels.
 * 4 effects × 2 presets (upstream Default + the VITRINE draft), plus glass × 3 and lens × 2 since Q1. Static
 * (speed 0, frame 0) on both sides; the lens is compared full-frame (`bind="none"`), the pointer loupe has its own test.
 */
const Q1_IMG = '/examples/fixtures/products/w1000/04-chair.webp';

const CASES: Array<{ effect: string; preset: string; img?: string }> = [
  { effect: 'dither', preset: 'default' },
  { effect: 'dither', preset: 'newsprint' },
  { effect: 'halftone', preset: 'default' },
  { effect: 'halftone', preset: 'riso' },
  { effect: 'mesh', preset: 'default' },
  { effect: 'mesh', preset: 'drop-night' },
  {
    effect: 'paper',
    preset: 'default',
    img: '/packages/element/e2e/fixtures/niwwts/piece-formation-wattstax-72.webp',
  },
  {
    effect: 'paper',
    preset: 'folded-lookbook',
    img: '/packages/element/e2e/fixtures/niwwts/piece-formation-wattstax-72.webp',
  },
  // Q1 (ADR-0003): the two new shaders on the demo photographs, upstream Default + the R0 presets.
  { effect: 'glass', preset: 'default', img: Q1_IMG },
  { effect: 'glass', preset: 'window', img: Q1_IMG },
  { effect: 'glass', preset: 'preorder-30', img: '/examples/fixtures/products/w1000/03-sneaker.webp' },
  { effect: 'lens', preset: 'default', img: Q1_IMG },
  { effect: 'lens', preset: 'loupe', img: '/examples/fixtures/products/w1000/07-bag.webp' },
];

test.describe('P1 · pixel compatibility with shaders-react', () => {
  for (const c of CASES) {
    test(`${c.effect} / ${c.preset}: ≤ 1% differing pixels, 0 canvases left in the element`, async ({
      page,
    }, testInfo) => {
      const con = collectConsole(page);
      const url = `/packages/element/e2e/pages/compat.html?effect=${c.effect}&preset=${c.preset}${c.img ? `&img=${c.img}` : ''}`;
      await page.goto(url);
      const r = await waitForDone(page);
      const name = `compat-${c.effect}-${c.preset}`;
      saveJson(name, testInfo, { ...r, console: con.all });
      const diffUrl = await page.evaluate(() =>
        (document.getElementById('diff') as HTMLCanvasElement).toDataURL('image/png')
      );
      savePngFromDataUrl(`${MEDIA}/p1-${name}-diff-${testInfo.project.name}.png`, diffUrl);
      await page.screenshot({ path: `${MEDIA}/p1-${name}-${testInfo.project.name}.png` });

      expect(r.error, 'page threw').toBeUndefined();
      expect(r.ref.canvas).toBe(r.vitrine.baked);
      expect(r.vitrine.stats.maxLuma - r.vitrine.stats.minLuma).toBeGreaterThan(20);
      expect(r.diff.pct).toBeLessThanOrEqual(1);
      expect(r.vitrine.canvasesInElement).toBe(0);
      expect(con.errors).toEqual([]);
    });
  }
});
