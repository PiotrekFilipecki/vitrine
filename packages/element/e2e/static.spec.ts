import { expect, test, type Page } from '@playwright/test';
import { collectConsole, MEDIA, saveJson } from './shared';

type Stats = {
  dclAt: number;
  readyCount: number;
  msAllCards: number | null;
  cards: number;
  modes: Record<string, number>;
  fallbacks: unknown[];
};

async function waitForReady(page: Page, n: number): Promise<Stats> {
  await page.waitForFunction(
    (min) => (window as unknown as { __vitrine: Stats }).__vitrine?.readyCount >= min,
    n,
    { timeout: 60_000 }
  );
  return page.evaluate(() => (window as unknown as { __vitrine: Stats }).__vitrine);
}

/** Live effects report ready on viewport entry: once the baked ones are in, bring the colour bar into view and back. */
async function readyWithMesh(page: Page): Promise<Stats> {
  await waitForReady(page, 14);
  await page.locator('.proof__mesh').scrollIntoViewIfNeeded();
  const stats = await waitForReady(page, 15);
  await page.evaluate(() => window.scrollTo(0, 0));
  return stats;
}

test.describe('Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial)', () => {
  test('12 unique cards bake, the print and the editorial bake, the colour bar is the only live context', async ({
    page,
  }, testInfo) => {
    const con = collectConsole(page);
    await page.goto('/examples/static/');
    const stats = await readyWithMesh(page); // 12 cards + proof print + editorial (baked) + colour bar (live)
    await page.waitForTimeout(2200);
    const after = await page.evaluate(() => ({
      canvases: document.querySelectorAll('canvas').length,
      meshCanvas: document.querySelectorAll('.proof__mesh canvas').length,
      bakerHosts: document.querySelectorAll('[data-vitrine-baker]').length,
      uniqueCardImages: new Set(
        [...document.querySelectorAll('.grid vitrine-shader > img')].map((i) => i.getAttribute('src'))
      ).size,
    }));
    saveJson('static-timing', testInfo, { ...stats, after, console: con.all }, 'q0');
    expect(stats.cards).toBe(12);
    expect(after.uniqueCardImages).toBe(12);
    expect(stats.fallbacks).toEqual([]);
    expect(stats.msAllCards).not.toBeNull();
    expect(stats.modes).toEqual({ baked: 14, live: 1 });
    expect(after.bakerHosts).toBe(0);
    expect(after.canvases).toBe(after.meshCanvas); // only the live colour bar holds a context
    expect(con.errors).toEqual([]);
  });

  for (const width of [390, 768, 1024, 1440]) {
    test(`grid at ${width} px: no empty bands, no horizontal overflow`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/examples/static/');
      await waitForReady(page, 14);
      const g = await page.evaluate(() => {
        const grid = document.querySelector('.grid')!.getBoundingClientRect();
        let cellArea = 0;
        const fill: Array<{ title: string; fill: number }> = [];
        for (const cell of document.querySelectorAll('.grid > .cell')) {
          const r = cell.getBoundingClientRect();
          cellArea += r.width * r.height;
          const meta = cell.querySelector('.card__meta');
          if (meta) {
            // How much of the cell height the card content reaches: v0.1 had ~0.5 next to the 2 × 1 lead.
            const m = meta.getBoundingClientRect();
            fill.push({
              title: cell.querySelector('.card__title')!.textContent!,
              fill: +((m.bottom - r.top) / r.height).toFixed(3),
            });
          }
        }
        return {
          covered: +(cellArea / (grid.width * grid.height)).toFixed(4),
          minFill: Math.min(...fill.map((f) => f.fill)),
          fill,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      });
      saveJson(`grid-${width}`, testInfo, g, 'q0');
      expect(g.scrollWidth).toBe(g.clientWidth);
      expect(g.covered).toBeGreaterThan(0.97); // the rest is the 1 px hairline gaps
      expect(g.minFill).toBeGreaterThan(0.85);
    });
  }

  test('the proof print: the loupe follows the pointer, click lifts the whole print, Enter too', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/examples/static/');
    await waitForReady(page, 14);
    const frame = page.locator('.proof__frame');
    const box = (await frame.boundingBox())!;
    await page.mouse.move(box.x + 100, box.y + 120);
    const pos = await frame.evaluate((el) =>
      [el.style.getPropertyValue('--lx'), el.style.getPropertyValue('--ly')].map((v) => parseFloat(v))
    );
    expect(Math.abs(pos[0]! - 100)).toBeLessThanOrEqual(1); // WebKit rounds the frame box to a sub-pixel
    expect(Math.abs(pos[1]! - 120)).toBeLessThanOrEqual(1);
    const mask = await page
      .locator('.proof__print > .vitrine-layer')
      .evaluate((el) => getComputedStyle(el).maskImage || getComputedStyle(el).webkitMaskImage);
    expect(mask).toContain('radial-gradient');
    await frame.click();
    await expect(frame).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.proof__print > .vitrine-layer')).toHaveCSS('opacity', '0');
    await frame.focus();
    await page.keyboard.press('Enter');
    await expect(frame).toHaveAttribute('aria-pressed', 'false');
  });

  test('screenshots at 390 and 1440 px for the devlog', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'one set of screenshots is enough');
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto('/examples/static/');
      await readyWithMesh(page);
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${MEDIA}/q0-static-${width}.png`, fullPage: true });
      await page.screenshot({ path: `${MEDIA}/q0-static-${width}-fold.png` });
    }
    await page.locator('.card').nth(1).hover();
    await page.waitForTimeout(500);
    await page.locator('.catalogue').screenshot({ path: `${MEDIA}/q0-static-1440-catalogue-reveal.png` });
  });
});

test.describe('Q0 · examples/static/stress.html (24 cards from 1600 px originals + a live mesh)', () => {
  test('24 cards bake while the mesh animates, 0 contexts left but the mesh', async ({ page }, testInfo) => {
    const con = collectConsole(page);
    await page.goto('/examples/static/stress.html');
    const stats = await waitForReady(page, 25);
    await page.waitForTimeout(2200);
    const after = await page.evaluate(() => ({
      canvases: document.querySelectorAll('canvas').length,
      heroCanvas: document.querySelectorAll('#hero canvas').length,
      bakerHosts: document.querySelectorAll('[data-vitrine-baker]').length,
    }));
    saveJson('stress-timing', testInfo, { ...stats, after, console: con.all }, 'q0');
    expect(stats.cards).toBe(24);
    expect(stats.fallbacks).toEqual([]);
    expect(stats.msAllCards).not.toBeNull();
    expect(after.bakerHosts).toBe(0);
    expect(after.canvases).toBe(after.heroCanvas);
    expect(con.errors).toEqual([]);
  });
});
