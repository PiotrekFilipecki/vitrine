import type { VitrineConfig } from './types.js';

const DEFAULTS: VitrineConfig = {
  maxLive: 6,
  debug: false,
  bakeIdleMs: 1500,
  minPixelRatio: 2,
  maxPixelCount: undefined,
};

let current: VitrineConfig = { ...DEFAULTS };

/** `<html data-vitrine-max-live="4">` lets a Liquid theme set the pool size without JS. */
function readDocumentOverrides(): Partial<VitrineConfig> {
  if (typeof document === 'undefined') return {};
  const ds = document.documentElement.dataset;
  const out: Partial<VitrineConfig> = {};
  const maxLive = Number(ds.vitrineMaxLive);
  if (Number.isInteger(maxLive) && maxLive > 0) out.maxLive = maxLive;
  if (ds.vitrineDebug !== undefined) out.debug = true;
  return out;
}

let documentRead = false;

export function getConfig(): VitrineConfig {
  if (!documentRead) {
    documentRead = true;
    current = { ...current, ...readDocumentOverrides() };
  }
  return current;
}

export function setConfig(partial: Partial<VitrineConfig>): VitrineConfig {
  getConfig();
  const next = { ...current };
  if (partial.maxLive !== undefined && Number.isInteger(partial.maxLive) && partial.maxLive > 0) {
    next.maxLive = partial.maxLive;
  }
  if (partial.debug !== undefined) next.debug = Boolean(partial.debug);
  if (partial.bakeIdleMs !== undefined && Number.isFinite(partial.bakeIdleMs) && partial.bakeIdleMs >= 0) {
    next.bakeIdleMs = partial.bakeIdleMs;
  }
  if (
    partial.minPixelRatio !== undefined &&
    Number.isFinite(partial.minPixelRatio) &&
    partial.minPixelRatio > 0
  ) {
    next.minPixelRatio = partial.minPixelRatio;
  }
  if ('maxPixelCount' in partial) {
    next.maxPixelCount =
      partial.maxPixelCount !== undefined &&
      Number.isFinite(partial.maxPixelCount) &&
      partial.maxPixelCount > 0
        ? partial.maxPixelCount
        : undefined;
  }
  current = next;
  return current;
}

/** Test helper: back to defaults. */
export function resetConfig(): void {
  current = { ...DEFAULTS };
  documentRead = false;
}
