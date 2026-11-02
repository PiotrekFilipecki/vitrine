// Store demo (Q1): page script shared by index.html and product.html. No bundler, no framework.
//  1. Pre-order dates roll with the calendar: the release is always nine days from today (the footer says so), so
//     the frost on the page is the frost a real pre-order would show nine days out. Must run before the element
//     reads `bind`, which it does when it is imported (step 3).
//  2. Probe for the e2e tests and the devlog: ready events, modes, fallbacks (window.__vitrine).
//  3. The photo first, the glass after (Q0 finding): the element is imported once the LCP photo has decoded and
//     painted (two frames), so the LCP frame never waits for the element's JS. `?effects=off` keeps it out
//     (Lighthouse comparison).
const DAY = 86_400_000;
const LEAD_DAYS = 9;
const q = new URLSearchParams(location.search);

function rollDates() {
  const now = Date.now();
  // Release at 10:00 UTC, nine days out.
  const release = new Date(Math.floor((now + LEAD_DAYS * DAY) / DAY) * DAY + 10 * 3_600_000);
  const iso = release.toISOString().replace('.000', '');
  for (const el of document.querySelectorAll('vitrine-shader[data-release]'))
    el.setAttribute('bind', `date:${iso}`);
  // The scale: the same release seen 30, 7 and 1 day before it, and on the day.
  for (const el of document.querySelectorAll('vitrine-shader[data-days-before]')) {
    const days = Number(el.getAttribute('data-days-before'));
    const to = new Date(now + days * DAY - (days === 0 ? 3_600_000 : 0));
    el.setAttribute('bind', `date:${to.toISOString().replace(/\.\d+Z$/, 'Z')}`);
  }
  const day = release.getUTCDate();
  const month = release.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });
  for (const el of document.querySelectorAll('[data-release-label]')) {
    // Cards are narrow (two columns on a phone): the short form keeps the tag on one line.
    el.textContent =
      el.getAttribute('data-release-label') === 'short'
        ? `Pre-order · ${day} ${month.slice(0, 3)}`
        : `Pre-order · ships ${day} ${month}`;
  }
  for (const el of document.querySelectorAll('[data-release-date]')) {
    el.innerHTML = `Ships<br />${day} ${month.slice(0, 3)}`;
  }
}

const stats = { dclAt: 0, readyCount: 0, modes: {}, fallbacks: [], ready: [], msAllReady: null, elements: 0 };
window.__vitrine = stats;
const t0 = performance.now();

function probe() {
  stats.dclAt = +(performance.now() - t0).toFixed(1);
  stats.elements = document.querySelectorAll('vitrine-shader').length;
  document.addEventListener('vitrine:ready', (e) => {
    stats.readyCount += 1;
    stats.modes[e.detail.mode] = (stats.modes[e.detail.mode] ?? 0) + 1;
    stats.ready.push({
      effect: e.detail.effect,
      mode: e.detail.mode,
      cached: e.detail.cached,
      ms: e.detail.ms,
      bake: e.detail.bake ?? null,
      at: +(performance.now() - t0).toFixed(1),
    });
    if (stats.readyCount === stats.elements) stats.msAllReady = +(performance.now() - t0).toFixed(1);
  });
  document.addEventListener('vitrine:fallback', (e) => stats.fallbacks.push(e.detail));
}

function importAfterLcp() {
  if (q.get('effects') === 'off') return;
  const lcp = document.querySelector('[data-lcp] img, .hero__photo img, .pdp__media img');
  const later = () =>
    requestAnimationFrame(() => requestAnimationFrame(() => import('../../packages/element/dist/index.js')));
  (lcp ? lcp.decode().catch(() => undefined) : Promise.resolve()).then(later);
}

// Module scripts run after parsing: the DOM is complete here.
rollDates();
probe();
if (document.readyState === 'complete') importAfterLcp();
else addEventListener('load', importAfterLcp, { once: true });

// Cart counter (product pages): a demo, nothing is stored.
let inCart = 0;
for (const button of document.querySelectorAll('[data-add]')) {
  button.addEventListener('click', () => {
    inCart += 1;
    for (const c of document.querySelectorAll('[data-cart]')) c.textContent = `Cart (${inCart})`;
  });
}
