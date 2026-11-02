# VITRINE · Q1 (po bramce R0) · prompt dla Claude Code

**Zastępuje:** PROMPTY-v02.md Q1–Q4 (wstrzymane od 29.10). Decyzja z bramki R0 (30.10.2026): do v0.2 wchodzą trzy efekty — szyba na karcie, szyba przedsprzedaży z datą, lupa. Reszta później albo odpada (raport-weryfikacji-R0.md §3).
**Czas:** 2 h 30 / 4 h 30 / 8 h → w kalendarzu 6 h 45. Model `/model fable`, effort high.
**Bramka Q1 (Ty, telefon):** karta za szybą, tap → szyba się rozsuwa i oddaje produkt; lupa na PDP; karta przedsprzedaży „matowieje do daty”. Chwalisz się tym? Jeśli nie, Q1.1.

```
Faza Q1 · VITRINE v0.2: trzy efekty z bramki R0 jako prawdziwa biblioteka (element, React, Liquid) i nowe demo „Store” wg KIERUNEK-v2.
SKILLE OBOWIĄZKOWE (wczytaj przed pierwszą linijką): taste-guardrail (Lock z docs/vitrine/KIERUNEK-v2.md, Exit Check na każdym zrzucie), awwwards-art-director (poprzeczka „czy sklep premium by to wypuścił”), motion-design (szyba: otwarcie/zamknięcie), architecture-guardian (publiczne API, zgodność wstecz z v0.1), test-engineer, a11y-gate, security-perf-auditor (pula kontekstów, budżet ramek, licencje zdjęć). niwwts-aesthetic NIE jest arbitrem. Inne dobierz sam. W devlogu tabela: skill · po co · co zmienił w wyniku.

CEL I PO CO
R0 dało pierwszy materiał, którym można się chwalić: szyba ryflowana, szyba przedsprzedaży i lupa. Teraz z makiety robimy bibliotekę, którą każdy sklep (Liquid i headless) wpina w kilka minut, i demo, które wyślę do Codrops. Mniej efektów, ale pięknych.

KONTEKST
- Repo ~/Desktop/Projects/vitrine. Przeczytaj CLAUDE.md, docs/vitrine/STATUS.md, KIERUNEK-v2.md, ADR-0001, ADR-0002 (w tym „Bramka R0 (30.10.2026)”), API.md, devlog R0-kierunek.md.
- Skopiuj do docs/vitrine/ (cp, bez zmian treści): "$HOME/Documents/Claude/Projects/Oszi Daily Assistant/vitrine/raport-weryfikacji-R0.md" i ten plik (PROMPT-Q1.md). Przeczytaj raport w całości.
- Źródło prawdy wyglądu i ruchu: examples/r0/effects.js (presety fluted-glass A „Window”, pre-order, lens A „Loupe”, scale 1.06), examples/static/r0-hero.html (otwarcie 520 ms, zamknięcie 380 ms, gap 420/640 ms, bez overshoot), arkusze docs/media/r0-*.webp + .json.
- Silnik: packages/element/src/{element,pool,baker,reveal,params}.ts i effects/* (wzorzec modułu + preset + test zgodności). Referencja upstream: ~/Desktop/Projects/_ref/paper-shaders/packages/shaders-react/src/shaders/{fluted-glass,lens-distortion}.tsx — mapowanie parametrów 1:1.
- Gałąź: q1-trzy-efekty. Jeśli r0-kierunek jest już w main, od main; jeśli nie, od r0-kierunek (merge robię ja) — zapisz w devlogu, od czego wyszedłeś.

ZAKRES
G0. Poprawki z raportu R0 §4: (1) STATUS.md:3 i :20 — zapis zgodny z faktami (bramka Cowork 30.10, raport w docs/vitrine/); (2) 06-watch: znak „CURREN” czytelny w lupie — zamień na zegarek bez czytelnego znaku (Unsplash/Pexels/CC0, nowa pozycja w CREDITS.md) albo usuń z demo; (3) 08-headphones: rozpoznawalny design (AirPods Max) — zamień na słuchawki bez rozpoznawalnego wzoru; (4) r0-hero.html:49 fallback 'Archivo', sans-serif. Nowe zdjęcia przez ten sam pipeline (1600/w1000/w640 WebP, bez EXIF/XMP/ICC).
G1. ADR-0003 „v0.2 = trzy efekty”: kontekst (bramka R0), decyzja, odrzucone (dissolve/resolve, dither jako domyślny, 6 efektów z PROMPTY-v02 Q2), konsekwencje (co staje się live, a co bake). W PROMPTY-v02.md jedna linia na górze: „Q1–Q4 zastąpione przez PROMPT-Q1.md i ADR-0003”.
G2. Efekt `glass` (fluted-glass) w packages/element: preset „window” z effects.js 1:1. Spoczynek = wypalony bake (0 żywych kontekstów). Odsłonięcie: hover, tap, Enter/Space na fokusowalnej karcie → animacja parametru szyby z czasami z makiety; na czas przejścia jeden żywy kontekst z puli (max 1 naraz), po zamknięciu powrót do bake. prefers-reduced-motion = stan końcowy bez animacji. Brak WebGL2 = czyste zdjęcie (nigdy pusta karta). Atrybut reveal="hover|tap|none" (domyślnie hover + tap).
G3. Przedsprzedaż: ten sam efekt z bind date: { from, to } w ISO; siła szyby maleje do dnia premiery wg wartości z arkusza R0 (30 → 7 → 1 dzień → czysto). Bez animacji w czasie: wartość liczona przy montażu i wypalana. W Liquid data z metapola produktu (namespace i klucz zaproponuj w ADR-0003).
G4. Efekt `lens` (lens-distortion): preset „loupe”, środek z bind pointer (mysz i dotyk przez przytrzymanie), bez wskaźnika = czyste zdjęcie bez kontekstu. Lupa jest ozdobą: alt i obraz zostają dostępne, zero pułapek fokusu.
G5. API (jedno źródło dla trzech wejść): atrybuty elementu, wrappery React (np. GlassProductImage, PreorderGlassImage, LoupeImage — nazwy uzasadnij w ADR) z typami parametrów, snippety Liquid (karta, karta przedsprzedaży, PDP z lupą) w shopify-theme/. API.md z przykładami dla każdego. v0.1 (dither/halftone/mesh) dalej działa — zgodność wstecz testem.
G6. Demo „Store” wg Locka KIERUNEK-v2 (papier #EFEBE4, tusz #141312, Archivo, zero akcentu, jedna sygnatura = szyba): examples/static/index.html — hero (produkt za szybą), katalog 12 produktów w 3 kolumnach o różnych wysokościach, karta przedsprzedaży z datą, PDP z lupą; stopka z kredytem zdjęć i „Powered by Paper Shaders”. Stare demo NIWWTS znika z demo (fixtures NIWWTS zostają tylko w testach zgodności). Te same trzy momenty w examples/next-headless. Popraw „beż na beżu” z Exit Checku R0 (kontrast produktu w spoczynku).
G7. Testy: Vitest (preset 1:1 z effects.js, krzywa siły od daty z udawanym zegarem, parser bind); zgodność pikseli glass i lens z shaders-react ≤ 1 % różnych pikseli (Chromium + WebKit); Playwright (hover/tap/klawiatura otwierają szybę, 10 szybkich hoverów → max 1 żywy kontekst przejścia i 0 po 2 s, reduced motion, brak WebGL2 → zdjęcie, lupa podąża za wskaźnikiem); axe na demo 390 i 1440.
Poza zakresem: water, grain-gradient i reszta z R0 „później”, playground, upublicznienie repo, npm publish, Vercel, Pages.

GOTOWE, GDY
- pnpm build, typecheck, lint, test, test:e2e z kodem 0 (pokaż wyniki; Firefox — napisz, czy ruszył).
- Zrzuty docs/media/q1-*.webp (390 i 1440: hero, katalog, przedsprzedaż, PDP) i klipy MP4/GIF ≤ 2 MB (szyba, lupa), każdy obejrzany i oceniony Exit Checkiem w devlogu; .gitignore jak w R0 (ciężkie PNG/GIF poza gitem).
- Pomiary (mediana z 3): Lighthouse mobile static (cel ≥ 95, TBT < 200 ms), czas ramki w trakcie otwierania szyby (Chrome, CPU ×4), liczba kontekstów po załadowaniu (≤ 1) — tylko liczby z pomiaru.
- CREDITS.md kompletny po zamianach z G0; git grep nie znajduje zdjęć klientów ani NIWWTS w examples/.
Pokaż wynik każdej komendy, nie streszczenie.

WYNIK
docs/vitrine/devlog/Q1-trzy-efekty.md z „Momentami na content” (kadry do reelsa), ADR-0003, API.md, STATUS.md, commity. Na końcu pięć linijek: co obejrzeć na telefonie (komenda + adres), co świadomie pominąłeś, co blokuje upublicznienie.

DLA MODELU
- Zanim napiszesz kod: przeczytaj CLAUDE.md, KIERUNEK-v2.md i raport R0; wczytaj SKILLE OBOWIĄZKOWE. Brak skilla = napisz to wprost.
- Pracuj na gałęzi q1-trzy-efekty; nie merguj, nie pushuj, nie wdrażaj niczego.
- Wartości presetów i czasy ruchu przenoś z R0 1:1; jeśli coś zmieniasz, zapisz przed/po z powodem.
- Edytuj pliki punktowo. Trzymaj się ZAKRESU; usprawnienia spoza zadania wypisz na końcu.
- Każdy punkt GOTOWE, GDY udowadniasz wynikiem komendy albo plikiem.
```
