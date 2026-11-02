> Q1–Q4 zastąpione przez PROMPT-Q1.md i ADR-0003

# VITRINE v0.2 · prompty dla Claude Code (Q0–Q4)

**Repo:** `~/Desktop/Projects/vitrine` (gałąź bazowa `main`, stan 29.10.2026 20:16 = v0.1.0).
**Folder planowania:** `~/Documents/Claude/Projects/Oszi Daily Assistant/vitrine/` (PLAN.md, PROMPTY.md, ten plik). Q0 kopiuje ten plik do `docs/vitrine/PROMPTY-v02.md`.

**Jak używać:** w folderze repo `claude`, potem „znajdź docs/vitrine/PROMPTY-v02.md i zrób fazę Qx” (przy Q0: „znajdź PROMPTY-v02.md w folderze Oszi Daily Assistant/vitrine i zrób Q0”). Jedna faza = świeża sesja. Gałąź na fazę: `q0-blokery`, `q1-interakcje`, `q2-efekty-produkt`, `q3-efekty-tlo`, `q4-wydanie`. Merge do `main` robisz Ty po bramce.

**Model i effort:** `/model fable`; effort `high` w Q1 i Q2, reszta `medium`.

**Zasady z CLAUDE.md obowiązują bez zmian:** skille obowiązkowe przed pierwszą linijką i tabela „skill · po co · co zmienił” w devlogu; wszystko wizualne przez taste-guardrail (Lock + Exit Check) + art direction + `niwwts-aesthetic` jako arbiter; dokładne piny; zero sklepów klientów; liczby tylko z pomiarów.

## Dlaczego v0.2 (przegląd z 29.10.2026)

v0.1 działa i jest dobrze udokumentowane: 38/38 testów jednostkowych, zgodność pikseli 16/16, 0 żywych kontekstów po wypaleniu siatki, motyw Liquid i headless. Do zgłoszenia blokują je jednak cztery rzeczy, a do „wow” brakuje interakcji i różnorodności efektów:

1. **Nieprawdziwe zdanie o Paper.** Strona demo, `submission.md` i nagłówek `process.md` mówią, że presety były strojone na płótnie Paper. Według `process.md` strojenie zrobił agent na renderach elementu. Kuratorzy z kręgu Papera to zauważą.
2. **Brak publicznego demo i paczki.** Repo prywatne, nie ma URL demo, a `vitrine-shaders` nie jest na npm (README każe go importować).
3. **README pokazuje Performance 85 vs 100** na stronie statycznej (TBT 587 ms: wypalanie 25 kart na wątku głównym).
4. **Wygląd katalogu:** dither drukuje kremowe tło mockupu jako raster, więc każda karta wygląda na brudną; w siatce 1440 px pod kartą wiodącą jest pusty pas; 12 produktów powtarza się do 24; hero to czarna płyta na rozmytym gradiencie, wygląda jak szablon.

Do tego wszystkie efekty poza hero są statyczne. Paper ma 30 shaderów; v0.1 używa 4.

## Czasy

Szacunki z P0–P5 tego repo, nie pomiar. „W kalendarzu” = realny + 50 %.

| Faza | Najlepszy / realny / najgorszy | W kalendarzu |
|---|---|---|
| Q0 blokery zgłoszenia + porządki wizualne | 2 h / 3 h 30 / 6 h | 5 h 15 |
| Q1 warstwa interakcji + reveal jako shader | 2 h 30 / 4 h / 7 h | 6 h |
| Q2 sześć efektów przy produkcie + playground | 3 h / 5 h / 9 h | 7 h 30 |
| **→ zgłoszenie do Codrops (v0.2)** | | |
| Q3 sześć efektów tła i UI + motyw w kawałkach | 2 h 30 / 4 h 30 / 8 h | 6 h 45 |
| Q4 pomiary, README, wydanie v0.3 | 1 h 30 / 2 h 30 / 4 h | 3 h 45 |
| **Razem** | **ok. 19 h 30 realnie** | **ok. 29 h** |

Do zgłoszenia (Q0–Q2): ok. 12 h 30 realnie, ok. 19 h w kalendarzu. Przewodnik wyszedł 28.10, więc wczesne zgłoszenie ma większą szansę na dopisanie.

## Co robisz ręcznie

1. **Po Q0:** repo na publiczne (`gh repo edit --visibility public --accept-visibility-change-consequences`), import do Vercel (Root Directory `examples/next-headless`), `npm login` i `npm publish` z `packages/element` (Q0 przygotuje checklistę).
2. **W Q2 (40 min):** strojenie nowych presetów na płótnie Paper — tym razem naprawdę Ty, na warstwach shaderów w Paper. Agent przygotuje ramki i odczyta wartości.
3. **Bramki na telefonie** po każdej fazie (opis przy fazie).
4. **Po Q2:** wysłanie zgłoszenia z `submission.md`.

---

## Q0 · Blokery zgłoszenia i porządki wizualne

```
Faza Q0 · VITRINE v0.2: usunięcie blokerów zgłoszenia (prawdziwość tekstów, wydajność wypalania, demo publiczne) i porządki wizualne katalogu i hero.
SKILLE OBOWIĄZKOWE (wczytaj przed pierwszą linijką): taste-guardrail (Lock przed zmianami wyglądu, Exit Check przed oddaniem), niwwts-aesthetic (arbiter stylu), awwwards-art-director (hero), security-perf-auditor (TBT, kolejka wypalania), test-engineer, a11y-gate, web-copy (teksty EN). Inne dobierz sam. W devlogu tabela: skill · po co · co zmienił w wyniku.

CEL I PO CO
Repo idzie do przewodnika Codrops „Paper, Curated”. Najpierw musi być prawdziwe, publiczne i szybkie, a katalog nie może wyglądać na brudny. Ta faza nie dodaje efektów; usuwa to, co zatrzymałoby kuratora w pierwszych 30 sekundach.

KONTEKST
- Gałąź q0-blokery od main. Skopiuj "$HOME/Documents/Claude/Projects/Oszi Daily Assistant/vitrine/PROMPTY-v02.md" do docs/vitrine/. Przeczytaj CLAUDE.md, docs/vitrine/STATUS.md, PLAN.md (D1–D13), devlogi P1–P5, process.md, submission.md.
- Fakty z przeglądu 29.10.2026: zdanie „Presets were tuned on the Paper canvas” jest w examples/static/index.html (ok. linii 637), docs/vitrine/submission.md (a) i (d) oraz w nagłówku sekcji 1 process.md; tabela w process.md §3 przypisuje strojenie Piotrkowi, a tekst §1 agentowi. Lighthouse static: 85 vs 100, TBT 587 ms (devlog P1). Next build w środowisku bez sieci pada na next/font/google (Archivo).

ZAKRES
B1. Prawdziwość: każde zdanie o Paper ma odpowiadać temu, co się stało. Dziś prawda brzmi: strona demo zaprojektowana na płótnie Paper; presety dobrane na renderach elementu, ramki w Paper jako punkt wyjścia. Popraw index.html, submission.md (a, b, c, d), process.md (nagłówek §1 i tabela §3, spójnie). Po strojeniu w Paper w Q2 teksty wrócą do „tuned in Paper”, z dowodem.
B2. Dither bez brudnego tła: kremowe/białe tło mockupu ma wyjść jako czysty papier, raster tylko na produkcie. Najpierw parametry presetu (kontrast, kroki, kolory) na wszystkich 12 zdjęciach; jeśli nie wystarczą, próg jasności przed ditheringiem jako opcja elementu (domyślnie wyłączona, żeby zgodność pikseli z upstream zostawała dowodem). Testy zgodności dalej 100 % dla presetów bez nowej opcji; nowa opcja ma własne testy.
B3. Katalog: 12 unikalnych produktów na stronie demo (bez powtórek), siatka bez pustych pasów w 390, 768, 1024, 1440 (sprawdź kartę wiodącą i płytę zamykającą). Test 24 kart × 0 kontekstów przenieś na osobną stronę examples/static/stress.html, żeby liczby w README zostały prawdziwe.
B4. Wypalanie poza ścieżką krytyczną: kolejka najpierw karty w viewport, potem reszta w requestIdleCallback (fallback setTimeout), kawałki ≤ 8 ms na ramkę, kodowanie obrazu poza wątkiem głównym tam, gdzie się da (createImageBitmap / OffscreenCanvas jeśli dostępne, z fallbackiem). Cel: Lighthouse mobile static ≥ 95, TBT < 200 ms, LCP bez regresji. Pomiar przed/po (3 przebiegi, mediana) w devlogu i w tabeli README.
B5. Hero: Lock przez taste-guardrail i niwwts-aesthetic, kierunek przez awwwards-art-director. Hero ma pokazywać, co robi VITRINE (np. duży produkt NIWWTS w druku, który oddaje zdjęcie pod kursorem), a nie czarną płytę na rozmytym gradiencie. Mesh zostaje jako efekt, nie jako tło dla tła. To samo w docs/media/readme-hero.jpg.
B6. examples/next-headless: Archivo przez next/font/local z plikami w repo (licencja OFL w repo), żeby build działał bez sieci i w CI.
B7. Publiczne demo: GitHub Actions workflow publikujący examples/static na GitHub Pages po upublicznieniu repo (bez sekretów; build pakietu w workflow) oraz instrukcja Vercel dla Next. Nie wdrażaj sam. W README dwa linki: Live demo (static) i Headless demo (Next), na razie TODO z dokładną instrukcją.
B8. Checklist w STATUS: repo public, Pages, Vercel, npm publish (z poprawną kolejnością: najpierw repo public, potem publish, bo README paczki linkuje do repo).
Poza zakresem: nowe efekty, interakcje (Q1–Q3).

GOTOWE, GDY
- pnpm build (z next-headless bez sieci), typecheck, lint, test, test:e2e z kodem 0 (Chromium + WebKit; Firefox jak dotąd: napisz, czy ruszył).
- grep po repo nie znajduje zdań o strojeniu w Paper niezgodnych z process.md (pokaż komendę i wynik).
- Kontaktówka 12 kart przed/po (docs/media/q0-dither-before-after.png) i zrzuty strony 390/1440 (docs/media/q0-*.png), obejrzane i ocenione w devlogu Exit Checkiem.
- Lighthouse przed/po z B4 w devlogu i README.
Pokaż wynik każdej komendy, nie streszczenie.

WYNIK
docs/vitrine/devlog/Q0-blokery.md, STATUS (checklist B8), commity. Na końcu pięć linijek: co mam kliknąć, żeby repo i demo były publiczne, co pominąłeś.

DLA MODELU
- Zanim napiszesz kod: przeczytaj CLAUDE.md i wczytaj SKILLE OBOWIĄZKOWE. Brak skilla = napisz to wprost.
- Pracuj na gałęzi q0-blokery; nie merguj do main.
- Edytuj pliki punktowo. Trzymaj się ZAKRESU; usprawnienia spoza zadania wypisz na końcu.
- Każdy punkt GOTOWE, GDY udowadniasz wynikiem komendy albo plikiem.
```

**Bramka Q0 (Ty, telefon):** katalog wygląda jak druk, nie jak brud; hero od razu pokazuje, co to robi. Potem kroki ręczne 1.

---

## Q1 · Warstwa interakcji `bind` i reveal jako shader

```
Faza Q1 · VITRINE v0.2: atrybut bind (parametr shadera sterowany kursorem, scrollem, czasem i datą) oraz reveal-mode, w którym odsłonięcie zdjęcia jest animacją shadera, a nie przenikaniem.
SKILLE OBOWIĄZKOWE (wczytaj przed pierwszą linijką): architecture-guardian (publiczne API bind, zgodność wstecz), motion-design (choreografia reveal), test-engineer, a11y-gate, security-perf-auditor (budżet kontekstów i ramek), niwwts-aesthetic + taste-guardrail (wygląd przejść). Inne dobierz sam. W devlogu tabela: skill · po co · co zmienił w wyniku.

CEL I PO CO
Jedna warstwa interakcji mnoży wszystkie efekty: ten sam shader robi lupę pod kursorem, ożywa przy scrollu albo „schnie” do daty dropu. Do tego sygnaturowy moment całego projektu: druk na karcie nie znika przenikaniem, tylko się rozpada albo wywołuje w zdjęcie. To jest kadr do GIF-a w zgłoszeniu i do reelsa.

KONTEKST
- docs/vitrine/API.md, ADR-0001 (bake, pula), packages/element/src/{element,pool,baker,reveal,params}.ts, devlog Q0.
- Referencja upstream: ~/Desktop/Projects/_ref/paper-shaders (parametry i zakresy każdego shadera).

ZAKRES
I1. ADR-0002: bind i reveal-mode. Kontekst, decyzja, konsekwencje (efekt z bind jest żywy, więc wchodzi do puli), odrzucone (osobne komponenty per interakcja, globalny event bus).
I2. Atrybut bind (JSON) i odpowiednik w React/Liquid: { "<param>": { "source": "pointer-x" | "pointer-y" | "pointer-distance" | "scroll" | "time" | "date", "range": [a, b], "from"?, "to"?, "ease"? } }. pointer liczony względem elementu (także dotyk), scroll = postęp elementu przez viewport, date = okno from–to w ISO (np. drop). Walidacja zakresów z metadanych shadera; błędny bind = ostrzeżenie w trybie debug, efekt dalej działa bez bind.
I3. Żywotność: element z bind montuje się w puli dopiero przy pierwszej interakcji albo wejściu w viewport; po 2 s bez zmian bind „zamraża się” do bake; reduced motion = wartość końcowa bez animacji.
I4. reveal-mode="fade" (dziś, domyślny) | "dissolve" | "resolve": dissolve = rośnie rozmiar piksela/kropki aż druk się rozpada w zdjęcie; resolve = rośnie liczba tonów/kolorów aż druk wywołuje się w zdjęcie. Na czas przejścia jeden żywy kontekst zarezerwowany w puli (max 1 naraz), czas ≤ 450 ms, krzywa z motion-design, powrót odwrotny. reduced motion i brak WebGL2 = fade.
I5. Demo: karta wiodąca katalogu z reveal-mode="resolve", strona examples/static/interactions.html z trzema przykładami bind (pointer na halftone, scroll na mesh, date na paper z oknem dziś–za 7 dni).
I6. Testy: Vitest (parser bind, mapowanie zakresów, ease, okno date z udawanym zegarem), Playwright (pointer zmienia uniform, reveal-mode kończy się zdjęciem bez mrugnięcia, w puli max 1 kontekst przejścia, reduced motion = fade, klawiatura uruchamia reveal).
Poza zakresem: nowe efekty (Q2).

GOTOWE, GDY
- pnpm build, typecheck, lint, test, test:e2e z kodem 0.
- GIF-y ≤ 4 MB: docs/media/q1-reveal-dissolve.gif, q1-reveal-resolve.gif, q1-bind-pointer.gif; obejrzane i ocenione (Exit Check) w devlogu.
- Pomiar: koszt przejścia (czas ramki w trakcie reveal, Chrome Performance na Macu z CPU ×4) i stan kontekstów po 10 szybkich hoverach.
Pokaż wynik każdej komendy, nie streszczenie.

WYNIK
docs/vitrine/devlog/Q1-interakcje.md z „Momentami na content”, ADR-0002, API.md (sekcje bind i reveal-mode), STATUS, commity. Na końcu pięć linijek.

DLA MODELU
- Zanim napiszesz kod: przeczytaj CLAUDE.md i wczytaj SKILLE OBOWIĄZKOWE. Brak skilla = napisz to wprost.
- Pracuj na gałęzi q1-interakcje od main (po merge Q0); nie merguj.
- Edytuj pliki punktowo. Trzymaj się ZAKRESU; usprawnienia spoza zadania wypisz na końcu.
- Każdy punkt GOTOWE, GDY udowadniasz wynikiem komendy albo plikiem.
```

**Bramka Q1 (Ty, telefon):** tap na kartę — druk się rozpada w zdjęcie i to chcesz pokazać w reelsie. Jeśli wygląda jak efekt z PowerPointa, Q1.1.

---

## Q2 · Sześć efektów przy produkcie + playground

```
Faza Q2 · VITRINE v0.2: sześć nowych efektów przypiętych do momentów w sklepie (lupa, welon dropu, fala po dodaniu do koszyka, metal, druk kropkowy, żar) oraz strona playground z kopiowaniem kodu. Presety stroi Piotrek na płótnie Paper.
SKILLE OBOWIĄZKOWE (wczytaj przed pierwszą linijką): niwwts-aesthetic (arbiter presetów i playgroundu), taste-guardrail (Lock + Exit Check), piotrek-frontend-design (playground), motion-design, test-engineer, a11y-gate, security-perf-auditor. Inne dobierz sam. W devlogu tabela: skill · po co · co zmienił w wyniku.

CEL I PO CO
VITRINE ma się różnić od zwykłej kolekcji shaderów: każdy efekt ma swoje miejsce w ścieżce zakupu. Playground pozwala w minutę dobrać efekt na zdjęciach NIWWTS i skopiować gotowy Liquid, React albo HTML. To jest strona, którą wyślę do Codrops.

KONTEKST
- ADR-0001, ADR-0002, API.md, packages/element/src/effects/* (wzorzec: dither.ts + preset + test zgodności), presets/README.md, devlogi Q0–Q1.
- Referencja upstream: ~/Desktop/Projects/_ref/paper-shaders/packages/shaders-react/src/shaders/{lens-distortion,fluted-glass,water,liquid-metal,halftone-dots,heatmap}.tsx (mapowanie parametrów 1:1).

ZAKRES
E1. Sześć efektów, każdy jako moduł z presetem, testem zgodności pikseli z shaders-react (≤ 1 % różnych pikseli), klasyfikacją bake/live i rozmiarem gzip:
    - lens (lens-distortion): lupa na stronie produktu, środek z bind pointer; bez kursora = wypalony stan spoczynkowy.
    - glass (fluted-glass): welon „wkrótce / przedsprzedaż / wyprzedane”; z bind date czyści się do dnia dropu (NIWWTS No.06).
    - water (water): jednorazowa fala od punktu kliknięcia (np. przycisk Dodaj do koszyka przez zdarzenie vitrine:pulse z x/y), potem bake.
    - metal (liquid-metal): logo, odznaka, wyróżniony produkt; animowany w puli.
    - dots (halftone-dots): drugi druk kart, gazetowy.
    - heat (heatmap): poświata logo/odznaki „nowość”; jeśli niwwts-aesthetic powie nie, zamień na gem-smoke i uzasadnij.
E2. Presety: zrób w pliku Paper „VITRINE — presets” po ramce na efekt z warstwami shaderów Paper na zdjęciach NIWWTS (3 warianty). Zatrzymaj się i poproś mnie o strojenie (40 min). Po moim „gotowe” odczytaj wartości przez MCP (albo z eksportu kodu warstwy, jeśli MCP ich nie daje: wtedy poproś mnie o wklejenie do docs/vitrine/paper-export/). Dopiero wtedy process.md i teksty mogą mówić „tuned in Paper”, z dowodem.
E3. Playground (examples/static/playground.html i trasa /playground w next-headless): wybór efektu i presetu, suwaki z metadanych parametrów, wybór zdjęcia NIWWTS, podgląd na karcie i w hero, przełącznik bind/reveal-mode, przyciski „Copy Liquid / React / HTML” z dokładnym snippetem, stan w URL (udostępnialny link). Klawiatura i czytniki ekranu obsłużone. Wygląd: Lock taste-guardrail + niwwts-aesthetic przed pierwszą linijką, nie panel shadcn.
E4. React: wrappery dla nowych efektów (LensImageShader, DropVeilShader, …) z typami parametrów.
E5. Strona demo: każdy nowy efekt w swoim miejscu ścieżki (PDP z lupą, karta przedsprzedaży z welonem, przycisk z falą, logo z metalem); hero z Q0 bez zmian.
E6. Testy: zgodność 6 × 2 presety × Chromium + WebKit; playground generuje snippet, który wklejony do pustej strony daje ten sam obraz (test e2e); konteksty: strona demo po załadowaniu ≤ 2 żywe.
Poza zakresem: efekty tła (Q3), motyw w kawałkach (Q3).

GOTOWE, GDY
- pnpm build, typecheck, lint, test, test:e2e z kodem 0.
- Tabela rozmiarów gzip wszystkich 10 efektów; zrzuty playgroundu 390/1440 i GIF-y nowych efektów w docs/media/q2-*, obejrzane i ocenione Exit Checkiem.
- Dowód strojenia w Paper (zrzuty ramek + odczyt wartości) w process.md.
- submission.md zaktualizowany: 10 efektów, playground, interakcje; linki TODO tam, gdzie czekają na mnie.
Pokaż wynik każdej komendy, nie streszczenie.

WYNIK
docs/vitrine/devlog/Q2-efekty-produkt.md z „Momentami na content”, API.md, presets/*.json, process.md, submission.md, STATUS, commity. Na końcu pięć linijek: co mam kliknąć, żeby zgłosić v0.2.

DLA MODELU
- Zanim napiszesz kod: przeczytaj CLAUDE.md i wczytaj SKILLE OBOWIĄZKOWE. Brak skilla = napisz to wprost.
- Pracuj na gałęzi q2-efekty-produkt od main (po merge Q1); nie merguj.
- Mapowania parametrów przenoś z referencji 1:1. Przy E2 zatrzymaj się na strojenie i nie strój za mnie.
- Edytuj pliki punktowo. Trzymaj się ZAKRESU; usprawnienia spoza zadania wypisz na końcu.
- Każdy punkt GOTOWE, GDY udowadniasz wynikiem komendy albo plikiem.
```

**Bramka Q2 (Ty):** playground na telefonie — w minutę dobierasz efekt i kopiujesz Liquid. Potem: repo publiczne, demo, zgłoszenie v0.2.

---

## Q3 · Sześć efektów tła i UI + motyw w kawałkach

```
Faza Q3 · VITRINE v0.3: sześć efektów tła i interfejsu (op-art NIWWTS, ziarno w kolorach motywu, promienie dropu, pulsująca ramka CTA, szkielet ładowania) oraz plik motywu podzielony na kawałki.
SKILLE OBOWIĄZKOWE (wczytaj przed pierwszą linijką): niwwts-aesthetic (arbiter, szczególnie op-art), taste-guardrail, motion-design, test-engineer, a11y-gate, security-perf-auditor. Inne dobierz sam. W devlogu tabela: skill · po co · co zmienił w wyniku.

CEL I PO CO
Sklep to nie tylko zdjęcia: tła sekcji, przyciski, odznaki i stany ładowania też mogą być w świecie marki. Przy 16 efektach jeden plik motywu przestaje mieć sens, więc motyw ładuje tylko to, co jest użyte.

KONTEKST
- ADR-0001, ADR-0002, devlogi Q0–Q2, ROADMAP („Chunked vitrine.js”), shopify-theme/*.
- Referencja upstream: shaders-react/src/shaders/{pulsing-border,grain-gradient,god-rays,swirl,spiral,dot-grid,waves,dot-orbit}.tsx.

ZAKRES
T1. Efekty (moduł + preset + test zgodności + klasyfikacja bake/live): pulse (pulsing-border: CTA i odznaka „DROP LIVE”), grain (grain-gradient: tło sekcji z kolorów motywu), rays (god-rays: hero ogłoszenia dropu), opart (jeden z swirl / spiral / dot-grid / waves wybrany przez niwwts-aesthetic, czarno-biały, z bind scroll), skeleton (dot-orbit albo dot-grid: placeholder do czasu decode() obrazu, potem znika bez skoku układu). Szósty wybiera niwwts-aesthetic spośród pozostałych upstream; uzasadnij w devlogu.
T2. Liquid: sekcja „VITRINE background” (grain/rays/opart), blok „VITRINE badge” (pulse/metal/heat), wybór efektu kart w ustawieniach motywu (dither / dots / halftone + reveal-mode), welon dropu z datą z metapola produktu.
T3. Motyw w kawałkach: assets/vitrine.js jako loader + osobne pliki efektów w płaskim assets/, dynamiczny import obok asset_url (zweryfikuj na niwwts.myshopify.com, w tym parametr ?v=). Cel: strona tylko z kartami w ditheringu ≤ 22 KB gzip. Jeśli dynamiczny import nie działa na CDN, zostaw jeden plik i zapisz pomiar w ADR.
T4. React wrappery i playground: nowe efekty dostępne w obu.
T5. Testy jak w Q2 + theme check 0 błędów + test na dev store (proxy theme dev).
Poza zakresem: aplikacja Shopify (v2 z ROADMAP).

GOTOWE, GDY
- pnpm build, typecheck, lint, test, test:e2e, shopify theme check z kodem 0.
- Rozmiary gzip: loader + każdy efekt; strona tylko z ditheringiem zmierzona na dev store.
- Zrzuty i GIF-y docs/media/q3-*, Exit Check w devlogu.
Pokaż wynik każdej komendy, nie streszczenie.

WYNIK
docs/vitrine/devlog/Q3-efekty-tlo.md, ADR (kawałki motywu), shopify-theme/README.md, STATUS, commity. Na końcu pięć linijek.

DLA MODELU
- Zanim napiszesz kod: przeczytaj CLAUDE.md i wczytaj SKILLE OBOWIĄZKOWE. Brak skilla = napisz to wprost.
- Pracuj na gałęzi q3-efekty-tlo od main; nie merguj. Motyw tylko jako nieopublikowany na niwwts; zero sklepów klientów.
- Edytuj pliki punktowo. Trzymaj się ZAKRESU; usprawnienia spoza zadania wypisz na końcu.
- Każdy punkt GOTOWE, GDY udowadniasz wynikiem komendy albo plikiem.
```

**Bramka Q3 (Ty, edytor motywu):** tło sekcji, odznaka i karty zmieniasz z poziomu edytora; strona z kartami ładuje mniej niż dziś.

---

## Q4 · Pomiary, README, wydanie v0.3

```
Faza Q4 · VITRINE: przegląd, pełne pomiary, README v0.3 z GIF-ami wszystkich efektów, wydanie v0.3.0 (bez publikacji) i teksty aktualizacji.
SKILLE OBOWIĄZKOWE (wczytaj przed pierwszą linijką): code-reviewer, security-perf-auditor, web-copy (teksty EN), taste-guardrail (Exit Check README i demo). Inne dobierz sam. W devlogu tabela: skill · po co · co zmienił w wyniku.

ZAKRES
W1. code-reviewer na diffie main..q3 (wszystko od v0.1.0); krytyczne poprawki zrób, resztę do review.md.
W2. Pomiary jak w P1–P3 dla static, Next i Horizon: Lighthouse, konteksty, rozmiary; tabela w README tylko z tych liczb.
W3. README: siatka GIF-ów efektów (po jednym na efekt, ≤ 1 MB każdy), sekcja „Where each effect goes in a store”, link do playgroundu i demo.
W4. Wersja 0.3.0, CHANGELOG, npm publish --dry-run, zip motywu, tag lokalnie.
W5. submission.md: aktualizacja dla Codrops (v0.3 jako update do zgłoszenia v0.2), post na X i Discord Papera.
Poza zakresem: publikacja, push, wysyłka.

GOTOWE, GDY
- Wszystkie komendy z CLAUDE.md z kodem 0; skan sekretów czysty; dry-run pokazuje poprawny tarball.
Pokaż wynik każdej komendy, nie streszczenie.

WYNIK
docs/vitrine/devlog/Q4-wydanie.md, review.md, README, CHANGELOG, submission.md, STATUS, commity. Na końcu pięć linijek: co mam kliknąć, w jakiej kolejności.

DLA MODELU
- Zanim napiszesz kod: przeczytaj CLAUDE.md i wczytaj SKILLE OBOWIĄZKOWE. Brak skilla = napisz to wprost.
- Pracuj na gałęzi q4-wydanie; nie publikuj, nie pushuj, nie wysyłaj niczego.
- Każdy punkt GOTOWE, GDY udowadniasz wynikiem komendy albo plikiem.
```

**Bramka Q4 = v0.3:** publikujesz paczkę i wrzucasz update na X i do Codrops.
