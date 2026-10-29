import { getShaderColorFromString } from '#paper/get-shader-color-from-string.js';
import {
  DitheringTypes,
  imageDitheringFragmentShader,
  type DitheringType,
  type ImageDitheringUniforms,
} from '#paper/shaders/image-dithering.js';
import presetFile from '../../../../presets/dither.json';
import { bool, num, str } from '../params.js';
import type { PresetFile } from '../types.js';
import { sizingUniforms } from './sizing.js';
import type { EffectModule } from './types.js';

const file = presetFile as PresetFile;
const d = file.presets['default']!.params;

function ditherType(value: string): DitheringType {
  return value in DitheringTypes ? (value as DitheringType) : (str(d['type'], '8x8') as DitheringType);
}

/** 1:1 with shaders-react/src/shaders/image-dithering.tsx (0.0.82). `size` is the React prop name for `u_pxSize`. */
const dither: EffectModule = {
  effect: 'dither',
  shader: 'image-dithering',
  fragmentShader: imageDitheringFragmentShader,
  image: 'required',
  mipmaps: [],
  presets: file.presets,
  toUniforms(p, { image }) {
    const uniforms = {
      u_image: image!,
      u_colorFront: getShaderColorFromString(str(p['colorFront'], str(d['colorFront'], ''))),
      u_colorBack: getShaderColorFromString(str(p['colorBack'], str(d['colorBack'], ''))),
      u_colorHighlight: getShaderColorFromString(str(p['colorHighlight'], str(d['colorHighlight'], ''))),
      u_type: DitheringTypes[ditherType(str(p['type'], str(d['type'], '8x8')))],
      u_pxSize: num(p['size'], num(d['size'], 2)),
      u_colorSteps: num(p['colorSteps'], num(d['colorSteps'], 2)),
      u_originalColors: bool(p['originalColors'], bool(d['originalColors'], false)),
      u_inverted: bool(p['inverted'], bool(d['inverted'], false)),
      ...sizingUniforms(p, d),
    } satisfies ImageDitheringUniforms;
    return uniforms;
  },
};

export default dither;
