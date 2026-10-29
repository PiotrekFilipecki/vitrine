# ADR-0001: Architektura VITRINE — jeden runtime jako Custom Element na vanilla Paper Shaders

## Status

Accepted (29.10.2026). Propozycje P1 i P2 z sekcji „Co pokazały spiki” **przyjęte 29.10.2026** (Piotrek: „działaj dalej” po raporcie P0; rekomendacja była „tak, obie”). Nie zmieniają decyzji z PLAN.md, doprecyzowują D3 i obowiązują od P1.

## Kontekst

VITRINE ma dać ten sam efekt (dithering, halftone, mesh-gradient, paper-texture z `@paper-design/shaders`) w trzech środowiskach: motyw Liquid (Online Store 2.0, Horizon 4.3.0), czysty HTML i React 19 / Next.js 16. Źródło: `@paper-design/shaders` 0.0.82 (vanilla, zero zależności, Apache-2.0) oraz `@paper-design/shaders-react` 0.0.82 (wrappery; mapowanie parametrów na uniformy siedzi w React, nie w vanilla). Upstream zapowiada breaking changes pod 0.0.x. Przeglądarki trzymają ok. 16 aktywnych kontekstów WebGL na stronę; siatka kolekcji ma 24+ kart. Tekstury idą z CDN Shopify (cross-origin). Cel biznesowy: wpis w przewodniku Codrops „Paper, Curated” i materiał sprzedażowy; solo developer, więc jedna implementacja do utrzymania.

## Decyzja

1. **Jeden runtime: Custom Element `<vitrine-shader>`** w `packages/element`, zbudowany wyłącznie na `@paper-design/shaders` (vanilla), z własnym portem mapowań parametr → uniform dla czterech efektów (1:1 z `shaders-react`, weryfikowane testem zgodności pikseli). Działa w Liquid, HTML i React 19 (pełne wsparcie custom elements). `packages/react` to tylko typowane wrappery nad elementem. (PLAN D1)
2. **Obraz zawsze pod spodem.** Dziecko `<img>` jest treścią: LCP, alt, SEO, fallback bez WebGL2 i bez CORS. Canvas leży nad nim (`aria-hidden`), bez przesunięcia układu. (PLAN D4)
3. **Budżet kontekstów: bake + pula.** Efekty statyczne (`speed 0`) są wypalane do `<img>` i nie trzymają kontekstu; efekty animowane żyją w puli LRU (domyślnie max 6), montowanej przy wejściu w viewport. Cache wypalonych wyników po (src + hash parametrów + rozmiar w px urządzenia). (PLAN D3; doprecyzowanie w propozycji P1 niżej)
4. **Dystrybucja v1 = open source dla developerów**: GitHub (Apache-2.0) + npm + folder `shopify-theme/` do skopiowania. Theme App Extension dopiero w v2. (PLAN D12)
5. **Paczki i nazwy.** Jedna publikowana paczka npm **`vitrine-shaders`** (`packages/element`) z subpath `vitrine-shaders/react`. `packages/react` to prywatny workspace `@vitrine/react` z zależnością `vitrine-shaders: workspace:*` (kierunek zależności tylko react → element; `vitrine-shaders` jest dla wrapperów `external`, a w opublikowanej paczce rozwiązuje się przez self-reference po `exports`). Składanie `dist/react` do paczki głównej to krok wydania (P5). Nazwa bez „Shopify” i „Paper” (znaki towarowe), oba słowa tylko opisowo.
6. **Wersje przypięte dokładnie**, bez `^`/`~`. `@paper-design/shaders` = **0.0.82** (najnowsza na npm 29.10.2026, zgodna z PLAN; 0.0.82 wnosi zwolnienie kontekstu w `dispose()`, z którego korzysta bake). Bump = osobny ADR + zielone testy zgodności. TypeScript **6.0.3**, nie 7.0.2: `typescript-eslint@8.72.1` deklaruje `typescript <6.1.0`.
7. **Licencja Apache-2.0** dla VITRINE, `LICENSE` + `NOTICE` Papera nietykalne w `third_party/paper-shaders/`, kredyt „Powered by Paper Shaders” w README, NOTICE, demo i nagłówku `vitrine.js`.

## Konsekwencje

Pozytywne: jedna logika mapowań, puli i bake’u do utrzymania i testowania; React i Liquid dzielą te same presety JSON; brak zależności runtime od `shaders-react`, więc breaking changes w React wrapperach Papera nas nie dotyczą (dotyczą nas zmiany w vanilla, pod pinem). Negatywne: mapowania parametrów trzeba ręcznie przenieść z `shaders-react` (koszt: 4 pliki, test zgodności pikseli chroni przed dryfem); custom element w React to po stronie SSR tylko `<img>`, efekt dochodzi po hydracji (zamierzone, patrz D4); bake wymaga `preserveDrawingBuffer` i dodatkowej kopii obrazu w pamięci. Dług: mapowania i presety mogą się rozjechać z upstreamem przy każdym bumpie, dlatego testy zgodności są bramką każdej aktualizacji.

## Odrzucone

- **Osobne implementacje dla Liquid i React** (np. `shaders-react` w Next + ręczny JS w motywie): dwa źródła prawdy dla mapowań, puli i bake’u; dwa razy więcej testów; różne piksele w dwóch środowiskach. Odrzucone.
- **Zależność runtime od `@paper-design/shaders-react`**: ciągnie React do motywu Liquid, a React wrappery i tak kończą w `ShaderMount` z vanilla. `shaders-react` zostaje devDependency jako wzorzec do testów zgodności. Odrzucone.
- **Theme App Extension w v1**: wymaga aplikacji w Partners, recenzji i hostingu; bloki aplikacji nie wchodzą do wnętrza kart produktu (tylko sekcje), więc efekt na kartach i tak wymagałby skryptu pod selektory motywu. Przesunięte do v2 (ROADMAP w P5).
- **Dwie paczki npm (`vitrine-shaders` + `vitrine-shaders-react`)**: prostsze w monorepo, ale PLAN D12 mówi o jednej paczce i jedna nazwa jest łatwiejsza w zgłoszeniu i README. Odrzucone na rzecz subpath `./react`.

## Co pokazały spiki (29.10.2026, Chromium 156 i WebKit/Safari 27.2 headless na macOS 27; Firefox niezmierzony, bo build Playwrighta nie startuje na tej maszynie; liczby i dowody: `docs/vitrine/devlog/P0-spiki.md`, `docs/media/p0-*`)

**A · Bake działa.** `image-dithering` ze `speed 0` i `preserveDrawingBuffer: true`, pierwsza klatka łapana przez 2×rAF + `setFrame(0)` (bez timeoutów; pierwszy render dzieje się w callbacku ResizeObserver po konstruktorze). Obraz po bake jest pełny i **identyczny** z renderem na żywo: 0 różnych pikseli w obu przeglądarkach przy progu Δ>8. Czas całego cyklu dla karty 300×400 CSS (600×800 px): 49 ms WebKit, 100–228 ms Chromium headless (rozrzut między przebiegami). Po `dispose()` kontekst zgłasza `isContextLost() === true`, canvas znika z DOM, a sonda 15–16 nowych kontekstów nie wywołuje żadnej ewikcji. **Bramka „bake potwierdzony pomiarem”: zaliczona.**

**B · Budżet kontekstów.** Limit aktywnych kontekstów to **16** w Chromium i WebKit (24 żywe mounty → 8 × `webglcontextlost`). 24 karty wypalone kontekst-per-karta → 0 żywych kontekstów, 24 `<img>`, 0 canvasów, sloty wolne. Pula LRU N=6 na animowanym mesh-gradient trzyma `maxLive = 6` przy przewijaniu (40 montaży, 0 zgubionych żywych kontekstów). D3 broni się.

Dwa doprecyzowania D3 wychodzą z pomiaru, zapisane jako propozycje:

- **Propozycja P1 (do D3): piec przez jeden współdzielony kontekst na efekt („piekarnik”), nie kontekst-per-karta.** Jeden `ShaderMount` poza ekranem, `setUniforms({ u_image })` + `toBlob` per karta. Pomiar: 24 karty w 213 ms WebKit (mediana 7 ms/karta) i 898 ms Chromium (mediana 19 ms) wobec 760 ms / 30 ms i 2055–5946 ms / 84–234 ms dla kontekstu per karta; zero nowych kontekstów, zero komunikatów „too many active WebGL contexts” w obu przeglądarkach. Rezultat dla użytkownika ten sam (0 żywych kontekstów po wypaleniu), koszt niższy 4–5×, a w WebKit znika problem z punktu niżej. Rekomendacja: przyjąć w P1 (E4), z kolejką pieczenia o współbieżności 1 i osobnym piekarnikiem na fragment shader (max 3 w v1).
- **Propozycja P2 (do D3, WebKit): zabezpieczyć żywe montaże przed ewikcją.** W WebKit kontekst zgubiony przez `loseContext()` dalej liczy się do limitu, dopóki GC go nie zbierze (w pomiarze: 23/24 zebrane w ~300 ms, gdy nic ich nie trzyma, ale pojedynczy przetrwał 2 s), a przy przekroczeniu limitu WebKit gasi **najstarszy** kontekst, także żywy, jeśli jest starszy od zgubionych. W spiku A najstarszy był żywy render referencyjny i został zgaszony po bake + 15 sondach. Dla elementu oznacza to: (a) piekarnik zamiast kontekstu per karta (P1) usuwa źródło nowych kontekstów; (b) żywe montaże (hero, pula) nasłuchują `webglcontextlost` i remontują się (nowy kontekst = najmłodszy); (c) suma: pula (≤6) + piekarniki (≤3) + zapas zostaje daleko poniżej 16. Rekomendacja: przyjąć w P1 (E4, E6) i dopisać test „hero przeżywa wypalenie 24 kart” w WebKit.

**C · CORS działa.** CDN obrazów Shopify odpowiada `access-control-allow-origin: *` (plus `access-control-expose-headers: *`, `vary: Accept`) dla obu wariantów URL: `https://cdn.shopify.com/s/files/1/…/files/…` i `https://<domena sklepu>/cdn/shop/files/…`, z nagłówkiem `Origin` i bez. W przeglądarce obraz z `crossOrigin="anonymous"` ładuje się jako tekstura `u_image`, ShaderMount montuje bez błędu GL w Chromium i WebKit. Bez `crossorigin` canvas jest tainted. Na originie bez ACAO obraz z `crossorigin` nie ładuje się (zdarzenie `error`), a zwykły `<img>` wyświetla się normalnie, więc fallback z D5 („zostaje sam obraz, bez błędu w konsoli”) jest realizowalny przez obsługę `onerror`. Pomiar na pliku ze sklepu należącego do Shopify (hardware.shopify.com), nie sklepu klienta. **Bramka „CORS potwierdzony pomiarem”: zaliczona.** Otwarte na P1: czy druga kopia obrazu (z `crossorigin`) trafia w cache HTTP obok `<img>` z treści.

**D · Motyw.** Domyślny flagowy motyw to Horizon 4.3.0 (theme blocks); `<img>` karty produktu powstaje w `snippets/product-media.liquid` (l. 40–54) przez `image_url | image_tag`, wywoływany z `snippets/card-gallery.liquid`. Miejsce wpięcia `<vitrine-shader>` i ograniczenia opisane w devlogu (wejście do P2). Zmiana względem PLAN D7: żadna, PLAN dopuszczał Horizon albo Dawn.

**Plan B z PLAN §6 nie jest potrzebny:** bake i CORS potwierdzone. Jeśli Piotrek odrzuci propozycję P1, D3 w wersji kontekst-per-karta też działa (pomiar wyżej), tylko wolniej i z ryzykiem P2 w WebKit.

## Uzupełnienie z P1 (29.10.2026, pomiary w `docs/vitrine/devlog/P1-element.md`)

- **Metoda odczytu wypalonej klatki zmieniona:** nie `preserveDrawingBuffer: true` + `canvas.toBlob`, tylko synchroniczny `gl.readPixels` zaraz po renderze (ten sam task), `putImageData` do płótna 2D i `toDataURL('image/png')` → Blob → object URL. Powód: `toBlob` (na płótnie WebGL i na 2D) kończył się po ~1,07 s na kartę, gdy na stronie animował się inny kontekst (hero), wobec 7 ms bez niego; synchroniczny odczyt + kodowanie trzyma 1–20 ms niezależnie od hero. `preserveDrawingBuffer` przestał być potrzebny. Wynik pikselowy ten sam (0 różnych pikseli vs React we wszystkich 8 przypadkach).
- **Propozycje P1 i P2 wdrożone:** jeden piekarnik na efekt (`Baker`, kolejka o współbieżności 1, kontekst zwalniany po 1,5 s bezczynności), żywe montaże remontują się po `webglcontextlost` i parkują ostatnią klatkę w płótnie 2D, pula LRU ≤ 6. Dowód: 24 karty + żywy hero → 0 `webglcontextlost`, 0 kontekstów piekarnika po wypaleniu, hero żywy, sonda 14 świeżych kontekstów bez ewikcji, w Chromium i WebKit.
- **Bundling:** importy z głębokich ścieżek `@paper-design/shaders/dist/*` (alias `#paper/*`), bo import z barrela wciągał wszystkie użyte shadery do wspólnego chunku (esbuild przypisuje chunki po grafie plików, nie po tree-shakingu). Rdzeń 14,4 KB gz, efekty 2,1–6,3 KB gz osobno. Dystrybucja przez `exports` upstreamu pozostaje nietknięta; przy bumpie wersji aliasy trzeba sprawdzić (nazwy plików w dist).

## Uzupełnienie z P3 (29.10.2026, pomiary w `docs/vitrine/devlog/P3-headless.md`)

- **D1/D8 potwierdzone w React 19 + Next 16.** Wrappery są cienkie (860 B gz) i `'use client'`; serwer renderuje tylko `<vitrine-shader>` z `<img>`, runtime elementu dochodzi po hydracji przez `import('vitrine-shaders')` jako osobny chunk (bez wrappera na stronie chunk nie jest ładowany wcale). Zero błędów hydracji w Chromium i WebKit: element nie jest jeszcze zdefiniowany w momencie hydracji, więc DOM jest dokładnie tym, co wysłał serwer; upgrade i warstwa `.vitrine-layer` dochodzą później.
- **D5 w headless:** obraz przez `next/image` idzie z `/_next/image`, więc tekstura jest same-origin także dla `cdn.shopify.com`; CORS CDN-u dotyczy tylko Liquid i czystego HTML. Element czyta `img.currentSrc`, więc srcset `next/image` działa bez zmian w elemencie.
- **Bramka wydajności:** LCP z VITRINE 755 ms vs 757 ms bez (Lighthouse mobile, mediana z 3, build produkcyjny), CLS 0. Koszt to TBT +134 ms (wypalanie kart, które są w viewporcie przy starcie).
- **Zmiana kolejności faz:** P3 zrobione przed P2, bo Liquid wymaga sklepu, a ten powstał w trakcie P3. Nie zmienia decyzji; `p3-headless` wychodzi z `p1-element`.

## Uzupełnienie z P2 (29.10.2026, pomiary w `docs/vitrine/devlog/P2-liquid.md`)

- **D5 potwierdzone na sklepie Piotrka** (`niwwts.myshopify.com`): `access-control-allow-origin: *` na `cdn.shopify.com/s/files/…`, na `<sklep>/cdn/shop/files/…` i na assetach motywu; tekstura działa w Chromium i WebKit. `image_url` zwraca dziś URL na domenie sklepu, więc wariant „store” jest tym, którego używa Liquid.
- **D7 doprecyzowanie: jeden plik `assets/vitrine.js`** (44 KB gz) zamiast chunków. Folder assets jest płaski, a `asset_url` dokleja `?v=`, więc dynamiczny import względny byłby niezweryfikowanym założeniem. Dedup ładowania robi przeglądarka (jeden URL modułu = jedno wykonanie; 26 tagów → 1 żądanie), nie Liquid.
- **Reveal: jawny `[data-vitrine-card]` ma pierwszeństwo nad najbliższym `a`.** W Horizon link klawiaturowy karty jest rodzeństwem obrazu (stretched link), a wrapper obrazu to `a.contents`, którego nie da się sfokusować. Bez markera reveal z klawiatury nie działał. Zmiana w elemencie (P1 kod), udokumentowana w API.md, test na sklepie.
- **Reveal po ponownym setupie** odczytuje `:focus-within` zamiast czekać na `focusin` (flaky test WebKit → błąd elementu; P2 devlog).
- **Bramka wydajności w motywie:** Lighthouse mobile na CDN, kolekcja 12 kart: 100 vs 99, LCP 1 808 vs 1 938 ms, CLS 0. Pomiar przez proxy `theme dev` odrzucony (LCP ~10 s w obu wariantach, artefakt proxy).
- **Sekcje:** szerokość strony przez `--page-width` motywu z fallbackiem 1200 px, bo sekcja VITRINE nie wie, jak motyw liczy marginesy; ustawienia width/padding w schemacie.
