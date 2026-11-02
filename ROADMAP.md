# Roadmap

0.2 is open source for developers: the element with the glass, the pre-order glass and the loupe, the React wrappers,
the theme folder. What comes after, in the order it would be worth doing.

## v2 · Shopify app with a Theme App Extension

Install from the App Store, add **VITRINE hero** and **VITRINE editorial** as app blocks in the theme editor, no code.
Limits set by the platform (PLAN D12): app blocks only go into sections, never inside a theme's product card, so the
card effect in an app would need a script that targets the theme's own card selectors, which is brittle across
themes. Plan: app blocks for the sections, a documented snippet for cards, a paid tier for the hosted version
(free core stays Apache-2.0).

## More effects (after the R0 bar)

Every new effect has to pass the bar from ADR-0002: the product reads better, or is more interesting, than without it.
Deferred at the R0 gate: `water` (one ripple from the add-to-cart click; needs its own wave-origin uniform) and
`grain-gradient` (section background from the photo's own colour). The two-pane "doors" for the hero (one context,
needs a hole in the glass from one uniform) is the glass follow-up. Each effect is a module in
`packages/element/src/effects/` with a preset file and a pixel-compatibility test.

## Chunked `vitrine.js` for themes

Today the theme asset is one 55.5 KB gzip file. Split chunks in a flat `assets/` folder would cut a dither-only page to
about 20 KB; the dynamic import next to `asset_url`'s `?v=` needs verifying on a store first.

## Svelte, Vue, Astro

The element already works there (it is a custom element); what is missing are typed wrappers like the React ones and
one example per framework.

## Presets from the community

`presets/*.json` is a plain format (`{ effect, shader, paperShaders, presets: { id: { name, source, params } } }`).
A presets gallery page and a PR template for community presets: values read from a Paper shader layer, the compatibility test as the gate.

## Theme coverage

Horizon 4.3.0 is tested; Dawn 16 has an install note. Verified install guides for the top themes in the store.

## Baked overlay as a 2D canvas

Lighthouse counts the baked overlay `<img>` as an LCP candidate on some layouts. Rendering the baked result into a
2D canvas instead (no PNG encode, no LCP candidate) is a measured trade-off to make in 0.2.
