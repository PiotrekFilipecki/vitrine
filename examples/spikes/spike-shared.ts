import { mkdirSync, writeFileSync } from 'node:fs';
import type { Page, TestInfo } from '@playwright/test';

export const MEDIA = 'docs/media';

// Spike pages publish loosely-typed JSON on window.__spike; specs read it as a plain record.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SpikeResult = Record<string, any>;

export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${String(e)}`));
  return errors;
}

export async function waitForSpike(page: Page, timeout = 90_000): Promise<SpikeResult> {
  await page.waitForFunction(
    () => (window as unknown as { __spike?: { done?: boolean } }).__spike?.done === true,
    null,
    {
      timeout,
    }
  );
  return page.evaluate(() => (window as unknown as { __spike: SpikeResult }).__spike);
}

export function saveEvidence(name: string, testInfo: TestInfo, data: unknown): string {
  mkdirSync(MEDIA, { recursive: true });
  const file = `${MEDIA}/p0-${name}-${testInfo.project.name}.json`;
  writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
}

export function savePngFromDataUrl(path: string, dataUrl: string): void {
  mkdirSync(MEDIA, { recursive: true });
  writeFileSync(path, Buffer.from(dataUrl.split(',')[1] ?? '', 'base64'));
}
