# P5 · Przegląd, wydanie 0.1.0, zgłoszenie

Data: 29.10.2026. Gałąź `p5-wydanie` (od `p4-paper`). Nic nie opublikowane, nic nie wypchnięte, nic nie wysłane.

## Skille

| Skill | Po co | Co zmienił w wyniku |
| --- | --- | --- |
| code-reviewer | W1, przegląd całego repo (osobny agent, read-only) | werdykt COMMENT 7/10, 0 blokerów, 2 HIGH, 11 MEDIUM, 6 NIT; zrobione przed tagiem: H1 (id nagłówka hero + `aria-labelledby`), M5, M6, M9 (`config.test.ts`, +6 testów → 38), M10b, N6; reszta w `docs/vitrine/review.md` jako follow-up |
| security-perf-auditor | W2, sekrety i konfiguracja | skan grepem drzewa roboczego i całej historii git (`shpat_`, `shpss_`, `AKIA`, `sk_live_`, `ghp_`, klucze PEM, `STOREFRONT_PUBLIC_TOKEN=`): 0 trafień poza komentarzem z placeholderem `--store-password …`; `.env*` w `.gitignore` z wyjątkiem `.env.example` (bez wartości); hasło sklepu przechodziło tylko przez schowek → flaga CLI / env; `npx secretlint` zablokowany przez klasyfikator uprawnień; potem `brew install gitleaks` i `gitleaks detect --source . --log-opts=--all`: **18 commitów, no leaks found**; skan drzewa bez gita (`--no-git`) zgłasza 8 trafień `generic-api-key`, wszystkie w `examples/next-headless/.next/` (klucze podglądu generowane przez Next przy buildzie, folder ignorowany, nie trafia do repo) |
| web-copy | W5, teksty zgłoszeń | `docs/vitrine/submission.md`: formularz Codrops 118 słów, komentarz 276 znaków, post na X, Discord, konspekt artykułu; liczby tylko z devlogów; linki `TODO_*` do podmiany po upublicznieniu |

## W3 · wydanie

- Wersja **0.1.0** w `packages/element` i `packages/react`; `CHANGELOG.md`.
- `vitrine-shaders/react`: `scripts/assemble-react.mjs` kopiuje `packages/react/dist` do `packages/element/dist/react` i zamienia import `vitrine-shaders` na `../index.js` (bez self-reference w bundlerach); `exports["./react"]`, `peerDependencies` react/react-dom jako opcjonalne. Krok w `pnpm build`.
- `packages/element/README.md` (paczka miała `files: README.md` bez pliku).

```
$ cd packages/element && npm publish --dry-run
npm notice Tarball Contents
  LICENSE 11.3kB · NOTICE 364B · README.md 1.4kB · dist/index.js 54.0kB · dist/index.d.ts · dist/chunks/* (dither, halftone, mesh, paper, 4 shared) · dist/react/index.js 2.4kB · dist/react/index.d.ts · package.json
npm notice total files: 26 · package size: 135.8 kB · unpacked size: 405.3 kB
+ vitrine-shaders@0.1.0   (dry-run; bez testów, fixtures, presets źródłowych)

$ pnpm pack:theme
release/vitrine-shopify-theme-0.1.0.zip: 12 files, 132 024 B (sections ×2, snippets ×2, assets ×2, README, settings fragment)

$ pnpm check:theme
5 files inspected with 1 total offenses found across 1 files. 1 warnings.   (OrphanedSnippet, oczekiwane)

$ pnpm lint → All matched files use Prettier code style!
$ pnpm typecheck → 0 błędów
$ pnpm test → Tests 38 passed (38)   (po poprawkach z review: +6 w config.test.ts)
$ pnpm exec playwright test --project=chromium --project=webkit   (po poprawkach z review i przebudowie)
67 passed, 11 skipped (2.0m)
```

Tag `v0.1.0` lokalnie: TAG_PENDING (po merge gałęzi i presetach z P4; tag na commicie wydania).

## W4 · ROADMAP.md

v2 app z Theme App Extension (z ograniczeniem kart z PLAN D12), więcej efektów, chunki `vitrine.js`, Svelte/Vue/Astro, presety społeczności, pokrycie motywów, overlay jako canvas 2D.

## W6 · checklista

W `docs/vitrine/STATUS.md`, sekcja „Przed upublicznieniem”.

## Pominięte

- Publikacja npm, push, tag na zdalnym, wysyłka zgłoszeń: Piotrek.
- `gitleaks`: do instalacji (brew) i uruchomienia ręcznie.
- Presety finalne z P4 (X1) mogą zmienić `presets/*.json` i zrzuty; wtedy `pnpm test:e2e` i ponowny dry-run przed publikacją.
