import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LoupeImage } from '@vitrine/react';
import { formatPrice, getProduct, getProducts, releaseLabel } from '@/lib/catalog';

export const revalidate = 300;

type Params = Promise<{ handle: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProduct((await params).handle);
  return { title: product ? product.title : 'Not found' };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ vitrine?: string }>;
}) {
  const [{ handle }, { vitrine }] = await Promise.all([params, searchParams]);
  const [product, all] = await Promise.all([getProduct(handle), getProducts(12)]);
  if (!product) notFound();
  const effects = vitrine !== 'off';
  const { image } = product;
  const next = all[(all.findIndex((p) => p.handle === product.handle) + 1) % all.length];
  const img = (
    <Image
      src={image.url}
      alt={image.altText ?? ''}
      width={image.width ?? 1600}
      height={image.height ?? 2000}
      sizes="(min-width: 901px) 58vw, 100vw"
      quality={85}
      priority
    />
  );

  return (
    <div className="pdp">
      <div className="pdp__media">
        {effects ? (
          <LoupeImage image={image} className="shot">
            {img}
          </LoupeImage>
        ) : (
          <span className="shot">{img}</span>
        )}
      </div>
      <div className="pdp__info">
        <nav aria-label="Breadcrumb">
          <ol className="crumbs">
            <li>
              <Link href="/">Store</Link>
            </li>
            <li>
              <Link href="/#objects">Objects</Link>
            </li>
            <li aria-current="page">{product.title}</li>
          </ol>
        </nav>
        <h1>{product.title}</h1>
        <div className="product-line">
          <span>{product.note}</span>
          <span className="price">{formatPrice(product.price)}</span>
        </div>
        <p className="pdp__desc">{product.description}</p>
        {product.spec ? <p className="pdp__spec">{product.spec}</p> : null}
        {product.releaseDate ? (
          <p className="pdp__spec">Pre-order · ships {releaseLabel(product.releaseDate)}</p>
        ) : null}
        <div>
          <button className="buy" type="button">
            {product.releaseDate ? 'Pre-order' : 'Add to cart'}{' '}
            <span className="price">{formatPrice(product.price)}</span>
          </button>
        </div>
        <p className="pdp__hint">
          <span className="hint--mouse">Move over the photograph to look closer.</span>
          <span className="hint--touch">Hold a finger on the photograph to look closer.</span>
        </p>
        {next ? (
          <p className="pdp__more">
            Next: <Link href={`/products/${next.handle}`}>{next.title}</Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
