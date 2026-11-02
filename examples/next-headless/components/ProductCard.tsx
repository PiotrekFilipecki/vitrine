import Image from 'next/image';
import Link from 'next/link';
import { GlassProductImage, PreorderGlassImage } from '@vitrine/react';
import { formatPrice, releaseLabel, type Product } from '@/lib/catalog';

const SIZES = '(min-width: 901px) 30vw, 48vw';

/** "11 November" → "11 Nov": cards are narrow (two columns on a phone), the tag stays on one line. */
const shortDate = (label: string) => label.replace(/^(\d+ \w{3}).*$/, '$1');

/** Card crop per photo, as in examples/static (portrait shots 3:4 to 2:3, landscape shots 4:3). */
export function ratioOf(p: Product): string {
  const w = p.image.width ?? 4;
  const h = p.image.height ?? 5;
  const r = w / h;
  if (r >= 1.2) return '4 / 3';
  if (r <= 0.7) return '2 / 3';
  if (r <= 0.76) return '3 / 4';
  return '4 / 5';
}

/**
 * Server Component. The only client code is the wrapper around the image: link, meta and `next/image` are
 * server-rendered. A pre-order product (release date set) gets the frosted glass; everything else the card glass.
 */
export function ProductCard({ product, effects = true }: { product: Product; effects?: boolean }) {
  const { image } = product;
  // The name next to the image says what it is: alt="" avoids reading it twice inside the link.
  const img = (
    <Image src={image.url} alt="" width={image.width ?? 1600} height={image.height ?? 2000} sizes={SIZES} />
  );
  const style = { '--ratio': ratioOf(product) } as React.CSSProperties;
  const media = !effects ? (
    <span className="shot" style={style}>
      {img}
    </span>
  ) : product.releaseDate ? (
    <PreorderGlassImage image={image} releaseDate={product.releaseDate} className="shot" style={style}>
      {img}
    </PreorderGlassImage>
  ) : (
    <GlassProductImage image={image} className="shot" style={style}>
      {img}
    </GlassProductImage>
  );
  return (
    <article className="card">
      <Link className="card__link" href={`/products/${product.handle}`}>
        {media}
        <span className="card__meta">
          <span className="card__name">{product.title}</span>
          <span className="price">{formatPrice(product.price)}</span>
        </span>
        <span className="card__note">{product.note}</span>
        {product.releaseDate ? (
          <span className="card__tag">Pre-order · {shortDate(releaseLabel(product.releaseDate))}</span>
        ) : null}
      </Link>
    </article>
  );
}
