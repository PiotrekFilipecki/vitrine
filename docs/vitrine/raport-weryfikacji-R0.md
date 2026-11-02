# Raport weryfikacji R0 · VITRINE

Recenzent: Cowork, 30.10.2026 ok. 01:20. Tryb tylko do odczytu, wg `PROMPT-cowork-weryfikacja-R0.md`. Repo `~/Desktop/Projects/vitrine`, gałąź `r0-kierunek` = `923e5b0`. Testy i makieta szły w osobnej kopii (bundle commitów → kontener), Twoje repo jest nietknięte.

## 1. Werdykt

R0 jest zrobione rzetelnie i zgodnie z decyzjami po pierwszej bramce. Twierdzenia agenta potwierdziłem plikami, komendami, stronami Unsplash i makietą odpaloną na żywo; wszystkie niezgodności są drobne (sekcja 4).

**Gotowe** do obejrzenia na telefonie i do merge `r0-kierunek` → `main` po Twojej bramce. Szyba, szyba pre-order i lupa to pierwszy materiał w tym projekcie, którym można się chwalić.

## 2. Punkty kontroli

| # | Punkt | Werdykt | Dowód |
|---|---|---|---|
| 1 | Git | **POTWIERDZONE** | 6 commitów `8865bc5`…`923e5b0` na `85b9349`; `origin/main` = `064b015` (nic nie wypchnięte). `git diff 85b9349 r0-kierunek --stat -- packages shopify-theme README.md`: pusto. `git log --all -- AGENTS.md .vercelignore examples/next-headless/vercel.json`: pusto. Linia `.vercel` tylko w working tree (niezacommitowana), zgodnie z opisem. |
| 2 | Decyzja 3 · rozmiar | **POTWIERDZONE** | 0 plików `r0-*.png/gif` w gicie; największy `r0-halftone-cmyk.webp` 391 640 B, żaden > 400 000 B; R0 dodało 94 pliki, 5 056 883 B (devlog: ok. 5,08 MB, 94 pliki ✔). `git check-ignore`: `r0-water.png/gif` ignorowane (`.gitignore:26–27`). Każdy z 10 arkuszy `.webp` ma `.json`. |
| 3 | Licencje | **POTWIERDZONE** (z uwagą) | 12/12 stron Unsplash otwartych: autorzy zgodni z tabelą, każda strona „Free to use under the Unsplash License”, żadna nie jest Unsplash+, żadnych tagów 3D/AI. 36 plików WebP (1600 / w1000 / w640 × 12) bez EXIF, XMP i ICC. Uwagi w sekcji 4 (pkt 2–3). |
| 4 | Klienci, dane osobowe | **POTWIERDZONE** | `git grep -i "friendz\|emwu"`: tylko zasady w CLAUDE.md, PLAN, STATUS i komendy w devlogu. W plikach R0 brak e-maili. `CLAUDE.md` ma nową zasadę „No personal data in requests to external services”. |
| 5 | Arkusze | **POTWIERDZONE** | 10 arkuszy: kolumna „No effect” + 3 presety × 3 zdjęcia. `examples/r0/r0-entry.js:15` importuje `@paper-design/shaders-react` (nie element). Parametry na arkuszach = `.json` = `effects.js` (sprawdzone: fluted-glass A/B/C, halftone A/B/C). Zdjęcia tylko z nowych fixtures. |
| 6 | Ocena efektów | **POTWIERDZONE** | tabela w sekcji 3 |
| 7 | Przejścia | **POTWIERDZONE** | `ffprobe`: 3 × MP4 480×600, 30 fps, 2,5 s, 75 klatek. Klatki 0,2 / 0,7 / 1,2 / 1,8 / 2,3 s: szyba odjeżdża i wraca, lupa rośnie i sunie, fala przechodzi i gaśnie. Czasy w makiecie: otwarcie 520 ms, zamknięcie 380 ms, gap 420/640 ms (`r0-hero.html:487–507`), bez overshoot (komentarz `effects.js:12`). |
| 8 | Makieta | **POTWIERDZONE** | Odpalona w Chromium: hero = wazon, karta = krzesło; 1440: hover rozchyla szyby, klik → `aria-pressed=true`; 390 z dotykiem: `#hero` top = **266,5 px** (górna połowa z 844 ✔), tap otwiera, widoczna tylko podpowiedź dotykowa; Tab dochodzi do `#hero`, Enter → `true`; `reducedMotion: reduce` → stan końcowy po 60 ms bez animacji; stopka: kredyt zdjęć + „Powered by Paper Shaders”; 0 błędów w konsoli. Lock trzymany: papier, tusz, Archivo, zero akcentu, jedna sygnatura. |
| 9 | Exit Check | **POTWIERDZONE** | Oceny uczciwe; ✘ „beż na beżu” w makiecie słuszne: wazon na beżowym tle obok papieru `#EFEBE4` daje mało kontrastu w spoczynku. Nie blokuje. |
| 10 | Dokumenty | **POTWIERDZONE** (z uwagą) | ADR-0002: decyzja z 29.10 + sekcja „Bramka R0 (30.10.2026)” z wyborem na Q1; PLAN: wskaźnik nad D13, tekst D13 bez zmian; `CLAUDE.md`: tylko zdanie o arbitrze + zasada o danych osobowych; devlog: tabela skilli z niepustą 3. kolumną, końcowa tabela zgodna z decyzją 5 (paper-texture ODPADA, „agent: POPRAW”). Uwaga: sekcja 4, pkt 4. |
| 11 | Odtwarzalność, testy | **CZĘŚCIOWO** | Kod z `923e5b0` w kontenerze: `pnpm install` 0, `lint` 0, `typecheck` 0, `test` 0 (8 plików, 46/46), `node examples/r0/build.mjs` 0. `node scripts/r0-sheets.mjs …`: **NIE DA SIĘ SPRAWDZIĆ** tutaj, bo repo używa `@playwright/test` 1.64.1, a w kontenerze nie ma przeglądarki tej wersji (ten sam powód co e2e w Q0). Worktree w Twoim repo celowo nie zakładałem. |
| 12 | Otwarte punkty | **POTWIERDZONE** | `scale 1.06` jest w `effects.js:38–42` z komentarzem; mocniejsze linie na ciemnych zdjęciach widać na arkuszu z lampą; przeskalowane WebP ditheringu i halftone opisane; stare demo NIWWTS czeka na Q1; wydajność makiety niezmierzona: zgodne z devlogiem. |

## 3. Ocena efektów

| Efekt | Agent | Decyzja Piotrka | Moje zdanie |
|---|---|---|---|
| fluted-glass, karta | PRZECHODZI | Q1 | Najmocniejszy: produkt czytelny, szkło dodaje materii, odsłonięcie jest nagrodą. Preset A „Window” najlepszy. |
| fluted-glass, pre-order | PRZECHODZI | Q1 | Czyta się dokładnie jak szyba, która się przeciera; skala 30 → 7 → 1 dzień działa bez opisu. |
| lens-distortion | PRZECHODZI | Q1 | A „Loupe” naturalny; B i C to już efekt dla efektu. Trasa w klipie omija znak na tarczy. |
| water | POPRAW | później | Zgoda: fala za słaba na karcie, żeby była wartością; bez niej nic się nie traci. |
| grain-gradient | POPRAW | później | Zgoda: B „From the photo” ładny, ale to zrobi też CSS; niski priorytet. |
| paper-texture | POPRAW | ODPADA | Zgoda z Tobą: rozjaśnia czernie i zmywa produkt. |
| liquid-metal | ODPADA | — | Zgoda: „NEW” z połamanymi literami wygląda tandetnie. |
| pulsing-border | ODPADA | — | Zgoda: w spoczynku to zwykła ramka, CSS zrobi to samo. |
| image-dithering | ODPADA | — | Zgoda na zdjęciach produktów; strojenie było uczciwe (devlog: 2 rundy wariantów). |
| halftone-cmyk | ODPADA | — | Zgoda: na tle i produkcie powstaje mora, sklep tego nie wypuści. |

## 4. Niezgodności, od najpoważniejszej

1. **STATUS wyprzedza fakty:** `docs/vitrine/STATUS.md:3` i `:20` mówią „bramka Cowork przeszła 30.10.2026”. To dotyczy mojego wstępnego przeglądu, a ta weryfikacja trwała jeszcze w chwili commitu. Teraz to prawda, ale zapis powstał przed sprawdzeniem.
2. **Znak na zegarku czytelny:** `CREDITS.md`, sekcja „Checks”, mówi, że napis na tarczy `06-watch` jest nieczytelny przy rozmiarze karty. W klipie lupy przy 480 px szerokości „CURREN” da się przeczytać. Na razie zegarek jest tylko w arkuszu lupy, nie w makiecie. Przed Q1 trzeba albo zamienić zdjęcie, albo nie używać go na karcie.
3. **Słuchawki to rozpoznawalny produkt:** `08-headphones` nie ma logo, ale opis na Unsplash to „Airpod pro max”, a kształt jest charakterystyczny. Licencja Unsplash nie daje praw do znaku ani wzoru. W fikcyjnym „Store” z ceną to niskie, ale realne ryzyko. Do rozważenia zamiana na słuchawki bez rozpoznawalnego designu.
4. **Fallback fontu:** `examples/static/r0-hero.html:49` ma `font-family: 'Archivo', serif`. Gdy font się nie wczyta, strona przejdzie na krój szeryfowy. Powinno być `sans-serif`.
5. **Odtwarzalność arkuszy niesprawdzona poza Twoim Makiem** (punkt 11). To nie błąd repo, ale ograniczenie środowiska.

## 5. Przed Q1

| Co | Kto |
|---|---|
| Obejrzeć makietę na telefonie (`node examples/r0/build.mjs && pnpm serve`, IP Maca `:4173/examples/static/r0-hero.html`) i zdecydować o merge `r0-kierunek` → `main` | Piotrek |
| Poprawki 2–4 z sekcji 4: zegarek poza kartami albo inne zdjęcie, decyzja o słuchawkach, fallback `sans-serif` | agent, na początku Q1 |
| Prompty Q1 pod trzy efekty (szyba karta, szyba pre-order z datą, lupa) zamiast PROMPTY-v02 Q1–Q4 | Cowork |
| Usunąć pliki pomocnicze weryfikacji z folderu `vitrine` w Oszi: `_q0-weryfikacja.bundle`, `_r0-weryfikacja.bundle`, `_r0-klatki.png` | Piotrek |
