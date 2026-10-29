import { getShaderColorFromString } from '#paper/get-shader-color-from-string.js';
import {
  DitheringTypes,
  imageDitheringFragmentShader,
  type DitheringType,
  type ImageDitheringUniforms,
} from '#paper/shaders/image-dithering.js';
import presetFile from '../../../../presets/dither.json';
import { bool, num, str } from '../params.js';
import type { PresetFile, VitrineParams } from '../types.js';
import { sizingUniforms } from './sizing.js';
import type { EffectModule, EffectVariant } from './types.js';

const file = presetFile as PresetFile;
const d = file.presets['default']!.params;

function ditherType(value: string): DitheringType {
  return value in DitheringTypes ? (value as DitheringType) : (str(d['type'], '8x8') as DitheringType);
}

const LUM_LINE = 'float lum = dot(vec3(.2126, .7152, .0722), image.rgb);';
const UNIFORM_ANCHOR = 'uniform float u_colorSteps;';

/**
 * VITRINE-only `whitePoint` (Q0, B2): a levels step on the source luminance before the dither, `lum / whitePoint`
 * clamped to 1. The upstream dither adds ±0.5/colorSteps of Bayer offset to every pixel, so any luminance below 1
 * prints some dots: a cream mockup background (0.927 on the NIWWTS photos) became a raster over the whole card.
 * With `whitePoint` ≤ the background luminance it prints as clean highlight colour. The patch adds one uniform and
 * one line to the upstream source; it throws if upstream ever changes the anchor lines, so a bump cannot silently
 * drop it.
 */
export function patchWhitePoint(source: string): string {
  if (source.split(LUM_LINE).length !== 2 || source.split(UNIFORM_ANCHOR).length !== 2) {
    throw new Error('image-dithering source changed upstream: whitePoint patch anchors not found');
  }
  return source
    .replace(UNIFORM_ANCHOR, `${UNIFORM_ANCHOR}\nuniform float u_vitrineWhitePoint;`)
    .replace(LUM_LINE, `${LUM_LINE}\n  lum = min(lum / u_vitrineWhitePoint, 1.);`);
}

let whitePointShader: string | null = null;

/** `whitePoint` in (0, 1) turns the option on; absent, 1, or anything outside the range = upstream shader. */
export function whitePointOf(p: VitrineParams): number | null {
  const v = p['whitePoint'];
  return typeof v === 'number' && Number.isFinite(v) && v > 0 && v < 1 ? v : null;
}

/** 1:1 with shaders-react/src/shaders/image-dithering.tsx (0.0.82). `size` is the React prop name for `u_pxSize`. */
const dither: EffectModule = {
  effect: 'dither',
  shader: 'image-dithering',
  fragmentShader: imageDitheringFragmentShader,
  image: 'required',
  mipmaps: [],
  presets: file.presets,
  variant(p): EffectVariant | null {
    if (whitePointOf(p) === null) return null;
    whitePointShader ??= patchWhitePoint(imageDitheringFragmentShader);
    return { key: 'dither+whitePoint', fragmentShader: whitePointShader };
  },
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
    const wp = whitePointOf(p);
    // Only the patched shader declares u_vitrineWhitePoint; the upstream path gets exactly the React uniforms.
    return wp === null ? uniforms : { ...uniforms, u_vitrineWhitePoint: wp };
  },
};

export default dither;
