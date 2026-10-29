# Q0 · Blokery zgłoszenia i porządki wizualne (29.10.2026)

Gałąź `q0-blokery` od `main` (064b015 = v0.1.0 + dokumentacja P5). Prompt: `docs/vitrine/PROMPTY-v02.md` (skopiowany z folderu planowania). Wszystko poniżej zrobił agent; nic nie było strojone ani projektowane na płótnie Paper.

## Skille

| Skill | Po co | Co zmienił w wyniku |
| --- | --- | --- |
| `taste-guardrail` | Lock przed hero i katalogiem, Exit Check przed oddaniem | Lock niżej (świat: odbitka próbna z drukarni + lupa lnianka; jedna sygnatura = lupa; pokrętła 7/3/5; „NIE czarna płyta na rozmytym gradiencie”). Wymusił, że mesh nie może być tłem pod tłem: z pełnej szerokości pod hero przeszedł do paska kontrolnego (colour bar) pod samym printem. Exit Check 12/13. |
| `niwwts-aesthetic` | Arbiter: preset, hero, siatka | Wybór 0,9 dla `whitePoint` (dwa tony + papier, zero szumu na tle: 23,6 % → 0 %). Odrzucił warianty samych parametrów jako „brud” (raster 8–63 % na gruncie, arkusz `q0-dither-variants.png`). Lupa z twardą krawędzią (maska z dwoma stopami w tym samym miejscu, bez rozmycia, bez cienia), pierścień tusz + papier. Akcent (oranż No.06) tylko wewnątrz lupy: z pracy, nie z UI. Kierunek: Molnár (siatka + jedna odchyłka: karta 2 × 2) i Op Art (czarno-biały wir w druku). Audyt 8 punktów: 7/8 (ruch nie jest zsynchronizowany z muzyką, n/d dla strony). |
| `awwwards-art-director` | Kierunek hero (STEP 1–4 skrótem, bez konceptów do wyboru, brief jest w prompcie) | Koncept „Proof print”: drukarz sprawdza odbitkę lupą, kursor jest lupą. Hero 38 / 62, print ucięty do prawej krawędzi strony, praca UPTOWN SATURDAY DESCENT (oranż + czerń: w druku czarno-biały wir, w lupie kolor), nie mockup; tytuł „Print it once.” zostaje (P4). Mobile: tytuł, lede, print na pełną szerokość, lupa na printach od pierwszego ekranu. |
| `security-perf-auditor` | B4: TBT, kolejka wypalania | Zamiast zgadywać: pomiar per wypalenie (`wait/render/upload/read/gpu/blob/main`), longtask observer i ślad Lighthouse. Znalezione po kolei: (1) 854 ms w jednym zadaniu, bo wypalenia szły łańcuchem obietnic; (2) 45 ms na kartę z tekstury 1600 px dla karty 200 px; (3) cały koszt GPU wychodzi w synchronicznym `readPixels` (97 / 271 ms bez throttlingu); (4) LCP liczony przez symulację razem z modułem elementu, bo zdjęcie hero malowało się klatkę po tytule. Każdy punkt ma poprawkę i pomiar przed/po. Severity: (1)–(3) HIGH dla TBT, (4) MEDIUM. Otwarte: Next TBT (niżej). |
| `test-engineer` | Strategia testów nowych części | Vitest na czystej logice: łatka shadera (dokładnie 2 dodane linie, wyjątek przy zmianie upstreamu), mapowanie `whitePoint`, kolejka (jeden slot naraz, bliskie przed dalekimi, nigdy synchronicznie; fałszywe timery). Playwright na tym, czego nie da się bez GPU: `whitepoint.spec.ts` (12 mockupów, grunt 0 % z opcją i > 15 % bez niej, czyli dowód, że czyści opcja), geometria siatki na 4 szerokościach, lupa (pozycja, maska, click, Enter), strona stress. Zero retry, zero sleepów jako asercji. |
| `a11y-gate` | Hero, siatka, płyta | Hero jako `<button aria-pressed>` z nazwą „… show the photo under the dither” (klawiatura: Enter/Spacja podnoszą cały druk; test). Fokus przeniesiony na zewnątrz printu (wewnątrz znikał na ciemnym druku, 2.4.7). Pierścień lupy ukryty, gdy nie ma druku (fallback, `?effects=off`). Kontrast liczony skryptem: tusz/papier 15,74:1, blue-rice/papier 5,10:1. Werdykt niżej. |
| `web-copy` | Teksty EN: hero, płyta, `submission.md`, README | Karta głosu z P4 („developer mówi do developera”, liczby z pomiarów). Hero: co to robi w jednym zdaniu, instrukcja osobno dla kursora i dotyku. Zgłoszenia: każde zdanie o Paperze zgodne z `process.md` („laid out on the Paper canvas”, „presets started as frames there, picked on renders of the element”); (a) 114 słów, (b) 277 znaków. Pass anty-slop: bez myślników typograficznych w nowych tekstach, bez „not only… but”. |

Brak skilli: żaden z obowiązkowych nie brakował.

## Lock (taste-guardrail + niwwts-aesthetic + awwwards-art-director), przed hero i katalogiem

1. **Świat:** arkusz drukarski NIWWTS No.06 z P4, teraz z odbitką próbną: lupa lnianka nad drukiem, pasek kontrolny u dołu arkusza.
2. **Typografia:** Archivo, kontrast na osi szerokości (62 % tytuły, 100 % tekst, 125 % etykiety), bez zmian.
3. **Kolor:** papier `#F1ECE2`, tusz `#151311`, blue-rice tylko jako tekst etykiet; oranż wyłącznie ze zdjęcia, widoczny w lupie.
4. **Ruch strukturalny:** print hero ucięty do prawej krawędzi strony; karta wiodąca 2 × 2.
5. **Sygnatura:** lupa (jedna). Nic więcej: bez animacji wejścia, bez parallaxu.
- Pokrętła: wariancja 7, ruch 3 (lupa podąża za kursorem, nic się nie animuje samo), gęstość 5.
- Negatyw: „To NIE może wyglądać jak czarna płyta na rozmytym gradiencie ani jak hero SaaS ze zrzutem ekranu”.

## Co zrobiłem

### B1 · Prawdziwość zdań o Paperze

Poprawione: `examples/static/index.html` (sekcja „Made with Paper.”: układ strony z płótna Paper, print hero później w kodzie, presety: ramki w Paper, wybór na renderach elementu), `docs/vitrine/submission.md` (a, b, c, d, plus pkt 2 konspektu artykułu), `docs/vitrine/process.md` (nagłówek §1, tabela §3 z osobnymi wierszami „Tuning … ✔ agent, na prośbę Piotra” i „Shader layers on the canvas: not built”, nowa §4 „Q0: what changed without the canvas”, notka w §2), `presets/README.md` (zdanie o „P4 tunes them in Paper”), `README.md` (sekcja Made with Paper), `ROADMAP.md` i `docs/vitrine/paper-export/README.md` (plany sformułowane tak, żeby nie czytały się jak przeszłość).

```
$ git grep --untracked -n -i -E "tuned (on|in) (the )?(paper|canvas)|tuned on the (paper )?canvas|presets were tuned|tunes? them in paper|tuning in paper|tuned shader" -- ":!docs/vitrine/devlog" ":!docs/vitrine/PROMPTY*" ":!docs/vitrine/PLAN.md"
exit 1 (1 = no match)
$ grep -n -i "tuned\|stroj\|strojen" docs/vitrine/PLAN.md
(brak wyników)
```

Devlogi i prompty wykluczone celowo: opisują historię i polecenia, nie stan.

### B2 · Dither bez brudnego tła

Pomiar luminancji gruntu mockupów (Python, pasy 6 % przy krawędziach, 12 zdjęć): **0,927 na wszystkich 12** (min = mediana = max).

Dlaczego parametry nie wystarczą (shader upstream, `image-dithering.ts`): `brightness = lum + (bayer − 0,5) / colorSteps`, potem zaokrąglenie do kroków. Najniższa wartość Bayera daje −0,5 / kroki, więc czysty papier wychodzi tylko przy `lum = 1`. Każdy grunt poniżej 1 dostaje kropki przy dowolnych krokach, rozmiarze i typie.

Pomiar na 12 mockupach (`node scripts/dither-sheet.mjs variants`, strona `packages/element/e2e/pages/dither-sheet.html`; grunt = piksele o luminancji źródła 0,927 ± 0,015, maska zwężona o 3 px od krawędzi produktu; „brud” = kolor różny od papieru o > 8 na którymkolwiek kanale):

```
$ node scripts/dither-sheet.mjs variants
v0.1 newsprint     background raster mean  23.64 %  min 23.13 %  max 23.88 %
colorSteps 2       background raster mean  15.64 %  min 15.25 %  max 15.68 %
colorSteps 1       background raster mean   8.06 %  min 7.93 %  max 8.2 %
colorSteps 7       background raster mean  51.48 %  min 51.18 %  max 51.57 %
4×4, size 3        background raster mean  24.96 %  min 24.85 %  max 25.09 %
random             background raster mean   8.29 %  min 7.84 %  max 8.57 %
size 1             background raster mean  23.25 %  min 22.68 %  max 23.46 %
highlight #fff     background raster mean  62.98 %  min 62.6 %  max 63.43 %
whitePoint 0.92    background raster mean      0 %  min 0 %  max 0 %
whitePoint 0.9     background raster mean      0 %  min 0 %  max 0 %
whitePoint 0.85    background raster mean      0 %  min 0 %  max 0 %

$ node scripts/dither-sheet.mjs before-after
before · v0.1      background raster mean  23.64 %  min 23.13 %  max 23.88 %
after · v0.2       background raster mean      0 %  min 0 %  max 0 %
```

Decyzja: opcja elementu `whitePoint` (poziomy luminancji przed ditheringiem: `lum = min(lum / whitePoint, 1.)`), domyślnie wyłączona; `newsprint` dostaje 0,9 (zapas względem gruntu 0,927 na szum zdjęć sklepu). Przy wyłączonej opcji element używa niezmienionego źródła upstreamu; przy włączonej osobnego wariantu z jednym uniformem i jedną linijką (osobny piekarnik `dither+whitePoint`). Test zgodności dla `newsprint` biegnie z `whitePoint: 1` (strona `compat.html` zdejmuje opcje spoza upstreamu z referencji React i wyłącza je na elemencie), więc porównuje shader upstreamu z shaderem upstreamu.

Pierwsza wersja metryki (luminancja ≥ 0,9) łapała krawędzie ram i passe-partout printów i dawała do 5 % przy dpr 1; poprawiona na maskę samego gruntu. Wiersze „bez opcji” w arkuszu muszą mieć jawne `whitePoint: 1`, bo preset ma ją od Q0 (pierwszy przebieg pokazał 0,11 % dla „v0.1”, bo nim nie był).

Kontaktówka: `docs/media/q0-dither-before-after.png` (+ `.json`), wszystkie warianty: `q0-dither-variants.png`.

### B3 · Katalog

- 12 unikalnych produktów (`index.html`), `srcset` 640 / 1000 / 1600 px (`examples/spikes/fixtures/w640`, `w1000`: ImageMagick `-resize <w>x -quality 82`, opisane w README fixtures).
- Karta wiodąca 2 × 2: jej karta jest wyjęta z przepływu (`position:absolute; inset:0`), więc wysokość dwóch rzędów wyznaczają karty obok, a karta wiodąca je wypełnia (obraz `object-fit: cover`, shader `fit: cover` przy tym samym środku, wypalony na rozmiar pudełka). Poniżej 900 px wraca do zwykłego przepływu.
- Płyta zamykająca: 1 komórka (4 kolumny: 4 + 11 + 1 = 16; 2 kolumny: 2 + 11 + 1 = 14), `contain: size`, żeby nie wyznaczała wysokości rzędu (na 390 px jej tekst wydłużał rząd o 20 % względem karty TYPE).
- Przy okazji (znalezisko, P4): kolumny kodu „Three stacks” rozpychały stronę o 15 px (390) i 88 px (1024) ponad viewport (`p4-demo-390.png` ma 405 px szerokości). `min-width: 0` na `.stack`.
- 24 karty × 0 kontekstów: `examples/static/stress.html` (24 karty z oryginałów 1600 px bez `srcset`, żywy mesh, import od razu = najgorszy przypadek v0.1).

Geometria (`packages/element/e2e/static.spec.ts`, „grid at N px”): `covered` = suma pól komórek / pole siatki (reszta to hairline 1 px), `minFill` = najmniejsza część wysokości komórki, do której sięga treść karty.

| Szerokość | covered | minFill | scrollWidth = clientWidth |
| --- | ---: | ---: | --- |
| 390 | 0,9888 | 0,892 | 390 = 390 |
| 768 | 0,9941 | 1,000 | 768 = 768 |
| 1024 | 0,9922 | 0,954 | 1024 = 1024 |
| 1440 | 0,9944 | 1,000 | 1440 = 1440 |
| v0.1.0 przy 1440 (dla porównania) | | **0,532** (karty obok wiodącej) | |

Te same wartości w Chromium i WebKit (`docs/media/q0-grid-*-{chromium,webkit}.json`).

### B4 · Wypalanie poza ścieżką krytyczną

Zmiany w elemencie (szczegóły w ADR-0001, „Uzupełnienie z Q0”):
1. `bake-queue.ts`: każde wypalenie w osobnym zadaniu; elementy w odległości ± ½ ekranu od viewportu pierwsze, jedno na klatkę (rAF → `setTimeout 0`), reszta w `requestIdleCallback` (timeout 2 s; bez rIC: 50 ms).
2. `readback.ts`: `readPixels` do PIXEL_PACK_BUFFER + `fenceSync`, odpytywanie co 4 ms, `getBufferSubData` po sygnale; fallback: synchroniczny `readPixels`.
3. `encode.ts`: odwrócenie wierszy i PNG w workerze z Blob URL (`OffscreenCanvas.convertToBlob`); fallback: 2D canvas + `toDataURL` z v0.1.
4. Strona demo: `srcset` na kartach i edytorialu; element importowany po zdekodowaniu i namalowaniu zdjęcia hero (2 klatki po `load`); lokalny Archivo z `preload`; `.proof__print { display:block }` przed rejestracją elementu.

Droga do wyniku (każdy krok zmierzony; „próbnik” = Playwright, 412 × 823, dpr 1,75, longtask observer, `detail.bake` z `vitrine:ready`):

| Krok | Pomiar | Wynik |
| --- | --- | --- |
| v0.1, demo P4 | próbnik CPU ×4 | długie zadania `[74, 98, 129, 53, 854]` ms; 854 ms = kilkanaście wypaleń w jednym zadaniu (łańcuch obietnic) |
| + kolejka + worker | próbnik CPU ×4 | `[86, 95, 54, 102, 274, 52, 58, 50]`; karta: `render` 43–59 ms (tekstura 1600 px na kartę 217 × 261 px), kodowanie 2 ms |
| + nowa strona (12 kart, `srcset`) | Lighthouse | 67, TBT 1 075 ms, LCP 3 694 vs 2 779 bez elementu; ślad: `FireIdleCallback` 275 ms i `TimerFire` 122 ms realnego czasu (symulacja × 4) |
| rozbicie `render` | próbnik CPU ×1 | `upload` 0–5 ms, `read` 97 ms (pierwszy dither), 271 ms (paper): koszt GPU wychodzi w `readPixels` |
| + odczyt asynchroniczny | próbnik CPU ×1 | **0 długich zadań**; `main` 2–18 ms na wypalenie, `gpu` 5–333 ms poza wątkiem |
| | Lighthouse | 89, TBT 120 ms, LCP 3 694 vs 2 778 (LCP = `<img>` hero w obu, ale z elementem malowało się klatkę po tytule) |
| + import po namalowaniu hero | Lighthouse | **96 vs 96, TBT 63 ms, ΔLCP 0** |
| końcowo | próbnik CPU ×4 | demo: długie zadania `[51]`; karta `main` mediana 8 ms (7–17), `gpu` 5 ms, `readback async`, `encode worker`; print hero `main` 26 ms. Stress (1600 px): `[64, 71, 52]`, karta `main` mediana 40 ms (18–53) |

Lighthouse 13.6.0, mobile (Moto G Power, CPU ×4, symulowane wolne 4G), 3 przebiegi, mediana, `node scripts/lighthouse.mjs` (dodane `VITRINE_LH_OUT`, `VITRINE_LH_PAGE`, żeby nie nadpisać dowodów P1). Serwer testowy bez kompresji, tak samo przed i po.

| Strona | Kod | Z VITRINE | Bez | TBT z | CLS | ΔLCP | Plik |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| demo (strona P4, 24 karty) | v0.1.0 | 70 · LCP 1 604 | 83 · 1 545 | 525 | 0,329 | +59 | `q0-lighthouse-before.json` |
| demo (strona Q0, 12 kart) | Q0 | **96 · LCP 2 778** | 96 · 2 778 | **63** | **0** | **0** | `q0-lighthouse-after.json` |
| stress (ta sama treść) | v0.1.0 | 84 · 3 604 | 93 · 3 228 | 286 | 0 | +376 | `q0-lighthouse-stress-before.json` |
| stress (ta sama treść) | Q0 | 88 · 3 604 | 93 · 3 229 | 179 | 0 | +375 | `q0-lighthouse-stress-after.json` |
| Next (24 karty + hero) | v0.1.0 | 99 · 757 | 100 · 757 | 148 | 0 | 0 | `q0-lighthouse-next-before.json` |
| Next (24 karty + hero) | Q0 | 96 · 756 | 100 · 756 | 236 | 0 | 0 | `q0-lighthouse-next.json` |

Przebiegi demo Q0: z efektami 96/96/96, TBT 28/64/63, LCP 2 780/2 778/2 778; bez: 96 × 3, TBT 0, LCP 2 778–2 778. Stress v0.1.0 i Q0 mierzone na tym samym HTML i CSS (worktree z tagu `v0.1.0`, różni się tylko `packages/element/dist`). Next v0.1.0 z worktree, ten sam skrypt i maszyna.

Cele B4: **Lighthouse mobile static ≥ 95: 96 ✓. TBT < 200 ms: 63 ms ✓. LCP bez regresji: ΔLCP 0 ms z elementem i bez ✓.** Uczciwie: LCP strony w liczbach bezwzględnych wzrósł z 1 604 do 2 778 ms, bo nowe hero (B5) jest zdjęciem, a stare było tekstem; element dokłada do tego 0 ms. Font 90 KB dzieli łącze ze zdjęciem; podzbiór znaków daje 72,5 KB (fontTools, sprawdzone), nie wdrożone (zmodyfikowany plik fontu za ok. 0,1 s symulacji).

CLS 0,329 przed: Lighthouse wskazał `<main>` z przyczynami „Media element lacking an explicit size” i „Web font loaded”. Font z Google Fonts przychodził po pierwszym malowaniu i zmieniał łamanie mastheadu. Po przejściu na lokalny plik z `preload`: CLS 0. Ten regres był na stronie od P4; README podawał 0,002 z P1.

**Otwarte, Next:** 96 i TBT 236 ms wobec 99 i 148 ms w v0.1.0. Ślad: długie zadania to `Commit` kompozytora (64–90 ms), bez JS w środku. Sprawdzone i wykluczone: płótno piekarnika w drzewie renderowania (`content-visibility:hidden` na gospodarzu: bez zmian, cofnięte), odczyt asynchroniczny (z synchronicznym TBT 268 / 191 ms i wraca 81-milisekundowe zadanie `readPixels`). Najpewniej commit czeka na programowy GPU, który dzieli CPU z animowanym hero (w v0.1.0 te same commity też są: 72 i 46 ms). Do Q1, bo dotyka puli i żywego hero (pomysł: żywy hero dopiero po wypaleniu kart w viewporcie). README pokazuje tę liczbę wprost.

Rozmiary (gzip -9, `packages/element/dist`):

| Plik | v0.1.0 | Q0 |
| --- | ---: | ---: |
| `index.js` (rdzeń + kolejka + odczyt + koder) | 14 379 B | 16 408 B |
| `chunks/dither-*.js` (+ łatka `whitePoint`) | 2 829 B | 3 314 B |
| `shopify-theme/assets/vitrine.js` | 44 188 B | 46 103 B |
| strona z samym ditheringiem (rdzeń + 3 wspólne + dither) | 21,4 KB | 23,9 KB |

### B5 · Hero

`examples/static/index.html` + `styles.css`: sekcja `.proof`. Print to `<vitrine-shader effect="dither" preset="newsprint" reveal="none">` z pracą UPTOWN SATURDAY DESCENT (`fetchpriority="high"`, `srcset`, `preload`). Lupa: maska `radial-gradient(circle var(--lr) at var(--lx) var(--ly), transparent 100%, #000 100%)` na `.vitrine-layer` (twarda krawędź), pierścień `.proof__loupe`; pozycję ustawia 20 linijek skryptu strony (mysz i pióro: ruch; dotyk: tap przestawia; click / Enter / Spacja: `aria-pressed` podnosi cały druk). To kod strony, nie API elementu (`bind` przychodzi w Q1). Mesh: pasek 28 px pod printem („colour bar”), jedyny żywy kontekst strony. `docs/media/readme-hero.jpg` i `readme-grid.jpg` z `node scripts/readme-media.mjs`; `vitrine-card-reveal.gif` z `node scripts/gif-card.mjs` (1,93 MB).

### B6 · Next bez sieci

`examples/next-headless/app/layout.tsx`: `next/font/local` z `examples/fonts/archivo/archivo-latin-wdth-wght.woff2` (Google Fonts, blok latin v25, 90 096 B, SHA-256 `4c98b9d4…5ad`), licencja `examples/fonts/archivo/OFL.txt` (z `google/fonts`), `README.md` obok. `declarations: font-stretch 62% 125%`, `adjustFontFallback: 'Arial'`. Ten sam plik ładuje `examples/static` (`@font-face`).

Dowód w piaskownicy macOS bez ruchu wychodzącego (`sandbox-exec`, dozwolony tylko localhost):

```
$ sandbox-exec -p '(version 1)(allow default)(deny network-outbound (remote ip "*:*"))(allow network-outbound (remote ip "localhost:*"))(allow network-outbound (remote unix-socket))' curl -sS -m 5 https://fonts.googleapis.com -o /dev/null
curl: (7) Failed to connect to fonts.googleapis.com port 443 after 2 ms: Couldn't connect to server
curl exit 7

# stara wersja (git stash), ta sama piaskownica, next build:
There was an issue establishing a connection while requesting https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap
    [next]/internal/font/google/archivo_ec6db783.module.css

# nowa wersja, ta sama piaskownica, rm -rf .next && pnpm build:
✓ Compiled successfully in 1145ms
✓ Generating static pages using 5 workers (3/3) in 232ms
Route (app)
┌ ƒ /
├ ○ /_not-found
└ ƒ /products/[handle]
```

Uwaga: plik ma podzbiór latin (U+0000–00FF i typografia), a poprzednio Next prosił o latin + latin-ext. Teksty przykładu są po angielsku.

### B7 · Publiczne demo

- `.github/workflows/pages.yml`: push na `main` lub ręcznie; job pomijany (nie czerwony), dopóki repo jest prywatne (`!github.event.repository.private`); `pnpm install --frozen-lockfile`, build paczek i motywu, `pnpm test`, `node scripts/pages-site.mjs _site`, `upload-pages-artifact`, `deploy-pages`. Akcje przypięte do SHA (z `gh api …/releases/latest`): checkout v7.0.1, pnpm/action-setup v6.1.0, setup-node v7.1.0 (Node 26.5.0), configure-pages v6.0.0, upload-pages-artifact v5.0.0, deploy-pages v5.0.1. Bez sekretów.
- `scripts/pages-site.mjs` zachowuje ścieżki repo (strona importuje `../../packages/element/dist`), dokłada przekierowanie z korzenia, `.nojekyll`, `LICENSE`, `NOTICE` i `third_party/paper-shaders/`.
- Sprawdzone lokalnie: `_site` serwowany samodzielnie (`python3 -m http.server --directory _site`), przekierowanie → demo 14 / 14 gotowe, font załadowany, stress 25 / 25, theme-markup 26 elementów, 0 odpowiedzi ≥ 400 (pierwszy przebieg znalazł brak `vitrine-theme.css`, poprawione). YAML sprawdzony parserem Ruby; samego workflow nie uruchamiałem (brak `act`, repo prywatne).
- README: linki „Live demo (static HTML)” i „Headless demo (Next.js)” jako `TODO_PAGES_URL` / `TODO_VERCEL_URL`, instrukcja w komentarzu HTML obok i w STATUS.

```
$ node scripts/pages-site.mjs
pages-site: 76 files, 1788.6 KB → /Users/oszi/Desktop/Projects/vitrine/_site
$ ruby -ryaml -e '…'
yaml ok: jobs=["build", "deploy"] build steps=10 triggers={"push"=>{"branches"=>["main"]}, "workflow_dispatch"=>nil}
```

### B8 · Checklista

W `docs/vitrine/STATUS.md`, sekcja „Po Q0: upublicznienie”: merge → repo publiczne → Pages → npm (z decyzją o wersji: paczka ma 0.1.0, kod po Q0 różni się od tagu) → Vercel → podmiana TODO. Dry-run:

```
$ cd packages/element && npm publish --dry-run
npm notice name: vitrine-shaders
npm notice version: 0.1.0
npm notice package size: 145.8 kB
npm notice unpacked size: 437.1 kB
npm notice total files: 26
+ vitrine-shaders@0.1.0
```

## Znaleziska poza zakresem (nie naprawione)

1. **Cache wypaleń zwalnia URL-e w locie.** `bakeCache` (LRU 96) dostaje wpis w chwili zlecenia; przy > 96 unikalnych wypaleniach naraz najstarsze wypadają, zanim się skończą, a ich URL jest zwalniany (`revokeObjectURL`), więc element podstawia martwy obraz. Repro: arkusz 11 × 12 kart naraz (pierwsza wersja `dither-sheet.html`: „The source image cannot be decoded”). Dotyczy też v0.1. Demo i sklep z kolekcją ≤ 96 unikalnych zdjęć tego nie widzą. Poprawka: zwalniać URL dopiero po rozwiązaniu i odłączeniu ostatniego użytkownika albo nie wstawiać do LRU przed wynikiem.
2. **Next: TBT 236 vs 148 ms** (wyżej).
3. **CRAYONS (WARM)**: jasna praca znika w ditheringu (w v0.1 też, z `whitePoint` jeszcze bardziej: ~400 ciemnych pikseli wobec ~3 700 na innych kartach). Kandydat na osobny preset albo inne zdjęcie w demo.
4. Kompilacja shadera w konstruktorze ShaderMount jest synchroniczna (`getProgramParameter(LINK_STATUS)` upstream): raz na efekt na stronę.
5. Font: podzbiór 72,5 KB zamiast 90 KB (wyżej).

## Komendy końcowe (pełne wyjścia)

```
$ pnpm typecheck   → EXIT 0
$ tsc -p tsconfig.json --noEmit && pnpm -r --filter "./packages/*" run typecheck && pnpm --filter next-headless run typecheck
Scope: 2 of 4 workspace projects
packages/element typecheck$ tsc -p tsconfig.json --noEmit
packages/element typecheck: Done
packages/react typecheck$ tsc -p tsconfig.json --noEmit
packages/react typecheck: Done
$ node scripts/sync-fixtures.mjs && next typegen && tsc --noEmit
sync-fixtures: 16 files → public/fixtures/
Generating route types...
✓ Types generated successfully

$ pnpm lint   → EXIT 0
$ eslint . && prettier --check .
Checking formatting...
All matched files use Prettier code style!

$ pnpm test   → EXIT 0
$ vitest run
 RUN  v5.0.5 /Users/oszi/Desktop/Projects/vitrine
 Test Files  8 passed (8)
      Tests  46 passed (46)
   Start at  21:26:07
   Duration  216ms (import 40%, transform 33%, tests 15%, worker 11%)

$ pnpm build   → EXIT 0 (paczki, assemble-react, next build; w tym środowisku z siecią, bez sieci: B6)
$ pnpm -r --filter "./packages/*" run build && node scripts/assemble-react.mjs && pnpm --filter next-headless run build
Scope: 2 of 4 workspace projects
packages/element build$ tsup
packages/element build: CLI Building entry: {"index":"src/index.ts"}
packages/element build: CLI Using tsconfig: tsconfig.json
packages/element build: CLI tsup v9.0.0
packages/element build: CLI Using tsup config: /Users/oszi/Desktop/Projects/vitrine/packages/element/tsup.config.ts
packages/element build: CLI Target: es2022
packages/element build: CLI Cleaning output folder
packages/element build: ESM Build start
packages/element build: ESM dist/index.js                        59.37 KB
packages/element build: ESM dist/chunks/paper-CLRTI67X.js        20.28 KB
packages/element build: ESM dist/chunks/dither-5UB6N4X2.js       9.41 KB
packages/element build: ESM dist/chunks/chunk-44EAVKDO.js        5.08 KB
packages/element build: ESM dist/chunks/chunk-ZQSWOEDY.js        23.76 KB
packages/element build: ESM dist/chunks/chunk-VOMB4WIG.js        2.91 KB
packages/element build: ESM dist/chunks/halftone-GZKVEL3V.js     13.65 KB
packages/element build: ESM dist/chunks/mesh-EG6UHSJL.js         6.50 KB
packages/element build: ESM dist/chunks/chunk-UXE2JB6R.js        2.69 KB
packages/element build: ESM dist/index.js.map                    121.41 KB
packages/element build: ESM dist/chunks/paper-CLRTI67X.js.map    29.81 KB
packages/element build: ESM dist/chunks/chunk-44EAVKDO.js.map    13.97 KB
packages/element build: ESM dist/chunks/mesh-EG6UHSJL.js.map     11.60 KB
packages/element build: ESM dist/chunks/halftone-GZKVEL3V.js.map 22.29 KB
packages/element build: ESM dist/chunks/dither-5UB6N4X2.js.map   17.02 KB
packages/element build: ESM dist/chunks/chunk-VOMB4WIG.js.map    5.66 KB
packages/element build: ESM dist/chunks/chunk-ZQSWOEDY.js.map    24.44 KB
packages/element build: ESM dist/chunks/chunk-UXE2JB6R.js.map    5.59 KB
packages/element build: ESM ⚡️ Build success in 21ms
packages/element build: DTS Build start
packages/element build: DTS ⚡️ Build success in 269ms
packages/element build: DTS dist/index.d.ts 5.37 KB
packages/element build: Done
packages/react build$ tsup
packages/react build: CLI Building entry: {"index":"src/index.ts"}
packages/react build: CLI Using tsconfig: tsconfig.json
packages/react build: CLI tsup v9.0.0
packages/react build: CLI Using tsup config: /Users/oszi/Desktop/Projects/vitrine/packages/react/tsup.config.ts
packages/react build: CLI Target: es2022
packages/react build: CLI Cleaning output folder
packages/react build: ESM Build start
packages/react build:  WARN  ▲ [WARNING] Ignoring this import because "src/jsx.ts" was marked as having no side effects [ignored-bare-import]
packages/react build:     src/index.ts:6:7:
packages/react build:       6 │ import './jsx.js';
packages/react build:         ╵        ~~~~~~~~~~
packages/react build:   "sideEffects" is false in the enclosing "package.json" file:
packages/react build:     package.json:17:2:
packages/react build:       17 │   "sideEffects": false,
packages/react build:          ╵   ~~~~~~~~~~~~~
packages/react build: ESM dist/index.js     2.31 KB
packages/react build: ESM dist/index.js.map 5.34 KB
packages/react build: ESM ⚡️ Build success in 12ms
packages/react build: DTS Build start
packages/react build: DTS ⚡️ Build success in 301ms
packages/react build: DTS dist/index.d.ts 4.02 KB
packages/react build: Done
assemble-react: index.d.ts, index.js, index.js.map → packages/element/dist/react/
$ node scripts/sync-fixtures.mjs
sync-fixtures: 16 files → public/fixtures/
$ next build
▲ Next.js 16.4.3 (Turbopack)
✓ Running next.config.ts took 85ms
  Creating an optimized production build ...
✓ Compiled successfully in 241ms
  Running TypeScript ...
  Finished TypeScript in 713ms ...
  Collecting page data using 5 workers ...
  Generating static pages using 5 workers (0/3) ...
✓ Generating static pages using 5 workers (3/3) in 221ms
  Finalizing page optimization ...
Route (app)
┌ ƒ /
├ ○ /_not-found
└ ƒ /products/[handle]
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand

$ pnpm build:theme   → EXIT 0
CLI Building entry: {"vitrine":"src/index.ts"}
CLI Using tsconfig: tsconfig.json
CLI tsup v9.0.0
CLI Using tsup config: /Users/oszi/Desktop/Projects/vitrine/packages/element/tsup.theme.config.ts
CLI Target: es2022
ESM Build start
ESM ../../shopify-theme/assets/vitrine.js 105.00 KB
ESM ⚡️ Build success in 11ms

$ pnpm check:theme   → EXIT 0
5 files inspected with 1 total offenses found across 1 files. 1 warnings.   (OrphanedSnippet: snippets/vitrine-card-media.liquid, jak w P5)

$ pnpm test:e2e --project=chromium --project=webkit   → EXIT 0
✓   1 [chromium] › examples/next-headless/e2e/next.spec.ts:47:3 › P3 · next-headless (production build) › server HTML: 24 cards are plain <img> inside <vitrine-shader>, element chunk is not inline (52ms)
✓   2 [chromium] › examples/next-headless/e2e/next.spec.ts:69:3 › P3 · next-headless (production build) › home: 24 baked cards + live hero + baked editorial, 0 card canvases, 0 baker contexts, no console errors (17.9s)
✓   3 [chromium] › examples/next-headless/e2e/next.spec.ts:113:3 › P3 · next-headless (production build) › keyboard: Tab onto a card reveals the photo, Tab away hides it (1.9s)
✓   4 [chromium] › examples/next-headless/e2e/next.spec.ts:136:3 › P3 · next-headless (production build) › prefers-reduced-motion: hero is baked, reveal has no transition (938ms)
✓   5 [chromium] › examples/next-headless/e2e/next.spec.ts:149:3 › P3 · next-headless (production build) › product page: halftone media, hover reveals, no console errors, 404 for unknown handle (2.2s)
✓   6 [chromium] › examples/next-headless/e2e/next.spec.ts:165:3 › P3 · next-headless (production build) › ?vitrine=off: no element, no element chunk (1.7s)
✓   7 [chromium] › examples/next-headless/e2e/next.spec.ts:180:3 › P3 · next-headless (production build) › screenshots 390 and 1440 (chromium) (23.3s)
✓   8 [chromium] › examples/spikes/bake.spec.ts:5:3 › Spike A · bake › baked image is non-empty, matches the live render (<= 1% pixels) and releases its WebGL context (1.1s)
✓   9 [chromium] › examples/spikes/contexts.spec.ts:5:3 › Spike B · contexts › live: 24 simultaneous ShaderMounts — count evictions (measurement only) (2.4s)
✓  10 [chromium] › examples/spikes/contexts.spec.ts:18:3 › Spike B · contexts › bake: 24 baked cards leave 0 live contexts and free all slots (3.4s)
✓  11 [chromium] › examples/spikes/contexts.spec.ts:32:3 › Spike B · contexts › bake-shared: 24 cards through ONE reusable baker context (no new contexts, no evictions) (694ms)
✓  12 [chromium] › examples/spikes/contexts.spec.ts:51:3 › Spike B · contexts › pool: animated mesh-gradient cards never exceed N=6 live contexts while scrolling (7.7s)
✓  13 [chromium] › examples/spikes/cors.spec.ts:18:3 › Spike C · CORS › cdn.shopify.com image loads with crossorigin=anonymous and works as a WebGL texture (424ms)
✓  14 [chromium] › examples/spikes/cors.spec.ts:33:3 › Spike C · CORS › <store domain>/cdn/shop/files variant behaves the same (365ms)
✓  15 [chromium] › examples/spikes/cors.spec.ts:44:3 › Spike C · CORS › without Access-Control-Allow-Origin the texture is refused but the plain <img> still shows (fallback path) (136ms)
✓  16 [chromium] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › dither / default: ≤ 1% differing pixels, 0 canvases left in the element (428ms)
✓  17 [chromium] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › dither / newsprint: ≤ 1% differing pixels, 0 canvases left in the element (424ms)
✓  18 [chromium] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › halftone / default: ≤ 1% differing pixels, 0 canvases left in the element (1.4s)
✓  19 [chromium] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › halftone / riso: ≤ 1% differing pixels, 0 canvases left in the element (1.4s)
✓  20 [chromium] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › mesh / default: ≤ 1% differing pixels, 0 canvases left in the element (414ms)
✓  21 [chromium] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › mesh / drop-night: ≤ 1% differing pixels, 0 canvases left in the element (485ms)
✓  22 [chromium] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › paper / default: ≤ 1% differing pixels, 0 canvases left in the element (1.3s)
✓  23 [chromium] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › paper / folded-lookbook: ≤ 1% differing pixels, 0 canvases left in the element (1.2s)
✓  24 [chromium] › packages/element/e2e/fallback.spec.ts:5:3 › P1 · fallbacks (E6) › image without CORS headers → vitrine:fallback(cors), <img> stays, no console error (139ms)
✓  25 [chromium] › packages/element/e2e/grid.spec.ts:9:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › 24 baked cards + 1 live hero: 0 webglcontextlost, 0 live contexts after bake, hero survives (5.8s)
✓  26 [chromium] › packages/element/e2e/grid.spec.ts:79:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › keyboard: Tab onto a card reveals the photo, Tab away hides it again (946ms)
✓  27 [chromium] › packages/element/e2e/grid.spec.ts:115:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › hover reveals on the nearest link and the baked layer stays aria-hidden (441ms)
✓  28 [chromium] › packages/element/e2e/grid.spec.ts:133:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › prefers-reduced-motion: hero is baked (no canvas), reveal has no transition (513ms)
✓  29 [chromium] › packages/element/e2e/static.spec.ts:32:3 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › 12 unique cards bake, the print and the editorial bake, the colour bar is the only live context (3.6s)
✓  30 [chromium] › packages/element/e2e/static.spec.ts:59:5 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › grid at 390 px: no empty bands, no horizontal overflow (839ms)
✓  31 [chromium] › packages/element/e2e/static.spec.ts:59:5 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › grid at 768 px: no empty bands, no horizontal overflow (1.5s)
✓  32 [chromium] › packages/element/e2e/static.spec.ts:59:5 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › grid at 1024 px: no empty bands, no horizontal overflow (1.1s)
✓  33 [chromium] › packages/element/e2e/static.spec.ts:59:5 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › grid at 1440 px: no empty bands, no horizontal overflow (1.5s)
✓  34 [chromium] › packages/element/e2e/static.spec.ts:95:3 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › the proof print: the loupe follows the pointer, click lifts the whole print, Enter too (2.4s)
✓  35 [chromium] › packages/element/e2e/static.spec.ts:121:3 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › screenshots at 390 and 1440 px for the devlog (4.8s)
✓  36 [chromium] › packages/element/e2e/static.spec.ts:138:3 › Q0 · examples/static/stress.html (24 cards from 1600 px originals + a live mesh) › 24 cards bake while the mesh animates, 0 contexts left but the mesh (3.8s)
-  37 [chromium] › packages/element/e2e/store.spec.ts:85:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › home: hero + editorial sections render, hero live, editorial baked, no errors
-  38 [chromium] › packages/element/e2e/store.spec.ts:110:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › collection: every card image is inside <vitrine-shader>, all baked, 0 canvases
-  39 [chromium] › packages/element/e2e/store.spec.ts:133:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › collection: keyboard reveal on the card link
-  40 [chromium] › packages/element/e2e/store.spec.ts:149:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › collection: reduced motion keeps everything static
✓  41 [chromium] › packages/element/e2e/theme-markup.spec.ts:30:3 › P2 · theme markup (shopify-theme/ rendered) › 26 script tags, 1 fetch; 24 cards + editorial baked, hero live, 0 contexts after bake (20.3s)
✓  42 [chromium] › packages/element/e2e/theme-markup.spec.ts:85:3 › P2 · theme markup (shopify-theme/ rendered) › keyboard: Tab onto a card reveals the photo, Tab away hides it (4.5s)
✓  43 [chromium] › packages/element/e2e/theme-markup.spec.ts:105:3 › P2 · theme markup (shopify-theme/ rendered) › editorial figure is the reveal surface (data-vitrine-card), hover reveals (18.2s)
✓  44 [chromium] › packages/element/e2e/theme-markup.spec.ts:115:3 › P2 · theme markup (shopify-theme/ rendered) › prefers-reduced-motion: hero baked, no transition (1.1s)
✓  45 [chromium] › packages/element/e2e/theme-markup.spec.ts:127:3 › P2 · theme markup (shopify-theme/ rendered) › screenshots 390 and 1440 (chromium) (22.0s)
✓  46 [chromium] › packages/element/e2e/whitepoint.spec.ts:14:1 › whitePoint: the cream ground prints as clean paper, the product keeps its ink (1.3s)
✓  47 [webkit] › examples/next-headless/e2e/next.spec.ts:47:3 › P3 · next-headless (production build) › server HTML: 24 cards are plain <img> inside <vitrine-shader>, element chunk is not inline (49ms)
✓  48 [webkit] › examples/next-headless/e2e/next.spec.ts:69:3 › P3 · next-headless (production build) › home: 24 baked cards + live hero + baked editorial, 0 card canvases, 0 baker contexts, no console errors (3.8s)
✓  49 [webkit] › examples/next-headless/e2e/next.spec.ts:113:3 › P3 · next-headless (production build) › keyboard: Tab onto a card reveals the photo, Tab away hides it (620ms)
✓  50 [webkit] › examples/next-headless/e2e/next.spec.ts:136:3 › P3 · next-headless (production build) › prefers-reduced-motion: hero is baked, reveal has no transition (699ms)
✓  51 [webkit] › examples/next-headless/e2e/next.spec.ts:149:3 › P3 · next-headless (production build) › product page: halftone media, hover reveals, no console errors, 404 for unknown handle (668ms)
✓  52 [webkit] › examples/next-headless/e2e/next.spec.ts:165:3 › P3 · next-headless (production build) › ?vitrine=off: no element, no element chunk (1.9s)
-  53 [webkit] › examples/next-headless/e2e/next.spec.ts:180:3 › P3 · next-headless (production build) › screenshots 390 and 1440 (chromium)
✓  54 [webkit] › examples/spikes/bake.spec.ts:5:3 › Spike A · bake › baked image is non-empty, matches the live render (<= 1% pixels) and releases its WebGL context (1.1s)
✓  55 [webkit] › examples/spikes/contexts.spec.ts:5:3 › Spike B · contexts › live: 24 simultaneous ShaderMounts — count evictions (measurement only) (1.4s)
✓  56 [webkit] › examples/spikes/contexts.spec.ts:18:3 › Spike B · contexts › bake: 24 baked cards leave 0 live contexts and free all slots (1.9s)
✓  57 [webkit] › examples/spikes/contexts.spec.ts:32:3 › Spike B · contexts › bake-shared: 24 cards through ONE reusable baker context (no new contexts, no evictions) (896ms)
✓  58 [webkit] › examples/spikes/contexts.spec.ts:51:3 › Spike B · contexts › pool: animated mesh-gradient cards never exceed N=6 live contexts while scrolling (4.3s)
✓  59 [webkit] › examples/spikes/cors.spec.ts:18:3 › Spike C · CORS › cdn.shopify.com image loads with crossorigin=anonymous and works as a WebGL texture (526ms)
✓  60 [webkit] › examples/spikes/cors.spec.ts:33:3 › Spike C · CORS › <store domain>/cdn/shop/files variant behaves the same (430ms)
✓  61 [webkit] › examples/spikes/cors.spec.ts:44:3 › Spike C · CORS › without Access-Control-Allow-Origin the texture is refused but the plain <img> still shows (fallback path) (263ms)
✓  62 [webkit] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › dither / default: ≤ 1% differing pixels, 0 canvases left in the element (435ms)
✓  63 [webkit] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › dither / newsprint: ≤ 1% differing pixels, 0 canvases left in the element (454ms)
✓  64 [webkit] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › halftone / default: ≤ 1% differing pixels, 0 canvases left in the element (596ms)
✓  65 [webkit] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › halftone / riso: ≤ 1% differing pixels, 0 canvases left in the element (566ms)
✓  66 [webkit] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › mesh / default: ≤ 1% differing pixels, 0 canvases left in the element (426ms)
✓  67 [webkit] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › mesh / drop-night: ≤ 1% differing pixels, 0 canvases left in the element (474ms)
✓  68 [webkit] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › paper / default: ≤ 1% differing pixels, 0 canvases left in the element (637ms)
✓  69 [webkit] › packages/element/e2e/compat.spec.ts:25:5 › P1 · pixel compatibility with shaders-react › paper / folded-lookbook: ≤ 1% differing pixels, 0 canvases left in the element (572ms)
✓  70 [webkit] › packages/element/e2e/fallback.spec.ts:5:3 › P1 · fallbacks (E6) › image without CORS headers → vitrine:fallback(cors), <img> stays, no console error (274ms)
✓  71 [webkit] › packages/element/e2e/grid.spec.ts:9:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › 24 baked cards + 1 live hero: 0 webglcontextlost, 0 live contexts after bake, hero survives (3.7s)
✓  72 [webkit] › packages/element/e2e/grid.spec.ts:79:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › keyboard: Tab onto a card reveals the photo, Tab away hides it again (1.0s)
✓  73 [webkit] › packages/element/e2e/grid.spec.ts:115:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › hover reveals on the nearest link and the baked layer stays aria-hidden (487ms)
✓  74 [webkit] › packages/element/e2e/grid.spec.ts:133:3 › P1 · grid of 24 (D3 budget, D6 keyboard, reduced motion) › prefers-reduced-motion: hero is baked (no canvas), reveal has no transition (564ms)
✓  75 [webkit] › packages/element/e2e/static.spec.ts:32:3 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › 12 unique cards bake, the print and the editorial bake, the colour bar is the only live context (3.5s)
✓  76 [webkit] › packages/element/e2e/static.spec.ts:59:5 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › grid at 390 px: no empty bands, no horizontal overflow (1.3s)
✓  77 [webkit] › packages/element/e2e/static.spec.ts:59:5 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › grid at 768 px: no empty bands, no horizontal overflow (1.4s)
✓  78 [webkit] › packages/element/e2e/static.spec.ts:59:5 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › grid at 1024 px: no empty bands, no horizontal overflow (1.1s)
✓  79 [webkit] › packages/element/e2e/static.spec.ts:59:5 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › grid at 1440 px: no empty bands, no horizontal overflow (1.2s)
✓  80 [webkit] › packages/element/e2e/static.spec.ts:95:3 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › the proof print: the loupe follows the pointer, click lifts the whole print, Enter too (2.1s)
-  81 [webkit] › packages/element/e2e/static.spec.ts:121:3 › Q0 · examples/static (demo: 12 cards, proof print, colour bar, editorial) › screenshots at 390 and 1440 px for the devlog
✓  82 [webkit] › packages/element/e2e/static.spec.ts:138:3 › Q0 · examples/static/stress.html (24 cards from 1600 px originals + a live mesh) › 24 cards bake while the mesh animates, 0 contexts left but the mesh (3.1s)
-  83 [webkit] › packages/element/e2e/store.spec.ts:85:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › home: hero + editorial sections render, hero live, editorial baked, no errors
-  84 [webkit] › packages/element/e2e/store.spec.ts:110:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › collection: every card image is inside <vitrine-shader>, all baked, 0 canvases
-  85 [webkit] › packages/element/e2e/store.spec.ts:133:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › collection: keyboard reveal on the card link
-  86 [webkit] › packages/element/e2e/store.spec.ts:149:3 › P2 · dev store (Horizon 4.3.0 + VITRINE) › collection: reduced motion keeps everything static
✓  87 [webkit] › packages/element/e2e/theme-markup.spec.ts:30:3 › P2 · theme markup (shopify-theme/ rendered) › 26 script tags, 1 fetch; 24 cards + editorial baked, hero live, 0 contexts after bake (3.5s)
✓  88 [webkit] › packages/element/e2e/theme-markup.spec.ts:85:3 › P2 · theme markup (shopify-theme/ rendered) › keyboard: Tab onto a card reveals the photo, Tab away hides it (662ms)
✓  89 [webkit] › packages/element/e2e/theme-markup.spec.ts:105:3 › P2 · theme markup (shopify-theme/ rendered) › editorial figure is the reveal surface (data-vitrine-card), hover reveals (1.5s)
✓  90 [webkit] › packages/element/e2e/theme-markup.spec.ts:115:3 › P2 · theme markup (shopify-theme/ rendered) › prefers-reduced-motion: hero baked, no transition (657ms)
-  91 [webkit] › packages/element/e2e/theme-markup.spec.ts:127:3 › P2 · theme markup (shopify-theme/ rendered) › screenshots 390 and 1440 (chromium)
✓  92 [webkit] › packages/element/e2e/whitepoint.spec.ts:14:1 › whitePoint: the cream ground prints as clean paper, the product keeps its ink (1.4s)
  11 skipped
  81 passed (3.7m)

$ pnpm exec playwright test packages/element/e2e/whitepoint.spec.ts --project=firefox   → EXIT 1
Error: browserType.launch: Failed to launch the browser process.
[pid=13622][err] Could not find profile folder.
```

Pominięte w e2e (11): testy na sklepie `store.spec.ts` (4 × 2 przeglądarki i zrzuty, bez `VITRINE_STORE_URL`, jak w P2–P5) i zrzuty, które biegną tylko w Chromium. Firefox: nie startuje na tej maszynie, jak od P0 (niezmierzony).

Dowody: `docs/media/q0-*` (Lighthouse × 6, siatka × 8, timing demo i stress, whitePoint, arkusze ditheringu, zrzuty 390 / 1440 i katalog z odsłoniętą kartą), wynik zgodności z tego przebiegu zbiorczo w `docs/media/q0-compat-summary.json` (16 / 16: 0 różnych pikseli, `readback: async`, `encode: worker`). Testy e2e nadpisują przy każdym przebiegu pliki `p0-*` … `p3-*`; przywróciłem je z repo (`git checkout`), żeby liczby w devlogach P0–P3 zgadzały się ze swoimi dowodami, `readme-hero.jpg`, `readme-grid.jpg`, `vitrine-card-reveal.gif`.

## a11y-gate (hero, siatka, płyta)

a11y-gate: werdykt PASS.

- 🔴 Kontrast PASS: tusz/papier 15,74:1, blue-rice/papier 5,10:1 (`contrast.py`), oranż nigdy jako tekst; pierścień lupy tusz + papier, widoczny na obu tłach.
- 🔴 Klawiatura PASS: hero to `<button>`; Enter i Spacja przełączają `aria-pressed` (test „Enter too”). Karty jak w P1.
- 🔴 Fokus PASS po poprawce: `outline 3px` z offsetem +3 px (wcześniej −3 px, wewnątrz printu, ginął na ciemnym druku).
- 🔴 Semantyka PASS: jeden `h1`, `figure` + `figcaption`, płyta z `aria-label`, link do strony stress.
- 🔴 Formularze n/d.
- 🟡 Obrazy PASS: `alt` opisuje pracę („an orange and black swirl”), przycisk ma własną nazwę.
- 🟡 Ruch PASS: lupa nie animuje się sama; `prefers-reduced-motion` usuwa przejścia (element + strona).
- 🟡 Treść dynamiczna PASS: stan przycisku w `aria-pressed`.
- Do sprawdzenia ręcznie (Piotrek): VoiceOver na hero (czy nazwa przycisku czyta się naturalnie) i `cursor: none` na myszy (pierścień zastępuje kursor; jeśli przeszkadza, zostaw `crosshair`).

## Exit Check (taste-guardrail)

Na `q0-static-390-fold.png`, `q0-static-1440.png`, `q0-static-1440-catalogue-reveal.png`, `readme-hero.jpg`:

Lock 5/5 + pokrętła ✓ · Archivo, nie z listy zakazanej ✓ · jeden akcent (oranż tylko w lupie), papier zamiast #fff ✓ · złamanie siatki (print do krawędzi, karta 2 × 2) ✓ · jedna sygnatura: lupa ✓ · hierarchia: print → tytuł → katalog ✓ · Tells: brak gradientu-tła, cieni, zaokrągleń poza okręgiem lupy (forma pierwotna, nie odruch) ✓ · kontekst NIWWTS (prace i tokeny No.06) ✓ · ciepło: papier i raster ✓ · izolacja: print ma 62 % szerokości i nic na nim poza lupą ✓ · grupowanie: po zmrużeniu oczu trzy plamy, tytuł, print, katalog ✓ · głębia bez cienia: nakładanie lupy, twarda krawędź ✓ · napięcie: ✘ częściowo, pasek mesh 28 px czyta się jako szaro-fioletowy pas, nie jako pasek kontrolny z polami barw → **12/13**.

Ocena druku (bramka „druk czy brud”): kremowy grunt jest teraz czystym papierem na wszystkich 12 kartach, raster tylko na produkcie (`q0-dither-before-after.png`). Słaba karta: CRAYONS (WARM), prawie pusta. Na 390 px nad zgięciem: tytuł, lede, instrukcja i górna część printu z lupą, czyli od razu widać, co robi element.

Trzy ruchy na później: (1) pasek mesh jako 4–6 twardych pól palety zamiast jednego gradientu (osobny preset mesh albo kilka elementów), (2) inne zdjęcie zamiast CRAYONS albo preset z mniejszym `whitePoint` dla jasnych prac, (3) na mobile krótszy lede, żeby print wszedł wyżej.

## Momenty na content

1. Kontaktówka przed/po: ten sam katalog, raster na tle 23,6 % → 0 % (`q0-dither-before-after.png`). Diptych na reels: lewa „v0.1”, prawa „v0.2”, ta sama siatka.
2. Lupa na hero: kursor wjeżdża w czarno-biały wir i pod nim jest pomarańcz (`readme-hero.jpg`; GIF w Q1 razem z `bind`).
3. „854 ms → 51 ms”: najdłuższe zadanie na stronie demo przed i po (longtask observer, CPU ×4).
4. „TBT siedział w `readPixels`”: `upload 0 ms, read 271 ms` jako jedna linijka z konsoli; po zmianie `main 2–18 ms`, GPU poza wątkiem.

## Kroki ręczne (Piotrek)

1. **Bramka Q0 na telefonie:** `pnpm build && pnpm serve`, telefon w tej samej sieci → `http://<ip-maca>:4173/examples/static/`. Pytania: czy katalog wygląda jak druk, nie jak brud; czy hero od razu pokazuje, co to robi (tap na print przesuwa lupę).
2. Po bramce: kroki z `STATUS.md`, sekcja „Po Q0: upublicznienie” (merge, repo publiczne, Pages, npm z decyzją o wersji, Vercel, podmiana TODO).

## Pięć linijek

1. Kliknij: po bramce `git merge --ff-only q0-blokery` i push, potem `gh repo edit PiotrekFilipecki/vitrine --visibility public --accept-visibility-change-consequences`.
2. Kliknij: Settings → Pages → Source „GitHub Actions”, potem Actions → „Pages (static demo)” → Run workflow; demo będzie pod `https://piotrekfilipecki.github.io/vitrine/examples/static/`.
3. Kliknij: Vercel → import repo, Root Directory `examples/next-headless`, Deploy; zdecyduj wersję npm (rekomendacja 0.2.0) i `npm publish` z `packages/element`; wklej oba URL-e w README.
4. Pominąłem: pomiar motywu na `niwwts.myshopify.com` z nowym `vitrine.js` (wiersz Horizon w README to v0.1.0), Firefoksa (nie startuje), uruchomienie samego workflow (repo prywatne).
5. Otwarte: Next TBT 236 vs 148 ms w v0.1.0 (Commit kompozytora, do Q1) i błąd LRU przy > 96 wypaleniach naraz (opis wyżej).
