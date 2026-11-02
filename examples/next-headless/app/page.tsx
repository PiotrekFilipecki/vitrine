import Image from 'next/image';
import Link from 'next/link';
import { GlassProductImage, PreorderGlassImage } from '@vitrine/react';
import { ProductCard } from '@/components/ProductCard';
import { formatPrice, getProducts, releaseLabel, type Product } from '@/lib/catalog';

export const revalidate = 300;

const HERO_ID = '04-chair';
/** Same column order as examples/static: colour spread so no two quiet beige photos sit side by side. */
const COLUMNS = [
  ['08-headphones', '01-vase', '09-mug', '10-sunglasses'],
  ['05-lamp', '11-candle', '03-sneaker', '12-plant'],
  ['02-perfume', '07-bag', '04-chair', '06-watch'],
];
const SCALE = [
  [30, '30 days out'],
  [7, '7 days out'],
  [1, '1 day out'],
  [0, 'Release day'],
] as const;

function columns(products: Product[]): Product[][] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const fixed = COLUMNS.map((col) => col.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p)));
  if (fixed.flat().length === products.length) return fixed;
  // Store catalogue (other ids): deal the cards round-robin into three columns.
  const out: Product[][] = [[], [], []];
  products.forEach((p, i) => out[i % 3]!.push(p));
  return out;
}

/** `?vitrine=off` renders the same page without the element (Lighthouse comparison). */
export default async function Home({ searchParams }: { searchParams: Promise<{ vitrine?: string }> }) {
  const [{ vitrine }, products] = await Promise.all([searchParams, getProducts(12)]);
  const effects = vitrine !== 'off';
  const hero = products.find((p) => p.id === HERO_ID) ?? products[0]!;
  const preorder = products.find((p) => p.releaseDate) ?? null;
  const now = Date.now();
  const heroImg = (
    <Image
      src={hero.image.url}
      alt={hero.image.altText ?? ''}
      width={hero.image.width ?? 1600}
      height={hero.image.height ?? 2000}
      sizes="(min-width: 901px) 54vw, 100vw"
      priority
    />
  );

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__head">
          <p className="label">New in the window</p>
          <h1 id="hero-title">
            Look
            <br />
            through
            <br />
            the glass.
          </h1>
        </div>
        <Link className="hero__photo" href={`/products/${hero.handle}`}>
          {effects ? (
            <GlassProductImage image={hero.image} className="shot" params={{ doors: true }}>
              {heroImg}
            </GlassProductImage>
          ) : (
            <span className="shot">{heroImg}</span>
          )}
          <span className="visually-hidden">
            {hero.title}, {formatPrice(hero.price)}
          </span>
        </Link>
        <div className="hero__body">
          <div className="product-line">
            <span>
              <b>{hero.title}</b> · {hero.note}
            </span>
            <span className="price">{formatPrice(hero.price)}</span>
          </div>
          <p className="lede">
            One object at a time, behind reeded glass, like a shop window on a quiet street.
          </p>
          <p className="hint hint--mouse">Move over the photograph and the glass parts where you point.</p>
          <p className="hint hint--touch">Tap the photograph and the glass opens.</p>
        </div>
      </section>

      <section className="section" id="objects" aria-labelledby="objects-title">
        <div className="section__head">
          <h2 id="objects-title">
            Objects<sup>{products.length}</sup>
          </h2>
          <p>
            Every card stands behind the same glass. Point at it, tap it or reach it with Tab, and the pane
            slides out of the way.
          </p>
        </div>
        <div className="catalogue">
          {columns(products).map((col, i) => (
            <div className="catalogue__col" key={i}>
              {col.map((p) => (
                <ProductCard key={p.handle} product={p} effects={effects} />
              ))}
            </div>
          ))}
        </div>
      </section>

      {preorder?.releaseDate ? (
        <section className="section" id="pre-order" aria-labelledby="preorder-title">
          <div className="preorder">
            <Link className="preorder__card card__link" href={`/products/${preorder.handle}`}>
              {effects ? (
                <PreorderGlassImage
                  image={preorder.image}
                  releaseDate={preorder.releaseDate}
                  className="shot"
                >
                  <Image
                    src={preorder.image.url}
                    alt={preorder.image.altText ?? ''}
                    width={preorder.image.width ?? 1600}
                    height={preorder.image.height ?? 2000}
                    sizes="(min-width: 901px) 46vw, 100vw"
                  />
                </PreorderGlassImage>
              ) : null}
              <span className="visually-hidden">
                {preorder.title}, pre-order, {formatPrice(preorder.price)}
              </span>
            </Link>
            <div className="preorder__text">
              <p className="label">Pre-order</p>
              <h2 id="preorder-title" className="visually-hidden">
                {preorder.title}, pre-order
              </h2>
              <p className="preorder__date">
                Ships
                <br />
                {releaseLabel(preorder.releaseDate).replace(/^(\d+ \w{3}).*$/, '$1')}
              </p>
              <div className="product-line">
                <span>
                  <b>{preorder.title}</b> · {preorder.note}
                </span>
                <span className="price">{formatPrice(preorder.price)}</span>
              </div>
              <p className="lede">
                The glass clears a little every day until the release. A month out you see a shape; on the
                day, the shoe.
              </p>
              {effects ? (
                <ol className="scale" aria-label="How the glass clears">
                  {SCALE.map(([days, label]) => (
                    <li key={days}>
                      <figure>
                        <PreorderGlassImage
                          image={{ ...preorder.image, altText: '' }}
                          releaseDate={new Date(now + days * 86_400_000 - (days === 0 ? 3_600_000 : 0))
                            .toISOString()
                            .replace(/\.\d+Z$/, 'Z')}
                          className="shot"
                        >
                          <Image
                            src={preorder.image.url}
                            alt=""
                            width={preorder.image.width ?? 1600}
                            height={preorder.image.height ?? 2000}
                            sizes="120px"
                          />
                        </PreorderGlassImage>
                        <figcaption>{label}</figcaption>
                      </figure>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
