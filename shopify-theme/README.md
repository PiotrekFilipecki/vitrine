# shopify-theme/ · VITRINE for Online Store 2.0 themes

Paper Shaders in a Shopify theme without an app: copy this folder into your theme and you get a hero with an animated
mesh gradient, an editorial image with paper texture and product cards printed in dithering that turn into the photo on
hover, tap or focus. Merchants tune colours and sliders in the theme editor; no code after the install.
Powered by [Paper Shaders](https://shaders.paper.design) (Apache-2.0, see the header of `assets/vitrine.js`).

Tested on **Horizon 4.3.0** (Shopify's current first-party theme, 29.10.2026). Dawn 16 notes below.

## What is in here

| File                                 | What it does                                                                                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/vitrine.js`                  | the `<vitrine-shader>` element, one ES module (143.9 KB, 55.5 KB gzip, Q1 build), all six effects inside; licence + Paper NOTICE in the header                 |
| `assets/vitrine-theme.css`           | styles for the two sections and the card wrapper (radius 0, no shadows; typography inherits from the theme)                                                    |
| `sections/vitrine-hero.liquid`       | mesh gradient surface + ink plate; colour pickers ×4, speed / distortion / swirl / grain / scale sliders, height, plate colours; blocks: heading, text, button |
| `sections/vitrine-editorial.liquid`  | paper texture on an `image_picker` image + text column; folds / crumples / grain / fibre / light angle / seed sliders; blocks: kicker, heading, text, button   |
| `snippets/vitrine-card-media.liquid` | wraps a card image in `<vitrine-shader effect="dither\|halftone" reveal="hover">`; reads the theme settings below                                              |
| `snippets/vitrine-script.liquid`     | the `<script type="module">` tag; rendered by the sections and the card snippet only                                                                           |
| `settings_schema.fragment.json`      | the "VITRINE" settings group to paste into `config/settings_schema.json` (effect on cards on/off, dither/halftone, preset, reveal)                             |

## v0.2: glass card, pre-order glass, loupe (ADR-0003)

Three snippets, one per shop moment. Each renders `<vitrine-shader>` around the theme's own `image_tag`, so the
photo stays the content (LCP, alt, fallback without WebGL2), and loads `assets/vitrine.js` through `vitrine-script`.

| Snippet                                 | Where                              | What the shopper sees                                                                                                                       |
| --------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `snippets/vitrine-glass-card.liquid`    | product card image                 | the photo behind reeded glass; hover, tap or keyboard focus slides the glass away (first tap on a phone opens, the second follows the link) |
| `snippets/vitrine-preorder-card.liquid` | card of a product not released yet | the glass frosted by the days left: 30 days → 7 → 1 → clear on the release date                                                             |
| `snippets/vitrine-loupe-media.liquid`   | main image on the product page     | a round loupe (2.2×) under the mouse, or under a finger held still                                                                          |

```liquid
{% render 'vitrine-glass-card', image: card_product.featured_media, sizes: '(min-width: 990px) 33vw, 100vw' %}
{% render 'vitrine-preorder-card', product: card_product, sizes: '(min-width: 990px) 33vw, 100vw' %}
{% render 'vitrine-loupe-media', image: product.featured_media, sizes: '(min-width: 990px) 50vw, 100vw' %}
```

**Release date (pre-order):** create a product metafield definition in **Settings → Custom data → Products**:
namespace and key `custom.release_date`, type _Date_ or _Date and time_. Optional `custom.preorder_from` (same types):
a pre-order shorter than 30 days then starts fully frosted. Fill the date on each pre-order product. Without a date
the snippet prints the plain image. The frost is computed once in the shopper's browser and baked; nothing ticks.

In Horizon, put `vitrine-glass-card` (or `vitrine-preorder-card` when `card_product.metafields.custom.release_date`
is set) where the v0.1 instructions below put `vitrine-card-media`, and keep `data-vitrine-card` on the card root.

## Install in 10 minutes

1. **Copy** `assets/`, `sections/` and `snippets/` into your theme (keep the file names). Nothing is overwritten.
2. **Settings:** open `config/settings_schema.json` and paste the object from `settings_schema.fragment.json` as the last
   element of the top-level array (we do not ship a whole `settings_schema.json`, it is the theme's).
3. **Cards (Horizon 4.3.0):** `snippets/product-media.liquid`, the `{{ media.preview_image | image_url: width: 3840 | image_tag: … }}`
   call at lines 40–54. Wrap it so card images go through the snippet:

   ```liquid
   {%- if preview_image_only and media.media_type == 'image' -%}
     {%- render 'vitrine-card-media',
       image: media.preview_image,
       widths: widths,
       sizes: sizes,
       loading: loading,
       fetchpriority: fetch_priority,
       class: 'product-media__image',
       style: focal_point_style,
       alt: media.alt
     -%}
   {%- else -%}
     {{ … the original image_tag call … }}
   {%- endif -%}
   ```

   `preview_image_only` is true only for product cards (collection grid, product lists, recommendations), so the
   product page gallery and hotspots keep the original tag.

   Then mark the card root as the reveal surface: in `snippets/product-card.liquid` line 62 add `data-vitrine-card`
   to `<product-card class="product-card size-style" …>`. Horizon's card link (`a.product-card__link`, line 86) is a
   stretched sibling of the image, not its ancestor, and the `a.contents` wrapper around the gallery cannot take
   focus, so without the marker keyboard users would never see the photo. With it, hover, tap and focus anywhere in
   the card reveal the image.

   **Dawn 16:** `snippets/card-product.liquid` lines 66–85 are a hand-written `<img srcset=…>`. Replace that `<img>`
   with `{% render 'vitrine-card-media', image: card_product.featured_media, sizes: '…', loading: lazy, class: 'motion-reduce' %}`
   (and the second, hover image at lines 89–99 can stay: VITRINE already does the reveal).

4. **Push** as an unpublished theme and check it in the editor:

   ```sh
   shopify theme push --unpublished --theme "VITRINE test" --store your-store.myshopify.com
   ```

5. In the editor add **VITRINE hero (mesh)** and **VITRINE editorial (paper)** from "Add section"; card settings are under
   **Theme settings → VITRINE**.

## Settings → shader parameters

Section sliders are percentages mapped to the `@paper-design/shaders-react` prop names in `params`:

| Section        | Setting                                         | Param                                                  |
| -------------- | ----------------------------------------------- | ------------------------------------------------------ |
| hero           | Colour 1–4                                      | `colors[]` (blank pickers are skipped)                 |
| hero           | Speed 0–200 %                                   | `speed` 0–2 (0 = rendered once, no live WebGL context) |
| hero           | Distortion, Swirl, Grain, Scale                 | `distortion`, `swirl`, `grainOverlay`, `scale`         |
| editorial      | Texture strength, Folds, Crumples, Grain, Fibre | `blending`, `folds`, `crumples`, `roughness`, `fiber`  |
| editorial      | Light angle, Seed, Paper colour                 | `angle`, `seed`, `colorBack`                           |
| theme settings | Effect, Preset                                  | `effect`, `preset` attributes of the card element      |

Presets come from `presets/*.json` in the repo and are bundled in `vitrine.js`.

## How it loads

Each VITRINE section and each card renders `<script type="module" src="{{ 'vitrine.js' | asset_url }}">`. A page
without VITRINE loads nothing. Repeated tags are free: a browser evaluates a module URL once (`asset_url` is the same
URL across a theme version); measured on a 24-card grid: 26 tags, 1 request.

The element upgrades on `connectedCallback` and disposes on `disconnectedCallback`, so the theme editor's
`shopify:section:load` / `unload` (which replace the section's DOM) need no extra code.

## Limits

- **WebGL2 required**; without it, and when the texture cannot be read, the page shows the plain image. Nothing is logged.
- **CORS:** product images come from `cdn.shopify.com`, which sends `Access-Control-Allow-Origin: *`
  (checked in the P0/P2 devlogs). Images from other hosts need the same header.
- **Performance:** cards and the editorial image are rendered once off-screen and cached (0 live contexts); the hero
  is the only live context and pauses off-screen. Keep the hero the only animated effect per page.
- **Reduced motion:** `prefers-reduced-motion: reduce` turns every effect static and removes the reveal transition.
- Theme app extension (install without touching code) is planned for v2, see `ROADMAP.md`.

API of the element: `docs/vitrine/API.md`. Licence: Apache-2.0; `LICENSE` and `NOTICE` of Paper Shaders in
`third_party/paper-shaders/`.
