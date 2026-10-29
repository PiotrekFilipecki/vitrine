# examples/static

NIWWTS No.06 catalogue as a plain HTML page: 24 dithered cards (`dither / newsprint`, hover or Tab reveals the
photo), a live `mesh / drop-night` hero and a `paper / folded-lookbook` editorial image. No bundler: the page
imports `packages/element/dist/index.js` directly, so run `pnpm build` then `pnpm serve` and open
`http://localhost:4173/examples/static/`. `?effects=off` renders the same markup without the element
(Lighthouse comparison, `node scripts/lighthouse.mjs`).
