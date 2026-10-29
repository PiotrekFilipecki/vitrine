# VITRINE

Paper Shaders for Shopify themes and headless storefronts: a `<vitrine-shader>` custom element that prints the product
image your page already renders, in dithering, halftone, mesh gradient or paper texture, and gives the photo back on
hover, tap or focus. Works in Liquid themes, plain HTML and React 19 / Next.js from one runtime.

![A dithered product card turns into the photo on hover](docs/media/vitrine-card-reveal.gif)

Powered by [Paper Shaders](https://shaders.paper.design) (`@paper-design/shaders` 0.0.82, Apache-2.0). Demo catalogue:
NIWWTS edition No.06, prints and tees by Piotr Filipecki.

## Why

- **The image stays the content.** The `<img>` is what loads first, what LCP measures, what screen readers and search
  engines get, and what remains without WebGL2 or CORS. The effect is an `aria-hidden` layer on top of it.
- **Twenty-four cards, zero live WebGL contexts.** Static effects are rendered once through one shared off-screen
  context per effect, copied to an image and cached. Browsers evict contexts after about sixteen; a product grid never
  gets near that. Animated effects (the hero) live in a small LRU pool and mount only in the viewport.
- **One set of presets for every stack.** `presets/*.json` were tuned on the Paper canvas and feed the element, the
  Liquid section schemas and the React wrappers.

## Install

### Shopify theme (Online Store 2.0, tested on Horizon 4.3.0)

1. Copy `shopify-theme/assets`, `sections` and `snippets` into your theme.
2. Paste the object from `shopify-theme/settings_schema.fragment.json` into `config/settings_schema.json`.
3. Wrap the card image: in Horizon `snippets/product-media.liquid` lines 40–54 render `vitrine-card-media` when
   `preview_image_only` is true, and add `data-vitrine-card` to `<product-card>` in `snippets/product-card.liquid`.
4. `shopify theme push --unpublished`, then add **VITRINE hero (mesh)** and **VITRINE editorial (paper)** in the editor.

Details, Dawn notes and the settings → parameter map: [`shopify-theme/README.md`](shopify-theme/README.md).

![Changing a hero colour in the Shopify theme editor re-renders the mesh live](docs/media/vitrine-theme-editor.gif)

### React 19 / Next.js

```tsx
import { ProductMediaShader } from 'vitrine-shaders/react';

<Link href={`/products/${product.handle}`}>
  <ProductMediaShader image={product.featuredImage} effect="dither" preset="newsprint" reveal="hover">
    <Image
      src={product.featuredImage.url}
      alt={product.featuredImage.altText ?? ''}
      width={1600}
      height={1920}
    />
  </ProductMediaShader>
</Link>;
```

The server renders a plain image; the element loads after hydration as its own chunk. `CollectionHeroShader` (mesh)
and `EditorialImageShader` (paper) work the same way. Example app: [`examples/next-headless`](examples/next-headless).

### Plain HTML

```html
<script type="module">
  import 'vitrine-shaders';
</script>

<a href="/products/el-funkador-tee">
  <vitrine-shader effect="dither" preset="newsprint" reveal="hover">
    <img src="tee.webp" alt="EL FUNKADOR tee" width="1600" height="1920" />
  </vitrine-shader>
</a>
```

## API in short

| Attribute | Values                                   | Notes                                                                                |
| --------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `effect`  | `dither` · `halftone` · `mesh` · `paper` | image-dithering, halftone-cmyk, mesh-gradient, paper-texture                         |
| `preset`  | id from `presets/<effect>.json`          | `default` is the upstream default 1:1                                                |
| `params`  | JSON object                              | overrides, same names as `@paper-design/shaders-react` props                         |
| `reveal`  | `hover` · `none`                         | pointer, tap or focus on the nearest `[data-vitrine-card]` or link reveals the photo |
| `speed`   | number                                   | `0` = rendered once, no live context; anything else = animated, pooled               |

Events `vitrine:ready` and `vitrine:fallback`, `data-vitrine-state` on the element, `VitrineShader.config()` for the
pool size. Full reference: [`docs/vitrine/API.md`](docs/vitrine/API.md).

## Performance (measured, Lighthouse mobile, median of 3)

| Page                                               | With VITRINE                  | Without                | LCP delta |
| -------------------------------------------------- | ----------------------------- | ---------------------- | --------- |
| Static HTML, 24 cards + hero (`examples/static`)   | 85 · LCP 1 546 ms · CLS 0.002 | 100 · 1 541 ms · 0.002 | +5 ms     |
| Next.js 16 headless, 24 cards + hero               | 99 · LCP 755 ms · CLS 0       | 100 · 757 ms · 0       | −2 ms     |
| Shopify Horizon collection, 12 cards (CDN preview) | 100 · LCP 1 808 ms · CLS 0    | 99 · 1 938 ms · 0      | −130 ms   |

Bundle, gzip: element core 14.4 KB, dither 2.8 KB, halftone 4.1 KB, mesh 2.1 KB, paper 6.3 KB, noise texture
18.3 KB (halftone and paper only); React wrappers 860 B; single-file `shopify-theme/assets/vitrine.js` 44.0 KB.
Pixel compatibility with `@paper-design/shaders-react`: 0 different pixels on 8 effect/preset cases in Chromium and
WebKit. Numbers and method: `docs/vitrine/devlog/`.

## Limits

- WebGL2 is required for the effect; without it the page shows the image, nothing is logged.
- Cross-origin images need `Access-Control-Allow-Origin` (Shopify's CDN sends `*`); in Next.js `next/image` makes them
  same-origin anyway.
- `prefers-reduced-motion: reduce` turns every effect static and removes the reveal transition.
- Firefox is unmeasured (the Playwright build did not start on the development machine).
- Theme app extension (install without touching theme code) is planned, see `ROADMAP.md`.

## Repo

`packages/element` (the element), `packages/react` (wrappers, published as `vitrine-shaders/react`), `shopify-theme/`
(files to copy), `presets/` (JSON from Paper), `examples/static`, `examples/next-headless`, `docs/` (plan, ADR,
devlogs with every measurement, `process.md` on how the presets and the demo page were made in Paper).

## Licence

Apache-2.0. Paper Shaders' `LICENSE` and `NOTICE` are in `third_party/paper-shaders/` and in the header of every
built file. Powered by Paper Shaders.
