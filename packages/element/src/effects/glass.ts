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
  interactionShader(p) {
    return p['doors'] === true || p['doors'] === 'true' ? glassDoorsShader() : null;
  },
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

const MAIN_ANCHOR = 'void main() {';
const MASK_ANCHOR = 'float maskStrokeInner = maskInner - mask;';
const MARGIN_UNIFORM_ANCHOR = 'uniform float u_marginBottom;';

/**
 * VITRINE-only "doors" (Q1 follow-up, ADR-0003 debt): one uniform `u_vitrineGap` = (from, to) in canvas x opens a hole
 * in the glass, so two panes part at the pointer on ONE context (the R0 hero needed two). Each pane is the upstream
 * margin mask with its own margins, so the cut edges get the same highlight and shadow strokes as the outer edges.
 * With from ≥ to the upstream masks are used unchanged (the rest frame is pixel-identical). Throws if upstream moves
 * the anchor lines, so a version bump cannot silently drop the patch.
 */
export function patchDoors(source: string): string {
  for (const a of [MAIN_ANCHOR, MASK_ANCHOR, MARGIN_UNIFORM_ANCHOR]) {
    if (source.split(a).length !== 2)
      throw new Error('fluted-glass source changed upstream: doors patch anchors not found');
  }
  const helpers = `
float vitrinePaneMask(vec4 m, vec2 p, vec2 sw, int kind) {
  if (kind == 0) return smoothstep(m[0], m[0] + sw.x, p.x + sw.x) * smoothstep(m[2], m[2] + sw.x, 1.0 - p.x + sw.x) *
    smoothstep(m[1], m[1] + sw.y, p.y + sw.y) * smoothstep(m[3], m[3] + sw.y, 1.0 - p.y + sw.y);
  if (kind == 1) return smoothstep(m[0] - sw.x, m[0], p.x + sw.x) * smoothstep(m[2] - sw.x, m[2], 1.0 - p.x + sw.x) *
    smoothstep(m[1] - sw.y, m[1], p.y + sw.y) * smoothstep(m[3] - sw.y, m[3], 1.0 - p.y + sw.y);
  return smoothstep(m[0] - 2. * sw.x, m[0], p.x) * smoothstep(m[2] - 2. * sw.x, m[2], 1.0 - p.x) *
    smoothstep(m[1] - 2. * sw.y, m[1], p.y) * smoothstep(m[3] - 2. * sw.y, m[3], 1.0 - p.y);
}

`;
  const split = `
  if (u_vitrineGap.y > u_vitrineGap.x) {
    vec4 mL = vec4(margins[0], margins[1], max(margins[2], 1. - u_vitrineGap.x), margins[3]);
    vec4 mR = vec4(max(margins[0], u_vitrineGap.y), margins[1], margins[2], margins[3]);
    mask = vitrinePaneMask(mL, uvMask, sw, 0) + vitrinePaneMask(mR, uvMask, sw, 0);
    maskOuter = vitrinePaneMask(mL, uvMask, sw, 1) + vitrinePaneMask(mR, uvMask, sw, 1);
    maskInner = vitrinePaneMask(mL, uvMask, sw, 2) + vitrinePaneMask(mR, uvMask, sw, 2);
    maskStroke = maskOuter - mask;
    maskStrokeInner = maskInner - mask;
  }`;
  return source
    .replace(MARGIN_UNIFORM_ANCHOR, `${MARGIN_UNIFORM_ANCHOR}\nuniform vec2 u_vitrineGap;`)
    .replace(MAIN_ANCHOR, `${helpers}${MAIN_ANCHOR}`)
    .replace(MASK_ANCHOR, `${MASK_ANCHOR}${split}`);
}

let doorsShader: string | null = null;
/** The patched source, built once. */
export function glassDoorsShader(): string {
  doorsShader ??= patchDoors(flutedGlassFragmentShader);
  return doorsShader;
}
