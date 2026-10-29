# Submission texts (P5, EN; Q0: Paper wording and numbers corrected)

`TODO_DEMO_URL` is filled in after the Vercel deploy (STATUS checklist).

## (a) Codrops contact form (≤ 120 words)

Hi, I built VITRINE, an open-source bridge between Paper Shaders and Shopify. It is a `<vitrine-shader>` custom
element on `@paper-design/shaders` that prints the product image a theme already renders (dithering, halftone, mesh
gradient, paper texture) and gives the photo back on hover, tap or focus. One runtime for Liquid themes, plain HTML and
React 19 / Next.js. The part that took real work: a 24-card grid ends with zero live WebGL contexts, and printing stays
off the critical path (Lighthouse mobile 96 on the demo, with and without the element). The demo page was laid out on
the Paper canvas. Shopify is missing from the "Built with Paper Shaders" list; this could fill it.
Repo: https://github.com/PiotrekFilipecki/vitrine · demo: TODO_DEMO_URL · GIF: https://raw.githubusercontent.com/PiotrekFilipecki/vitrine/main/docs/media/vitrine-card-reveal.gif

## (b) Reply under the Codrops guide post (≤ 280 characters)

Built the Shopify entry for "Built with Paper Shaders": VITRINE, a `<vitrine-shader>` element for Liquid themes,
headless Next.js and plain HTML. Dithered catalogue, zero live WebGL contexts on a 24-card grid, demo laid out in
Paper. https://github.com/PiotrekFilipecki/vitrine

## (c) Post on X

Paper Shaders in a Shopify theme, without an app: VITRINE prints your product grid in dithering and hands the photo
back on hover. One `<vitrine-shader>` element for Liquid, Next.js and HTML. 24 cards, 0 live WebGL contexts, Lighthouse
96 with or without it. Open source, Apache-2.0. Demo laid out in @paper, thank you @uuuuuulala for the shaders.
https://github.com/PiotrekFilipecki/vitrine

## (d) Paper Discord / r/paperdesign

I made a Shopify bridge for Paper Shaders and would like your eyes on it. VITRINE is a custom element that runs
image-dithering, halftone-cmyk, mesh-gradient and paper-texture over the product image a theme already renders;
the photo stays the content (LCP, alt, fallback) and comes back on hover or focus. It ships Liquid sections with
colour pickers and sliders, React wrappers for headless stores, and a static demo. The demo page was laid out on the
Paper canvas; the presets started as frames there and were then picked on renders of the element, so they are a
developer's drafts, not a designer's. Numbers that might interest you: 0 different pixels against shaders-react,
0 live contexts after baking a 24-card grid, LCP delta 0 ms on the static demo. Repo and process notes:
https://github.com/PiotrekFilipecki/vitrine. Feedback on the presets is the most useful thing you could send.

## (e) Article pitch for Codrops (outline)

**"Paper Shaders in a Shopify theme: baking, context budgets and CORS"**

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
