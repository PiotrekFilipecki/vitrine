import type { ParamValue, PresetDef, VitrineParams } from './types.js';

/** Parse the `params` attribute. Invalid JSON or a non-object yields `null` (caller decides how loud to be). */
export function parseParamsAttribute(raw: string | null): VitrineParams | null {
  if (raw === null || raw.trim() === '') return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const out: VitrineParams = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (isParamValue(value)) out[key] = value;
  }
  return out;
}

export function isParamValue(value: unknown): value is ParamValue {
  if (typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every((v) => typeof v === 'string');
  return false;
}

/**
 * Effective parameters: upstream Default (base for every hole) ← named preset ← `params` attribute ← `speed` attribute.
 * Unknown preset names fall back to `default` and the caller reports it.
 */
export function resolveParams(
  presets: Record<string, PresetDef>,
  presetId: string,
  overrides: VitrineParams,
  speedAttr: string | null
): { params: VitrineParams; presetId: string; presetKnown: boolean } {
  const base = presets['default']?.params ?? {};
  const named = presets[presetId];
  const params: VitrineParams = { ...base, ...(named?.params ?? {}), ...overrides };
  if (speedAttr !== null && speedAttr.trim() !== '') {
    const speed = Number(speedAttr);
    if (Number.isFinite(speed)) params['speed'] = speed;
  }
  return { params, presetId: named ? presetId : 'default', presetKnown: Boolean(named) };
}

/** Deterministic JSON (sorted keys) so equal params hash equal regardless of attribute order. */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/** FNV-1a 32-bit over the stable JSON; good enough for a cache key (collisions only cost a wrong cached frame, and the key also carries src and size). */
export function hashParams(params: VitrineParams): string {
  const s = stableStringify(params);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function num(value: ParamValue | undefined, fallback: number): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export function bool(value: ParamValue | undefined, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

export function str(value: ParamValue | undefined, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

export function strList(value: ParamValue | undefined, fallback: string[]): string[] {
  return Array.isArray(value) && value.length > 0 ? value : fallback;
}
