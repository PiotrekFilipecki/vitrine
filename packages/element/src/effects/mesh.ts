import { getShaderColorFromString } from '#paper/get-shader-color-from-string.js';
import { meshGradientFragmentShader, type MeshGradientUniforms } from '#paper/shaders/mesh-gradient.js';
import presetFile from '../../../../presets/mesh.json';
import { num, strList } from '../params.js';
import type { PresetFile } from '../types.js';
import { sizingUniforms } from './sizing.js';
import type { EffectModule } from './types.js';

const file = presetFile as PresetFile;
const d = file.presets['default']!.params;

/** 1:1 with shaders-react/src/shaders/mesh-gradient.tsx (0.0.82). */
const mesh: EffectModule = {
  effect: 'mesh',
  shader: 'mesh-gradient',
  fragmentShader: meshGradientFragmentShader,
  image: 'none',
  mipmaps: [],
  presets: file.presets,
  toUniforms(p) {
    const colors = strList(p['colors'], strList(d['colors'], []));
    const uniforms = {
      u_colors: colors.map((c) => getShaderColorFromString(c)),
      u_colorsCount: colors.length,
      u_distortion: num(p['distortion'], num(d['distortion'], 0.8)),
      u_swirl: num(p['swirl'], num(d['swirl'], 0.1)),
      u_grainMixer: num(p['grainMixer'], num(d['grainMixer'], 0)),
      u_grainOverlay: num(p['grainOverlay'], num(d['grainOverlay'], 0)),
      ...sizingUniforms(p, d),
    } satisfies MeshGradientUniforms;
    return uniforms;
  },
};

export default mesh;
