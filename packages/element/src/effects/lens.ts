import { lensDistortionFragmentShader, type LensDistortionUniforms } from '#paper/shaders/lens-distortion.js';
import presetFile from '../../../../presets/lens.json';
import { num } from '../params.js';
import type { PresetFile, VitrineParams } from '../types.js';
import { sizingUniforms } from './sizing.js';
import type { EffectModule } from './types.js';

const file = presetFile as PresetFile;
const d = file.presets['default']!.params;

const n = (p: VitrineParams, key: string) => num(p[key], num(d[key], 0));

/**
 * 1:1 with shaders-react/src/shaders/lens-distortion.tsx (0.0.82), incl. `mipmaps={['u_image']}`.
 * `loupeSize` and `zoom` are VITRINE-only (the pointer loupe, loupe.ts); they never reach a uniform.
 */
const lens: EffectModule = {
  effect: 'lens',
  shader: 'lens-distortion',
  fragmentShader: lensDistortionFragmentShader,
  image: 'required',
  mipmaps: ['u_image'],
  presets: file.presets,
  toUniforms(p, { image }) {
    const uniforms = {
      u_image: image!,
      u_spread: n(p, 'spread'),
      u_bias: n(p, 'bias'),
      u_angle: n(p, 'angle'),
      u_perspective: n(p, 'perspective'),
      u_count: n(p, 'count'),
      u_dispersion: n(p, 'dispersion'),
      u_dispersionShift: n(p, 'dispersionShift'),
      u_dispersionColor: n(p, 'dispersionColor'),
      u_focusCenter: n(p, 'focusCenter'),
      u_focusEdges: n(p, 'focusEdges'),
      u_swirl: n(p, 'swirl'),
      u_noise: n(p, 'noise'),
      u_noiseFrequency: n(p, 'noiseFrequency'),
      u_noiseOffset: n(p, 'noiseOffset'),
      u_lensBulge: n(p, 'lensBulge'),
      u_lensCircle: n(p, 'lensCircle'),
      u_grainMixer: n(p, 'grainMixer'),
      u_grainOverlay: n(p, 'grainOverlay'),
      u_imageX: n(p, 'imageX'),
      u_imageY: n(p, 'imageY'),
      ...sizingUniforms(p, d),
    } satisfies LensDistortionUniforms;
    return uniforms;
  },
};

export default lens;
