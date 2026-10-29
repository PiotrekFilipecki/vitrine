# Submission texts (P5, EN)

Links marked TODO are filled in after the repo is public and the demo is deployed (STATUS checklist).

## (a) Codrops contact form (≤ 120 words)

Hi, I built VITRINE, an open-source bridge between Paper Shaders and Shopify. It is a `<vitrine-shader>` custom
element on `@paper-design/shaders` that prints the product image a theme already renders (dithering, halftone, mesh
gradient, paper texture) and gives the photo back on hover, tap or focus. It works in Liquid themes, plain HTML and
React 19 / Next.js from one runtime. The part that took real work: a 24-card grid ends with zero live WebGL contexts
(effects are baked through one shared context), LCP is unchanged, keyboard and reduced motion are covered. Presets
were tuned on the Paper canvas. Shopify is missing from the "Built with Paper Shaders" list; this could fill it.
Repo: TODO_REPO_URL · demo: TODO_DEMO_URL · GIF: TODO_GIF_URL

## (b) Reply under the Codrops guide post (≤ 280 characters)

Built the Shopify entry for "Built with Paper Shaders": VITRINE, a `<vitrine-shader>` element for Liquid themes,
headless Next.js and plain HTML. Dithered catalogue, zero live WebGL contexts on a 24-card grid, presets tuned in
Paper. TODO_REPO_URL

## (c) Post on X

Paper Shaders in a Shopify theme, without an app: VITRINE prints your product grid in dithering and hands the photo
back on hover. One `<vitrine-shader>` element for Liquid, Next.js and HTML. 24 cards, 0 live WebGL contexts, LCP
unchanged. Open source, Apache-2.0. Made with @paper, thank you @uuuuuulala for the shaders. TODO_REPO_URL

## (d) Paper Discord / r/paperdesign

I made a Shopify bridge for Paper Shaders and would like your eyes on it. VITRINE is a custom element that runs
image-dithering, halftone-cmyk, mesh-gradient and paper-texture over the product image a theme already renders;
the photo stays the content (LCP, alt, fallback) and comes back on hover or focus. It ships Liquid sections with
colour pickers and sliders, React wrappers for headless stores, and a static demo. The presets were tuned on the
Paper canvas and read back into JSON through the MCP. Numbers that might interest you: 0 different pixels against
shaders-react, 0 live contexts after baking a 24-card grid, LCP delta within noise on three stacks. Repo and process
notes: TODO_REPO_URL. Happy to take feedback on the presets, they are drafts by a developer, not a designer.

## (e) Article pitch for Codrops (outline)

**"Paper Shaders in a Shopify theme: baking, context budgets and CORS"**

1. Why a product grid breaks naive WebGL: browsers evict contexts after about sixteen; what 24 live `ShaderMount`s
   do in Chromium and WebKit (measured).
2. Bake, don't mount: one off-screen context per effect, `readPixels` + `toDataURL` instead of `preserveDrawingBuffer`
   + `toBlob` (1.07 s vs 7 ms per card when another canvas animates), cache keys, idle disposal.
3. The image stays the content: light DOM, `aria-hidden` overlay, LCP measured with and without the effect on static
   HTML, Next.js and a Horizon theme.
4. CORS on Shopify's CDN, the two URL variants, and what happens when a header is missing (nothing, on purpose).
5. One runtime, three stacks: what a custom element needs so that Liquid, React 19 and plain HTML share presets, and
   what the theme editor's section reloads require.
