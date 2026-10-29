# Changelog

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
