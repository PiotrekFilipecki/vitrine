'use client';
/**
 * vitrine-shaders/react: typed React 19 wrappers over <vitrine-shader> for headless storefronts (Next.js App Router).
 * Server render sends a plain <img>; the element loads after hydration. Powered by Paper Shaders (Apache-2.0).
 */
import './jsx.js';

export {
  ProductMediaShader,
  CollectionHeroShader,
  EditorialImageShader,
  GlassProductImage,
  PreorderGlassImage,
  LoupeImage,
} from './shaders.js';
export { registerVitrine } from './register.js';
export type {
  StorefrontImage,
  ImageShaderProps,
  HeroShaderProps,
  ShaderElementProps,
  ImgPassthrough,
  GlassImageProps,
  PreorderGlassImageProps,
  LoupeImageProps,
  VitrineShaderIntrinsicProps,
} from './types.js';
export type { VitrineEffect, VitrineParams, VitrineReveal } from 'vitrine-shaders';
