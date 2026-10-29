# VITRINE · STATUS

Aktualizacja: 29.10.2026, koniec P2 (wykonane po P3). `main` = P0. Gałęzie: `p1-element` → `p3-headless` → `p2-liquid` (każda od poprzedniej; czekają na bramki). Piotrek merguje po bramkach w kolejności p1 → p3 → p2. Dev store: `niwwts.myshopify.com` (12 produktów NIWWTS zaimportowanych z `examples/niwwts-products.csv`; motyw testowy „VITRINE test (p2)” id 193335820605, nieopublikowany).

## Fazy

| Faza | Stan | Bramka |
|---|---|---|
| P0 fundament + spiki | **zrobione** | bake: potwierdzony (0 różnych pikseli, Chromium + WebKit); CORS: potwierdzony (ACAO `*` na obu wariantach URL, tekstura działa). Firefox: niezmierzony (build Playwrighta nie startuje na tej maszynie). Decyzja Piotrka: propozycje P1/P2 w ADR-0001 (piekarnik współdzielony; ochrona żywych montaży w WebKit). |
| P1 element | **zrobione** | zgodność pikseli z React: 0 różnych px, 8/8 przypadków, Chromium + WebKit; 24 karty + hero: 0 `webglcontextlost`, 0 kontekstów po bake; klawiatura, reduced motion, fallback CORS: testy zielone; LCP +5 ms vs bez efektów (Lighthouse mobile, mediana z 3). **Bramka wizualna (Piotrek, telefon): „druk czy filtr?”** — uwaga na raster na kremowym tle (parametr presetu, P4). |
| P2 Liquid + demo statyczne | **zrobione** | `theme check` 0 błędów w plikach VITRINE; `theme-markup.html` 9/9 (Chromium + WebKit); na sklepie (proxy `theme dev`) 8/8: 12/12 kart w `<vitrine-shader>`, 0 canvasów, 1 żądanie `vitrine.js`; Spike C na własnym sklepie: ACAO `*` oba warianty; Lighthouse mobile na CDN: 100 vs 99, LCP 1 808 vs 1 938 ms (Δ −130), CLS 0; edytor: zmiana koloru, add/remove/drag sekcji, grupa ustawień. **Bramka (Piotrek, telefon + edytor): kolory hero i karty bez kodu.** |
| P3 headless Next | **zrobione** (przed P2) | SSR = zwykły `<img>`; 7 testów SSR + 7 e2e na buildzie produkcyjnym (Chromium + WebKit): 25 wypalonych, 1 żywy hero, 0 kontekstów po bake, 0 błędów hydracji; Lighthouse mobile ΔLCP **−2 ms** (755 vs 757), CLS 0, TBT +134 ms; wrappery 860 B gz. **Bramka (Piotrek, telefon): ta sama karta co w `examples/static`.** Tryb Storefront API niewykonany na sklepie (brak tokena). |
| P4 Paper: presety, demo, README | **w toku** na `p4-paper` (od p2): plik Paper „VITRINE — presets” (4 ramki × 3 warianty) i „Demo page” (1440/390) zbudowane przez MCP; strona demo przeniesiona do kodu; README z 2 GIF-ami; process.md. X1 zrobione przez agenta na renderach elementu (polecenie Piotrka): `newsprint` 3 kroki, `riso` bez C, `folded-lookbook` pełne zagięcie, nowy `acid-night`; zgodność 16/16. | README jak obcy developer: 30 s; strona demo nie wygląda jak szablon |
| P5 przegląd, wydanie, zgłoszenie | **w toku** na `p5-wydanie` (od p4): wersje 0.1.0, subpath `vitrine-shaders/react` składany do paczki, `npm publish --dry-run` 26 plików / 135,8 kB, zip motywu, CHANGELOG, ROADMAP, submission.md; skan sekretów grepem po drzewie i historii: czysty (gitleaks nie zainstalowany). Czeka na: review (W1), presety z P4. | checklista niżej |

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
3. **Spike C powtórzony na `niwwts.myshopify.com` w P2** (ACAO `*`, tekstura działa; `docs/media/p2-cors-*`). Shopify Dev MCP nadal niepodłączony (`claude mcp add --transport stdio shopify-dev-mcp -- npx -y @shopify/dev-mcp@1.18.0`), zastąpiony przez `shopify theme check`.
4. **Zdjęcia do demo:** prace NIWWTS No.06 z repo shop (od P1 w `examples/spikes/fixtures/`, źródło w README); zdjęć klientów nie używamy.
5. Paper Desktop + MCP przed P4 (`claude mcp list` pokazuje `paper: ✔ Connected` już teraz).
6. **Bramka P3:** `pnpm build && pnpm --filter next-headless start`, telefon → `http://<ip-maca>:3000/`. Po bramce merge `p3-headless` → `main` (po p1).
7. **Tryb sklepu w P3:** kanał Headless w `niwwts.myshopify.com` → publiczny token Storefront API → `examples/next-headless/.env.local` (wzór `.env.example`). Vercel: import z Root Directory `examples/next-headless` (nie wdrażam sam).
8. **Logowanie CLI:** `shopify auth login` w zwykłym Terminal.app (prefiks `!` w Claude Code jest nieinteraktywny i CLI żąda `--alias`). Zrobione 29.10.2026.
9. **P4 · X1:** zrobione przez agenta; następna runda strojenia w Paperze (plik „VITRINE — presets”, https://app.paper.design/file/01M64ER5PDV2TPY8N2M73DBSZP) kiedy będziesz chciał; `process.md` ma tabelę przed/po.
10. **Bramka P2:** podgląd `https://niwwts.myshopify.com?preview_theme_id=193335820605` na telefonie + edytor motywu (kolory hero, Theme settings → VITRINE). Motyw testowy usuń sam, gdy zbędny.

## Gdzie co jest

- Plan: `docs/vitrine/PLAN.md` · prompty: `docs/vitrine/PROMPTY.md` · ADR: `docs/adr/0001-architektura.md` · API: `docs/vitrine/API.md` · devlogi: `docs/vitrine/devlog/P0-spiki.md`, `P1-element.md`, `P2-liquid.md`, `P3-headless.md` · dowody: `docs/media/p0-*`, `p1-*`, `p2-*`, `p3-*` · motyw: `shopify-theme/` (build `pnpm --filter vitrine-shaders exec tsup --config tsup.theme.config.ts`) · CSV: `examples/niwwts-products.csv` · test motywu: `examples/theme-test/README.md` · spiki: `examples/spikes/` · element: `packages/element/` · wrappery React: `packages/react/` · demo: `examples/static/` · headless: `examples/next-headless/` · Lighthouse: `node scripts/lighthouse.mjs static|next`.

## Przed upublicznieniem (P5 · W6, Piotrek)

- [x] P4 X1: presety zestrojone (na renderach elementu), `presets/*.json` zapisane, testy zgodności 16/16.
- [ ] Merge gałęzi w kolejności `p1-element` → `p3-headless` → `p2-liquid` → `p4-paper` → `p5-wydanie` do `main` (fast-forward).
- [x] `gitleaks detect --source . --log-opts=--all`: 18 commitów, no leaks found (29.10.2026).
- [ ] Repo publiczne na GitHubie (`PiotrekFilipecki/vitrine`); GIF-y w README działają z `raw.githubusercontent.com` (≤ 4 MB: 2,5 MB i 1,9 MB).
- [ ] Demo na Vercelu: import repo, Root Directory `examples/next-headless`; URL wpisany do README (sekcja "Repo") i do `docs/vitrine/submission.md` (`TODO_DEMO_URL`); `TODO_REPO_URL`, `TODO_GIF_URL` podmienione.
- [ ] `examples/niwwts-products.csv`: URL-e obrazów wskazują na assety motywu testowego w sklepie; po upublicznieniu repo można podmienić na `raw.githubusercontent.com/…/examples/spikes/fixtures/`.
- [ ] `npm login`, `cd packages/element && npm publish` (dry-run pokazał 26 plików: LICENSE, NOTICE, README, dist z `dist/react`, bez testów i fixtures).
- [ ] `git tag v0.1.0` na commicie wydania i push tagu; zip z `pnpm pack:theme` jako asset release na GitHubie.
- [ ] Zgłoszenia z `docs/vitrine/submission.md` w kolejności: formularz Codrops → komentarz pod przewodnikiem → X → Discord Papera / r/paperdesign.
- [ ] Motyw testowy „VITRINE test (p2)” w `niwwts.myshopify.com` zostaje nieopublikowany albo usuń go sam.
