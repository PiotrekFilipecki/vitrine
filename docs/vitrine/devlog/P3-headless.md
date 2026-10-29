# P3 · Headless Next.js (wrappery React + przykład ze Storefront API)

Data: 29.10.2026. Gałąź `p3-headless` (od `p1-element`, bo P3 używa elementu z P1, a `main` ma tylko P0; po merge P1 → `main` gałąź przechodzi fast-forward). Sklep testowy: `niwwts.myshopify.com` (założony przez Piotrka w trakcie tej fazy; w PROMPTY nazywany `niwwts-lab`). Tryb Storefront API **niewykonany na realnym sklepie** (brak tokena w tej sesji, patrz „Pominięte”).

## Skille

| Skill | Po co | Co zmienił w wyniku |
| --- | --- | --- |
| react-next-perf | kolejność optymalizacji (waterfall → granica klienta → bundle → obrazy) | `searchParams` i produkty w jednym `Promise.all`; `'use client'` tylko w wrapperach (860 B gz), karta, link i `next/image` zostają serwerowe; element ładowany po hydracji jako osobny chunk (`import('vitrine-shaders')` w `useEffect`), więc `?vitrine=off` nie ściąga go wcale; `sizes` na każdym obrazie, `priority` na 4 pierwszych kartach; zero `useMemo`/`useCallback` |
| a11y-gate | WCAG 2.2 AA | skip link, `main`/`header`/`footer`, jeden `h1` na stronę, `alt` z `altText` Storefront (null → `alt=""`), `width`/`height` z API (CLS 0), `:focus-visible` na kartach i przycisku powrotu, reduced motion w teście; kontrast jak w P1 (tusz/papier 15,74:1, blue-rice 5,10:1) |
| test-engineer | co testować na jakim poziomie | 7 testów Vitest na `renderToStaticMarkup` bez DOM (serwer daje `<img>` z `alt`/`width`/`height`, `params` → JSON, `className` → `class`, `children` zastępują `<img>`); 7 testów Playwright na buildzie produkcyjnym (`next start`), bez retry; test `?vitrine=off` sprawdza brak chunku z `ShaderMount` w sieci |
| security-perf-auditor | token Storefront API, wejście z URL | `import 'server-only'` w kliencie Storefront, zmienne bez `NEXT_PUBLIC_`, token nigdy w bundlu; walidacja domeny (`*.myshopify.com`) i `handle` (`^[a-z0-9][a-z0-9-]{0,99}$`) przed zapytaniem; GraphQL przez `variables`, nie konkatenację; `remotePatterns` tylko `cdn.shopify.com/s/files/**`; nagłówki `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`; brak CSP (patrz backlog) |
| taste-guardrail | Lock przed wyglądem, Exit Check przed oddaniem | Lock z P1 przeniesiony 1:1 (świat: arkusz drukarski NIWWTS, Archivo na osi szerokości, papier + tusz + blue-rice, lead na 2 kolumny, płyta tuszu domykająca arkusz); strona produktu: podział 62/38, tekst przyklejony do krawędzi, `halftone/riso` jako jedyny moment oranżu. Exit Check niżej |
| niwwts-aesthetic | arbiter stylu sklepu demo | strona produktu w `halftone/riso`: oranż No.06 pojawia się tylko jako kanał M wewnątrz rastra pracy (powierzchnia pod tuszem, nigdy tekst); kod katalogowy to jedyny kolor w tekście; audyt 6/8 niżej |
| motion-design | reveal | bez zmian wobec P1: 320 ms, `cubic-bezier(.2,0,0,1)`, tylko `opacity`; reduced motion = bez przejścia |
| piotrek-frontend-design | przeniesienie markupu statycznego do komponentów | te same klasy co `examples/static` (i co sekcje Liquid w P2), żeby „ta sama karta wyglądała tak samo” |

## Wersje (sprawdzone `npm view` 29.10.2026, przypięte dokładnie)

Next.js **16.4.3** (stable, opublikowany 23.10.2026; 16.5 tylko canary), React **19.3.1**, react-dom 19.3.1, @types/react 19.3.0, @types/react-dom 19.3.0, TypeScript 6.0.3 (z workspace). Storefront API **2026-10** (najnowsza stabilna wg shopify.dev/docs/api/usage/versioning; 2027-01 to RC). Peer dependency wrapperów: `react`/`react-dom` `>=19.0.0 <20.0.0` (zakres, nie pin: to deklaracja zgodności, instalację przypina aplikacja).

## R1 · `packages/react` (publikowane jako `vitrine-shaders/react`, ADR-0001 §5)

- `ProductMediaShader`, `EditorialImageShader` (obraz w kształcie Storefront `{ url, altText, width, height }`, domyślne `dither/newsprint` i `paper/folded-lookbook`, `reveal="hover"`), `CollectionHeroShader` (mesh, `aria-hidden`, skrót `colors`). Wszystkie `'use client'` (dyrektywa w `dist/index.js`, tsup `banner`).
- Bez `children` renderują zwykły `<img src alt width height>`; z `children` renderują to, co podasz (`next/image`). HTML z serwera = obraz, który działa bez JS.
- Rejestracja elementu: `registerVitrine()` robi `import('vitrine-shaders')` raz, tylko w przeglądarce, z `useEffect` pierwszego zamontowanego wrappera. Serwer nigdy nie importuje runtime'u; w Next element jest osobnym chunkiem ładowanym po hydracji.
- Typy JSX: `declare module 'react' { namespace JSX { IntrinsicElements['vitrine-shader'] } }` w `dist/index.d.ts`.
- React 19 i custom elements: `className` → `class` (sprawdzone w teście), `params` jako string JSON, `speed` jako liczba → atrybut. React dokleja `<link rel="preload" as="image">` dla obrazów bez `loading="lazy"`; testy to odfiltrowują.

Rozmiar: `dist/index.js` 2 314 B, **860 B gzip**.

## R2 · `examples/next-headless`

Strona główna (hero mesh `drop-night`, 24 karty `dither/newsprint`, sekcja edytorska `paper/folded-lookbook`), strona produktu `/products/[handle]` (`halftone/riso`), 404. Dane: `lib/catalog.ts` przełącza `fixtures` ↔ `storefront` po obecności `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_PUBLIC_TOKEN`; stopka mówi, który tryb działa. Fixtures kopiowane do `public/fixtures/` skryptem `scripts/sync-fixtures.mjs` (`predev`/`prebuild`, folder ignorowany w git), więc Vercel buduje bez symlinków. Obrazy przez `next/image` → `/_next/image?url=…`, czyli tekstura shadera jest **same-origin** także dla `cdn.shopify.com` (CORS nie wchodzi w grę; element czyta `img.currentSrc`). `?vitrine=off` renderuje ten sam markup bez elementu (i bez jego chunku).

Workspace: `examples/next-headless` dodany do `pnpm-workspace.yaml`; `pnpm build` buduje paczki, potem przykład; `pnpm typecheck` robi `next typegen && tsc`. Next przy pierwszym buildzie dopisał do `tsconfig.json` przykładu `jsx: react-jsx` i `.next/dev/types/**` (zostawione, to jego standard).

## Komendy (końcówki, kod wyjścia 0)

```
$ pnpm build
packages/element: ESM ⚡️ Build success, DTS ⚡️ Build success
packages/react:   ESM dist/index.js 2.26 KB, DTS dist/index.d.ts 4.02 KB ⚡️ Build success
next-headless:    ▲ Next.js 16.4.3 (Turbopack) ✓ Compiled successfully in 1357ms
                  Route (app)  ƒ /   ○ /_not-found   ƒ /products/[handle]

$ pnpm typecheck
packages/element typecheck: Done · packages/react typecheck: Done · next-headless: ✓ Types generated successfully (tsc: 0 błędów)

$ pnpm lint
eslint . && prettier --check . → All matched files use Prettier code style!

$ pnpm test
Test Files 6 passed (6) · Tests 32 passed (32)   (26 z P1 − 1 szkielet P0 + 7 nowych SSR)

$ pnpm exec playwright test examples/next-headless --project=chromium --project=webkit
13 passed, 1 skipped (29.4s)   (skip = zrzuty tylko w Chromium)

$ pnpm exec playwright test --project=chromium --project=webkit   (cała suita P0–P3)
58 passed, 2 skipped (1.5m)   (P0 spiki + P1 element + P3 Next; skip = zrzuty tylko w Chromium)
```

## Pomiary

**Sonda na buildzie produkcyjnym (1440×900, po `load` + przewinięciu całej strony; `docs/media/p3-next-{chromium,webkit}.json`):**

| | Chromium | WebKit |
| --- | --- | --- |
| elementów / wypalonych / żywych | 26 / 25 / 1 (hero) | 26 / 25 / 1 |
| canvasów w kartach · hostów piekarnika po idle | 0 · 0 | 0 · 0 |
| `webgl2.isContextLost()` hero | false | false |
| żądania obrazów (`/_next/image`) · bezpośrednie `/fixtures/` | 14 · 0 | 17 · 0 |
| błędy w konsoli (w tym hydracja) | 0 (tylko ostrzeżenia sterownika GPU „stall due to ReadPixels”, jak w P1) | 0 |

**JS na stronie głównej (Chromium, raw bajty po `load`):** z efektami 574 803 B w 11 plikach, bez (`?vitrine=off`) 480 169 B w 7 plikach. Różnica = chunk elementu (34 173 B raw / 11 251 B gz) + chunki efektów dither/mesh/paper/szum, ładowane dopiero po hydracji. W trybie off w sieci nie ma żadnego pliku zawierającego `ShaderMount` (asercja w teście).

**Lighthouse mobile (Chromium Playwrighta, `next start`, 3 przebiegi, mediana; `node scripts/lighthouse.mjs next` → `docs/media/p3-lighthouse.json`):**

| | Score | LCP | CLS | TBT | FCP |
| --- | --- | --- | --- | --- | --- |
| z VITRINE | 99 | 755 ms | 0 | 143 ms | 755 ms |
| `?vitrine=off` | 100 | 757 ms | 0 | 9 ms | 757 ms |
| Δ | −1 | **−2 ms** (próg PLAN: ≤ +100 ms) | 0 | +134 ms | −2 ms |

Dla porównania P1 (statyczna strona, obrazy pełnowymiarowe, element importowany w `<head>`): LCP 1 546 ms, TBT 587 ms. W Next LCP spada przez `next/image` (srcset pod `sizes`, `priority` na pierwszym rzędzie) i self-hostowany font, a TBT przez to, że element dochodzi po hydracji i karty poza ekranem wypalają się dopiero, gdy ich leniwe obrazy się załadują.

## Zrzuty (`docs/media/p3-next-390.png`, `p3-next-1440.png`, `p3-next-product-1440.png`), obejrzane

- 1440: masthead, hero z płytą „No.06”, arkusz 4 kolumny z leadem na 2 i płytą tuszu domykającą, sekcja edytorska 38/62. To samo, co w `examples/static`; jedyna różnica to obrazy z `/_next/image` (lżejsze, ta sama ostrość rastra, bo bake liczy się z rozmiaru pudełka, nie z pliku).
- 390: 2 kolumny, płyta na 1 komórkę, tekst sekcji edytorskiej pod obrazem. Czytelne.
- Produkt: `halftone/riso` na koszulce EL FUNKADOR, oranż tylko wewnątrz rastra pracy; kolumna tekstu z kodem w blue-rice, cena w liczbach tabelarycznych, przycisk powrotu jako płyta tuszu. Uwaga jak w P1: kremowe tło mockupu daje rzadki raster na całej karcie (parametr presetu, strojenie w P4).

## Exit Check (taste-guardrail) 12/13

Lock zablokowany i uzasadniony ✔ · font poza listą zakazanych ✔ · jeden akcent, tło z fakturą rastra ✔ · złamana siatka (lead + płyta) ✔ · sygnaturowy detal (druk → zdjęcie) ✔ · hierarchia (jeden bohater na ekran) ✔ · Tells ✔ · kontekstowość (NIWWTS, nie szablon) ✔ · ciepło (papier, nie zimny dark) ✔ · izolacja ✔ · grupowanie ✔ · głębia bez cieni ✔ · napięcie: ✘ częściowo, strona produktu jest grzeczna (symetryczne 62/38 bez elementu przy krawędzi); do decyzji w P4 na płótnie Paper.

## Audyt niwwts-aesthetic 6/8

Paleta NIWWTS ✔ · akcent < 20 % ✔ · wysoki kontrast ✔ · czysta geometria ✔ · ruch celowy (jeden mesh, reszta statyczna) ✔ · max 2 modulatory ✔ · kierunek (Bauhaus/Molnár: siatka + jedna odchyłka) ✔ · seed/determinizm: n/d (mesh animuje bez seeda; `frame` presetu to jedyna deterministyczna część). 7 z 8 zaliczonych, 1 nie dotyczy.

## a11y-gate

Kontrast ✔ (liczby z P1) · klawiatura ✔ (test Tab/Alt+Tab) · focus ✔ (`:focus-visible`, nigdy `outline: none`) · semantyka ✔ (landmarki, `h1`/`h2`, `ul` karty, `figure`/`figcaption`) · formularze n/d · obrazy ✔ (`alt` z API, warstwa `aria-hidden`, hero `aria-hidden`) · ruch ✔ (reduced motion = `speed 0` + brak przejścia, test) · treść dynamiczna ✔ (nic nie zależy od JS; stan elementu to atrybut, nie komunikat). Nie sprawdzone statycznie: czytnik ekranu (VoiceOver), zoom 200 % — kroki ręczne niżej.

## react-next-perf, przegląd własnego kodu

🔴 brak · 🟡 `?vitrine=off` przez `searchParams` robi obie strony dynamicznymi (ƒ), więc nie ma prerenderu statycznego; dane są cache'owane (`revalidate = 300`), ale HTML renderuje się na żądanie. Jeśli flaga nie jest już potrzebna po pomiarach, usunięcie `searchParams` daje `○` i `generateStaticParams` dla produktów. Zostawione, bo PROMPTY R3 wymaga flagi.

## Momenty na content

1. Dwie karty przeglądarki obok siebie: `/` i `/?vitrine=off`, ten sam HTML, w jednej katalog „drukowany”, w drugiej zwykłe zdjęcia; w zakładce Network chunk elementu pojawia się dopiero po hydracji.
2. Strona produktu: `halftone/riso` na koszulce, hover zdejmuje raster i oranż No.06 wychodzi spod tuszu.
3. Lighthouse: dwa wyniki 99/100 z LCP identycznym co do 2 ms.

## Pominięte / niezmierzone

- **Tryb Storefront API na `niwwts.myshopify.com`**: kod gotowy (`lib/shopify.ts`), ale token publiczny nie był dostępny w tej sesji; ścieżka nie była wykonana na realnym sklepie. Do sprawdzenia po P2 (CSV → produkty → kanał Headless → token → `.env.local`).
- Wdrożenie na Vercel (PROMPTY R4: „nie wdrażaj sam”); instrukcja w `examples/next-headless/README.md`, `vercel.json` niepotrzebny.
- Firefox (jak w P0/P1).
- CSP (wymaga nonce dla skryptów Next; backlog P5), prerender statyczny (patrz 🟡 wyżej), `generateStaticParams`.
- Koszyk, checkout, wyszukiwarka (poza zakresem).
- Składanie `dist/react` do paczki `vitrine-shaders` jako subpath `./react` (ADR-0001 §5, krok wydania P5); przykład importuje workspace `@vitrine/react`.

## Kroki ręczne (Piotrek)

1. Bramka P3 na telefonie: `pnpm build && pnpm --filter next-headless start`, `http://<ip-maca>:3000/`; porównaj kartę z `examples/static`.
2. Tryb sklepu: w `niwwts.myshopify.com` kanał Headless → publiczny token Storefront API → `examples/next-headless/.env.local` wg `.env.example` → restart; stopka ma mówić „Catalogue from the Storefront API”.
3. Vercel: import repo, Root Directory `examples/next-headless`, env tylko w trybie sklepu.
4. VoiceOver (`Cmd+F5`) po nagłówkach i kartach; zoom 200 %.
