# VITRINE

Paper Shaders for Shopify themes and headless storefronts.

VITRINE is a `<vitrine-shader>` custom element built on the vanilla `@paper-design/shaders` runtime. Wrap a product image in it and the catalog turns into print: dithering or CMYK halftone on product cards (hover or focus reveals the photo), mesh gradients on collection banners, paper texture on editorial images.

- Works in Online Store 2.0 Liquid themes (copy `shopify-theme/` into your theme), in plain HTML, and in React 19 / Next.js via typed wrappers.
- The `<img>` stays the content: LCP, alt text and SEO are untouched, and without WebGL2 you simply see the photo.
- Static effects are baked once and release their WebGL context, so a 24-product grid costs zero live contexts.

Status: P1 (the element, presets, static NIWWTS demo). Not published yet. Apache-2.0. API: `docs/vitrine/API.md`.

Powered by [Paper Shaders](https://shaders.paper.design) by Lost Coast Labs, Inc. (Apache-2.0; see `NOTICE` and `third_party/paper-shaders/`).
