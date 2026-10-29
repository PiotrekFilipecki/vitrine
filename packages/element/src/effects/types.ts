import type { ShaderMountUniforms } from '#paper/shader-mount.js';
import type { PresetDef, VitrineEffect, VitrineParams } from '../types.js';

export interface EffectTextures {
  image?: HTMLImageElement;
  noise?: HTMLImageElement;
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
  /** 1:1 port of the React component's props → uniforms mapping. */
  toUniforms(params: VitrineParams, textures: EffectTextures): ShaderMountUniforms;
}
