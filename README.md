<p align="center">
  <img src="docs/media/readme-hero.jpg" alt="VITRINE demo hero: an ink plate with the words Print it once over an animated mesh gradient" width="100%" />
</p>

<h1 align="center">VITRINE</h1>

<p align="center">
  Paper Shaders for Shopify themes and headless storefronts.<br />
  One <code>&lt;vitrine-shader&gt;</code> element for Liquid, React 19 / Next.js and plain HTML.
</p>

<p align="center">
  <a href="LICENSE"><img alt="Apache-2.0" src="https://img.shields.io/badge/licence-Apache--2.0-151311?style=flat-square" /></a>
  <img alt="Paper Shaders 0.0.82" src="https://img.shields.io/badge/%40paper--design%2Fshaders-0.0.82-3A4DF0?style=flat-square" />
  <img alt="Shopify Horizon 4.3.0" src="https://img.shields.io/badge/Shopify-Horizon%204.3.0-F1ECE2?style=flat-square&labelColor=151311" />
  <img alt="React 19 / Next 16" src="https://img.shields.io/badge/React%2019-Next%2016-F1ECE2?style=flat-square&labelColor=151311" />
  <img alt="0 live contexts" src="https://img.shields.io/badge/24%20cards-0%20live%20WebGL%20contexts-F2861E?style=flat-square&labelColor=151311" />
</p>

<p align="center">
  <img src="docs/media/vitrine-card-reveal.gif" alt="A dithered product card turns into the photo on hover" width="800" />
</p>

VITRINE prints the product image your page already renders, in dithering, halftone, mesh gradient or paper texture,
and gives the photo back on hover, tap or focus. The `<img>` stays the content; the print is a layer on top of it.
Built on [Paper Shaders](https://shaders.paper.design) (Apache-2.0). Demo catalogue: NIWWTS edition No.06, prints
and tees by Piotr Filipecki.

## Four effects, one element

<p align="center">
  <img src="docs/media/readme-effects.jpg" alt="The four effects on NIWWTS pieces: dither newsprint, halftone riso, mesh drop-night, paper folded-lookbook" width="100%" />
</p>

| `effect`   | Paper shader    | Preset that ships                              | Where it goes   | Rendered     |
| ---------- | --------------- | ---------------------------------------------- | --------------- | ------------ |
| `dither`   | image-dithering | `newsprint` (8×8 Bayer, 3 tones, ink on paper) | product cards   | once, cached |
| `halftone` | halftone-cmyk   | `riso` (orange + ink, no cyan)                 | product page    | once, cached |
| `mesh`     | mesh-gradient   | `drop-night` / `acid-night`                    | collection hero | live, pooled |
| `paper`    | paper-texture   | `folded-lookbook` (one fold, light from 300°)  | editorial image | once, cached |

Presets live in [`presets/*.json`](presets) and feed the element, the Liquid section schemas and the React wrappers.
`params` overrides use the same prop names as `@paper-design/shaders-react`.

## Quick start

### Shopify theme (Online Store 2.0, tested on Horizon 4.3.0)

```liquid
{% render 'vitrine-card-media', image: card_product.featured_media, sizes: '(min-width: 990px) 25vw, 50vw' %}
```

1. Copy `shopify-theme/assets`, `sections` and `snippets` into your theme.
2. Paste the object from `shopify-theme/settings_schema.fragment.json` into `config/settings_schema.json`.
3. Wrap the card image with the snippet (Horizon: `snippets/product-media.liquid`, lines 40–54, when
   `preview_image_only`), and add `data-vitrine-card` to `<product-card>` in `snippets/product-card.liquid`.
4. `shopify theme push --unpublished`, then add **VITRINE hero (mesh)** and **VITRINE editorial (paper)** in the editor.

Full install, Dawn notes and the settings → parameter map: [`shopify-theme/README.md`](shopify-theme/README.md).

<p align="center">
  <img src="docs/media/vitrine-theme-editor.gif" alt="Changing a hero colour in the Shopify theme editor re-renders the mesh live" width="800" />
</p>

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

The server renders a plain image; the element loads after hydration as its own chunk (the wrapper is 860 B gzip).
`CollectionHeroShader` (mesh) and `EditorialImageShader` (paper) work the same way. Example:
[`examples/next-headless`](examples/next-headless).

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

## How it works

- **The image stays the content.** It is what loads first, what LCP measures, what screen readers and search engines
  get, and what remains without WebGL2 or CORS. The effect is an `aria-hidden` layer on top of it.
- **Printed once, zero live contexts.** Browsers evict WebGL contexts after about sixteen. Static effects are
  rendered through one shared off-screen context per effect, read back with `readPixels`, stored as an image and
  cached by image, parameters, size and DPR. A 24-card grid ends with 0 live contexts.
- **Animated effects are pooled.** The hero mounts only in the viewport, at most `maxLive` (6) at once, LRU; a lost
  context is remounted.
- **Reveal = hover = focus.** The nearest `[data-vitrine-card]` or link is the surface; keyboard users get the photo
  too. `prefers-reduced-motion` makes every effect static and removes the transition.
- **Fallbacks are silent.** No WebGL2, no CORS header, a broken texture: the photo stays, nothing is logged
  (`vitrine:fallback` fires if you want to know).

<p align="center">
  <img src="docs/media/readme-grid.jpg" alt="Product grid printed in dithering with one card revealed on hover" width="100%" />
</p>

## Measured

Lighthouse mobile, median of three runs, same HTML with and without the element:

| Page                                              | With VITRINE                  | Without                | LCP delta |
| ------------------------------------------------- | ----------------------------- | ---------------------- | --------- |
| Static HTML, 24 cards + hero (`examples/static`)  | 85 · LCP 1 546 ms · CLS 0.002 | 100 · 1 541 ms · 0.002 | +5 ms     |
| Next.js 16, 24 cards + hero                       | 99 · LCP 755 ms · CLS 0       | 100 · 757 ms · 0       | −2 ms     |
| Shopify Horizon collection, 12 cards, CDN preview | 100 · LCP 1 808 ms · CLS 0    | 99 · 1 938 ms · 0      | −130 ms   |

Pixel compatibility with `@paper-design/shaders-react`: 0 different pixels on 8 effect/preset cases (Chromium, WebKit).
Bundle, gzip: core 14.4 KB, dither 2.8 KB, halftone 4.1 KB, mesh 2.1 KB, paper 6.3 KB, noise texture 18.3 KB
(halftone and paper only); React wrappers 860 B; single-file theme asset 44.0 KB. Every number, with the method, is in
[`docs/vitrine/devlog`](docs/vitrine/devlog).

## API in short

| Attribute | Values                                   | Notes                                                                  |
| --------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| `effect`  | `dither` · `halftone` · `mesh` · `paper` | required                                                               |
| `preset`  | id from `presets/<effect>.json`          | `default` = the upstream default 1:1                                   |
| `params`  | JSON object                              | overrides, `@paper-design/shaders-react` prop names                    |
| `reveal`  | `hover` · `none`                         | pointer, tap or focus on the nearest `[data-vitrine-card]` or link     |
| `speed`   | number                                   | `0` = rendered once, no live context; anything else = animated, pooled |

Events `vitrine:ready` and `vitrine:fallback`; `data-vitrine-state` on the element; `VitrineShader.config()` for the
pool size and the bake idle timeout. Full reference: [`docs/vitrine/API.md`](docs/vitrine/API.md).

## Made with Paper

The presets were tuned against renders of the element on the NIWWTS catalogue and the demo page was designed on the
Paper canvas before it was coded; the frames, the variants and the before/after values are in
[`docs/vitrine/process.md`](docs/vitrine/process.md).

## Repo

```
packages/element      the <vitrine-shader> element (published as vitrine-shaders)
packages/react        React 19 wrappers (published as vitrine-shaders/react)
shopify-theme/        sections, snippets, assets/vitrine.js: copy into a theme
presets/              JSON presets shared by every stack
examples/static       plain HTML demo, no bundler
examples/next-headless  Next.js 16 store on the Storefront API or on fixtures
docs/                 plan, ADR, devlogs with every measurement, process notes
```

Contributions: [`ROADMAP.md`](ROADMAP.md) lists what comes next (theme app extension, more effects, chunked theme
asset, Svelte/Vue wrappers, community presets).

## Limits

- WebGL2 is required for the effect; without it the page shows the image.
- Cross-origin images need `Access-Control-Allow-Origin` (Shopify's CDN sends `*`; `next/image` makes them
  same-origin anyway).
- Firefox is unmeasured.

## Licence

Apache-2.0 © 2026 Piotr Filipecki. Paper Shaders' `LICENSE` and `NOTICE` are in `third_party/paper-shaders/` and in
the header of every built file. Powered by [Paper Shaders](https://shaders.paper.design).
