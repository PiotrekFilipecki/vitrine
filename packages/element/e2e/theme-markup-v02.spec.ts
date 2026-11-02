import { expect, test } from '@playwright/test';
import { collectConsole } from './shared';

/**
 * Q1 · the v0.2 snippets' markup on the single-file theme asset (shopify-theme/assets/vitrine.js: no chunks, the
 * interaction code is inlined): one request for the asset, 7 glass cards baked, pre-order baked, loupe interactive,
 * hover opens a card on one context, the loupe appears, 0 contexts afterwards.
 */
const URL_ = '/packages/element/e2e/pages/theme-markup-v02.html';

test('v0.2 theme markup: one asset request, glass + pre-order + loupe work from the single-file build', async ({
  page,
}) => {
  const con = collectConsole(page);
  const assetRequests: string[] = [];
  page.on(
    'request',
    (r) => r.url().includes('shopify-theme/assets/vitrine.js') && assetRequests.push(r.url())
  );
  await page.goto(URL_, { waitUntil: 'load' });
  await page.waitForFunction(
    () => {
      const els = [...document.querySelectorAll('vitrine-shader')];
      return (
        els.length === 9 &&
        els.every((e) => ['baked', 'interactive'].includes(e.getAttribute('data-vitrine-state') ?? ''))
      );
    },
    null,
    { timeout: 60_000 }
  );
  expect(assetRequests).toHaveLength(1);
  const states = await page.evaluate(() =>
    [...document.querySelectorAll('vitrine-shader')].map(
      (e) => `${e.className}:${e.getAttribute('data-vitrine-state')}`
    )
  );
  expect(states.filter((s) => s === 'vitrine-glass-card:baked')).toHaveLength(7);
  expect(states).toContain('vitrine-preorder-card:baked');
  expect(states).toContain('vitrine-loupe-media:interactive');

  await page.waitForTimeout(1800); // baker idle
  const card = page.locator('.vitrine-glass-card').first();
  await card.hover();
  await expect(card).toHaveAttribute('data-vitrine-open', '', { timeout: 10_000 });
  await page.mouse.move(2, 2);
  await expect(card).not.toHaveAttribute('data-vitrine-open', '');

  const lens = page.locator('.vitrine-loupe-media');
  await lens.scrollIntoViewIfNeeded();
  const b = (await lens.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 3 });
  await expect(page.locator('.vitrine-loupe')).toBeVisible();
  await page.mouse.move(2, 2);
  await page.waitForTimeout(2000);
  expect(await page.locator('canvas').count()).toBe(0);
  expect(con.errors).toEqual([]);
});
