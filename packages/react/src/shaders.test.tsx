import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { CollectionHeroShader, EditorialImageShader, ProductMediaShader } from './index.js';

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
