# examples/theme-test/

Scratch space for testing `shopify-theme/` inside a real theme. Everything here except this README is gitignored.

- `horizon/`: `git clone --depth 1 https://github.com/Shopify/horizon.git` (reference, Shopify-owned).
- `live/`: `shopify theme pull --store niwwts.myshopify.com --theme <live theme id> --path examples/theme-test/live`,
  then the install steps from `shopify-theme/README.md` (copy files, patch `snippets/product-media.liquid`, add
  `data-vitrine-card` to `<product-card>`, paste the settings fragment, add the sections to `templates/index.json`).
- Test: `shopify theme check --path examples/theme-test/live`, `shopify theme push --unpublished --theme "VITRINE test"`,
  `shopify theme dev --port 9292 --store-password …` and `VITRINE_STORE_URL=http://127.0.0.1:9292 pnpm test:e2e`
  (`packages/element/e2e/store.spec.ts`), `VITRINE_STORE_URL=https://niwwts.myshopify.com VITRINE_STORE_PASSWORD=… VITRINE_PREVIEW_THEME_ID=… node scripts/lighthouse.mjs store`.

Only Piotrek's own dev store, never a client store (CLAUDE.md).
