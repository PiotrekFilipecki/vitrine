import { expect, test } from '@playwright/test';
import { collectConsole, saveJson } from './shared';

/**
 * Q0 · B2: `whitePoint` (VITRINE-only, off by default). On the 12 NIWWTS mockups the cream ground (luminance 0.927)
 * must print as clean paper with the shipped `newsprint` preset, and must still print as raster with the option off,
 * so the test proves that the option, not something else, cleans it. The product itself must keep its ink.
 */
const ROWS = [
  { label: 'off', note: 'newsprint, whitePoint 1', params: { whitePoint: 1 } },
  { label: 'on', note: 'newsprint as shipped', params: {} },
];

test('whitePoint: the cream ground prints as clean paper, the product keeps its ink', async ({
  page,
}, testInfo) => {
  const con = collectConsole(page);
  await page.goto(
    `/packages/element/e2e/pages/dither-sheet.html?rows=${encodeURIComponent(JSON.stringify(ROWS))}`
  );
  await page.waitForFunction(
    () => (window as unknown as { __sheet: { done: boolean } }).__sheet?.done,
    null,
    {
      timeout: 60_000,
    }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = await page.evaluate(() => (window as any).__sheet);
  saveJson('whitepoint', testInfo, r, 'q0');
  expect(r.error).toBeUndefined();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = (label: string) => r.rows.find((x: any) => x.label === label);
  const off = row('off');
  const on = row('on');
  for (let i = 0; i < 12; i++) {
    expect(off.cards[i].dirtyPct, `${off.cards[i].file} without whitePoint`).toBeGreaterThan(15);
    expect(on.cards[i].dirtyPct, `${on.cards[i].file} with whitePoint`).toBeLessThan(0.5);
    expect(on.cards[i].inkPixelsOnProduct, `${on.cards[i].file} keeps ink`).toBeGreaterThan(0);
  }
  expect(con.errors).toEqual([]);
});
