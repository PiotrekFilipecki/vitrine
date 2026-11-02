# vitrine-shaders

Paper Shaders for Shopify themes and headless storefronts: a `<vitrine-shader>` custom element that puts the product
image your page already renders behind reeded shop-window glass (it slides away on hover, tap or focus), frosts a
pre-order card until its release date and adds a loupe to the product page. One runtime for Liquid, plain HTML and
React 19 (`vitrine-shaders/react`).

```html
<script type="module">
  import 'vitrine-shaders';
</script>

<a href="/products/bar-stool">
  <vitrine-shader effect="glass" preset="window">
    <img src="stool.webp" alt="" width="1600" height="2000" />
  </vitrine-shader>
  Bar stool
</a>

<vitrine-shader effect="glass" preset="window" bind="date:2026-12-01">
  <img src="sneaker.webp" alt="Court sneaker" width="1600" height="2240" />
</vitrine-shader>

<vitrine-shader effect="lens" preset="loupe">
  <img src="satchel.webp" alt="Grey leather satchel" width="1600" height="1000" />
</vitrine-shader>
```

```tsx
import { GlassProductImage, LoupeImage, PreorderGlassImage } from 'vitrine-shaders/react';

<GlassProductImage image={product.featuredImage} />;
<PreorderGlassImage image={product.featuredImage} releaseDate="2026-12-01" />;
<LoupeImage image={product.featuredImage} />;
```

- The `<img>` stays the content: LCP, alt, SEO and the fallback without WebGL2 or CORS.
- 0 live WebGL contexts at rest (the glass is rendered once and cached), 1 while something moves.
- `prefers-reduced-motion` opens the glass at once. Keyboard focus opens it like hover does.
- The v0.1 print effects (`dither`, `halftone`, `mesh`, `paper`) are still here.

Docs, Shopify theme files, examples and measurements: https://github.com/PiotrekFilipecki/vitrine

Apache-2.0. Powered by [Paper Shaders](https://shaders.paper.design) (`@paper-design/shaders` 0.0.82, Apache-2.0);
its LICENSE and NOTICE ship in this package.
