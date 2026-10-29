# VITRINE · prompty dla Claude Code (P0–P5)

**Repo:** `~/Desktop/Projects/vitrine` (nowe, zakłada je P0)
**Folder planowania:** `~/Documents/Claude/Projects/Oszi Daily Assistant/vitrine/` (PLAN.md + ten plik). P0 kopiuje go do `docs/vitrine/`.

**Jak używać:**
- Przy P0: otwórz terminal w `~/Desktop/Projects`, wpisz `claude` i powiedz: „znajdź PROMPTY.md w folderze Oszi Daily Assistant/vitrine i zrób P0”. Od P1 w folderze repo: „znajdź docs/vitrine/PROMPTY.md i zrób fazę Px”.
- Jedna faza = świeża sesja (`/clear`). Stan niesie repo: `docs/vitrine/`, ADR-y, devlogi, `docs/vitrine/STATUS.md`.
- Bramkę sprawdzasz, zanim odpalisz następną fazę. Niezaliczona = faza Px.1.

**Ustawienia:**
- **Model:** `/model fable`. Prompty są pod niego: efekt zamiast kroków, jasne granice, sekcja DLA MODELU.
- **Effort:** `high` w P0 (spiki decydują o architekturze) i P1 (rdzeń). Reszta `medium`.
- **Inny model:** na Opusie zostaw DLA MODELU. Na Sonnecie dopisz: „Zadanie ma kilka części. Zrób wszystkie i nie zatrzymuj się po pierwszej z pytaniem o zgodę.”

**Skille — zasada stała (zapisana też w CLAUDE.md repo, które zakłada P0):**
- Każda faza ma listę **OBOWIĄZKOWYCH** skilli. Agent wczytuje je, zanim napisze pierwszą linijkę, i może dołożyć inne. Brak skilla w środowisku = mówi to wprost i zapisuje w devlogu, nigdy nie pomija po cichu.
- Każdy devlog ma tabelę **Skill · po co · co zmienił w wyniku**. Pusta kolumna „co zmienił” = skill był tylko z nazwy.
- **Wszystko wizualne** (strona demo, domyślne presety, wygląd sekcji, README z GIF-ami): `taste-guardrail` Lock **przed** buildem i Exit Check **przed** oddaniem + art direction (`awwwards-art-director` albo `piotrek-frontend-design`) przed pierwszą ramką/linijką.
- **Gałęzie:** każda faza na własnej gałęzi `pN-nazwa`; merge do `main` dopiero po Twojej bramce.

**Pierwszy efekt do pokazania po P1** (statyczna strona z siatką produktów w ditheringu). Zgłoszenie do Codrops po P5.

## Czasy

Szacunki z podobnych faz (KOLAŻ, OŻYW, sklepy Shopify), nie pomiar. „W kalendarzu” = realny + 50 %.

| Faza | Najlepszy / realny / najgorszy | W kalendarzu |
|---|---|---|
| P0 fundament + 4 spiki | 1 h 30 / 3 h / 5 h | 4 h 30 |
| P1 element `<vitrine-shader>` | 2 h 30 / 4 h / 7 h | 6 h |
| P2 motyw Liquid + demo statyczne | 2 h / 3 h 30 / 6 h | 5 h 15 |
| P3 headless Next.js | 2 h / 3 h 30 / 6 h | 5 h 15 |
| P4 Paper: presety, strona demo, README | 2 h / 3 h 30 / 6 h | 5 h 15 + 40 min strojenia w Paper (Ty) |
| P5 przegląd, wydanie, zgłoszenie | 1 h / 2 h / 3 h | 3 h |
| **Razem** | **ok. 19 h 30 realnie** | **ok. 30 h** |

**Kroki, o których się zapomina:** Paper Desktop musi być uruchomiony, żeby MCP działał · `shopify auth` wygasa (logowanie przed P2) · dev store ma stronę z hasłem (demo publiczne idzie przez Vercel i HTML) · cache CORS w przeglądarce przy testach (twardy reload / nowa karta incognito) · 2FA do npm przy publikacji · przeczytanie devloga poprzedniej fazy (5 min).

## Co robisz ręcznie

1. **Przed P0:** zainstaluj Paper Desktop, załóż konto, w panelu MCP podłącz Claude Code jednym klikiem (docs: paper.design → MCP). Sprawdź w terminalu, że `claude mcp list` pokazuje Paper.
2. **Przed P2:** w Shopify Partners nowy dev store `vitrine-demo` z przykładowymi produktami (opcja „start with test data”), potem `shopify auth login` w terminalu.
3. **Przed P3:** w dev store kanał **Headless** → publiczny token Storefront API. Domenę sklepu i token wpiszesz do `examples/next-headless/.env.local` (P3 podpowie nazwy zmiennych).
4. **W P4 (40 min):** strojenie presetów w Paper na swoich zdjęciach. Werdykt jednym zdaniem: „druk czy filtr z Instagrama?”.
5. **Po P5:** decyzja o publikacji na npm i upublicznieniu repo; wysłanie zgłoszenia (teksty przygotuje P5).

---

## P0 · Fundament: repo, licencje, ADR, cztery spiki

```
Faza P0 · VITRINE: nowe repo, monorepo, przypięcie Paper Shaders, licencje, ADR-0001, CLAUDE.md i cztery spiki techniczne, które decydują o architekturze.
SKILLE OBOWIĄZKOWE (wczytaj przed pierwszą linijką): architecture-guardian (ADR, granice paczek), security-perf-auditor (spiki kontekstów WebGL i CORS), test-engineer (szkielet testów). Inne dobierz sam. W devlogu tabela: skill · po co · co zmienił w wyniku.

CEL I PO CO
Robię open-source'owy most między Paper Shaders a sklepami Shopify: Custom Element <vitrine-shader> działający w motywach Liquid i w headless Next.js. Cel: wpis w przewodniku Codrops „Paper, Curated” i materiał do sprzedaży moich usług e-commerce. Pełny plan: PLAN.md (decyzje D1–D12 są ustalone). Ta faza stawia repo i sprawdza pomiarem cztery założenia, na których stoi reszta. Jeśli któreś padnie, zapisujesz to w ADR i zatrzymujesz się przed P1.

KONTEKST
- Utwórz ~/Desktop/Projects/vitrine (git init, gałąź main). Skopiuj folder "$HOME/Documents/Claude/Projects/Oszi Daily Assistant/vitrine" do docs/vitrine/ bez zmian. Przeczytaj docs/vitrine/PLAN.md w całości.
- Źródło: github.com/paper-design/shaders. Sklonuj je obok (~/Desktop/Projects/_ref/paper-shaders, poza repo VITRINE) jako referencję. Przeczytaj README, LICENSE, NOTICE, CHANGELOG, packages/shaders/src/shader-mount.ts (konstruktor, kiedy renderuje pierwszą klatkę, IntersectionObserver, dispose), packages/shaders/src/index.ts i packages/shaders-react/src/shaders/{image-dithering,halftone-cmyk,mesh-gradient,paper-texture}.tsx (mapowanie parametrów na uniformy).
- Wersja w PLAN: 0.0.82 (stan 29.10.2026). Sprawdź npm view @paper-design/shaders version. Jeśli jest nowsza: przeczytaj CHANGELOG od 0.0.82, wybierz wersję i uzasadnij w ADR. Zawsze dokładny pin, bez ^ i ~.

ZAKRES
Z1. Monorepo: pnpm workspaces (jeśli pnpm nie jest zainstalowany, npm workspaces; zapisz wybór). Paczki packages/element i packages/react (puste szkielety z build przez tsup albo vite lib mode, ESM, typy), folder presets/, shopify-theme/, examples/static/, examples/spikes/. TypeScript strict, Vitest, Playwright (chromium, webkit, firefox), ESLint + Prettier. Skrypty: build, test, test:e2e, typecheck, lint.
Z2. Licencje: LICENSE Apache-2.0 dla VITRINE (właściciel: Piotr Filipecki), kopia LICENSE i NOTICE Papera w third_party/paper-shaders/ + wpis w NOTICE VITRINE. README szkic (EN, 10 linijek) z „Powered by Paper Shaders”.
Z3. docs/adr/0001-architektura.md: jeden runtime jako Custom Element na paczce vanilla (D1), obraz zawsze pod spodem (D4), budżet kontekstów: bake + pula (D3), dystrybucja v1/v2 (D12). Kontekst, decyzja, konsekwencje, odrzucone (osobne implementacje dla Liquid i React, zależność od shaders-react w runtime, theme app extension w v1).
Z4. Spike A · BAKE (examples/spikes/bake.html + test Playwright): image-dithering ze speed 0 i webGlContextAttributes { preserveDrawingBuffer: true } na zdjęciu z examples/spikes/fixtures/. Po pierwszej wyrenderowanej klatce (ustal z kodu shader-mount, kiedy to jest; nie zgaduj timeoutem, jeśli da się czekać na zdarzenie lub requestAnimationFrame) canvas → toBlob → <img>, potem dispose(). Zmierz: czy obraz po bake jest niepusty i zgodny z renderem na żywo (diff pikseli), czas bake, czy kontekst jest naprawdę zwolniony. Trzy przeglądarki.
Z5. Spike B · KONTEKSTY (examples/spikes/contexts.html): 24 żywe ShaderMount naraz. Policz zdarzenia webglcontextlost w każdej przeglądarce. Potem ta sama siatka z bake z Z4: 0 żywych kontekstów po wypaleniu. Potem pula N=6 dla animowanego mesh-gradient przy przewijaniu.
Z6. Spike C · CORS (uruchom na moim Macu, curl): nagłówki Access-Control-Allow-Origin dla obrazu produktu z (a) https://cdn.shopify.com/... i (b) https://<domena sklepu>/cdn/shop/files/... Weź obraz z publicznej strony dowolnego mojego sklepu (emwuhats.pl albo friendzstore.pl): otwórz stronę produktu, znajdź URL obrazu w HTML. Wyślij nagłówek Origin: https://example.com. Potem w Playwright: obraz z crossOrigin="anonymous" jako tekstura (czy canvas nie jest „tainted”). Wynik do ADR.
Z7. Spike D · MOTYW: ustal z dokumentacji shopify.dev, jaki jest dziś domyślny motyw Shopify (Horizon czy Dawn) i jak wygląda w nim snippet karty produktu (nazwa pliku, gdzie jest <img>). Jeśli masz Shopify Dev MCP albo da się go dodać (npm view @shopify/dev-mcp), użyj go. Wynik do devloga jako wejście do P2.
Z8. Nazwa: npm view vitrine-shaders (ma być wolna) i sprawdź github.com/<moje konto>/vitrine. Zapisz w STATUS.
Z9. CLAUDE.md w korzeniu repo (krótki, czytany przez każdą kolejną sesję): cel projektu w 2 zdaniach, gdzie leżą PLAN/PROMPTY/ADR/STATUS, zasada skilli z nagłówka PROMPTY.md (obowiązkowe przed kodem, tabela w devlogu, anty-slop dla wszystkiego wizualnego: taste-guardrail Lock + Exit Check, art direction przez awwwards-art-director albo piotrek-frontend-design), gałąź na fazę, dokładne piny wersji, LICENSE/NOTICE Papera nietykalne, komendy build/test/lint.
Poza zakresem: implementacja elementu (P1), pliki Liquid (P2).

GOTOWE, GDY
- pnpm build, typecheck, lint, test z kodem 0 (pokaż końcówki wyników).
- Wyniki spików A–D w docs/vitrine/devlog/P0-spiki.md jako tabele z liczbami i plikami dowodów (zrzuty diffów do docs/media/p0-*.png).
- ADR-0001 ma sekcję „Co pokazały spiki”. Jeśli bake (A) albo CORS (C) nie działa, ADR ma plan B z PLAN §6, a STATUS mówi wprost: „zatrzymane przed P1, decyzja Piotrka”.
Pokaż wynik każdej komendy, nie streszczenie.

WYNIK
docs/vitrine/devlog/P0-spiki.md, docs/vitrine/STATUS.md, ADR-0001, commity w sensownych krokach. Na końcu pięć linijek: czy architektura z PLAN się broni, co pominąłeś, kroki ręczne.

DLA MODELU
- Edytuj pliki punktowo, nie przepisuj całych.
- Trzymaj się ZAKRESU. Błędy i usprawnienia spoza zadania wypisz na końcu, nie naprawiaj ich teraz.
- Decyzje z PLAN.md są ustalone. Jeśli pomiar im przeczy, dopisz to do ADR jako propozycję zamiast cicho zmieniać.
- Liczby tylko z pomiarów. Czego nie dało się zmierzyć, piszesz „niezmierzone”.
- Każdy punkt GOTOWE, GDY udowadniasz wynikiem komendy albo plikiem.
```

**Bramka P0:** bake i CORS potwierdzone pomiarem. Jeśli nie: czytasz plan B w ADR i decydujesz, czy idziemy dalej.

---

## P1 · Element `<vitrine-shader>`

```
Faza P1 · VITRINE: Custom Element <vitrine-shader> z czterema efektami, bake, pulą kontekstów, reduced motion i odsłonięciem na hover/focus.
SKILLE OBOWIĄZKOWE (wczytaj przed pierwszą linijką): architecture-guardian (API publiczne), test-engineer, a11y-gate, security-perf-auditor (wydajność, konteksty), motion-design (przejście odsłonięcia), taste-guardrail (Lock przed stroną examples/static, Exit Check przed oddaniem) + piotrek-frontend-design (wygląd strony testowej). Inne dobierz sam. W devlogu tabela: skill · po co · co zmienił w wyniku.

CEL I PO CO
To jest serce projektu. Jeden element, który działa w Liquid, czystym HTML i React 19. Bez JS widać zwykłe zdjęcie, z JS zdjęcie zamienia się w druk (dithering, halftone), papier albo gradient. Siatka 24 produktów nie może zabić kontekstów WebGL ani LCP.

KONTEKST
- docs/vitrine/PLAN.md (D1–D6, §5 bramki), ADR-0001 i devlog P0 (wyniki spików są wiążące).
- Referencja: ~/Desktop/Projects/_ref/paper-shaders, zwłaszcza shaders-react/src/shaders/{image-dithering,halftone-cmyk,mesh-gradient,paper-texture}.tsx i shaders-react/src/shader-mount.tsx (jak React łączy parametry, sizing i obraz).

ZAKRES
E1. API (zapisz w docs/vitrine/API.md, EN):
    <vitrine-shader effect="dither|halftone|mesh|paper" preset="..." params='{"...":...}' reveal="hover|none" speed="0">
      <img src="..." alt="..." width="..." height="...">   (dla efektów na obrazie)
    </vitrine-shader>
    Dziecko <img> jest treścią i fallbackiem. Canvas nad nim, aria-hidden, bez przesunięcia układu (aspect-ratio z width/height). Zdarzenia: vitrine:ready, vitrine:fallback (z powodem: no-webgl2, cors, error).
E2. Mapowania parametrów → uniformy dla 4 shaderów, przeniesione z referencji React (kolory przez getShaderColorFromString, sizing, tekstura szumu tam, gdzie jest potrzebna). Każdy efekt jako osobny moduł ładowany dynamicznym importem, żeby strona ładowała tylko użyte fragment shadery.
E3. Presety jako dane: presets/*.json (na start presety „Default” z referencji + po jednym własnym na efekt; P4 je podmieni na wersje z Paper). Ten sam format będzie czytany przez Liquid i React.
E4. Bake dla speed 0 (metoda z P0) z cache w pamięci po (src + hash parametrów + rozmiar w px urządzenia). Pula dla animowanych: max N żywych (domyślnie 6, atrybut globalny lub VitrineShader.config({ maxLive })), LRU, montaż przy wejściu w viewport, dispose po wyjściu. Ponowny bake po zmianie rozmiaru (ResizeObserver, debounce).
E5. reveal="hover": hover na najbliższym linku/karcie (closest('a, [data-vitrine-card]')) i :focus-within odsłaniają zdjęcie (przejście ≤ 400 ms, krzywa w CSS custom property). prefers-reduced-motion: speed 0 i odsłonięcie bez animacji (natychmiast).
E6. Fallbacki: brak WebGL2, obraz bez CORS, błąd kompilacji shadera → zostaje zdjęcie, zdarzenie vitrine:fallback, jedno ostrzeżenie w konsoli tylko w trybie debug (atrybut debug).
E7. examples/static/index.html: siatka 24 produktów (fixtures z P0) w ditheringu z reveal, hero mesh, obraz w paper-texture. Serwowany lokalnie bez bundlera (import z dist).
E8. Testy: Vitest (mapowania: kolory, zakresy, presety; cache; pula LRU), Playwright × 3 przeglądarki: zgodność pikseli z @paper-design/shaders-react (devDependency, ten sam pin) dla 4 efektów × 2 presety ≤ 1 % różnych pikseli; siatka 24 = 0 webglcontextlost i 0 żywych kontekstów po bake; klawiatura (Tab) odsłania zdjęcie; reduced motion; fallback po zablokowaniu CORS (route w Playwright).
Poza zakresem: Liquid (P2), React wrappery (P3).

GOTOWE, GDY
- pnpm build, typecheck, lint, test, test:e2e z kodem 0.
- Rozmiary: rdzeń i każdy efekt osobno (gzip), tabela w devlogu.
- Zrzuty examples/static w 390 i 1440 px do docs/media/p1-*.png, obejrzane i opisane w devlogu (czy dither wygląda jak druk, czy krawędzie kart są ostre, czy reveal nie mruga).
- Pomiar: czas od DOMContentLoaded do wypalenia 24 kart na Macu (Chrome) i LCP strony statycznej z efektami vs bez (Lighthouse, 3 przebiegi, mediana).
Pokaż wynik każdej komendy, nie streszczenie.

WYNIK
docs/vitrine/devlog/P1-element.md z „Momentami na content” (karta produktu przechodzi z druku w kolor na hover), docs/vitrine/API.md, STATUS, commity. Na końcu pięć linijek: jak wpiąć element w dowolną stronę w 3 linijkach, co pominąłeś.

DLA MODELU
- Edytuj pliki punktowo, nie przepisuj całych.
- Trzymaj się ZAKRESU; usprawnienia spoza zadania wypisz na końcu.
- Mapowania przenoś z referencji 1:1; nie wymyślaj parametrów. Każda rozbieżność z React to błąd, dopóki test zgodności nie pokaże inaczej.
- Każdy punkt GOTOWE, GDY udowadniasz wynikiem komendy albo plikiem.
```

**Bramka P1:** strona statyczna na telefonie — siatka w ditheringu, tap/hover odsłania zdjęcie, nic nie mruga. Twój werdykt: „druk czy filtr?”.

---

## P2 · Motyw Liquid + demo statyczne

```
Faza P2 · VITRINE: pliki do motywu Shopify (Online Store 2.0) — sekcje, snippet karty produktu, jeden plik JS w assets — i test na dev store w edytorze motywu.
SKILLE OBOWIĄZKOWE (wczytaj przed pierwszą linijką): test-engineer, a11y-gate, security-perf-auditor, taste-guardrail (Lock przed domyślnymi ustawieniami i presetami sekcji, Exit Check przed oddaniem). Shopify Dev MCP, jeśli działa od P0, do walidacji schematów. Inne dobierz sam. W devlogu tabela: skill · po co · co zmienił w wyniku.

CEL I PO CO
Developer Shopify kopiuje folder do motywu i w 10 minut ma: hero z gradientem, sekcję edytorską z papierem i karty produktów w ditheringu. Sprzedawca stroi kolory i suwaki w edytorze motywu, bez kodu. To jest główna wartość dla przewodnika Codrops, bo dla Shopify nikt jeszcze tego nie zrobił.

KONTEKST
- docs/vitrine/PLAN.md D7, D9, D12; devlogi P0 (Spike D: domyślny motyw i snippet karty) i P1; docs/vitrine/API.md.
- Dev store vitrine-demo (zalogowany przez shopify auth). Najpierw sklonuj domyślny motyw (shopify theme pull z dev store albo init wg wyniku Spike D) do examples/theme-test/ (ignorowany w git, poza jednym README z instrukcją).

ZAKRES
L1. shopify-theme/assets/vitrine.js (+ moduły efektów jako osobne pliki w assets, jeśli dynamiczny import z tego samego folderu CDN działa; sprawdź na dev store, nie zakładaj). Nagłówek pliku z licencją VITRINE i NOTICE Papera.
L2. shopify-theme/sections/vitrine-hero.liquid (mesh: kolory z color pickerów, suwaki ruchu i skali, bloki: nagłówek, tekst, przycisk), sections/vitrine-editorial.liquid (paper-texture na image_picker + tekst; ustawienia zagięć, ziarna, kąta światła). schema z presets dla obu sekcji, opisy ustawień EN.
L3. shopify-theme/snippets/vitrine-card-media.liquid: owija obraz karty produktu (image_url z width i srcset, alt z obrazu, width/height) w <vitrine-shader effect="dither|halftone" reveal="hover">. Ustawienia efektu dla kart w settings motywu (config/settings_schema fragment w README do wklejenia, bo nie nadpisujemy cudzego settings_schema).
L4. Ładowanie JS tylko tam, gdzie efekt jest użyty (sekcje dodają <script type="module" src="{{ 'vitrine.js' | asset_url }}">; dedup, żeby skrypt nie ładował się dwa razy).
L5. Edytor motywu: dodanie, usunięcie, zmiana ustawień i przeciąganie sekcji nie zostawia żywych kontekstów ani duplikatów (custom element i zdarzenia shopify:section:load/unload — zweryfikuj ręcznie i opisz w devlogu kroki testu).
L6. shopify-theme/README.md (EN): instalacja (kopiowanie, shopify theme push na motyw nieopublikowany), wpięcie snippetu w kartę w domyślnym motywie (dokładny plik i linijka z Spike D), ustawienia, ograniczenia (CORS, WebGL2, wydajność).
L7. examples/static/: druga strona theme-markup.html z identycznym markupem, jaki generują sekcje (do publicznego demo, bo dev store ma hasło).
L8. Testy: shopify theme check na shopify-theme/ (0 błędów; ostrzeżenia wypisane), Playwright na theme-markup.html (te same asercje co P1: konteksty, klawiatura, reduced motion).
Poza zakresem: theme app extension (v2), headless (P3).

GOTOWE, GDY
- shopify theme check, pnpm test, test:e2e z kodem 0 (pokaż wyniki).
- Motyw testowy z VITRINE wypchnięty na dev store jako nieopublikowany; link podglądu w devlogu; zrzuty edytora motywu z ustawieniami sekcji i strony kolekcji z kartami do docs/media/p2-*.png, obejrzane i opisane.
- Lighthouse mobile strony kolekcji (podgląd dev store): z VITRINE vs bez, LCP i CLS, mediana z 3.
Pokaż wynik każdej komendy, nie streszczenie.

WYNIK
docs/vitrine/devlog/P2-liquid.md z „Momentami na content” (zmiana koloru gradientu suwakiem w edytorze na żywo), STATUS, commity. Na końcu pięć linijek: jak zainstalować w 10 minut, co pominąłeś, kroki ręczne.

DLA MODELU
- Edytuj pliki punktowo, nie przepisuj całych.
- Trzymaj się ZAKRESU; usprawnienia spoza zadania wypisz na końcu.
- Nie publikuj motywu (tylko nieopublikowany) i nie zmieniaj ustawień sklepu.
- Każdy punkt GOTOWE, GDY udowadniasz wynikiem komendy albo plikiem.
```

**Bramka P2:** w edytorze motywu zmieniasz kolory hero i wygląd kart bez dotykania kodu, a strona kolekcji na telefonie działa płynnie.

---

## P3 · Headless Next.js

```
Faza P3 · VITRINE: paczka React (wrappery na element) i przykład headless Next.js 16 ze Storefront API, gotowy do wdrożenia jako publiczne demo.
SKILLE OBOWIĄZKOWE (wczytaj przed pierwszą linijką): react-next-perf, a11y-gate, test-engineer, security-perf-auditor (token Storefront API), taste-guardrail (Lock przed wyglądem przykładu, Exit Check przed oddaniem). Inne dobierz sam. W devlogu tabela: skill · po co · co zmienił w wyniku.

CEL I PO CO
Robię też sklepy headless (Next.js + Shopify). Developer instaluje vitrine-shaders, wstawia <ProductMediaShader image={product.featuredImage} /> i dostaje ten sam efekt co w Liquid, renderowany po stronie serwera jako zwykły obraz, wzbogacony po hydracji. To jest też publiczne demo do zgłoszenia.

KONTEKST
- docs/vitrine/PLAN.md D8, D9; devlogi P1–P2; docs/vitrine/API.md.
- Next.js 16 App Router, React 19 (custom elements z właściwościami). Sprawdź wersje przez npm view i przypnij dokładnie.

ZAKRES
R1. packages/react: <ProductMediaShader>, <CollectionHeroShader>, <EditorialImageShader> ('use client'). Props typowane, obraz w kształcie Storefront API (url, altText, width, height). Renderują <vitrine-shader> z dzieckiem <img> albo next/image (opcja), więc HTML z serwera to działający obraz bez JS. Rejestracja elementu przy pierwszym imporcie po stronie klienta. Typy JSX dla vitrine-shader.
R2. examples/next-headless: strona główna (hero mesh, siatka 24 produktów w ditheringu, sekcja edytorska z paper-texture), strona produktu /products/[handle]. Dane ze Storefront API w Server Components (fetch z revalidate); bez env działa na fixtures z repo i mówi o tym w stopce. .env.example z nazwami zmiennych, token tylko publiczny Storefront API.
R3. Wydajność: LCP to obraz (priority dla hero/pierwszego rzędu), canvas montowany po load, brak przesunięć. Lighthouse mobile (build produkcyjny lokalnie, 3 przebiegi, mediana): wersja z VITRINE vs bez (flaga ?vitrine=off).
R4. Konfiguracja wdrożenia na Vercel (vercel.json tylko jeśli potrzebny) i instrukcja w README przykładu. Nie wdrażaj sam.
R5. Testy: Vitest dla wrapperów (render serwerowy daje <img> z alt i wymiarami), Playwright na buildzie produkcyjnym (konteksty, klawiatura, reduced motion, brak błędów hydracji w konsoli).
Poza zakresem: koszyk, checkout, wyszukiwarka.

GOTOWE, GDY
- pnpm build (z przykładem), typecheck, lint, test, test:e2e z kodem 0.
- Lighthouse z R3 w devlogu; zrzuty 390 i 1440 do docs/media/p3-*.png, obejrzane i opisane.
- Przykład działa w dwóch trybach: fixtures i dev store (jeśli .env.local jest uzupełniony; jeśli nie, napisz to wprost).
Pokaż wynik każdej komendy, nie streszczenie.

WYNIK
docs/vitrine/devlog/P3-headless.md z „Momentami na content”, STATUS, commity. Na końcu pięć linijek: jak dodać do istniejącego sklepu headless, co pominąłeś, kroki ręczne (Vercel, env).

DLA MODELU
- Edytuj pliki punktowo, nie przepisuj całych.
- Trzymaj się ZAKRESU; usprawnienia spoza zadania wypisz na końcu.
- Żadnych sekretów w repo ani w kliencie poza publicznym tokenem Storefront API.
- Każdy punkt GOTOWE, GDY udowadniasz wynikiem komendy albo plikiem.
```

**Bramka P3:** demo Next na Twoim telefonie; ta sama karta wygląda tak samo jak w Liquid; Lighthouse bez regresji LCP > 100 ms.

---

## P4 · Paper: presety, strona demo, README

```
Faza P4 · VITRINE: presety zaprojektowane w Paper (MCP), strona demo projektowana w Paper i przeniesiona do kodu, README z GIF-ami.
SKILLE OBOWIĄZKOWE (wczytaj przed pierwszą ramką w Paper): awwwards-art-director (kierunek strony demo, zanim powstanie pierwsza ramka) + piotrek-frontend-design (przeniesienie do kodu), taste-guardrail (Lock przed projektowaniem, Exit Check przed oddaniem), web-copy (teksty EN), a11y-gate. Inne dobierz sam. W devlogu tabela: skill · po co · co zmienił w wyniku.

CEL I PO CO
Zgłoszenie do Codrops wymaga, żeby to było naprawdę „made with Paper”, a nie tylko „uses Paper Shaders”. Presety efektów stroję wizualnie w Paper na zdjęciach produktów, agent przenosi je do presets/*.json, a stronę demo projektujemy na płótnie Paper i dopiero potem kodujemy. Proces ma być udokumentowany, bo to jest też treść wpisu i reelsa.

KONTEKST
- docs/vitrine/PLAN.md D10, §7; devlogi P1–P3; presets/*.json.
- Paper MCP podłączony do Claude Code (sprawdź claude mcp list; Paper Desktop musi być uruchomiony). Najpierw ustal z narzędzi MCP i docs Papera, czy da się odczytać parametry warstwy shadera. Jeśli nie, plan B: kopiuję kod warstwy z Paper (eksport React) i wklejam do docs/vitrine/paper-export/; ty go parsujesz.

ZAKRES
X1. Plik Paper „VITRINE — presets”: po jednej ramce na efekt (dither, halftone, mesh, paper) z 3 wariantami na zdjęciach z fixtures. Zatrzymaj się i poproś mnie o strojenie (40 min). Po moim „gotowe” odczytaj parametry i zapisz presets/*.json (nazwy EN, np. dither/newsprint, dither/riso-2tone, paper/folded-lookbook, mesh/drop-night). Testy zgodności z P1 przechodzą na nowych presetach.
X2. Strona demo: zaprojektuj na płótnie Paper (wspólny plik, ramki 390 i 1440): hero z efektem, jak to działa w 3 krokach (Liquid / headless / HTML), siatka produktów, sekcja „Built on Paper Shaders” z kredytem. Kod: examples/static/index.html zastąpiony wersją z projektu (albo osobna strona docs/, jeśli to czytelniejsze; uzasadnij). Zero AI-slopu: brak generycznych gradientów fioletowo-niebieskich, brak emoji, typografia z charakterem.
X3. README.md (EN): co to jest w 1 zdaniu, GIF karty (dither → zdjęcie), GIF edytora motywu Shopify, instalacja Liquid / React / HTML (po 3–5 linijek), API skrót z linkiem do API.md, wydajność (liczby z devlogów P1–P3), ograniczenia, licencja i „Powered by Paper Shaders” z linkiem. GIF-y nagraj z Playwright (video → ffmpeg → GIF ≤ 4 MB) do docs/media/.
X4. docs/vitrine/process.md (EN): jak powstało w Paper (zrzuty płótna, parametry przed/po strojeniu, co zrobił agent, co ja). Materiał do zgłoszenia i reelsa.
Poza zakresem: nowe efekty, zmiany API.

GOTOWE, GDY
- presets/*.json pochodzą z Paper (dowód: zrzuty ramek + odczyt MCP albo eksport w docs/vitrine/paper-export/).
- pnpm test i test:e2e zielone na nowych presetach.
- Zrzuty strony demo 390/1440 obok zrzutów płótna Paper w docs/media/p4-compare-*.png, obejrzane i ocenione taste-guardrail w devlogu.
- GIF-y istnieją i mają ≤ 4 MB (pokaż ls -lh).
Pokaż wynik każdej komendy, nie streszczenie.

WYNIK
docs/vitrine/devlog/P4-paper.md z „Momentami na content” (strojenie efektu na płótnie Paper i ten sam efekt chwilę później w sklepie), README.md, process.md, STATUS, commity. Na końcu pięć linijek.

DLA MODELU
- Edytuj pliki punktowo, nie przepisuj całych.
- Trzymaj się ZAKRESU; usprawnienia spoza zadania wypisz na końcu.
- Przy X1 zatrzymaj się na strojenie i czekaj na moje „gotowe”; nie strój za mnie.
- Każdy punkt GOTOWE, GDY udowadniasz wynikiem komendy albo plikiem.
```

**Bramka P4 (Ty):** README czytasz jak obcy developer — w 30 s wiesz, co to jest i jak zainstalować. Strona demo nie wygląda jak szablon.

---

## P5 · Przegląd, wydanie, zgłoszenie

```
Faza P5 · VITRINE: przegląd całego repo, przygotowanie wydania v0.1.0 (bez publikowania), ROADMAP i teksty zgłoszeń.
SKILLE OBOWIĄZKOWE (wczytaj przed pierwszą linijką): code-reviewer, security-perf-auditor, web-copy (teksty EN). Inne dobierz sam. W devlogu tabela: skill · po co · co zmienił w wyniku.

CEL I PO CO
Repo ma być gotowe do upublicznienia jednym kliknięciem: czysty kod, zero sekretów, jasna licencja, wersja, changelog. Publikację na npm i upublicznienie repo robię sam. Ty przygotowujesz wszystko i teksty, które wyślę do Codrops i wrzucę na X.

KONTEKST
- Całe docs/vitrine/ (PLAN, ADR, devlogi P0–P4, STATUS), README.md, API.md, process.md.

ZAKRES
W1. code-reviewer na całym repo; poprawki krytyczne zrób, resztę wypisz w docs/vitrine/review.md.
W2. Bezpieczeństwo: skan sekretów (gitleaks albo odpowiednik przez npx), .env* w .gitignore, brak tokenów w historii git.
W3. Wydanie: wersja 0.1.0 w paczkach, CHANGELOG.md, npm publish --dry-run dla paczki (pokaż listę plików w tarballu: LICENSE, NOTICE, dist, README, bez testów i fixtures), zip shopify-theme/ jako asset wydania (scripts/pack-theme). Tag git v0.1.0 lokalnie, bez push.
W4. ROADMAP.md: v2 aplikacja Shopify z Theme App Extension (z ograniczeniem kart z PLAN D12), więcej efektów, Svelte/Vue przez ten sam element, presety od społeczności.
W5. docs/vitrine/submission.md (EN): (a) wiadomość do formularza Codrops (≤ 120 słów: co to jest, czemu pasuje do „Built with Paper Shaders”, linki: repo, demo, GIF), (b) odpowiedź pod ich postem o przewodniku (≤ 280 znaków), (c) post na X z oznaczeniem @paper i @uuuuuulala, (d) post na Discord Papera / r/paperdesign, (e) szkic pitchu artykułu dla Codrops (temat: bake i budżet kontekstów WebGL w motywie Shopify, 5 punktów konspektu). Bez przesady w tonie, liczby tylko z devlogów.
W6. Checklista „przed upublicznieniem” w STATUS (Vercel URL demo wpisany w README, GIF-y działają z GitHub, licencje na miejscu).
Poza zakresem: publikacja, push, wysyłka zgłoszeń.

GOTOWE, GDY
- pnpm build, typecheck, lint, test, test:e2e, shopify theme check z kodem 0.
- Skan sekretów czysty (pokaż wynik); dry-run pokazuje poprawny tarball.
- submission.md gotowy, każdy link w nim istnieje albo jest oznaczony TODO z tym, co mam wkleić.
Pokaż wynik każdej komendy, nie streszczenie.

WYNIK
docs/vitrine/devlog/P5-wydanie.md, review.md, ROADMAP.md, CHANGELOG.md, submission.md, STATUS z checklistą, commity. Na końcu pięć linijek: co mam kliknąć, żeby wydać i zgłosić, w jakiej kolejności.

DLA MODELU
- Edytuj pliki punktowo, nie przepisuj całych.
- Trzymaj się ZAKRESU; usprawnienia spoza zadania wypisz na końcu.
- Nie publikuj, nie pushuj, nie wysyłaj niczego.
- Każdy punkt GOTOWE, GDY udowadniasz wynikiem komendy albo plikiem.
```

**Bramka P5 = v1 gotowe:** upubliczniasz repo, wdrażasz demo, publikujesz paczkę i wysyłasz zgłoszenie z `submission.md`.
