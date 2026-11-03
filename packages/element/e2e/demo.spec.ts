import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { collectConsole, saveJson } from './shared';

/**
 * Q1 · G6/G7: the "Store" demo (examples/static). Every element ready, ≤ 1 live context after load (0 measured),
 * the catalogue is three columns of different heights, no horizontal overflow, axe clean at 390 and 1440.
 */
type Probe = { readyCount: number; elements: number; modes: Record<string, number>; fallbacks: unknown[] };

async function loadAll(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'load' });
  // Lazy images: scroll through so every element sets up, then back to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(
    () => {
      const v = (window as unknown as { __vitrine?: Probe }).__vitrine;
      return v && v.elements > 0 && v.readyCount >= v.elements;
    },
    null,
    { timeout: 60_000 }
  );
}

const contexts = (page: Page) =>
  page.evaluate(async () => {
    const { VitrineShader } = await import('/packages/element/dist/index.js' as string);
    const s = VitrineShader.stats() as Record<string, number>;
    return { ...s, canvases: document.querySelectorAll('canvas').length } as Record<string, number>;
  });

test.describe('Q1 · Store demo', () => {
  test('home: 18 elements ready (17 baked + 1 clear), 0 live contexts after load, no console errors', async ({
    page,
  }, testInfo) => {
    const con = collectConsole(page);
    await loadAll(page, '/examples/static/');
    await page.waitForTimeout(2200); // baker idle (1500 ms) before counting
    const v = await page.evaluate(() => (window as unknown as { __vitrine: Probe }).__vitrine);
    const c = await contexts(page);
    saveJson('demo-home', testInfo, { modes: v.modes, contexts: c }, 'q1');
    expect(v.elements).toBe(18);
    expect(v.modes).toEqual({ baked: 17, clear: 1 });
    expect(v.fallbacks).toEqual([]);
    expect(c).toMatchObject({ liveMounts: 0, bakerContexts: 0, interactionMounts: 0, canvases: 0 });
    expect(con.errors).toEqual([]);
  });

  for (const width of [390, 768, 1024, 1440]) {
    test(`catalogue at ${width} px: columns of different heights, no horizontal overflow`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/examples/static/');
      const g = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('.catalogue .card')].map((c) =>
          c.getBoundingClientRect()
        );
        const lefts = [...new Set(cards.map((r) => Math.round(r.left)))].sort((a, b) => a - b);
        const bottoms = lefts.map((l) =>
          Math.max(...cards.filter((r) => Math.round(r.left) === l).map((r) => r.bottom))
        );
        const tops = lefts.map((l) =>
          Math.min(...cards.filter((r) => Math.round(r.left) === l).map((r) => r.top))
        );
        return {
          cards: cards.length,
          columns: lefts.length,
          tops: tops.map(Math.round),
          bottoms: bottoms.map(Math.round),
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      });
      saveJson(`demo-grid-${width}`, testInfo, g, 'q1');
      expect(g.cards).toBe(12);
      expect(g.columns).toBe(width > 900 ? 3 : 2);
      expect(new Set(g.bottoms).size).toBe(g.columns); // different heights
      if (width > 900) expect(new Set(g.tops).size).toBe(3); // the middle and right columns start lower
      expect(g.scrollWidth).toBe(g.clientWidth);
    });
  }

  test('hero: the doors peek on hover on one context and open on focus; product page: the loupe, no context at rest', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loadAll(page, '/examples/static/');
    await page.waitForTimeout(1800);
    // Hero doors: the mouse peeks (the panes part at the cursor on one context), keyboard focus opens fully.
    const hero = page.locator('.hero__photo vitrine-shader');
    await hero.hover();
    await expect.poll(async () => (await contexts(page)).interactionMounts).toBe(1);
    await expect
      .poll(() => hero.locator('.vitrine-baked').evaluate((e) => (e as HTMLElement).style.visibility))
      .toBe('hidden');
    await page.mouse.move(2, 2);
    await page.locator('.hero__photo').focus();
    await expect.poll(() => hero.evaluate((e) => e.hasAttribute('data-vitrine-open'))).toBe(true);
    await page.goto('/examples/static/products/satchel.html');
    await page.waitForFunction(
      () => document.querySelector('vitrine-shader')?.getAttribute('data-vitrine-state') === 'interactive'
    );
    expect((await contexts(page)).canvases).toBe(0);
    const b = (await page.locator('vitrine-shader').boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 3 });
    await expect.poll(async () => (await contexts(page)).interactionMounts).toBe(1);
    await expect(page.locator('.vitrine-loupe')).toBeVisible();
  });

  for (const [name, path] of [
    ['home', '/examples/static/'],
    ['product', '/examples/static/products/court-sneaker.html'],
  ] as const) {
    for (const width of [390, 1440]) {
      test(`axe: ${name} at ${width} px has no WCAG 2.2 A/AA violations`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await loadAll(page, path);
        const res = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        const violations = res.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => n.target.join(' ')),
        }));
        saveJson(`axe-${name}-${width}`, testInfo, { passes: res.passes.length, violations }, 'q1');
        expect(violations).toEqual([]);
      });
    }
  }
});
