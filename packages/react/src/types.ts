import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from 'react';
import type { VitrineEffect, VitrineParams, VitrineReveal } from 'vitrine-shaders';

/** The shape of `Image` in the Storefront API (`url`, `altText`, `width`, `height`); `next/image` data fits too. */
export interface StorefrontImage {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

/** Attributes passed through to the default `<img>` (everything except what the image object already defines). */
export type ImgPassthrough = Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'alt' | 'width' | 'height'>;

export interface ShaderElementProps {
  /** Preset id from `presets/<effect>.json`; unknown ids fall back to `default`. */
  preset?: string;
  /** Overrides on top of the preset, same names as `@paper-design/shaders-react` props. Serialised to the `params` attribute. */
  params?: VitrineParams;
  /** `speed` attribute: 0 = baked once, anything else = animated in the live pool. */
  speed?: number;
  /** Warn in the console on fallbacks. */
  debug?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

export interface ImageShaderProps extends ShaderElementProps {
  image: StorefrontImage;
  effect?: Extract<VitrineEffect, 'dither' | 'halftone' | 'paper'>;
  reveal?: VitrineReveal;
  /** Extra attributes for the default `<img>`: `loading`, `fetchPriority`, `sizes`, `srcSet`, `className`… */
  imgProps?: ImgPassthrough;
  /**
   * Replaces the default `<img>`: pass your own `<img>` or `next/image`. It must render a plain `<img>` as the
   * element's direct child with `alt`, `width` and `height` (that is what the server sends and what LCP measures).
   */
  children?: ReactNode;
}

export interface HeroShaderProps extends ShaderElementProps {
  /** Shortcut for `params.colors` (mesh-gradient takes up to 10 colours). */
  colors?: string[];
  /** Content rendered inside the element (the element itself is `aria-hidden`; put text next to it, not in it). */
  children?: ReactNode;
}

/** Props for the `<vitrine-shader>` intrinsic element (attributes, as the element reads them). */
export interface VitrineShaderIntrinsicProps extends React.HTMLAttributes<HTMLElement> {
  effect: VitrineEffect;
  preset?: string;
  params?: string;
  reveal?: VitrineReveal;
  speed?: number | string;
  debug?: boolean | '';
  children?: ReactNode;
}
