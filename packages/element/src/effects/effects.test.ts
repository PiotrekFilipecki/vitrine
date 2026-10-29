/**
 * Mapping tests: the uniforms must equal what shaders-react builds for the same props (0.0.82).
 * Expected values are written by hand from the React sources, not derived from our own code.
 */
import { describe, expect, it } from 'vitest';
import dither, { patchWhitePoint, whitePointOf } from './dither.js';
import halftone from './halftone.js';
import mesh from './mesh.js';
import paper from './paper.js';
import { resolveParams } from '../params.js';

const fakeImage = { naturalWidth: 10, naturalHeight: 10 } as unknown as HTMLImageElement;
const fakeNoise = { naturalWidth: 128, naturalHeight: 128 } as unknown as HTMLImageElement;

describe('dither (image-dithering)', () => {
  it('should map the Default preset exactly like shaders-react', () => {
    const { params } = resolveParams(dither.presets, 'default', {}, null);
    const u = dither.toUniforms(params, { image: fakeImage });
    expect(u).toEqual({
      u_image: fakeImage,
      u_colorFront: [0x94 / 255, 1, 0xaf / 255, 1],
      u_colorBack: [0, 0x0c / 255, 0x38 / 255, 1],
      u_colorHighlight: [0xea / 255, 1, 0x94 / 255, 1],
      u_type: 4, // DitheringTypes['8x8']
      u_pxSize: 2,
      u_colorSteps: 2,
      u_originalColors: false,
      u_inverted: false,
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

  it('should apply params overrides and ranges (type, size, colorSteps, fit)', () => {
    const { params } = resolveParams(
      dither.presets,
      'default',
      { type: '2x2', size: 4, colorSteps: 5, fit: 'contain' },
      null
    );
    const u = dither.toUniforms(params, { image: fakeImage });
    expect(u['u_type']).toBe(2);
    expect(u['u_pxSize']).toBe(4);
    expect(u['u_colorSteps']).toBe(5);
    expect(u['u_fit']).toBe(1);
  });

  it('should fall back to the default type for an unknown dithering type', () => {
    const { params } = resolveParams(dither.presets, 'default', { type: 'hexagons' }, null);
    expect(dither.toUniforms(params, { image: fakeImage })['u_type']).toBe(4);
  });
});

describe('halftone (halftone-cmyk)', () => {
  it('should map the Default preset exactly like shaders-react', () => {
    const { params } = resolveParams(halftone.presets, 'default', {}, null);
    const u = halftone.toUniforms(params, { image: fakeImage, noise: fakeNoise });
    expect(u['u_noiseTexture']).toBe(fakeNoise);
    expect(u['u_colorBack']).toEqual([0xfb / 255, 0xfa / 255, 0xf5 / 255, 1]);
    expect(u['u_colorC']).toEqual([0, 0xb4 / 255, 1, 1]);
    expect(u['u_size']).toBe(0.2);
    expect(u['u_softness']).toBe(1);
    expect(u['u_floodC']).toBe(0.15);
    expect(u['u_gainC']).toBe(0.3);
    expect(u['u_gainY']).toBe(0.2);
    expect(u['u_type']).toBe(1); // ink
    expect(u['u_fit']).toBe(2);
    expect(Object.keys(u)).toHaveLength(32);
  });

  it('should turn an 8-digit hex into a channel with alpha (riso preset switches yellow off)', () => {
    const { params } = resolveParams(halftone.presets, 'riso', {}, null);
    const u = halftone.toUniforms(params, { image: fakeImage, noise: fakeNoise });
    expect((u['u_colorY'] as number[])[3]).toBe(0);
    expect(u['u_type']).toBe(1);
  });
});

describe('mesh (mesh-gradient)', () => {
  it('should map colors to vec4 list + count, Default preset 1:1', () => {
    const { params } = resolveParams(mesh.presets, 'default', {}, null);
    const u = mesh.toUniforms(params, {});
    expect(u['u_colorsCount']).toBe(4);
    expect((u['u_colors'] as number[][])[1]).toEqual([0x24 / 255, 0x1d / 255, 0x9a / 255, 1]);
    expect(u['u_distortion']).toBe(0.8);
    expect(u['u_swirl']).toBe(0.1);
    expect(u['u_fit']).toBe(1); // defaultObjectSizing.fit = contain
    expect(params['speed']).toBe(1);
  });

  it('should accept a colors override of a different length', () => {
    const { params } = resolveParams(mesh.presets, 'default', { colors: ['#ffffff', '#000000'] }, null);
    const u = mesh.toUniforms(params, {});
    expect(u['u_colorsCount']).toBe(2);
    expect((u['u_colors'] as number[][])[0]).toEqual([1, 1, 1, 1]);
  });
});

describe('paper (paper-texture)', () => {
  it('should map the Default preset 1:1 incl. u_isImage and mipmaps for u_image', () => {
    const { params } = resolveParams(paper.presets, 'default', {}, null);
    const u = paper.toUniforms(params, { image: fakeImage, noise: fakeNoise });
    expect(paper.mipmaps).toEqual(['u_image']);
    expect(u['u_isImage']).toBe(true);
    expect(u['u_colorBack']).toEqual([0xd3 / 255, 0xd2 / 255, 0xab / 255, 1]);
    expect(u['u_angle']).toBe(300);
    expect(u['u_seed']).toBe(4);
    expect(u['u_crumpleCount']).toBe(6);
    expect(u['u_wrinkleSize']).toBe(0.65);
    expect(u['u_scale']).toBe(0.9);
    expect(u['u_fit']).toBe(1);
    expect(u['u_clip']).toBe(false);
  });

  it('should report u_isImage=false when no image is given', () => {
    const { params } = resolveParams(paper.presets, 'default', {}, null);
    const u = paper.toUniforms(params, { noise: fakeNoise });
    expect(u['u_isImage']).toBe(false);
    expect(u['u_image']).toBeUndefined();
  });
});

describe('dither · whitePoint (VITRINE-only, Q0)', () => {
  it('should keep the upstream shader and the React uniforms when whitePoint is absent or off', () => {
    // Arrange
    const cases: Array<Record<string, number>> = [
      {},
      { whitePoint: 1 },
      { whitePoint: 0 },
      { whitePoint: 1.4 },
    ];
    for (const override of cases) {
      const { params } = resolveParams(dither.presets, 'default', override, null);
      // Act
      const variant = dither.variant?.(params) ?? null;
      const u = dither.toUniforms(params, { image: fakeImage });
      // Assert
      expect(variant).toBeNull();
      expect(u).not.toHaveProperty('u_vitrineWhitePoint');
    }
  });

  it('should switch to the patched shader and pass the uniform when whitePoint is in (0, 1)', () => {
    // Arrange
    const { params } = resolveParams(dither.presets, 'newsprint', {}, null);
    // Act
    const variant = dither.variant?.(params);
    const u = dither.toUniforms(params, { image: fakeImage });
    // Assert
    expect(params['whitePoint']).toBe(0.9);
    expect(variant?.key).toBe('dither+whitePoint');
    expect(u['u_vitrineWhitePoint']).toBe(0.9);
    expect(variant?.fragmentShader).not.toBe(dither.fragmentShader);
  });

  it('should add exactly one uniform and one levels line to the upstream source', () => {
    // Act
    const patched = patchWhitePoint(dither.fragmentShader);
    // Assert: the only difference is the two inserted lines.
    const added = patched.split('\n').filter((l) => !dither.fragmentShader.split('\n').includes(l));
    expect(added.map((l) => l.trim())).toEqual([
      'uniform float u_vitrineWhitePoint;',
      'lum = min(lum / u_vitrineWhitePoint, 1.);',
    ]);
    expect(patched.indexOf('lum = min(lum / u_vitrineWhitePoint')).toBeLessThan(
      patched.indexOf('u_inverted ?')
    );
  });

  it('should throw when upstream changes the anchor lines, so a version bump cannot drop the option silently', () => {
    expect(() => patchWhitePoint('void main() {}')).toThrow(/anchors not found/);
  });

  it('should accept whitePoint only as a finite number in (0, 1)', () => {
    expect(whitePointOf({ whitePoint: 0.9 })).toBe(0.9);
    expect(whitePointOf({ whitePoint: '0.9' })).toBeNull();
    expect(whitePointOf({ whitePoint: 1 })).toBeNull();
    expect(whitePointOf({})).toBeNull();
  });
});
