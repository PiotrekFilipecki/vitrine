# ADR-0002: Kierunek wizualny v2 — witryna sklepowa zamiast wystawy NIWWTS

## Status

Accepted (29.10.2026, decyzja Piotrka po Q0). Zastępuje **PLAN D13** (sklep demo = NIWWTS, `niwwts-aesthetic` arbitrem stylu) oraz domyślny efekt kart = dither. Pełny tekst decyzji: `docs/vitrine/KIERUNEK-v2.md` (kopia 1:1 pliku z folderu planowania). Nie zmienia ADR-0001 (architektura, bake, pula, Liquid, React zostają).

## Bramka R0 (30.10.2026)

Po arkuszach R0 (`docs/vitrine/devlog/R0-kierunek.md`) Piotrek wybrał na Q1: `fluted-glass` (karta), `fluted-glass` pre-order związany z datą premiery, `lens-distortion` (lupa). `water` i `grain-gradient` odłożone. Odpadają: `paper-texture` (zmywa produkt), `liquid-metal`, `pulsing-border`, `image-dithering`, `halftone-cmyk` (nie trafiają do demo ani README; w elemencie zostają efekty z ADR-0001). Dowody R0 w gicie tylko jako WebP ≤ 400 KB, `.json` i MP4; pełne PNG/GIF lokalnie.

## Kontekst

Werdykt Piotrka po Q0: „to wszystko jest paskudne, nie będę się tym chwalił”. VITRINE to open source dla każdego sklepu, więc demo nie może być wystawą jednej marki. Diagnoza w KIERUNEK-v2 (taste-guardrail §8): dithering na zdjęciach koszulek na kremowym tle daje rozmytą miniaturę, nie druk; każda karta w tym samym rastrze zabiera klientowi produkt; mesh jako tło to generyczny gradient-blob; presety dobierał agent na renderach, bez poprzeczki „czy premium sklep by to wypuścił”.

## Decyzja

1. **Świat demo: witryna sklepowa.** Szkło ryflowane (fluted glass) w witrynach i drzwiach, złocony szyld na szybie, papier metki i paragonu; linia rodowa: wystrój Aesop, katalog Dietera Ramsa, fotografia produktowa na jednolitym tle. Archivo (wąska oś na nagłówkach), papier `#EFEBE4`, tusz `#141312`, zero akcentu w UI: kolor wnoszą tylko zdjęcia.
2. **Jedna sygnatura: szyba.** Karta stoi za ryflowanym szkłem, pod kursorem albo po dotknięciu szkło się rozsuwa i oddaje czysty produkt. Domyślny efekt karty: `fluted-glass` (zamiast dither). Dithering i halftone tylko jako opcja dla marek graficznych.
3. **Materiał demo:** 12 zdjęć produktów na jednolitym tle (Unsplash, Pexels albo CC0, licencja sprawdzana per zdjęcie, autor w `examples/fixtures/CREDITS.md`), sklep o neutralnej nazwie („Store”, bez logo). Fixtures NIWWTS zostają tylko w testach zgodności pikseli.
4. **Arbiter stylu:** `taste-guardrail` (Lock z KIERUNEK-v2) + `awwwards-art-director` (poprzeczka „sklep premium”). `niwwts-aesthetic` przestaje być arbitrem faz VITRINE.
5. **Poprzeczka efektu:** produkt ma być lepiej widoczny albo ciekawszy niż bez efektu, nigdy mniej czytelny. Efekt, który nie przejdzie (agent z Lockiem i Exit Checkiem → Cowork → Piotrek), nie trafia do demo ani README.
6. **Kolejność:** PROMPTY-v02 Q1–Q4 wstrzymane do bramki R0. R0 robi tylko materiał i arkusze dowodowe (`docs/media/r0-*`, devlog `docs/vitrine/devlog/R0-kierunek.md`); zmiany w `packages/*`, Liquid, README dopiero po bramce, w przepisanych Q1–Q4.

## Konsekwencje

Pozytywne: demo pokazuje dowolny sklep, nie jedną markę; jedna sygnatura zamiast efektu na każdej karcie; dobór efektów przechodzi przez jawną poprzeczkę i arkusze z kolumną „bez efektu”. Negatywne i dług: `fluted-glass` nie jest jeszcze w elemencie (element ma 4 efekty z ADR-0001), więc Q1 musi dodać mapowanie parametrów, test zgodności pikseli i wariant z dwiema szybami (hero) albo maską; obecne demo (`examples/static/index.html`, `stress.html`, `examples/next-headless`) i ich testy e2e wciąż stoją na fixtures NIWWTS i wyglądzie Q0, do przepisania w Q1–Q4. Arkusze R0 renderuje `@paper-design/shaders-react` (devDependency), nie element, więc opcje elementu spoza upstreamu (np. `whitePoint` z Q0) nie są w nich widoczne.

## Odrzucone

- **Zostawić NIWWTS i stroić presety ditheru dalej:** Q0 pokazało, że problem jest w materiale i w zasadzie „efekt na każdej karcie”, nie w parametrach. Odrzucone decyzją Piotrka.
- **Galeria wielu efektów w demo** („WebGL efekty”): negatyw z Locka („NIE może wyglądać jak galeria shaderów z Dribbble”). Odrzucone.
