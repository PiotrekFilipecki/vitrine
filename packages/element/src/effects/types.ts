import type { ShaderMountUniforms } from '#paper/shader-mount.js';
import type { PresetDef, VitrineEffect, VitrineParams } from '../types.js';

export interface EffectTextures {
  image?: HTMLImageElement;
  noise?: HTMLImageElement;
}

/**
 * A VITRINE-only variant of the upstream fragment shader (Q0: `whitePoint` on dither). Used only when a parameter
 * that upstream does not have is set, so every preset without it still renders with the upstream source 1:1.
 */
export interface EffectVariant {
  /** Baker identity: one shared off-screen context per variant key. */
  key: string;
  fragmentShader: string;
}

export interface EffectModule {
  effect: VitrineEffect;
  /** Upstream shader name, for messages and the devlog. */
  shader: string;
  fragmentShader: string;
  /** `required`: image effects (dither, halftone); `optional`: paper-texture works with or without; `none`: mesh. */
  image: 'required' | 'optional' | 'none';
  /** Loader for `u_noiseTexture` (halftone-cmyk, paper-texture); keeps the base64 noise PNG out of the core chunk. */
  loadNoise?: () => Promise<HTMLImageElement>;
  /** Uniform names ShaderMount should generate mipmaps for (paper-texture: u_image). */
  mipmaps: string[];
  presets: Record<string, PresetDef>;
  /** Returns a patched shader when VITRINE-only parameters ask for one; null = upstream shader. */
  variant?(params: VitrineParams): EffectVariant | null;
  /** 1:1 port of the React component's props → uniforms mapping. */
  toUniforms(params: VitrineParams, textures: EffectTextures): ShaderMountUniforms;
}
