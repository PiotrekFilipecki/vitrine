# VITRINE · STATUS

Aktualizacja: 29.10.2026, koniec P1. `main` = P0 (zmergowane po „działaj dalej”). Gałąź `p1-element` czeka na bramkę P1 (Piotrek merguje).

## Fazy

| Faza | Stan | Bramka |
|---|---|---|
| P0 fundament + spiki | **zrobione** | bake: potwierdzony (0 różnych pikseli, Chromium + WebKit); CORS: potwierdzony (ACAO `*` na obu wariantach URL, tekstura działa). Firefox: niezmierzony (build Playwrighta nie startuje na tej maszynie). Decyzja Piotrka: propozycje P1/P2 w ADR-0001 (piekarnik współdzielony; ochrona żywych montaży w WebKit). |
| P1 element | **zrobione** | zgodność pikseli z React: 0 różnych px, 8/8 przypadków, Chromium + WebKit; 24 karty + hero: 0 `webglcontextlost`, 0 kontekstów po bake; klawiatura, reduced motion, fallback CORS: testy zielone; LCP +5 ms vs bez efektów (Lighthouse mobile, mediana z 3). **Bramka wizualna (Piotrek, telefon): „druk czy filtr?”** — uwaga na raster na kremowym tle (parametr presetu, P4). |
| P2 Liquid + demo statyczne | nie zaczęte | — |
| P3 headless Next | nie zaczęte | — |
| P4 Paper: presety, demo, README | nie zaczęte | — |
| P5 przegląd, wydanie, zgłoszenie | nie zaczęte | — |

## Nazwy (29.10.2026)

- npm `vitrine-shaders`: **wolne** (404). Publikowana paczka = `packages/element`, React jako subpath `vitrine-shaders/react` (ADR-0001 §5).
- GitHub `PiotrekFilipecki/vitrine`: **wolne**.
- Opis bez znaków towarowych w nazwie: „Paper Shaders for Shopify themes and headless storefronts”.

## Wersje (dokładne piny)

`@paper-design/shaders` 0.0.82 · `@paper-design/shaders-react` 0.0.82 (dev, test zgodności) · React 19.3.1 (dev) · esbuild 0.28.2 (dev, bundle referencji) · lighthouse 13.6.0 (dev) · TypeScript 6.0.3 · tsup 9.0.0 · Vitest 5.0.5 · Playwright 1.64.1 · ESLint 10.13.0 · typescript-eslint 8.72.1 · Prettier 3.9.10 · pnpm 11.18.0 · Node 26.5.0.

## Zasady z tej sesji

- **Żadnych operacji na sklepach klientów** (friendzstore.pl, friendzdev, emwuhats.pl), także odczytów. Testy na własnym sklepie `niwwts-lab` (zakłada Piotrek, PLAN D13) lub na zasobach Shopify. Zapisane w CLAUDE.md.
- Fixtures do spików są syntetyczne (`examples/spikes/fixtures/make-fixtures.py`).

## Kroki ręczne (Piotrek)

1. **Bramka P1:** `pnpm build && pnpm serve`, telefon w tej samej sieci → `http://<ip-maca>:4173/examples/static/`; tap na kartę odsłania zdjęcie. Werdykt „druk czy filtr?”. Po bramce merge `p1-element` → `main`.
2. **Firefox:** `pnpm exec playwright test --project=firefox` poza sesją Claude (jak w P0: „Could not find profile folder”).
3. **Przed P2:** dev store `niwwts-lab` (pusty, PLAN D13) + `shopify auth login`; **Spike C (CORS) do powtórzenia na starcie P2 na niwwts-lab**: pomiar z P0 był na sklepie należącym do Shopify (hardware.shopify.com), nie na sklepie Piotrka; `claude mcp add --transport stdio shopify-dev-mcp -- npx -y @shopify/dev-mcp@1.18.0`.
4. **Zdjęcia do demo:** prace NIWWTS No.06 z repo shop (od P1 w `examples/spikes/fixtures/`, źródło w README); zdjęć klientów nie używamy.
5. Paper Desktop + MCP przed P4 (`claude mcp list` pokazuje `paper: ✔ Connected` już teraz).

## Gdzie co jest

- Plan: `docs/vitrine/PLAN.md` · prompty: `docs/vitrine/PROMPTY.md` · ADR: `docs/adr/0001-architektura.md` · API: `docs/vitrine/API.md` · devlogi: `docs/vitrine/devlog/P0-spiki.md`, `P1-element.md` · dowody: `docs/media/p0-*`, `p1-*` · spiki: `examples/spikes/` · element: `packages/element/` · demo: `examples/static/` · Lighthouse: `node scripts/lighthouse.mjs`.
