import { getShaderColorFromString } from '#paper/get-shader-color-from-string.js';
import { paperTextureFragmentShader, type PaperTextureUniforms } from '#paper/shaders/paper-texture.js';
import presetFile from '../../../../presets/paper.json';
import { bool, num, str } from '../params.js';
import type { PresetFile, VitrineParams } from '../types.js';
import { loadNoiseTexture } from './noise.js';
import { sizingUniforms } from './sizing.js';
import type { EffectModule } from './types.js';

const file = presetFile as PresetFile;
const d = file.presets['default']!.params;

const n = (p: VitrineParams, key: string) => num(p[key], num(d[key], 0));
const color = (p: VitrineParams, key: string) => getShaderColorFromString(str(p[key], str(d[key], '')));

/** 1:1 with shaders-react/src/shaders/paper-texture.tsx (0.0.82), incl. `mipmaps={['u_image']}` and `u_isImage`. */
const paper: EffectModule = {
  effect: 'paper',
  shader: 'paper-texture',
  fragmentShader: paperTextureFragmentShader,
  image: 'optional',
  loadNoise: loadNoiseTexture,
  mipmaps: ['u_image'],
  presets: file.presets,
  toUniforms(p, { image, noise }) {
    const uniforms = {
      // React passes `image = ''` → processUniforms loads emptyPixel; without an image we pass the same transparent pixel.
      u_image: image,
      u_isImage: Boolean(image),
      u_colorBack: color(p, 'colorBack'),
      u_colorPaper: color(p, 'colorPaper'),
      u_colorShadow: color(p, 'colorShadow'),
      u_blending: n(p, 'blending'),
      u_distortion: n(p, 'distortion'),
      u_clip: bool(p['clip'], bool(d['clip'], false)),
      u_angle: n(p, 'angle'),
      u_seed: n(p, 'seed'),
      u_roughness: n(p, 'roughness'),
      u_roughnessSize: n(p, 'roughnessSize'),
      u_roughnessRows: n(p, 'roughnessRows'),
      u_fiber: n(p, 'fiber'),
      u_fiberSize: n(p, 'fiberSize'),
      u_folds: n(p, 'folds'),
      u_foldSizeX: n(p, 'foldSizeX'),
      u_foldSizeY: n(p, 'foldSizeY'),
      u_foldOffsetX: n(p, 'foldOffsetX'),
      u_foldOffsetY: n(p, 'foldOffsetY'),
      u_wrinkles: n(p, 'wrinkles'),
      u_wrinkleSize: n(p, 'wrinkleSize'),
      u_crumples: n(p, 'crumples'),
      u_crumpleCount: n(p, 'crumpleCount'),
      u_drops: n(p, 'drops'),
      u_noiseTexture: noise!,
      ...sizingUniforms(p, d),
    } satisfies PaperTextureUniforms;
    return uniforms;
  },
};

export default paper;
