# P4 · Paper: presety, strona demo, README

Data: 29.10.2026. Gałąź `p4-paper` (od `p2-liquid`). Plik Paper **„VITRINE — presets”**:
https://app.paper.design/file/01M64ER5PDV2TPY8N2M73DBSZP (strony „Page 1” = ramki presetów, „Demo page” = projekt strony).

## Skille

| Skill | Po co | Co zmienił w wyniku |
| --- | --- | --- |
| awwwards-art-director | kierunek strony demo przed pierwszą ramką | brief z Lockiem: arkusz drukarski NIWWTS „jak instrukcja z paczki”; hero z hasłem „Print it once.” zamiast „No.06” (strona jest o narzędziu, katalog jest treścią, nie bohaterem); sekcja „Three lines, three stacks” z trzema kolumnami kodu o różnych szerokościach 38/29/27 |
| piotrek-frontend-design | przeniesienie z płótna do kodu | `examples/static/index.html` + `styles.css` z sekcjami i proporcjami z płótna (38/62, 38/29/27), tytuł hero 150 px na 1440 (clamp), bez nowych zależności |
| taste-guardrail | Lock przed projektem, Exit Check przed oddaniem | Lock w devlogu/process.md; Exit Check niżej |
| web-copy | teksty EN strony i README | karta głosu: „developer, który to zbudował, mówi do developera” (zero marketingu, liczby z devlogów, jedno zdanie = jedna rzecz); README czyta się w 30 s: co to jest, GIF, 3 instalacje po 3–5 linijek; pass anty-slop: bez trójek, bez „not only… but”, bez pustych podsumowań |
| a11y-gate | nowe sekcje demo | nagłówki h1 → h2 w kolejności, `dl` dla tabeli efektów, kod w `pre` czytelny (papier na tuszu 15,7:1), link GitHub w masthead jako prawdziwy link |
| niwwts-aesthetic | arbiter: presety i strona | ramki presetów trzymają paletę (acid tylko w wariancie B mesh); strona: jeden akcent w tekście, oranż tylko jako powierzchnia (editorial), zero cieni |

## X1 · presety (czeka na Piotrka)

Zbudowane przez MCP: tokeny (`--color-paper/ink/blue-rice/orange/acid`, Archivo, rozmiary), 4 ramki 1440×900, po 3 sloty 432×518 ze zdjęciami NIWWTS (JPG; WebP i 8-bit PNG nie wchodziły przez `paper-asset://`) i parametrami startowymi pod slotem. Zrzuty: `docs/media/p4-paper-presets-{dither,halftone,mesh,paper}.png`.

**Stan: strojenie nie wykonane** (Piotrek, 40 min). Po „gotowe”: odczyt parametrów warstw (MCP `get_jsx`/`get_computed_styles` na warstwie shadera; plan B: eksport React do `docs/vitrine/paper-export/`), zapis do `presets/*.json`, `pnpm test` + `pnpm test:e2e` (testy zgodności z shaders-react na nowych presetach), tabela „przed / po” w `process.md`.

## X2 · strona demo

Płótno: `docs/media/p4-paper-demo-1440.png`, `p4-paper-demo-390.png`. Kod: `docs/media/p4-demo-1440.png`, `p4-demo-390.png`. Różnice między płótnem a kodem, zamierzone: w kodzie zostaje sekcja edytorska z paper-texture (wszystkie 4 efekty na jednej stronie); katalog w kodzie ma 24 karty, płótno pokazuje 8 + płytę; raster na płótnie to przybliżenie ImageMagick (ordered dither 8×8, 2 tony), w kodzie liczy go shader.

Decyzja: strona demo zostaje w `examples/static/index.html` (ten sam markup, co sekcje Liquid i Next; osobna strona w `docs/` dublowałaby katalog i fixtures).

```
$ pnpm exec playwright test packages/element/e2e/static.spec.ts --project=chromium
2 passed (12.4s)
```

## X3 · README i GIF-y

- `README.md` (EN): 802 słowa; co to jest, GIF karty, dlaczego, instalacja Liquid / React / HTML, API skrót, tabela wydajności z trzech stacków, limity, licencja.
- `docs/media/vitrine-card-reveal.gif`: Playwright (nagranie wideo, hover na 3 kartach) → ffmpeg (paleta 96 kolorów, 15 fps, 800 px) = **2,50 MB** (`node scripts/gif-card.mjs`).
- `docs/media/vitrine-theme-editor.gif`: nagranie z edytora motywu w Chrome (zmiana koloru 3 hero na acid, mesh przebudowuje się na żywo), 8 klatek = **1,93 MB**.

```
$ ls -lh docs/media/*.gif
2,5M docs/media/vitrine-card-reveal.gif
1,9M docs/media/vitrine-theme-editor.gif
```

## X4 · process.md

`docs/vitrine/process.md`: co na płótnie, co agent, co Piotrek; notatki do wpisu (JPG vs WebP w MCP, mesh jako klatka z żywego elementu).

## Exit Check (taste-guardrail) 12/13 na stronie demo

Lock ✔ · font ✔ · akcent + faktura ✔ · złamanie siatki (płyta na mesh, lead 2 kolumny, kolumny 38/29/27) ✔ · sygnatura ✔ · hierarchia ✔ · Tells: brak ✔ · kontekst ✔ · ciepło ✔ · izolacja ✔ · grupowanie ✔ · głębia bez cieni ✔ · napięcie: ✘ częściowo (sekcja „Made with Paper.” jest symetryczna i grzeczna).

## Momenty na content

1. Ramka presetów w Paperze obok tej samej karty w sklepie (po strojeniu).
2. GIF edytora: suwak koloru → mesh.
3. Płótno 1440 obok strony 1440.

## Pominięte

- Strojenie presetów (X1) i tabela przed/po: czeka na Piotrka.
- Podgląd shaderów na płótnie przez MCP: brak takiej możliwości w narzędziach; mesh w mocku to klatka z żywego elementu.
- GIF edytora pokazuje motyw deweloperski (nazwa „VITRINE test (p2)”), nie sklep produkcyjny; tak ma być.

## Kroki ręczne (Piotrek)

1. X1 w Paperze (40 min), potem „gotowe”.
2. Bramka P4: README jak obcy developer (30 s), strona demo na telefonie: `pnpm build && pnpm serve` → `http://<ip-maca>:4173/examples/static/`.
