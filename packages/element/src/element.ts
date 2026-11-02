import { ShaderMount } from '#paper/shader-mount.js';
import { Baker, bakeCache } from './baker.js';
import { dateFrost, parseBind, type VitrineBind } from './bind.js';
import { getConfig, setConfig } from './config.js';
import { isEffect, loadEffect } from './effects/registry.js';
import type { EffectModule, EffectTextures } from './effects/types.js';
import { hashParams, parseParamsAttribute, resolveParams } from './params.js';
import { GlassMotion, Loupe, interactionPool } from './motion.js';
import { num } from './params.js';
import { LivePool } from './pool.js';
import { attachReveal, type RevealMode } from './reveal.js';
import { ensureStyles } from './styles.js';
import {
  TextureError,
  loadEmptyPixel,
  loadTexture,
  supportsWebGL2,
  twoFrames,
  whenContentImageLoaded,
} from './texture.js';
import type {
  VitrineConfig,
  VitrineFallbackDetail,
  VitrineFallbackReason,
  VitrineMode,
  VitrineParams,
  VitrineReadyDetail,
  VitrineStats,
} from './types.js';

export const VITRINE_TAG = 'vitrine-shader' as const;

type VitrineState = 'idle' | 'loading' | 'baked' | 'live' | 'clear' | 'interactive' | 'fallback';

const pool = new LivePool<VitrineShader>(() => getConfig().maxLive);
let webgl2: boolean | null = null;
let reducedMotion: MediaQueryList | null = null;

function prefersReducedMotion(): boolean {
  if (typeof matchMedia === 'undefined') return false;
  reducedMotion ??= matchMedia('(prefers-reduced-motion: reduce)');
  return reducedMotion.matches;
}

/** Shared IntersectionObserver for the live pool (one per document is enough). */
let viewportObserver: IntersectionObserver | null = null;
const viewportTargets = new WeakMap<Element, (visible: boolean) => void>();
function observeViewport(el: Element, cb: (visible: boolean) => void): () => void {
  viewportObserver ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) viewportTargets.get(e.target)?.(e.isIntersecting);
    },
    { rootMargin: '0px', threshold: 0 }
  );
  viewportTargets.set(el, cb);
  viewportObserver.observe(el);
  return () => {
    viewportObserver?.unobserve(el);
    viewportTargets.delete(el);
  };
}

/**
 * <vitrine-shader effect="dither|halftone|mesh|paper|glass|lens" preset="…" params='{…}' reveal="hover|tap|none"
 *   bind="none|pointer|date:…" speed="0" debug>
 *   <img src alt width height>
 * </vitrine-shader>
 *
 * Light DOM. The child <img> is the content and the fallback; the effect lives in an aria-hidden overlay
 * (`.vitrine-layer`) on top of it. Static effects (speed 0) are baked to an <img> through a shared
 * off-screen context; animated ones live in an LRU pool mounted on viewport entry (ADR-0001).
 */
// SSR-safe: the module can be imported where HTMLElement does not exist (Next.js server render, Vitest).
const BaseElement = (typeof HTMLElement === 'undefined' ? class {} : HTMLElement) as typeof HTMLElement;

export class VitrineShader extends BaseElement {
  static readonly tag = VITRINE_TAG;

  static get observedAttributes(): string[] {
    return ['effect', 'preset', 'params', 'reveal', 'bind', 'speed', 'debug'];
  }

  static config(partial?: Partial<VitrineConfig>): VitrineConfig {
    return partial ? setConfig(partial) : getConfig();
  }

  static stats(): VitrineStats {
    return {
      liveMounts: pool.size,
      bakerContexts: Baker.activeContexts(),
      bakedCached: bakeCache.size,
      interactionMounts: interactionPool.size,
    };
  }

  #layer: HTMLDivElement | null = null;
  #run = 0;
  #connectedAt = 0;
  #scheduled = false;
  #mode: VitrineMode | null = null;
  #state: VitrineState = 'idle';

  // live mode
  #module: EffectModule | null = null;
  #fragmentShader = '';
  #uniforms: ReturnType<EffectModule['toUniforms']> | null = null;
  #liveSpeed = 0;
  #liveFrame = 0;
  #mount: ShaderMount | null = null;
  #parked: HTMLCanvasElement | null = null;
  #unobserveViewport: (() => void) | null = null;
  #remounts = 0;
  #readySent = false;

  // Q1 interactions: glass transition, pointer loupe
  #glass: GlassMotion | null = null;
  #loupe: Loupe | null = null;

  // teardown hooks
  #detachReveal: (() => void) | null = null;
  #resizeObserver: ResizeObserver | null = null;
  #resizeTimer: ReturnType<typeof setTimeout> | null = null;
  #lastSize = '';
  #childObserver: MutationObserver | null = null;
  #onMotionChange: (() => void) | null = null;

  connectedCallback(): void {
    ensureStyles(this.ownerDocument);
    this.#connectedAt = performance.now();
    this.#readySent = false;
    this.#onMotionChange ??= () => this.#schedule();
    if (typeof matchMedia !== 'undefined') {
      reducedMotion ??= matchMedia('(prefers-reduced-motion: reduce)');
      reducedMotion.addEventListener('change', this.#onMotionChange);
    }
    this.#schedule();
  }

  disconnectedCallback(): void {
    this.#run += 1;
    if (this.#onMotionChange) reducedMotion?.removeEventListener('change', this.#onMotionChange);
    this.#teardownRuntime();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.#schedule();
  }

  /** Current mode after ready: 'baked' | 'live' | null. */
  get mode(): VitrineMode | null {
    return this.#mode;
  }

  get state(): string {
    return this.#state;
  }

  #schedule(): void {
    if (this.#scheduled) return;
    this.#scheduled = true;
    queueMicrotask(() => {
      this.#scheduled = false;
      if (this.isConnected) void this.#setup();
    });
  }

  #debug(): boolean {
    return this.hasAttribute('debug') || getConfig().debug;
  }

  #setState(state: VitrineState): void {
    this.#state = state;
    this.setAttribute('data-vitrine-state', state);
  }

  #ensureLayer(): HTMLDivElement {
    if (!this.#layer || this.#layer.parentElement !== this) {
      this.#layer = this.querySelector(':scope > .vitrine-layer') as HTMLDivElement | null;
      if (!this.#layer) {
        this.#layer = this.ownerDocument.createElement('div');
        this.#layer.className = 'vitrine-layer';
        this.#layer.setAttribute('aria-hidden', 'true');
        this.appendChild(this.#layer);
      }
    }
    return this.#layer;
  }

  #contentImage(): HTMLImageElement | null {
    return this.querySelector(':scope > img');
  }

  #teardownRuntime(): void {
    this.#detachReveal?.();
    this.#detachReveal = null;
    this.#glass?.dispose();
    this.#glass = null;
    this.#loupe?.dispose();
    this.#loupe = null;
    this.removeAttribute('data-vitrine-open');
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
    if (this.#resizeTimer) clearTimeout(this.#resizeTimer);
    this.#resizeTimer = null;
    this.#childObserver?.disconnect();
    this.#childObserver = null;
    this.#unobserveViewport?.();
    this.#unobserveViewport = null;
    this.#disposeMount();
    this.#parked?.remove();
    this.#parked = null;
    pool.release(this);
  }

  #fallback(reason: VitrineFallbackReason, message: string): void {
    this.#teardownRuntime();
    this.#layer?.replaceChildren();
    this.#mode = null;
    this.#setState('fallback');
    if (this.#debug()) console.warn(`[vitrine-shader] fallback (${reason}): ${message}`, this);
    const detail: VitrineFallbackDetail = { reason, message };
    this.dispatchEvent(new CustomEvent<VitrineFallbackDetail>('vitrine:fallback', { bubbles: true, detail }));
  }

  #ready(
    mode: VitrineMode,
    effect: EffectModule,
    preset: string,
    cached: boolean,
    bake?: VitrineReadyDetail['bake']
  ): void {
    this.#mode = mode;
    this.#setState(mode);
    if (this.#readySent) return;
    this.#readySent = true;
    const detail: VitrineReadyDetail = {
      effect: effect.effect,
      preset,
      mode,
      cached,
      ms: Math.round(performance.now() - this.#connectedAt),
      ...(bake ? { bake } : {}),
    };
    this.dispatchEvent(new CustomEvent<VitrineReadyDetail>('vitrine:ready', { bubbles: true, detail }));
  }

  async #setup(): Promise<void> {
    const run = ++this.#run;
    const alive = () => run === this.#run && this.isConnected;
    this.#teardownRuntime();
    this.#setState('loading');

    const effectName = this.getAttribute('effect');
    if (!isEffect(effectName)) {
      this.#fallback(
        'error',
        `unknown effect "${effectName ?? ''}" (dither | halftone | mesh | paper | glass | lens)`
      );
      return;
    }
    webgl2 ??= supportsWebGL2();
    if (!webgl2) {
      this.#fallback('no-webgl2', 'WebGL2 is not available');
      return;
    }

    const img = this.#contentImage();
    if (img) this.#applyAspect(img);

    let module: EffectModule;
    try {
      module = await loadEffect(effectName);
    } catch (err) {
      if (alive()) this.#fallback('error', `effect module failed to load: ${String(err)}`);
      return;
    }
    if (!alive()) return;

    if (module.image === 'required' && !img) {
      // Children may arrive after connect (frameworks, theme editor): wait once for an <img>.
      this.#childObserver = new MutationObserver(() => {
        if (this.#contentImage()) {
          this.#childObserver?.disconnect();
          this.#childObserver = null;
          this.#schedule();
        }
      });
      this.#childObserver.observe(this, { childList: true });
      if (this.#debug()) console.warn('[vitrine-shader] waiting for a child <img>', this);
      return;
    }

    const overrides = parseParamsAttribute(this.getAttribute('params'));
    if (overrides === null && this.#debug()) {
      console.warn('[vitrine-shader] params is not a JSON object, ignoring it', this);
    }
    const presetAttr = this.getAttribute('preset') ?? 'default';
    const resolved = resolveParams(module.presets, presetAttr, overrides ?? {}, this.getAttribute('speed'));
    if (!resolved.presetKnown && this.#debug()) {
      console.warn(
        `[vitrine-shader] unknown preset "${presetAttr}" for ${module.effect}, using "default"`,
        this
      );
    }
    const bind = this.#bind(module.effect);
    let params = resolved.params;
    if (bind.kind === 'date') {
      if (module.effect !== 'glass') {
        if (this.#debug()) console.warn('[vitrine-shader] bind="date" works with effect="glass" only', this);
      } else {
        const frost = dateFrost(bind, module.presets, Date.now());
        if (frost.clear) {
          // Released: the plain photo, no layer, no context (Q1 · G3).
          this.#layer?.replaceChildren();
          this.#ready('clear', module, resolved.presetId, false);
          return;
        }
        params = { ...params, ...frost.params, ...(overrides ?? {}) };
      }
    }
    const motionReduced = prefersReducedMotion();
    // glass and lens are static images: their motion is the interaction, never the shader clock.
    const interactive = module.effect === 'glass' || module.effect === 'lens';
    const speed = motionReduced || interactive ? 0 : Number(params['speed'] ?? 0) || 0;
    const frame = Number(params['frame'] ?? 0) || 0;

    // Textures.
    const textures: EffectTextures = {};
    let src = '';
    if (img && module.image !== 'none') {
      const ok = await whenContentImageLoaded(img);
      if (!alive()) return;
      if (!ok) {
        this.#fallback('error', 'content image failed to load');
        return;
      }
      src = img.currentSrc || img.src;
      try {
        textures.image = await loadTexture(src);
      } catch (err) {
        if (!alive()) return;
        const kind = err instanceof TextureError ? err.kind : 'error';
        this.#fallback(kind, kind === 'cors' ? `no CORS headers for ${src}` : String(err));
        return;
      }
    } else if (module.image === 'optional') {
      textures.image = await loadEmptyPixel();
    }
    if (module.loadNoise) {
      try {
        textures.noise = await module.loadNoise();
      } catch (err) {
        if (alive()) this.#fallback('error', `noise texture: ${String(err)}`);
        return;
      }
    }
    if (!alive()) return;

    let uniforms: ReturnType<EffectModule['toUniforms']>;
    try {
      uniforms = module.toUniforms(params, textures);
    } catch (err) {
      this.#fallback('error', `parameter mapping failed: ${String(err)}`);
      return;
    }

    if (module.effect === 'glass') {
      // The open state shows the content <img>: scale it like the shader (`fit: cover` + `scale`), so the last frame
      // of the transition and the photo underneath are the same picture.
      this.style.setProperty('--vitrine-image-scale', String(num(params['scale'], 1)));
    } else {
      this.style.removeProperty('--vitrine-image-scale');
    }

    if (module.effect === 'lens' && bind.kind === 'pointer') {
      this.#setupLoupe(module, resolved.presetId, params, uniforms, textures.image!);
      return;
    }

    const reveal = this.#revealMode(module.effect, bind);
    if (module.effect !== 'glass' && reveal) this.#detachReveal = attachReveal(this, { mode: reveal });

    if (speed === 0) {
      await this.#setupBaked(run, module, resolved.presetId, params, uniforms, frame, src);
      if (module.effect === 'glass' && alive() && this.#state === 'baked')
        this.#setupGlass(module, uniforms, reveal);
    } else {
      this.#fragmentShader = module.variant?.(params)?.fragmentShader ?? module.fragmentShader;
      this.#setupLive(module, resolved.presetId, uniforms, speed, frame);
    }
  }

  /** `bind` attribute, or the effect default: pointer for lens, none for everything else. */
  #bind(effect: string): VitrineBind {
    const raw = this.getAttribute('bind');
    const parsed = parseBind(raw);
    if (parsed === null && this.#debug()) console.warn(`[vitrine-shader] invalid bind "${raw ?? ''}"`, this);
    if (raw === null || parsed === null) return effect === 'lens' ? { kind: 'pointer' } : { kind: 'none' };
    return parsed;
  }

  /**
   * `reveal` attribute. Absent: glass = hover (mouse hover, touch tap, keyboard focus), except a date-bound glass, where
   * the frost is the message (none); every other effect = none, as in v0.1.
   */
  #revealMode(effect: string, bind: VitrineBind): RevealMode | null {
    const raw = this.getAttribute('reveal');
    if (raw === 'hover' || raw === 'tap') return raw;
    if (raw === 'none') return null;
    if (raw !== null && this.#debug()) console.warn(`[vitrine-shader] unknown reveal "${raw}"`, this);
    return effect === 'glass' && bind.kind !== 'date' ? 'hover' : null;
  }

  #setupGlass(
    module: EffectModule,
    uniforms: ReturnType<EffectModule['toUniforms']>,
    reveal: RevealMode | null
  ): void {
    const layer = this.#ensureLayer();
    const baked = layer.querySelector(':scope > img.vitrine-baked') as HTMLImageElement | null;
    if (!baked || !reveal) return;
    const glass = new GlassMotion({
      el: this,
      layer,
      baked,
      fragmentShader: module.variant?.({})?.fragmentShader ?? module.fragmentShader,
      uniforms,
      mipmaps: module.mipmaps,
      reducedMotion: prefersReducedMotion,
    });
    this.#glass = glass;
    this.#detachReveal = attachReveal(this, {
      mode: reveal,
      consumeFirstTap: true,
      onChange: (on) => glass.set(on),
    });
    if (this.hasAttribute('data-vitrine-revealed')) glass.set(true);
  }

  #setupLoupe(
    module: EffectModule,
    presetId: string,
    params: VitrineParams,
    uniforms: ReturnType<EffectModule['toUniforms']>,
    image: HTMLImageElement
  ): void {
    const layer = this.#ensureLayer();
    layer.replaceChildren();
    this.#loupe = new Loupe({
      el: this,
      layer,
      fragmentShader: module.fragmentShader,
      uniforms,
      mipmaps: module.mipmaps,
      aspect: image.naturalWidth / Math.max(1, image.naturalHeight),
      size: num(params['loupeSize'], 0.5),
      zoom: num(params['zoom'], 2.2),
      lensBulge: num(params['lensBulge'], 0),
      reducedMotion: prefersReducedMotion,
    });
    this.#ready('interactive', module, presetId, false);
  }

  #applyAspect(img: HTMLImageElement): void {
    const w = Number(img.getAttribute('width'));
    const h = Number(img.getAttribute('height'));
    if (w > 0 && h > 0) this.style.setProperty('--vitrine-aspect', `${w} / ${h}`);
  }

  async #boxSize(alive: () => boolean): Promise<{ w: number; h: number } | null> {
    for (let i = 0; i < 2; i++) {
      const r = this.getBoundingClientRect();
      if (r.width >= 1 && r.height >= 1) return { w: r.width, h: r.height };
      if (i === 0) await twoFrames();
      if (!alive()) return null;
    }
    // Not laid out yet (display:none, detached layout): retry when it gets a size.
    await new Promise<void>((resolve) => {
      const ro = new ResizeObserver((entries) => {
        const box = entries[0]?.contentRect;
        if (box && box.width >= 1 && box.height >= 1) {
          ro.disconnect();
          resolve();
        }
      });
      ro.observe(this);
    });
    if (!alive()) return null;
    const r = this.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  async #setupBaked(
    run: number,
    module: EffectModule,
    presetId: string,
    params: VitrineParams,
    uniforms: ReturnType<EffectModule['toUniforms']>,
    frame: number,
    src: string
  ): Promise<void> {
    const alive = () => run === this.#run && this.isConnected;
    const size = await this.#boxSize(alive);
    if (!size || !alive()) return;
    const cssW = Math.round(size.w);
    const cssH = Math.round(size.h);
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const key = `${module.effect}|${hashParams({ ...params, speed: 0, frame })}|${src}|${cssW}x${cssH}@${dpr}`;
    let urlPromise = bakeCache.get(key);
    const cached = urlPromise !== undefined;
    let bakeInfo: VitrineReadyDetail['bake'];
    if (!urlPromise) {
      urlPromise = Baker.for(module, module.variant?.(params) ?? null)
        .bake({ uniforms, frame, cssWidth: cssW, cssHeight: cssH, el: this })
        .then((r) => {
          bakeInfo = {
            total: Math.round(r.ms),
            wait: Math.round(r.msWait),
            render: Math.round(r.msRender),
            blob: Math.round(r.msBlob),
            main: Math.round(r.msMain),
            upload: Math.round(r.msUpload),
            read: Math.round(r.msRead),
            gpu: Math.round(r.msGpu),
            readback: r.readback,
            encode: r.encode,
            pixels: `${r.pixelWidth}x${r.pixelHeight}`,
          };
          return URL.createObjectURL(r.blob);
        });
      bakeCache.set(key, urlPromise);
      urlPromise.catch(() => bakeCache.delete(key));
    }
    let url: string;
    try {
      url = await urlPromise;
    } catch (err) {
      if (alive()) this.#fallback('error', `bake failed: ${String(err)}`);
      return;
    }
    if (!alive()) return;

    const layer = this.#ensureLayer();
    const baked = this.ownerDocument.createElement('img');
    baked.className = 'vitrine-baked';
    baked.alt = '';
    baked.decoding = 'async';
    baked.draggable = false;
    baked.src = url;
    try {
      await baked.decode();
    } catch {
      /* object URL revoked or decode unsupported: still swap in */
    }
    if (!alive()) return;
    layer.replaceChildren(baked);
    this.#ready('baked', module, presetId, cached, bakeInfo);
    this.#lastSize = `${cssW}x${cssH}`;
    this.#watchResize();
  }

  /** Re-bake when the CSS box changes (debounced); same size → cache hit, nothing re-rendered. */
  #watchResize(): void {
    this.#resizeObserver = new ResizeObserver(() => {
      if (this.#resizeTimer) clearTimeout(this.#resizeTimer);
      this.#resizeTimer = setTimeout(() => {
        this.#resizeTimer = null;
        const r = this.getBoundingClientRect();
        const now = `${Math.round(r.width)}x${Math.round(r.height)}`;
        if (now !== this.#lastSize && r.width >= 1 && r.height >= 1) this.#schedule();
      }, 150);
    });
    this.#resizeObserver.observe(this);
  }

  #setupLive(
    module: EffectModule,
    presetId: string,
    uniforms: ReturnType<EffectModule['toUniforms']>,
    speed: number,
    frame: number
  ): void {
    this.#module = module;
    this.#uniforms = uniforms;
    this.#liveSpeed = speed;
    this.#liveFrame = frame;
    this.#remounts = 0;
    this.#ensureLayer();
    this.#unobserveViewport = observeViewport(this, (visible) => {
      if (visible) this.#acquireLive(presetId);
      else this.#parkLive();
    });
  }

  #acquireLive(presetId: string): void {
    if (!this.#module || !this.#uniforms) return;
    if (this.#mount) {
      pool.acquire(this, { onEvict: () => this.#parkLive() });
      return;
    }
    pool.acquire(this, { onEvict: () => this.#parkLive() });
    this.#mountLive();
    this.#ready('live', this.#module, presetId, false);
  }

  #mountLive(): void {
    if (!this.#module || !this.#uniforms) return;
    const layer = this.#ensureLayer();
    const cfg = getConfig();
    let mount: ShaderMount;
    try {
      mount = new ShaderMount(
        layer,
        this.#fragmentShader,
        this.#uniforms,
        undefined,
        this.#liveSpeed,
        this.#liveFrame,
        cfg.minPixelRatio,
        cfg.maxPixelCount,
        this.#module.mipmaps
      );
    } catch (err) {
      this.#fallback('error', `mount failed: ${String(err)}`);
      return;
    }
    this.#mount = mount;
    mount.canvasElement.addEventListener('webglcontextlost', (e: Event) => {
      e.preventDefault();
      if (this.#mount !== mount) return;
      // ADR-0001 P2: the browser evicted us (WebKit picks the oldest context). Remount = newest context.
      this.#liveFrame = mount.getCurrentFrame();
      this.#disposeMount();
      if (this.#remounts++ < 3 && pool.has(this)) {
        this.#mountLive();
      } else if (this.#debug()) {
        console.warn('[vitrine-shader] context lost repeatedly, parked', this);
      }
    });
    // Drop the parked frame once the new context has painted.
    const parked = this.#parked;
    if (parked) {
      void twoFrames().then(() => {
        if (this.#mount === mount) {
          parked.remove();
          if (this.#parked === parked) this.#parked = null;
        }
      });
    }
  }

  /** Out of viewport or evicted: keep the last frame as a 2D canvas (no WebGL context), release the mount. */
  #parkLive(): void {
    const mount = this.#mount;
    pool.release(this);
    if (!mount) return;
    const layer = this.#ensureLayer();
    try {
      this.#liveFrame = mount.getCurrentFrame();
      mount.setSpeed(0);
      mount.setFrame(this.#liveFrame); // synchronous render now that the rAF loop is off
      const gl = mount.canvasElement;
      if (gl.width > 0 && gl.height > 0) {
        const snap = this.#parked ?? this.ownerDocument.createElement('canvas');
        snap.className = 'vitrine-parked';
        snap.width = gl.width;
        snap.height = gl.height;
        snap.getContext('2d')?.drawImage(gl, 0, 0);
        if (!snap.parentElement) layer.appendChild(snap);
        this.#parked = snap;
      }
    } catch {
      /* context already gone: nothing to snapshot */
    }
    this.#disposeMount();
  }

  #disposeMount(): void {
    if (!this.#mount) return;
    try {
      this.#mount.dispose();
    } catch {
      /* already lost */
    }
    this.#mount = null;
  }
}

/** Registers <vitrine-shader> once; safe to call on the server (no-op) and more than once. */
export function define(): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get(VITRINE_TAG)) customElements.define(VITRINE_TAG, VitrineShader);
}
