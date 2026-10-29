import { expect, test } from '@playwright/test';
import { collectConsole, saveJson, waitForDone } from './shared';

test.describe('P1 · fallbacks (E6)', () => {
  test('image without CORS headers → vitrine:fallback(cors), <img> stays, no console error', async ({
    page,
  }, testInfo) => {
    const con = collectConsole(page);
    await page.goto('/packages/element/e2e/pages/fallback.html');
    await waitForDone(page);
    await page.waitForFunction(
      () => (window as unknown as { __spike: { events: unknown[] } }).__spike.events.length >= 2,
      null,
      {
        timeout: 30_000,
      }
    );
    const r = await waitForDone(page);
    const cors = r.events.find((e: { id: string }) => e.id === 'cors');
    const bad = r.events.find((e: { id: string }) => e.id === 'bad-effect');
    const noImg = r.events.find((e: { id: string }) => e.id === 'no-img');
    const img = await page.locator('#cors-img').evaluate((el: HTMLImageElement) => ({
      naturalWidth: el.naturalWidth,
      visible: el.getClientRects().length > 0,
    }));
    const states = await page.evaluate(() => ({
      cors: document.getElementById('cors')!.getAttribute('data-vitrine-state'),
      corsLayerChildren: document.querySelector('#cors .vitrine-layer')?.children.length ?? 0,
      corsCanvases: document.querySelectorAll('#cors canvas').length,
    }));
    saveJson('fallback', testInfo, { ...r, img, states, console: con.all });

    expect(cors.reason).toBe('cors');
    expect(img.naturalWidth).toBeGreaterThan(0);
    expect(img.visible).toBe(true);
    expect(states.cors).toBe('fallback');
    expect(states.corsCanvases).toBe(0);
    expect(bad.reason).toBe('error');
    expect(noImg).toBeUndefined(); // waits for an <img>, neither ready nor fallback
    // Only the `debug` element warns; the CORS one is silent (PLAN D5).
    expect(con.warnings.filter((w) => w.includes('[vitrine-shader]'))).toHaveLength(1);
    // The browser itself logs the blocked request (unavoidable); the element adds nothing.
    expect(
      con.errors.filter((e) => !/Access-Control-Allow-Origin|CORS|ERR_FAILED|access control checks/i.test(e))
    ).toEqual([]);
  });
});
