// Lighthouse (mobile, performance only), with and without effects, 3 runs each, median.
// Uses Playwright's Chromium through the remote-debugging port, no extra Chrome needed.
// Usage: node scripts/lighthouse.mjs store    → VITRINE_STORE_URL (theme dev proxy), docs/media/p2-lighthouse.json
//        node scripts/lighthouse.mjs static   → examples/static on scripts/serve.mjs :4199, docs/media/p1-lighthouse.json
//        node scripts/lighthouse.mjs next     → examples/next-headless production build (next start :4198), docs/media/p3-lighthouse.json
// Both need `pnpm build` first.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const DEBUG_PORT = 9333;
const RUNS = 3;
const target = process.argv[2] ?? 'static';

const TARGETS = {
  static: {
    port: 4199,
    server: () => spawn('node', [`${root}scripts/serve.mjs`, '4199'], { stdio: 'ignore' }),
    urls: (p) => ({
      effects: `http://localhost:${p}/examples/static/`,
      noEffects: `http://localhost:${p}/examples/static/?effects=off`,
    }),
    out: 'p1-lighthouse.json',
  },
  next: {
    port: 4198,
    server: () =>
      spawn('pnpm', ['--filter', 'next-headless', 'exec', 'next', 'start', '-p', '4198'], {
        cwd: root,
        stdio: 'ignore',
      }),
    urls: (p) => ({ effects: `http://localhost:${p}/`, noEffects: `http://localhost:${p}/?vitrine=off` }),
    out: 'p3-lighthouse.json',
  },
  store: {
    // The dev store: VITRINE_STORE_URL = the `shopify theme dev` proxy (http://127.0.0.1:9292), or the real
    // storefront (https://<store>.myshopify.com) with VITRINE_STORE_PASSWORD (password page cookie is fetched
    // once with Playwright) and VITRINE_PREVIEW_THEME_ID (unpublished theme to preview).
    // "noEffects" = the same collection page with vitrine.js blocked by Lighthouse (blockedUrlPatterns): same HTML,
    // the element never upgrades, the plain images stay.
    port: 0,
    server: () => ({ kill() {} }),
    urls: () => {
      const q = process.env.VITRINE_PREVIEW_THEME_ID
        ? `?preview_theme_id=${process.env.VITRINE_PREVIEW_THEME_ID}`
        : '';
      return {
        effects: `${process.env.VITRINE_STORE_URL}/collections/all${q}`,
        noEffects: `${process.env.VITRINE_STORE_URL}/collections/all${q}`,
      };
    },
    out: 'p2-lighthouse.json',
  },
};
const cfg = TARGETS[target];
if (!cfg) throw new Error(`unknown target "${target}" (static | next)`);

const server = cfg.server();
await new Promise((r) => setTimeout(r, target === 'next' ? 2500 : 800));
const browser = await chromium.launch({ args: [`--remote-debugging-port=${DEBUG_PORT}`] });

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

let extraHeaders;
if (target === 'store' && process.env.VITRINE_STORE_PASSWORD) {
  // Storefront password → storefront_digest cookie, passed to every Lighthouse request. Never logged.
  const page = await browser.newPage();
  await page.goto(`${process.env.VITRINE_STORE_URL}/password`);
  await page.fill('input[type="password"]', process.env.VITRINE_STORE_PASSWORD);
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');
  if (page.url().includes('/password')) throw new Error('storefront password not accepted');
  // The password session lives in Shopify's essential cookie now (no storefront_digest any more): send them all.
  const cookies = await page.context().cookies();
  extraHeaders = { Cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; ') };
  await page.close();
}

const out = { date: new Date().toISOString(), target, runs: RUNS, results: {} };
try {
  for (const [key, url] of Object.entries(cfg.urls(cfg.port))) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      const r = await lighthouse(url, {
        port: DEBUG_PORT,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance'],
        ...(extraHeaders ? { extraHeaders } : {}),
        ...(target === 'store' && key === 'noEffects' ? { blockedUrlPatterns: ['*vitrine.js*'] } : {}),
      });
      const a = r.lhr.audits;
      runs.push({
        score: Math.round((r.lhr.categories.performance.score ?? 0) * 100),
        lcpMs: Math.round(a['largest-contentful-paint'].numericValue),
        cls: +a['cumulative-layout-shift'].numericValue.toFixed(3),
        tbtMs: Math.round(a['total-blocking-time'].numericValue),
        fcpMs: Math.round(a['first-contentful-paint'].numericValue),
        lcpElement:
          a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet ?? null,
      });
      console.log(key, i + 1, runs[i]);
    }
    out.results[key] = {
      runs,
      median: {
        score: median(runs.map((x) => x.score)),
        lcpMs: median(runs.map((x) => x.lcpMs)),
        cls: median(runs.map((x) => x.cls)),
        tbtMs: median(runs.map((x) => x.tbtMs)),
        fcpMs: median(runs.map((x) => x.fcpMs)),
      },
    };
  }
  out.deltaLcpMs = out.results.effects.median.lcpMs - out.results.noEffects.median.lcpMs;
  mkdirSync(`${root}docs/media`, { recursive: true });
  writeFileSync(`${root}docs/media/${cfg.out}`, JSON.stringify(out, null, 2));
  console.log(
    JSON.stringify(
      {
        effects: out.results.effects.median,
        noEffects: out.results.noEffects.median,
        deltaLcpMs: out.deltaLcpMs,
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
  server.kill();
}
