import { useEffect } from 'react';
import { registerVitrine } from './register.js';
import type {
  GlassImageProps,
  HeroShaderProps,
  ImageShaderProps,
  LoupeImageProps,
  PreorderGlassImageProps,
  ShaderElementProps,
  StorefrontImage,
} from './types.js';

function attrs(p: ShaderElementProps) {
  return {
    ...(p.preset !== undefined ? { preset: p.preset } : {}),
    ...(p.params !== undefined ? { params: JSON.stringify(p.params) } : {}),
    ...(p.speed !== undefined ? { speed: p.speed } : {}),
    ...(p.debug ? { debug: '' as const } : {}),
    ...(p.id !== undefined ? { id: p.id } : {}),
    ...(p.className !== undefined ? { className: p.className } : {}),
    ...(p.style !== undefined ? { style: p.style } : {}),
  };
}

function useVitrine(): void {
  useEffect(() => {
    void registerVitrine();
  }, []);
}

function ContentImage({
  image,
  imgProps,
}: {
  image: StorefrontImage;
  imgProps?: ImageShaderProps['imgProps'];
}) {
  return (
    <img
      {...imgProps}
      src={image.url}
      alt={image.altText ?? ''}
      {...(image.width ? { width: image.width } : {})}
      {...(image.height ? { height: image.height } : {})}
    />
  );
}

type AnyImageProps = Omit<ImageShaderProps, 'effect'> & {
  effect: 'dither' | 'halftone' | 'paper' | 'glass' | 'lens';
  bind?: string;
};

function ImageShader({ effect, reveal, bind, image, imgProps, children, ...rest }: AnyImageProps) {
  useVitrine();
  return (
    <vitrine-shader
      effect={effect}
      {...(reveal ? { reveal } : {})}
      {...(bind ? { bind } : {})}
      {...attrs(rest)}
    >
      {children ?? <ContentImage image={image} imgProps={imgProps} />}
    </vitrine-shader>
  );
}

/**
 * Product card / product page media: `image-dithering` (or `halftone`) over the product image, photo revealed
 * on hover, tap or focus of the nearest link. Server HTML = `<vitrine-shader><img …></vitrine-shader>`.
 */
export function ProductMediaShader({
  effect = 'dither',
  preset = 'newsprint',
  reveal = 'hover',
  ...rest
}: ImageShaderProps) {
  return <ImageShader effect={effect} preset={preset} reveal={reveal} {...rest} />;
}

/** Lookbook / editorial image: `paper-texture` on the photo (folds, grain, light angle). */
export function EditorialImageShader({
  effect = 'paper',
  preset = 'folded-lookbook',
  reveal = 'hover',
  ...rest
}: ImageShaderProps) {
  return <ImageShader effect={effect} preset={preset} reveal={reveal} {...rest} />;
}

/**
 * Collection banner / hero: animated `mesh-gradient` surface. No image; give it a size with CSS.
 * It is `aria-hidden`: the heading and text belong next to it, not inside.
 */
export function CollectionHeroShader({
  preset = 'drop-night',
  colors,
  params,
  children,
  ...rest
}: HeroShaderProps) {
  useVitrine();
  const merged = colors ? { ...(params ?? {}), colors } : params;
  return (
    <vitrine-shader
      effect="mesh"
      aria-hidden="true"
      {...attrs({ ...rest, preset, ...(merged ? { params: merged } : {}) })}
    >
      {children}
    </vitrine-shader>
  );
}

/**
 * v0.2 · Product card behind reeded shop-window glass (`fluted-glass`, preset `window`). At rest the glass is a baked
 * image (no WebGL context); hover, tap or keyboard focus slides it away on one short-lived context.
 */
export function GlassProductImage({ preset = 'window', reveal = 'hover', ...rest }: GlassImageProps) {
  return <ImageShader effect="glass" preset={preset} reveal={reveal} {...rest} />;
}

/**
 * v0.2 · Pre-order card: the same glass, frosted by the days left to `releaseDate` (30 → 7 → 1 day → clear).
 * Computed once in the browser and baked; the server sends the plain image. Clear on and after the release.
 */
export function PreorderGlassImage({
  releaseDate,
  preorderFrom,
  preset = 'window',
  reveal,
  ...rest
}: PreorderGlassImageProps) {
  const bind = JSON.stringify({
    date: preorderFrom ? { from: preorderFrom, to: releaseDate } : { to: releaseDate },
  });
  return <ImageShader effect="glass" preset={preset} bind={bind} {...(reveal ? { reveal } : {})} {...rest} />;
}

/**
 * v0.2 · Product page image with a loupe under the pointer (`lens-distortion`, preset `loupe`). Mouse/pen over the
 * image or a touch held still shows it; nothing (and no WebGL context) otherwise. Decoration: the image keeps its alt.
 */
export function LoupeImage({ preset = 'loupe', loupeSize, zoom, params, ...rest }: LoupeImageProps) {
  const merged =
    loupeSize !== undefined || zoom !== undefined
      ? {
          ...(params ?? {}),
          ...(loupeSize !== undefined ? { loupeSize } : {}),
          ...(zoom !== undefined ? { zoom } : {}),
        }
      : params;
  return (
    <ImageShader
      effect="lens"
      preset={preset}
      bind="pointer"
      {...(merged ? { params: merged } : {})}
      {...rest}
    />
  );
}
