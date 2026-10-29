# Devlog P0 · fundament + cztery spiki (29.10.2026)

Gałąź `p0-fundament`. Repo `~/Desktop/Projects/vitrine`. Referencja `~/Desktop/Projects/_ref/paper-shaders` (commit 1923e9f, 25.10.2026, wersja 0.0.82).

## Skille

| Skill | Po co | Co zmienił w wyniku |
|---|---|---|
| `architecture-guardian` | ADR-0001, granice paczek, kierunek zależności | Wymusił rozstrzygnięcie nazewnictwa paczek (jedna paczka npm `vitrine-shaders` z subpath `./react`; `@vitrine/react` jako prywatny workspace z zależnością `workspace:*`, kierunek tylko react → element) i format ADR (Nygard) z sekcją „odrzucone”. Z jego listy czerwonych flag wyszło, że runtime nie może zależeć od `shaders-react`. |
| `security-perf-auditor` | Spiki kontekstów WebGL i CORS | Zmienił projekt spiku B: zamiast „policz contextlost” dodał sondę wolnych slotów (16 świeżych kontekstów po bake) jako dowód zwolnienia, i negatywny test CORS (drugi origin bez ACAO, bo `route.fulfill` Playwrighta dokleja CORS). Wymógł pomiar „czy kontekst naprawdę zwolniony” osobno od „czy zgłasza isContextLost”. Z tego wyszedł wynik WebKit (ewikcja najstarszego) i tryb `bake-shared`. |
| `test-engineer` | Szkielet testów | Vitest dla paczek (testy behawioru, nie konfiguracji), Playwright z `workers: 1` (budżet kontekstów jest per proces przeglądarki, równoległość fałszowałaby pomiar), zero retry, dowody jako pliki JSON + PNG zamiast asercji w pamięci. Test `live` celowo bez asercji na liczbę ewikcji: liczba jest wynikiem, nie oczekiwaniem. |

Inne skille: nie dokładałem. Wszystko wizualne (strona demo, presety) jest poza P0, więc `taste-guardrail` i art direction wchodzą od P1.

## Środowisko

| Co | Wartość |
|---|---|
| macOS | 27.0 (26A428), Darwin 27.0.0 |
| Node / pnpm | 26.5.0 / 11.18.0 (pnpm workspaces; `allowBuilds: esbuild`) |
| TypeScript | 6.0.3 (7.0.2 jest `latest`, ale `typescript-eslint@8.72.1` wspiera `<6.1.0`; pin w ADR) |
| Playwright | 1.64.1; chromium 1248 (Chrome 156), webkit (Safari 27.2), firefox 1555 (Firefox 157 Nightly, nie startuje, niżej) |
| `@paper-design/shaders` | 0.0.82 = najnowsza na npm 29.10.2026 (`npm view`), zgodna z PLAN; CHANGELOG od 0.0.81 zmienia `paper-texture` (3 kolory, nowe parametry) i 0.0.82 zwalnia kontekst w `dispose()` |

Przebiegi końcowe (pełny output w terminalu sesji; tu końcówki):

```
pnpm build      → packages/element: ESM ⚡️ Build success, DTS ⚡️ Build success; packages/react: j.w.   (exit 0)
pnpm typecheck  → tsc root + packages/element + packages/react: Done                                     (exit 0)
pnpm lint       → eslint . && prettier --check . → All matched files use Prettier code style!            (exit 0)
pnpm test       → Test Files 2 passed (2), Tests 3 passed (3), 131 ms                                     (exit 0)
pnpm test:e2e --project=chromium --project=webkit → 16 passed (46.8s)                                     (exit 0)
```

Firefox: `pnpm test:e2e --project=firefox` → `browserType.launch: Failed to launch the browser process … Could not find profile folder`. Binarka `firefox-1555` odpowiada na `--version` (157.0), ale nie tworzy profilu nawet uruchomiona ręcznie z własnym katalogiem profilu, również z `TMPDIR` w zapisywalnym katalogu. Podejrzenie: build Playwrighta vs macOS 27 albo sandbox tej sesji (uruchomienie poza sandboxem zostało zablokowane). **Firefox = niezmierzone.** Do sprawdzenia ręcznie: `cd ~/Desktop/Projects/vitrine && pnpm exec playwright test --project=firefox` (jeśli przejdzie, dowody dopiszą się do `docs/media/p0-*-firefox.*`).

## Spike A · BAKE (`examples/spikes/bake.html`, `bake.spec.ts`)

Kiedy jest pierwsza klatka (z kodu `shader-mount.ts` 0.0.82): konstruktor nie renderuje. Pierwszy `render()` dzieje się w callbacku `ResizeObserver` (`handleResize → render`), który odpala się po konstruktorze, w kroku „update the rendering” po callbackach rAF tej samej klatki. Dlatego spike czeka dwa rAF (gwarancja, że RO już zadziałał) i woła `setFrame(0)`, które przy `speed 0` renderuje synchronicznie. Zero timeoutów.

Procedura: `new ShaderMount(parent, imageDitheringFragmentShader, uniforms, { preserveDrawingBuffer: true }, 0, 0, 2)` → 2×rAF + `setFrame(0)` → `canvas.toBlob('image/png')` → `<img src=blobURL>` (decode) → `dispose()`. Referencja „live”: ten sam shader bez `preserveDrawingBuffer`, piksele czytane `readPixels` synchronicznie po renderze. Parametry 1:1 z presetu „Default” w `shaders-react/src/shaders/image-dithering.tsx`.

| | Chromium 156 (dpr 1) | WebKit / Safari 27.2 (dpr 2) | Firefox |
|---|---|---|---|
| Canvas (300×400 CSS, minPixelRatio 2) | 600×800 | 600×800 | niezmierzone |
| Obraz po bake niepusty | tak: luma 13.4–236.5, 100 % pikseli nieprzezroczystych | tak: 13.4–236.5, 100 % | — |
| Diff bake vs live (próg Δ>8) | **0 px (0,00 %)**, meanΔ 0 | **0 px (0,00 %)**, meanΔ 0 | — |
| Czas: do 1. klatki / toBlob / img / dispose / razem | 187 / 37 / 1,4 / 2,9 / **228 ms** ¹ | 19 / 24 / 6 / 0 / **49 ms** | — |
| PNG z toBlob | 49 531 B | 21 734 B | — |
| `gl.isContextLost()` po dispose | true | true | — |
| canvas usunięty z DOM, `paperShaderMount` wyczyszczony | tak / tak | tak / tak | — |
| Sonda 15 nowych kontekstów po bake: ewikcje | 0 (15/15 żywe) | 0 (15/15 żywe) | — |
| Referencja live przeżyła sondę | **tak** | **nie** (1× „too many active WebGL contexts”) | — |

¹ Ten sam test w osobnym przebiegu (tylko Chromium, bez kolejki innych testów): 86 / 10,8 / 0,8 / 2,5 / 100 ms. Rozrzut wynika z obciążenia; liczby to headless na Macu, nie telefon.

Dowody: `docs/media/p0-bake-{chromium,webkit}.json`, zrzuty strony `p0-bake-*.png`, obraz diffu `p0-bake-diff-*.png` (jednolicie ciemny = brak różnic).

**Wniosek:** bake działa w obu przeglądarkach z zerową różnicą pikseli. `dispose()` zwalnia kontekst (0.0.82 woła `WEBGL_lose_context.loseContext()`). Różnica: w WebKit zgubiony kontekst dalej jest liczony w budżecie, dopóki GC go nie zbierze, a przy przekroczeniu limitu WebKit gasi **najstarszy** kontekst niezależnie od tego, czy już jest zgubiony. W tym teście najstarszy był „live”, więc oberwał. Szczegóły i konsekwencje w spiku B i ADR.

## Spike B · KONTEKSTY (`examples/spikes/contexts.html?mode=…`, `contexts.spec.ts`)

| Tryb | Chromium | WebKit | Firefox |
|---|---|---|---|
| **live**: 24 ShaderMount naraz (dithering, speed 0) | 8 × `webglcontextlost`, **16 żywych** po ustaleniu; montaż 24: 4499 ms ² | 8 × lost, **16 żywych**; 764 ms | niezmierzone |
| **bake**: 24 karty pieczone po kolei (kontekst per karta) | 24 `<img>`, **0 canvasów, 0 żywych kontekstów**; 5946 ms, mediana 234 ms/karta, max 569 ² | 24 img, 0 canvas, 0 żywych; 760 ms, mediana 30, max 51; GC zebrał 23/24 kontekstów w 300 ms | — |
| bake → sonda 16 nowych kontekstów | 0 ewikcji, 16/16 żywe | 0 ewikcji, 16/16 żywe (1 komunikat „too many”, ewikcja już zgubionego) | — |
| **bake-shared**: 24 karty przez **jeden** kontekst-piekarnik (`setUniforms({u_image})` + toBlob) | 1 kontekst, 24 img, 0 canvas; **898 ms, mediana 19 ms/karta**, max 315 (pierwsza, z kompilacją); 0 komunikatów „too many” | 1 kontekst; **213 ms, mediana 7 ms**, max 15; 0 „too many” | — |
| **pool** N=6: 24 animowane mesh-gradient przy przewijaniu | maxLive **6**, 40 montaży, 38 dispose, 0 niespodziewanych lost | maxLive **6**, 40/38, 0 niespodziewanych lost; 14 komunikatów „too many” (ewikcje już zgubionych, starszych kontekstów) | — |

² Chromium w pełnym przebiegu; osobny przebieg: live 1728 ms, bake 2055 ms (mediana 84, max 96 ms/karta).

Dowody: `docs/media/p0-contexts-{live,bake,bake-shared,pool}-{chromium,webkit}.{json,png}`.

**Wnioski:**
1. Limit aktywnych kontekstów = **16** w Chromium i WebKit (24 → 8 ewikcji). Siatka 24 kart na żywo jest niedopuszczalna, zgodnie z PLAN D3.
2. Bake kontekst-per-karta daje 0 żywych kontekstów po wypaleniu i wolne sloty (sonda 16/16). Działa. Ale jest wolny (Chromium mediana 84–234 ms/karta) i w WebKit tworzy 24 „zombie” do czasu GC.
3. **Propozycja do D3 (ADR-0001):** piec przez jeden współdzielony kontekst na efekt (`bake-shared`): 4–5× szybciej (mediana 19 ms vs 84–234 ms w Chromium; 7 ms vs 30 ms w WebKit), zero nowych kontekstów, zero ewikcji w obu przeglądarkach. Pula dla animowanych zostaje jak w D3.
4. WebKit: ewikcja trafia w najstarszy kontekst, także żywy, jeśli jest starszy od zgubionych. Element w P1 musi (a) piec przez piekarnik (nie tworzy kontekstów), (b) nasłuchiwać `webglcontextlost` na żywych montażach i remontować, (c) trzymać N ≤ 6 w puli, więc suma żywych + piekarniki ≤ 16 z zapasem.
5. Pula LRU na IntersectionObserver trzyma limit przy przewijaniu w obie strony (40 montaży przy 6 żywych), bez gubienia żywych kontekstów.

## Spike C · CORS (`docs/media/p0-cors-curl.txt`, `cors.html`, `cors.spec.ts`)

Sklepów klientów nie dotykam (decyzja Piotrka w tej sesji, zapisana w CLAUDE.md). Obraz: produkt ze sklepu **hardware.shopify.com** (własność Shopify), plik na tym samym CDN obrazów co każdy sklep.

curl z Maca, `Origin: https://example.com`:

| URL | Status | `access-control-allow-origin` | inne |
|---|---|---|---|
| (a) `https://cdn.shopify.com/s/files/1/…/files/….png?v=…&width=800` | 200 image/png | `*` (także bez nagłówka Origin) | `access-control-expose-headers: *`, `vary: Accept`, `cache-control: public, max-age=31557600`, server envoy |
| (b) `https://hardware.shopify.com/cdn/shop/files/….png?v=…&width=800` | 200 image/png | `*` | j.w., cloudflare, `cf-cache-status: HIT` |
| (c) jak (a) z `Accept: image/webp` | 200 **image/webp** | `*` | CDN negocjuje format po `Accept`; `vary: Accept` jest poprawne, więc cache przeglądarki nie pomiesza wariantów |

Przeglądarka (Playwright, `crossOrigin="anonymous"`, obraz jako `u_image` w ShaderMount):

| Przypadek | Chromium | WebKit |
|---|---|---|
| (a) cdn.shopify.com | img z crossorigin ładuje się, ShaderMount montuje, `glError 0`, canvas 480×480 z sensownym obrazem (luma 13–237) | j.w. |
| (b) domena sklepu `/cdn/shop/files/` | j.w. | j.w. |
| `<img>` bez crossorigin | ładuje się, ale canvas 2D po drawImage jest **tainted** (`SecurityError`) → tekstura niemożliwa | j.w. |
| Origin bez ACAO (lokalny `:4174`) | `<img>` bez crossorigin ładuje się (fallback = samo zdjęcie), img z crossorigin **nie ładuje się** (`error`), ShaderMount nie powstaje, zero wyjątków poza obsłużonym `onerror` | j.w. |

**Wniosek:** CORS potwierdzony na obu wariantach URL. Element musi ustawiać `crossOrigin="anonymous"` **zanim** ustawi `src` tekstury i traktować `error` obrazu CORS jako cichy fallback (zdarzenie `vitrine:fallback`, powód `cors`). Uwaga: `<img>` w treści (Liquid `image_tag`) nie ma `crossorigin`, więc element ładuje drugą kopię tego samego URL z `crossorigin`; przy `vary: Accept` i tym samym `Accept` trafi w cache HTTP, ale w Chromium cache pamięci jest keyowany także po trybie CORS, więc możliwy drugi request. Do zmierzenia w P1 (Network panel), nie zakładać.

## Spike D · MOTYW (research agenta, zweryfikowane w repo Shopify/horizon i Shopify/dawn, 29.10.2026)

- **Domyślny motyw: Horizon 4.3.0** (Theme Store: wydanie 09.10.2026, „Designed by Shopify”; `config/settings_schema.json` na `main`: `theme_name: Horizon, theme_version: 4.3.0`, ostatni commit dfad90d z 13.10.2026). README: „flagship of a new generation of first party Shopify themes … theme blocks”. Zdania „domyślny dla nowych sklepów” na shopify.dev nie znaleziono wprost (tylko źródła zewnętrzne); flagowy i oparty o theme blocks = potwierdzone. Dawn: v16.0.0 (10.08.2026), dalej utrzymywany, „source available reference theme”.
- Horizon: Online Store 2.0 (JSON templates) + theme blocks. Łańcuch karty produktu: `templates/collection.json` → `sections/main-collection.liquid` (linie 61–77: `{% content_for 'block', type: '_product-card', closest.product: product %}` w pętli) → `blocks/_product-card.liquid` (l. 13: `{% render 'product-card', children, product %}`) → `snippets/product-card.liquid` (l. 62–117: root to custom element `<product-card class="product-card …">`) → `blocks/_product-card-gallery.liquid` → `snippets/card-gallery.liquid` (l. 117–128 pojedynczy obraz, l. 184–188 slideshow) → **`snippets/product-media.liquid` l. 27–54**: `<div class="product-media" style="--ratio: {{ media.aspect_ratio }}">{{ media.preview_image | image_url: width: 3840 | image_tag: widths, alt: media.alt, sizes, loading, class: 'product-media__image', … }}</div>`.
- DOM karty: `li.product-grid__item > product-card > div.product-card__content > div.card-gallery > a.contents > div.product-media-container (lub slideshow-component > slideshow-slide) > div.product-media > img.product-media__image`.
- Gdzie owinąć `<img>` w `<vitrine-shader>` (wejście do P2): `snippets/product-media.liquid` l. 40–54 (między `%}` a `{{ media.preview_image … }}`), ale ten snippet jest współdzielony z galerią strony produktu i hotspotami, więc albo warunek na `preview_image_only` (true tylko dla kart), albo owinięcie w miejscu wywołania w `snippets/card-gallery.liquid` l. 122–127 (jeden obraz) i l. 185 (slideshow). `.product-media` ustawia `--ratio` i `data-media-id`, więc wrapper musi być `display: contents` albo przejąć te style.
- Dawn 16: `snippets/card-product.liquid` l. 66–85 to ręczny `<img srcset=… image_url: width: 533 …>` (+ drugi hover-img l. 89–99, trzecia kopia l. 477).
- `shopify theme init` domyślnie klonuje **Skeleton theme**, nie Horizon; start od Horizon: `shopify theme init my-theme --clone-url https://github.com/Shopify/horizon.git`.
- Shopify Dev MCP: `@shopify/dev-mcp` 1.18.0 (27.10.2026), stdio, bez auth; waliduje Liquid/motywy (`validate_theme` przy `LIQUID_VALIDATION_MODE=full`), szuka w docs. Dodanie do Claude Code (krok ręczny przed P2): `claude mcp add --transport stdio shopify-dev-mcp -- npx -y @shopify/dev-mcp@1.18.0` + restart. Telemetria: `OPT_OUT_INSTRUMENTATION=true`.

## Z8 · nazwa

- `npm view vitrine-shaders` → **404, wolne** (29.10.2026).
- `gh repo view PiotrekFilipecki/vitrine` → „Could not resolve to a Repository”, **wolne**.

## Co pominąłem / poza zakresem (nie naprawiałem)

- Firefox (wyżej). Do odpalenia ręcznie.
- Pomiary czasu w headless Chromium mają duży rozrzut między przebiegami (2–3×); na bramkę P1 (LCP, czas wypalenia 24 kart) trzeba 3 przebiegi i medianę, jak w PROMPTY.
- Fixtures są syntetyczne (`examples/spikes/fixtures/make-fixtures.py`), bo zdjęć z żadnego sklepu klienta nie używamy. Do demo w P1 potrzebne będą zdjęcia własnych marek Piotrka (NIWWTS) albo sklep testowy `vitrine-demo` z danymi testowymi Shopify.
- pnpm 11 dopisał `minimumReleaseAgeExclude: @types/node@26.6.6` do `pnpm-workspace.yaml` (paczka młodsza niż domyślny próg wieku). Zostawione, bo to polityka supply-chain pnpm, nie nasz wybór.
- Duplikat ładowania obrazu z i bez `crossorigin` (spike C) do zmierzenia w P1.
- `probeContextSlots` liczy zdarzenia tylko na własnych canvasach; w WebKit ewikcja innych (już zgubionych) kontekstów jest widoczna tylko w konsoli. Zapisane w JSON jako `consoleErrors`.
