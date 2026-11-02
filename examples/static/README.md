# examples/static

"Store", a made-up shop in plain HTML (Q1, ADR-0003). No bundler: the pages import `packages/element/dist/index.js`
directly, so run `pnpm build`, then `pnpm serve`, and open `http://localhost:4173/examples/static/`. `?effects=off`
renders the same markup without the element (Lighthouse comparison, `node scripts/lighthouse.mjs static`).

- `index.html`: hero (the bar stool behind reeded glass, edge to edge), 12 product cards in three columns of different
  heights (`effect="glass" preset="window"`, `srcset` 640 / 1000 / 1600 px), and the pre-order section (the sneaker
  frosted by the days left to its release, with the scale 30 / 7 / 1 day / release day).
- `products/<handle>.html`: 12 product pages with the loupe (`effect="lens" preset="loupe" bind="pointer"`), generated
  once from `examples/fixtures/catalog.json` and committed as static files.
- `demo.js`: rolls the pre-order date to nine days from today (the footer says so), counts `vitrine:ready` events for
  the tests (`window.__vitrine`), imports the element after the LCP photo has painted, and the cart counter.
- `styles.css`: the Lock from `docs/vitrine/KIERUNEK-v2.md` (paper, ink, Archivo, no UI accent) at the top.

Photographs: `examples/fixtures/products` (Unsplash License, `examples/fixtures/CREDITS.md`). The font is Archivo from
`examples/fonts/archivo` (OFL). The R0 mockup `r0-hero.html` stays as the record of the R0 gate. The published version
is built by `scripts/pages-site.mjs`.
