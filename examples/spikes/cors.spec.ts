import { expect, test } from '@playwright/test';
import { collectErrors, MEDIA, saveEvidence, waitForSpike } from './spike-shared';

/**
 * Images come from hardware.shopify.com, a store owned by Shopify itself (never a client store).
 * Override with VITRINE_CORS_IMAGE_URL / VITRINE_CORS_STORE_IMAGE_URL to test another CDN file.
 */
const CDN_URL =
  process.env.VITRINE_CORS_IMAGE_URL ??
  'https://cdn.shopify.com/s/files/1/0842/3905/6918/files/B1_Pro-Space_Gray-01_c166d8d3-f30b-48c9-909d-5f63f040ebc9.png?v=1777905665&width=800';
const STORE_URL =
  process.env.VITRINE_CORS_STORE_IMAGE_URL ??
  'https://hardware.shopify.com/cdn/shop/files/B1_Pro-Space_Gray-01_c166d8d3-f30b-48c9-909d-5f63f040ebc9.png?v=1777905665&width=800';

const pageFor = (src: string) => `/examples/spikes/cors.html?src=${encodeURIComponent(src)}`;

test.describe('Spike C · CORS', () => {
  test('cdn.shopify.com image loads with crossorigin=anonymous and works as a WebGL texture', async ({
    page,
  }, testInfo) => {
    const errors = collectErrors(page);
    await page.goto(pageFor(CDN_URL));
    const r = await waitForSpike(page);
    saveEvidence('cors-cdn', testInfo, { ...r, consoleErrors: errors });
    await page.screenshot({ path: `${MEDIA}/p0-cors-cdn-${testInfo.project.name}.png`, fullPage: true });
    expect(r.plainImg.loaded).toBe(true);
    expect(r.corsImg.loaded).toBe(true);
    expect(r.shader.mounted).toBe(true);
    expect(r.shader.glError).toBe(0);
    expect(r.shader.stats.maxLuma - r.shader.stats.minLuma).toBeGreaterThan(50);
  });

  test('<store domain>/cdn/shop/files variant behaves the same', async ({ page }, testInfo) => {
    const errors = collectErrors(page);
    await page.goto(pageFor(STORE_URL));
    const r = await waitForSpike(page);
    saveEvidence('cors-store', testInfo, { ...r, consoleErrors: errors });
    expect(r.plainImg.loaded).toBe(true);
    expect(r.corsImg.loaded).toBe(true);
    expect(r.shader.mounted).toBe(true);
    expect(r.shader.glError).toBe(0);
  });

  test('without Access-Control-Allow-Origin the texture is refused but the plain <img> still shows (fallback path)', async ({
    page,
  }, testInfo) => {
    // Playwright's route.fulfill() re-adds CORS headers in Chromium, so the no-CORS origin is a second local
    // instance of scripts/serve.mjs on :4174 (different port = different origin, no ACAO header at all).
    const errors = collectErrors(page);
    await page.goto(pageFor('http://localhost:4174/examples/spikes/fixtures/01-tee-el-funkador.webp'));
    const r = await waitForSpike(page);
    saveEvidence('cors-blocked', testInfo, { ...r, consoleErrors: errors });
    expect(r.plainImg.loaded).toBe(true);
    expect(r.plainImg.canvasTainted).toBe(true);
    expect(r.corsImg.loaded).toBe(false);
    expect(r.shader.mounted).toBe(false);
  });
});
