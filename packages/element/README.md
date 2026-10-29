# vitrine-shaders

Paper Shaders for Shopify themes and headless storefronts: a `<vitrine-shader>` custom element that prints the product
image your page already renders (dithering, halftone, mesh gradient, paper texture) and reveals the photo on hover,
tap or focus. One runtime for Liquid, plain HTML and React 19 (`vitrine-shaders/react`).

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

```tsx
import { ProductMediaShader } from 'vitrine-shaders/react';

<ProductMediaShader image={product.featuredImage} effect="dither" preset="newsprint" reveal="hover" />;
```

- The `<img>` stays the content: LCP, alt, SEO and the fallback without WebGL2 or CORS.
- Static effects are rendered once through one shared off-screen context and cached; a 24-card grid ends with 0 live
  WebGL contexts. Animated effects live in a small pool and mount only in the viewport.
- `prefers-reduced-motion` makes everything static. Keyboard focus reveals like hover does.

Docs, Shopify theme files, examples and measurements: https://github.com/PiotrekFilipecki/vitrine

Apache-2.0. Powered by [Paper Shaders](https://shaders.paper.design) (`@paper-design/shaders` 0.0.82, Apache-2.0);
its LICENSE and NOTICE ship in this package.
