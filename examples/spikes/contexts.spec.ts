import { expect, test } from '@playwright/test';
import { collectErrors, MEDIA, saveEvidence, waitForSpike } from './spike-shared';

test.describe('Spike B · contexts', () => {
  test('live: 24 simultaneous ShaderMounts — count evictions (measurement only)', async ({
    page,
  }, testInfo) => {
    const errors = collectErrors(page);
    await page.goto('/examples/spikes/contexts.html?mode=live&n=24');
    const r = await waitForSpike(page);
    saveEvidence('contexts-live', testInfo, { ...r, consoleErrors: errors });
    await page.screenshot({ path: `${MEDIA}/p0-contexts-live-${testInfo.project.name}.png`, fullPage: true });
    expect(r.error).toBeUndefined();
    expect(r.live.mounts).toBe(24);
    // No assertion on evictions: the number is the finding. It goes to the devlog table.
  });

  test('bake: 24 baked cards leave 0 live contexts and free all slots', async ({ page }, testInfo) => {
    const errors = collectErrors(page);
    await page.goto('/examples/spikes/contexts.html?mode=bake&n=24');
    const r = await waitForSpike(page);
    saveEvidence('contexts-bake', testInfo, { ...r, consoleErrors: errors });
    await page.screenshot({ path: `${MEDIA}/p0-contexts-bake-${testInfo.project.name}.png`, fullPage: true });
    expect(r.error).toBeUndefined();
    expect(r.bake.imagesInDom).toBe(24);
    expect(r.bake.canvasesInDom).toBe(0);
    expect(r.bake.liveContextsAfterBake).toBe(0);
    expect(r.probe.nullContexts).toBe(0);
    expect(r.probe.lostEventsDuringProbe).toBe(0);
  });

  test('bake-shared: 24 cards through ONE reusable baker context (no new contexts, no evictions)', async ({
    page,
  }, testInfo) => {
    const errors = collectErrors(page);
    await page.goto('/examples/spikes/contexts.html?mode=bake-shared&n=24');
    const r = await waitForSpike(page);
    saveEvidence('contexts-bake-shared', testInfo, { ...r, consoleErrors: errors });
    await page.screenshot({
      path: `${MEDIA}/p0-contexts-bake-shared-${testInfo.project.name}.png`,
      fullPage: true,
    });
    expect(r.error).toBeUndefined();
    expect(r.bakeShared.imagesInDom).toBe(24);
    expect(r.bakeShared.canvasesInDom).toBe(0);
    expect(r.bakeShared.lostEventsOnBaker).toBe(0);
    // The real proof: the browser never had to evict anything.
    expect(errors.filter((m) => /too many active WebGL contexts/i.test(m))).toHaveLength(0);
  });

  test('pool: animated mesh-gradient cards never exceed N=6 live contexts while scrolling', async ({
    page,
  }, testInfo) => {
    const errors = collectErrors(page);
    await page.goto('/examples/spikes/contexts.html?mode=pool&n=24&max=6');
    await waitForSpike(page);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= height; y += 300) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(200);
    }
    for (let y = height; y >= 0; y -= 600) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => (window as unknown as { __spike: Record<string, unknown> }).__spike);
    saveEvidence('contexts-pool', testInfo, { ...r, scrollHeight: height, consoleErrors: errors });
    await page.screenshot({ path: `${MEDIA}/p0-contexts-pool-${testInfo.project.name}.png` });
    const pool = r.pool as Record<string, number>;
    expect(r.error).toBeUndefined();
    expect(pool.maxLive).toBeLessThanOrEqual(6);
    expect(pool.mountsCreated).toBeGreaterThan(6); // cards were recycled, not just capped
    expect(pool.unexpectedContextLost).toBe(0);
  });
});
