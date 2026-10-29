import { mkdirSync, writeFileSync } from 'node:fs';
import type { Page, TestInfo } from '@playwright/test';

export const MEDIA = 'docs/media';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PageResult = Record<string, any>;

export function collectConsole(page: Page): { errors: string[]; warnings: string[]; all: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const all: string[] = [];
  page.on('console', (m) => {
    all.push(`[${m.type()}] ${m.text()}`);
    if (m.type() === 'error') errors.push(m.text());
    if (m.type() === 'warning') warnings.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${String(e)}`));
  return { errors, warnings, all };
}

export async function waitForDone(page: Page, timeout = 60_000): Promise<PageResult> {
  await page.waitForFunction(
    () => (window as unknown as { __spike?: { done?: boolean } }).__spike?.done === true,
    null,
    { timeout }
  );
  return page.evaluate(() => (window as unknown as { __spike: PageResult }).__spike);
}

export function saveJson(name: string, testInfo: TestInfo, data: unknown, phase = 'p1'): string {
  mkdirSync(MEDIA, { recursive: true });
  const file = `${MEDIA}/${phase}-${name}-${testInfo.project.name}.json`;
  writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
}

export function savePngFromDataUrl(path: string, dataUrl: string): void {
  mkdirSync(MEDIA, { recursive: true });
  writeFileSync(path, Buffer.from(dataUrl.split(',')[1] ?? '', 'base64'));
}
