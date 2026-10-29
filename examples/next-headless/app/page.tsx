import Image from 'next/image';
import { CollectionHeroShader, EditorialImageShader } from '@vitrine/react';
import { ProductCard } from '@/components/ProductCard';
import { catalogSource, getProducts } from '@/lib/catalog';
import { EDITORIAL } from '@/lib/fixtures';

export const revalidate = 300;

/** `?vitrine=off` renders the same page without the element (Lighthouse comparison, PROMPTY R3). */
export default async function Home({ searchParams }: { searchParams: Promise<{ vitrine?: string }> }) {
  const [{ vitrine }, products] = await Promise.all([searchParams, getProducts(24)]);
  const effects = vitrine !== 'off';
  const editorial = (
    <Image
      src={EDITORIAL.url}
      alt={EDITORIAL.altText}
      width={EDITORIAL.width}
      height={EDITORIAL.height}
      sizes="(max-width: 900px) 100vw, 38vw"
    />
  );

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        {effects ? (
          <CollectionHeroShader id="hero" className="hero__field" preset="drop-night" />
        ) : (
          <div id="hero" className="hero__field" aria-hidden="true" />
        )}
        <div className="hero__plate">
          <h1 id="hero-title" className="hero__title">
            No.06
          </h1>
          <p className="hero__lede">
            Twenty-four pieces printed in two tones. Hover or tab onto a card and the print gives way to the
            photo.
          </p>
        </div>
      </section>

      <section id="catalogue" className="catalogue" aria-labelledby="catalogue-title">
        <div className="catalogue__head">
          <h2 id="catalogue-title" className="catalogue__title">
            Catalogue
          </h2>
          <p className="catalogue__count">
            {products.length} items · dither / newsprint · baked once, zero live WebGL contexts ·{' '}
            {catalogSource() === 'storefront' ? 'Storefront API' : 'fixtures'}
          </p>
        </div>
        <ul className="grid">
          {products.map((p, i) => (
            <ProductCard
              key={`${p.handle}-${i}`}
              product={p}
              lead={i === 0}
              priority={i < 4}
              effects={effects}
            />
          ))}
          <li className="cell cell--plate" aria-label="About this grid">
            <p className="plate__text">
              Twenty-four cards, one shared WebGL context, printed once and cached. The photo underneath is
              the content; the print is a layer on top of it. Hover, tap or Tab.
            </p>
            <p className="plate__meta">dither · newsprint · 8×8 Bayer · 2 tones</p>
          </li>
        </ul>
      </section>

      <section className="editorial" aria-labelledby="editorial-title">
        <figure className="editorial__figure">
          {effects ? (
            <EditorialImageShader image={EDITORIAL} preset="folded-lookbook" reveal="hover">
              {editorial}
            </EditorialImageShader>
          ) : (
            <span className="editorial__media">{editorial}</span>
          )}
          <figcaption className="editorial__caption">
            paper / folded-lookbook · hover for the still
          </figcaption>
        </figure>
        <div className="editorial__text">
          <p className="editorial__code">PC-008 · Halftone Collage · 2026</p>
          <h2 id="editorial-title" className="editorial__title">
            EL
            <br />
            FUNKADOR
          </h2>
          <p className="editorial__body">
            Nº 01 of the NIWWTS Lucha Federation. An anonymous strongman, photographed in 1905, drafted
            seventy years later into a fight he never agreed to. The mask was baked into the print before the
            halftone pass - he has always been wearing it. Three of him dive across a scrolling wall of type
            because the main event never books just one. Tap the floor and somebody takes the bump.
          </p>
        </div>
      </section>
    </>
  );
}
