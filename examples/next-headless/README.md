# examples/next-headless

NIWWTS No.06 as a headless storefront: Next.js 16 App Router + `vitrine-shaders/react`. The server renders plain
`<img>` tags (`next/image`), the `<vitrine-shader>` element loads after hydration and prints the catalogue in
dithering; hover, tap or Tab reveals the photo. Powered by Paper Shaders.

## Run

```sh
pnpm install && pnpm build          # from the repo root: builds the packages, then this example
pnpm --filter next-headless start   # http://localhost:3000
pnpm --filter next-headless dev     # development
```

Without environment variables the catalogue comes from `examples/spikes/fixtures` (copied into `public/fixtures/`
by `scripts/sync-fixtures.mjs` on `dev`/`build`; the footer says so).

## Storefront API mode

Copy `.env.example` to `.env.local` and fill in:

| Variable                          | Value                                                       |
| --------------------------------- | ----------------------------------------------------------- |
| `SHOPIFY_STORE_DOMAIN`            | `niwwts.myshopify.com` (your own dev store)                 |
| `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` | Headless channel → Storefront API → **public** access token |
| `SHOPIFY_API_VERSION`             | `2026-10`                                                   |

Products: first 24 by title with a featured image; `custom.code` metafield shows as the catalogue code. Fetches
run in Server Components (`server-only`), cached by Next for 300 s. Product images are served through
`/_next/image`, so the shader texture is same-origin and CORS never comes into play.

## `?vitrine=off`

Same page without the element (no wrapper, no element chunk), for the Lighthouse comparison in the P3 devlog.

## Deploy on Vercel

1. Import the repo, set **Root Directory** to `examples/next-headless`, framework Next.js (auto-detected).
2. Build command `pnpm build` from the repo root is not needed: Vercel runs `pnpm install` for the workspace and
   `next build` here; `prebuild` copies the fixtures.
3. Add the three environment variables above only if you want the store mode; the fixtures mode needs nothing.
   No `vercel.json` is required.

## How to add VITRINE to an existing headless store

```tsx
import { ProductMediaShader } from 'vitrine-shaders/react';

<ProductMediaShader image={product.featuredImage} effect="dither" preset="newsprint" reveal="hover">
  <Image src={product.featuredImage.url} alt={product.featuredImage.altText ?? ''} width={…} height={…} />
</ProductMediaShader>
```

Put it inside the card's `<Link>` (the nearest link is the hover/focus surface). Without `children` it renders a
plain `<img>` from the Storefront image. `CollectionHeroShader` (mesh) and `EditorialImageShader` (paper) work
the same way. API: `docs/vitrine/API.md`.
