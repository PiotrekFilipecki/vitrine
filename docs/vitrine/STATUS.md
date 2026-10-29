# VITRINE · STATUS

Aktualizacja: 29.10.2026, koniec P0. Gałąź `p0-fundament` (3 commity + docs), `main` ma tylko kopię planu. Merge do `main` po bramce P0 (Piotrek).

## Fazy

| Faza | Stan | Bramka |
|---|---|---|
| P0 fundament + spiki | **zrobione** | bake: potwierdzony (0 różnych pikseli, Chromium + WebKit); CORS: potwierdzony (ACAO `*` na obu wariantach URL, tekstura działa). Firefox: niezmierzony (build Playwrighta nie startuje na tej maszynie). Decyzja Piotrka: propozycje P1/P2 w ADR-0001 (piekarnik współdzielony; ochrona żywych montaży w WebKit). |
| P1 element | nie zaczęte | — |
| P2 Liquid + demo statyczne | nie zaczęte | — |
| P3 headless Next | nie zaczęte | — |
| P4 Paper: presety, demo, README | nie zaczęte | — |
| P5 przegląd, wydanie, zgłoszenie | nie zaczęte | — |

## Nazwy (29.10.2026)

- npm `vitrine-shaders`: **wolne** (404). Publikowana paczka = `packages/element`, React jako subpath `vitrine-shaders/react` (ADR-0001 §5).
- GitHub `PiotrekFilipecki/vitrine`: **wolne**.
- Opis bez znaków towarowych w nazwie: „Paper Shaders for Shopify themes and headless storefronts”.

## Wersje (dokładne piny)

`@paper-design/shaders` 0.0.82 · TypeScript 6.0.3 · tsup 9.0.0 · Vitest 5.0.5 · Playwright 1.64.1 · ESLint 10.13.0 · typescript-eslint 8.72.1 · Prettier 3.9.10 · pnpm 11.18.0 · Node 26.5.0.

## Zasady z tej sesji

- **Żadnych operacji na sklepach klientów** (friendzstore.pl, friendzdev, emwuhats.pl), także odczytów. Testy na własnym sklepie `vitrine-demo` (zakłada Piotrek przed P2) lub na zasobach Shopify. Zapisane w CLAUDE.md.
- Fixtures do spików są syntetyczne (`examples/spikes/fixtures/make-fixtures.py`).

## Kroki ręczne (Piotrek)

1. **Firefox:** `cd ~/Desktop/Projects/vitrine && pnpm exec playwright test --project=firefox` poza sesją Claude. Jeśli dalej „Could not find profile folder”, to problem buildu Playwrighta na macOS 27, do zgłoszenia/obejścia później; nie blokuje P1.
2. **Decyzja przed P1:** przyjąć propozycje P1 i P2 z ADR-0001 (rekomendacja: tak, obie).
3. **Przed P2:** dev store `vitrine-demo` (test data) + `shopify auth login`; `claude mcp add --transport stdio shopify-dev-mcp -- npx -y @shopify/dev-mcp@1.18.0`.
4. **Zdjęcia do demo (P1/P4):** własne marki (NIWWTS) albo dane testowe `vitrine-demo`; zdjęć klientów nie używamy.
5. Paper Desktop + MCP przed P4 (`claude mcp list` pokazuje `paper: ✔ Connected` już teraz).

## Gdzie co jest

- Plan: `docs/vitrine/PLAN.md` · prompty: `docs/vitrine/PROMPTY.md` · ADR: `docs/adr/0001-architektura.md` · devlog: `docs/vitrine/devlog/P0-spiki.md` · dowody: `docs/media/p0-*` · spiki: `examples/spikes/`.
