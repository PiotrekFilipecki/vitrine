import { getShaderColorFromString } from '#paper/get-shader-color-from-string.js';
import {
  HalftoneCmykTypes,
  halftoneCmykFragmentShader,
  type HalftoneCmykType,
  type HalftoneCmykUniforms,
} from '#paper/shaders/halftone-cmyk.js';
import presetFile from '../../../../presets/halftone.json';
import { num, str } from '../params.js';
import type { PresetFile, VitrineParams } from '../types.js';
import { loadNoiseTexture } from './noise.js';
import { sizingUniforms } from './sizing.js';
import type { EffectModule } from './types.js';

const file = presetFile as PresetFile;
const d = file.presets['default']!.params;

const n = (p: VitrineParams, key: string) => num(p[key], num(d[key], 0));
const color = (p: VitrineParams, key: string) => getShaderColorFromString(str(p[key], str(d[key], '')));

function halftoneType(value: string): HalftoneCmykType {
  return value in HalftoneCmykTypes
    ? (value as HalftoneCmykType)
    : (str(d['type'], 'ink') as HalftoneCmykType);
}

/** 1:1 with shaders-react/src/shaders/halftone-cmyk.tsx (0.0.82). */
const halftone: EffectModule = {
  effect: 'halftone',
  shader: 'halftone-cmyk',
  fragmentShader: halftoneCmykFragmentShader,
  image: 'required',
  loadNoise: loadNoiseTexture,
  mipmaps: [],
  presets: file.presets,
  toUniforms(p, { image, noise }) {
    const uniforms = {
      u_image: image!,
      u_noiseTexture: noise!,
      u_colorBack: color(p, 'colorBack'),
      u_colorC: color(p, 'colorC'),
      u_colorM: color(p, 'colorM'),
      u_colorY: color(p, 'colorY'),
      u_colorK: color(p, 'colorK'),
      u_size: n(p, 'size'),
      u_contrast: n(p, 'contrast'),
      u_softness: n(p, 'softness'),
      u_grainSize: n(p, 'grainSize'),
      u_grainMixer: n(p, 'grainMixer'),
      u_grainOverlay: n(p, 'grainOverlay'),
      u_gridNoise: n(p, 'gridNoise'),
      u_floodC: n(p, 'floodC'),
      u_floodM: n(p, 'floodM'),
      u_floodY: n(p, 'floodY'),
      u_floodK: n(p, 'floodK'),
      u_gainC: n(p, 'gainC'),
      u_gainM: n(p, 'gainM'),
      u_gainY: n(p, 'gainY'),
      u_gainK: n(p, 'gainK'),
      u_type: HalftoneCmykTypes[halftoneType(str(p['type'], str(d['type'], 'ink')))],
      ...sizingUniforms(p, d),
    } satisfies HalftoneCmykUniforms;
    return uniforms;
  },
};

export default halftone;
