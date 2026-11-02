import { expect, test, type Page } from '@playwright/test';
import { collectConsole } from './shared';

/**
 * Q1 · G7 (ADR-0003): the glass opens on hover, tap and keyboard on ONE short-lived context; 10 fast hovers never
 * hold more than one; reduced motion and no WebGL2 show the photo; the loupe follows the pointer; the pre-order
 * frost follows the date.
 */
const PAGE = '/packages/element/e2e/pages/q1.html';

type Probe = { maxInteraction: number; maxCanvases: number; canvases: number };

async function ready(page: Page, url = PAGE) {
  await page.goto(url);
  await page.waitForFunction(
    () => {
      const els = [...document.querySelectorAll('vitrine-shader')];
      return (
        els.length > 0 &&
        els.every((e) =>
          ['baked', 'clear', 'interactive', 'fallback'].includes(e.getAttribute('data-vitrine-state') ?? '')
        )
      );
    },
    null,
    { timeout: 60_000 }
  );
  // Baker contexts close after 1.5 s idle: start every test from 0 live contexts.
  await page.waitForTimeout(1800);
  await resetProbe(page);
}

async function resetProbe(page: Page) {
  await page.evaluate(() => {
    const r = (window as unknown as { __spike: Probe }).__spike;
    r.maxInteraction = 0;
    r.maxCanvases = 0;
  });
}

const probe = (page: Page) => page.evaluate(() => (window as unknown as { __spike: Probe }).__spike);
const stats = (page: Page) =>
  page.evaluate(async () => {
    const { VitrineShader } = await import('/packages/element/dist/index.js' as string);
    return VitrineShader.stats() as { interactionMounts: number; bakerContexts: number; liveMounts: number };
  });
const isOpen = (page: Page, sel: string) =>
  page.locator(sel).evaluate((el) => el.hasAttribute('data-vitrine-open'));

test.describe('Q1 · glass card', () => {
  test('hover opens the glass on one context, leaving closes it, 0 contexts 2 s later', async ({ page }) => {
    const con = collectConsole(page);
    await ready(page);
    expect(await stats(page)).toMatchObject({ interactionMounts: 0, bakerContexts: 0, liveMounts: 0 });
    const card = page.locator('#cards vitrine-shader').first();
    await card.hover();
    await expect.poll(() => isOpen(page, '#cards vitrine-shader >> nth=0')).toBe(true);
    await page.mouse.move(5, 5);
    await expect.poll(() => isOpen(page, '#cards vitrine-shader >> nth=0')).toBe(false);
    await page.waitForTimeout(2000);
    const p = await probe(page);
    expect(p.maxInteraction).toBe(1);
    expect(p.maxCanvases).toBe(1);
    expect(p.canvases).toBe(0);
    expect(await stats(page)).toMatchObject({ interactionMounts: 0, bakerContexts: 0 });
    expect(con.errors).toEqual([]);
  });

  test('10 fast hovers across the cards: at most 1 live context, 0 after 2 s', async ({ page }) => {
    await ready(page, `${PAGE}?n=8`);
    const cards = page.locator('#cards vitrine-shader');
    for (let i = 0; i < 10; i++) {
      const box = (await cards.nth(i % 8).boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 2 });
      await page.waitForTimeout(60);
    }
    await page.mouse.move(5, 5);
    const during = await probe(page);
    await page.waitForTimeout(2000);
    const after = await probe(page);
    expect(during.maxInteraction).toBe(1);
    expect(during.maxCanvases).toBeLessThanOrEqual(1);
    expect(after.canvases).toBe(0);
    expect((await stats(page)).interactionMounts).toBe(0);
  });

  test('keyboard: Tab onto the card link opens, Tab away closes; Enter/Space toggle a focusable non-link card', async ({
    page,
    browserName,
  }) => {
    await ready(page);
    // WebKit only tabs to links with Option+Tab (system setting): focus the link programmatically there.
    const link = page.locator('#cards a').first();
    if (browserName === 'webkit') await link.focus();
    else {
      await page.locator('body').click({ position: { x: 2, y: 2 } });
      await page.keyboard.press('Tab');
    }
    await expect(link).toBeFocused();
    await expect.poll(() => isOpen(page, '#cards vitrine-shader >> nth=0')).toBe(true);
    await page.locator('#cards a').nth(1).focus();
    await expect.poll(() => isOpen(page, '#cards vitrine-shader >> nth=0')).toBe(false);

    const btn = page.locator('#button-card');
    await btn.focus();
    expect(await isOpen(page, '#button-card vitrine-shader')).toBe(false); // reveal="tap": focus alone does nothing
    await page.keyboard.press('Enter');
    await expect.poll(() => isOpen(page, '#button-card vitrine-shader')).toBe(true);
    await page.keyboard.press(' ');
    await expect.poll(() => isOpen(page, '#button-card vitrine-shader')).toBe(false);
  });

  test('prefers-reduced-motion: open and close without animation and without a context', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page);
    await page.locator('#cards vitrine-shader').first().hover();
    await expect.poll(() => isOpen(page, '#cards vitrine-shader >> nth=0')).toBe(true);
    await page.mouse.move(5, 5);
    await expect.poll(() => isOpen(page, '#cards vitrine-shader >> nth=0')).toBe(false);
    const p = await probe(page);
    expect(p.maxInteraction).toBe(0);
    expect(p.maxCanvases).toBe(0);
  });
});

test.describe('Q1 · hero doors', () => {
  test('hover peeks (panes part at the pointer, 1 context, not open), focus opens fully, 0 contexts after', async ({
    page,
  }) => {
    await ready(page);
    const doors = page.locator('#doors');
    await doors.scrollIntoViewIfNeeded();
    const b = (await doors.boundingBox())!;
    await page.mouse.move(b.x + b.width * 0.3, b.y + b.height / 2, { steps: 3 });
    await expect.poll(async () => (await stats(page)).interactionMounts).toBe(1);
    await page.waitForTimeout(800);
    expect(await isOpen(page, '#doors')).toBe(false); // a peek, not a full opening
    expect(await doors.locator('.vitrine-baked').evaluate((e) => (e as HTMLElement).style.visibility)).toBe(
      'hidden'
    );
    await page.mouse.move(b.x + b.width * 0.7, b.y + b.height / 2, { steps: 4 }); // follows the cursor
    await page.waitForTimeout(300);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(2000);
    expect((await stats(page)).interactionMounts).toBe(0);
    expect(await doors.locator('canvas').count()).toBe(0);
    const link = page.locator('#doors-link');
    await link.focus();
    await expect.poll(() => isOpen(page, '#doors')).toBe(true);
    expect((await probe(page)).maxInteraction).toBe(1);
  });
});

test.describe('Q1 · touch', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  test('tap opens the glass and does not navigate; the second tap follows the link', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'firefox', 'Playwright Firefox has no isMobile/hasTouch emulation');
    await ready(page);
    const card = page.locator('#cards vitrine-shader').first();
    await card.scrollIntoViewIfNeeded();
    await card.tap();
    await expect.poll(() => isOpen(page, '#cards vitrine-shader >> nth=0')).toBe(true);
    expect(new URL(page.url()).hash).toBe('');
    await card.tap();
    await expect.poll(() => new URL(page.url()).hash).toBe('#product-0');
    expect((await probe(page)).maxInteraction).toBe(1);
  });
});

test.describe('Q1 · fallbacks', () => {
  test('no WebGL2: every element falls back to the photo, nothing is covered', async ({ page }) => {
    await page.addInitScript(() => {
      const proto = HTMLCanvasElement.prototype as unknown as { getContext: (...a: unknown[]) => unknown };
      const orig = proto.getContext;
      proto.getContext = function (this: HTMLCanvasElement, type: unknown, ...rest: unknown[]) {
        if (type === 'webgl2') return null;
        return orig.call(this, type, ...rest);
      };
    });
    await ready(page);
    const r = await page.evaluate(() =>
      [...document.querySelectorAll('vitrine-shader')].map((el) => {
        const img = el.querySelector(':scope > img') as HTMLImageElement;
        const layer = el.querySelector(':scope > .vitrine-layer') as HTMLElement | null;
        return {
          state: el.getAttribute('data-vitrine-state'),
          photo: img.complete && img.naturalWidth > 0 && getComputedStyle(img).visibility === 'visible',
          covered: layer ? getComputedStyle(layer).display !== 'none' && layer.childElementCount > 0 : false,
        };
      })
    );
    expect(r.length).toBeGreaterThan(5);
    for (const x of r) expect(x).toEqual({ state: 'fallback', photo: true, covered: false });
  });
});

test.describe('Q1 · loupe', () => {
  test('the loupe appears under the pointer, follows it, and leaves 0 contexts', async ({ page }) => {
    await ready(page);
    const lens = page.locator('#lens');
    await lens.scrollIntoViewIfNeeded();
    expect(await lens.locator('canvas').count()).toBe(0); // no pointer: plain photo, no context
    const box = (await lens.boundingBox())!;
    const centre = async () =>
      lens.locator('.vitrine-loupe').evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, o: getComputedStyle(el).opacity };
      });
    for (const [fx, fy] of [
      [0.3, 0.4],
      [0.7, 0.6],
    ] as const) {
      const x = box.x + box.width * fx;
      const y = box.y + box.height * fy;
      await page.mouse.move(x, y, { steps: 4 });
      await page.waitForTimeout(450);
      const c = await centre();
      expect(c.o).toBe('1');
      expect(Math.abs(c.x - x)).toBeLessThan(2);
      expect(Math.abs(c.y - y)).toBeLessThan(2);
    }
    // the img keeps its alt and is not covered for assistive tech
    expect(await lens.locator(':scope > img').getAttribute('alt')).toBe('Leather satchel');
    expect(await lens.locator('.vitrine-layer').getAttribute('aria-hidden')).toBe('true');
    expect(await lens.locator('[tabindex], button, a').count()).toBe(0);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(2000);
    expect(await lens.locator('canvas').count()).toBe(0);
    expect((await probe(page)).maxInteraction).toBe(1);
  });
});

test.describe('Q1 · pre-order', () => {
  test('frost by days left: 30 > 7 > 1 day, clear on and after the release', async ({ page }) => {
    await ready(page);
    const r = await page.evaluate(() =>
      [...document.querySelectorAll('#pre vitrine-shader')].map((el) => ({
        days: Number(el.getAttribute('data-days')),
        state: el.getAttribute('data-vitrine-state'),
      }))
    );
    expect(r).toEqual([
      { days: 30, state: 'baked' },
      { days: 7, state: 'baked' },
      { days: 1, state: 'baked' },
      { days: -1, state: 'clear' },
    ]);
    // Sharper as the date nears: mean absolute VERTICAL gradient of the baked frames grows 30 → 7 → 1 (the reeds are
    // vertical, so their edges never count; what changes is the blur over the shoe).
    const sharp = await page.evaluate(async () => {
      const out: number[] = [];
      for (const el of document.querySelectorAll('#pre vitrine-shader')) {
        const img = el.querySelector('.vitrine-baked') as HTMLImageElement | null;
        if (!img) continue;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = 200;
        c.height = 250;
        const g = c.getContext('2d')!;
        g.drawImage(img, 0, 0, 200, 250);
        const d = g.getImageData(0, 0, 200, 250).data;
        let sum = 0;
        for (let y = 1; y < 250; y++)
          for (let x = 0; x < 200; x++) {
            const i = (y * 200 + x) * 4;
            const j = i - 200 * 4;
            sum += Math.abs(d[i]! - d[j]!) + Math.abs(d[i + 1]! - d[j + 1]!);
          }
        out.push(sum / (249 * 200));
      }
      return out;
    });
    expect(sharp).toHaveLength(3);
    expect(sharp[1]!).toBeGreaterThan(sharp[0]!);
    expect(sharp[2]!).toBeGreaterThan(sharp[1]!);
  });
});
