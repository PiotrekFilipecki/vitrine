import { ShaderMount, type ShaderMountUniforms } from '#paper/shader-mount.js';
import { acquireBakeSlot } from './bake-queue.js';
import { getConfig } from './config.js';
import type { EffectModule, EffectVariant } from './effects/types.js';
import { encodePng, type EncodePath } from './encode.js';
import { LruMap } from './lru-map.js';
import { finishRead, startRead, type PendingRead } from './readback.js';
import { twoFrames } from './texture.js';

export interface BakeRequest {
  uniforms: ShaderMountUniforms;
  frame: number;
  /** CSS pixels of the target box; the baker renders at the same device-pixel size ShaderMount would use there. */
  cssWidth: number;
  cssHeight: number;
  /** The element asking: the bake queue (Q0) serves elements near the viewport first. */
  el?: Element | null;
}

export interface BakeResult {
  blob: Blob;
  pixelWidth: number;
  pixelHeight: number;
  ms: number;
  /** Breakdown for the devlog: waiting (queue slot, host, first frame), GL upload + render + readPixels, PNG encode. */
  msWait: number;
  msRender: number;
  msBlob: number;
  /** Main-thread part only (render + readback, plus the encode when it ran on the main thread). */
  msMain: number;
  encode: EncodePath;
  /** Split of msRender: texture upload + draw (setUniforms), then the readback. */
  msUpload: number;
  msRead: number;
  /** Waiting for the fence off the main thread (async readback only). */
  msGpu: number;
  readback: 'async' | 'sync';
}

/**
 * One shared off-screen ShaderMount per effect (ADR-0001, proposal P1): cards never get their own WebGL
 * context. Jobs are serialised (concurrency 1) because the host is resized per job. The context is
 * disposed after `bakeIdleMs` without work, so a page with only static effects ends with 0 live contexts.
 */
export class Baker {
  static #bakers = new Map<string, Baker>();

  /** One baker (one off-screen context at most) per effect, or per VITRINE shader variant of an effect. */
  static for(module: EffectModule, variant: EffectVariant | null = null): Baker {
    const key = variant?.key ?? module.effect;
    let b = Baker.#bakers.get(key);
    if (!b) {
      b = new Baker(module, variant?.fragmentShader ?? module.fragmentShader, key);
      Baker.#bakers.set(key, b);
    }
    return b;
  }

  static activeContexts(): number {
    let n = 0;
    for (const b of Baker.#bakers.values()) if (b.#mount) n += 1;
    return n;
  }

  static disposeAll(): void {
    for (const b of Baker.#bakers.values()) b.#disposeMount();
  }

  #module: EffectModule;
  #fragmentShader: string;
  #key: string;
  #host: HTMLDivElement | null = null;
  #mount: ShaderMount | null = null;
  #lost = false;
  #hostW = 0;
  #hostH = 0;
  #queue: Promise<unknown> = Promise.resolve();
  #idleTimer: ReturnType<typeof setTimeout> | null = null;
  #scratchCanvas: HTMLCanvasElement | null = null;

  #scratch(): HTMLCanvasElement {
    this.#scratchCanvas ??= document.createElement('canvas');
    return this.#scratchCanvas;
  }

  private constructor(module: EffectModule, fragmentShader: string, key: string) {
    this.#module = module;
    this.#fragmentShader = fragmentShader;
    this.#key = key;
  }

  bake(req: BakeRequest): Promise<BakeResult> {
    const run = this.#queue.then(() => this.#run(req));
    this.#queue = run.catch(() => undefined);
    return run;
  }

  async #run(req: BakeRequest): Promise<BakeResult> {
    const t0 = performance.now();
    if (this.#idleTimer) {
      clearTimeout(this.#idleTimer);
      this.#idleTimer = null;
    }
    const w = Math.max(1, Math.round(req.cssWidth));
    const h = Math.max(1, Math.round(req.cssHeight));
    let mount = this.#mount;
    if (!mount || this.#lost) {
      this.#disposeMount();
      mount = this.#createMount(req, w, h);
      // First render happens in the ResizeObserver callback after the constructor returns (P0 finding).
      await twoFrames();
    } else if (w !== this.#hostW || h !== this.#hostH) {
      this.#setHostSize(w, h);
      await twoFrames();
    }
    // Q0: wait for a slot in the global queue, so every bake's synchronous part runs in its own task.
    const release = await acquireBakeSlot(req.el ?? null);
    let raw: Uint8ClampedArray;
    let tUpload: number;
    let pending: PendingRead | null;
    let pw: number;
    let ph: number;
    const t1 = performance.now();
    try {
      if (this.#lost || mount !== this.#mount) {
        throw new Error('baker context lost during bake');
      }
      mount.setUniforms(req.uniforms); // uploads textures and renders synchronously (speed 0)
      mount.setFrame(req.frame);
      tUpload = performance.now();
      const canvas = mount.canvasElement;
      // Readback right after the render (P1: `canvas.toBlob` took ~1.1 s per card while another WebGL canvas was
      // animating). Q0: asynchronous through a pixel-pack buffer + fence (readback.ts); synchronous readPixels only
      // if that path is unavailable.
      const gl = canvas.getContext('webgl2');
      if (!gl) throw new Error('baker lost its WebGL2 context');
      pw = canvas.width;
      ph = canvas.height;
      raw = new Uint8ClampedArray(pw * 4 * ph);
      pending = startRead(gl, pw, ph);
      if (!pending) gl.readPixels(0, 0, pw, ph, gl.RGBA, gl.UNSIGNED_BYTE, raw);
    } finally {
      release();
    }
    const tIssued = performance.now();
    if (pending) await finishRead(pending, raw);
    const t2 = performance.now();
    // Q0: flip + PNG encode in a worker (OffscreenCanvas), main-thread fallback inside encodePng.
    const { blob, path } = await encodePng(raw, pw, ph, () => this.#scratch());
    const t3 = performance.now();
    this.#scheduleIdleDispose();
    return {
      blob,
      pixelWidth: pw,
      pixelHeight: ph,
      ms: t3 - t0,
      msWait: t1 - t0,
      msRender: t2 - t1,
      msBlob: t3 - t2,
      // Main thread: upload + draw + issuing the read (+ the synchronous read or the final copy) + main-thread encode.
      msMain: tIssued - t1 + (path === 'main' ? t3 - t2 : 0),
      msUpload: tUpload - t1,
      msRead: tIssued - tUpload,
      msGpu: t2 - tIssued,
      readback: pending ? 'async' : 'sync',
      encode: path,
    };
  }

  #createMount(req: BakeRequest, w: number, h: number): ShaderMount {
    const host = document.createElement('div');
    host.setAttribute('data-vitrine-baker', this.#key);
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText =
      'position:fixed;left:-10000px;top:0;pointer-events:none;visibility:hidden;contain:strict;';
    document.body.appendChild(host);
    this.#host = host;
    this.#setHostSize(w, h);
    const cfg = getConfig();
    const mount = new ShaderMount(
      host,
      this.#fragmentShader,
      req.uniforms,
      undefined,
      0,
      req.frame,
      cfg.minPixelRatio,
      cfg.maxPixelCount,
      this.#module.mipmaps
    );
    this.#lost = false;
    mount.canvasElement.addEventListener('webglcontextlost', () => {
      // ADR-0001 P2: WebKit may evict the oldest context; the next bake simply rebuilds the baker.
      this.#lost = true;
    });
    this.#mount = mount;
    return mount;
  }

  #setHostSize(w: number, h: number): void {
    if (!this.#host) return;
    this.#hostW = w;
    this.#hostH = h;
    this.#host.style.width = `${w}px`;
    this.#host.style.height = `${h}px`;
  }

  #scheduleIdleDispose(): void {
    const idle = getConfig().bakeIdleMs;
    this.#idleTimer = setTimeout(() => {
      this.#idleTimer = null;
      this.#disposeMount();
    }, idle);
  }

  #disposeMount(): void {
    if (this.#idleTimer) {
      clearTimeout(this.#idleTimer);
      this.#idleTimer = null;
    }
    if (this.#mount) {
      try {
        this.#mount.dispose();
      } catch {
        /* already lost */
      }
      this.#mount = null;
    }
    this.#host?.remove();
    this.#host = null;
    this.#hostW = 0;
    this.#hostH = 0;
    this.#lost = false;
  }
}

/** Baked results by (effect + params hash + src + device size): object URLs, revoked on eviction. */
export const bakeCache = new LruMap<string, Promise<string>>(96, (p) => {
  p.then((url) => URL.revokeObjectURL(url)).catch(() => undefined);
});
