# Changelog

## Unreleased (v0.2, Q0)

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

## 0.1.0 (unreleased, 2026-10-29)

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
