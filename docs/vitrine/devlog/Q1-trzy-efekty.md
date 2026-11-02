# Q1 · Trzy efekty: szyba, szyba przedsprzedaży, lupa (02–03.11.2026)

Gałąź `q1-trzy-efekty` **od `r0-kierunek`** (`923e5b0`): `r0-kierunek` nie było w `main` (lokalny `main` = `85b9349`, Q0), więc zgodnie z promptem wyszedłem od R0; merge robi Piotrek. Prompt: `docs/vitrine/PROMPT-Q1.md` (skopiowany `cp`, `cmp` z oryginałem: identyczny), raport Cowork `docs/vitrine/raport-weryfikacji-R0.md` (tak samo). Przeczytane przed kodem: `CLAUDE.md`, `STATUS.md`, `KIERUNEK-v2.md`, ADR-0001, ADR-0002 (z „Bramką R0”), `API.md`, devlog R0, raport R0 w całości. Nic nie wypchnięte, nic nie zmergowane, nic nie wdrożone. Niezacommitowane pliki Piotrka sprzed fazy (`.vercelignore`, `AGENTS.md`, `examples/next-headless/vercel.json`, linia `.vercel` w `.gitignore`) zostały nietknięte i poza commitami; do `.gitignore` weszły tylko moje linie (staging samego mojego fragmentu przez `git update-index`).

## Skille

| Skill | Po co | Co zmienił w wyniku |
| --- | --- | --- |
| `taste-guardrail` | Lock z KIERUNEK-v2 przed pierwszą linijką demo; Exit Check na każdym zrzucie | Lock jako komentarz na górze `styles.css`. Wymusił hero z krzesłem (zimna szarość + czerń na ciepłym papierze) zamiast wazonu, co usuwa ✘ „beż na beżu” z R0; kolejność kart w kolumnach rozstawiona kolorem (żółte słuchawki, różowa lampa, niebieski kubek, pomarańczowy sneaker nie sąsiadują z beżem). Exit Check znalazł dwa błędy, poprawione przed oddaniem: na 390 px zdjęcie hero wchodziło na linię produktu (element nadpisywał `aspect-ratio`), a na PDP poziome zdjęcie zostawiało połowę kolumny pustą (teraz wypełnia kolumnę, sticky). |
| `awwwards-art-director` | Poprzeczka „czy sklep premium by to wypuścił”, układ sekcji | Katalog: trzy kolumny, środkowa zaczyna się niżej, prawa trochę niżej (kolumny różnej wysokości) zamiast siatki równych kart; przedsprzedaż jako jedna karta + data wielkim krojem + skala 30/7/1/premiera (uczy funkcji bez opisu); PDP jako 58/42 ze zdjęciem od krawędzi; pod kartami zero ozdób (bez cieni, zaokrągleń, odznak). Odrzucone: przełącznik „pokaż szybę” w UI, licznik dni, druga sygnatura. |
| `design-motion:motion-design` | Szyba: otwarcie/zamknięcie, lupa | Czasy R0 1:1 (520/380 ms, ease-out cubic, 0 % overshoot, szkło sztywne). Pomiar pokazał jedną długą klatkę startu kontekstu; ruch startuje dopiero po pierwszej kompozycji nowego płótna pod wypaloną klatką, więc długa klatka nie trafia w ruch (archetyp Premium: ruch ciągły albo żaden). Lupa: rośnie 350 ms, maleje 250 ms, wzrost przez `transform: scale` zamiast zmiany rozmiaru płótna (bez realokacji co klatkę). |
| `piotrek-workflow:architecture-guardian` | Publiczne API, zgodność wstecz | ADR-0003. Jedno źródło API (atrybuty elementu → wrappery React → snippety Liquid). Zmiany tylko addytywne (nowe `effect`, `reveal="tap"`, `bind`, dwa `mode`, jedno pole `stats()`); nazwy wrapperów od momentu w sklepie; slot interakcji jako jeden moduł (`motion.ts`) zamiast logiki w elemencie. |
| `piotrek-workflow:test-engineer` | Strategia i testy | Piramida: Vitest (presety 1:1 z R0, mapowanie, parser `bind`, krzywa daty z udawanym zegarem `vi.setSystemTime`, geometria lupy) → zgodność pikseli → e2e tylko krytyczne ścieżki (szyba hover/tap/klawiatura, budżet kontekstów, reduced motion, brak WebGL2, lupa, przedsprzedaż, demo + axe). Ostrość przedsprzedaży mierzona gradientem pionowym, bo poziomy łapał krawędzie żłobków (pierwsza wersja testu była zła, nie kod). |
| `a11y-gate` | Dostępność demo i elementu | Karty: `alt=""` na zdjęciu, bo nazwa produktu jest w tym samym linku (bez podwójnego czytania); hero i PDP z opisowym `alt`. Lupa: `aria-hidden`, bez fokusu, `alt` zostaje. Fokus widoczny 2 px tuszem; koszyk jako tekst z `aria-live`, nie martwy link; skip link. axe (WCAG 2.2 A/AA) 0 naruszeń na 390 i 1440, strona główna i PDP. |
| `piotrek-workflow:security-perf-auditor` | Pula kontekstów, budżet ramek, licencje zdjęć | Jeden slot interakcji (max 1 żywy kontekst), kontekst zwalniany 400 ms po ruchu; pomiar ramek przy CPU ×4; Lighthouse. Licencje: nowe zdjęcia sprawdzone na stronach Unsplash, odrzucone kandydaty z czytelnym znakiem (lista w CREDITS.md); żadnych zapytań do sklepów klientów, User-Agent zapytań = adres repo, bez danych osobowych. |

Brak skilli: żaden z obowiązkowych nie brakował. `niwwts-aesthetic` celowo niewczytany (ADR-0002 §4).

## Lock (KIERUNEK-v2, przed pierwszą linijką demo)

Świat: witryna sklepowa (szkło ryflowane, papier metki), linia rodowa Aesop / Rams / fotografia produktowa na jednolitym tle. Typografia: Archivo self-hosted, oś 62 % nagłówki, 100 % tekst, 125 % etykiety, bez mono. Kolor: papier `#EFEBE4`, tusz `#141312`, `#57524C` na tekst drugi (6,51 : 1), zero akcentu w UI. Ruch strukturalny: produkt od krawędzi do krawędzi; katalog w trzech kolumnach różnej wysokości. Sygnatura: szyba. Pokrętła: wariancja 6 · ruch 6 · gęstość 3. Negatyw: NIE galeria shaderów z Dribbble, NIE demo „WebGL efekty”, NIE drop NIWWTS.

## G0 · Poprawki z raportu R0 §4

1. `STATUS.md:3` i `:20`: zapis zgodny z faktami (commit R0 po wstępnym przeglądzie, pełna weryfikacja Cowork 30.10.2026 ok. 01:20, raport w `docs/vitrine/`).
2. Zegarek `06-watch`: zamieniony. Nowy: Jess Bailey, `DXd6X3wuRA0`, trzy zegarki z gładkimi tarczami, bez napisów (sprawdzone na wycinku 2400 px).
3. Słuchawki `08-headphones`: zamienione. Nowe: C D-X, `dBwadhWa-lI`, generyczne nauszne na żółtym tle, bez znaku na muszlach i pałąku.
4. `r0-hero.html:49`: `'Archivo', sans-serif`.

Odrzucone po drodze (czytelny znak albo rozpoznawalny wzór na wycinku 2400 px): Faraz Fayaz `3weffxf3mdk` (napis na tarczy), Salvador Escalante `EfjlkpoGjs4` (napis), Yarenci Hdz `Tt_TIhVpYoM` (logo na muszli), Faizur Rehman `SrJA7t3Tsmc` (napis na pałąku), Stefan Riedl `r2uugFQvAZ0` i Andrey Matveev `UgM8JMcU9K8` (znany wzór). Strony obu wybranych: „Free to use under the Unsplash License”, bez Unsplash+, bez tagów 3D/AI (WebFetch).

```
$ date -u +%FT%TZ
2026-11-02T22:19:09Z
$ magick identify -format "%f %wx%h %b\n" m-*.jpg
m-06-watch.jpg 2400x1800 430315B
m-08-headphones.jpg 2400x1600 226356B
$ (cwebp -q 82 -resize 1600 0 / -q 80 -resize 1000 0 / -q 78 -resize 640 0, kontrola EXIF/XMP/ICCP)
06-watch.webp 1600x1200 95494B
06-watch.webp none
08-headphones.webp 1600x1067 35614B
08-headphones.webp none
w1000/06-watch.webp 1000x750 45608B
w1000/06-watch.webp none
w1000/08-headphones.webp 1000x667 16900B
w1000/08-headphones.webp none
w640/06-watch.webp 640x480 21864B
w640/06-watch.webp none
w640/08-headphones.webp 640x427 8680B
w640/08-headphones.webp none
```

`CREDITS.md`: nowe wiersze, data pobrania, linia kredytu w stopce, sekcja „Checks” z powodem wymiany i listą odrzuconych.

## G1 · ADR-0003

`docs/adr/0003-v02-trzy-efekty.md`: kontekst (bramka R0), decyzja (efekty, live vs bake, slot interakcji, `bind`, `reveal="tap"`, nazwy wrapperów, metapole `custom.release_date` + opcjonalne `custom.preorder_from`, skalowanie `<img>` pod szybą), konsekwencje (z długiem: hero bez drzwi dwuskrzydłowych), odrzucone (dissolve/resolve, dither domyślny, sześć efektów z PROMPTY-v02 Q2, szyba live w spoczynku, zegar na stronie). `PROMPTY-v02.md`: pierwsza linia „Q1–Q4 zastąpione przez PROMPT-Q1.md i ADR-0003”.

## G2–G4 · Element

Nowe pliki: `effects/glass.ts`, `effects/lens.ts` (mapowanie 1:1 z `fluted-glass.tsx` i `lens-distortion.tsx`, z `mipmaps: ['u_image']` jak w React), `bind.ts` (parser + krzywa daty), `motion.ts` (slot interakcji, `GlassMotion`, `Loupe`), `presets/glass.json`, `presets/lens.json`. Zmienione: `element.ts` (atrybut `bind`, tryby `clear`/`interactive`, montaż szyby po bake’u), `reveal.ts` (tryby `hover`/`tap`, callback, Enter/Spacja na fokusowalnej powierzchni, która nie jest linkiem, pierwszy tap na linku nie nawiguje dla szyby), `styles.ts`, `types.ts`, `registry.ts`, `index.ts`.

### Przed/po względem R0 (wartości przeniesione 1:1, chyba że niżej)

| Co | R0 | Q1 | Powód |
| --- | --- | --- | --- |
| Presety `window`, `preorder-30/7/1`, `loupe` | `examples/r0/effects.js` | identyczne (test `q1.test.ts` porównuje z plikiem R0) | — |
| Karta: szyba | `marginLeft` 0 → 1, otwarcie 520 ms, zamknięcie 380 ms, ease-out cubic | to samo | — |
| Hero: szyba | dwie szyby rozchodzące się od kursora (2 żywe konteksty), odstęp 0,2 na hover 520 ms, pełne otwarcie 640 ms, zamknięcie 420 ms | jedna szyba jak na karcie (1 kontekst), 520/380 ms | budżet G2 „max 1 żywy kontekst naraz”; drzwi wymagałyby łapki shadera (ADR-0003, dług) |
| Start ruchu | kontekst żył stale | nowy kontekst rysuje się pod wypaloną klatką; ruch startuje po pierwszej kompozycji (+2 klatki) | pomiar: start kontekstu to jedna klatka 167–217 ms przy CPU ×4; teraz poza ruchem |
| `scale` 1,06 | odsłonięty produkt o 6 % większy niż `<img>` (uwaga R0) | `<img>` skalowane tym samym `scale` (`--vitrine-image-scale`) | ostatnia klatka otwarcia = zdjęcie pod spodem, bez przeskoku |
| Lupa: wzrost | płótno zmieniało rozmiar co klatkę | płótno L×L stałe, wzrost przez `transform: scale` z przeliczonym zoomem | ten sam obraz, bez realokacji płótna |
| Lupa na dotyku | tap przesuwał lupę (makieta Q0) | przytrzymanie 350 ms, potem lupa idzie za palcem, przewijanie zablokowane tylko wtedy | prompt G4 („dotyk przez przytrzymanie”) |

### Vitest

```
$ pnpm test
 Test Files  9 passed (9)
      Tests  79 passed (79)
```

(pełny wynik ostatniego przebiegu: sekcja „Komendy” niżej). Nowe: `q1.test.ts` (presety 1:1 z R0, mapowanie glass/lens = React Default, parser `bind` z przypadkami błędnymi, krzywa daty z udawanym zegarem: kotwice dokładnie w 30/7/1 dniu, monotoniczność, czysto od premiery, skrócenie skali przez `from`, mróz przed `from`, geometria lupy), `index.test.ts` (v0.1 efekty pierwsze i w tej samej kolejności), `shaders.test.tsx` (trzy nowe wrappery w SSR, `bind` z wrappera czytany przez element do tych samych dat, wyjście `ProductMediaShader` v0.1 bajt w bajt).

## G5 · API dla trzech wejść

- Element: `effect="glass|lens"`, `reveal="hover|tap|none"`, `bind="none|pointer|date:<to>|date:<from>/<to>"`, CSS `--vitrine-glass-open/close`.
- React: `GlassProductImage`, `PreorderGlassImage` (`releaseDate`, `preorderFrom`), `LoupeImage` (`loupeSize`, `zoom`). Uzasadnienie nazw: ADR-0003 §6.
- Liquid: `snippets/vitrine-glass-card.liquid`, `vitrine-preorder-card.liquid` (metapole `custom.release_date`), `vitrine-loupe-media.liquid`; `shopify-theme/README.md` (sekcja v0.2); `assets/vitrine.js` przebudowany (143,9 KB, 55,5 KB gzip).
- `docs/vitrine/API.md`: sekcja v0.2 z przykładami HTML, React i Liquid, tabela parametrów, krzywa daty, zgodność wstecz.

```
$ shopify theme check --path shopify-theme --fail-level error
…
│  8 files inspected with 4 total offenses found across 4 files.               │
│  4 warnings.                                                                 │
```

Cztery ostrzeżenia to `OrphanedSnippet` (snippety VITRINE renderuje motyw gospodarza; w v0.1 to samo). 0 błędów.

## G6 · Demo „Store”

`examples/static/index.html` (hero: krzesło za szybą od krawędzi do krawędzi; „Objects” 12 kart w trzech kolumnach różnej wysokości; przedsprzedaż: sneaker z datą i skalą 30/7/1/premiera), `examples/static/products/<handle>.html` (12 PDP z lupą, statyczne, generowane raz z `examples/fixtures/catalog.json`), `demo.js` (data przedsprzedaży zawsze 9 dni od dziś, napisane w stopce; element importowany po namalowaniu LCP; licznik koszyka), `styles.css` (Lock na górze). Stopka: kredyt zdjęć + „Powered by Paper Shaders”. Te same trzy momenty w `examples/next-headless` (te same dane, ten sam arkusz z `next/font`, `custom.release_date` w trybie Storefront API).

Stare demo NIWWTS zniknęło z `examples/`: `stress.html` usunięty (24 karty pokrywa `grid.html`), fixtures NIWWTS, `niwwts-products.csv`, `theme-markup.html/.css` przeniesione do `packages/element/e2e/` (tylko testy: zgodność pikseli, siatka, motyw), ścieżki w testach, spikach, `pages-site.mjs` przepięte.

```
$ git grep -n -i -E "friendz|emwu" -- examples
exit 1
$ git ls-files examples | grep -i -E "\.(webp|png|jpe?g|gif|avif)$" | grep -v -E "^examples/fixtures/products/"
exit 1
$ git grep -n -i "niwwts" -- examples
examples/fixtures/CREDITS.md:3:Twelve product photographs for the VITRINE demo (phase R0, `docs/vitrine/KIERUNEK-v2.md`). They replace the NIWWTS
examples/next-headless/.env.example:4:SHOPIFY_STORE_DOMAIN=niwwts.myshopify.com
examples/next-headless/README.md:27:| `SHOPIFY_STORE_DOMAIN`            | `niwwts.myshopify.com` (your own dev store)                 |
examples/spikes/cors.spec.ts:51:      pageFor('http://localhost:4174/packages/element/e2e/fixtures/niwwts/01-tee-el-funkador.webp')
examples/spikes/spike-lib.js:15:/** NIWWTS No.06 fixtures (see fixtures/README.md). */
examples/spikes/spike-lib.js:31:  `/packages/element/e2e/fixtures/niwwts/${FIXTURES[i % FIXTURES.length]}.webp`;
examples/static/styles.css:11: *   negative   NOT a Dribbble shader gallery, a "WebGL effects" demo or a NIWWTS drop
examples/theme-test/README.md:6:- `live/`: `shopify theme pull --store niwwts.myshopify.com --theme <live theme id> --path examples/theme-test/live`,
examples/theme-test/README.md:11:  (`packages/element/e2e/store.spec.ts`), `VITRINE_STORE_URL=https://niwwts.myshopify.com VITRINE_STORE_PASSWORD=… VITRINE_PREVIEW_THEME_ID=… node scripts/lighthouse.mjs store`.
exit 0
```

W `examples/` nie ma żadnego zdjęcia poza 36 plikami `examples/fixtures/products` (Unsplash) i żadnej wzmianki o sklepach klientów. Pozostałe trafienia „niwwts” to nazwa dev store Piotrka (`niwwts.myshopify.com`, dozwolony w CLAUDE.md), spiki P0 wskazujące na fixtures testowe w `packages/element/e2e/` i negatyw Locka. Zdjęć NIWWTS w `examples/` nie ma.

„Beż na beżu” z Exit Checku R0: hero to teraz krzesło (czarna skorupa, chłodna szarość tła) na ciepłym papierze; w katalogu beżowe zdjęcia (wazon, świeca, monstera) stoją między kolorowymi.

## G7 · Testy

Zgodność pikseli (`compat.spec.ts`, ≤ 1 % różnych pikseli przy progu Δ > 8, płótno 600×800):

| Przypadek | Chromium | WebKit |
| --- | --- | --- |
| glass / default | 32 px (0,0067 %) | 32 px (0,0067 %) |
| glass / window | 0 | 0 |
| glass / preorder-30 | 0 | 0 |
| lens / default | 0 | 0 |
| lens / loupe (pełna klatka, `bind="none"`) | 9 px (0,0019 %) | 11 px (0,0023 %) |

v0.1 (dither, halftone, mesh, paper × 2): bez zmian, zielone. JSON: `docs/media/p1-compat-{glass,lens}-*.json` (zrzuty stron lokalnie).

E2E nowe: `q1.spec.ts` (8 testów × 2 przeglądarki), `demo.spec.ts` (10 × 2), `next.spec.ts` przepisany (5 × 2). Usunięty `static.spec.ts` (stare demo). Wyniki: sekcja „Komendy”.

## Pomiary (tylko z pomiaru)

**Lighthouse mobile, static, mediana z 3** (`VITRINE_LH_OUT=q1-lighthouse-static.json node scripts/lighthouse.mjs static`):

```
effects   runs [(99, 1954, 0, 0), (95, 2929, 31, 0), (99, 2103, 29, 0)]   (score, LCP ms, TBT ms, CLS)
          median {'score': 99, 'lcpMs': 2103, 'cls': 0, 'tbtMs': 29, 'fcpMs': 903}
noEffects runs [(98, 2479, 0, 0), (98, 2478, 0, 0), (98, 2478, 0, 0)]
          median {'score': 98, 'lcpMs': 2478, 'cls': 0, 'tbtMs': 0, 'fcpMs': 903}
deltaLcp -375
```

Cel ≥ 95 i TBT < 200 ms: spełniony (99, 29 ms). ΔLCP −375 ms to rozrzut symulacji Lighthouse (LCP to w obu wariantach to samo `<img>` hero; element jest importowany po jego namalowaniu), nie zysk z efektu.

**Czas ramki przy otwieraniu szyby** (Chrome, CPU ×4 przez CDP, 1440×900 @2×, `node scripts/q1-frames.mjs`, mediana z 3, `docs/media/q1-frames.json`):

```
run 1 {"atRest":{"liveMounts":0,"bakerContexts":0,"bakedCached":14,"interactionMounts":0,"canvases":0},"hero":{"createdMs":145.3,"startMs":425.9,"openMs":540.7,"prepMaxFrameMs":283.3,"frames":14,"medianFrameMs":33.4,"p95FrameMs":66.7,"maxFrameMs":66.7},"card":{"createdMs":49.6,"startMs":293.4,"openMs":532.6,"prepMaxFrameMs":216.7,"frames":32,"medianFrameMs":16.7,"p95FrameMs":16.7,"maxFrameMs":16.7}}
run 2 {"atRest":{"liveMounts":0,"bakerContexts":0,"bakedCached":14,"interactionMounts":0,"canvases":0},"hero":{"createdMs":118.1,"startMs":342.3,"openMs":556,"prepMaxFrameMs":216.7,"frames":22,"medianFrameMs":24.9,"p95FrameMs":33.4,"maxFrameMs":33.4},"card":{"createdMs":50.8,"startMs":245.4,"openMs":532.8,"prepMaxFrameMs":183.3,"frames":32,"medianFrameMs":16.7,"p95FrameMs":16.7,"maxFrameMs":16.7}}
run 3 {"atRest":{"liveMounts":0,"bakerContexts":0,"bakedCached":14,"interactionMounts":0,"canvases":0},"hero":{"createdMs":116.6,"startMs":341.7,"openMs":549.9,"prepMaxFrameMs":216.7,"frames":25,"medianFrameMs":16.7,"p95FrameMs":33.4,"maxFrameMs":33.4},"card":{"createdMs":47.8,"startMs":228.3,"openMs":533.5,"prepMaxFrameMs":166.7,"frames":32,"medianFrameMs":16.7,"p95FrameMs":16.7,"maxFrameMs":16.8}}
median {"hero":{"startMs":342.3,"prepMaxFrameMs":216.7,"medianFrameMs":24.9,"p95FrameMs":33.4,"maxFrameMs":33.4,"frames":22},"card":{"startMs":245.4,"prepMaxFrameMs":183.3,"medianFrameMs":16.7,"p95FrameMs":16.7,"maxFrameMs":16.7,"frames":32},"contextsAtRest":0}
```

Czytanie: karta w ruchu 16,7 ms na klatkę (60 fps, maks. 16,7); hero (1556×1672 px płótna) mediana 24,9 ms, p95 33,4 ms. Start kontekstu (link programu, wgranie tekstury z mipmapami) to jedna klatka 167–217 ms na wątku głównym przy CPU ×4; dzieje się pod wypaloną klatką, przed ruchem. Od wskaźnika do ruchu: 245 ms (karta), 342 ms (hero) przy CPU ×4. Przed zmianą (pierwszy pomiar tej samej wersji bez kompozycji pod bake’em) ta długa klatka wypadała w środku ruchu: hero maks. 233 ms, karta maks. 183 ms w trakcie przesuwania.

**Konteksty po załadowaniu:** 0 (`contextsAtRest` w pomiarze wyżej; `demo.spec.ts` „0 live contexts after load”: `liveMounts 0, bakerContexts 0, interactionMounts 0, canvases 0`). Cel ≤ 1.

**Rozmiary** (`packages/element/dist`, gzip -9): `index.js` 83 213 B / 22 050 B gz (Q0: 16,4 KB gz; +5,6 KB to `bind`, `motion`, nowy `reveal`), `glass` 16 464 / 4 388 B, `lens` 11 819 / 3 880 B. Motyw: `vitrine.js` 143 886 B / 55 492 B gz (v0.1.0: 102 702 B).

## Exit Check (taste-guardrail §7) na zrzutach

Zrzuty w `docs/media/q1-*.webp` (pełne PNG lokalnie), obejrzane wszystkie. Punkt „jeden dominujący akcent” jest celowo odwrócony przez Lock (zero akcentu w UI, kolor tylko ze zdjęć) i liczę go jako spełniony, gdy kolor niosą zdjęcia.

| Kadr | Wynik | ✘ i co z tym |
| --- | --- | --- |
| `q1-hero-1440` / `-open` | 14/14 | szyba czyta się jak witryna; otwarte = to samo zdjęcie co `<img>` (bez przeskoku 6 %) |
| `q1-catalogue-1440` | 13/14 | ✘ napięcie: kolumny układają się spokojnie, jedyne nierozwiązane to przesunięcie środkowej; zostawiam, bo gęstość 3 |
| `q1-preorder-1440` | 14/14 | 9 dni przed premierą produkt to kształt, skala 30/7/1/dzień premiery uczy bez tekstu |
| `q1-pdp-1440` | 13/14 | ✘ prawa kolumna ma dużo pustego miejsca pod przyciskiem; to oddech PDP, nie błąd |
| `q1-hero-390` / `-open` | 14/14 | zdjęcie od 280,5 px (pomiar `boundingBox`, górna połowa ekranu 844 px), linia produktu pod nim |
| `q1-catalogue-390` | 13/14 | ✘ etykieta przedsprzedaży łamie się na 3 linie w wąskiej kolumnie |
| `q1-preorder-390` | 14/14 | — |
| `q1-pdp-390-hold` / `q1-pdp-390` | 14/14 | lupa pod przytrzymanym palcem (CDP touch), bez niej czyste zdjęcie |
| `q1-glass.mp4` (15,8 s, 0,12 MB; GIF 0,58 MB lokalnie) | 14/14 | hero: szyba odjeżdża w prawo i wraca; trzy karty po kolei, zawsze jedna w ruchu |
| `q1-loupe.mp4` (11,2 s, 0,23 MB; GIF 1,74 MB lokalnie) | 14/14 | lupa rośnie, idzie po skórze i sprzączce, maleje poza zdjęciem |

Ogólnie: 0 Tells z §1 (bez Inter, gradientów, zaokrągleń, cieni, emoji, mono jako ozdoby, wyśrodkowanego stosu). Test kostiumu: z metafory witryny został jeden mechanizm (szyba), żadnych szyldów, metek ani paragonów jako dekoracji.

## Momenty na content (kadry do reelsa)

1. Kursor wjeżdża na hero: szyba z 15 żłobkami odjeżdża w prawo jak drzwi witryny, krzesło wyostrza się od lewej (`q1-glass.mp4` 0:01–0:03).
2. Trzy karty pod rząd w katalogu: szyba za każdym razem odjeżdża tylko na jednej (budżet „1 kontekst” widać w ruchu).
3. Przedsprzedaż: diptych „9 dni przed” obok „dzień premiery” (`q1-preorder-1440.webp`, skala w prawym dolnym rogu) — ten sam kadr, inna data.
4. Lupa na satchelu: z faktury skóry na sprzączkę i szew (`q1-loupe.mp4` 0:02–0:08).
5. Telefon: przytrzymany palec na zdjęciu i lupa pod nim (`q1-pdp-390-hold.webp`).
6. Kod w 3 linijkach: `<vitrine-shader effect="glass">` wokół zwykłego `<img>` obok efektu (do napisu w reelsie).

## Komendy

(pełne wyniki końcowego przebiegu niżej)

```
$ pnpm build
$ pnpm -r --filter "./packages/*" run build && node scripts/assemble-react.mjs && pnpm --filter next-headless run build
packages/element build: ESM dist/chunks/paper-NOPF2WHR.js        20.32 KB
packages/element build: ESM dist/index.js                        81.25 KB
packages/element build: ESM dist/chunks/chunk-ZQSWOEDY.js        23.76 KB
packages/element build: ESM dist/chunks/chunk-VOMB4WIG.js        2.91 KB
packages/element build: ESM dist/chunks/dither-5C4FWFI7.js       9.44 KB
packages/element build: ESM dist/chunks/chunk-6L3FZBDS.js        3.34 KB
packages/element build: ESM dist/chunks/mesh-QNAUV3PT.js         6.54 KB
packages/element build: ESM dist/chunks/chunk-EL2L3VMQ.js        2.03 KB
packages/element build: ESM dist/chunks/glass-675GV3MS.js        16.08 KB
packages/element build: ESM dist/chunks/chunk-UXE2JB6R.js        2.69 KB
packages/element build: ESM dist/chunks/halftone-THE32HNW.js     13.69 KB
packages/element build: ESM dist/chunks/lens-HDOHQL3O.js         11.54 KB
packages/element build: ESM dist/chunks/paper-NOPF2WHR.js.map    29.81 KB
packages/element build: ESM dist/index.js.map                    170.54 KB
packages/element build: ESM dist/chunks/chunk-VOMB4WIG.js.map    5.66 KB
packages/element build: ESM dist/chunks/chunk-ZQSWOEDY.js.map    24.44 KB
packages/element build: ESM dist/chunks/glass-675GV3MS.js.map    26.56 KB
packages/element build: ESM dist/chunks/chunk-UXE2JB6R.js.map    5.59 KB
packages/element build: ESM dist/chunks/chunk-EL2L3VMQ.js.map    6.87 KB
packages/element build: ESM dist/chunks/mesh-QNAUV3PT.js.map     11.60 KB
packages/element build: ESM dist/chunks/chunk-6L3FZBDS.js.map    7.17 KB
packages/element build: ESM dist/chunks/dither-5C4FWFI7.js.map   17.03 KB
packages/element build: ESM dist/chunks/halftone-THE32HNW.js.map 22.29 KB
packages/element build: ESM dist/chunks/lens-HDOHQL3O.js.map     20.07 KB
packages/element build: ESM ⚡️ Build success in 22ms
packages/element build: DTS ⚡️ Build success in 291ms
packages/element build: DTS dist/index.d.ts 8.19 KB
packages/react build: ESM dist/index.js     3.37 KB
packages/react build: ESM dist/index.js.map 8.17 KB
packages/react build: ESM ⚡️ Build success in 13ms
packages/react build: DTS ⚡️ Build success in 318ms
packages/react build: DTS dist/index.d.ts 6.26 KB
assemble-react: index.d.ts, index.js, index.js.map → packages/element/dist/react/
$ node scripts/sync-fixtures.mjs
sync-fixtures: 13 files → public/fixtures/
✓ Compiled successfully in 323ms
Route (app)
┌ ƒ /
├ ○ /_not-found
└ ƒ /products/[handle]
build exit 0

$ pnpm typecheck
$ tsc -p tsconfig.json --noEmit && pnpm -r --filter "./packages/*" run typecheck && pnpm --filter next-headless run typecheck
Scope: 2 of 4 workspace projects
packages/element typecheck$ tsc -p tsconfig.json --noEmit
packages/element typecheck: Done
packages/react typecheck$ tsc -p tsconfig.json --noEmit
packages/react typecheck: Done
$ node scripts/sync-fixtures.mjs && next typegen && tsc --noEmit
sync-fixtures: 13 files → public/fixtures/
Generating route types...
✓ Types generated successfully
typecheck exit 0

$ pnpm lint
$ eslint . && prettier --check .
Checking formatting...
All matched files use Prettier code style!
lint exit 0

$ pnpm test
$ vitest run

 RUN  v5.0.5 /Users/oszi/Desktop/Projects/vitrine


 Test Files  9 passed (9)
      Tests  79 passed (79)
   Start at  00:07:41
   Duration  266ms (transform 47%, import 31%, tests 14%, worker 8%)

test exit 0
```

E2E: `pnpm test:e2e --project=chromium --project=webkit` (pełna lista):

```
✓    1 [chromium] › examples/next-headless/e2e/next.spec.ts:39:3 › Q1 · next-headless Store (production build) › server HTML: plain images inside glass / pre-order / loupe elements, nothing without alt, width, height (67ms)
✓    2 [chromium] › examples/next-headless/e2e/next.spec.ts:61:3 › Q1 · next-headless Store (production build) › home: 17 baked + 1 clear, 0 live contexts at rest, no console errors (hydration included) (6.3s)
✓    3 [chromium] › examples/next-headless/e2e/next.spec.ts:99:3 › Q1 · next-headless Store (production build) › keyboard: Tab onto a card opens its glass, Tab away closes it (3.1s)
✓    4 [chromium] › examples/next-headless/e2e/next.spec.ts:114:3 › Q1 · next-headless Store (production build) › product page: the loupe under the pointer, no context at rest, 404 for an unknown handle (734ms)
✓    5 [chromium] › examples/next-headless/e2e/next.spec.ts:130:3 › Q1 · next-headless Store (production build) › ?vitrine=off: no element, no element chunk (1.7s)
✓    6 [chromium] › examples/spikes/bake.spec.ts:5:3 › Spike A · bake › baked image is non-empty, matches the live render (<= 1% pixels) and releases its WebGL context (1.1s)
✓    7 [chromium] › examples/spikes/contexts.spec.ts:5:3 › Spike B · contexts › live: 24 simultaneous ShaderMounts — count evictions (measurement only) (2.3s)
✓    8 [chromium] › examples/spikes/contexts.spec.ts:18:3 › Spike B · contexts › bake: 24 baked cards leave 0 live contexts and free all slots (3.4s)
✓    9 [chromium] › examples/spikes/contexts.spec.ts:32:3 › Spike B · contexts › bake-shared: 24 cards through ONE reusable baker context (no new contexts, no evictions) (692ms)
✓   10 [chromium] › examples/spikes/contexts.spec.ts:51:3 › Spike B · contexts › pool: animated mesh-gradient cards never exceed N=6 live contexts while scrolling (8.0s)
✓   11 [chromium] › examples/spikes/cors.spec.ts:18:3 › Spike C · CORS › cdn.shopify.com image loads with crossorigin=anonymous and works as a WebGL texture (526ms)
✓   12 [chromium] › examples/spikes/cors.spec.ts:33:3 › Spike C · CORS › <store domain>/cdn/shop/files variant behaves the same (333ms)
✓   13 [chromium] › examples/spikes/cors.spec.ts:44:3 › Spike C · CORS › without Access-Control-Allow-Origin the texture is refused but the plain <img> still shows (fallback path) (158ms)
✓   14 [chromium] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › dither / default: ≤ 1% differing pixels, 0 canvases left in the element (514ms)
✓   15 [chromium] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › dither / newsprint: ≤ 1% differing pixels, 0 canvases left in the element (448ms)
✓   16 [chromium] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › halftone / default: ≤ 1% differing pixels, 0 canvases left in the element (1.5s)
✓   17 [chromium] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › halftone / riso: ≤ 1% differing pixels, 0 canvases left in the element (1.5s)
✓   18 [chromium] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › mesh / default: ≤ 1% differing pixels, 0 canvases left in the element (438ms)
✓   19 [chromium] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › mesh / drop-night: ≤ 1% differing pixels, 0 canvases left in the element (494ms)
✓   20 [chromium] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › paper / default: ≤ 1% differing pixels, 0 canvases left in the element (1.4s)
✓   21 [chromium] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › paper / folded-lookbook: ≤ 1% differing pixels, 0 canvases left in the element (1.2s)
✓   22 [chromium] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › glass / default: ≤ 1% differing pixels, 0 canvases left in the element (647ms)
✓   23 [chromium] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › glass / window: ≤ 1% differing pixels, 0 canvases left in the element (658ms)
✓   24 [chromium] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › glass / preorder-30: ≤ 1% differing pixels, 0 canvases left in the element (1.9s)
✓   25 [chromium] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › lens / default: ≤ 1% differing pixels, 0 canvases left in the element (1.2s)
✓   26 [chromium] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › lens / loupe: ≤ 1% differing pixels, 0 canvases left in the element (849ms)
✓   27 [chromium] › packages/element/e2e/demo.spec.ts:39:3 › Q1 · Store demo › home: 18 elements ready (17 baked + 1 clear), 0 live contexts after load, no console errors (6.7s)
✓   28 [chromium] › packages/element/e2e/demo.spec.ts:56:5 › Q1 · Store demo › catalogue at 390 px: columns of different heights, no horizontal overflow (118ms)
✓   29 [chromium] › packages/element/e2e/demo.spec.ts:56:5 › Q1 · Store demo › catalogue at 768 px: columns of different heights, no horizontal overflow (123ms)
✓   30 [chromium] › packages/element/e2e/demo.spec.ts:56:5 › Q1 · Store demo › catalogue at 1024 px: columns of different heights, no horizontal overflow (115ms)
✓   31 [chromium] › packages/element/e2e/demo.spec.ts:56:5 › Q1 · Store demo › catalogue at 1440 px: columns of different heights, no horizontal overflow (119ms)
✓   32 [chromium] › packages/element/e2e/demo.spec.ts:90:3 › Q1 · Store demo › hero: hover slides the glass away on one context; product page: the loupe, no context at rest (7.2s)
✓   33 [chromium] › packages/element/e2e/demo.spec.ts:118:7 › Q1 · Store demo › axe: home at 390 px has no WCAG 2.2 A/AA violations (2.3s)
✓   34 [chromium] › packages/element/e2e/demo.spec.ts:118:7 › Q1 · Store demo › axe: home at 1440 px has no WCAG 2.2 A/AA violations (4.7s)
✓   35 [chromium] › packages/element/e2e/demo.spec.ts:118:7 › Q1 · Store demo › axe: product at 390 px has no WCAG 2.2 A/AA violations (640ms)
✓   36 [chromium] › packages/element/e2e/demo.spec.ts:118:7 › Q1 · Store demo › axe: product at 1440 px has no WCAG 2.2 A/AA violations (549ms)
✓   37 [chromium] › packages/element/e2e/fallback.spec.ts:5:3 › P1 · fallbacks (E6) › image without CORS headers → vitrine:fallback(cors), <img> stays, no console error (131ms)
✓   38 [chromium] › packages/element/e2e/grid.spec.ts:9:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › 24 baked cards + 1 live hero: 0 webglcontextlost, 0 live contexts after bake, hero survives (5.9s)
✓   39 [chromium] › packages/element/e2e/grid.spec.ts:79:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › keyboard: Tab onto a card reveals the photo, Tab away hides it again (1.0s)
✓   40 [chromium] › packages/element/e2e/grid.spec.ts:115:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › hover reveals on the nearest link and the baked layer stays aria-hidden (513ms)
✓   41 [chromium] › packages/element/e2e/grid.spec.ts:133:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › prefers-reduced-motion: hero is baked (no canvas), reveal has no transition (614ms)
✓   42 [chromium] › packages/element/e2e/q1.spec.ts:51:3 › Q1 · glass card › hover opens the glass on one context, leaving closes it, 0 contexts 2 s later (7.0s)
✓   43 [chromium] › packages/element/e2e/q1.spec.ts:69:3 › Q1 · glass card › 10 fast hovers across the cards: at most 1 live context, 0 after 2 s (7.4s)
✓   44 [chromium] › packages/element/e2e/q1.spec.ts:87:3 › Q1 · glass card › keyboard: Tab onto the card link opens, Tab away closes; Enter/Space toggle a focusable non-link card (5.9s)
✓   45 [chromium] › packages/element/e2e/q1.spec.ts:113:3 › Q1 · glass card › prefers-reduced-motion: open and close without animation and without a context (2.8s)
✓   46 [chromium] › packages/element/e2e/q1.spec.ts:128:3 › Q1 · touch › tap opens the glass and does not navigate; the second tap follows the link (4.0s)
✓   47 [chromium] › packages/element/e2e/q1.spec.ts:146:3 › Q1 · fallbacks › no WebGL2: every element falls back to the photo, nothing is covered (1.9s)
✓   48 [chromium] › packages/element/e2e/q1.spec.ts:173:3 › Q1 · loupe › the loupe appears under the pointer, follows it, and leaves 0 contexts (5.9s)
✓   49 [chromium] › packages/element/e2e/q1.spec.ts:209:3 › Q1 · pre-order › frost by days left: 30 > 7 > 1 day, clear on and after the release (2.7s)
-   50 [chromium] › packages/element/e2e/store.spec.ts:85:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › home: hero + editorial sections render, hero live, editorial baked, no errors
-   51 [chromium] › packages/element/e2e/store.spec.ts:110:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › collection: every card image is inside <vitrine-shader>, all baked, 0 canvases
-   52 [chromium] › packages/element/e2e/store.spec.ts:133:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › collection: keyboard reveal on the card link
-   53 [chromium] › packages/element/e2e/store.spec.ts:149:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › collection: reduced motion keeps everything static
✓   54 [chromium] › packages/element/e2e/theme-markup.spec.ts:30:3 › P2 · theme markup (shopify-theme/ rendered) › 26 script tags, 1 fetch; 24 cards + editorial baked, hero live, 0 contexts after bake (25.7s)
✓   55 [chromium] › packages/element/e2e/theme-markup.spec.ts:85:3 › P2 · theme markup (shopify-theme/ rendered) › keyboard: Tab onto a card reveals the photo, Tab away hides it (5.4s)
✓   56 [chromium] › packages/element/e2e/theme-markup.spec.ts:105:3 › P2 · theme markup (shopify-theme/ rendered) › editorial figure is the reveal surface (data-vitrine-card), hover reveals (23.4s)
✓   57 [chromium] › packages/element/e2e/theme-markup.spec.ts:115:3 › P2 · theme markup (shopify-theme/ rendered) › prefers-reduced-motion: hero baked, no transition (1.5s)
✓   58 [chromium] › packages/element/e2e/theme-markup.spec.ts:127:3 › P2 · theme markup (shopify-theme/ rendered) › screenshots 390 and 1440 (chromium) (29.9s)
✓   59 [chromium] › packages/element/e2e/whitepoint.spec.ts:14:1 › whitePoint: the cream ground prints as clean paper, the product keeps its ink (1.3s)
✓   60 [webkit] › examples/next-headless/e2e/next.spec.ts:39:3 › Q1 · next-headless Store (production build) › server HTML: plain images inside glass / pre-order / loupe elements, nothing without alt, width, height (71ms)
✓   61 [webkit] › examples/next-headless/e2e/next.spec.ts:61:3 › Q1 · next-headless Store (production build) › home: 17 baked + 1 clear, 0 live contexts at rest, no console errors (hydration included) (4.6s)
✓   62 [webkit] › examples/next-headless/e2e/next.spec.ts:99:3 › Q1 · next-headless Store (production build) › keyboard: Tab onto a card opens its glass, Tab away closes it (1.4s)
✓   63 [webkit] › examples/next-headless/e2e/next.spec.ts:114:3 › Q1 · next-headless Store (production build) › product page: the loupe under the pointer, no context at rest, 404 for an unknown handle (474ms)
✓   64 [webkit] › examples/next-headless/e2e/next.spec.ts:130:3 › Q1 · next-headless Store (production build) › ?vitrine=off: no element, no element chunk (1.8s)
✓   65 [webkit] › examples/spikes/bake.spec.ts:5:3 › Spike A · bake › baked image is non-empty, matches the live render (<= 1% pixels) and releases its WebGL context (1.1s)
✓   66 [webkit] › examples/spikes/contexts.spec.ts:5:3 › Spike B · contexts › live: 24 simultaneous ShaderMounts — count evictions (measurement only) (1.4s)
✓   67 [webkit] › examples/spikes/contexts.spec.ts:18:3 › Spike B · contexts › bake: 24 baked cards leave 0 live contexts and free all slots (1.8s)
✓   68 [webkit] › examples/spikes/contexts.spec.ts:32:3 › Spike B · contexts › bake-shared: 24 cards through ONE reusable baker context (no new contexts, no evictions) (853ms)
✓   69 [webkit] › examples/spikes/contexts.spec.ts:51:3 › Spike B · contexts › pool: animated mesh-gradient cards never exceed N=6 live contexts while scrolling (4.3s)
✓   70 [webkit] › examples/spikes/cors.spec.ts:18:3 › Spike C · CORS › cdn.shopify.com image loads with crossorigin=anonymous and works as a WebGL texture (644ms)
✓   71 [webkit] › examples/spikes/cors.spec.ts:33:3 › Spike C · CORS › <store domain>/cdn/shop/files variant behaves the same (485ms)
✓   72 [webkit] › examples/spikes/cors.spec.ts:44:3 › Spike C · CORS › without Access-Control-Allow-Origin the texture is refused but the plain <img> still shows (fallback path) (280ms)
✓   73 [webkit] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › dither / default: ≤ 1% differing pixels, 0 canvases left in the element (502ms)
✓   74 [webkit] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › dither / newsprint: ≤ 1% differing pixels, 0 canvases left in the element (617ms)
✓   75 [webkit] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › halftone / default: ≤ 1% differing pixels, 0 canvases left in the element (658ms)
✓   76 [webkit] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › halftone / riso: ≤ 1% differing pixels, 0 canvases left in the element (635ms)
✓   77 [webkit] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › mesh / default: ≤ 1% differing pixels, 0 canvases left in the element (421ms)
✓   78 [webkit] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › mesh / drop-night: ≤ 1% differing pixels, 0 canvases left in the element (553ms)
✓   79 [webkit] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › paper / default: ≤ 1% differing pixels, 0 canvases left in the element (631ms)
✓   80 [webkit] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › paper / folded-lookbook: ≤ 1% differing pixels, 0 canvases left in the element (678ms)
✓   81 [webkit] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › glass / default: ≤ 1% differing pixels, 0 canvases left in the element (436ms)
✓   82 [webkit] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › glass / window: ≤ 1% differing pixels, 0 canvases left in the element (505ms)
✓   83 [webkit] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › glass / preorder-30: ≤ 1% differing pixels, 0 canvases left in the element (679ms)
✓   84 [webkit] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › lens / default: ≤ 1% differing pixels, 0 canvases left in the element (585ms)
✓   85 [webkit] › packages/element/e2e/compat.spec.ts:38:5 › P1 · pixel compatibility with shaders-react › lens / loupe: ≤ 1% differing pixels, 0 canvases left in the element (534ms)
✓   86 [webkit] › packages/element/e2e/demo.spec.ts:39:3 › Q1 · Store demo › home: 18 elements ready (17 baked + 1 clear), 0 live contexts after load, no console errors (4.2s)
✓   87 [webkit] › packages/element/e2e/demo.spec.ts:56:5 › Q1 · Store demo › catalogue at 390 px: columns of different heights, no horizontal overflow (260ms)
✓   88 [webkit] › packages/element/e2e/demo.spec.ts:56:5 › Q1 · Store demo › catalogue at 768 px: columns of different heights, no horizontal overflow (255ms)
✓   89 [webkit] › packages/element/e2e/demo.spec.ts:56:5 › Q1 · Store demo › catalogue at 1024 px: columns of different heights, no horizontal overflow (263ms)
✓   90 [webkit] › packages/element/e2e/demo.spec.ts:56:5 › Q1 · Store demo › catalogue at 1440 px: columns of different heights, no horizontal overflow (255ms)
✓   91 [webkit] › packages/element/e2e/demo.spec.ts:90:3 › Q1 · Store demo › hero: hover slides the glass away on one context; product page: the loupe, no context at rest (4.7s)
✓   92 [webkit] › packages/element/e2e/demo.spec.ts:118:7 › Q1 · Store demo › axe: home at 390 px has no WCAG 2.2 A/AA violations (1.7s)
✓   93 [webkit] › packages/element/e2e/demo.spec.ts:118:7 › Q1 · Store demo › axe: home at 1440 px has no WCAG 2.2 A/AA violations (2.4s)
✓   94 [webkit] › packages/element/e2e/demo.spec.ts:118:7 › Q1 · Store demo › axe: product at 390 px has no WCAG 2.2 A/AA violations (955ms)
✓   95 [webkit] › packages/element/e2e/demo.spec.ts:118:7 › Q1 · Store demo › axe: product at 1440 px has no WCAG 2.2 A/AA violations (895ms)
✓   96 [webkit] › packages/element/e2e/fallback.spec.ts:5:3 › P1 · fallbacks (E6) › image without CORS headers → vitrine:fallback(cors), <img> stays, no console error (287ms)
✓   97 [webkit] › packages/element/e2e/grid.spec.ts:9:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › 24 baked cards + 1 live hero: 0 webglcontextlost, 0 live contexts after bake, hero survives (3.7s)
✓   98 [webkit] › packages/element/e2e/grid.spec.ts:79:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › keyboard: Tab onto a card reveals the photo, Tab away hides it again (1.1s)
✓   99 [webkit] › packages/element/e2e/grid.spec.ts:115:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › hover reveals on the nearest link and the baked layer stays aria-hidden (497ms)
✓  100 [webkit] › packages/element/e2e/grid.spec.ts:133:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › prefers-reduced-motion: hero is baked (no canvas), reveal has no transition (603ms)
✓  101 [webkit] › packages/element/e2e/q1.spec.ts:51:3 › Q1 · glass card › hover opens the glass on one context, leaving closes it, 0 contexts 2 s later (6.2s)
✓  102 [webkit] › packages/element/e2e/q1.spec.ts:69:3 › Q1 · glass card › 10 fast hovers across the cards: at most 1 live context, 0 after 2 s (5.4s)
✓  103 [webkit] › packages/element/e2e/q1.spec.ts:87:3 › Q1 · glass card › keyboard: Tab onto the card link opens, Tab away closes; Enter/Space toggle a focusable non-link card (4.6s)
✓  104 [webkit] › packages/element/e2e/q1.spec.ts:113:3 › Q1 · glass card › prefers-reduced-motion: open and close without animation and without a context (2.4s)
✓  105 [webkit] › packages/element/e2e/q1.spec.ts:128:3 › Q1 · touch › tap opens the glass and does not navigate; the second tap follows the link (3.4s)
✓  106 [webkit] › packages/element/e2e/q1.spec.ts:146:3 › Q1 · fallbacks › no WebGL2: every element falls back to the photo, nothing is covered (2.1s)
✓  107 [webkit] › packages/element/e2e/q1.spec.ts:173:3 › Q1 · loupe › the loupe appears under the pointer, follows it, and leaves 0 contexts (5.6s)
✓  108 [webkit] › packages/element/e2e/q1.spec.ts:209:3 › Q1 · pre-order › frost by days left: 30 > 7 > 1 day, clear on and after the release (2.5s)
-  109 [webkit] › packages/element/e2e/store.spec.ts:85:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › home: hero + editorial sections render, hero live, editorial baked, no errors
-  110 [webkit] › packages/element/e2e/store.spec.ts:110:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › collection: every card image is inside <vitrine-shader>, all baked, 0 canvases
-  111 [webkit] › packages/element/e2e/store.spec.ts:133:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › collection: keyboard reveal on the card link
-  112 [webkit] › packages/element/e2e/store.spec.ts:149:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › collection: reduced motion keeps everything static
✓  113 [webkit] › packages/element/e2e/theme-markup.spec.ts:30:3 › P2 · theme markup (shopify-theme/ rendered) › 26 script tags, 1 fetch; 24 cards + editorial baked, hero live, 0 contexts after bake (3.7s)
✓  114 [webkit] › packages/element/e2e/theme-markup.spec.ts:85:3 › P2 · theme markup (shopify-theme/ rendered) › keyboard: Tab onto a card reveals the photo, Tab away hides it (670ms)
✓  115 [webkit] › packages/element/e2e/theme-markup.spec.ts:105:3 › P2 · theme markup (shopify-theme/ rendered) › editorial figure is the reveal surface (data-vitrine-card), hover reveals (1.5s)
✓  116 [webkit] › packages/element/e2e/theme-markup.spec.ts:115:3 › P2 · theme markup (shopify-theme/ rendered) › prefers-reduced-motion: hero baked, no transition (687ms)
-  117 [webkit] › packages/element/e2e/theme-markup.spec.ts:127:3 › P2 · theme markup (shopify-theme/ rendered) › screenshots 390 and 1440 (chromium)
✓  118 [webkit] › packages/element/e2e/whitepoint.spec.ts:14:1 › whitePoint: the cream ground prints as clean paper, the product keeps its ink (1.5s)
9 skipped
109 passed (4.8m)
e2e chromium+webkit exit 0
```

Firefox: `pnpm exec playwright test packages/element/e2e/q1.spec.ts --project=firefox`, nie startuje na tej maszynie (jak od P0; obejście sandboxa sesji odrzucone przez klasyfikator uprawnień, więc nie próbowałem dalej). `pnpm test:e2e` bez `--project` kończy się kodem 1 wyłącznie przez 54 testy Firefoxa (pierwszy przebieg: 108 passed, 13 skipped, 56 failed = 54 Firefox + 2 theme-markup, te dwa naprawione: 404 na arkuszu, który został w `examples/static`).

```
    Error: browserType.launch: Failed to launch the browser process.
    Browser logs:

    <launching> /Users/oszi/Library/Caches/ms-playwright/firefox-1555/firefox/Nightly.app/Contents/MacOS/firefox -no-remote -headless -profile /var/folders/7j/d1p63jns6cd8syzm86cfs__m0000gn/T/playwright_firefoxdev_profile-PscNoq -juggler-pipe -silent
    <launched> pid=55593
    [pid=55593][err] *** You are running in headless mode.
    [pid=55593][err] Could not find profile folder.
    [firefox] › packages/element/e2e/q1.spec.ts:146:3 › Q1 · fallbacks › no WebGL2: every element falls back to the photo, nothing is covered 
    [firefox] › packages/element/e2e/q1.spec.ts:173:3 › Q1 · loupe › the loupe appears under the pointer, follows it, and leaves 0 contexts 
    [firefox] › packages/element/e2e/q1.spec.ts:209:3 › Q1 · pre-order › frost by days left: 30 > 7 > 1 day, clear on and after the release 
e2e firefox exit 1
```

Pominięte (9): `store.spec.ts` na sklepie bez `VITRINE_STORE_URL` (4 × 2, jak od P2) i zrzuty theme-markup tylko w Chromium.

## Świadomie pominięte

- Hero z dwiema szybami rozchodzącymi się od kursora (makieta R0): wymaga 2 kontekstów albo łatki shadera; zostaje jedna szyba (ADR-0003, przed/po wyżej).
- Firefox: niezmierzony (przeglądarka Playwrighta nie startuje w tej sesji).
- Lighthouse `next` i pomiar na sklepie: nie były w GOTOWE (tylko static); motyw testowy na `niwwts.myshopify.com` ma nadal v0.1.0.
- Pomiar ramek w WebKit/Safari: tylko Chrome (prompt).
- `examples/r0/` (harness arkuszy R0) czyta nowe zdjęcia zegarka i słuchawek; punkty lupy z R0 (`focus` dla `06-watch`) nie były przestrojone, bo arkusze R0 są zamknięte.

## Usprawnienia spoza zadania (do decyzji)

1. `motion.ts` w rdzeniu podniósł `index.js` z 16,4 do 22,1 KB gz; można go ładować dynamicznie dopiero dla `glass`/`lens` (jak chunki efektów).
2. Start kontekstu szyby (167–217 ms przy CPU ×4) da się skrócić, wgrywając teksturę bez mipmap tylko na czas ruchu, ale to zmienia piksele względem upstreamu (dziś: mipmapy jak w React, zgodność 1:1).
3. Etykieta „Pre-order · ships …” na 390 px łamie się na 3 linie; krótsza forma („Ships 11 Nov”) na wąskich kartach.
4. `theme-markup.html` (test motywu) dalej pokazuje NIWWTS i stare style v0.1; warto przepisać na snippety v0.2, gdy motyw testowy na sklepie dostanie Q1.
5. `vitrine-card-media` (v0.1) i ustawienia motywu nie mają opcji `glass`; dziś szybę daje osobny snippet.

## Co blokuje upublicznienie

Bramka Q1 (Piotrek, telefon); merge `r0-kierunek` → `q1-trzy-efekty` → `main`; decyzja o wersji npm (0.2.0, CHANGELOG); README główne i GIF-y w README nadal pokazują v0.1 (dither) i trzeba je podmienić na materiał Q1 przed zmianą widoczności repo; motyw testowy na sklepie bez v0.2.

## Na koniec

1. Telefon: `pnpm build && pnpm serve`, potem `http://<ip-maca>:4173/examples/static/` (tap na kartę, przytrzymanie palca na zdjęciu w PDP); Next: `pnpm --filter next-headless start` → `http://<ip-maca>:3000/`.
2. Pominięte świadomie: drzwi dwuskrzydłowe w hero (budżet 1 kontekstu), Firefox (nie startuje w sesji), Lighthouse Next i pomiar na sklepie.
3. Szyba zaczyna ruch 245 ms (karta) / 342 ms (hero) po wskaźniku przy CPU ×4; w ruchu karta 60 fps, hero mediana 24,9 ms.
4. Blokuje upublicznienie: bramka Q1, merge R0 i Q1 do `main`, README/GIF-y z v0.1, wersja npm.
5. Media do bramki: `docs/media/q1-*.webp`, `q1-glass.mp4`, `q1-loupe.mp4`; pełne PNG i GIF lokalnie.
