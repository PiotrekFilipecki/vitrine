# VITRINE · STATUS

Aktualizacja: 29.10.2026, koniec P3. `main` = P0. Gałęzie: `p1-element` (czeka na bramkę P1) → `p3-headless` (od p1, czeka na bramkę P3). P2 (Liquid) przesunięte za P3, bo dev store powstał w trakcie P3; Piotrek merguje po bramkach w kolejności p1 → p3 → p2.

## Fazy

| Faza | Stan | Bramka |
|---|---|---|
| P0 fundament + spiki | **zrobione** | bake: potwierdzony (0 różnych pikseli, Chromium + WebKit); CORS: potwierdzony (ACAO `*` na obu wariantach URL, tekstura działa). Firefox: niezmierzony (build Playwrighta nie startuje na tej maszynie). Decyzja Piotrka: propozycje P1/P2 w ADR-0001 (piekarnik współdzielony; ochrona żywych montaży w WebKit). |
| P1 element | **zrobione** | zgodność pikseli z React: 0 różnych px, 8/8 przypadków, Chromium + WebKit; 24 karty + hero: 0 `webglcontextlost`, 0 kontekstów po bake; klawiatura, reduced motion, fallback CORS: testy zielone; LCP +5 ms vs bez efektów (Lighthouse mobile, mediana z 3). **Bramka wizualna (Piotrek, telefon): „druk czy filtr?”** — uwaga na raster na kremowym tle (parametr presetu, P4). |
| P2 Liquid + demo statyczne | nie zaczęte (następne; dev store `niwwts.myshopify.com` jest, czeka na `shopify auth login` w zwykłym Terminalu) | — |
| P3 headless Next | **zrobione** (przed P2) | SSR = zwykły `<img>`; 7 testów SSR + 7 e2e na buildzie produkcyjnym (Chromium + WebKit): 25 wypalonych, 1 żywy hero, 0 kontekstów po bake, 0 błędów hydracji; Lighthouse mobile ΔLCP **−2 ms** (755 vs 757), CLS 0, TBT +134 ms; wrappery 860 B gz. **Bramka (Piotrek, telefon): ta sama karta co w `examples/static`.** Tryb Storefront API niewykonany na sklepie (brak tokena). |
| P4 Paper: presety, demo, README | nie zaczęte | — |
| P5 przegląd, wydanie, zgłoszenie | nie zaczęte | — |

## Nazwy (29.10.2026)

- npm `vitrine-shaders`: **wolne** (404). Publikowana paczka = `packages/element`, React jako subpath `vitrine-shaders/react` (ADR-0001 §5).
- GitHub `PiotrekFilipecki/vitrine`: **wolne**.
- Opis bez znaków towarowych w nazwie: „Paper Shaders for Shopify themes and headless storefronts”.

## Wersje (dokładne piny)

`@paper-design/shaders` 0.0.82 · `@paper-design/shaders-react` 0.0.82 (dev, test zgodności) · Next.js 16.4.3 (przykład) · React 19.3.1 · @types/react 19.3.0 · Storefront API 2026-10 · esbuild 0.28.2 (dev, bundle referencji) · lighthouse 13.6.0 (dev) · TypeScript 6.0.3 · tsup 9.0.0 · Vitest 5.0.5 · Playwright 1.64.1 · ESLint 10.13.0 · typescript-eslint 8.72.1 · Prettier 3.9.10 · pnpm 11.18.0 · Node 26.5.0.

## Zasady z tej sesji

- **Żadnych operacji na sklepach klientów** (friendzstore.pl, friendzdev, emwuhats.pl), także odczytów. Testy na własnym sklepie `niwwts` (niwwts.myshopify.com, założony 29.10.2026, PLAN D13) lub na zasobach Shopify. Zapisane w CLAUDE.md.
- Fixtures do spików są syntetyczne (`examples/spikes/fixtures/make-fixtures.py`).

## Kroki ręczne (Piotrek)

1. **Bramka P1:** `pnpm build && pnpm serve`, telefon w tej samej sieci → `http://<ip-maca>:4173/examples/static/`; tap na kartę odsłania zdjęcie. Werdykt „druk czy filtr?”. Po bramce merge `p1-element` → `main`.
2. **Firefox:** `pnpm exec playwright test --project=firefox` poza sesją Claude (jak w P0: „Could not find profile folder”).
3. **Przed P2:** dev store `niwwts.myshopify.com` (jest) + `shopify auth login --store niwwts.myshopify.com`; **Spike C (CORS) do powtórzenia na starcie P2 na niwwts (niwwts.myshopify.com)**: pomiar z P0 był na sklepie należącym do Shopify (hardware.shopify.com), nie na sklepie Piotrka; `claude mcp add --transport stdio shopify-dev-mcp -- npx -y @shopify/dev-mcp@1.18.0`.
4. **Zdjęcia do demo:** prace NIWWTS No.06 z repo shop (od P1 w `examples/spikes/fixtures/`, źródło w README); zdjęć klientów nie używamy.
5. Paper Desktop + MCP przed P4 (`claude mcp list` pokazuje `paper: ✔ Connected` już teraz).
6. **Bramka P3:** `pnpm build && pnpm --filter next-headless start`, telefon → `http://<ip-maca>:3000/`. Po bramce merge `p3-headless` → `main` (po p1).
7. **Tryb sklepu w P3:** kanał Headless w `niwwts.myshopify.com` → publiczny token Storefront API → `examples/next-headless/.env.local` (wzór `.env.example`). Vercel: import z Root Directory `examples/next-headless` (nie wdrażam sam).
8. **Logowanie CLI:** `shopify auth login` w zwykłym Terminal.app (prefiks `!` w Claude Code jest nieinteraktywny i CLI żąda `--alias`).

## Gdzie co jest

- Plan: `docs/vitrine/PLAN.md` · prompty: `docs/vitrine/PROMPTY.md` · ADR: `docs/adr/0001-architektura.md` · API: `docs/vitrine/API.md` · devlogi: `docs/vitrine/devlog/P0-spiki.md`, `P1-element.md`, `P3-headless.md` · dowody: `docs/media/p0-*`, `p1-*`, `p3-*` · spiki: `examples/spikes/` · element: `packages/element/` · wrappery React: `packages/react/` · demo: `examples/static/` · headless: `examples/next-headless/` · Lighthouse: `node scripts/lighthouse.mjs static|next`.
