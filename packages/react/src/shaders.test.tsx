import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import {
  CollectionHeroShader,
  EditorialImageShader,
  GlassProductImage,
  LoupeImage,
  PreorderGlassImage,
  ProductMediaShader,
} from './index.js';
import { parseBind } from 'vitrine-shaders';

// React 19 emits a <link rel="preload" as="image"> hint for eager images; the element tree is what we assert.
const strip = (html: string) => html.replace(/<link rel="preload"[^>]*\/>/g, '');

const image = {
  url: 'https://cdn.shopify.com/s/files/1/0000/0000/files/tee.webp',
  altText: 'EL FUNKADOR tee',
  width: 1600,
  height: 1920,
};

describe('server render (no DOM, no vitrine-shaders runtime)', () => {
  // TEST: the server sends a working <img> with alt/width/height inside the element, nothing else
  it('ProductMediaShader renders <vitrine-shader effect=dither preset=newsprint reveal=hover> with a plain <img>', () => {
    const html = strip(renderToStaticMarkup(<ProductMediaShader image={image} />));
    expect(html).toBe(
      '<vitrine-shader effect="dither" reveal="hover" preset="newsprint">' +
        '<img src="https://cdn.shopify.com/s/files/1/0000/0000/files/tee.webp" alt="EL FUNKADOR tee" width="1600" height="1920"/>' +
        '</vitrine-shader>'
    );
  });

  // TEST: params object becomes the JSON `params` attribute; className becomes class; img passthrough works
  it('serialises params, maps className to class and passes img attributes through', () => {
    const html = renderToStaticMarkup(
      <ProductMediaShader
        image={image}
        effect="halftone"
        preset="riso"
        params={{ size: 3, colorSteps: 2 }}
        className="card__media"
        speed={0}
        imgProps={{ loading: 'eager', fetchPriority: 'high', sizes: '(max-width: 900px) 50vw, 25vw' }}
      />
    );
    expect(html).toContain('<vitrine-shader effect="halftone" reveal="hover" preset="riso"');
    expect(html).toContain('params="{&quot;size&quot;:3,&quot;colorSteps&quot;:2}"');
    expect(html).toContain('class="card__media"');
    expect(html).toContain('speed="0"');
    expect(html).toContain(
      '<img loading="eager" fetchPriority="high" sizes="(max-width: 900px) 50vw, 25vw" src='
    );
  });

  // TEST: null altText (Storefront API) renders alt="" instead of omitting alt
  it('renders alt="" for a null altText and omits width/height when unknown', () => {
    const html = renderToStaticMarkup(
      <ProductMediaShader image={{ url: '/p.webp', altText: null, width: null, height: null }} />
    );
    expect(html).toContain('<img src="/p.webp" alt=""/>');
  });

  // TEST: children replace the default <img> (next/image path)
  it('children replace the default image', () => {
    const html = renderToStaticMarkup(
      <ProductMediaShader image={image}>
        <img src="/_next/image?url=x" alt="custom" width="800" height="960" />
      </ProductMediaShader>
    );
    expect(html).toContain('<img src="/_next/image?url=x" alt="custom" width="800" height="960"/>');
    expect(html).not.toContain('cdn.shopify.com');
  });

  // TEST: editorial defaults = paper / folded-lookbook
  it('EditorialImageShader defaults to paper / folded-lookbook', () => {
    const html = renderToStaticMarkup(<EditorialImageShader image={image} reveal="none" />);
    expect(html).toContain('<vitrine-shader effect="paper" reveal="none" preset="folded-lookbook"');
  });

  // TEST: hero is mesh, aria-hidden, no image, colors shortcut lands in params
  it('CollectionHeroShader renders an aria-hidden mesh with colors in params', () => {
    const html = renderToStaticMarkup(
      <CollectionHeroShader colors={['#151311', '#3a4df0']} className="hero__field" />
    );
    expect(html).toBe(
      '<vitrine-shader effect="mesh" aria-hidden="true" preset="drop-night" params="{&quot;colors&quot;:[&quot;#151311&quot;,&quot;#3a4df0&quot;]}" class="hero__field"></vitrine-shader>'
    );
  });

  // TEST: hydration markup (renderToString) is identical in structure, no extra wrappers
  it('renderToString produces the same element tree', () => {
    const html = strip(renderToString(<ProductMediaShader image={image} />));
    expect(html.startsWith('<vitrine-shader effect="dither"')).toBe(true);
    expect(html).toContain('<img src=');
  });
});

describe('v0.2 wrappers (ADR-0003): server render', () => {
  const photo = {
    url: '/fixtures/products/w1000/04-chair.webp',
    altText: 'Bar stool',
    width: 1000,
    height: 1250,
  };

  // TEST: the card is glass/window with hover reveal and a plain <img> inside
  it('GlassProductImage renders <vitrine-shader effect=glass reveal=hover preset=window> with the image', () => {
    const html = strip(renderToStaticMarkup(<GlassProductImage image={photo} />));
    expect(html).toBe(
      '<vitrine-shader effect="glass" reveal="hover" preset="window">' +
        '<img src="/fixtures/products/w1000/04-chair.webp" alt="Bar stool" width="1000" height="1250"/>' +
        '</vitrine-shader>'
    );
  });

  // TEST: reveal="tap" passes through
  it('GlassProductImage passes reveal="tap"', () => {
    expect(renderToStaticMarkup(<GlassProductImage image={photo} reveal="tap" />)).toContain('reveal="tap"');
  });

  // TEST: releaseDate/preorderFrom serialise to a bind the element parses to the same dates; no reveal by default
  it('PreorderGlassImage writes a bind the element reads back', () => {
    const html = renderToStaticMarkup(
      <PreorderGlassImage image={photo} releaseDate="2026-12-01" preorderFrom="2026-11-10" />
    );
    expect(html).toContain('effect="glass"');
    expect(html).not.toContain('reveal=');
    const bind = /bind="([^"]+)"/.exec(html)![1]!.replace(/&quot;/g, '"');
    expect(parseBind(bind)).toEqual({
      kind: 'date',
      to: Date.UTC(2026, 11, 1),
      from: Date.UTC(2026, 10, 10),
    });
    const single = renderToStaticMarkup(<PreorderGlassImage image={photo} releaseDate="2026-12-01" />);
    const b2 = /bind="([^"]+)"/.exec(single)![1]!.replace(/&quot;/g, '"');
    expect(parseBind(b2)).toEqual({ kind: 'date', to: Date.UTC(2026, 11, 1), from: null });
  });

  // TEST: the loupe binds the pointer and folds loupeSize/zoom into params
  it('LoupeImage renders lens/loupe bound to the pointer, shortcuts land in params', () => {
    const html = renderToStaticMarkup(<LoupeImage image={photo} zoom={3} />);
    expect(html).toContain('<vitrine-shader effect="lens" bind="pointer" preset="loupe"');
    expect(html).toContain('params="{&quot;zoom&quot;:3}"');
    expect(html).toContain('alt="Bar stool"');
  });

  // TEST: v0.1 wrappers are unchanged by v0.2 (backwards compatibility)
  it('keeps the v0.1 ProductMediaShader output byte-for-byte', () => {
    expect(strip(renderToStaticMarkup(<ProductMediaShader image={photo} />))).toBe(
      '<vitrine-shader effect="dither" reveal="hover" preset="newsprint">' +
        '<img src="/fixtures/products/w1000/04-chair.webp" alt="Bar stool" width="1000" height="1250"/>' +
        '</vitrine-shader>'
    );
  });
});
