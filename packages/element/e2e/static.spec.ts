import { expect, test } from '@playwright/test';
import { collectConsole, MEDIA, saveJson } from './shared';

type Stats = {
  dclAt: number;
  readyCount: number;
  msAllCards: number | null;
  modes: Record<string, number>;
  fallbacks: unknown[];
};

async function waitForCards(page: import('@playwright/test').Page, n: number): Promise<Stats> {
  await page.waitForFunction(
    (min) => (window as unknown as { __vitrine: Stats }).__vitrine?.readyCount >= min,
    n,
    {
      timeout: 60_000,
    }
  );
  return page.evaluate(() => (window as unknown as { __vitrine: Stats }).__vitrine);
}

test.describe('P1 · examples/static', () => {
  test('24 cards bake, hero + editorial ready, timing recorded', async ({ page }, testInfo) => {
    const con = collectConsole(page);
    await page.goto('/examples/static/');
    const stats = await waitForCards(page, 26);
    await page.waitForTimeout(2200);
    const after = await page.evaluate(() => ({
      canvases: document.querySelectorAll('canvas').length,
      heroCanvas: document.querySelectorAll('#hero canvas').length,
      bakerHosts: document.querySelectorAll('[data-vitrine-baker]').length,
    }));
    saveJson('static-timing', testInfo, { ...stats, after, console: con.all });
    expect(stats.fallbacks).toEqual([]);
    expect(stats.msAllCards).not.toBeNull();
    expect(after.bakerHosts).toBe(0);
    expect(after.canvases).toBe(after.heroCanvas); // only the live hero holds a context
    expect(con.errors).toEqual([]);
  });

  test('screenshots at 390 and 1440 px for the devlog', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'one set of screenshots is enough');
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto('/examples/static/');
      await waitForCards(page, 26);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${MEDIA}/p1-static-${width}.png`, fullPage: true });
    }
    // Reveal state for the devlog: hover the second card.
    await page.locator('.card').nth(1).hover();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${MEDIA}/p1-static-1440-reveal.png`,
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
  });
});
