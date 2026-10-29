import { expect, test } from '@playwright/test';
import { collectErrors, MEDIA, saveEvidence, savePngFromDataUrl, waitForSpike } from './spike-shared';

test.describe('Spike A · bake', () => {
  test('baked image is non-empty, matches the live render (<= 1% pixels) and releases its WebGL context', async ({
    page,
  }, testInfo) => {
    const errors = collectErrors(page);
    const probeDelay = process.env.VITRINE_PROBE_DELAY ?? '200';
    await page.goto(`/examples/spikes/bake.html?probeDelay=${probeDelay}`);
    const r = await waitForSpike(page);
    const browser = testInfo.project.name;
    saveEvidence('bake', testInfo, { ...r, consoleErrors: errors });
    await page.screenshot({ path: `${MEDIA}/p0-bake-${browser}.png`, fullPage: true });
    const diffUrl = await page.evaluate(() =>
      (document.getElementById('diff') as HTMLCanvasElement).toDataURL('image/png')
    );
    savePngFromDataUrl(`${MEDIA}/p0-bake-diff-${browser}.png`, diffUrl);

    expect(r.error, 'spike page threw').toBeUndefined();
    // Non-empty: luminance spread and fully opaque output.
    expect(r.bake.stats.maxLuma - r.bake.stats.minLuma).toBeGreaterThan(50);
    expect(r.bake.stats.opaquePct).toBeGreaterThan(99);
    // Same size and <= 1% differing pixels vs the live render.
    expect(r.bake.canvas).toBe(r.live.canvas);
    expect(r.diff.pct).toBeLessThanOrEqual(1);
    // Context really released: reported lost after dispose, canvas gone, and 16 fresh contexts evict nothing.
    expect(r.bake.contextLostAfterDispose).toBe(true);
    expect(r.bake.canvasRemovedFromDom).toBe(true);
    expect(r.probe.nullContexts).toBe(0);
    expect(r.probe.lostEventsDuringProbe).toBe(0);
    if (testInfo.project.name === 'webkit') {
      // Finding (P0): WebKit keeps a lost context in its 16-context budget until GC and evicts the OLDEST live
      // context when a new one is requested. The live reference here is the oldest, so it gets evicted.
      // Recorded, not asserted: see ADR-0001 "Co pokazały spiki" and the bake-shared test in contexts.spec.ts.
      testInfo.annotations.push({
        type: 'finding',
        description: `webkit liveStillAliveAfterProbe=${r.liveStillAliveAfterProbe}`,
      });
    } else {
      expect(r.liveStillAliveAfterProbe).toBe(true);
    }
  });
});
