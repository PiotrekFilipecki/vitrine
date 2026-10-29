# Devlog P1 · element `<vitrine-shader>` (29.10.2026)

Gałąź `p1-element` od `main` (po merge P0). Referencja `~/Desktop/Projects/_ref/paper-shaders` (0.0.82). Sklep demo = NIWWTS No.06 (PLAN D13, dopisane w tej fazie na polecenie Piotrka); fixtures = 12 mockupów + 3 stille z repo `shop` (`examples/spikes/fixtures/README.md`).

## Skille

| Skill | Po co | Co zmienił w wyniku |
|---|---|---|
| `architecture-guardian` | API publiczne, granice | Jeden runtime bez zależności od `shaders-react` (zostaje devDependency tylko w teście zgodności). Presety jako dane (`presets/*.json`, nazwy propsów React, bez `image`) zamiast kodu, żeby Liquid i React czytały to samo. Efekty za rejestrem z dynamicznym importem (moduł efektu = fragment shader + mapowanie + presety; rdzeń nie zna żadnego shadera). Moduł SSR-safe (klasa dziedziczy po `HTMLElement` tylko gdy istnieje). Dopisał do ADR-0001 uzupełnienie P1 (zmiana metody odczytu bake, aliasy `#paper/*`). |
| `test-engineer` | Strategia testów | Piramida: Vitest na czystej logice (mapowania 1:1 z wartościami wpisanymi ręcznie z plików React, parse/merge/hash parametrów, pula LRU, LRU cache), Playwright na tym, czego nie da się udowodnić bez GPU (zgodność pikseli, konteksty, klawiatura, reduced motion, CORS). Wymusił, żeby test zgodności używał **oficjalnych** wrapperów React (bundle esbuild w `globalSetup`), nie mojej kopii mapowań; i żeby liczby (czasy bake) szły do JSON-ów, a nie do asercji. Zero retry; `workers: 1` jak w P0. |
| `a11y-gate` | Strona demo, element | Wymusił: `.vitrine-layer` z `aria-hidden`, wypalony obraz z `alt=""`, focus = hover (test Tab), `:focus-visible` 3 px na kartach, skip link, landmarki, jeden `h1`, alt-y z tytułów prac. Kontrast policzony skryptem: tusz/papier 15,74:1, blue-rice/papier 5,10:1 (AA), oranż nigdy jako tekst. W WebKit test klawiatury używa Option+Tab (Safari domyślnie nie tabuje po linkach), co zapisałem w teście. |
| `security-perf-auditor` | Wydajność, konteksty | Znalazł 1,1 s na kartę w `toBlob` przy animującym hero (niżej) i wymusił pomiar z breakdownem (`wait/render/blob`) zamiast zgadywania. Kazał liczyć requesty do fixtures (czy kopia `crossorigin` dubluje pobranie). Limit remontów po `webglcontextlost` (3), żeby zgubiony sterownik nie zapętlił elementu. Piekarnik zwalnia kontekst po 1,5 s bezczynności, więc strona ze statycznymi efektami kończy z 0 kontekstów. |
| `motion-design` | Przejście odsłonięcia | Jedna krzywa i jeden czas jako custom properties: 320 ms, `cubic-bezier(.2,0,0,1)` (zakres „premium/corporate”, poniżej 400 ms z D6). Tylko `opacity`: każdy `transform` przepróbkowałby siatkę ditheringu i rozmył druk. Reduced motion = bez przejścia (natychmiast), sprawdzane testem (`transitionDuration: 0s`). |
| `taste-guardrail` | Lock przed `examples/static`, Exit Check | Lock: świat = arkusz wydania NIWWTS No.06 (papier `#F1ECE2`, tusz `#151311`, jeden akcent: oranż No.06 tylko jako powierzchnia w hero, blue-rice jako jedyny tekstowy akcent); typografia = jedna rodzina Archivo z kontrastem na osi szerokości (62 vs 125), nie na wadze; ruch strukturalny = pierwsza karta na 2 kolumny + ciemna płyta zamykająca siatkę (napięcie, nie wyrównanie); sygnatura = sam reveal druk→zdjęcie. Pokrętła: wariancja 7, ruch 3, gęstość 6. „To NIE może wyglądać jak Dawn ani jak siatka kart shadcn.” Exit Check niżej. |
| `piotrek-frontend-design` | Wygląd strony testowej | Hairline-grid jak contact sheet (gap 1 px na tuszu), podwójna linia lockupu z identity.css sklepu, płyta tytułowa „No.06” nachodząca na mesh (kadr w kadrze), sekcja edytorska 38/62 z tekstem dosuniętym do krawędzi. Radius 0, zero cieni, zero gradientów poza samym shaderem. |
| `niwwts-aesthetic` | Arbiter stylu (D13) | Audyt 8 punktów: paleta tylko z tokenów sklepu ✓; akcent < 20 % (oranż tylko w mesh) ✓; wysoki kontrast (2 tony w ditheringu) ✓; czysta geometria (Bayer 8×8, hairline) ✓; ruch celowy (tylko reveal + mesh, bez random) ✓; ≤ 2 modulatory ✓; kierunek: Molnár (siatka + jedna odchyłka: karta-lead) ✓; determinizm (bake raz, `frame 0`) ✓ → 8/8. Zmienił presety-szkice na kolory z `identity.css` (newsprint = tusz na papierze, riso = blue-rice + oranż). |

Brak skilli: żaden z obowiązkowych nie brakował.

## Co zbudowałem (E1–E8)

- **E1 API** → `docs/vitrine/API.md`. `<vitrine-shader effect preset params reveal speed debug>` + dziecko `<img>`; overlay `.vitrine-layer[aria-hidden]`; `--vitrine-aspect` z `width/height` obrazu; zdarzenia `vitrine:ready` / `vitrine:fallback`; `data-vitrine-state`.
- **E2 mapowania** → `packages/element/src/effects/{dither,halftone,mesh,paper}.ts`, 1:1 z `shaders-react` (łącznie z `mipmaps: ['u_image']` i `u_isImage` w paper, `setMinImageSize` na kopii tekstury, tekstura szumu przez `decode()` jak w React). Każdy efekt osobnym chunkiem (`dist/chunks/<efekt>-*.js`).
- **E3 presety** → `presets/{dither,halftone,mesh,paper}.json`: `default` = upstream Default 1:1 + jeden szkic VITRINE na efekt (`newsprint`, `riso`, `drop-night`, `folded-lookbook`) w kolorach NIWWTS; P4 podmieni.
- **E4 bake + pula** → `baker.ts` (jeden kontekst na efekt, kolejka, cache LRU 96 po `effect|hash(params)|src|WxH@dpr`, zwolnienie po 1,5 s), `pool.ts` (LRU ≤ 6, IntersectionObserver, park = zrzut ostatniej klatki do płótna 2D, remount po `webglcontextlost`), ResizeObserver z debounce 150 ms (ta sama wielkość = cache hit).
- **E5 reveal** → `reveal.ts`: powierzchnia = `closest('a, [data-vitrine-card]')`; mysz/pióro enter/leave, dotyk: tap włącza i trzyma do tapu poza kartą, `focusin/focusout`. Reduced motion: `speed 0` dla wszystkiego + `transition: none`.
- **E6 fallbacki** → `no-webgl2` (jedna sonda na stronę), `cors` (kopia z `crossorigin` nie wczytała się, a `<img>` tak), `error` (nieznany efekt, brak obrazu po czasie, błąd montażu). Ostrzeżenie w konsoli tylko z `debug`.
- **E7 demo** → `examples/static/index.html` + `styles.css` (bez bundlera, import z `dist`, `?effects=off` do porównania).
- **E8 testy** → Vitest 26 testów; Playwright `packages/element/e2e/*.spec.ts` (zgodność 4×2, siatka 24 + hero, klawiatura, hover, reduced motion, fallbacki, strona statyczna + zrzuty).

## Komendy (końcówki, pełne wyjścia w terminalu sesji)

```
pnpm build      → vitrine-shaders: ESM ⚡️ Build success, DTS ⚡️ Build success; @vitrine/react: j.w.        (exit 0)
pnpm typecheck  → tsc root + element + react bez błędów                                                      (exit 0)
pnpm lint       → eslint . && prettier --check . → All matched files use Prettier code style!                (exit 0)
pnpm test       → Test Files 6 passed (6), Tests 26 passed (26)                                               (exit 0)
pnpm test:e2e --project=chromium --project=webkit → 45 passed, 1 skipped (zrzuty tylko w chromium) (1.1m)      (exit 0)
pnpm test:e2e --project=firefox → jak w P0: browserType.launch „Could not find profile folder”               (niezmierzone)
```

## Rozmiary (gzip -9, `packages/element/dist`)

| Plik | raw | gzip | Co |
|---|---:|---:|---|
| `index.js` | 53,9 KB | **14,4 KB** | element, piekarnik, pula, reveal, style, `ShaderMount` z upstreamu |
| `chunks/chunk-UXE2JB6R.js` | 2,8 KB | 1,1 KB | parse/merge/hash parametrów (ładowany z rdzeniem) |
| `chunks/chunk-TRTZD4XO.js` | 3,0 KB | 1,3 KB | tekstury (ładowany z rdzeniem) |
| `chunks/chunk-44EAVKDO.js` | 5,2 KB | 1,8 KB | `getShaderColorFromString` + sizing (wspólny dla efektów) |
| `chunks/dither-*.js` | 8,3 KB | **2,8 KB** | image-dithering |
| `chunks/halftone-*.js` | 13,9 KB | **4,1 KB** | halftone-cmyk |
| `chunks/mesh-*.js` | 6,0 KB | **2,1 KB** | mesh-gradient |
| `chunks/paper-*.js` | 20,7 KB | **6,3 KB** | paper-texture |
| `chunks/chunk-A5ROGKTT.js` | 24,3 KB | 18,3 KB | tekstura szumu (PNG base64 z upstreamu), tylko dla halftone i paper |

Strona z samym ditheringiem pobiera: 14,4 + 1,1 + 1,3 + 1,8 + 2,8 = **21,4 KB gz**. Z halftone/paper dochodzi 18,3 KB szumu (to wartość z upstreamu, nie nasza; kandydat do ROADMAP: szum generowany proceduralnie).

## Zgodność pikseli z `@paper-design/shaders-react` (bramka PLAN §5)

Strona `packages/element/e2e/pages/compat.html`: po lewej oficjalny komponent React (bundle `ref.bundle.js` z `shaders-react` 0.0.82 + React 19.3.1), po prawej `<vitrine-shader speed="0">`, te same parametry z `presets/*.json`, `frame 0`, box 300×400 CSS → 600×800 px. Diff próg Δ>8.

| Efekt / preset | Chromium: różne px | WebKit: różne px | Chromium bake (ms: total / wait / render / encode) | WebKit bake |
|---|---:|---:|---|---|
| dither / default | **0** (0 %) | **0** | 127 / 37 / 87 / 3 | 52 / 44 / 3 / 5 |
| dither / newsprint | 0 | 0 | 107 / 16 / 88 / 2 | 35 / 28 / 3 / 4 |
| halftone / default | 0 | 0 | 816 / 303 / 495 / 19 | 367 / 326 / 6 / 35 |
| halftone / riso | 0 | 0 | 808 / 328 / 460 / 20 | 88 / 50 / 9 / 29 |
| mesh / default | 0 | 0 | 155 / 59 / 89 / 7 | 28 / 13 / 4 / 11 |
| mesh / drop-night | 0 | 0 | 185 / 66 / 99 / 20 | 37 / 14 / 3 / 20 |
| paper / default | 0 | 0 | 676 / 233 / 425 / 18 | 139 / 103 / 15 / 21 |
| paper / folded-lookbook | 0 | 0 | 648 / 237 / 392 / 20 | 89 / 57 / 10 / 22 |

8/8 przypadków: **0 różnych pikseli** w obu przeglądarkach (próg bramki: ≤ 1 %). Dowody: `docs/media/p1-compat-<efekt>-<preset>-{chromium,webkit}.{json,png}` + `-diff-*.png`. „wait” to czekanie na pierwszą klatkę piekarnika (2×rAF) przy pierwszym użyciu efektu; „render” przy halftone/paper zawiera kompilację shadera i upload tekstury szumu 1024² (Chromium headless, software GL).

## Siatka 24 + żywy hero (`grid.html`, bramka D3)

| | Chromium 156 headless | WebKit (Safari 27.2) |
|---|---|---|
| DOMContentLoaded → 24 karty wypalone | **486 ms** | **347 ms** |
| unikalnych wypaleń / mediana / max | 12 / 17 ms / 201 ms (pierwsze: kompilacja + 1. klatka) | 12 / 17 ms / 45 ms |
| `webglcontextlost` na stronie | 0 | 0 |
| po wypaleniu: canvasy w kartach / `<img>` w kartach | 0 / 24 | 0 / 24 |
| konteksty piekarnika po 2,2 s / hosty piekarnika | 0 / 0 | 0 / 0 |
| żywe montaże (hero) / hero `isContextLost` | 1 / false | 1 / false |
| sonda 14 świeżych kontekstów: null / ewikcje | 0 / 0 | 0 / 0 |
| requesty do `/fixtures/` (24 `<img>` + 12 kopii tekstur) | **12** (12 unikalnych) | 12 |

Kopia `crossorigin` same-origin trafia w cache pamięci: zero dodatkowych pobrań. Dla obrazów z CDN cross-origin (bez `crossorigin` na `<img>` z treści) to będzie drugi request z innym trybem CORS, **niezmierzone w P1** (brak własnego sklepu; pomiar na starcie P2 na `niwwts-lab`). Dowody: `docs/media/p1-grid-{chromium,webkit}.{json,png}`.

**Znalezisko P1 (zmienia metodę z P0):** `canvas.toBlob` kończył się po **~1 070 ms** na kartę, gdy hero (mesh, `speed 0.6`) animował na stronie; bez hero 7 ms. Dotyczyło i płótna WebGL, i płótna 2D po `drawImage`. Zamiana na synchroniczny `gl.readPixels` + `putImageData` + `toDataURL('image/png')` → Blob: kodowanie 1–20 ms niezależnie od hero, 24 karty w 486 ms zamiast 13,5 s. `preserveDrawingBuffer` przestał być potrzebny. Zapisane w ADR-0001 (uzupełnienie P1).

Klawiatura: Tab (WebKit: Option+Tab) na kartę → `data-vitrine-revealed`, `opacity` warstwy 0; Tab dalej → atrybut znika, następna karta ma. Hover: `pointerenter` na `<a>` włącza, `mouse.move(0,0)` wyłącza. Reduced motion: hero `mode: baked`, 0 canvasów, `transitionDuration: 0s`. Fallbacki: obraz z originu bez ACAO → `vitrine:fallback {reason:'cors'}`, `<img>` widoczny (`naturalWidth 1600`), 0 canvasów, element loguje nic (przeglądarka sama loguje zablokowany request, tego nie da się wyłączyć); nieznany efekt → `error`; element bez `<img>` czeka (MutationObserver), nie zgłasza nic. Dowody: `p1-fallback-*.json`, `p1-reduced-motion-*.json`.

## Strona statyczna (`examples/static`, Lighthouse)

Czas DOMContentLoaded → 24 karty wypalone (strona demo, większe karty: lead 1226×1472 px, reszta ~600×720 px, dpr 1 × minPixelRatio 2): **Chromium 1 272 ms, WebKit 408 ms** (`p1-static-timing-*.json`; 26 elementów ready: 24 karty + hero live + edytorial baked; po 2,2 s jedyny canvas to hero).

Lighthouse 13.6.0, mobile (emulacja Moto G Power, CPU ×4), Chromium Playwrighta, 3 przebiegi, mediana (`docs/media/p1-lighthouse.json`):

| | Performance | LCP | CLS | TBT | FCP |
|---|---:|---:|---:|---:|---:|
| z efektami | 85 | **1 546 ms** | 0,002 | 587 ms | 1 546 ms |
| `?effects=off` | 100 | 1 541 ms | 0,002 | 0 ms | 1 541 ms |
| różnica | −15 | **+5 ms** (bramka: ≤ 100 ms) | 0 | +587 ms | +5 ms |

LCP i CLS zaliczone. Koszt to TBT: wypalanie 25 kart na wątku głównym przy CPU ×4 (readPixels + kodowanie PNG + `decode()`). Do P3/P5 (poza zakresem P1): kolejka piekarnika w `requestIdleCallback`/po `load`, najpierw karty w viewporcie, mniejszy `minPixelRatio` dla kart.

## Zrzuty (`docs/media/p1-static-390.png`, `p1-static-1440.png`, `p1-static-1440-reveal.png`)

Obejrzane. 1440: masthead z podwójną linią, hero mesh (tusz, blue-rice, oranż, papier) z płytą „No.06”, siatka 4 kolumny z hairline, karta-lead na 2 kolumny, płyta zamykająca. 390: 2 kolumny, lead na całą szerokość, 13 pełnych rzędów. **Czy dither wygląda jak druk:** koszulki (czerń) i printy czytają się jak dwutonowy druk; **ale** kremowe tło mockupów (luminancja ~0,88) wychodzi jako rzadki raster kropek na całej karcie, przez co tło siatki jest „zadrukowane” zamiast czyste. To parametr presetu (progu nie ma w image-dithering; do strojenia w P4: `colorSteps`, `size`, ewentualnie jaśniejszy `colorFront`), nie błąd elementu. **Krawędzie kart ostre** (hairline 1 px, bez cieni). **Reveal nie mruga:** zrzut z hoverem na drugiej karcie pokazuje zdjęcie pod warstwą bez przeskoku (ta sama geometria, tylko opacity); w testach `data-vitrine-revealed` przełącza się bez ponownego montażu. Edytorial: pierwsza wersja z ciemnym stillem FORMATION ginęła pod papierem (`blending 0.9` przyciemnia); podmieniony na jasny EL FUNKADOR, który czyta się jako kolaż na złożonym arkuszu. Ciemne stille + `folded-lookbook` = do strojenia w P4.

## Exit Check (taste-guardrail)

Lock 5/5 + 3 pokrętła uzasadnione ✓ · font spoza banned listy (Archivo) ✓ · jeden akcent, tło z fakturą (papier + hairline, nie #fff) ✓ · celowa asymetria (lead 2 kol., płyta 3 kol., 38/62) ✓ · sygnatura (reveal druk→zdjęcie) ✓ · hierarchia (No.06 → katalog → edytorial) ✓ · Tells: brak Inter/gradientów/cieni/zaokrągleń/emoji ✓ · wyraźnie NIWWTS (tokeny i prace z No.06) ✓ · warm/analog (papier, raster) ✓ · izolacja (lead ma 4× więcej miejsca) ✓ · grupowanie (hairline grupuje, płyta zamyka) ✓ · głębia bez cienia (nakładanie płyty na mesh) ✓ · napięcie (raster na tle, płyta na końcu) ✓ → 13/13.

a11y-gate: kontrast PASS (15,74:1 / 5,10:1), klawiatura PASS (test), focus PASS (3 px outline, test), semantyka PASS (header/main/footer, h1 → h2, ul/li, a), formularze n/d, obrazy PASS (alt z tytułów prac, wypalony `alt=""` + `aria-hidden`), ruch PASS (reduced motion = speed 0 + bez przejścia), treść dynamiczna n/d. Do sprawdzenia ręcznie przez Piotrka: VoiceOver po siatce (czy warstwa jest naprawdę niema).

## Momenty na content

1. Karta produktu z druku w kolor na hover: `p1-static-1440-reveal.png` (druga karta, UPTOWN SATURDAY DESCENT w oranżu obok kart w rastrze). Na reels: nagrać Tab po siatce — klawiatura robi to samo, co mysz.
2. „24 karty, 0 kontekstów”: `VitrineShader.stats()` w konsoli po wypaleniu → `{ liveMounts: 1, bakerContexts: 0, bakedCached: 12 }`.
3. Diff 0 pikseli vs React: `p1-compat-*-diff-*.png` są czarne; obok ten sam obraz z React i z elementu.
4. Znalezisko `toBlob` 1 s vs 7 ms: liczby z `grid.html` przed/po (13 546 ms → 486 ms na 24 karty).

## Poza zakresem (nie zrobione, do wypisania)

- Firefox: dalej nie startuje w Playwright na tej maszynie (jak w P0). Niezmierzone.
- Druga kopia obrazu cross-origin bez `crossorigin` na `<img>` z treści: niezmierzone (brak własnego sklepu w P1; P2 na `niwwts-lab`).
- Lighthouse na realnym telefonie: niezmierzone (emulacja mobile w Chromium headless).
- TBT 587 ms przy CPU ×4 (wypalanie na wątku głównym): optymalizacja kolejności/idle poza zakresem P1.
- Presety-szkice (`newsprint`, `riso`, `drop-night`, `folded-lookbook`) to placeholder do P4; raster na kremowym tle i ciemny edytorial to ich parametry.
- `paper` bez obrazu (sama faktura) działa w kodzie (`u_isImage=false`, pusty piksel), ale nie ma testu zgodności pikseli dla tego wariantu.
- Tekstura szumu 18,3 KB gz w chunku (upstream); proceduralny zamiennik = ROADMAP.
- Lazy-loading: element czeka na `load` obrazu, więc `loading="lazy"` działa (karta wypala się po dojściu do viewportu), ale demo ma `eager`, żeby pomiar „24 karty” był pełny.
