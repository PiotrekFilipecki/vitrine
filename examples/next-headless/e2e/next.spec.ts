import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

/**
 * Headless Next.js example on the production build (next start on :4175, see playwright.config.ts). Since Q1 it is
 * the "Store" demo: glass cards, the pre-order card, the loupe on the product page (ADR-0003). Server HTML is a plain
 * image inside the element; after hydration: every element ready, 0 live contexts at rest, no hydration errors.
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

test.describe('Q1 · next-headless Store (production build)', () => {
  test('server HTML: plain images inside glass / pre-order / loupe elements, nothing without alt, width, height', async ({
    request,
  }) => {
    const html = await (await request.get(`${NEXT}/`)).text();
    expect(html.match(/<vitrine-shader effect="glass" reveal="hover" preset="window"/g)).toHaveLength(12);
    expect(html.match(/<vitrine-shader effect="glass" bind="[^"]*date[^"]*" preset="window"/g)).toHaveLength(
      6
    );
    const imgs = html.match(/<img[^>]*>/g) ?? [];
    const photos = imgs.filter((i) => i.includes('fixtures%2Fproducts') || i.includes('/fixtures/products/'));
    expect(photos.length).toBe(18);
    for (const i of photos) {
      expect(i).toMatch(/ alt="[^"]*"/);
      expect(i).toMatch(/ width="\d+"/);
      expect(i).toMatch(/ height="\d+"/);
    }
    const pdp = await (await request.get(`${NEXT}/products/satchel`)).text();
    expect(pdp).toContain('<vitrine-shader effect="lens" bind="pointer" preset="loupe"');
    const off = await (await request.get(`${NEXT}/?vitrine=off`)).text();
    expect(off).not.toContain('<vitrine-shader');
  });

  test('home: 17 baked + 1 clear, 0 live contexts at rest, no console errors (hydration included)', async ({
    page,
  }, testInfo) => {
    const con = collect(page);
    await page.goto(`${NEXT}/`, { waitUntil: 'load' });
    await scrollThrough(page);
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll('vitrine-shader')].every((e) =>
          ['baked', 'clear'].includes(e.getAttribute('data-vitrine-state') ?? '')
        ),
      null,
      { timeout: 60_000 }
    );
    await page.waitForTimeout(2200); // baker idle timeout (1500 ms) must pass before counting contexts
    const r = await page.evaluate(() => {
      const states: Record<string, number> = {};
      for (const el of document.querySelectorAll('vitrine-shader')) {
        const s = el.getAttribute('data-vitrine-state') ?? 'none';
        states[s] = (states[s] ?? 0) + 1;
      }
      return {
        elements: document.querySelectorAll('vitrine-shader').length,
        states,
        canvases: document.querySelectorAll('canvas').length,
        bakerHosts: document.querySelectorAll('[data-vitrine-baker]').length,
      };
    });
    mkdirSync(MEDIA, { recursive: true });
    writeFileSync(
      `${MEDIA}/q1-next-${testInfo.project.name}.json`,
      JSON.stringify({ ...r, errors: con.errors, console: con.all }, null, 2)
    );
    expect(r).toEqual({ elements: 18, states: { baked: 17, clear: 1 }, canvases: 0, bakerHosts: 0 });
    // Hydration mismatches and React warnings land in console.error; GPU driver notes are warnings.
    expect(con.errors).toEqual([]);
  });

  test('keyboard: Tab onto a card opens its glass, Tab away closes it', async ({ page }, testInfo) => {
    const tab = testInfo.project.name === 'webkit' ? 'Alt+Tab' : 'Tab';
    await page.goto(`${NEXT}/`, { waitUntil: 'load' });
    const first = page.locator('.catalogue .card__link').first();
    const second = page.locator('.catalogue .card__link').nth(1);
    await expect(first.locator('vitrine-shader')).toHaveAttribute('data-vitrine-state', 'baked', {
      timeout: 60_000,
    });
    await first.focus();
    await expect(first.locator('vitrine-shader')).toHaveAttribute('data-vitrine-open', '');
    await page.keyboard.press(tab);
    await expect(second).toBeFocused();
    await expect(first.locator('vitrine-shader')).not.toHaveAttribute('data-vitrine-open', '');
  });

  test('product page: the loupe under the pointer, no context at rest, 404 for an unknown handle', async ({
    page,
  }) => {
    const con = collect(page);
    await page.goto(`${NEXT}/products/satchel`, { waitUntil: 'load' });
    const el = page.locator('.pdp__media vitrine-shader');
    await expect(el).toHaveAttribute('data-vitrine-state', 'interactive', { timeout: 60_000 });
    expect(await page.locator('canvas').count()).toBe(0);
    const b = (await el.boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 3 });
    await expect(page.locator('.vitrine-loupe')).toBeVisible();
    expect(con.errors).toEqual([]);
    const res = await page.goto(`${NEXT}/products/not-in-this-store`);
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
});
