import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductMediaShader } from '@vitrine/react';
import { displayTitle, formatPrice, getProduct } from '@/lib/catalog';

export const revalidate = 300;

type Params = Promise<{ handle: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProduct((await params).handle);
  return { title: product ? displayTitle(product.title) : 'Not found' };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ vitrine?: string }>;
}) {
  const [{ handle }, { vitrine }] = await Promise.all([params, searchParams]);
  const product = await getProduct(handle);
  if (!product) notFound();
  const effects = vitrine !== 'off';
  const { image } = product;
  const img = (
    <Image
      src={image.url}
      alt={image.altText ?? ''}
      width={image.width ?? 1600}
      height={image.height ?? 1920}
      sizes="(max-width: 900px) 100vw, 62vw"
      priority
    />
  );

  return (
    <article className="product" aria-labelledby="product-title">
      <figure className="product__media">
        {effects ? (
          <ProductMediaShader image={image} effect="halftone" preset="riso" reveal="hover">
            {img}
          </ProductMediaShader>
        ) : (
          <span className="product__plain">{img}</span>
        )}
        <figcaption className="product__caption">
          halftone / riso · hover, tap or focus for the photo
        </figcaption>
      </figure>
      <div className="product__text" data-vitrine-card>
        <p className="product__code">
          {product.code ?? '—'} · {product.productType}
        </p>
        <h1 id="product-title" className="product__title">
          {displayTitle(product.title)}
        </h1>
        <p className="product__price">{formatPrice(product.price)}</p>
        <p className="product__body">{product.description}</p>
        <Link className="product__back" href="/#catalogue">
          Back to the catalogue
        </Link>
      </div>
    </article>
  );
}
