import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

/**
 * P3 · headless Next.js example on the production build (next start on :4175, see playwright.config.ts).
 * Same assertions as P1's grid: 0 live contexts for baked cards, 0 baker contexts after idle, hero live,
 * keyboard reveal, reduced motion, plus: no hydration errors, server HTML is a plain image.
 */
const MEDIA = 'docs/media';
const NEXT = 'http://localhost:4175';

function collect(page: Page) {
  const errors: string[] = [];
  const all: string[] = [];
  page.on('console', (m) => {
    all.push(`[${m.type()}] ${m.text()}`);
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => {
    all.push(`[pageerror] ${String(e)}`);
    // WebKit raises the benign "ResizeObserver loop completed with undelivered notifications" as a window error
    // when a ResizeObserver callback (ShaderMount's) changes layout; it is a notice, not a failure (P2 devlog).
    if (!/ResizeObserver loop/.test(String(e))) errors.push(`[pageerror] ${String(e)}`);
  });
  return { errors, all };
}

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

test.describe('P3 · next-headless (production build)', () => {
  test('server HTML: 24 cards are plain <img> inside <vitrine-shader>, element chunk is not inline', async ({
    request,
  }) => {
    const html = await (await request.get(`${NEXT}/`)).text();
    expect(html.match(/<vitrine-shader effect="dither" reveal="hover" preset="newsprint">/g)).toHaveLength(
      24
    );
    expect(html).toContain('<vitrine-shader effect="mesh" aria-hidden="true" preset="drop-night" id="hero"');
    expect(html).toContain('<vitrine-shader effect="paper" reveal="hover" preset="folded-lookbook">');
    // every card image has alt, width and height from the server
    const imgs = html.match(/<img[^>]*>/g) ?? [];
    const cardImgs = imgs.filter((i) => i.includes('fixtures%2F') || i.includes('/fixtures/'));
    expect(cardImgs.length).toBeGreaterThanOrEqual(25);
    for (const i of cardImgs) {
      expect(i).toMatch(/ alt="[^"]+"/);
      expect(i).toMatch(/ width="\d+"/);
      expect(i).toMatch(/ height="\d+"/);
    }
    const off = await (await request.get(`${NEXT}/?vitrine=off`)).text();
    expect(off).not.toContain('<vitrine-shader');
  });

  test('home: 24 baked cards + live hero + baked editorial, 0 card canvases, 0 baker contexts, no console errors', async ({
    page,
  }, testInfo) => {
    const con = collect(page);
    await page.goto(`${NEXT}/`, { waitUntil: 'load' });
    await scrollThrough(page);
    await waitBaked(page, 25);
    await page.waitForTimeout(2200); // baker idle timeout (1500 ms) must pass before counting contexts
    const r = await page.evaluate(() => {
      const states: Record<string, number> = {};
      for (const el of document.querySelectorAll('vitrine-shader')) {
        const s = el.getAttribute('data-vitrine-state') ?? 'none';
        states[s] = (states[s] ?? 0) + 1;
      }
      const heroCanvas = document.querySelector('#hero canvas') as HTMLCanvasElement | null;
      return {
        elements: document.querySelectorAll('vitrine-shader').length,
        states,
        cardCanvases: document.querySelectorAll('.grid canvas').length,
        cardBakedImgs: document.querySelectorAll('.grid .vitrine-layer > img').length,
        bakerHosts: document.querySelectorAll('[data-vitrine-baker]').length,
        heroState: document.getElementById('hero')?.getAttribute('data-vitrine-state'),
        heroContextLost: heroCanvas ? heroCanvas.getContext('webgl2')?.isContextLost() : null,
        fallbacks: document.querySelectorAll('vitrine-shader[data-vitrine-state="fallback"]').length,
      };
    });
    mkdirSync(MEDIA, { recursive: true });
    writeFileSync(
      `${MEDIA}/p3-next-${testInfo.project.name}.json`,
      JSON.stringify({ ...r, errors: con.errors, console: con.all }, null, 2)
    );
    expect(r.elements).toBe(26);
    expect(r.states['baked']).toBe(25);
    expect(r.states['live']).toBe(1);
    expect(r.fallbacks).toBe(0);
    expect(r.cardCanvases).toBe(0);
    expect(r.cardBakedImgs).toBe(24);
    expect(r.bakerHosts).toBe(0);
    expect(r.heroState).toBe('live');
    expect(r.heroContextLost).toBe(false);
    // Hydration mismatches and React warnings land in console.error; GPU driver notes are warnings.
    expect(con.errors).toEqual([]);
  });

  test('keyboard: Tab onto a card reveals the photo, Tab away hides it', async ({ page }, testInfo) => {
    const tab = testInfo.project.name === 'webkit' ? 'Alt+Tab' : 'Tab';
    await page.goto(`${NEXT}/`, { waitUntil: 'load' });
    const first = page.locator('.card').first();
    const second = page.locator('.card').nth(1);
    await expect(first.locator('vitrine-shader')).toHaveAttribute('data-vitrine-state', 'baked', {
      timeout: 60_000,
    });
    await expect(second.locator('vitrine-shader')).toHaveAttribute('data-vitrine-state', 'baked', {
      timeout: 60_000,
    });
    await first.focus();
    await expect(first.locator('vitrine-shader')).toHaveAttribute('data-vitrine-revealed', '');
    await page.keyboard.press(tab);
    await expect(second).toBeFocused();
    await expect(first.locator('vitrine-shader')).not.toHaveAttribute('data-vitrine-revealed', '');
    await expect(second.locator('vitrine-shader')).toHaveAttribute('data-vitrine-revealed', '');
    const duration = await first
      .locator('.vitrine-layer')
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe('0.32s');
  });

  test('prefers-reduced-motion: hero is baked, reveal has no transition', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${NEXT}/`, { waitUntil: 'load' });
    await waitBaked(page, 5);
    await expect(page.locator('#hero')).toHaveAttribute('data-vitrine-state', 'baked');
    expect(await page.locator('#hero canvas').count()).toBe(0);
    const duration = await page
      .locator('.card .vitrine-layer')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe('0s');
  });

  test('product page: halftone media, hover reveals, no console errors, 404 for unknown handle', async ({
    page,
  }) => {
    const con = collect(page);
    await page.goto(`${NEXT}/products/el-funkador-tee`, { waitUntil: 'load' });
    await waitBaked(page, 1);
    const el = page.locator('.product__media vitrine-shader');
    await expect(el).toHaveAttribute('effect', 'halftone');
    await expect(el).toHaveAttribute('data-vitrine-state', 'baked');
    await el.hover();
    await expect(el).toHaveAttribute('data-vitrine-revealed', '');
    expect(con.errors).toEqual([]);
    const res = await page.goto(`${NEXT}/products/not-in-this-edition`);
    expect(res?.status()).toBe(404);
  });

  test('?vitrine=off: no element, no element chunk', async ({ page }) => {
    const js: string[] = [];
    page.on('response', async (r) => {
      if (r.url().includes('/_next/static/chunks/') && r.url().endsWith('.js')) {
        const b = await r.body().catch(() => Buffer.alloc(0));
        if (b.includes('ShaderMount')) js.push(r.url());
      }
    });
    await page.goto(`${NEXT}/?vitrine=off`, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    expect(await page.locator('vitrine-shader').count()).toBe(0);
    expect(await page.evaluate(() => Boolean(customElements.get('vitrine-shader')))).toBe(false);
    expect(js).toEqual([]);
  });

  test('screenshots 390 and 1440 (chromium)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'one browser is enough for the review screenshots');
    for (const [w, h] of [
      [390, 844],
      [1440, 900],
    ] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(`${NEXT}/`, { waitUntil: 'load' });
      await scrollThrough(page);
      await waitBaked(page, 25);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${MEDIA}/p3-next-${w}.png`, fullPage: true });
    }
    await page.goto(`${NEXT}/products/el-funkador-tee`, { waitUntil: 'load' });
    await waitBaked(page, 1);
    await page.screenshot({ path: `${MEDIA}/p3-next-product-1440.png`, fullPage: true });
  });
});
