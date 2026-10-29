import { expect, test } from '@playwright/test';
import { collectConsole, MEDIA, saveJson, waitForDone } from './shared';

async function readyCount(page: import('@playwright/test').Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { __spike: { ready: unknown[] } }).__spike.ready.length);
}

test.describe('P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion)', () => {
  test('24 baked cards + 1 live hero: 0 webglcontextlost, 0 live contexts after bake, hero survives', async ({
    page,
  }, testInfo) => {
    const con = collectConsole(page);
    const fixtureRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/fixtures/')) fixtureRequests.push(req.url());
    });
    await page.goto('/packages/element/e2e/pages/grid.html?n=24');
    await waitForDone(page);
    await page.waitForFunction(
      () => (window as unknown as { __spike: { ready: unknown[] } }).__spike.ready.length >= 25,
      null,
      {
        timeout: 60_000,
      }
    );
    // Baker idle timeout (default 1500 ms) must have passed before we count contexts.
    await page.waitForTimeout(2200);
    const r = await waitForDone(page);
    const after = await page.evaluate(async () => {
      const w = window as unknown as {
        VitrineShader: { stats(): Record<string, number> };
        __probe: () => Promise<Record<string, number>>;
      };
      const hero = document.getElementById('hero')!;
      const heroCanvas = hero.querySelector('canvas');
      const heroGl = heroCanvas?.getContext('webgl2');
      return {
        stats: w.VitrineShader.stats(),
        cardCanvases: document.querySelectorAll('.grid canvas').length,
        cardBakedImgs: document.querySelectorAll('.grid .vitrine-layer > img').length,
        bakerHosts: document.querySelectorAll('[data-vitrine-baker]').length,
        heroState: hero.getAttribute('data-vitrine-state'),
        heroHasCanvas: Boolean(heroCanvas),
        heroContextLost: heroGl ? heroGl.isContextLost() : null,
        probe: await w.__probe(),
      };
    });
    const uniqueFixtures = new Set(fixtureRequests.map((u) => u.split('/').pop())).size;
    saveJson('grid', testInfo, {
      ...r,
      after,
      fixtureRequests: fixtureRequests.length,
      uniqueFixtures,
      console: con.all,
    });
    await page.screenshot({ path: `${MEDIA}/p1-grid-${testInfo.project.name}.png`, fullPage: true });

    expect(r.fallbacks).toEqual([]);
    expect(r.ready.filter((x: { id: string }) => x.id !== 'hero')).toHaveLength(24);
    expect(
      r.ready
        .filter((x: { id: string; mode: string }) => x.id !== 'hero')
        .every((x: { mode: string }) => x.mode === 'baked')
    ).toBe(true);
    expect(r.lostEvents).toBe(0);
    expect(after.cardCanvases).toBe(0);
    expect(after.cardBakedImgs).toBe(24);
    expect(after.stats.bakerContexts).toBe(0);
    expect(after.bakerHosts).toBe(0);
    expect(after.stats.liveMounts).toBe(1);
    expect(after.heroState).toBe('live');
    expect(after.heroContextLost).toBe(false);
    // Slots really free: 14 fresh contexts (+ hero = 15 < 16) evict nothing.
    expect(after.probe.nullContexts).toBe(0);
    expect(after.probe.lostEventsDuringProbe).toBe(0);
    expect(con.errors).toEqual([]);
  });

  test('keyboard: Tab onto a card reveals the photo, Tab away hides it again', async ({ page }, testInfo) => {
    // Safari moves focus between links only with Option+Tab (its default "Press Tab to highlight" is off).
    const tab = testInfo.project.name === 'webkit' ? 'Alt+Tab' : 'Tab';
    await page.goto('/packages/element/e2e/pages/grid.html?n=8&hero=off');
    await page.waitForFunction(
      () => (window as unknown as { __spike: { ready: unknown[] } }).__spike.ready.length >= 8,
      null,
      {
        timeout: 60_000,
      }
    );
    const first = page.locator('.card').first();
    const second = page.locator('.card').nth(1);
    await expect(first.locator('vitrine-shader')).toHaveAttribute('data-vitrine-state', 'baked', {
      timeout: 60_000,
    });
    await expect(second.locator('vitrine-shader')).toHaveAttribute('data-vitrine-state', 'baked', {
      timeout: 60_000,
    });
    await first.focus();
    await expect(first.locator('vitrine-shader')).toHaveAttribute('data-vitrine-revealed');
    await expect
      .poll(() => first.locator('.vitrine-layer').evaluate((el) => getComputedStyle(el).opacity), {
        timeout: 2000,
      })
      .toBe('0');
    await page.keyboard.press(tab);
    await expect(second).toBeFocused();
    await expect(first.locator('vitrine-shader')).not.toHaveAttribute('data-vitrine-revealed');
    await expect(second.locator('vitrine-shader')).toHaveAttribute('data-vitrine-revealed');
    const duration = await first
      .locator('.vitrine-layer')
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe('0.32s');
  });

  test('hover reveals on the nearest link and the baked layer stays aria-hidden', async ({ page }) => {
    await page.goto('/packages/element/e2e/pages/grid.html?n=4&hero=off');
    await page.waitForFunction(
      () => (window as unknown as { __spike: { ready: unknown[] } }).__spike.ready.length >= 4,
      null,
      {
        timeout: 60_000,
      }
    );
    const card = page.locator('.card').nth(2);
    await card.hover();
    await expect(card.locator('vitrine-shader')).toHaveAttribute('data-vitrine-revealed');
    await page.mouse.move(0, 0);
    await expect(card.locator('vitrine-shader')).not.toHaveAttribute('data-vitrine-revealed');
    await expect(card.locator('.vitrine-layer')).toHaveAttribute('aria-hidden', 'true');
    await expect(card.locator('.vitrine-layer > img')).toHaveAttribute('alt', '');
  });

  test('prefers-reduced-motion: hero is baked (no canvas), reveal has no transition', async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/packages/element/e2e/pages/grid.html?n=4');
    await page.waitForFunction(
      () => (window as unknown as { __spike: { ready: unknown[] } }).__spike.ready.length >= 5,
      null,
      {
        timeout: 60_000,
      }
    );
    const r = await waitForDone(page);
    const hero = r.ready.find((x: { id: string }) => x.id === 'hero');
    saveJson('reduced-motion', testInfo, r);
    expect(hero.mode).toBe('baked');
    expect(await page.locator('#hero canvas').count()).toBe(0);
    expect(await page.locator('#hero .vitrine-layer > img').count()).toBe(1);
    const duration = await page
      .locator('.card .vitrine-layer')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe('0s');
    expect(await readyCount(page)).toBeGreaterThanOrEqual(5);
  });
});
