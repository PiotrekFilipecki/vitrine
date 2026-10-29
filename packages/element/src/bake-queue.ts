/**
 * Q0 · B4: one global queue for the synchronous part of every bake (texture upload, draw, readback).
 *
 * v0.1 chained bakes as promise continuations, so one macrotask could run a dozen bakes back to back: Lighthouse
 * mobile saw a single 854 ms task on the demo page (Q0 devlog). Now every bake gets its own task:
 *   - elements near the viewport go first, one per frame (rAF → macrotask), in the order they asked;
 *   - the rest waits for `requestIdleCallback` (fallback: a 50 ms timeout, Safari has no rIC), one per idle period;
 *   - "near" is re-checked when a slot is handed out, so scrolling promotes cards that just came into view.
 * The queue does not change what is rendered, only when: same pixels, same cache keys.
 */

type Grant = () => void;

interface Waiter {
  el: Element | null;
  grant: Grant;
  seq: number;
}

const waiting: Waiter[] = [];
let seq = 0;
let busy = false;
let pumpScheduled = false;

/** Viewport expanded by half a screen above and below: those cards are what the visitor sees first. */
function isNear(el: Element | null): boolean {
  if (!el || typeof window === 'undefined') return true;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  const margin = vh * 0.5;
  return r.bottom >= -margin && r.top <= vh + margin && r.right >= 0 && r.left <= vw;
}

function nextFrameTask(cb: () => void): void {
  if (typeof requestAnimationFrame === 'undefined') {
    setTimeout(cb, 0);
    return;
  }
  // rAF fires before paint; the timeout lands after it, so the bake starts in a fresh task once the frame is out.
  requestAnimationFrame(() => setTimeout(cb, 0));
}

function idleTask(cb: () => void): void {
  const ric = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
    .requestIdleCallback;
  if (typeof ric === 'function') ric(cb, { timeout: 2000 });
  else setTimeout(cb, 50);
}

function pump(): void {
  if (busy || pumpScheduled || waiting.length === 0) return;
  pumpScheduled = true;
  const near = waiting.some((w) => isNear(w.el));
  (near ? nextFrameTask : idleTask)(() => {
    pumpScheduled = false;
    if (busy || waiting.length === 0) return;
    // Pick the first near waiter in request order; otherwise the oldest one.
    let index = waiting.findIndex((w) => isNear(w.el));
    if (index < 0) index = 0;
    const [next] = waiting.splice(index, 1);
    busy = true;
    next!.grant();
  });
}

/**
 * Resolves with a `release` function once this bake may run its synchronous part. Call `release` as soon as the
 * main-thread work is done (before awaiting the off-thread encode), so the next bake can start in the next task.
 */
export function acquireBakeSlot(el: Element | null): Promise<() => void> {
  return new Promise((resolve) => {
    const waiter: Waiter = {
      el,
      seq: seq++,
      grant: () => {
        let released = false;
        resolve(() => {
          if (released) return;
          released = true;
          busy = false;
          pump();
        });
      },
    };
    waiting.push(waiter);
    pump();
  });
}

/** Test helper. */
export function bakeQueueLength(): number {
  return waiting.length;
}
