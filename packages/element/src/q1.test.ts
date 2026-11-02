/**
 * Q1 (ADR-0003): glass and lens presets equal the R0 source of truth, the uniforms equal shaders-react's,
 * the `bind` parser and the pre-order date curve.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// The R0 harness is plain ESM (examples/r0): the presets the R0 gate approved.
import { byId } from '../../../examples/r0/effects.js';
import { DATE_ANCHORS, dateFrost, formatDateBind, parseBind } from './bind.js';
import { flutedGlassFragmentShader } from '#paper/shaders/fluted-glass.js';
import glass, { glassDoorsShader, patchDoors } from './effects/glass.js';
import lens from './effects/lens.js';
import { coverBox, loupeSizing } from './motion.js';
import { resolveParams } from './params.js';

const fakeImage = { naturalWidth: 10, naturalHeight: 10 } as unknown as HTMLImageElement;

type R0Effect = {
  base: Record<string, unknown>;
  presets: Array<{ name: string; props: Record<string, unknown> }>;
};
const r0 = (id: string) => byId(id) as unknown as R0Effect;
const r0Preset = (id: string, name: string) => {
  const e = r0(id);
  const p = e.presets.find((x) => x.name === name);
  if (!p) throw new Error(`R0 preset ${id}/${name} missing`);
  return { ...e.base, ...p.props };
};

describe('presets 1:1 with examples/r0/effects.js', () => {
  it('should carry glass "window" exactly as R0 fluted-glass A "Window" (scale 1.06 included)', () => {
    expect(glass.presets['window']!.params).toEqual(r0Preset('fluted-glass', 'Window'));
    expect(glass.presets['window']!.params['scale']).toBe(1.06);
  });

  it.each([
    ['preorder-30', '30 days out'],
    ['preorder-7', '7 days out'],
    ['preorder-1', '1 day out'],
  ])('should carry glass "%s" exactly as R0 pre-order "%s"', (id, name) => {
    expect(glass.presets[id]!.params).toEqual(r0Preset('fluted-glass-preorder', name));
  });

  it('should carry lens "loupe" as R0 lens A "Loupe" plus the R0 loupe geometry (size 0.5, zoom 2.2)', () => {
    const e = byId('lens-distortion') as unknown as R0Effect & { loupe: { size: number; zoom: number } };
    const { loupeSize, zoom, ...shaderParams } = lens.presets['loupe']!.params;
    expect(shaderParams).toEqual(r0Preset('lens-distortion', 'Loupe'));
    expect({ size: loupeSize, zoom }).toEqual(e.loupe);
  });

  it('should keep the date anchors at 30, 7 and 1 days (R0 sheet)', () => {
    expect(DATE_ANCHORS.map((a) => a.days)).toEqual([30, 7, 1]);
  });
});

describe('glass (fluted-glass) mapping', () => {
  it('should map the Default preset exactly like shaders-react', () => {
    const { params } = resolveParams(glass.presets, 'default', {}, null);
    expect(glass.toUniforms(params, { image: fakeImage })).toEqual({
      u_image: fakeImage,
      u_colorBack: [0, 0, 0, 0],
      u_colorShadow: [0, 0, 0, 1],
      u_colorHighlight: [1, 1, 1, 1],
      u_shadows: 0.25,
      u_size: 0.5,
      u_angle: 0,
      u_distortion: 0.5,
      u_shift: 0,
      u_blur: 0,
      u_edges: 0.25,
      u_stretch: 0,
      u_distortionShape: 1, // prism
      u_highlights: 0.1,
      u_shape: 1, // lines
      u_marginLeft: 0,
      u_marginRight: 0,
      u_marginTop: 0,
      u_marginBottom: 0,
      u_grainMixer: 0,
      u_grainOverlay: 0,
      u_fit: 2, // cover
      u_rotation: 0,
      u_scale: 1,
      u_offsetX: 0,
      u_offsetY: 0,
      u_originX: 0.5,
      u_originY: 0.5,
      u_worldWidth: 0,
      u_worldHeight: 0,
    });
  });

  it('should map "window" (contour, 0.95, ink shadow, scale 1.06)', () => {
    const { params } = resolveParams(glass.presets, 'window', {}, null);
    const u = glass.toUniforms(params, { image: fakeImage });
    expect(u['u_distortionShape']).toBe(3);
    expect(u['u_size']).toBe(0.95);
    expect(u['u_edges']).toBe(0);
    expect(u['u_scale']).toBe(1.06);
    expect(u['u_colorShadow']).toEqual([0x14 / 255, 0x13 / 255, 0x12 / 255, 1]);
  });

  it('should fall back to prism / lines for unknown shapes', () => {
    const { params } = resolveParams(glass.presets, 'default', { distortionShape: 'x', shape: 'y' }, null);
    const u = glass.toUniforms(params, { image: fakeImage });
    expect([u['u_distortionShape'], u['u_shape']]).toEqual([1, 1]);
  });
});

describe('lens (lens-distortion) mapping', () => {
  it('should map the Default preset exactly like shaders-react', () => {
    const { params } = resolveParams(lens.presets, 'default', {}, null);
    expect(lens.toUniforms(params, { image: fakeImage })).toEqual({
      u_image: fakeImage,
      u_spread: 0.6,
      u_bias: 1,
      u_angle: 0,
      u_perspective: 0.1,
      u_count: 35,
      u_dispersion: 1,
      u_dispersionShift: 0,
      u_dispersionColor: 0.6,
      u_focusCenter: 0.8,
      u_focusEdges: 1,
      u_swirl: 0.35,
      u_noise: 0,
      u_noiseFrequency: 0.25,
      u_noiseOffset: 0,
      u_lensBulge: 0,
      u_lensCircle: 0,
      u_grainMixer: 0,
      u_grainOverlay: 0,
      u_imageX: 0,
      u_imageY: 0,
      u_fit: 1, // contain
      u_rotation: 0,
      u_scale: 1,
      u_offsetX: 0,
      u_offsetY: 0,
      u_originX: 0.5,
      u_originY: 0.5,
      u_worldWidth: 0,
      u_worldHeight: 0,
    });
  });

  it('should keep loupeSize and zoom out of the uniforms', () => {
    const { params } = resolveParams(lens.presets, 'loupe', {}, null);
    const u = lens.toUniforms(params, { image: fakeImage });
    expect(Object.keys(u).some((k) => /loupe|zoom/i.test(k))).toBe(false);
    expect([u['u_lensBulge'], u['u_lensCircle'], u['u_spread'], u['u_count']]).toEqual([0.35, 0.6, 0, 12]);
  });
});

describe('parseBind', () => {
  it('should read none, pointer and empty values', () => {
    expect(parseBind(null)).toEqual({ kind: 'none' });
    expect(parseBind('')).toEqual({ kind: 'none' });
    expect(parseBind('none')).toEqual({ kind: 'none' });
    expect(parseBind(' pointer ')).toEqual({ kind: 'pointer' });
  });

  it('should read a release date (date-only = midnight UTC) and a date-time with offset', () => {
    expect(parseBind('date:2026-12-01')).toEqual({ kind: 'date', to: Date.UTC(2026, 11, 1), from: null });
    expect(parseBind('date:2026-12-01T10:00:00+01:00')).toEqual({
      kind: 'date',
      to: Date.UTC(2026, 11, 1, 9),
      from: null,
    });
  });

  it('should read an ISO interval from/to and the JSON form the React wrappers write', () => {
    const want = { kind: 'date', from: Date.UTC(2026, 10, 1), to: Date.UTC(2026, 11, 1) };
    expect(parseBind('date:2026-11-01/2026-12-01')).toEqual(want);
    expect(parseBind('{"date":{"from":"2026-11-01","to":"2026-12-01"}}')).toEqual(want);
    expect(parseBind(formatDateBind('2026-12-01', '2026-11-01'))).toEqual(want);
    expect(parseBind('{"pointer":true}')).toEqual({ kind: 'pointer' });
  });

  it('should ignore a from after to instead of inverting the curve', () => {
    expect(parseBind('date:2026-12-05/2026-12-01')).toEqual({
      kind: 'date',
      to: Date.UTC(2026, 11, 1),
      from: null,
    });
  });

  it.each([
    'date:',
    'date:tomorrow',
    'date:2026-13-45',
    'date:xx/2026-12-01',
    '{"date":5}',
    '{oops',
    'hover',
  ])('should return null for invalid "%s"', (raw) => {
    expect(parseBind(raw)).toBeNull();
  });
});

describe('pre-order date curve (fake clock)', () => {
  const release = Date.UTC(2026, 11, 1, 10);
  const DAY = 86_400_000;
  const at = (daysLeft: number) => {
    vi.setSystemTime(release - daysLeft * DAY);
    return dateFrost({ to: release, from: null }, glass.presets, Date.now());
  };

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('should equal the anchor presets exactly at 30, 7 and 1 days', () => {
    for (const a of DATE_ANCHORS) {
      const f = at(a.days);
      const anchor = glass.presets[a.preset]!.params;
      for (const k of ['distortion', 'blur', 'highlights', 'shadows', 'grainOverlay']) {
        expect(f.params[k], `${a.preset}.${k}`).toBeCloseTo(Number(anchor[k] ?? 0), 10);
      }
    }
  });

  it('should hold the 30-day frost further out', () => {
    expect(at(90).params['blur']).toBe(0.6);
    expect(at(30.5).params['distortion']).toBe(0.5);
  });

  it('should clear monotonically towards the release and be clear on and after it', () => {
    const blurs = [30, 20, 10, 7, 4, 2, 1, 0.5, 0.1].map((d) => Number(at(d).params['blur']));
    for (let i = 1; i < blurs.length; i++) expect(blurs[i]!).toBeLessThanOrEqual(blurs[i - 1]!);
    expect(at(18.5).params['blur']).toBeCloseTo(0.45, 10); // halfway 30 → 7: 0.6 → 0.3
    expect(at(0.5).params['distortion']).toBeCloseTo(0.15, 10); // half of the 1-day 0.3
    expect(at(0).clear).toBe(true);
    expect(at(-3).clear).toBe(true);
    expect(at(-3).params).toEqual({});
  });

  it('should compress the anchors for a pre-order shorter than 30 days (from/to)', () => {
    vi.setSystemTime(release - 10 * DAY);
    const from = release - 10 * DAY;
    const f = dateFrost({ to: release, from }, glass.presets, Date.now());
    expect(f.scale).toBeCloseTo(10, 10);
    expect(f.params['blur']).toBe(0.6); // starts fully frosted at `from`
    vi.setSystemTime(release - (7 / 3) * DAY); // the 7-day anchor ×10/30
    expect(dateFrost({ to: release, from }, glass.presets, Date.now()).params['blur']).toBeCloseTo(0.3, 10);
  });

  it('should show the 30-day frost before the pre-order opens', () => {
    vi.setSystemTime(release - 5 * DAY);
    const f = dateFrost({ to: release, from: release - 2 * DAY }, glass.presets, Date.now());
    expect(f.params['blur']).toBe(0.6);
  });
});

describe('loupe geometry (R0 loupeProps)', () => {
  it('should centre the magnified photo under the pointer', () => {
    // Pointer at the cell centre: no offset; scale = zoom × cell box / lens box.
    const c = loupeSizing({ cellW: 400, cellH: 500, aspect: 1.6, L: 200, cx: 200, cy: 250, zoom: 2.2 });
    const cell = coverBox(400, 500, 1.6);
    const lensBox = coverBox(200, 200, 1.6);
    expect(c.offsetX).toBeCloseTo(0, 10);
    expect(c.offsetY).toBeCloseTo(0, 10);
    expect(c.scale).toBeCloseTo((2.2 * cell.x) / lensBox.x, 10);
    // Pointer to the right: the image moves left (negative offset), proportional to the distance.
    const r = loupeSizing({ cellW: 400, cellH: 500, aspect: 1.6, L: 200, cx: 300, cy: 250, zoom: 2.2 });
    expect(r.offsetX).toBeCloseTo((-c.scale * 100) / cell.x, 10);
  });
});

describe('glass doors patch (VITRINE-only)', () => {
  it('should add one uniform, the pane-mask helper and the split, and leave the upstream lines in place', () => {
    const src = glassDoorsShader();
    expect(src).toContain('uniform vec2 u_vitrineGap;');
    expect(src).toContain('float vitrinePaneMask(');
    expect(src).toContain('if (u_vitrineGap.y > u_vitrineGap.x)');
    // every upstream line survives: the patch only inserts
    for (const line of flutedGlassFragmentShader.split('\n')) expect(src).toContain(line);
  });

  it('should throw when upstream moves an anchor line, instead of dropping the option silently', () => {
    expect(() => patchDoors(flutedGlassFragmentShader.replace('void main() {', 'void main(){'))).toThrow(
      /anchors/
    );
  });

  it('should be used for the interaction only when params.doors is set', () => {
    expect(glass.interactionShader?.({ doors: true })).toBe(glassDoorsShader());
    expect(glass.interactionShader?.({})).toBeNull();
    expect(glass.interactionShader?.({ doors: false })).toBeNull();
  });
});
