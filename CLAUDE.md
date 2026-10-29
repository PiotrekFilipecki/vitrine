# VITRINE · CLAUDE.md

Open-source bridge between Paper Shaders and Shopify: a `<vitrine-shader>` custom element (vanilla `@paper-design/shaders`) that works in Liquid themes, plain HTML and React 19 / Next.js. Goal: an entry in the Codrops "Paper, Curated" guide and a showcase for Piotr Filipecki's e-commerce services.

## Where things are

- Plan and decisions D1–D12: `docs/vitrine/PLAN.md` (decisions are settled; if a measurement contradicts one, write a proposal in the ADR, do not silently change it).
- Phase prompts P0–P5: `docs/vitrine/PROMPTY.md`. One phase = one fresh session. Read the previous phase devlog first (`docs/vitrine/devlog/`).
- ADRs: `docs/adr/` (ADR-0001 = architecture + what the P0 spikes showed).
- Status and gates: `docs/vitrine/STATUS.md`.
- Upstream reference clone (outside the repo): `~/Desktop/Projects/_ref/paper-shaders`.

## Rules

- **Skills are mandatory.** Each phase lists required skills; load them before writing the first line, add others as needed. A skill missing from the environment is stated explicitly and recorded in the devlog, never skipped silently. Every devlog has a table: skill · why · what it changed in the result (an empty "what it changed" column means the skill was only named).
- **Anything visual** (demo page, default presets, section look, README GIFs): `taste-guardrail` Lock before the build and Exit Check before handing over, plus art direction via `awwwards-art-director` or `piotrek-frontend-design` before the first frame or line. The demo is NIWWTS (PLAN D13), so `niwwts-aesthetic` is the style arbiter of every visual phase: load it before any demo page, preset or section look, and let it say no.
- **One branch per phase** (`pN-name`), merge to `main` only after Piotrek passes the gate.
- **Exact version pins**, no `^` or `~`. `@paper-design/shaders` is pinned to `0.0.82`; upstream ships breaking changes under 0.0.x, so bumps go through the ADR and the pixel-compatibility tests.
- **`LICENSE` and `NOTICE` of Paper Shaders in `third_party/paper-shaders/` are untouchable** and ship with every redistribution (npm package, `shopify-theme/assets/vitrine.js` header). Keep "Powered by Paper Shaders" in README and demo.
- **Client stores are off limits, all of them.** Never touch client stores, not even read-only: no requests to friendzstore.pl, friendzdev.myshopify.com, emwuhats.pl or their CDN paths, no downloading their photos, no storefront logins. Tests and theme pushes go to Piotrek's own dev store `niwwts` (niwwts.myshopify.com, created 29.10.2026) or use Shopify-owned resources and synthetic fixtures.
- Numbers only from measurements; write "unmeasured" otherwise. Show full command output in devlogs, not summaries.

## Commands

```
pnpm install
pnpm build        # tsup for packages/*
pnpm typecheck    # tsc root + packages
pnpm lint         # eslint + prettier --check
pnpm test         # vitest (unit)
pnpm test:e2e     # playwright (chromium, webkit, firefox) against scripts/serve.mjs on :4173
pnpm serve        # static server for examples/ and spikes
```
