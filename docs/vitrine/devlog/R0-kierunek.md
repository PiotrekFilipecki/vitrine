# R0 · Reset kierunku wizualnego (29.10.2026)

Gałąź `r0-kierunek` od `main` (`85b9349`; lokalny `main` = `q0-blokery`, Q0 jest w nim zmergowane, `origin/main` stoi na `064b015`). Prompt: blok „Prompt R0 dla Claude Code” z `docs/vitrine/KIERUNEK-v2.md` (skopiowany 1:1, `cmp` z oryginałem: identyczny). Przeczytane przed startem: `CLAUDE.md`, `KIERUNEK-v2.md`, `raport-weryfikacji-Q0.md` (Cowork, 29.10.2026). Nic nie wypchnięte, nic nie zmergowane, nic nie wdrożone (Vercel nietknięty). Niezacommitowane pliki z wdrożenia Vercel sprzed R0 (`.vercelignore`, `examples/next-headless/vercel.json`, wpis `.vercel` w `.gitignore`, nieśledzony `AGENTS.md`) zostawiłem tak, jak były, i nie wchodzą do commitów R0.

## Skille

| Skill | Po co | Co zmienił w wyniku |
| --- | --- | --- |
| `taste-guardrail` | Lock z KIERUNEK-v2 przed pierwszą linijką; Exit Check na każdym arkuszu i makiecie | Wymusił kolumnę „No effect” w każdym arkuszu, żeby poprzeczkę „lepiej niż bez efektu” było widać w kadrze, a nie w opisie. Exit Check odsiał liquid-metal (8/13), pulsing-border (8/13), halftone (8/13) i dał dithering 9/13, czyli granicę. Na makiecie: zasada „jedna sygnatura” zabroniła lupy w hero obok szyby i ograniczyła resztę strony do typografii i papieru; dźwignia „izolacja” przestawiła siatkę hero z 38/62 na 46/54, bo pionowe zdjęcie w szerokim kadrze ucinało klosz i podstawę lampy. Exit Check makiety 12/13 (✘ niżej). |
| `awwwards-art-director` | Poprzeczka „czy sklep premium by to wypuścił” (STEP 5 QA), koncept sygnatury hero | Koncept hero „drzwi przesuwne”: dwie szyby rozchodzą się od kursora (dwie warstwy z `clip-path`, bo shader ma tylko jeden prostokąt maski), zamiast jednej szyby jadącej w bok. Pre-order jako skala daty (30 → 7 → 1 dzień), nie trzy niezależne presety. Werdykty ODPADA dla chromowanego napisu (WordArt) i migającej ramki (nikt z premium tego nie wypuści). |
| `design-motion:motion-design` | Przejścia szyby, lupy i fali | Archetyp Premium: otwarcie 520 ms, zamknięcie 380–420 ms (wejście dłuższe niż wyjście), jedna krzywa ease-out cubic, zero overshoot (szkło jest sztywne). Lupa rośnie 350 ms, sunie 900 ms. Fala jako jeden impuls 1,1 s; `scale` rośnie razem z amplitudą (1 → 1,1), żeby klatka spoczynku była niezmienionym zdjęciem bez skoku na starcie. `prefers-reduced-motion`: czas 0 ms w makiecie. |
| `piotrek-workflow:security-perf-auditor` | Licencje i źródła zdjęć | Licencja sprawdzana na stronie każdego zdjęcia osobno (WebFetch strony Unsplash: linia licencji, brak Unsplash+, tagi, kategorie, aparat). Odrzucone: 3 rendery 3D (dwie lampy z tagiem „render”/„blender 3d”, zegarek w „3D Renders”), wszystkie wyniki Unsplash+, zdjęcia z dominującym znakiem towarowym (Unsplash License nie daje praw do znaków). Po pierwszym arkuszu wymienione słuchawki: nazwa producenta na obu nausznikach czytelna w karcie. WebP bez EXIF/XMP/ICC (sprawdzone na 36 plikach). Grep po repo: zero zdjęć ze sklepów klientów. |

Brak skilli: żaden z obowiązkowych nie brakował. `niwwts-aesthetic` celowo niewczytany (KIERUNEK-v2: przestaje być arbitrem; ADR-0002 §4).

## Lock (z KIERUNEK-v2, przed pierwszą linijką)

1. **Świat:** witryna sklepowa: szkło ryflowane, złocony szyld na szybie, papier metki i paragonu. Linia rodowa: Aesop, Dieter Rams, fotografia produktowa na jednolitym tle.
2. **Typografia:** Archivo (self-hosted od Q0): oś 62 % na nagłówkach, 100 % w tekście, 125 % w etykietach. Mono nigdzie.
3. **Kolor:** papier `#EFEBE4`, tusz `#141312`, zero akcentu w UI; kolor tylko ze zdjęć. Kontrast policzony (wzór WCAG, Python): tusz/papier **15,62 : 1**, `#57524C`/papier **6,51 : 1**.
4. **Ruch strukturalny:** produkt od krawędzi do krawędzi (hero do prawej i dolnej krawędzi okna).
5. **Sygnatura:** szyba. Wszystko inne ciche.

Pokrętła: wariancja 6 · ruch 6 · gęstość 3. Negatyw: „NIE może wyglądać jak galeria shaderów z Dribbble, demo »WebGL efekty« ani drop NIWWTS”.

## R1 · Materiał

**Źródła po kolei.** (1) Wikimedia Commons przez oficjalne API, filtr CC0 po danych strukturalnych (`haswbstatement:P275=Q6938433`): wyniki to w większości zdjęcia muzealne i lifestyle z 2016 roku; packshotów na jednolitym tle prawie brak (jeden sneaker). (2) Pexels i Unsplash API wymagają klucza, którego ta sesja nie ma; próbę z nieudokumentowanym endpointem wyszukiwarki Unsplash zablokował klasyfikator uprawnień i jej nie obchodziłem. (3) Wyszukiwarka Unsplash czytana narzędziem WebFetch (zwykły odczyt strony), miniatury i pliki z publicznego CDN `images.unsplash.com` z uczciwym User-Agentem projektu. Openverse API nie odpowiadało (timeout 60 s).

**Wybór:** 156 kandydatów bez Unsplash+ w 12 kategoriach, arkusze kontaktowe obejrzane, 12 wybranych pod jednolite tło, różne tony tła (beż, szarość, kolor) i brak marek. Każde zweryfikowane na swojej stronie. Pełna tabela: `examples/fixtures/CREDITS.md`.

```
$ (pobranie 2400 px, 2026-10-29T21:49:21Z) magick identify -format "%f %wx%h %b\n" master/*.jpg
01-vase.jpg 2400x3295 962658B
02-perfume.jpg 2400x3600 480309B
03-sneaker.jpg 2400x3360 971965B
04-chair.jpg 2400x3000 276014B
05-lamp.jpg 2400x3200 910017B
06-watch.jpg 2400x1585 266333B
07-bag.jpg 2400x1499 343917B
08-headphones.jpg 2400x3597 354336B   ← pierwsza wersja, wymieniona niżej
09-mug.jpg 2400x3199 344263B
10-sunglasses.jpg 2400x1600 250378B
11-candle.jpg 2400x1602 417443B
12-plant.jpg 2400x3000 689677B

$ (wymiana słuchawek, 2026-10-29T21:57:32Z) magick identify 08-headphones.jpg
2400x1600
```

WebP (`cwebp -q 82 -resize 1600 0`, `-q 80 -resize 1000 0`, `-q 78 -resize 640 0`), stan po wymianie słuchawek:

```
$ cd examples/fixtures/products && for f in *.webp w1000/*.webp w640/*.webp; do magick identify -format "%i %wx%h %b
" $f; done
01-vase.webp 1600x2197 64772B
02-perfume.webp 1600x2400 38984B
03-sneaker.webp 1600x2240 135214B
04-chair.webp 1600x2000 35176B
05-lamp.webp 1600x2134 158688B
06-watch.webp 1600x1057 60498B
07-bag.webp 1600x1000 72518B
08-headphones.webp 1600x1067 38226B
09-mug.webp 1600x2133 33650B
10-sunglasses.webp 1600x1067 28516B
11-candle.webp 1600x1068 53088B
12-plant.webp 1600x2000 96100B
w1000/01-vase.webp 1000x1373 16380B
w1000/02-perfume.webp 1000x1500 17818B
w1000/03-sneaker.webp 1000x1400 52146B
w1000/04-chair.webp 1000x1250 17576B
w1000/05-lamp.webp 1000x1334 67978B
w1000/06-watch.webp 1000x661 26936B
w1000/07-bag.webp 1000x625 31812B
w1000/08-headphones.webp 1000x667 16672B
w1000/09-mug.webp 1000x1333 14006B
w1000/10-sunglasses.webp 1000x667 13144B
w1000/11-candle.webp 1000x668 20262B
w1000/12-plant.webp 1000x1250 40024B
w640/01-vase.webp 640x879 6172B
w640/02-perfume.webp 640x960 8834B
w640/03-sneaker.webp 640x896 20924B
w640/04-chair.webp 640x800 9002B
w640/05-lamp.webp 640x854 28532B
w640/06-watch.webp 640x423 12374B
w640/07-bag.webp 640x400 13752B
w640/08-headphones.webp 640x427 7976B
w640/09-mug.webp 640x854 6708B
w640/10-sunglasses.webp 640x427 6636B
w640/11-candle.webp 640x428 9090B
w640/12-plant.webp 640x800 18032B
$ du -sh examples/fixtures
1,3M	examples/fixtures
```

Kontrola metadanych i klientów:

```
$ for f in $(find examples/fixtures/products -name "*.webp" | sort); do python3 -I -c "…EXIF/XMP/ICCP chunk check…" $f; done
examples/fixtures/products/01-vase.webp none
examples/fixtures/products/02-perfume.webp none
examples/fixtures/products/03-sneaker.webp none
examples/fixtures/products/04-chair.webp none
examples/fixtures/products/05-lamp.webp none
examples/fixtures/products/06-watch.webp none
examples/fixtures/products/07-bag.webp none
examples/fixtures/products/08-headphones.webp none
examples/fixtures/products/09-mug.webp none
examples/fixtures/products/10-sunglasses.webp none
examples/fixtures/products/11-candle.webp none
examples/fixtures/products/12-plant.webp none
examples/fixtures/products/w1000/01-vase.webp none
examples/fixtures/products/w1000/02-perfume.webp none
examples/fixtures/products/w1000/03-sneaker.webp none
examples/fixtures/products/w1000/04-chair.webp none
examples/fixtures/products/w1000/05-lamp.webp none
examples/fixtures/products/w1000/06-watch.webp none
examples/fixtures/products/w1000/07-bag.webp none
examples/fixtures/products/w1000/08-headphones.webp none
examples/fixtures/products/w1000/09-mug.webp none
examples/fixtures/products/w1000/10-sunglasses.webp none
examples/fixtures/products/w1000/11-candle.webp none
examples/fixtures/products/w1000/12-plant.webp none
examples/fixtures/products/w640/01-vase.webp none
examples/fixtures/products/w640/02-perfume.webp none
examples/fixtures/products/w640/03-sneaker.webp none
examples/fixtures/products/w640/04-chair.webp none
examples/fixtures/products/w640/05-lamp.webp none
examples/fixtures/products/w640/06-watch.webp none
examples/fixtures/products/w640/07-bag.webp none
examples/fixtures/products/w640/08-headphones.webp none
examples/fixtures/products/w640/09-mug.webp none
examples/fixtures/products/w640/10-sunglasses.webp none
examples/fixtures/products/w640/11-candle.webp none
examples/fixtures/products/w640/12-plant.webp none
$ git grep -n -i -E "friendz|emwu" -- . ":!docs/vitrine/devlog" ":!CLAUDE.md" ":!AGENTS.md"
docs/vitrine/PLAN.md:9:- **Własne projekty:** NIWWTS (sklep, No.06), FRIENDZ, EMWU Hats — wszędzie, gdzie jest karta produktu.
docs/vitrine/STATUS.md:31:- **Żadnych operacji na sklepach klientów** (friendzstore.pl, friendzdev, emwuhats.pl), także odczytów. …
exit 0
$ grep -rIl -i -E "friendz|emwu" examples/fixtures examples/r0 examples/static/r0-hero.html scripts/r0-*.mjs docs/vitrine/KIERUNEK-v2.md
exit 1
$ git ls-files -o -c --exclude-standard | grep -i -E "\.(jpe?g|png|webp|avif|gif)$" | grep -i -E "friendz|emwu"
exit 1
```

Trafienia grepa to tylko zasady (PLAN, STATUS), żadnego obrazu ani URL-a sklepu klienta.

**Fixtures NIWWTS a demo (odstępstwo do decyzji na bramce).** Cały materiał R0 (arkusze, przejścia, makieta) używa wyłącznie nowych zdjęć. Stare strony demo (`examples/static/index.html`, `stress.html`, `examples/next-headless`) nadal pokazują NIWWTS: to koncept Q0 („odbitka próbna”), który KIERUNEK-v2 odrzuca w całości, a ich testy e2e (`whitepoint.spec.ts`, siatka, lupa) są przypięte do tych fixtures. Sama podmiana zdjęć dałaby zdjęcia sklepu w tekstach i layoucie NIWWTS, a przepisanie tych stron to robota Q1–Q4 po bramce. Prompt R0 wyklucza też README i `packages/*`. Zostawiam więc stare demo nietknięte i zapisuję to tutaj wprost.

## R2 · Arkusze

**Jak.** `examples/r0/` to osobny harness: `r0-entry.js` (bundel `@paper-design/shaders-react` 0.0.82 + React 19, budowany przez `examples/r0/build.mjs` do gitignorowanego `r0.bundle.js`), `effects.js` (kandydaci, presety, osie czasu przejść), `cell.js` (kompozycje: `image`, `loupe`, `badge`, `overlay`, `backdrop`), `sheet.html`, `strip.html`, `transition.html`. Skrypty: `scripts/r0-sheets.mjs`, `scripts/r0-transitions.mjs`, `scripts/r0-hero.mjs` (Playwright Chromium, `deviceScaleFactor` 2). Arkusz: 3 zdjęcia × (bez efektu + 3 presety), stan spoczynku (`speed 0`, stała klatka); obok każdego PNG jest `.json` z dokładnymi propsami. `packages/*` nietknięte.

**Geometria, którą trzeba było rozwiązać po drodze:**
- `fluted-glass`: liczba żłobień = `mix(200, 5, size)` na szerokość zdjęcia (z `fluted-glass.js`). Przy `size` 0,3–0,75 wychodziło 53–140 żłobień, co wygląda jak przeplot ekranu, nie jak szkło. `size` 0,95 ≈ 15 żłobień, jak w drzwiach sklepu. Żłobki próbkują poza zdjęciem przy prawej krawędzi (pas papieru), stąd `scale` 1,06.
- Kadr 4 : 5 z poziomych zdjęć: punkt ogniskowy per zdjęcie (`FOCAL_X` w `lib.js`), liczony tym samym wzorem co vertex shader Papera (`imageUV = (uv·box − offsetX) / scale + .5`), więc `<img>` (`object-position`) i shader kadrują identycznie.
- Lupa: kwadratowy canvas pod kursorem, który pokazuje to samo zdjęcie co karta, powiększone 2,2×: `loupeProps` w `lib.js` (wyprowadzone z `vertex-shader.js`). Źródło 1600 px, bo przy 1000 px powiększenie było miękkie.

**Strojenie (rundy, co się zmieniło):**
- `fluted-glass`: 3 rundy, 16 wariantów. Kształt `prism` dawał postrzępione krawędzie produktu, `lens` przy małym `size` niewidoczne szkło; wygrał `contour` 0,3 przy `size` 0,95.
- `fluted-glass-preorder`: 1 runda, 4 warianty; `stretch` > 0,1 robił falbanki na dole torby.
- `lens-distortion`: 1 runda + przestawienie punktu na zegarku (lupa powiększała logo na tarczy); Fisheye złagodzony (tęcza przy `spread` 0,3 jest tandetna).
- `water`: 2 rundy, 7 wariantów. Domyślne `scale` 0,8 zmniejszało zdjęcie w ramce papieru; mocne `waves`/`caustic` topią produkt. Zostało światło (kaustyka jak od basenu).
- `liquid-metal`: 2 rundy, 7 wariantów (napis „NEW” z maski Archivo). Wszystkie czytają się jak WordArt.
- `pulsing-border`: 2 rundy, 7 wariantów. Przy `spots` 2 świeciły tylko fragmenty ramki (wygląda jak błąd renderu); `spots` 5–6 zamyka ramkę.
- `grain-gradient`: 2 rundy, 7 wariantów. Pierwsza runda była niewidoczna; preset „From the photo” bierze średni kolor pasa 6 % przy krawędzi zdjęcia.
- `paper-texture`: 2 rundy, 7 wariantów. Biały papier z alfą 0,38–0,5 wybielał zdjęcia; zostały fałd i włókno przy alfie 0,12–0,19.
- `image-dithering`: 2 rundy, 7 wariantów. W upstreamie `colorFront` to jasny ton (pierwsza runda wyszła w negatywie).
- `halftone-cmyk`: 1 runda + łagodniejszy trzeci preset.

**Wynik renderu (przebieg z 29.10.2026, przed eksportem WebP; rozmiary PNG takie same jak w przebiegu niżej):**

```
$ node scripts/r0-sheets.mjs
fluted-glass           2.9 s  2.68 MB  errors 0
fluted-glass-preorder  3.8 s  3.75 MB  errors 0
lens-distortion        2.2 s  2.22 MB  errors 0
water                  1.9 s  3.01 MB  errors 0
liquid-metal           2.7 s  1.18 MB  errors 0
pulsing-border         2.0 s  1.23 MB  errors 0
grain-gradient         3.0 s  1.91 MB  errors 0
paper-texture          4.2 s  4.92 MB  errors 0
image-dithering        1.7 s  1.97 MB  errors 0
halftone-cmyk          3.6 s  9.46 MB  errors 0
$ node scripts/r0-transitions.mjs
fluted-glass     strip 0.52 MB · mp4 0.07 MB · gif 0.37 MB (400 px, 20 fps) · 75 frames
lens-distortion  strip 0.48 MB · mp4 0.10 MB · gif 0.74 MB (400 px, 20 fps) · 75 frames
water            strip 0.57 MB · mp4 0.06 MB · gif 1.55 MB (400 px, 20 fps) · 75 frames
```

„errors” = błędy strony i konsoli w Chromium. Klipy: 2,5 s, 30 fps, 480 px; wszystkie MP4 i GIF ≤ 2 MB. Ruch sprawdzony na wyciętych klatkach (0,2 / 0,7 / 1,0 / 1,3 / 2,0 / 2,4 s): szyba się odsuwa i wraca, lupa rośnie i sunie, fala przechodzi i gaśnie.

Rozmiar pierwszego przebiegu: 37 plików, **51 MB** w `docs/media` (`du -ch docs/media/r0-*`), najcięższy `r0-halftone-cmyk.png` 9,46 MB. Po bramce (decyzja 3 niżej) do gita idą tylko kopie WebP ≤ 400 KB (`scripts/r0-media.mjs`: jakość 82 → 50, potem zmniejszanie o 15 %), pliki `.json` z parametrami i MP4; pełne PNG i GIF zostają lokalnie (`.gitignore`: `docs/media/r0-*.png`, `docs/media/r0-*.gif`). Przebieg z eksportem:

```
$ node scripts/r0-sheets.mjs
fluted-glass           3.0 s  2.68 MB  errors 0
  → r0-fluted-glass.webp 172 KB (q 82, 2800 px)
fluted-glass-preorder  3.5 s  3.75 MB  errors 0
  → r0-fluted-glass-preorder.webp 197 KB (q 82, 2982 px)
lens-distortion        2.5 s  2.22 MB  errors 0
  → r0-lens-distortion.webp 334 KB (q 82, 2800 px)
water                  1.9 s  3.01 MB  errors 0
  → r0-water.webp 182 KB (q 82, 2800 px)
liquid-metal           2.7 s  1.18 MB  errors 0
  → r0-liquid-metal.webp 229 KB (q 82, 2800 px)
pulsing-border         1.8 s  1.23 MB  errors 0
  → r0-pulsing-border.webp 211 KB (q 82, 2800 px)
grain-gradient         3.0 s  1.91 MB  errors 0
  → r0-grain-gradient.webp 151 KB (q 82, 2800 px)
paper-texture          3.9 s  4.92 MB  errors 0
  → r0-paper-texture.webp 300 KB (q 82, 2800 px)
image-dithering        1.6 s  1.97 MB  errors 0
  → r0-image-dithering.webp 393 KB (q 50, 2023 px)
halftone-cmyk          3.2 s  9.46 MB  errors 0
  → r0-halftone-cmyk.webp 382 KB (q 50, 2023 px)
$ node scripts/r0-transitions.mjs
  → r0-fluted-glass-strip.webp 63 KB (q 82, 2800 px)
fluted-glass     strip 0.52 MB · mp4 0.07 MB · gif 0.37 MB (400 px, 20 fps) · 75 frames
  → r0-lens-distortion-strip.webp 108 KB (q 82, 2800 px)
lens-distortion  strip 0.48 MB · mp4 0.10 MB · gif 0.74 MB (400 px, 20 fps) · 75 frames
  → r0-water-strip.webp 41 KB (q 82, 2800 px)
water            strip 0.57 MB · mp4 0.06 MB · gif 1.55 MB (400 px, 20 fps) · 75 frames
```

`r0-image-dithering.webp` i `r0-halftone-cmyk.webp` zmieściły się w limicie dopiero przy q 50 i 2023 px: raster w tych dwóch kopiach jest przeskalowany, więc ewentualna mora to skutek eksportu; wzorcem są lokalne PNG (oba efekty i tak ODPADA). Razem w gicie: 34 pliki, **3,9 MB** (`du -ch docs/media/r0-*.webp docs/media/r0-*.json docs/media/r0-*.mp4`).

## R3 · Exit Check i werdykt per arkusz

Ramka arkusza jest wspólna (papier, Archivo, nagłówek 50/50, regularna siatka kontaktówki), więc punkty 1, 2, 9, 11 przechodzą wszędzie, a punkt 4 (asymetria) jest ✘ wszędzie: kontaktówka jest regularna z założenia. Reszta to ocena samego efektu na produkcie.

Werdykty w tej tabeli to ocena agenta z 29.10.2026; decyzje Piotrka po bramce są w sekcji „Decyzje bramki R0”.

| Arkusz | Exit Check | ✘ (poza 4) | Werdykt | Dlaczego (jedno zdanie) |
| --- | --- | --- | --- | --- |
| `r0-fluted-glass.webp` | 12/13 | — | **PRZECHODZI** | Przy 15 żłobieniach to czytelna szyba z witryny, a nie filtr, i produkt jest w niej dalej rozpoznawalny, zanim szkło odjedzie. |
| `r0-fluted-glass-preorder.webp` | 12/13 | — | **PRZECHODZI** | Trzy stopnie czytają się jak szkło, które się przeciera, więc data premiery ma obraz, a nie licznik. |
| `r0-lens-distortion.webp` | 12/13 | — | **PRZECHODZI** | Lupa pokazuje fakturę skóry, datownik i szew tam, gdzie patrzy kupujący; preset Fisheye zostaje tylko jako górna granica. |
| `r0-water.webp` | 11/13 | 8 (woda nie należy do świata witryny) | **POPRAW** | Światło wody jest ładne, ale shader nie ma punktu początkowego fali, więc klik nie dostaje odpowiedzi tam, gdzie padł, a mocniejsze presety topią produkt. |
| `r0-liquid-metal.webp` | 8/13 | 3, 5, 7, 8 | **ODPADA** | Po dwóch rundach napis wciąż wygląda jak chromowany WordArt, nie jak złocony szyld na szybie. |
| `r0-pulsing-border.webp` | 8/13 | 3, 5, 12, 13 | **ODPADA** | W spoczynku to ramka, którą daje CSS bez WebGL, a ruch dodaje tylko miganie wokół produktu. |
| `r0-grain-gradient.webp` | 10/13 | 11, 13 | **POPRAW** | Tło w kolorze studia zdjęcia ma sens, ale na krawędzi karty widać szew, a samo ziarno robi niewiele ponad kolor z CSS. |
| `r0-paper-texture.webp` | 12/13 | — | **POPRAW** | Fałd czyta się jak wydrukowana strona lookbooka, ale warstwa papieru rozjaśnia czernie produktu (słoik świecy, torba). |
| `r0-image-dithering.webp` | 9/13 | 5, 6, 8 | **ODPADA** | Produkt czyta się gorzej niż bez efektu, a tło w referencji upstream zawsze łapie raster (łatka `whitePoint` z Q0 jest tylko w elemencie i nie ratuje czytelności produktu). |
| `r0-halftone-cmyk.webp` | 8/13 | 3, 5, 6, 8 | **ODPADA** | Na ekranie 2× punkty rastra zmieniają kolor produktu (różowa lampa drukuje się na czerwono), a sklep nie może pokazać innego koloru, niż sprzedaje. |

Uwagi do Q1 z arkuszy i przejść: (1) `scale` 1,06 przy szybie działa też w odsłoniętej części, więc odsłonięty produkt jest o 6 % większy niż `<img>` pod spodem; element potrzebuje zapasu tylko pod maską albo podmiany na `<img>` po zamknięciu animacji. (2) Fala bez punktu początkowego: do rozważenia własny uniform środka fali (łatka jak `whitePoint`) albo zostawienie wody poza demo. (3) Na ciemnych zdjęciach (lampa) linie `highlights` szyby są wyraźniejsze niż na jasnych; preset może potrzebować wariantu „dark”.

## R4 · Makieta hero i karty

`examples/static/r0-hero.html`: pasek „Store” (bez logo), hero 46/54 z tytułem „Look through the glass.”, zdjęcie wazonu do prawej i dolnej krawędzi za dwiema szybami, które rozchodzą się od kursora (hover) i otwierają do końca po kliknięciu lub tapnięciu (`<button aria-pressed>`, Enter/Spacja działają jak klik). Pod spodem sekcja „Objects” z jedną kartą (krzesło barowe) za tą samą szybą, która odjeżdża w prawo jak drzwi. Stopka: kredyt zdjęć i „Powered by Paper Shaders”. Montaż: React wrappers z bundla R0 (makieta), bo `fluted-glass` nie ma jeszcze w elemencie; karta montuje się dopiero przy wejściu w viewport.

Pierwsza wersja (29.10) miała w hero lampę, a w karcie wazon; po bramce (decyzja 6) hero ma wazon, karta krzesło. Układ hero to siatka z obszarami: na desktopie tytuł u góry lewej kolumny, cena, lede i podpowiedź u dołu; na telefonie kolejność tytuł → zdjęcie → reszta, więc zdjęcie zaczyna się w górnej połowie pierwszego ekranu (pomiar `getBoundingClientRect().top` w skrypcie, niżej). Pełny zrzut 390 robiony wysokim viewportem, bo `fullPage` w Chromium na chwilę zmienia viewport i gubi emulację dotyku (na zrzucie pokazywała się podpowiedź dla myszy; sprawdzone: w emulacji `hover: none` = true, `.hint--touch` = block).

```
$ node scripts/r0-hero.mjs
390 × 844: hero photo top at 266.5 px (top half ends at 422 px)
  → r0-hero-1440.webp 68 KB (q 82, 2880 px)
  → r0-hero-1440-hover.webp 67 KB (q 82, 2880 px)
  → r0-hero-1440-full.webp 114 KB (q 82, 2880 px)
  → r0-hero-1440-card-open.webp 34 KB (q 82, 2880 px)
  → r0-hero-390.webp 51 KB (q 82, 1170 px)
  → r0-hero-390-tap.webp 48 KB (q 82, 1170 px)
  → r0-hero-390-full.webp 108 KB (q 82, 1170 px)
r0-hero-1440.mp4 0.07 MB
r0-hero-1440.png               1.00 MB
r0-hero-1440-hover.png         1.02 MB
r0-hero-1440-full.png          1.30 MB
r0-hero-1440-card-open.png     0.23 MB
r0-hero-390.png                0.58 MB
r0-hero-390-tap.png            0.59 MB
r0-hero-390-full.png           0.94 MB
r0-hero-1440.gif               0.45 MB
gif width 720 px, 20 fps, 4.4 s · page errors: 0
```

GIF prowadzony klatka po klatce przez `window.__r0.hero.set(cx, gap)` z tą samą krzywą co strona (pierścień udaje kursor), więc każda klatka jest dokładna; z tych samych klatek powstaje `r0-hero-1440.mp4` (w gicie), GIF zostaje lokalnie. W pierwszym przebiegu (29.10) zrzut karty wyszedł bez hovera (mysz poza viewportem, współrzędne mierzone przed przewinięciem); poprawione.

**Exit Check makiety: 12/13.** ✔ Lock i pokrętła; ✔ Archivo; ✔ asymetria 46/54 i karta poza osią (kolumny 5–8 z 12); ✔ jedna sygnatura; ✔ hierarchia, także na 390 px (zdjęcie od 266,5 px przy ekranie 844 px); ✔ brak Tells (bez gradientów, zaokrągleń, cieni, wyśrodkowanego stosu); ✔ kontekst witryny; ✔ ciepło papieru; ✔ izolacja produktu; ✔ grupy (nazwa i cena przy produkcie); ✔ głębia przez szkło, nie cień; ✔ napięcie (produkt ukryty do gestu, tytuł o stopień za duży). **✘ kolor:** z wazonem w hero i krzesłem w karcie strona nie ma żadnego koloru, beż na beżu; Lock zabrania akcentu w UI, więc kolor musi przyjść ze zdjęć: do rozważenia w Q1 przy doborze kolejności produktów w katalogu.

Wydajność makiety: niezmierzona (hero trzyma 2 żywe konteksty WebGL, karta 1; Lighthouse nie był w zakresie R0).

## Kontrola repo

```
$ pnpm lint
$ eslint . && prettier --check .
Checking formatting...
All matched files use Prettier code style!
lint exit 0
$ pnpm test
 Test Files  8 passed (8)
      Tests  46 passed (46)
test exit 0
$ pnpm typecheck
packages/element typecheck: Done
packages/react typecheck: Done
$ node scripts/sync-fixtures.mjs && next typegen && tsc --noEmit
sync-fixtures: 16 files → public/fixtures/
✓ Types generated successfully
typecheck exit 0
```

`eslint.config.js` i `.prettierignore` dostały jeden wpis: `examples/r0/r0.bundle.js` (wygenerowany bundel, jak `ref.bundle.js`). `pnpm test:e2e` nieuruchamiane: R0 nie dotyka elementu ani stron, które testuje.

## Inne zmiany w dokumentach

- `docs/adr/0002-kierunek-v2.md`: decyzja Piotrka z 29.10.2026 (zastępuje PLAN D13 i domyślny dither).
- `docs/vitrine/PLAN.md`: nad D13 wskaźnik „Zastąpione przez ADR-0002”, tekst D13 bez zmian.
- `CLAUDE.md`: zdanie o arbitrze stylu (NIWWTS/D13) zastąpione odwołaniem do ADR-0002. Nieśledzony `AGENTS.md` (nie mój) ma nadal starą wersję.
- `docs/vitrine/STATUS.md`: wiersz R0 i kroki bramki.
- `CLAUDE.md` (po bramce, decyzja 4): zasada „żadnych danych osobowych w zapytaniach do zewnętrznych serwisów”. Powód: w R1 jedno zapytanie do API Openverse (timeout, bez odpowiedzi) miało e-mail Piotrka w nagłówku User-Agent; pozostałe zapytania podawały adres repo.
- `.gitignore`: `examples/r0/r0.bundle.js`, `docs/media/r0-*.png`, `docs/media/r0-*.gif`. Wpis `.vercel` w tym pliku pochodzi sprzed R0 (wdrożenie Vercel) i nie wchodzi do commita R0.

## Decyzje bramki R0 (Cowork, potem Piotrek, 30.10.2026)

1. Stare demo NIWWTS (`examples/static/index.html`, `stress.html`, `examples/next-headless`) przepisujemy w Q1 na nowy kierunek; fixtures NIWWTS zostają tylko w testach zgodności. → bez zmian w R0, zapisane w STATUS.
2. Zmiany w `CLAUDE.md` i `PLAN.md` przyjęte; `AGENTS.md` nie wchodzi do commita. → zrobione.
3. 51 MB nie idzie do historii: arkusze jako WebP ≤ 400 KB + `.json`, MP4 zostają, pełne PNG lokalnie poza gitem. → `scripts/r0-media.mjs`, wpisy w `.gitignore`, wynik wyżej (GIF-y też zostały lokalnie; hero dostał MP4).
4. Zasada o danych osobowych w zapytaniach do zewnętrznych API. → dopisana w `CLAUDE.md`.
5. Efekty na Q1: szyba (karta), szyba pre-order z datą, lupa. Water i grain-gradient na później. Paper-texture ODPADA (zmywa produkt).
6. Hero: wazon albo krzesło zamiast lampy; na 390 px zdjęcie w górnej połowie pierwszego ekranu. → hero = wazon, karta = krzesło; zdjęcie od 266,5 px (połowa ekranu: 422 px).

Do obejrzenia lokalnie: `node examples/r0/build.mjs && pnpm serve` → `http://localhost:4173/examples/static/r0-hero.html`.

## Efekt · werdykt · preset kandydat · arkusz

Werdykt końcowy po bramce (w nawiasie ocena agenta, jeśli inna). Arkusze w gicie jako `.webp`, klipy jako `.mp4`; pełne PNG i GIF lokalnie.

| Efekt | Werdykt | Preset kandydat | Arkusz |
| --- | --- | --- | --- |
| fluted-glass (karta, domyślny) | PRZECHODZI → Q1 | A · Window (`contour`, `size` 0,95, `distortion` 0,3, `scale` 1,06) | `r0-fluted-glass.webp`, `r0-fluted-glass-strip.webp`, `r0-fluted-glass.mp4` |
| fluted-glass (pre-order z datą) | PRZECHODZI → Q1 | skala daty: A 30 dni → B 7 dni → C 1 dzień (`blur` 0,6 → 0,1) | `r0-fluted-glass-preorder.webp` |
| lens-distortion (strona produktu) | PRZECHODZI → Q1 | A · Loupe (`lensBulge` 0,35, `lensCircle` 0,6, zoom 2,2×) | `r0-lens-distortion.webp`, `r0-lens-distortion-strip.webp`, `r0-lens-distortion.mp4` |
| water (dodanie do koszyka) | NA PÓŹNIEJ (agent: POPRAW) | A · Pool light (`caustic` 0,02, `highlights` 0,18) | `r0-water.webp`, `r0-water-strip.webp`, `r0-water.mp4` |
| grain-gradient (tło sekcji) | NA PÓŹNIEJ (agent: POPRAW) | B · From the photo | `r0-grain-gradient.webp` |
| paper-texture (lookbook) | ODPADA, decyzja Piotrka: zmywa produkt (agent: POPRAW) | — | `r0-paper-texture.webp` |
| liquid-metal (CTA / odznaka) | ODPADA | — | `r0-liquid-metal.webp` |
| pulsing-border (CTA / odznaka) | ODPADA | — | `r0-pulsing-border.webp` |
| image-dithering (tryb druk) | ODPADA | — | `r0-image-dithering.webp` |
| halftone-cmyk (tryb druk) | ODPADA | — | `r0-halftone-cmyk.webp` |
