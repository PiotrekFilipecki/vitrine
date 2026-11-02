# VITRINE · STATUS

Aktualizacja: 03.11.2026, Q1 domknięte na polecenie Piotrka („rób wszystko do końca”): `r0-kierunek` i `q1-trzy-efekty` zmergowane fast-forward do lokalnego `main`, tag `v0.2.0`, wersje paczek 0.2.0, README/CHANGELOG/ROADMAP/submission na v0.2, motyw testowy (lokalna kopia `examples/theme-test/live`) przepięty na snippety v0.2. **Niewypchnięte:** push odrzucony przez GitHub (token `gh` bez zakresu `workflow`), deploy Vercel prod zablokowany przez uprawnienia sesji, npm i Shopify CLI wymagają logowania. Wszystko, co zostało, robi jeden skrypt: `bash scripts/release-0.2.sh` (Terminal.app). Decyzja: `docs/adr/0003-v02-trzy-efekty.md`. Devlog: `docs/vitrine/devlog/Q1-trzy-efekty.md`.

Wcześniej: 30.10.2026, R0 (reset kierunku) na gałęzi `r0-kierunek` od `main` (`85b9349`, z Q0). Commit R0 powstał po wstępnym przeglądzie Cowork; pełna weryfikacja Cowork zakończyła się 30.10.2026 ok. 01:20 werdyktem „gotowe” (`docs/vitrine/raport-weryfikacji-R0.md`, skopiowany w Q1). Decyzja: `docs/adr/0002-kierunek-v2.md` + `docs/vitrine/KIERUNEK-v2.md` (zastępuje PLAN D13 i domyślny dither). PROMPTY-v02 Q1–Q4 wstrzymane do bramki R0. Devlog: `docs/vitrine/devlog/R0-kierunek.md`.

Wcześniej: 29.10.2026, koniec Q0 (v0.2) na gałęzi `q0-blokery` od `main` (= v0.1.0 + docs). Prompty v0.2: `docs/vitrine/PROMPTY-v02.md`, devlog: `docs/vitrine/devlog/Q0-blokery.md`. Niżej historia P0–P5 bez zmian.

Wcześniej: 29.10.2026, koniec P2 (wykonane po P3). `main` = P0. Gałęzie: `p1-element` → `p3-headless` → `p2-liquid` (każda od poprzedniej; czekają na bramki). Piotrek merguje po bramkach w kolejności p1 → p3 → p2. Dev store: `niwwts.myshopify.com` (12 produktów NIWWTS zaimportowanych z `examples/niwwts-products.csv`; motyw testowy „VITRINE test (p2)” id 193335820605, nieopublikowany).

## Fazy

| Faza | Stan | Bramka |
|---|---|---|
| P0 fundament + spiki | **zrobione** | bake: potwierdzony (0 różnych pikseli, Chromium + WebKit); CORS: potwierdzony (ACAO `*` na obu wariantach URL, tekstura działa). Firefox: niezmierzony (build Playwrighta nie startuje na tej maszynie). Decyzja Piotrka: propozycje P1/P2 w ADR-0001 (piekarnik współdzielony; ochrona żywych montaży w WebKit). |
| P1 element | **zrobione** | zgodność pikseli z React: 0 różnych px, 8/8 przypadków, Chromium + WebKit; 24 karty + hero: 0 `webglcontextlost`, 0 kontekstów po bake; klawiatura, reduced motion, fallback CORS: testy zielone; LCP +5 ms vs bez efektów (Lighthouse mobile, mediana z 3). **Bramka wizualna (Piotrek, telefon): „druk czy filtr?”** — uwaga na raster na kremowym tle (parametr presetu, P4). |
| P2 Liquid + demo statyczne | **zrobione** | `theme check` 0 błędów w plikach VITRINE; `theme-markup.html` 9/9 (Chromium + WebKit); na sklepie (proxy `theme dev`) 8/8: 12/12 kart w `<vitrine-shader>`, 0 canvasów, 1 żądanie `vitrine.js`; Spike C na własnym sklepie: ACAO `*` oba warianty; Lighthouse mobile na CDN: 100 vs 99, LCP 1 808 vs 1 938 ms (Δ −130), CLS 0; edytor: zmiana koloru, add/remove/drag sekcji, grupa ustawień. **Bramka (Piotrek, telefon + edytor): kolory hero i karty bez kodu.** |
| P3 headless Next | **zrobione** (przed P2) | SSR = zwykły `<img>`; 7 testów SSR + 7 e2e na buildzie produkcyjnym (Chromium + WebKit): 25 wypalonych, 1 żywy hero, 0 kontekstów po bake, 0 błędów hydracji; Lighthouse mobile ΔLCP **−2 ms** (755 vs 757), CLS 0, TBT +134 ms; wrappery 860 B gz. **Bramka (Piotrek, telefon): ta sama karta co w `examples/static`.** Tryb Storefront API niewykonany na sklepie (brak tokena). |
| P4 Paper: presety, demo, README | **w toku** na `p4-paper` (od p2): plik Paper „VITRINE — presets” (4 ramki × 3 warianty) i „Demo page” (1440/390) zbudowane przez MCP; strona demo przeniesiona do kodu; README z 2 GIF-ami; process.md. X1 zrobione przez agenta na renderach elementu (polecenie Piotrka): `newsprint` 3 kroki, `riso` bez C, `folded-lookbook` pełne zagięcie, nowy `acid-night`; zgodność 16/16. | README jak obcy developer: 30 s; strona demo nie wygląda jak szablon |
| P5 przegląd, wydanie, zgłoszenie | **w toku** na `p5-wydanie` (od p4): wersje 0.1.0, subpath `vitrine-shaders/react` składany do paczki, `npm publish --dry-run` 26 plików / 135,8 kB, zip motywu, CHANGELOG, ROADMAP, submission.md; skan sekretów grepem po drzewie i historii: czysty (gitleaks nie zainstalowany). Czeka na: review (W1), presety z P4. | checklista niżej |
| Q0 blokery zgłoszenia + porządki | **zrobione** na `q0-blokery`, czeka na bramkę | B1 grep czysty; B2 raster na kremowym tle 23,6 % → 0 % (`whitePoint`), zgodność 16/16; B3 12 unikalnych kart, siatka bez pustych pasów 390/768/1024/1440 (test); B4 Lighthouse mobile demo 96 vs 96, TBT 63 ms, ΔLCP 0, CLS 0 (było 70, TBT 525, CLS 0,329); B5 hero z lupą; B6 Next buduje się bez sieci; B7 workflow Pages; B8 checklista niżej. Otwarte: Next TBT 236 vs 148 ms w v0.1.0 (Commit kompozytora). **Bramka (Piotrek, telefon): katalog jak druk, nie brud; hero od razu pokazuje, co robi.** |
| R0 reset kierunku wizualnego | **zrobione** na `r0-kierunek` (commit lokalny, niewypchnięty); bramka Cowork 30.10.2026: raport `docs/vitrine/raport-weryfikacji-R0.md` (werdykt „gotowe”, 4 drobne niezgodności, poprawione w Q1 · G0) | 12 zdjęć produktów (Unsplash License, `examples/fixtures/CREDITS.md`), 10 arkuszy `docs/media/r0-*.webp` (+ `.json`), przejścia szyby, lupy i wody (pasek + MP4), makieta `examples/static/r0-hero.html` (wazon w hero, krzesło w karcie, na 390 px zdjęcie od 266,5 px). **Na Q1: szyba (karta), szyba pre-order z datą, lupa.** Na później: water, grain-gradient. Odpada: paper-texture, liquid-metal, pulsing-border, image-dithering, halftone-cmyk. Pełne PNG/GIF lokalnie (gitignore). |
| Q1 trzy efekty (v0.2) | **zrobione**, zmergowane do lokalnego `main` (tag `v0.2.0`), czeka na push i bramkę | G0 poprawki raportu R0 (zegarek i słuchawki bez znaków, STATUS, fallback fontu); ADR-0003; `effect="glass"` + `lens`, `bind` (pointer, data), `reveal="tap"`, slot interakcji (max 1 kontekst); React `GlassProductImage` / `PreorderGlassImage` / `LoupeImage`; Liquid 3 snippety (`custom.release_date`); demo „Store” (static + Next), NIWWTS poza `examples/`. Zgodność pikseli glass/lens: 10/10 ≤ 1 % (Chromium + WebKit); e2e Chromium + WebKit 109 passed, 9 skipped; Firefox nie startuje. Lighthouse mobile static 99, TBT 29 ms, CLS 0; ramka w ruchu szyby (CPU ×4): karta 16,7 ms, hero mediana 24,9 ms; konteksty po załadowaniu 0. **Bramka (Piotrek, telefon): karta za szybą, tap → szyba się rozsuwa; lupa na PDP; przedsprzedaż matowieje do daty. Chwalisz się tym?** |

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

## Bramka Q1 i wydanie 0.2.0

1. [x] Merge `r0-kierunek` → `q1-trzy-efekty` → `main` (fast-forward), tag `v0.2.0` (03.11.2026, lokalnie).
2. [x] README, CHANGELOG 0.2.0, `packages/*/package.json` 0.2.0, README paczki npm, ROADMAP, `submission.md` na v0.2; media README z Q1 (stare NIWWTS usunięte).
3. [x] `npm publish --dry-run`: `vitrine-shaders@0.2.0`, 32 pliki, 183,0 kB; zip motywu `release/vitrine-shopify-theme-0.2.0.zip` (71,8 kB); strona Pages złożona lokalnie (`scripts/pages-site.mjs`: 83 pliki, 1 747,6 KB).
4. [x] Motyw testowy: `examples/theme-test/live` (gitignored) z `vitrine-glass-card` / `vitrine-preorder-card` na kartach i `vitrine-loupe-media` na głównym zdjęciu PDP; theme check: 0 błędów w plikach VITRINE (2 błędy w plikach Horizonu: filtr `applicable_disclosures` nieznany theme-check 4.9.4).
5. [ ] **`bash scripts/release-0.2.sh` w Terminal.app** (wymaga Twoich logowań): zakres `workflow` dla `gh` + push, repo publiczne, GitHub Pages, GitHub Release z zipem, `vercel deploy --prod`, `npm publish`, `shopify theme push` na motyw testowy, Firefox.
6. [ ] Telefon: `https://piotrekfilipecki.github.io/vitrine/examples/static/` i `https://vitrine-hazel-three.vercel.app/` (tap na kartę, przytrzymanie palca w PDP, sekcja Pre-order). Chwalisz się tym? Jeśli nie, Q1.1.
7. [ ] Zgłoszenia z `docs/vitrine/submission.md` (Codrops → komentarz → X → Discord Papera) dopiero po bramce z punktu 6: to Twoje konta i Twój głos, nie wysyłam ich za Ciebie.

## Bramka R0 (Cowork, potem Piotrek)

1. [x] Cowork: arkusze, licencje, oceny (30.10.2026). Decyzje Piotrka w devlogu R0, sekcja „Decyzje bramki R0”.
2. [ ] Piotrek: makieta na telefonie: `node examples/r0/build.mjs && pnpm serve` → `http://<ip-maca>:4173/examples/static/r0-hero.html`.
3. [ ] Merge `r0-kierunek` → `main` po obejrzeniu; push decyduje Piotrek.
4. [ ] Przepisać PROMPTY-v02 Q1–Q4 pod wybrane efekty; Q1 przepisuje też stare demo NIWWTS (`examples/static/index.html`, `stress.html`, `examples/next-headless`) na nowy kierunek, fixtures NIWWTS zostają tylko w testach zgodności.
5. Upublicznienie z sekcji niżej czeka, aż demo będzie w nowym kierunku.

## Po Q0: upublicznienie (B8, Piotrek, w tej kolejności)

Kolejność ma znaczenie: README paczki npm linkuje do repo, a workflow Pages rusza dopiero przy publicznym repo.

1. [ ] **Bramka Q0 na telefonie**, potem merge `q0-blokery` → `main` (`git checkout main && git merge --ff-only q0-blokery && git push origin main`).
2. [ ] **Repo publiczne:** `gh repo edit PiotrekFilipecki/vitrine --visibility public --accept-visibility-change-consequences` (albo Settings → Danger zone → Change visibility). Przed tym nic nie trzeba czyścić: gitleaks na całej historii był czysty w P5, Q0 nie dodał sekretów.
3. [ ] **GitHub Pages:** Settings → Pages → Build and deployment → Source: **GitHub Actions**. Potem Actions → „Pages (static demo)” → Run workflow (albo dowolny push na `main`). Workflow `.github/workflows/pages.yml` buduje paczki, odpala `pnpm test`, składa `_site/` (`node scripts/pages-site.mjs`) i publikuje. Adres: `https://piotrekfilipecki.github.io/vitrine/examples/static/` (korzeń przekierowuje). Podmień `TODO_PAGES_URL` w README.
4. [ ] **npm:** najpierw decyzja o wersji. `packages/element` i `packages/react` mają `0.1.0`, a kod na `main` po Q0 różni się od tagu `v0.1.0` (whitePoint, kolejka, odczyt asynchroniczny). Rekomendacja: podbij obie paczki do `0.2.0` i dopisz datę w CHANGELOG, potem:
   `npm login` → `pnpm build` → `cd packages/element && npm publish --dry-run` (oczekiwane 26 plików, ok. 146 kB) → `npm publish`. Nazwa `vitrine-shaders` była wolna 29.10.2026.
   Alternatywa bez zmiany wersji: publish z tagu (`git checkout v0.1.0 && pnpm install && pnpm build && cd packages/element && npm publish`), wtedy README na `main` opisuje opcje, których w paczce nie ma.
5. [ ] **Vercel (headless):** vercel.com → Add New → Project → import `PiotrekFilipecki/vitrine` → Root Directory `examples/next-headless` → Framework Next.js → Deploy. Zmienne środowiskowe nie są potrzebne (fixtures z repo); tryb sklepu: dwie zmienne z `examples/next-headless/.env.example`. Build działa bez sieci od Q0 (lokalny Archivo). Podmień `TODO_VERCEL_URL` w README i `TODO_DEMO_URL` w `docs/vitrine/submission.md`.
6. [ ] `examples/niwwts-products.csv`: po upublicznieniu można przepiąć URL-e obrazów na `raw.githubusercontent.com/…/examples/spikes/fixtures/`.
7. [ ] Zgłoszenia dopiero po Q2 (prompt v0.2): Codrops → komentarz pod przewodnikiem → X → Discord Papera.
8. [ ] Motyw testowy „VITRINE test (p2)” na `niwwts.myshopify.com` ma kod v0.1.0; plik `shopify-theme/assets/vitrine.js` w repo jest już z Q0 (46,1 KB gzip). Pomiar na sklepie: niewykonany w Q0.

## Przed upublicznieniem (P5 · W6, Piotrek, historia)

- [x] P4 X1: presety zestrojone (na renderach elementu), `presets/*.json` zapisane, testy zgodności 16/16.
- [x] Merge gałęzi `p1-element` → `p3-headless` → `p2-liquid` → `p4-paper` → `p5-wydanie` do `main` (fast-forward, 29.10.2026, na polecenie „zrob to wszystko za mnie”; bramki na telefonie nadal warto przejść).
- [x] `gitleaks detect --source . --log-opts=--all`: 18 commitów, no leaks found (29.10.2026).
- [x] Repo na GitHubie: https://github.com/PiotrekFilipecki/vitrine, **prywatne** (decyzja Piotrka 29.10.2026), `main` + tag + gałęzie fazowe wypchnięte. [ ] Przełączenie na publiczne przed zgłoszeniami: Settings → Danger zone → Change visibility (albo `gh repo edit --visibility public --accept-visibility-change-consequences`); GIF-y z `raw.githubusercontent.com` zadziałają wtedy w README.
- [ ] Demo na Vercelu (odłożone na później, decyzja Piotrka): import repo, Root Directory `examples/next-headless`; URL do README i do `docs/vitrine/submission.md` (`TODO_DEMO_URL`).
- [ ] `examples/niwwts-products.csv`: URL-e obrazów wskazują na assety motywu testowego w sklepie; po upublicznieniu repo można podmienić na `raw.githubusercontent.com/…/examples/spikes/fixtures/`.
- [ ] `npm login`, `cd packages/element && npm publish` (dry-run: 26 plików). Dopiero gdy repo będzie publiczne: README paczki linkuje do repo.
- [x] Tag `v0.1.0` wypchnięty; GitHub Release `v0.1.0` z zipem motywu (`vitrine-shopify-theme-0.1.0.zip`) utworzony.
- [ ] Zgłoszenia z `docs/vitrine/submission.md` w kolejności: formularz Codrops → komentarz pod przewodnikiem → X → Discord Papera / r/paperdesign.
- [ ] Motyw testowy „VITRINE test (p2)” w `niwwts.myshopify.com` zostaje nieopublikowany albo usuń go sam.
