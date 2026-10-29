/**
 * Q0 · B4: PNG encoding of a baked frame off the main thread.
 *
 * The baker reads the frame back with `readPixels` (bottom-up rows). This module flips the rows and encodes a PNG.
 * Preferred path: a module-less worker built from a Blob URL (one file for the Shopify theme asset, nothing to host)
 * with `OffscreenCanvas.convertToBlob`. The pixel buffer is transferred, not copied. Fallback, used when Worker,
 * OffscreenCanvas or Blob-URL workers are unavailable (old Safari, a strict CSP without `worker-src blob:`): the v0.1
 * main-thread path, 2D canvas + `toDataURL` (P1: `toBlob` resolved ~1 s late while another WebGL canvas animated).
 * Both paths produce the same PNG pixels; the pixel-compatibility tests read the baked image back.
 */

const WORKER_SOURCE = `
onmessage = async (e) => {
  const { id, w, h, buf } = e.data;
  try {
    const row = w * 4;
    const src = new Uint8ClampedArray(buf);
    const out = new Uint8ClampedArray(src.length);
    for (let y = 0; y < h; y++) out.set(src.subarray(y * row, (y + 1) * row), (h - 1 - y) * row);
    const canvas = new OffscreenCanvas(w, h);
    canvas.getContext('2d').putImageData(new ImageData(out, w, h), 0, 0);
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    postMessage({ id, blob });
  } catch (err) {
    postMessage({ id, error: String(err) });
  }
};
`;

type Pending = { resolve: (b: Blob) => void; reject: (e: Error) => void };

let worker: Worker | null = null;
let workerBroken = false;
let nextId = 1;
const pending = new Map<number, Pending>();

export type EncodePath = 'worker' | 'main';

function failAll(message: string): void {
  workerBroken = true;
  worker?.terminate();
  worker = null;
  for (const p of pending.values()) p.reject(new Error(message));
  pending.clear();
}

function getWorker(): Worker | null {
  if (workerBroken) return null;
  if (worker) return worker;
  if (
    typeof Worker === 'undefined' ||
    typeof OffscreenCanvas === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof Blob === 'undefined'
  ) {
    workerBroken = true;
    return null;
  }
  try {
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }));
    worker = new Worker(url);
    URL.revokeObjectURL(url);
    worker.onmessage = (e: MessageEvent<{ id: number; blob?: Blob; error?: string }>) => {
      const p = pending.get(e.data.id);
      if (!p) return;
      pending.delete(e.data.id);
      if (e.data.blob) p.resolve(e.data.blob);
      else p.reject(new Error(e.data.error ?? 'encode failed'));
    };
    // CSP refusals and script errors surface here; everything pending falls back to the main thread.
    worker.onerror = () => failAll('encode worker failed');
  } catch {
    workerBroken = true;
    worker = null;
  }
  return worker;
}

/** Main-thread path (v0.1): flip, 2D canvas, synchronous PNG encode. */
export function encodeOnMainThread(
  raw: Uint8ClampedArray,
  w: number,
  h: number,
  scratch: HTMLCanvasElement
): Blob {
  const row = w * 4;
  const flipped = new Uint8ClampedArray(row * h);
  for (let y = 0; y < h; y++) flipped.set(raw.subarray(y * row, (y + 1) * row), (h - 1 - y) * row);
  if (scratch.width !== w || scratch.height !== h) {
    scratch.width = w;
    scratch.height = h;
  }
  const ctx = scratch.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2D canvas unavailable');
  ctx.putImageData(new ImageData(flipped, w, h), 0, 0);
  const dataUrl = scratch.toDataURL('image/png');
  const comma = dataUrl.indexOf(',');
  const binary = atob(dataUrl.slice(comma + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: 'image/png' });
}

/**
 * Encode bottom-up RGBA rows (straight from `readPixels`) to a PNG Blob. The worker gets a transferred copy, so
 * `raw` stays valid for the main-thread fallback if the worker fails mid-way.
 */
export async function encodePng(
  raw: Uint8ClampedArray,
  w: number,
  h: number,
  scratch: () => HTMLCanvasElement
): Promise<{ blob: Blob; path: EncodePath }> {
  const wk = getWorker();
  if (wk) {
    const copy = raw.slice();
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        wk.postMessage({ id, w, h, buf: copy.buffer }, [copy.buffer]);
      });
      return { blob, path: 'worker' };
    } catch {
      /* worker refused (CSP) or crashed: fall through to the main thread */
    }
  }
  return { blob: encodeOnMainThread(raw, w, h, scratch()), path: 'main' };
}
