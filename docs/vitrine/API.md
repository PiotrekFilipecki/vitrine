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
| `effect` | `dither` · `halftone` · `mesh` · `paper` | required | image-dithering, halftone-cmyk, mesh-gradient, paper-texture |
| `preset` | key from `presets/<effect>.json` | `default` | `default` = upstream Default preset 1:1; unknown names fall back to `default` |
| `params` | JSON object | `{}` | overrides on top of the preset, same names as `@paper-design/shaders-react` props |
| `reveal` | `hover` · `none` | `none` | `hover`: pointer over, tap on, or focus inside the nearest `a` / `[data-vitrine-card]` reveals the photo |
| `speed` | number | preset value | `0` = static: baked once to an `<img>`, no live context; `≠ 0` = animated, pooled |
| `debug` | boolean attribute | off | `console.warn` on fallbacks and bad attributes |

Attribute changes re-run the setup (theme editor, frameworks).

## Static vs animated (ADR-0001 / PLAN D3)

- `speed` 0 (dither, halftone and paper by default): rendered once by a shared off-screen context per effect,
  copied to a PNG `<img>` and cached in memory by (effect, params, src, size, DPR). A page of 24 cards ends with
  **0 live WebGL contexts**. Resizing the box re-bakes (debounced 150 ms; same size = cache hit).
- `speed` ≠ 0 (mesh by default): mounted only while in the viewport, at most `maxLive` (default 6) at once, LRU.
  Leaving the viewport or being evicted keeps the last frame as a 2D canvas and releases the context. A context
  lost by the browser (WebKit evicts the oldest) is remounted automatically.
- `prefers-reduced-motion: reduce` forces `speed` 0 for everything and removes the reveal transition.

## Reveal

Transition on the overlay only: `opacity` over `--vitrine-reveal-duration` (320 ms) with `--vitrine-reveal-ease`
(`cubic-bezier(.2,0,0,1)`); override both on any ancestor. Opacity only, because any transform would resample
the dither grid. State is exposed as `data-vitrine-revealed` on the element; reduced motion = instant.

## Events (bubble)

- `vitrine:ready` — `detail: { effect, preset, mode: 'baked' | 'live', cached, ms }`
- `vitrine:fallback` — `detail: { reason: 'no-webgl2' | 'cors' | 'error', message }`; the `<img>` stays, nothing is logged unless `debug`.

`data-vitrine-state` on the element: `loading` · `baked` · `live` · `fallback`.

## JavaScript

```js
import { VitrineShader, define, EFFECTS } from 'vitrine-shaders';

VitrineShader.config({ maxLive: 4, debug: false, bakeIdleMs: 1500, minPixelRatio: 2, maxPixelCount: undefined });
VitrineShader.stats(); // { liveMounts, bakerContexts, bakedCached }
```

`<html data-vitrine-max-live="4" data-vitrine-debug>` sets the same without JS (read once at first use).

## Presets

`presets/<effect>.json`: `{ effect, shader, paperShaders, presets: { id: { name, source, params } } }`. `params` use
React prop names and never include `image`. Bundled into the element at build time; the same files feed the Liquid
section schemas (P2) and the React wrappers (P3).

## Bundle

ESM with code splitting: `index.js` (element, baker, pool, ShaderMount) plus one chunk per effect loaded on first
use. Sizes are in the P1 devlog.
