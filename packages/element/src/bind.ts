import type { PresetDef, VitrineParams } from './types.js';

/**
 * `bind` attribute (Q1, ADR-0003): what drives the effect besides its preset.
 *
 *   bind="none"                                  nothing (default for glass)
 *   bind="pointer"                               lens centre follows the pointer (default for lens)
 *   bind="date:2026-12-01T10:00:00Z"             glass frost clears towards the release date (`to`)
 *   bind="date:2026-11-01/2026-12-01"            ISO 8601 interval `from/to`: the frost scale starts at `from`
 *   bind='{"date":{"from":"…","to":"…"}}'        the same as JSON (what the React wrappers write)
 */
export type VitrineBind =
  { kind: 'none' } | { kind: 'pointer' } | { kind: 'date'; to: number; from: number | null };

const NONE: VitrineBind = { kind: 'none' };

/** ISO 8601 date or date-time → epoch ms; date-only values are midnight UTC (Date.parse rule). */
function isoTime(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const s = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}([T ][\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/.test(s)) return null;
  const t = Date.parse(s.replace(' ', 'T'));
  return Number.isFinite(t) ? t : null;
}

function dateBind(fromRaw: unknown, toRaw: unknown): VitrineBind | null {
  const to = isoTime(toRaw);
  if (to === null) return null;
  const hasFrom = !(fromRaw === undefined || fromRaw === null || fromRaw === '');
  const from = hasFrom ? isoTime(fromRaw) : null;
  if (hasFrom && from === null) return null;
  // A `from` after `to` is ignored rather than inverting the curve.
  return { kind: 'date', to, from: from !== null && from < to ? from : null };
}

/** Parse the `bind` attribute. `null` = invalid (caller warns under `debug` and uses the effect default). */
export function parseBind(raw: string | null): VitrineBind | null {
  if (raw === null) return NONE;
  const s = raw.trim();
  if (s === '' || s === 'none') return NONE;
  if (s === 'pointer') return { kind: 'pointer' };
  if (s.startsWith('{')) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(s);
    } catch {
      return null;
    }
    if (parsed && typeof parsed === 'object') {
      const o = parsed as Record<string, unknown>;
      if (o['pointer'] === true) return { kind: 'pointer' };
      const date = o['date'];
      if (typeof date === 'string') return dateBind(null, date);
      if (date && typeof date === 'object') {
        const dd = date as Record<string, unknown>;
        return dateBind(dd['from'], dd['to']);
      }
    }
    return null;
  }
  if (s.startsWith('date:')) {
    const value = s.slice(5).trim();
    const slash = value.indexOf('/');
    return slash === -1 ? dateBind(null, value) : dateBind(value.slice(0, slash), value.slice(slash + 1));
  }
  return null;
}

/** Serialise for the attribute (React wrappers, Liquid docs): the ISO interval form. */
export function formatDateBind(to: string, from?: string | null): string {
  return from ? `date:${from}/${to}` : `date:${to}`;
}

const DAY = 86_400_000;

/** R0 sheet anchors (`r0-fluted-glass-preorder.webp`): days before release → preset id. */
export const DATE_ANCHORS: ReadonlyArray<{ days: number; preset: string }> = [
  { days: 30, preset: 'preorder-30' },
  { days: 7, preset: 'preorder-7' },
  { days: 1, preset: 'preorder-1' },
];

/** Numeric parameters the curve moves; everything else comes from the anchor presets unchanged. */
const CURVE_KEYS = ['distortion', 'blur', 'stretch', 'highlights', 'shadows', 'grainOverlay'] as const;

export interface DateFrost {
  /** Days until `to` (fractional, negative after release). */
  daysLeft: number;
  /** 30-day anchor after `from` shortening (30 without `from`, or with a window of 30 days or more). */
  scale: number;
  /** `true` on and after the release: no glass at all, the plain photo, no bake. */
  clear: boolean;
  /** Parameters to merge over the preset (empty when clear). */
  params: VitrineParams;
}

/**
 * Frost of the pre-order glass at `now` (Q1 · G3). Piecewise-linear in days left between the R0 anchors
 * 30 → 7 → 1 day, then from the 1-day frost to none at the release; ≥ 30 days (or before `from`) = the 30-day frost.
 * With `from`, a pre-order shorter than 30 days compresses the anchors (×window/30), so it still starts fully frosted.
 * Computed once at mount and baked: no clock runs on the page.
 */
export function dateFrost(
  bind: { to: number; from: number | null },
  presets: Record<string, PresetDef>,
  now: number
): DateFrost {
  const daysLeft = (bind.to - now) / DAY;
  const windowDays = bind.from === null ? Infinity : (bind.to - bind.from) / DAY;
  const k = Math.min(1, windowDays / 30);
  if (daysLeft <= 0) return { daysLeft, scale: 30 * k, clear: true, params: {} };
  const anchors = DATE_ANCHORS.map((a) => ({ days: a.days * k, params: presets[a.preset]?.params ?? {} }));
  const first = anchors[0]!;
  const last = anchors[anchors.length - 1]!;
  const before = bind.from !== null && now < bind.from;
  if (before || daysLeft >= first.days)
    return { daysLeft, scale: first.days, clear: false, params: { ...first.params } };
  let lo = last;
  let hi: (typeof anchors)[number] | null = null;
  let t = daysLeft / last.days; // last day: from 0 (release) to the 1-day frost
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]!;
    const b = anchors[i + 1]!;
    if (daysLeft <= a.days && daysLeft >= b.days) {
      hi = a;
      lo = b;
      t = (daysLeft - b.days) / (a.days - b.days);
      break;
    }
  }
  const params: VitrineParams = { ...lo.params };
  for (const key of CURVE_KEYS) {
    const loV = numberOr(lo.params[key], 0);
    const hiV = hi ? numberOr(hi.params[key], 0) : 0;
    // Between two anchors: lerp lo → hi. In the last day: from 0 at release up to the 1-day anchor.
    params[key] = hi ? loV + (hiV - loV) * t : loV * t;
  }
  return { daysLeft, scale: first.days, clear: false, params };
}

function numberOr(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}
