# P2 · Motyw Liquid (Horizon 4.3.0) + markup statyczny

Data: 29.10.2026. Gałąź `p2-liquid` (od `p3-headless`; kolejność faz P3 → P2, bo dev store powstał w trakcie P3). Sklep: **`niwwts.myshopify.com`** (własny dev store Piotrka, założony tego dnia; w PROMPTY nazywany `niwwts-lab`). Zero sklepów klientów.

## Skille

| Skill | Po co | Co zmienił w wyniku |
| --- | --- | --- |
| test-engineer | co testować gdzie | trzy poziomy: `theme check` (schemat/Liquid), Playwright na `theme-markup.html` (ten sam HTML co sekcje, bez sklepu, w CI), Playwright na sklepie przez proxy `shopify theme dev` (`store.spec.ts`, pomijany bez `VITRINE_STORE_URL`); testy na sklepie liczą tylko błędy konsoli dotyczące VITRINE/WebGL, bo proxy dokłada własne (CORS skryptu origin-trials, CSP shop.app, 403) i WebKit zgłasza benign „ResizeObserver loop” jako błąd strony |
| a11y-gate | klawiatura na kartach, alt, landmarki | **znalezisko:** w Horizon obraz karty siedzi w `a.contents` (`display: contents`, nie da się go sfokusować), a link klawiaturowy `a.product-card__link` jest rodzeństwem; reveal z klawiatury nie działał → element preferuje jawne `[data-vitrine-card]` nad najbliższym `a` (zmiana w `reveal.ts`, API.md), instrukcja: `data-vitrine-card` na `<product-card>`; test klawiatury na sklepie zielony. Hero `aria-hidden`, nagłówek jako blok z wyborem `h1/h2/p`, `aria-labelledby` przez ustawienie `heading_id`; obraz edytorski z `alt` z Files |
| security-perf-auditor | pliki w motywie, ładowanie JS | JS tylko tam, gdzie efekt (snippet `vitrine-script` renderowany przez sekcje i kartę; moduł liczony raz); parametry do `params` przez Liquid z liczb (`divided_by`) i kolorów z pickerów, teksty przez `escape`; brak `{{ … }}` bez escape poza `richtext` (zaufane, z edytora); nagłówek licencji + NOTICE w `vitrine.js`; hasło sklepu nigdy w repo ani w logach (ze schowka do flagi CLI / env) |
| taste-guardrail | Lock przed ustawieniami domyślnymi sekcji | domyślne = presety `drop-night` i `folded-lookbook` z P1, płyta tuszu pod tekstem hero, kicker w blue-rice; sekcja edytorska 38/62 z tekstem przy prawej krawędzi; po zrzucie ze sklepu dopisane ustawienia szerokości (strona/pełna) i odstępów, bo obraz dotykał lewej krawędzi strony |
| niwwts-aesthetic | arbiter stylu | w edytorze zmiana koloru 3 na acid `#D6F23C` jako test; wartości domyślne zostają: tusz, blue-rice, oranż No.06, papier (akcent < 20 %); sekcje bez cieni i zaokrągleń, typografia dziedziczy z motywu |
| Shopify Dev MCP | walidacja schematów | **niedostępny w tej sesji** (nie ma go na liście narzędzi); zamiast tego `shopify theme check` z CLI 4.9.4 (0 błędów w plikach VITRINE) |

## Co powstało

- `shopify-theme/assets/vitrine.js`: jeden plik ESM, **101 817 B / 44 030 B gzip**, nagłówek z licencją i NOTICE Papera; build `packages/element/tsup.theme.config.ts` (`pnpm --filter vitrine-shaders exec tsup --config tsup.theme.config.ts`). Bez dzielenia na chunki: folder `assets/` jest płaski, a `asset_url` dokleja `?v=`, więc względny `import('./chunk.js')` to zgadywanie (PROMPTY L1: „sprawdź, nie zakładaj”); wariant z chunkami niezmierzony, zapisany w „Pominięte”.
- `shopify-theme/assets/vitrine-theme.css` (4 049 B / 1 232 B gzip), `sections/vitrine-hero.liquid` (mesh: 4 color pickery, speed/distortion/swirl/grain/scale, wysokość, płyta; bloki heading/text/button), `sections/vitrine-editorial.liquid` (paper na `image_picker`: blending/folds/crumples/roughness/fiber/angle/seed, kolor papieru, pozycja tekstu, szerokość, odstępy; bloki kicker/heading/text/button), `snippets/vitrine-card-media.liquid`, `snippets/vitrine-script.liquid`, `settings_schema.fragment.json`, `README.md` (instalacja w 10 minut, Horizon: `product-media.liquid` l. 40–54 + `data-vitrine-card` na `<product-card>` w `product-card.liquid` l. 62; Dawn 16: `card-product.liquid` l. 66–85).
- `examples/static/theme-markup.html` + `theme-markup.css`: dokładny HTML sekcji i snippetu (DOM karty Horizon), 26 tagów `<script type="module">` (hero, editorial, 24 karty).
- `examples/niwwts-products.csv`: 12 produktów (6 koszulek S–XL, 6 printów), 30 wierszy, kod katalogowy w metapolu `custom.code`, obrazy z assetów motywu testowego (publiczne URL-e `niwwts.myshopify.com/cdn/shop/t/2/assets/…`). Zaimportowany przez agenta w adminie na prośbę Piotrka („zrob za mnie import produktow”): 12 produktów, 30 SKU, 12 obrazów.
- `examples/theme-test/` (ignorowane poza README): `horizon/` z GitHuba Shopify, `live/` = motyw sklepu + VITRINE wg README. Wypchnięty jako **„VITRINE test (p2)”, id 193335820605, nieopublikowany**: edytor `https://niwwts.myshopify.com/admin/themes/193335820605/editor`, podgląd `https://niwwts.myshopify.com?preview_theme_id=193335820605` (hasło sklepu).

## Komendy (końcówki, kod wyjścia 0)

```
$ shopify theme check --path shopify-theme
5 files inspected with 1 total offenses found across 1 files. 1 warnings.
  snippets/vitrine-card-media.liquid [warning] OrphanedSnippet (snippet wpina sprzedawca; oczekiwane)

$ shopify theme check --path examples/theme-test/live   (cały Horizon + VITRINE)
361 files inspected with 8 total offenses found across 4 files. 2 errors. 6 warnings.
  wszystkie w plikach Horizon: UnknownFilter applicable_disclosures ×2, ExcessiveSettingsCount header.liquid, UnusedDocParam divider.liquid ×5; 0 w plikach VITRINE

$ shopify theme push --unpublished --theme "VITRINE test (p2)" --store niwwts.myshopify.com --path examples/theme-test/live
{"theme":{"id":193335820605,"name":"VITRINE test (p2)","role":"unpublished", …}}

$ pnpm test            → Test Files 6 passed (6) · Tests 32 passed (32)
$ pnpm lint            → All matched files use Prettier code style!
$ pnpm typecheck       → 0 błędów
$ pnpm exec playwright test packages/element/e2e/theme-markup.spec.ts --project=chromium --project=webkit
9 passed, 1 skipped (29.1s)
$ VITRINE_STORE_URL=http://127.0.0.1:9292 pnpm exec playwright test packages/element/e2e/store.spec.ts --project=chromium --project=webkit
8 passed (39.7s)
$ VITRINE_CORS_IMAGE_URL=… VITRINE_CORS_STORE_IMAGE_URL=… pnpm exec playwright test examples/spikes/cors.spec.ts --project=chromium --project=webkit
6 passed (5.5s)
$ pnpm exec playwright test --project=chromium --project=webkit   (cała suita P0–P3 + theme-markup; store.spec pomijany bez env)
67 passed, 11 skipped (2.0m)   (skip = zrzuty tylko w Chromium + store.spec bez VITRINE_STORE_URL)

$ 5× pnpm exec playwright test … --project=webkit -g keyboard   (po poprawce reveal, patrz niżej)
6 passed ×5
```

## Dwie poprawki w elemencie (kod P1), znalezione testami P2

1. **Jawny `[data-vitrine-card]` wygrywa z najbliższym `a`** (Horizon, opis w tabeli skilli i w ADR).
2. **Stan reveal po ponownym setupie.** Test klawiatury w WebKit padał w ~1 na 4 przebiegi (`data-vitrine-revealed` nieobecny po `focus()`). Przyczyna: gdy po fokusie zmienia się rozmiar pudełka (późne fonty, edytor), element uruchamia setup od nowa, zrywa poprzedni reveal (`set(false)`) i podpina nowy, ale `focusin` już nie przyjdzie. Poprawka w `reveal.ts`: po podpięciu nasłuchów `if (surface.matches(':focus-within')) set(true)`. Po poprawce 5 × 6 testów klawiatury w WebKit zielone, pełna suita 67/67. Asercje testów zmienione na obecność atrybutu (`toHaveAttribute(name)` bez wartości), bo wariant z pustą wartością dawał mylący komunikat „serializes to the same string”.

## Spike C powtórzony na własnym sklepie (`docs/media/p2-cors-*`)

| URL | `access-control-allow-origin` | tekstura WebGL |
| --- | --- | --- |
| `https://cdn.shopify.com/s/files/1/1029/0452/9213/files/01-tee-el-funkador.jpg?v=…&width=800` | `*` | działa (Chromium + WebKit) |
| `https://niwwts.myshopify.com/cdn/shop/files/01-tee-el-funkador.jpg?width=800` | `*` | działa |
| `https://niwwts.myshopify.com/cdn/shop/t/2/assets/01-tee-el-funkador.webp` (asset motywu) | `*` | nagłówki ok (curl) |
| `…/assets/vitrine.js` | `*`, `content-type: text/javascript` | moduł ładuje się jako ESM |

D5 potwierdzone na sklepie Piotrka, nie tylko na sklepie Shopify. Uwaga: Shopify konwertuje wgrane `.webp` produktów do `.jpg` (Files pokazuje JPG), a `image_url` zwraca URL na domenie sklepu (`/cdn/shop/files/…`), więc w Liquid wariant „store” jest tym używanym.

## Pomiary na sklepie

**Proxy `theme dev` (127.0.0.1:9292), Playwright, 1440×900 (`docs/media/p2-store-{home,collection}-{chromium,webkit}.json`):**

| Strona | Elementy | Stany | Canvasy | Hosty piekarnika | Błędy VITRINE |
| --- | --- | --- | --- | --- | --- |
| `/` (hero + Featured collection 8 kart + editorial) | 10 | 1 live (mesh), 9 baked | 1 (hero) | 0 | 0 (obie) |
| `/collections/all` (12 produktów) | 12 | 12 baked, 12/12 obrazów w `<vitrine-shader>`, 0 poza | 0 | 0 | 0 (obie) |

Tagi `<script type="module">`: 10 na stronie głównej, 12 na kolekcji, **1 żądanie `vitrine.js`** (dedup modułu przez przeglądarkę, nie przez Liquid).

**Lighthouse mobile na prawdziwym podglądzie CDN** (`https://niwwts.myshopify.com/collections/all?preview_theme_id=193335820605`, ciasteczko hasła z Playwrighta, 3 przebiegi, mediana; „bez” = ten sam HTML z `vitrine.js` zablokowanym przez `blockedUrlPatterns`; `docs/media/p2-lighthouse.json`):

| | Score | LCP | CLS | TBT | FCP |
| --- | --- | --- | --- | --- | --- |
| z VITRINE | 100 | 1 808 ms | 0 | 0 ms | 867 ms |
| bez | 99 | 1 938 ms | 0 | 35 ms | 852 ms |
| Δ | +1 | **−130 ms** (szum; próg ≤ +100 ms) | 0 | −35 | +15 |

Pierwszy pomiar przez proxy `theme dev` dał LCP ~10 s w obu wariantach (Δ +300 ms) i został odrzucony: proxy dokłada własne opóźnienie i nie jest tym, co widzi klient. Liczy się CDN.

**Edytor motywu (ręcznie, przez Chrome Piotrka, motyw deweloperski `theme dev`, bez zapisu; `docs/media/p2-editor-*.jpg`):**

1. Sekcja „VITRINE hero (mesh)” z panelem: preset, 4 kolory, suwaki, układ. Zmiana koloru 3 na `#D6F23C` → edytor przerysował sekcję (`shopify:section:load`), mesh od razu w nowym kolorze, bez duplikatu elementu, stary kontekst zwolniony razem ze starym DOM. **To jest „moment na content”.**
2. „Add section” → lista zawiera obie sekcje VITRINE z podglądem (editorial renderuje placeholder i nagłówek). Dodanie drugiej sekcji edytorskiej → pojawia się z blokami kicker/heading/text; „Remove section” → znika bez śladu w sidebarze i podglądzie.
3. Przeciągnięcie sekcji w sidebarze → kolejność zmieniona, podgląd przebudowany.
4. Theme settings → grupa „VITRINE” (włącz/wyłącz efekt na kartach, efekt, preset, reveal) widoczna i działa.
5. Wszystko cofnięte przyciskiem Undo (Save nieaktywny); motyw deweloperski usuwa się sam po zamknięciu `theme dev`.

Niezweryfikowane w edytorze: liczba żywych kontekstów po operacjach (podgląd to cross-origin iframe, bez dostępu z narzędzi); dowód pośredni: po każdym przerysowaniu element dostaje `disconnectedCallback` (dispose) i nowy `connectedCallback`, co testują `grid.spec` i `store.spec`.

## Zrzuty, obejrzane

- `p2-theme-markup-{390,1440}.png`: siatka 4/2 kolumny w ditheringu, hero mesh z płytą, editorial; ten sam wygląd co `examples/static/index.html` bez leadu na 2 kolumny (Horizon ma równą siatkę).
- `p2-store-collection-{390,1440}.png`: Horizon „Products”, 12 kart w ditheringu, typografia i siatka motywu nietknięte; na 390 dwie kolumny, nic nie skacze.
- `p2-store-home-{390,1440}.png`: hero mesh nad sekcjami Horizon, Featured collection w ditheringu, editorial z EL FUNKADOR w papierze; po poprawce szerokości obraz trzyma margines strony (40 px na 1440).
- Uwaga jak w P1/P3: kremowe tło mockupów daje raster na całej karcie (preset `newsprint`, do strojenia w P4).

## Exit Check (taste-guardrail) 12/13

Lock ✔ (presety i tokeny z P1) · font: dziedziczy z motywu (Horizon: Inter-podobny systemowy; to decyzja sprzedawcy, nie nasza) ✔ · jeden akcent ✔ · złamanie siatki: płyta hero zachodzi na mesh ✔ · sygnatura: druk → zdjęcie ✔ · hierarchia ✔ · Tells: brak ✔ · kontekst NIWWTS ✔ · ciepło (papier) ✔ · izolacja ✔ · grupowanie ✔ · głębia bez cieni ✔ · napięcie ✘ (sekcja edytorska w motywie jest grzeczna; w Horizon nie ma leadu 2-kolumnowego, bo siatka jest motywu).

## a11y-gate

Kontrast ✔ (tokeny P1; w motywie kolory z pickerów to decyzja sprzedawcy, domyślne 15,74:1) · klawiatura ✔ (po poprawce `data-vitrine-card`, test na sklepie) · focus ✔ (`:focus-visible` na przyciskach sekcji; karty = fokus motywu) · semantyka ✔ (`section` + `aria-labelledby`, nagłówek z wyborem tagu, `figure/figcaption`) · formularze n/d · obrazy ✔ (`image_tag` z `alt` z Files, hero `aria-hidden`) · ruch ✔ (reduced motion test na sklepie: mesh baked) · treść dynamiczna ✔. Ręcznie: VoiceOver na stronie kolekcji.

## Momenty na content

1. Edytor motywu: suwak koloru → gradient przerysowuje się na żywo (zrzut `p2-editor-hero-settings.jpg`).
2. Strona kolekcji Horizon: te same karty, ten sam motyw, tylko snippet podmieniony; hover zdejmuje raster.
3. Lighthouse 100 z VITRINE na prawdziwym CDN.

## Pominięte / niezmierzone

- `vitrine.js` jako chunki w `assets/` (dynamiczny import względny z `?v=`): niezmierzone; v1 = jeden plik 44 KB gz. Do sprawdzenia w P5 albo v1.1 (oszczędność ~25 KB gz dla stron bez paper/halftone).
- Dawn 16: instrukcja w README z numerów linii Spike D, nie testowana na sklepie (sklep ma Horizon).
- Wykonywanie `<script type="module">` wstrzykniętego przez edytor przy *pierwszym* dodaniu sekcji VITRINE na stronę bez innej sekcji VITRINE: w teście hero już był, więc moduł był załadowany; przypadek „pierwsza sekcja dodana w edytorze bez przeładowania” nieprzetestowany (po zapisie i odświeżeniu działa na pewno).
- Firefox (jak w P0–P3).
- Liczenie kontekstów wewnątrz iframe'u edytora (patrz wyżej).
- Prawdziwy telefon na podglądzie (bramka Piotrka).

## Kroki ręczne (Piotrek)

1. **Bramka P2:** `https://niwwts.myshopify.com?preview_theme_id=193335820605` (hasło sklepu) na telefonie: strona główna i `/collections/all`; edytor: zmień kolory hero i ustawienia kart bez kodu.
2. Merge w kolejności `p1-element` → `p3-headless` → `p2-liquid` do `main` (fast-forward po bramkach).
3. Motyw „VITRINE test (p2)” zostaje nieopublikowany; usuń, gdy nie będzie potrzebny (ja nie usuwam niczego w sklepie).
4. Produkty w sklepie mają ceny w USD (waluta dev store), opisy EN i metapole `custom.code`; możesz poprawić w adminie.
