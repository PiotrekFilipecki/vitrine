import { getShaderColorFromString } from '#paper/get-shader-color-from-string.js';
import {
  GlassDistortionShapes,
  GlassGridShapes,
  flutedGlassFragmentShader,
  type FlutedGlassUniforms,
} from '#paper/shaders/fluted-glass.js';
import presetFile from '../../../../presets/glass.json';
import { num, str } from '../params.js';
import type { PresetFile, VitrineParams } from '../types.js';
import { sizingUniforms } from './sizing.js';
import type { EffectModule } from './types.js';

const file = presetFile as PresetFile;
const d = file.presets['default']!.params;

const n = (p: VitrineParams, key: string) => num(p[key], num(d[key], 0));
const color = (p: VitrineParams, key: string) => getShaderColorFromString(str(p[key], str(d[key], '')));

function oneOf<T extends string, V extends number>(table: Record<T, V>, value: string, fallback: T): V {
  return value in table ? table[value as T] : table[fallback];
}

/** React: `marginLeft = margin ?? default` applies only when the side itself is not given. */
function side(p: VitrineParams, key: string): number {
  if (typeof p[key] === 'number' || typeof p[key] === 'string') return n(p, key);
  return num(p['margin'], n(d, key));
}

/**
 * 1:1 with shaders-react/src/shaders/fluted-glass.tsx (0.0.82), incl. `mipmaps={['u_image']}`.
 * The card glass (Q1, ADR-0003): rest = the baked frame, reveal = `marginLeft` 0 → 1 on one live context.
 */
const glass: EffectModule = {
  effect: 'glass',
  shader: 'fluted-glass',
  fragmentShader: flutedGlassFragmentShader,
  image: 'required',
  mipmaps: ['u_image'],
  presets: file.presets,
  toUniforms(p, { image }) {
    const uniforms = {
      u_image: image!,
      u_colorBack: color(p, 'colorBack'),
      u_colorShadow: color(p, 'colorShadow'),
      u_colorHighlight: color(p, 'colorHighlight'),
      u_shadows: n(p, 'shadows'),
      u_size: n(p, 'size'),
      u_angle: n(p, 'angle'),
      u_distortion: n(p, 'distortion'),
      u_shift: n(p, 'shift'),
      u_blur: n(p, 'blur'),
      u_edges: n(p, 'edges'),
      u_stretch: n(p, 'stretch'),
      u_distortionShape: oneOf(
        GlassDistortionShapes,
        str(p['distortionShape'], str(d['distortionShape'], 'prism')),
        'prism' as const
      ),
      u_highlights: n(p, 'highlights'),
      u_shape: oneOf(GlassGridShapes, str(p['shape'], str(d['shape'], 'lines')), 'lines' as const),
      u_marginLeft: side(p, 'marginLeft'),
      u_marginRight: side(p, 'marginRight'),
      u_marginTop: side(p, 'marginTop'),
      u_marginBottom: side(p, 'marginBottom'),
      u_grainMixer: n(p, 'grainMixer'),
      u_grainOverlay: n(p, 'grainOverlay'),
      ...sizingUniforms(p, d),
    } satisfies FlutedGlassUniforms;
    return uniforms;
  },
};

export default glass;
