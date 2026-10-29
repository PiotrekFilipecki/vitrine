import Image from 'next/image';
import Link from 'next/link';
import { ProductMediaShader } from '@vitrine/react';
import { displayTitle, formatPrice, type Product } from '@/lib/catalog';

const SIZES = '(max-width: 900px) 50vw, 25vw';
const LEAD_SIZES = '(max-width: 900px) 100vw, 50vw';

/**
 * Server Component. The only client code here is the wrapper around the image: the link, the meta and
 * `next/image` itself are server-rendered, so a card costs no JS beyond the element.
 */
export function ProductCard({
  product,
  lead = false,
  priority = false,
  effects = true,
}: {
  product: Product;
  lead?: boolean;
  priority?: boolean;
  effects?: boolean;
}) {
  const { image } = product;
  const img = (
    <Image
      src={image.url}
      alt={image.altText ?? ''}
      width={image.width ?? 1600}
      height={image.height ?? 1920}
      sizes={lead ? LEAD_SIZES : SIZES}
      priority={priority}
    />
  );
  return (
    <li className={lead ? 'cell cell--lead' : 'cell'}>
      <Link className="card" href={`/products/${product.handle}`}>
        {effects ? (
          <ProductMediaShader image={image} effect="dither" preset="newsprint" reveal="hover">
            {img}
          </ProductMediaShader>
        ) : (
          <span className="card__media">{img}</span>
        )}
        <span className="card__meta">
          <span className="card__code">
            {product.code ?? '—'} · {product.productType}
          </span>
          <span className="card__title">{displayTitle(product.title)}</span>
          <span className="card__price">{formatPrice(product.price)}</span>
        </span>
      </Link>
    </li>
  );
}
