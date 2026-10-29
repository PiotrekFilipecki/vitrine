// Lighthouse (mobile, performance only) on examples/static with and without effects, 3 runs each, median.
// Uses Playwright's Chromium through the remote-debugging port, no extra Chrome needed.
// Usage: node scripts/lighthouse.mjs   (needs `pnpm build` first; starts its own static server on :4199)
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4199;
const DEBUG_PORT = 9333;
const RUNS = 3;
const URLS = {
  effects: `http://localhost:${PORT}/examples/static/`,
  noEffects: `http://localhost:${PORT}/examples/static/?effects=off`,
};

const server = spawn('node', [`${root}scripts/serve.mjs`, String(PORT)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const browser = await chromium.launch({ args: [`--remote-debugging-port=${DEBUG_PORT}`] });

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

const out = { date: new Date().toISOString(), runs: RUNS, results: {} };
try {
  for (const [key, url] of Object.entries(URLS)) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      const r = await lighthouse(url, {
        port: DEBUG_PORT,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance'],
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
  writeFileSync(`${root}docs/media/p1-lighthouse.json`, JSON.stringify(out, null, 2));
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
