# examples/static

NIWWTS No.06 catalogue as plain HTML. No bundler: the pages import `packages/element/dist/index.js` directly, so run
`pnpm build`, then `pnpm serve`, and open `http://localhost:4173/examples/static/`. `?effects=off` renders the same
markup without the element (Lighthouse comparison, `node scripts/lighthouse.mjs static`).

- `index.html`, the demo: a proof print at the top (`dither / newsprint` with a loupe that shows the photo under the
  cursor; a tap moves it, a click or Enter lifts the whole print), the mesh as the colour bar under it, 12 product
  cards with `srcset` (640 / 1000 / 1600 px), a `paper / folded-lookbook` editorial image. The element is imported
  after the hero photo has painted, so it stays out of LCP.
- `stress.html`: 24 cards from the 1600 px originals (no `srcset`) and a live mesh, the element imported straight
  away. The worst case, kept for the README numbers (`VITRINE_LH_PAGE=stress.html node scripts/lighthouse.mjs static`).
- `theme-markup.html`: the markup the Liquid snippets render, for the theme tests.

The font is Archivo from `examples/fonts/archivo` (OFL); the published version is built by `scripts/pages-site.mjs`.
