import { expect, test, type Page } from '@playwright/test';
import { collectConsole, MEDIA, saveJson } from './shared';

/**
 * P2 · packages/element/e2e/pages/theme-markup.html = the HTML the Liquid sections and the card snippet render
 * (Horizon card DOM, one <script type=module src=vitrine.js> per section and per card).
 * Same assertions as P1's grid, plus: the module is fetched once however many tags point at it.
 */
const URL_ = '/packages/element/e2e/pages/theme-markup.html';

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
}

async function waitBaked(page: Page, n: number) {
  await page.waitForFunction(
    (n) => document.querySelectorAll('vitrine-shader[data-vitrine-state="baked"]').length >= n,
    n,
    { timeout: 60_000 }
  );
}

test.describe('P2 · theme markup (shopify-theme/ rendered)', () => {
  test('26 script tags, 1 fetch; 24 cards + editorial baked, hero live, 0 contexts after bake', async ({
    page,
  }, testInfo) => {
    const con = collectConsole(page);
    const vitrineRequests: string[] = [];
    page.on('request', (r) => {
      if (r.url().endsWith('/vitrine.js')) vitrineRequests.push(r.url());
    });
    await page.goto(URL_, { waitUntil: 'load' });
    await scrollThrough(page);
    await waitBaked(page, 25);
    await page.waitForTimeout(2200);
    const r = await page.evaluate(() => {
      const w = window as unknown as {
        __vitrine: { scriptTags: number; fallbacks: unknown[]; modes: Record<string, number> };
      };
      const heroCanvas = document.querySelector('#hero canvas') as HTMLCanvasElement | null;
      return {
        scriptTags: w.__vitrine.scriptTags,
        modes: w.__vitrine.modes,
        fallbacks: w.__vitrine.fallbacks,
        cardCanvases: document.querySelectorAll('.product-grid canvas').length,
        cardBakedImgs: document.querySelectorAll('.product-grid .vitrine-layer > img').length,
        bakerHosts: document.querySelectorAll('[data-vitrine-baker]').length,
        heroState: document.getElementById('hero')?.getAttribute('data-vitrine-state'),
        heroContextLost: heroCanvas ? heroCanvas.getContext('webgl2')?.isContextLost() : null,
        styleTags: document.querySelectorAll('link[href$="vitrine-theme.css"]').length,
      };
    });
    saveJson(
      'theme-markup',
      testInfo,
      { ...r, vitrineRequests: vitrineRequests.length, console: con.all },
      'p2'
    );
    // The hero section's aria-labelledby must resolve (review H1: the Liquid heading carries the id).
    expect(
      await page.evaluate(() => {
        const sec = document.querySelector('.vitrine-hero');
        return Boolean(document.getElementById(sec?.getAttribute('aria-labelledby') ?? ''));
      })
    ).toBe(true);
    expect(r.scriptTags).toBe(26);
    expect(vitrineRequests).toHaveLength(1);
    expect(r.fallbacks).toEqual([]);
    expect(r.modes['baked']).toBe(25);
    expect(r.modes['live']).toBe(1);
    expect(r.cardCanvases).toBe(0);
    expect(r.cardBakedImgs).toBe(24);
    expect(r.bakerHosts).toBe(0);
    expect(r.heroState).toBe('live');
    expect(r.heroContextLost).toBe(false);
    expect(con.errors).toEqual([]);
  });

  test('keyboard: Tab onto a card reveals the photo, Tab away hides it', async ({ page }, testInfo) => {
    const tab = testInfo.project.name === 'webkit' ? 'Alt+Tab' : 'Tab';
    await page.goto(URL_, { waitUntil: 'load' });
    const first = page.locator('.product-card__link').first();
    const second = page.locator('.product-card__link').nth(1);
    // The reveal surface is attached during the element's setup; wait for these two cards, not for "any 4".
    await expect(first.locator('vitrine-shader')).toHaveAttribute('data-vitrine-state', 'baked', {
      timeout: 60_000,
    });
    await expect(second.locator('vitrine-shader')).toHaveAttribute('data-vitrine-state', 'baked', {
      timeout: 60_000,
    });
    await first.focus();
    await expect(first.locator('vitrine-shader')).toHaveAttribute('data-vitrine-revealed');
    await page.keyboard.press(tab);
    await expect(second).toBeFocused();
    await expect(first.locator('vitrine-shader')).not.toHaveAttribute('data-vitrine-revealed');
    await expect(second.locator('vitrine-shader')).toHaveAttribute('data-vitrine-revealed');
  });

  test('editorial figure is the reveal surface (data-vitrine-card), hover reveals', async ({ page }) => {
    await page.goto(URL_, { waitUntil: 'load' });
    await scrollThrough(page);
    await waitBaked(page, 25);
    const fig = page.locator('.vitrine-editorial__figure');
    await fig.scrollIntoViewIfNeeded();
    await fig.hover();
    await expect(fig.locator('vitrine-shader')).toHaveAttribute('data-vitrine-revealed');
  });

  test('prefers-reduced-motion: hero baked, no transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(URL_, { waitUntil: 'load' });
    await waitBaked(page, 5);
    await expect(page.locator('#hero')).toHaveAttribute('data-vitrine-state', 'baked');
    const duration = await page
      .locator('.product-grid .vitrine-layer')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe('0s');
  });

  test('screenshots 390 and 1440 (chromium)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'one browser is enough for the review screenshots');
    for (const [w, h] of [
      [390, 844],
      [1440, 900],
    ] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(URL_, { waitUntil: 'load' });
      await scrollThrough(page);
      await waitBaked(page, 25);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${MEDIA}/p2-theme-markup-${w}.png`, fullPage: true });
    }
  });
});
