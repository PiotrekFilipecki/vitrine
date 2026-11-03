# ADR-0003: v0.2 = trzy efekty (szyba, szyba przedsprzedaży, lupa)

## Status

Accepted (02.11.2026, faza Q1). Wykonuje decyzję Piotrka z bramki R0 (30.10.2026, ADR-0002 §„Bramka R0”, raport Cowork `docs/vitrine/raport-weryfikacji-R0.md`). Zastępuje PROMPTY-v02 Q1–Q4 (prompt: `docs/vitrine/PROMPT-Q1.md`). Nie zmienia ADR-0001 (jeden runtime, obraz pod spodem, bake + pula, jedna paczka npm); dokłada do niego jeden mechanizm: slot interakcji.

## Kontekst

R0 pokazało dziesięć kandydatów Papera na zdjęciach produktów. Przez poprzeczkę „czy sklep premium by to wypuścił” przeszły trzy, wszystkie oparte na dwóch shaderach, których element v0.1 nie miał: `fluted-glass` (karta za szybą; ta sama szyba matowiejąca do daty premiery) i `lens-distortion` (lupa na stronie produktu). Makieta R0 (`examples/static/r0-hero.html`) montowała je przez `@paper-design/shaders-react` i trzymała 2–3 żywe konteksty WebGL na stałe (hero z dwiema szybami + karta). Biblioteka ma działać w Liquid, HTML i React z tym samym API i z budżetem z ADR-0001: 0 żywych kontekstów po załadowaniu.

## Decyzja

1. **Dwa nowe efekty elementu:** `effect="glass"` (fluted-glass) i `effect="lens"` (lens-distortion). Mapowanie parametrów 1:1 z `shaders-react` 0.0.82 (`effects/glass.ts`, `effects/lens.ts`, test zgodności pikseli jak dla v0.1). Presety w `presets/glass.json` (`default` = upstream, `window` = R0 A „Window”, `preorder-30`, `preorder-7`, `preorder-1` = arkusz R0 pre-order) i `presets/lens.json` (`default`, `loupe` = R0 A „Loupe”), przeniesione z `examples/r0/effects.js` bez zmian (test `q1.test.ts` porównuje je z plikiem R0).
2. **Co jest live, a co bake.**
   - Szyba w spoczynku = **bake** (wypalona klatka przez wspólny piekarnik, 0 kontekstów). Odsłonięcie (hover myszą, tap, fokus klawiatury; Enter/Spacja na fokusowalnej powierzchni, która nie jest linkiem) = szyba odjeżdża w prawo (`marginLeft` 0 → 1) na **jednym** żywym kontekście, tylko na czas przejścia (otwarcie 520 ms, zamknięcie 380 ms, ease-out cubic, bez overshoot: R0). Szyba otwarta do końca = sama treść `<img>` (warstwa schowana), więc otwarta karta też nie trzyma kontekstu. Kontekst znika 400 ms po końcu przejścia.
   - Szyba przedsprzedaży = **bake** zawsze: siła szyby liczona raz przy montażu z `bind="date:…"` i wypalana; na stronie nie chodzi żaden zegar. Od dnia premiery: czyste zdjęcie, bez warstwy (`data-vitrine-state="clear"`).
   - Lupa = **live** tylko pod wskaźnikiem (mysz/pióro nad zdjęciem albo dotyk przytrzymany 350 ms); bez wskaźnika czyste zdjęcie bez kontekstu (`interactive`). Rośnie 350 ms, maleje 250 ms (R0).
3. **Slot interakcji (nowy, `motion.ts`).** Przejścia szyby i lupa dzielą pulę o rozmiarze **1**. Nowa interakcja wywłaszcza poprzednią, która skacze do stanu końcowego bez animacji. Razem z pulą animowanych (≤ `maxLive`) i piekarnikami strona zostaje daleko pod limitem 16 kontekstów, a 10 szybkich hoverów po kartach daje maksymalnie 1 żywy kontekst. `VitrineShader.stats().interactionMounts` (nowe pole).
4. **Atrybut `bind`** (nowy, `bind.ts`): `none` (domyślnie dla glass), `pointer` (domyślnie dla lens), `date:<to>` albo przedział ISO 8601 `date:<from>/<to>`, plus forma JSON `{"date":{"from","to"}}`, którą piszą wrappery React. Krzywa daty: odcinkami liniowa po dniach do premiery między kotwicami R0 30 → 7 → 1 dzień, w ostatnim dniu od mrozu „1 dzień” do zera, od premiery czysto; ≥ 30 dni albo przed `from` = mróz „30 dni”. `from` skraca skalę: przedsprzedaż krótsza niż 30 dni zaczyna od pełnego mrozu (kotwice × okno/30).
5. **Atrybut `reveal`** dostaje wartość `tap` (klik/tap przełącza, hover i fokus nic nie robią). Bez atrybutu: glass = `hover` (mysz, tap, klawiatura), glass z `bind="date"` = `none` (mróz jest komunikatem, produktu jeszcze nie ma), pozostałe efekty = `none` jak w v0.1. Na linku tap otwierający szybę nie nawiguje, następny tak (bez tego na telefonie karta przechodzi od razu na PDP i szyby nie widać).
6. **Wrappery React** (`vitrine-shaders/react`), nazwy od momentu w sklepie i od tego, co renderują (obraz produktu), nie od techniki:
   - `GlassProductImage` — karta produktu za szybą (`glass/window`, reveal `hover`);
   - `PreorderGlassImage` — karta przedsprzedaży, prop `releaseDate` (+ opcjonalnie `preorderFrom`), serializowany do `bind`;
   - `LoupeImage` — zdjęcie na stronie produktu z lupą (`lens/loupe`, `bind="pointer"`).
     v0.1 (`ProductMediaShader`, `EditorialImageShader`, `CollectionHeroShader`) zostają bez zmian. Odrzucone nazwy: `FlutedGlassShader`/`LensShader` (nazwa techniki; klient sklepu szuka „karta”, „przedsprzedaż”, „lupa”), jeden `ProductImage` z propem `variant` (boolean/enum props zamiast kompozycji, react-next-perf).
7. **Liquid:** trzy snippety w `shopify-theme/snippets/`: `vitrine-glass-card` (karta), `vitrine-preorder-card` (karta przedsprzedaży), `vitrine-loupe-media` (PDP). Data premiery z **metapola produktu `custom.release_date`** (typ `date` albo `date_and_time`), opcjonalnie `custom.preorder_from`. Namespace `custom` to domyślna przestrzeń definicji metapól tworzonych w panelu Shopify (Settings → Custom data → Products), więc kupiec nie potrzebuje aplikacji; snippet przyjmuje też datę jako parametr, gdy motyw trzyma ją gdzie indziej.
8. **Obraz pod szybą skalowany jak shader.** Preset `window` ma `scale` 1,06 (żłobki nie próbkują poza zdjęciem, R0). Żeby ostatnia klatka otwarcia i `<img>` pod spodem były tym samym obrazem, element ustawia `--vitrine-image-scale` = `scale` i CSS skaluje `<img>` (transform, bez przesunięcia układu; `overflow: hidden` na elemencie). Warunek: `<img>` wypełnia pudełko jak `object-fit: cover` wyśrodkowany (tak liczy shader).

## Konsekwencje

Pozytywne: trzy efekty z R0 działają w Liquid, HTML i React z jednego elementu; w spoczynku 0 żywych kontekstów (szyba i przedsprzedaż wypalone, lupa nieobecna); w ruchu najwyżej 1. Presety i czasy ruchu są te, które przeszły bramkę R0. v0.1 działa bez zmian (test `index.test.ts` i dotychczasowe testy e2e).

Negatywne i dług:

- Hero z makiety R0 miał **dwie szyby rozchodzące się od kursora** (dwa żywe konteksty, odstęp 420/640 ms). W Q1 hero dostał jedną szybę jak karta; w Q1.1 drzwi wróciły na jednym kontekście (łatka shadera, „Uzupełnienie Q1.1” niżej).
- Pierwsza klatka przejścia czeka na nowy kontekst (kompilacja shadera + wgranie tekstury z mipmapami); do tego czasu widać wypaloną klatkę, więc nic nie mruga, ale start jest opóźniony o czas zmierzony w devlogu.
- `reveal="tap"` na linku zmienia zachowanie pierwszego kliknięcia (nie nawiguje). To świadome i opisane w API.md; kto chce nawigacji od razu, zostaje przy `hover`.
- Wartości VITRINE-only w presecie `loupe` (`loupeSize`, `zoom`) nie są propsami Papera; test zgodności je zdejmuje (jak `whitePoint`).

## Odrzucone

- **dissolve / resolve** (rozpuszczanie zdjęcia przy wejściu, „odsłanianie” produktu z szumu): to efekt dla efektu, nie odpowiada na żaden moment w sklepie; nie było go wśród kandydatów R0 i nie przeszedłby poprzeczki „produkt czytelniejszy niż bez efektu”.
- **Dither jako domyślny efekt kart:** odrzucony w ADR-0002 (zabiera produkt); w R0 `image-dithering` dostał ODPADA. Zostaje w elemencie jako efekt v0.1 dla marek graficznych, nie trafia do demo.
- **Sześć efektów z PROMPTY-v02 Q2** (galeria efektów w demo): negatyw z Locka („NIE może wyglądać jak galeria shaderów z Dribbble”) i wynik R0 (liquid-metal, pulsing-border, halftone, paper-texture odpadły; water, grain-gradient odłożone). Mniej efektów, ale pięknych.
- **Szyba animowana stale (live w spoczynku):** 24 karty × kontekst przekracza limit 16; bez sensu, skoro szyba w spoczynku się nie rusza.
- **Zegar na stronie dla przedsprzedaży** (szyba przeciera się na żywo): zero wartości dla kupującego w skali minut, koszt kontekstu; wartość liczona raz przy montażu wystarcza.

## Uzupełnienie Q1.1 (03.11.2026)

- **Drzwi w hero na jednym kontekście (dług z „Negatywne” spłacony).** Parametr VITRINE-only `doors` na `glass`: łatka
  shadera (`patchDoors`, jeden uniform `u_vitrineGap` = otwór od–do w osi x płótna) dzieli szybę na dwa skrzydła,
  każde z maską marginesów upstreamu, więc cięte krawędzie mają te same refleksy co brzegi. Ruch z makiety R0:
  szczelina 0,2 pod kursorem na hover (520 ms, kursor śledzony 160 ms), pełne otwarcie na tap/klik/fokus/Enter
  (640 ms), zamknięcie 380/420 ms. Łatka działa tylko w żywej interakcji (`EffectModule.interactionShader`);
  klatka spoczynku piecze się shaderem upstreamu (otwór 0 = maski upstreamu), więc testy zgodności pikseli dalej
  dotyczą shadera Papera. Łatka rzuca wyjątek, gdy upstream przesunie linie kotwiczące (jak `whitePoint`).
- **Kod interakcji jako osobny chunk** (`motion.ts`): strona tylko z efektami v0.1 go nie pobiera. Rdzeń
  (indeks + statyczne chunki, gzip): 24 442 → 22 569 B.
- **Motyw:** `vitrine-card-media` i fragment ustawień motywu dostają `glass` jako domyślny efekt kart (preset
  `window`); instalacje v0.1 zachowują zapisane wartości, bo ustawienia motywu są w danych sklepu.
