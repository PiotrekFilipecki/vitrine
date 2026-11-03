# `<vitrine-shader>` API

Package `vitrine-shaders` (ESM). Importing it registers the element; `define()` is exported for explicit calls.
Pinned to `@paper-design/shaders` 0.0.82 (`PAPER_SHADERS_VERSION`).

```html
<script type="module">
  import 'vitrine-shaders';
</script>

<a href="/products/el-funkador-tee">
  <vitrine-shader effect="dither" preset="newsprint" reveal="hover">
    <img src="https://cdn.shopify.com/s/files/1/…/tee.jpg" alt="EL FUNKADOR tee" width="1600" height="1920" />
  </vitrine-shader>
</a>
```

## Markup

- The child `<img>` is the content and the fallback: it is what loads first, what LCP measures, what screen
  readers and search engines get, and what stays when WebGL2 or CORS is missing. Keep `alt`, `width`, `height`.
- The effect renders in an `aria-hidden` overlay (`.vitrine-layer`) on top of the image. Light DOM, no shadow root:
  theme CSS keeps styling the `<img>`.
- The element is `display:block; position:relative` and takes its box from the image. When `width`/`height`
  attributes are present it also sets `--vitrine-aspect` so nothing shifts while the image loads. If your CSS
  takes the `<img>` out of flow (`position:absolute`), size the element yourself.
- `mesh` needs no image; give the element a size with CSS.
- Images from another origin must send `Access-Control-Allow-Origin` (Shopify's CDN does). The element loads
  its own `crossorigin="anonymous"` copy; add `crossorigin="anonymous"` to the content `<img>` to share one request.

## Attributes

| Attribute | Values | Default | Notes |
| --- | --- | --- | --- |
| `effect` | `dither` · `halftone` · `mesh` · `paper` · `glass` · `lens` | required | image-dithering, halftone-cmyk, mesh-gradient, paper-texture; v0.2: fluted-glass, lens-distortion |
| `preset` | key from `presets/<effect>.json` | `default` | `default` = upstream Default preset 1:1; unknown names fall back to `default` |
| `params` | JSON object | `{}` | overrides on top of the preset, same names as `@paper-design/shaders-react` props |
| `reveal` | `hover` · `tap` · `none` | `none` (glass: `hover`) | `hover`: pointer over, tap on, or focus inside the surface reveals the photo. `tap` (v0.2): click or tap toggles, hover and focus do nothing. Both: Enter/Space toggle on a focusable surface that is not a link. Surface = nearest `[data-vitrine-card]` ancestor if there is one (explicit wins), else the nearest `a`, else the element. A date-bound glass defaults to `none` |
| `bind` | `none` · `pointer` · `date:<to>` · `date:<from>/<to>` | glass `none`, lens `pointer` | v0.2. What drives the effect besides its preset (see "v0.2" below). Dates are ISO 8601; the JSON form `{"date":{"from":"…","to":"…"}}` is accepted too |
| `speed` | number | preset value | `0` = static: baked once to an `<img>`, no live context; `≠ 0` = animated, pooled |
| `debug` | boolean attribute | off | `console.warn` on fallbacks and bad attributes |

Attribute changes re-run the setup (theme editor, frameworks).

## VITRINE-only parameters

Everything in `params` is an upstream prop name, with one exception:

| Param | Effect | Values | Default | What it does |
| --- | --- | --- | --- | --- |
| `whitePoint` | `dither` | number in (0, 1) | off (absent, `1`, or out of range) | Levels step on the source luminance before the dither: `min(lum / whitePoint, 1)`. Anything at or above `whitePoint` prints as the highlight colour, so a light mockup background becomes clean paper instead of a dot screen. The `newsprint` preset ships with `0.9` (NIWWTS mockups have a ground at 0.927). |

With the option off the element runs the upstream fragment shader unchanged, so every preset without it is still
covered by the pixel-compatibility tests. With it on, the element uses a copy of the upstream source with one uniform
and one line added (`patchWhitePoint` in `effects/dither.ts`, which throws if a version bump moves the anchor lines),
in its own shared baker. Tests: `effects.test.ts` (patch, mapping) and `e2e/whitepoint.spec.ts` (12 mockups, clean
ground with the option, raster without it). To switch it off on `newsprint`: `params='{"whitePoint":1}'`.

## Static vs animated (ADR-0001 / PLAN D3)

- `speed` 0 (dither, halftone and paper by default): rendered once by a shared off-screen context per effect,
  copied to a PNG `<img>` and cached in memory by (effect, params, src, size, DPR). A page of 24 cards ends with
  **0 live WebGL contexts**. Resizing the box re-bakes (debounced 150 ms; same size = cache hit).
- Since v0.2 (Q0) a bake does not hold the main thread: one global queue gives every bake its own task (elements
  within half a screen of the viewport first, one per frame; the rest in `requestIdleCallback`, 50 ms timeout where
  it is missing), the frame is read back through a pixel-pack buffer and a fence (no synchronous `readPixels` wait),
  and the PNG is encoded in a worker built from a Blob URL. Each step falls back to the v0.1 path when unavailable
  (no fence, a CSP without `worker-src blob:`). Same pixels either way: the compatibility tests read the result.
- The texture is the image the browser chose (`currentSrc`), so `srcset`/`sizes` on the content `<img>` decide
  how much the GPU uploads. A 200 px card fed a 1600 px original costs about five times the main-thread time of the
  same card fed a 640 px file (median 40 ms vs 8 ms per bake at CPU ×4, Q0 devlog).
- To keep the element out of LCP on a page whose LCP is an image, import it after that image has painted (see the
  head script of `examples/static/index.html`).
- `speed` ≠ 0 (mesh by default): mounted only while in the viewport, at most `maxLive` (default 6) at once, LRU.
  Leaving the viewport or being evicted keeps the last frame as a 2D canvas and releases the context. A context
  lost by the browser (WebKit evicts the oldest) is remounted automatically.
- `prefers-reduced-motion: reduce` forces `speed` 0 for everything and removes the reveal transition.

## Reveal

Transition on the overlay only: `opacity` over `--vitrine-reveal-duration` (320 ms) with `--vitrine-reveal-ease`
(`cubic-bezier(.2,0,0,1)`); override both on any ancestor. Opacity only, because any transform would resample
the dither grid. State is exposed as `data-vitrine-revealed` on the element; reduced motion = instant.

## Events (bubble)

- `vitrine:ready` — `detail: { effect, preset, mode: 'baked' | 'live', cached, ms, bake? }`. `bake` (baked, not
  cached): milliseconds `{ total, wait, render, upload, read, gpu, blob, main, readback: 'async' | 'sync',
  encode: 'worker' | 'main', pixels }`; `main` is the main-thread share.
- `vitrine:fallback` — `detail: { reason: 'no-webgl2' | 'cors' | 'error', message }`; the `<img>` stays, nothing is logged unless `debug`.

`data-vitrine-state` on the element: `loading` · `baked` · `live` · `fallback`, and since v0.2 `clear` (a pre-order
glass on or after its release: the plain photo, no layer) and `interactive` (a pointer loupe at rest: the plain photo,
no context). `vitrine:ready` reports the same as `mode`. A glass that is fully open carries `data-vitrine-open`.

## JavaScript

```js
import { VitrineShader, define, EFFECTS } from 'vitrine-shaders';

VitrineShader.config({ maxLive: 4, debug: false, bakeIdleMs: 1500, minPixelRatio: 2, maxPixelCount: undefined });
VitrineShader.stats(); // { liveMounts, bakerContexts, bakedCached, interactionMounts (v0.2, at most 1) }
```

`<html data-vitrine-max-live="4" data-vitrine-debug>` sets the same without JS (read once at first use).

## Presets

`presets/<effect>.json`: `{ effect, shader, paperShaders, presets: { id: { name, source, params } } }`. `params` use
React prop names and never include `image`. Bundled into the element at build time; the same files feed the Liquid
section schemas (P2) and the React wrappers (P3).

## React 19 / Next.js (`vitrine-shaders/react`, workspace `@vitrine/react` until the P5 release)

```tsx
import { ProductMediaShader, CollectionHeroShader, EditorialImageShader } from 'vitrine-shaders/react';

<Link href={`/products/${product.handle}`}>
  <ProductMediaShader image={product.featuredImage} effect="dither" preset="newsprint" reveal="hover">
    <Image src={product.featuredImage.url} alt={product.featuredImage.altText ?? ''} width={1600} height={1920} />
  </ProductMediaShader>
</Link>
```

- `image` is the Storefront API shape `{ url, altText, width, height }`. Without `children` the wrapper renders a plain
  `<img>` from it (`imgProps` adds `loading`, `fetchPriority`, `sizes`…); with `children` it renders what you pass
  (`next/image`), which must be a direct `<img>` child with `alt`, `width`, `height`.
- Props mirror the attributes: `preset`, `params` (object, serialised to JSON), `speed`, `reveal`, `debug`, `className`,
  `style`, `id`. Defaults: `ProductMediaShader` = `dither/newsprint/hover`, `EditorialImageShader` = `paper/folded-lookbook/hover`,
  `CollectionHeroShader` = `mesh/drop-night`, `aria-hidden`, with a `colors` shortcut.
- The wrappers are `'use client'`; the server renders only the element tag and the image. The runtime is loaded once in
  the browser with `import('vitrine-shaders')` after hydration (`registerVitrine()` if you want to call it yourself).
- JSX types for `<vitrine-shader>` are declared by the package. Example app: `examples/next-headless`.

## v0.2: glass, pre-order glass, loupe (ADR-0003)

Three shop moments, approved at the R0 gate. Presets come 1:1 from the R0 proof sheets (`examples/r0/effects.js`,
checked by `q1.test.ts`); the pixel-compatibility test covers `glass/default`, `glass/window`, `glass/preorder-30`,
`lens/default` and `lens/loupe` against `@paper-design/shaders-react` 0.0.82.

| Moment | Markup | At rest | On interaction |
| --- | --- | --- | --- |
| Card behind glass | `effect="glass" preset="window"` | baked frame, 0 contexts | hover, tap or focus: the pane slides right (`marginLeft` 0 → 1, 520 ms; back 380 ms; ease-out cubic, no overshoot) on 1 context, dropped 400 ms after the move; fully open = the `<img>` itself |
| Pre-order | `effect="glass" bind="date:2026-12-01"` | baked once with the frost of today: 30 days out → 7 → 1 → clear on the date | none by default (the frost is the message) |
| Product page loupe | `effect="lens" preset="loupe"` (`bind="pointer"` is the default) | nothing, 0 contexts | mouse/pen over the photo, or a touch held still 350 ms: a round loupe (½ of the width, 2.2×) grows in 350 ms, follows the pointer, shrinks in 250 ms |

All interactions share **one** slot: a second one takes it over and the first jumps to its end state. With reduced
motion the glass opens and closes at once, without a context.

### HTML

```html
<script type="module">
  import 'vitrine-shaders';
</script>

<!-- card -->
<a href="/products/bar-stool">
  <vitrine-shader effect="glass" preset="window">
    <img src="/stool-640.webp" srcset="/stool-640.webp 640w, /stool-1000.webp 1000w" sizes="30vw" alt="" width="1600" height="2000" />
  </vitrine-shader>
  Bar stool · € 240
</a>

<!-- pre-order: frost by days left; with from/to a shorter pre-order still starts fully frosted -->
<vitrine-shader effect="glass" preset="window" bind="date:2026-11-20T10:00:00Z/2026-12-01T10:00:00Z">
  <img src="/sneaker.webp" alt="Court sneaker" width="1600" height="2240" />
</vitrine-shader>

<!-- hero: two panes part at the pointer (the R0 hero) -->
<a href="/products/bar-stool">
  <vitrine-shader effect="glass" preset="window" params='{"doors":true}'>
    <img src="/stool-1600.webp" alt="Bar stool" width="1600" height="2000" fetchpriority="high" />
  </vitrine-shader>
</a>

<!-- product page -->
<vitrine-shader effect="lens" preset="loupe" params='{"zoom":2.5}'>
  <img src="/satchel-1600.webp" alt="Grey pebbled leather satchel" width="1600" height="1000" fetchpriority="high" />
</vitrine-shader>
```

Image under the glass: the `<img>` must fill the element like `object-fit: cover` (centred), which is how the shader
crops. `window` has `scale` 1.06 (the reeds never sample past the photo edge), so the element scales the `<img>` by the
same factor (`--vitrine-image-scale`, a transform, no layout shift) and clips with `overflow: hidden`.

### Parameters and CSS

| Name | Where | Default | What it does |
| --- | --- | --- | --- |
| `doors` | `params` of `glass` | off | VITRINE-only (Q1.1): two panes part at the pointer instead of one pane sliding right. Hover peeks (gap 0.2, follows the cursor), tap/click/focus/Enter open fully. One context; the rest frame is the upstream render |
| `loupeSize` | `params` of `lens` | `0.5` (preset `loupe`) | VITRINE-only: loupe diameter as a fraction of the element width |
| `zoom` | `params` of `lens` | `2.2` (preset `loupe`) | VITRINE-only: magnification |
| `--vitrine-glass-open` | CSS, element or ancestor | `520ms` | glass opening time |
| `--vitrine-glass-close` | CSS, element or ancestor | `380ms` | glass closing time (doors: closing from fully open, `420ms`) |
| `--vitrine-glass-peek` | CSS, element or ancestor | `520ms` | doors: the hover peek |
| `--vitrine-glass-close-peek` | CSS, element or ancestor | `380ms` | doors: closing from a peek |

Pre-order curve (`dateFrost`, exported): piecewise linear in days left through the anchors `preorder-30`,
`preorder-7`, `preorder-1` (it moves `distortion`, `blur`, `stretch`, `highlights`, `shadows`, `grainOverlay`), then to
zero over the last day; ≥ 30 days or before `from` = the 30-day frost; with `from`, the anchors are multiplied by
(window ÷ 30) when the window is shorter than 30 days. Computed once at mount; nothing ticks on the page.
Helpers: `parseBind(attr)`, `formatDateBind(to, from?)`, `dateFrost(bind, presets, now)`, `DATE_ANCHORS`.

On a link, the touch tap that opens the glass does not navigate; the next tap does. With `reveal="tap"` the same is
true for a mouse click.

### React

```tsx
import { GlassProductImage, PreorderGlassImage, LoupeImage } from 'vitrine-shaders/react';

<Link href={`/products/${p.handle}`}>
  <GlassProductImage image={p.featuredImage} className="shot">
    <Image src={p.featuredImage.url} alt="" width={1600} height={2000} sizes="30vw" />
  </GlassProductImage>
</Link>

<PreorderGlassImage image={p.featuredImage} releaseDate={p.releaseDate} preorderFrom={p.preorderFrom} />

<LoupeImage image={p.featuredImage} zoom={2.5} />
```

| Wrapper | Element | Props on top of the v0.1 image props |
| --- | --- | --- |
| `GlassProductImage` | `glass` / `window`, reveal `hover` | `reveal` (`hover` · `tap` · `none`) |
| `PreorderGlassImage` | `glass` / `window`, `bind` from the dates | `releaseDate` (ISO, required), `preorderFrom` (ISO), `reveal` (off by default) |
| `LoupeImage` | `lens` / `loupe`, `bind="pointer"` | `loupeSize`, `zoom` |

Names follow the shop moment and what they render (a product image), not the technique (ADR-0003 §6). The v0.1
wrappers are unchanged.

### Liquid

```liquid
{% render 'vitrine-glass-card', image: card_product.featured_media, sizes: '(min-width: 990px) 33vw, 100vw' %}
{% render 'vitrine-preorder-card', product: card_product, sizes: '(min-width: 990px) 33vw, 100vw' %}
{% render 'vitrine-loupe-media', image: product.featured_media, sizes: '(min-width: 990px) 50vw, 100vw' %}
```

The pre-order snippet reads the release date from the product metafield **`custom.release_date`** (type *Date* or
*Date and time*) and the optional start from `custom.preorder_from`; both can be passed as `release_date:` /
`preorder_from:`. Without a date it prints the plain image. Full parameter lists: the `{% doc %}` block of each
snippet and `shopify-theme/README.md`.

### Backwards compatibility with v0.1

`dither`, `halftone`, `mesh`, `paper`, their presets and the v0.1 React wrappers are unchanged (tests:
`index.test.ts`, `shaders.test.tsx` "keeps the v0.1 ProductMediaShader output byte-for-byte", the v0.1 pixel cases in
`compat.spec.ts`, `grid.spec.ts`, `theme-markup.spec.ts`). Additive changes only: new `effect` values, `reveal="tap"`,
`bind`, two `mode` values, one `stats()` field. A TypeScript `switch` over `VitrineMode` or `VitrineEffect` needs the
new cases.

## Bundle

ESM with code splitting: `index.js` (element, baker, bake queue, readback, encoder, pool, ShaderMount) plus one chunk
per effect and one for the interactions (glass transition, doors, loupe), each loaded on first use. Core (index +
static chunks) 22.6 KB gzip, interactions 4.4 KB, glass 5.0 KB, lens 3.9 KB (Q1.1). Sizes: P1 devlog, updated in the Q0 and Q1 devlogs.
