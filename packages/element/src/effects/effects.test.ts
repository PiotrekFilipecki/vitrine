/**
 * Mapping tests: the uniforms must equal what shaders-react builds for the same props (0.0.82).
 * Expected values are written by hand from the React sources, not derived from our own code.
 */
import { describe, expect, it } from 'vitest';
import dither from './dither.js';
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
