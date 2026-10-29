# VITRINE · reset kierunku (29.10.2026)

**Dlaczego:** werdykt Piotrka po Q0: „to wszystko jest paskudne, nie będę się tym chwalił”. VITRINE to open source dla każdego sklepu, więc demo nie może być wystawą NIWWTS. Silnik (bake, pula, Liquid, React, 0 kontekstów) zostaje; zmienia się świat wizualny, materiał demo i dobór efektów.

**Zastępuje:** PLAN D13 (sklep demo = NIWWTS) i domyślny efekt kart = dither. PROMPTY-v02 Q1–Q4 są wstrzymane do bramki R0.

## Diagnoza (taste-guardrail §8: najpierw Tells)

1. **Zły materiał:** dithering na zdjęciach koszulek na kremowym tle daje rozmytą miniaturę, a nie druk.
2. **Efekt zamiast produktu:** każda karta w tym samym rastrze. Klient sklepu chce zobaczyć produkt, a druk mu go zabiera.
3. **Gradient-blob:** mesh jako tło i „pasek kontrolny” to generyczny rozmyty gradient (Tell: gradient bez powodu).
4. **Presety bez oka:** dobierał je agent na renderach, nikt ich nie stroił z poprzeczką „czy premium sklep by to wypuścił”.

## Lock

1. **Świat:** witryna sklepowa. Rzemiosło, z którego bierzemy: szkło ryflowane (fluted glass) w witrynach i drzwiach sklepów, złocony szyld malowany na szybie, papier metki i paragonu. Linia rodowa: wystrój sklepów Aesop i katalog Dietera Ramsa (powściągliwość, produkt jest bohaterem), fotografia produktowa na jednolitym tle.
2. **Typografia:** Archivo (już self-hosted w repo): wąska oś na nagłówkach, normalna na tekście. Bez mono jako ozdoby, mono tylko w kodzie.
3. **Kolor:** papier `#EFEBE4`, tusz `#141312`, zero akcentu w UI. Kolor wnoszą wyłącznie zdjęcia produktów.
4. **Ruch strukturalny:** produkt od krawędzi do krawędzi. W sekcji efektów jeden produkt na ekran zamiast siatki; katalog w 3 kolumnach o różnych wysokościach.
5. **Jedna sygnatura:** szyba. Karta stoi za ryflowanym szkłem, a pod kursorem albo po dotknięciu szkło się rozsuwa i oddaje czysty produkt. Wszystko inne jest ciche.

**Pokrętła:** wariancja 6 · ruch 6 (jeden zorkiestrowany moment: szyba) · gęstość 3.
**Negatyw:** to NIE może wyglądać jak galeria shaderów z Dribbble, demo „WebGL efekty” ani drop NIWWTS.

## Materiał demo

- 12 zdjęć produktów na jednolitym tle, różne kategorie: ceramika, szklana butelka perfum, sneaker, krzesło, lampa, zegarek, torba, słuchawki, kubek, okulary, świeca, roślina.
- Źródło: zdjęcia na licencji Unsplash, Pexels albo CC0, z autorem i linkiem w `examples/fixtures/CREDITS.md`. Licencję sprawdzamy przy każdym zdjęciu osobno. Zero sklepów klientów i zero zdjęć generowanych przez AI.
- Sklep demo ma nazwę zmyśloną i neutralną (np. „Store”, bez logo), żeby każdy widział w nim swój sklep.

## Efekty: poprzeczka i kandydaci

**Poprzeczka dla każdego efektu:** czy sklep premium wypuściłby to na produkcję? Ocenia agent z Lockiem i Exit Checkiem, potem Cowork, a na końcu Piotrek. Efekt, który nie przejdzie, nie trafia ani do demo, ani do README.

| Moment w sklepie | Kandydat (Paper) | Rola |
|---|---|---|
| Karta produktu (domyślny) | fluted-glass | szyba, która się rozsuwa: sygnatura |
| Strona produktu | lens-distortion | lupa pod kursorem zamiast zoomu |
| Przedsprzedaż / wkrótce | fluted-glass (mocniej) + bind date | szyba matowieje do dnia premiery |
| Dodanie do koszyka | water | jedna fala od punktu kliknięcia |
| CTA / odznaka | liquid-metal, pulsing-border | subtelnie, tylko jedno na stronę |
| Tło sekcji | grain-gradient | ziarno w kolorach motywu, prawie niewidoczne |
| Lookbook / opakowanie | paper-texture | zagięcie i faktura papieru na zdjęciu edytorskim |
| Tryb „druk” (opcja) | image-dithering, halftone-cmyk | tylko dla marek graficznych, nie domyślnie |

## Prompt R0 dla Claude Code (wklej w repo vitrine)

```
Faza R0 · VITRINE: reset kierunku wizualnego. Nie piszesz jeszcze kodu biblioteki. Robisz materiał demo i arkusze dowodowe efektów, na których zapadnie decyzja.
SKILLE OBOWIĄZKOWE (wczytaj przed pierwszą linijką): taste-guardrail (Lock z KIERUNEK-v2.md, Exit Check na każdym arkuszu), awwwards-art-director (ocena „czy sklep premium by to wypuścił”), motion-design (przejścia), security-perf-auditor (licencje i źródła zdjęć). niwwts-aesthetic NIE jest już arbitrem: VITRINE to open source dla każdego sklepu. W devlogu tabela: skill · po co · co zmienił w wyniku.

KONTEKST
- Gałąź r0-kierunek od main (po merge Q0, jeśli Piotrek zmergował; jeśli nie, od q0-blokery). Skopiuj "$HOME/Documents/Claude/Projects/Oszi Daily Assistant/vitrine/KIERUNEK-v2.md" do docs/vitrine/ i przeczytaj w całości. Przeczytaj raport-weryfikacji-Q0.md z tego samego folderu.
- KIERUNEK-v2 zastępuje PLAN D13 i domyślny efekt dither. Zapisz to w ADR-0002 jako decyzję Piotrka z 29.10.2026.

ZAKRES
R1. Materiał: 12 zdjęć produktów wg KIERUNEK-v2 (licencja Unsplash, Pexels albo CC0), pobranych na tym Macu. Dla każdego: autor, URL, licencja, data w examples/fixtures/CREDITS.md. Rozmiary 1600/1000/640 WebP. Fixtures NIWWTS zostają tylko w testach zgodności, znikają z demo.
R2. Arkusze dowodowe (docs/media/r0-*.png), renderowane przez @paper-design/shaders-react w Chromium:
    - po jednym arkuszu na kandydata z tabeli efektów: 3 presety × 3 zdjęcia, stan spoczynku;
    - dla efektów z przejściem (fluted-glass, lens, water): pasek 5 klatek przejścia oraz krótkie MP4/GIF ≤ 2 MB;
    - presety stroisz pod poprzeczkę: produkt ma być lepiej widoczny albo ciekawszy niż bez efektu, nigdy mniej czytelny.
R3. Exit Check na każdym arkuszu i werdykt agenta per efekt: PRZECHODZI / POPRAW / ODPADA, z jednym zdaniem dlaczego. Efekty ODPADA nie wchodzą dalej.
R4. Makieta hero i jednej karty (examples/static/r0-hero.html): szyba ryflowana na produkcie, rozsuwa się pod kursorem i po tapnięciu; reszta strony to tylko typografia i papier wg Locka. Zrzuty 390 i 1440 + GIF.
Poza zakresem: zmiany w packages/*, Liquid, React, README, publikacja.

GOTOWE, GDY
- CREDITS.md kompletny (12 pozycji, każda z licencją); grep po repo nie znajduje zdjęć klientów.
- Arkusze r0-* istnieją, każdy obejrzany i oceniony w devlogu (Exit Check + werdykt per efekt).
- docs/vitrine/devlog/R0-kierunek.md kończy się tabelą: efekt · werdykt · preset kandydat · arkusz.
Pokaż wynik każdej komendy, nie streszczenie.

DLA MODELU
- Zanim zaczniesz: przeczytaj CLAUDE.md i KIERUNEK-v2.md, wczytaj SKILLE OBOWIĄZKOWE. Brak skilla = napisz to wprost.
- Pracuj na gałęzi r0-kierunek; nie merguj, nie pushuj, nie wdrażaj niczego (żadnego Vercela).
- Jeśli efekt po uczciwym strojeniu dalej wygląda tanio, daj mu ODPADA. Mniej efektów pięknych > więcej brzydkich.
```

**Bramka R0:** Cowork weryfikuje arkusze (prawdziwość, licencje, ocena), potem Piotrek ogląda i zostawia tylko to, czym sam by się pochwalił. Dopiero wtedy przepisujemy Q1–Q4 pod wybrane efekty.
