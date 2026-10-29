# VITRINE · Paper Shaders dla sklepów Shopify (Liquid + headless Next.js)

Roboczo VITRINE (fr. witryna sklepowa). Paczka npm `vitrine-shaders` wolna (29.10.2026), `vitrine` zajęta. Nazwa bez „Shopify” i bez „Paper” w nazwie produktu (znaki towarowe) — oba słowa tylko w opisie: „Paper Shaders for Shopify themes and headless storefronts”.

## 1. Po co

- **Zgłoszenie do przewodnika Codrops** (artykuł z 28.10.2026 „Paper, Curated”). Na końcu Codrops prosi o prace zrobione w Paper i zasoby, których brakuje. Sekcja „Built with Paper Shaders” ma porty na Svelte, Vue, natywne (Swift/Flutter/Android), Framer i shadcn. **Shopify nie ma nikt** — npm 29.10.2026: zero paczek łączących Paper Shaders z Shopify i zero Custom Elementu.
- **Sprzedaż usług:** open source pokazuje e-commerce + shadery + headless jednocześnie. Link w portfolio, w ofertach e-commerce i w case study.
- **Własne projekty:** NIWWTS (sklep, No.06), FRIENDZ, EMWU Hats — wszędzie, gdzie jest karta produktu.

## 2. Fakty o źródle (sprawdzone w repo 29.10.2026)

- `paper-design/shaders`, wersja **0.0.82**, licencja **Apache-2.0**. Dwie paczki: `@paper-design/shaders` (vanilla, zero zależności) i `@paper-design/shaders-react` (peer React 18/19).
- README: breaking changes pod 0.0.x → **przypinamy dokładną wersję**.
- README o redystrybucji: przy dystrybucji kodu w innej bibliotece zachować LICENSE i NOTICE; widoczne „Powered by Paper Shaders” mile widziane. Robimy jedno i drugie.
- API vanilla: `new ShaderMount(parentElement, fragmentShader, uniforms, webGlContextAttributes?, speed, frame, minPixelRatio, maxPixelCount, mipmaps)`, metody `setUniforms`, `setSpeed`, `setFrame`, `dispose`. WebGL2. Sam pauzuje render poza ekranem (IntersectionObserver) i na ukrytej karcie, ale **kontekst WebGL trzyma do `dispose()`**.
- Mapowanie parametrów → uniformy (kolory, sizing, presety) siedzi w komponentach React, nie w paczce vanilla. Element musi je odtworzyć dla wybranych shaderów.
- 30 shaderów, w tym 10 na obrazie (`u_image` jako HTMLImageElement): fluted-glass, gem-smoke, halftone-cmyk, halftone-dots, heatmap, image-dithering, lens-distortion, liquid-metal, paper-texture, water.

## 3. Decyzje

**D1 · Jeden runtime: Custom Element `<vitrine-shader>`** na `@paper-design/shaders` (vanilla). Działa w Liquid, w czystym HTML i w React 19 (pełne wsparcie custom elements). Jedno mapowanie parametrów, jedna logika puli i „wypalania”. Paczka React to tylko typowane wrappery. `@paper-design/shaders-react` służy jako wzorzec do testów zgodności pikseli, nie jako zależność.

**D2 · Zakres v1: trzy efekty pod handel**
1. **Karta produktu:** `image-dithering` (katalog jak druk, 2–5 tonów) → hover/focus odsłania oryginalne zdjęcie. Ta sama sygnatura co na piotrfilipecki.com (dither → kolor na hover). Wariant: `halftone-cmyk`.
2. **Banner kolekcji / hero:** `mesh-gradient` z kolorami z ustawień sekcji albo metapola kolekcji.
3. **Obraz edytorski / lookbook / drop:** `paper-texture` (zagięcia, ziarno, kąt światła) na zdjęciu.
Poza v1: liquid-metal (jest metal-fx), reszta shaderów, app blocks.

**D3 · Budżet kontekstów WebGL.** Przeglądarki gaszą najstarsze konteksty po kilkunastu na stronę; siatka 24 produktów to przekracza. Dlatego:
- **Wypalanie (bake):** shader ze `speed: 0` renderuje się raz (`preserveDrawingBuffer: true`), wynik idzie do bitmapy/obrazka, kontekst jest od razu zwalniany. Statyczne efekty = **zero żywych kontekstów**.
- **Pula** dla animowanych: max N żywych (domyślnie 6, ustawialne), LRU, montaż przy wejściu w viewport, `dispose` po wyjściu.
- Cache wypalonych wyników w pamięci po (URL obrazu + hash parametrów + rozmiar).
Spike w P0 musi to potwierdzić pomiarem, zanim powstanie reszta.

**D4 · Obraz zawsze pod spodem.** `<img>` (Liquid `image_url` / `next/image`) jest treścią: LCP, SEO, alt, fallback bez WebGL2. Canvas leży nad nim (`aria-hidden`), bez przesunięcia układu (`aspect-ratio` z wymiarów obrazu).

**D5 · CORS.** Tekstury z `cdn.shopify.com` wymagają `crossOrigin="anonymous"` przed załadowaniem i nagłówka ACAO po stronie CDN. Weryfikacja w P0 (curl z Maca + test w przeglądarce). Brak CORS = zostaje sam obraz, bez błędu w konsoli.

**D6 · Ruch i dostępność.** `prefers-reduced-motion` → `speed: 0` (i wypalenie). Hover = focus (klawiatura). Odsłonięcie zdjęcia ≤ 400 ms. Żadnej informacji przekazywanej tylko efektem.

**D7 · Liquid (Online Store 2.0), dystrybucja v1 = pliki do skopiowania.** Sekcje + bloki + snippet do karty produktu, `schema` z color pickerami i suwakami mapowanymi na parametry, `image_picker`. JS jako jeden plik ESM w `assets/`, ładowany tylko przez sekcje, które go używają. Edytor motywu: custom element sam obsługuje `connected/disconnected` przy `shopify:section:load/unload`. Theme app extension (app blocks bez edycji kodu motywu) = v2, bo wymaga aplikacji w Partners.
Test na aktualnym domyślnym motywie Shopify (sprawdzić w P0: Horizon czy Dawn).

**D8 · Headless: Next.js 16 App Router.** `'use client'` wrappery: `<ProductMediaShader>`, `<CollectionHeroShader>`, `<EditorialImageShader>`, przyjmujące kształt obrazu ze Storefront API (`url`, `altText`, `width`, `height`). `next/image` pod spodem. Demo działa bez sklepu na fixtures; z env (`SHOPIFY_STORE_DOMAIN`, publiczny token Storefront API) czyta dev store. Fetch w Server Components.

**D9 · Demo publiczne.** Dev store Shopify ma stronę z hasłem, więc nie jest publicznym demo. Publicznie: (a) Next headless na Vercelu, (b) statyczna strona HTML z tym samym markupem co Liquid. Liquid w akcji pokazujemy wideo/GIF z edytora motywu.

**D10 · „Made with Paper”.** Presety i strona demo projektowane w Paper (płótno + MCP z Claude Code). Parametry shaderów z Paper → `presets/*.json` (wspólne dla Liquid i React). To jest warunek zgłoszenia, nie dekoracja.

**D11 · Licencja i kredyt.** VITRINE na **Apache-2.0** (spójnie z źródłem). LICENSE + NOTICE Papera w repo i w nagłówku zbudowanego pliku `assets/vitrine.js`. „Powered by Paper Shaders” w README i na demo.

**D12 · Dystrybucja (decyzja 29.10.2026).**
- **v1 = open source dla developerów:** GitHub (Apache-2.0) + npm `vitrine-shaders` (element + wrappery React) + folder `shopify-theme/` do skopiowania do motywu (albo `shopify theme push`). Zero kosztów, zero recenzji, pasuje do przewodnika Codrops.
- **v2 = aplikacja Shopify z Theme App Extension** (instalacja jednym kliknięciem, bloki w edytorze bez kodu), dopiero gdy v1 złapie zainteresowanie. Możliwy płatny produkt: darmowy rdzeń open source, płatna apka dla sklepów (kandydat do katalogu sevenseven7). Ograniczenie: bloki aplikacji wchodzą tylko w sekcje, nie do środka kart produktów — efekt na kartach w apce wymaga skryptu pod selektory motywu (kruche). Opis w ROADMAP.md, zero kodu w v1.

## 4. Struktura repo

```
vitrine/
  packages/element/        # <vitrine-shader>, mapowania, pula, bake (TS → ESM)
  packages/react/          # wrappery React 19 + typy Storefront
  presets/                 # JSON presetów z Paper (wspólne)
  shopify-theme/           # sections/, blocks/, snippets/, assets/vitrine.js (build)
  examples/next-headless/  # Next 16, Storefront API + fixtures
  examples/static/         # HTML demo (publiczne)
  docs/                    # ADR, devlog, STATUS, media
```
Repo lokalnie: `~/Desktop/Projects/vitrine`. Gałąź robocza `main` (nowe repo), publiczne dopiero w P5.

## 5. Bramki jakości

- **Zgodność pikseli:** element vs `@paper-design/shaders-react` na tych samych parametrach → diff w Playwright ≤ 1 % pikseli (3 shadery × 2 presety).
- **Konteksty:** siatka 24 produktów z ditheringiem = 0 żywych kontekstów po wypaleniu; z animowanym hero ≤ N.
- **Wydajność (demo Next, Lighthouse mobile):** LCP nie gorszy niż wersja bez shaderów o więcej niż 100 ms, CLS = 0. Rozmiar `vitrine.js` (gzip) zmierzony i zapisany.
- **Dostępność:** klawiatura odsłania zdjęcie, reduced motion zatrzymuje ruch, alt zostaje.
- **Wygląd (Ty):** katalog w ditheringu na telefonie — „druk czy filtr z Instagrama?”.

## 6. Ryzyka

| Ryzyko | Co robimy |
|---|---|
| Bake nie działa (pusty bufor, różnice między przeglądarkami) | Spike P0; plan B: pula bez bake'u + statyczny `<img>` poza viewportem |
| Brak CORS na CDN Shopify w jakimś wariancie URL | Weryfikacja P0; fallback = sam obraz |
| Breaking change w 0.0.x | Dokładny pin; testy zgodności odpalane przy każdej aktualizacji |
| Rozrost zakresu (więcej shaderów, app blocks) | Twardo 3 efekty w v1; reszta w ROADMAP.md |
| Znak towarowy „Shopify”/„Paper” | Nie w nazwie paczki ani logo; tylko opisowo |

## 7. Zgłoszenie (P5)

1. Repo publiczne, README z GIF-ami, linki do demo.
2. Formularz kontaktowy Codrops + odpowiedź pod ich postem o przewodniku.
3. Post na X z oznaczeniem @paper i @uuuuuulala (autorka Paper Shaders); Discord Papera, r/paperdesign.
4. Opcjonalnie: propozycja artykułu na Codrops („Paper Shaders in a Shopify theme: baking, context budgets, CORS”) — Codrops publikuje takie teksty (Jesper Landberg, PaperDrops).
