# Changelog

## 0.2.1 (2026-11-03)

- Loupe: listens on the nearest `[data-vitrine-card]` ancestor when there is one, so a theme overlay on top of the
  product image (Horizon's transparent zoom button) no longer blocks it; clicks still reach the overlay. Found on the
  dev store with the Horizon 4.3.0 product page.
- Theme notes for Horizon's product page (`shopify-theme/README.md`).

## 0.2.0 (2026-11-03)

Three shop moments approved at the R0 gate (ADR-0003). Additive: every v0.1 attribute, preset and wrapper works as
before.

- `effect="glass"` (fluted-glass): the card behind reeded glass. At rest a baked frame (no live context); hover, tap or
  keyboard focus slide the pane away (520 ms, back 380 ms, ease-out cubic) on one context dropped after the move.
  Presets `window` and `preorder-30/7/1` from the R0 sheets, plus the upstream `default`.
- `effect="lens"` (lens-distortion): the product-page loupe under the mouse or a finger held still; no context at
  rest. Preset `loupe` (VITRINE-only `loupeSize`, `zoom`).
- `bind` attribute: `pointer`, `date:<to>`, `date:<from>/<to>` (ISO 8601) or JSON. A date-bound glass frosts by the
  days left (30 → 7 → 1 → clear on the release), computed once and baked.
- `reveal="tap"`; Enter/Space on a focusable non-link surface; on a link the touch tap that opens the glass does not
  navigate.
- One interaction slot for glass transitions and loupes: at most 1 live context while something moves.
  `VitrineShader.stats().interactionMounts`, modes `clear` and `interactive`.
- React: `GlassProductImage`, `PreorderGlassImage`, `LoupeImage`. Exported helpers: `parseBind`, `formatDateBind`,
  `dateFrost`, `DATE_ANCHORS`.
- Liquid: `vitrine-glass-card`, `vitrine-preorder-card` (metafield `custom.release_date`), `vitrine-loupe-media`.
- Demo "Store" (static HTML + Next.js) with twelve Unsplash product photographs; the NIWWTS demo is retired (its
  fixtures serve the pixel-compatibility tests only).
- `params: { doors: true }` on glass: two panes part at the pointer (the hero), still one context; the rest frame is
  the upstream render.
- The interaction code (glass, doors, loupe) is its own chunk; pages with only v0.1 effects do not load it.
- Theme settings: the card effect gets `glass` (new default, preset `window`); dither and halftone stay selectable.
- Measured: Lighthouse mobile static demo 99 (TBT 29 ms), 0 live contexts after load, pixel compatibility
  13 cases ≤ 0.0067 %.

### Also in 0.2.0 (Q0)

- `whitePoint` on `dither` (VITRINE-only, off by default): a levels step before the dither, so a light mockup
  background prints as clean paper. `newsprint` ships with `0.9`; background raster on the 12 NIWWTS mockups
  23.6 % → 0 %. With the option off the upstream shader runs unchanged.
- Bakes leave the main thread alone: one bake per task from a global queue (near-viewport first, the rest in idle
  time), asynchronous readback through a pixel-pack buffer and a fence, PNG encoding in a worker. Fallbacks to the
  v0.1 paths. Lighthouse mobile, same 24-card stress page: 84 → 88, TBT 286 → 179 ms. Demo page, v0.1 page vs the
  new one (also 12 cards, srcset, local font): 70 → 96, TBT 525 → 63 ms.
- `vitrine:ready` `detail.bake` adds `upload`, `read`, `gpu`, `main`, `readback`, `encode`.
- Static demo: 12 unique products, lead card 2 × 2 without empty bands, a proof-print hero with a loupe, Archivo from
  the repo (CLS 0.329 → 0), the 24-card case moved to `examples/static/stress.html`.
- `examples/next-headless`: Archivo through `next/font/local`, so the build needs no network.
- GitHub Pages workflow for the static demo (`.github/workflows/pages.yml`, runs once the repo is public).

## 0.1.0 (2026-10-29)

First release.

- `<vitrine-shader>` custom element on `@paper-design/shaders` 0.0.82: `dither` (image-dithering), `halftone`
  (halftone-cmyk), `mesh` (mesh-gradient), `paper` (paper-texture). Presets in `presets/*.json`, `params` overrides.
- Static effects baked once through a shared off-screen context (readPixels → PNG), cached by image, params, size and
  DPR; animated effects in an LRU pool (default 6) mounted in the viewport; context loss recovery.
- Reveal on hover, tap and focus; explicit `[data-vitrine-card]` surface beats the nearest link; `prefers-reduced-motion`
  makes everything static. Fallbacks: no WebGL2, CORS, errors keep the `<img>`, nothing logged.
- `vitrine-shaders/react`: `ProductMediaShader`, `CollectionHeroShader`, `EditorialImageShader` ('use client'),
  Storefront API image shape, `children` slot for `next/image`, runtime loaded after hydration.
- `shopify-theme/`: hero and editorial sections with schemas and presets, product card snippet, settings fragment,
  single-file `assets/vitrine.js` (44 KB gzip) with licence and NOTICE header; tested on Horizon 4.3.0.
- Examples: static HTML demo, Next.js 16 headless store (Storefront API or fixtures).
- Measurements in `docs/vitrine/devlog/`: 0 different pixels vs shaders-react; LCP delta +5 / −2 / −130 ms.
