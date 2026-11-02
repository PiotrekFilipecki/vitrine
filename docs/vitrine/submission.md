# Submission texts (EN). Q1 (03.11.2026): rewritten for v0.2 "Store" (glass, pre-order glass, loupe)

Demo URLs: static https://piotrekfilipecki.github.io/vitrine/examples/static/ (after the repo is public and Pages
runs), headless https://vitrine-hazel-three.vercel.app/ (after the Q1 production deploy). Before Q1 these texts
described the v0.1 dithering catalogue; that version is retired (ADR-0002, ADR-0003).

## (a) Codrops contact form (≤ 120 words)

Hi, I built VITRINE, an open-source bridge between Paper Shaders and Shopify. It is a `<vitrine-shader>` custom
element on `@paper-design/shaders` that puts the product photo a theme already renders behind reeded shop-window
glass: the pane slides away under the cursor, a pre-order card stays frosted until its release date, and the product
page gets a loupe. One runtime for Liquid themes, plain HTML and React 19 / Next.js. The part that took real work: a
page of cards holds zero live WebGL contexts at rest and one while something moves (Lighthouse mobile 99 on the
demo). Shopify is missing from the "Built with Paper Shaders" list; this could fill it.
Repo: https://github.com/PiotrekFilipecki/vitrine · demo: https://piotrekfilipecki.github.io/vitrine/examples/static/ · GIF: https://raw.githubusercontent.com/PiotrekFilipecki/vitrine/main/docs/media/readme-glass.gif

## (b) Reply under the Codrops guide post (≤ 280 characters)

Built the Shopify entry for "Built with Paper Shaders": VITRINE puts product photos behind fluted glass that slides
away on hover, frosts pre-orders until release day, adds a loupe. Liquid, Next.js, HTML; 0 live WebGL contexts at
rest. https://github.com/PiotrekFilipecki/vitrine

## (c) Post on X

Paper Shaders in a Shopify store, without an app: VITRINE puts every product behind reeded shop-window glass that
slides away on hover, frosts a pre-order until its release date and gives the product page a loupe. One
`<vitrine-shader>` element for Liquid, Next.js and HTML; 0 live WebGL contexts at rest. Open source, Apache-2.0.
Thank you @uuuuuulala for the shaders. https://github.com/PiotrekFilipecki/vitrine

## (d) Paper Discord / r/paperdesign

I made a Shopify bridge for Paper Shaders and would like your eyes on it. VITRINE runs fluted-glass and
lens-distortion over the product image a theme already renders; the photo stays the content (LCP, alt, fallback).
Three moments: a card behind reeded glass that slides away on hover, tap or focus; the same glass frosted by the days
left to a pre-order's release; a loupe on the product page. The presets went through a bar ("would a premium shop
ship this?") on proof sheets with a no-effect column; dithering, halftone, liquid metal and pulsing border did not
pass and are not in the demo. Numbers: 13 cases against shaders-react at ≤ 0.0067 % different pixels, 0 live
contexts at rest, 1 while the glass moves. Repo: https://github.com/PiotrekFilipecki/vitrine. Feedback on the glass
presets is the most useful thing you could send.

## (e) Article pitch for Codrops (outline)

**"Shop-window glass with Paper Shaders: baking, one-context transitions and a date-bound frost"**

1. Why a product grid breaks naive WebGL: browsers evict contexts after about sixteen; what 24 live `ShaderMount`s
   do in Chromium and WebKit (measured).
2. Bake, don't mount: one off-screen context per effect; `readPixels` instead of `preserveDrawingBuffer` + `toBlob`
   (1.07 s vs 7 ms per card when another canvas animates), then a pixel-pack buffer + fence and a PNG worker, one bake
   per task (a single 854 ms task on the v0.1 demo → none over 50 ms); cache keys, idle disposal.
3. The image stays the content: light DOM, `aria-hidden` overlay, LCP measured with and without the effect on static
   HTML, Next.js and a Horizon theme.
4. CORS on Shopify's CDN, the two URL variants, and what happens when a header is missing (nothing, on purpose).
5. One runtime, three stacks: what a custom element needs so that Liquid, React 19 and plain HTML share presets, and
   what the theme editor's section reloads require.
6. Motion on a budget: one interaction slot, the fresh context painted under the baked frame so its start-up frame
   never lands in the motion (measured at CPU ×4), and a pre-order frost computed once from a date.
