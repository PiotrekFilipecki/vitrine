# fixtures/

Demo images for the spikes, the e2e tests and `examples/static`. All of them are Piotr Filipecki's own
NIWWTS works (edition No.06), so they may live in this public repo as demo data.

- **Source:** NIWWTS shop repo, `~/Documents/Claude/Projects/NIWWTS LIVE/18-sklep/shop`
  (`public/mockups/*.webp` for tees and prints, `public/pieces/web/*.webp` for the artwork stills).
  Copied read-only on 2026-10-29; nothing in that repo was changed.
- `01…12-*.webp`: 12 product mockups, 1600×1920 (6 tees, 6 prints; 3 of them in the `accent` finish).
- `piece-*.webp`: 3 artwork stills used for the hero/editorial examples.
- `fixtures.json`: titles, codes, series, finish and the mock prices from the shop catalog (`src/lib/catalog.ts`).

Titles and descriptions are part of the artworks: do not retouch them. Replaced the synthetic placeholders of P0 (deleted in P1).

`w640/` and `w1000/` (Q0): the same files resized to 640 and 1000 px wide with ImageMagick (`-resize <w>x -quality 82`),
for `srcset` on the static demo, as a theme or `next/image` would serve them. The 1600 px originals stay the
reference for the tests and the stress page.
