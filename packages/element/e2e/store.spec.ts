import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

/**
 * P2 · the dev store's unpublished test theme through `shopify theme dev` (local proxy, no storefront password):
 *   shopify theme dev --store niwwts.myshopify.com --path examples/theme-test/live --port 9292 --store-password …
 * Skipped unless VITRINE_STORE_URL is set (e.g. http://127.0.0.1:9292). Never points at a client store.
 */
const STORE = process.env['VITRINE_STORE_URL'];
const MEDIA = 'docs/media';

test.describe('P2 · dev store (Horizon 4.3.0 + VITRINE)', () => {
  test.skip(!STORE, 'set VITRINE_STORE_URL to the theme dev proxy');

  /**
   * The storefront through the theme dev proxy logs its own errors (a CORS-blocked `http://cdn.shopify.com`
   * origin-trials script, CSP framing of shop.app, a 403 asset, the account menu). Only errors that mention
   * VITRINE, WebGL or uncaught page errors count; everything is kept in the JSON for the devlog.
   */
  function collect(page: Page) {
    const errors: string[] = [];
    const all: string[] = [];
    page.on('console', (m) => {
      all.push(`[${m.type()}] ${m.text()}`);
      if (m.type() === 'error' && /vitrine|webgl|shader/i.test(m.text())) errors.push(m.text());
    });
    page.on('pageerror', (e) => {
      // WebKit reports the proxy's blocked http://cdn.shopify.com origin-trials script as a page error.
      if (!/Cross-origin script load denied|ResizeObserver loop/.test(String(e)))
        errors.push(`[pageerror] ${String(e)}`);
    });
    return { errors, all };
  }

  async function settle(page: Page) {
    // Lazy images (Horizon: loading="lazy") only load once in view; WebKit needs the editorial figure actually
    // scrolled into view, a fast scroll-through is not enough.
    const figure = page.locator('.vitrine-editorial__figure');
    if (await figure.count()) {
      await figure.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
    }
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    // Elements without a box (hidden carousel slides, content-visibility) never bake by design; skip them.
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll('vitrine-shader')]
          .filter((el) => el.getBoundingClientRect().width > 0)
          .every((el) => ['baked', 'live', 'fallback'].includes(el.getAttribute('data-vitrine-state') ?? '')),
      null,
      { timeout: 60_000 }
    );
    await page.waitForTimeout(2200);
  }

  async function snapshot(page: Page) {
    return page.evaluate(() => {
      const states: Record<string, number> = {};
      const effects: Record<string, number> = {};
      for (const el of document.querySelectorAll('vitrine-shader')) {
        const s = el.getAttribute('data-vitrine-state') ?? 'none';
        states[s] = (states[s] ?? 0) + 1;
        const e = el.getAttribute('effect') ?? '?';
        effects[e] = (effects[e] ?? 0) + 1;
      }
      return {
        elements: document.querySelectorAll('vitrine-shader').length,
        states,
        effects,
        scriptTags: document.querySelectorAll('script[type="module"][src*="vitrine.js"]').length,
        canvases: document.querySelectorAll('vitrine-shader canvas').length,
        bakerHosts: document.querySelectorAll('[data-vitrine-baker]').length,
        cardImgsInShader: document.querySelectorAll('product-card vitrine-shader > img').length,
        cardImgsPlain: document.querySelectorAll('product-card .product-media > img').length,
      };
    });
  }

  test('home: hero + editorial sections render, hero live, editorial baked, no errors', async ({
    page,
  }, testInfo) => {
    const con = collect(page);
    const js: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('vitrine.js')) js.push(r.url());
    });
    await page.goto(`${STORE}/`, { waitUntil: 'load' });
    await settle(page);
    const r = await snapshot(page);
    mkdirSync(MEDIA, { recursive: true });
    writeFileSync(
      `${MEDIA}/p2-store-home-${testInfo.project.name}.json`,
      JSON.stringify({ ...r, vitrineRequests: js, errors: con.errors, console: con.all }, null, 2)
    );
    await page.screenshot({ path: `${MEDIA}/p2-store-home-${testInfo.project.name}.png`, fullPage: true });
    expect(r.effects['mesh']).toBe(1);
    expect(r.effects['paper']).toBe(1);
    expect(r.states['fallback'] ?? 0).toBe(0);
    expect(new Set(js).size).toBe(1);
    expect(r.bakerHosts).toBe(0);
    expect(con.errors).toEqual([]);
  });

  test('collection: every card image is inside <vitrine-shader>, all baked, 0 canvases', async ({
    page,
  }, testInfo) => {
    const con = collect(page);
    await page.goto(`${STORE}/collections/all`, { waitUntil: 'load' });
    await settle(page);
    const r = await snapshot(page);
    writeFileSync(
      `${MEDIA}/p2-store-collection-${testInfo.project.name}.json`,
      JSON.stringify({ ...r, errors: con.errors, console: con.all }, null, 2)
    );
    await page.screenshot({
      path: `${MEDIA}/p2-store-collection-${testInfo.project.name}.png`,
      fullPage: true,
    });
    expect(r.cardImgsInShader).toBeGreaterThan(0);
    expect(r.cardImgsPlain).toBe(0);
    expect(r.states['baked']).toBe(r.elements);
    expect(r.canvases).toBe(0);
    expect(r.bakerHosts).toBe(0);
    expect(con.errors).toEqual([]);
  });

  test('collection: keyboard reveal on the card link', async ({ page }, testInfo) => {
    const tab = testInfo.project.name === 'webkit' ? 'Alt+Tab' : 'Tab';
    await page.goto(`${STORE}/collections/all`, { waitUntil: 'load' });
    await settle(page);
    // Horizon: the keyboard target is the stretched `a.product-card__link`, a sibling of the image; the reveal
    // surface is the <product-card data-vitrine-card> root (focus-within), see shopify-theme/README.md.
    const card = page.locator('product-card:has(vitrine-shader)').first();
    const link = card.locator('a.product-card__link');
    await link.focus();
    await expect(link).toBeFocused();
    await expect(card.locator('vitrine-shader').first()).toHaveAttribute('data-vitrine-revealed');
    await page.keyboard.press(tab);
    await page.keyboard.press(tab);
    await expect(card.locator('vitrine-shader').first()).not.toHaveAttribute('data-vitrine-revealed');
  });

  test('collection: reduced motion keeps everything static', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${STORE}/`, { waitUntil: 'load' });
    await settle(page);
    expect(await page.locator('vitrine-shader[effect="mesh"] canvas').count()).toBe(0);
    await expect(page.locator('vitrine-shader[effect="mesh"]')).toHaveAttribute(
      'data-vitrine-state',
      'baked'
    );
  });
});
