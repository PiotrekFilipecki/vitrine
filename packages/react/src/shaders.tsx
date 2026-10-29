import { useEffect } from 'react';
import { registerVitrine } from './register.js';
import type { HeroShaderProps, ImageShaderProps, ShaderElementProps, StorefrontImage } from './types.js';

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

function ImageShader({
  effect,
  reveal,
  image,
  imgProps,
  children,
  ...rest
}: ImageShaderProps & { effect: NonNullable<ImageShaderProps['effect']> }) {
  useVitrine();
  return (
    <vitrine-shader effect={effect} {...(reveal ? { reveal } : {})} {...attrs(rest)}>
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
