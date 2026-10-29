# Code review · VITRINE 0.1.0 (P5 · W1)

Przegląd całego repo przez osobnego agenta z rolą `code-reviewer` (czytelność, clean code, testy; bez security/perf,
które ma `security-perf-auditor` w P5 devlogu). Zakres: `packages/element/src`, `packages/element/e2e`, `scripts`,
`packages/react/src`, `examples/next-headless/{app,components,lib}`, `shopify-theme/{sections,snippets}`.

**Werdykt: COMMENT · 7/10.** Brak blokerów. Poniżej status każdej uwagi: **zrobione** w P5 albo **follow-up**
(osobny PR po 0.1.0, bez zmiany zachowania).

## Zrobione przed tagiem 0.1.0

| # | Uwaga | Zmiana |
| --- | --- | --- |
| H1 | `vitrine-hero.liquid`: `aria-labelledby` wskazywało id, którego sekcja nie renderowała; setting `heading_id` był wolnym tekstem bez `escape` | nagłówek bloku dostaje `id="vitrine-hero-title-{{ section.id }}"`, sekcja `aria-labelledby` tylko gdy ma bloki; setting usunięty; asercja w `theme-markup.spec.ts`, że `aria-labelledby` się rozwiązuje |
| M5 | `loadTexture(src, contentLoadedOk)`: flaga zawsze `true`, `key` = alias `src` | parametr usunięty, warunek opisany w JSDoc (element i tak czeka na `whenContentImageLoaded`) |
| M6 | `noise.ts` cache'ował odrzucony promise na zawsze | `.catch` czyści cache i rzuca dalej; jedno przejściowe `decode()` failure nie psuje halftone/paper do przeładowania |
| M9 | `config.ts` bez testów | `config.test.ts`: defaults, walidacja `maxLive` (0 / 1.5 / −1), `bakeIdleMs`, `minPixelRatio`, `maxPixelCount` set/clear, merge, reset (6 testów) |
| M10b | `storefrontProduct` zwracał produkt z `image.url === ''` → `<Image src="">` na stronie produktu | zwraca `null` (404) bez `featuredImage`, spójnie z listą |
| N6 | Vitest 5 ignorował `esbuild.jsx` i ostrzegał przy każdym runie | opcja usunięta (oxc obsługuje JSX automatycznie) |

## Follow-up (po 0.1.0)

- **H2** · e2e: `scrollThrough`, `waitBaked`, kolektor konsoli, `tab` dla WebKit i test klawiatury skopiowane 3–4× (`grid`, `theme-markup`, `store`, `next.spec`), z rozjazdami (filtr `ResizeObserver loop` tylko w dwóch). Wyciągnąć do `packages/element/e2e/shared.ts` (`BAKE_IDLE_SETTLE_MS`, `tabKey`, `scrollThrough`, `waitBaked`, `expectKeyboardReveal`), `next.spec` importuje względnie.
- **M1** · `element.ts #acquireLive`: `pool.acquire` w obu gałęziach; uprościć do jednego wywołania.
- **M2** · `reducedMotion ??= matchMedia(...)` dwa razy (`prefersReducedMotion`, `connectedCallback`) → `reducedMotionQuery()`.
- **M3** · `#setup` 110 linii, `#setupBaked` 7 argumentów → `SetupPlan` + `#resolvePlan(run)` + `#alive(run)`.
- **M4** · `attributeChangedCallback` ignoruje nazwę atrybutu (zmiana `debug` robi pełny re-bake) i `#readySent` nie resetuje się przy zmianie `preset`/`params` (drugi `vitrine:ready` nie wychodzi). Decyzja do podjęcia: „ready raz na połączenie” (udokumentować) albo reset przy zmianie efektu/presetu; `reveal` przełączać bez re-setupu.
- **M7** · helpery `n`/`color` w `halftone.ts` i `paper.ts` skopiowane; `dither.ts`/`mesh.ts` inlinują fallbacki literałami dublującymi `presets/*.json` → `effects/readers.ts`.
- **M8** · `baker.ts #run` 60 linii → `readPixelsFlipped()` + `encodePng()`.
- **M10a** · Next: wzorzec `effects ? <XShader>{img}</XShader> : <span>{img}</span>` ×3 i `width ?? 1600` ×3 → `ShaderMedia`.
- **M11** · Liquid: `image_url | image_tag` w obu gałęziach snippetu (→ `capture`), cztery bloki `if color_N` w hero (→ pętla po `split`).
- **N1** · `react/types.ts`: `React.HTMLAttributes` przez globalny namespace → `import type { HTMLAttributes } from 'react'`.
- **N2** · `get state(): string` gubi typ → eksport `VitrineState`.
- **N3** · `lib/fixtures.ts`: `kind` = identyczność, `slugify()` do helpera.
- **N4** · `lighthouse.mjs` komunikat błędu pomija `store`; `lighthouse.mjs` i `gif-card.mjs` czekają na serwer stałym `setTimeout` → poll.
- **N5** · `fallback.spec.ts`: `waitForDone` dwa razy → `readSpike(page)`.
- Testy do dopisania: `reveal.ts` (jsdom: touch vs mouse, tap-outside, `focusout` z `relatedTarget`), `register.ts` (memoizacja, no-op bez `window`), `noise.ts` (retry po failure), `texture.ts` (`whenContentImageLoaded` dla `complete && naturalWidth === 0`, `isCrossOrigin` dla złych URL), element: kontrakt `vitrine:ready` po decyzji M4.

## Co recenzent uznał za dobre

Komentarze cytują pomiary i ADR; wzorzec `run`/`alive()` + jeden `#teardownRuntime`; `reveal.ts` z jedną odpowiedzialnością i uzasadnieniem `data-vitrine-card`; `effects.test.ts` z wartościami przepisanymi ręcznie z shaders-react (nie tautologia); asercja na dokładny HTML SSR we wrapperach; Liquid z `escape` na settingach text, `richtext` surowy, `shopify_attributes` na blokach, `info` w schemacie.

## Pokrycie

Unit (38 po P5): params, pool, LRU, mapowanie uniformów 4 efektów, powierzchnia paczki, SSR wrapperów, config.
E2E (Chromium + WebKit; Firefox niezmierzony): piksele vs shaders-react (8), fallbacki, budżet kontekstów, klawiatura/hover/reduced-motion, markup z theme, build Next, dev store (opt-in).
Zastrzeżenie recenzenta: e2e opiera się na stałej `waitForTimeout(2200)` sprzężonej z `bakeIdleMs`; przy zmianie configu testy wygasną po cichu → stała w `shared.ts` (H2).
