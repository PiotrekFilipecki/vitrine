import { ShaderMount, type ShaderMountUniforms } from '#paper/shader-mount.js';
import { getConfig } from './config.js';
import type { EffectModule } from './effects/types.js';
import { LruMap } from './lru-map.js';
import { twoFrames } from './texture.js';

export interface BakeRequest {
  uniforms: ShaderMountUniforms;
  frame: number;
  /** CSS pixels of the target box; the baker renders at the same device-pixel size ShaderMount would use there. */
  cssWidth: number;
  cssHeight: number;
}

export interface BakeResult {
  blob: Blob;
  pixelWidth: number;
  pixelHeight: number;
  ms: number;
  /** Breakdown for the devlog: waiting for the host/first frame, GL upload + render + readPixels, PNG encode. */
  msWait: number;
  msRender: number;
  msBlob: number;
}

/**
 * One shared off-screen ShaderMount per effect (ADR-0001, proposal P1): cards never get their own WebGL
 * context. Jobs are serialised (concurrency 1) because the host is resized per job. The context is
 * disposed after `bakeIdleMs` without work, so a page with only static effects ends with 0 live contexts.
 */
export class Baker {
  static #bakers = new Map<string, Baker>();

  static for(module: EffectModule): Baker {
    let b = Baker.#bakers.get(module.effect);
    if (!b) {
      b = new Baker(module);
      Baker.#bakers.set(module.effect, b);
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

  private constructor(module: EffectModule) {
    this.#module = module;
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
    if (this.#lost || mount !== this.#mount) {
      throw new Error('baker context lost during bake');
    }
    const t1 = performance.now();
    mount.setUniforms(req.uniforms); // uploads textures and renders synchronously (speed 0)
    mount.setFrame(req.frame);
    const canvas = mount.canvasElement;
    // Synchronous readback right after the render, then PNG-encode from a CPU 2D canvas. `canvas.toBlob` on the
    // WebGL canvas took ~1.1 s per card whenever another WebGL canvas was animating on the page (P1 measurement:
    // 7 ms without a live hero, 1070 ms with one); readPixels + putImageData stays at a few ms either way.
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('baker lost its WebGL2 context');
    const pw = canvas.width;
    const ph = canvas.height;
    const row = pw * 4;
    const raw = new Uint8ClampedArray(row * ph);
    gl.readPixels(0, 0, pw, ph, gl.RGBA, gl.UNSIGNED_BYTE, raw);
    const flipped = new Uint8ClampedArray(row * ph);
    for (let y = 0; y < ph; y++) flipped.set(raw.subarray(y * row, (y + 1) * row), (ph - 1 - y) * row);
    const scratch = this.#scratch();
    if (scratch.width !== pw || scratch.height !== ph) {
      scratch.width = pw;
      scratch.height = ph;
    }
    const ctx = scratch.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('2D canvas unavailable');
    ctx.putImageData(new ImageData(flipped, pw, ph), 0, 0);
    const t2 = performance.now();
    // Synchronous encode: `toBlob` (WebGL or 2D canvas alike) resolved ~1 s late while another WebGL canvas was
    // animating (P1 measurement); `toDataURL` + base64 → Blob takes single-digit ms for a 400×480 card.
    const blob = dataUrlToBlob(scratch.toDataURL('image/png'));
    const t3 = performance.now();
    this.#scheduleIdleDispose();
    return {
      blob,
      pixelWidth: canvas.width,
      pixelHeight: canvas.height,
      ms: t3 - t0,
      msWait: t1 - t0,
      msRender: t2 - t1,
      msBlob: t3 - t2,
    };
  }

  #createMount(req: BakeRequest, w: number, h: number): ShaderMount {
    const host = document.createElement('div');
    host.setAttribute('data-vitrine-baker', this.#module.effect);
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText =
      'position:fixed;left:-10000px;top:0;pointer-events:none;visibility:hidden;contain:strict;';
    document.body.appendChild(host);
    this.#host = host;
    this.#setHostSize(w, h);
    const cfg = getConfig();
    const mount = new ShaderMount(
      host,
      this.#module.fragmentShader,
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

function dataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(',');
  const binary = atob(dataUrl.slice(comma + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: 'image/png' });
}

/** Baked results by (effect + params hash + src + device size): object URLs, revoked on eviction. */
export const bakeCache = new LruMap<string, Promise<string>>(96, (p) => {
  p.then((url) => URL.revokeObjectURL(url)).catch(() => undefined);
});
