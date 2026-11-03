import { ShaderMount, type ShaderMountUniforms } from '#paper/shader-mount.js';
import { getConfig } from './config.js';
import { LivePool } from './pool.js';
import type { RevealVia } from './reveal.js';
import { twoFrames } from './texture.js';

/**
 * Q1 interactions (ADR-0003): the glass transition and the pointer loupe. Each needs a live WebGL context only while
 * something moves; at rest the page holds 0 live contexts. All interactions share ONE slot (a pool of size 1): a new
 * one evicts the previous, which jumps to its end state at once. With the pool (≤ maxLive animated mounts) and the
 * bakers this keeps the page far below the 16-context browser limit (ADR-0001 B).
 */
export const interactionPool = new LivePool<object>(() => 1);

/** Motion from the R0 mockup (examples/static/r0-hero.html, card): ease-out cubic, no overshoot, enter > exit. */
export const GLASS_OPEN_MS = 520;
export const GLASS_CLOSE_MS = 380;
export const LOUPE_GROW_MS = 350;
export const LOUPE_SHRINK_MS = 250;
/** A context outlives its transition this long, so a quick hover-out after a hover-in reuses it. */
export const RELEASE_GRACE_MS = 400;

export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

/** CSS override for a duration, e.g. `--vitrine-glass-open: 640ms` on the element or any ancestor. */
function cssMs(el: Element, name: string, fallback: number): number {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  if (!raw) return fallback;
  const v = raw.endsWith('ms')
    ? parseFloat(raw)
    : raw.endsWith('s')
      ? parseFloat(raw) * 1000
      : parseFloat(raw);
  return Number.isFinite(v) && v >= 0 ? v : fallback;
}

interface LiveSpec {
  fragmentShader: string;
  uniforms: ShaderMountUniforms;
  mipmaps: string[];
}

function createMount(host: HTMLElement, spec: LiveSpec, extra: ShaderMountUniforms): ShaderMount {
  const cfg = getConfig();
  return new ShaderMount(
    host,
    spec.fragmentShader,
    { ...spec.uniforms, ...extra },
    undefined,
    0,
    0,
    cfg.minPixelRatio,
    cfg.maxPixelCount,
    spec.mipmaps
  );
}

function disposeMount(m: ShaderMount | null): void {
  try {
    m?.dispose();
  } catch {
    /* already lost */
  }
}

/** One value tweened towards a target with ease-out cubic; restarts from the current value on a new target. */
class Tween {
  value: number;
  #from = 0;
  #to = 0;
  #t0 = 0;
  #ms = 0;
  #raf = 0;
  constructor(
    initial: number,
    private apply: (v: number) => void,
    private done: (v: number) => void
  ) {
    this.value = initial;
  }
  get running(): boolean {
    return this.#raf !== 0;
  }
  to(target: number, ms: number): void {
    this.#from = this.value;
    this.#to = target;
    this.#t0 = performance.now();
    this.#ms = ms;
    if (!this.#raf) this.#raf = requestAnimationFrame(this.#step);
  }
  stop(): void {
    if (this.#raf) cancelAnimationFrame(this.#raf);
    this.#raf = 0;
  }
  #step = (now: number) => {
    const k = this.#ms > 0 ? Math.min(1, (now - this.#t0) / this.#ms) : 1;
    this.value = this.#from + (this.#to - this.#from) * easeOut(k);
    this.apply(this.value);
    if (k < 1) {
      this.#raf = requestAnimationFrame(this.#step);
    } else {
      this.#raf = 0;
      this.done(this.value);
    }
  };
}

export interface GlassMotionOptions extends LiveSpec {
  el: HTMLElement;
  layer: HTMLElement;
  /** The baked rest frame (glass closed). */
  baked: HTMLImageElement;
  reducedMotion: () => boolean;
  /** Reports every live-context change to the element (stats, events). */
  onLive?: (live: boolean) => void;
}

/**
 * Glass on a card: rest = baked frame (0 contexts). Open = the pane slides right (`marginLeft` 0 → 1, 520 ms),
 * close = back (380 ms), rendered on one live context taken from the interaction slot and dropped after the
 * transition. Fully open shows the content <img> itself (the layer is hidden), so an open card holds no context.
 */
export class GlassMotion {
  #o: GlassMotionOptions;
  #tween: Tween;
  #target = 0;
  #mount: ShaderMount | null = null;
  #host: HTMLDivElement | null = null;
  #painted = false;
  #grace: ReturnType<typeof setTimeout> | null = null;
  #disposed = false;

  constructor(o: GlassMotionOptions) {
    this.#o = o;
    this.#tween = new Tween(
      0,
      (v) => this.#render(v),
      (v) => this.#settle(v)
    );
    this.#showStatic(0);
  }

  /** 0 = closed … 1 = open (for tests and the devlog). */
  get value(): number {
    return this.#tween.value;
  }

  get live(): boolean {
    return this.#mount !== null;
  }

  /** `via` is accepted for a common signature with GlassDoors; the card glass opens the same way whatever opened it. */
  set(open: boolean, via?: RevealVia): void {
    void via;
    if (this.#disposed) return;
    const target = open ? 1 : 0;
    this.#target = target;
    if (this.#o.reducedMotion()) {
      this.#jump(target);
      return;
    }
    if (this.#tween.value === target && !this.#tween.running) return;
    this.#cancelGrace();
    interactionPool.acquire(this, { onEvict: () => this.#jump(this.#target) });
    const ms = this.#durationFor(target);
    if (this.#mount && this.#painted) {
      // Reused within the grace period: the static state hid the canvas, bring it back before it moves.
      this.#render(this.#tween.value);
      this.#showLive();
      this.#tween.to(target, ms);
      return;
    }
    if (this.#mount) return; // still painting its first frame; #ready starts the tween with the latest target
    this.#createLive();
  }

  #durationFor(target: number): number {
    return target === 1
      ? cssMs(this.#o.el, '--vitrine-glass-open', GLASS_OPEN_MS)
      : cssMs(this.#o.el, '--vitrine-glass-close', GLASS_CLOSE_MS);
  }

  dispose(): void {
    this.#disposed = true;
    this.#tween.stop();
    this.#cancelGrace();
    this.#dropLive();
  }

  #createLive(): void {
    const host = this.#o.el.ownerDocument.createElement('div');
    host.className = 'vitrine-live';
    // Under the baked frame, not hidden: the first composite of a fresh WebGL canvas is the expensive frame (Q1
    // measurement: one 180–230 ms frame at CPU ×4). It happens here, behind the identical baked picture, and the
    // pane only starts to move once the canvas is already on screen.
    this.#o.layer.insertBefore(host, this.#o.baked);
    this.#host = host;
    this.#o.layer.style.visibility = '';
    let mount: ShaderMount;
    try {
      mount = createMount(host, this.#o, { u_marginLeft: this.#tween.value });
    } catch {
      this.#dropLive();
      this.#jump(this.#target);
      return;
    }
    this.#mount = mount;
    this.#painted = false;
    this.#o.onLive?.(true);
    mount.canvasElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      if (this.#mount === mount) this.#jump(this.#target);
    });
    // First render happens in ShaderMount's ResizeObserver callback (P0 finding): wait, then swap.
    void twoFrames()
      .then(() => {
        if (this.#mount !== mount || this.#disposed) return;
        mount.setUniforms({ u_marginLeft: this.#tween.value });
        return twoFrames();
      })
      .then(() => {
        if (this.#mount !== mount || this.#disposed) return;
        this.#painted = true;
        this.#o.baked.style.visibility = 'hidden';
        // The target may have flipped while the context was starting: animate towards the latest one.
        this.#tween.to(this.#target, this.#durationFor(this.#target));
      });
  }

  #render(v: number): void {
    this.#mount?.setUniforms({ u_marginLeft: v });
  }

  /** End of a tween: show the static state for this value and drop the context after a short grace. */
  #settle(v: number): void {
    if (v !== 0 && v !== 1) return;
    this.#showStatic(v);
    this.#cancelGrace();
    this.#grace = setTimeout(() => {
      this.#grace = null;
      this.#dropLive();
    }, RELEASE_GRACE_MS);
  }

  #jump(target: number): void {
    this.#tween.stop();
    this.#tween.value = target;
    this.#cancelGrace();
    this.#dropLive();
    this.#showStatic(target);
  }

  #showLive(): void {
    this.#o.layer.style.visibility = '';
    if (this.#host) this.#host.style.visibility = '';
    this.#o.baked.style.visibility = 'hidden';
    this.#o.el.removeAttribute('data-vitrine-open');
  }

  #showStatic(v: number): void {
    // Open: the layer is hidden and the content <img> (scaled like the shader, see styles.ts) is the picture.
    this.#o.layer.style.visibility = v >= 1 ? 'hidden' : '';
    this.#o.baked.style.visibility = v >= 1 ? 'hidden' : '';
    if (this.#host) this.#host.style.visibility = 'hidden';
    this.#o.el.toggleAttribute('data-vitrine-open', v >= 1);
  }

  #dropLive(): void {
    const had = this.#mount !== null;
    disposeMount(this.#mount);
    this.#mount = null;
    this.#painted = false;
    this.#host?.remove();
    this.#host = null;
    interactionPool.release(this);
    if (had) this.#o.onLive?.(false);
  }

  #cancelGrace(): void {
    if (this.#grace) clearTimeout(this.#grace);
    this.#grace = null;
  }
}

/** R0 hero ("doors"): peek gap on hover, full opening on tap/click/focus/key, cursor follow (examples/static/r0-hero.html). */
export const DOORS_PEEK = 0.2;
export const DOORS_PEEK_MS = 520;
export const DOORS_OPEN_MS = 640;
export const DOORS_CLOSE_PEEK_MS = 380;
export const DOORS_CLOSE_OPEN_MS = 420;
export const DOORS_FOLLOW_MS = 160;

export interface GlassDoorsOptions extends GlassMotionOptions {
  /** The patched shader with `u_vitrineGap` (effects/glass.ts, patchDoors). */
  fragmentShader: string;
}

/**
 * Hero glass as two panes that part at the pointer (the R0 mockup), on ONE live context: the doors patch cuts a hole
 * `[cx − gap, cx + gap]` into the glass. Hover peeks (gap 0.2, follows the cursor), tap/click/focus/Enter open fully
 * (gap 1). Rest = the baked frame (gap 0 renders the upstream masks), fully open = the content <img>; the context
 * lives only while the panes are apart and less than fully open, or moving.
 */
export class GlassDoors {
  #o: GlassDoorsOptions;
  #gap: Tween;
  #cx: Tween;
  #target = 0;
  #mount: ShaderMount | null = null;
  #host: HTMLDivElement | null = null;
  #painted = false;
  #grace: ReturnType<typeof setTimeout> | null = null;
  #disposed = false;
  #pointerX = 0.5;
  #detach: () => void;

  constructor(o: GlassDoorsOptions) {
    this.#o = o;
    this.#gap = new Tween(
      0,
      () => this.#render(),
      (v) => this.#settle(v)
    );
    this.#cx = new Tween(
      0.5,
      () => this.#render(),
      () => undefined
    );
    this.#showStatic(0);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = this.#o.el.getBoundingClientRect();
      this.#pointerX = Math.min(1, Math.max(0, (e.clientX - r.left) / Math.max(1, r.width)));
      // Follow the cursor only while peeking (R0: 160 ms); a full opening stays where it is.
      if (this.#target > 0 && this.#target < 1 && this.#mount) this.#cx.to(this.#pointerX, DOORS_FOLLOW_MS);
    };
    this.#o.el.addEventListener('pointermove', onMove);
    this.#o.el.addEventListener('pointerenter', onMove);
    this.#detach = () => {
      this.#o.el.removeEventListener('pointermove', onMove);
      this.#o.el.removeEventListener('pointerenter', onMove);
    };
  }

  get value(): number {
    return this.#gap.value;
  }

  get live(): boolean {
    return this.#mount !== null;
  }

  set(open: boolean, via: RevealVia = 'click'): void {
    if (this.#disposed) return;
    const peek = via === 'pointer';
    const target = open ? (peek ? DOORS_PEEK : 1) : 0;
    const from = this.#gap.value;
    this.#target = target;
    if (this.#o.reducedMotion()) {
      // Reduced motion: no peek (it is pure motion); open and close at once, without a context.
      this.#target = open && !peek ? 1 : 0;
      this.#jump(this.#target);
      return;
    }
    if (from === target && !this.#gap.running) return;
    this.#cancelGrace();
    interactionPool.acquire(this, { onEvict: () => this.#jump(this.#target >= 1 ? 1 : 0) });
    if (open && peek && from === 0) this.#cx.value = this.#pointerX;
    if (open && !peek && from === 0) this.#cx.value = 0.5;
    const ms = this.#duration(from, target);
    if (this.#mount && this.#painted) {
      this.#render();
      this.#showLive();
      this.#gap.to(target, ms);
      return;
    }
    if (this.#mount) return;
    this.#createLive();
  }

  dispose(): void {
    this.#disposed = true;
    this.#detach();
    this.#gap.stop();
    this.#cx.stop();
    this.#cancelGrace();
    this.#dropLive();
  }

  #duration(from: number, target: number): number {
    if (target >= 1) return cssMs(this.#o.el, '--vitrine-glass-open', DOORS_OPEN_MS);
    if (target > 0) return cssMs(this.#o.el, '--vitrine-glass-peek', DOORS_PEEK_MS);
    return from >= 1 - 1e-6
      ? cssMs(this.#o.el, '--vitrine-glass-close', DOORS_CLOSE_OPEN_MS)
      : cssMs(this.#o.el, '--vitrine-glass-close-peek', DOORS_CLOSE_PEEK_MS);
  }

  #uniformGap(): [number, number] {
    const g = this.#gap.value;
    if (g <= 1e-4) return [0, 0];
    const cx = this.#cx.value;
    return [Math.max(0, cx - g), Math.min(1, cx + g)];
  }

  #createLive(): void {
    const host = this.#o.el.ownerDocument.createElement('div');
    host.className = 'vitrine-live';
    this.#o.layer.insertBefore(host, this.#o.baked);
    this.#host = host;
    this.#o.layer.style.visibility = '';
    let mount: ShaderMount;
    try {
      mount = createMount(host, this.#o, { u_vitrineGap: this.#uniformGap() });
    } catch {
      this.#dropLive();
      this.#jump(this.#target >= 1 ? 1 : 0);
      return;
    }
    this.#mount = mount;
    this.#painted = false;
    this.#o.onLive?.(true);
    mount.canvasElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      if (this.#mount === mount) this.#jump(this.#target >= 1 ? 1 : 0);
    });
    // Same as GlassMotion: paint under the baked frame first, move after the first composite.
    void twoFrames()
      .then(() => {
        if (this.#mount !== mount || this.#disposed) return;
        mount.setUniforms({ u_vitrineGap: this.#uniformGap() });
        return twoFrames();
      })
      .then(() => {
        if (this.#mount !== mount || this.#disposed) return;
        this.#painted = true;
        this.#o.baked.style.visibility = 'hidden';
        this.#gap.to(this.#target, this.#duration(this.#gap.value, this.#target));
      });
  }

  #render(): void {
    this.#mount?.setUniforms({ u_vitrineGap: this.#uniformGap() });
  }

  #settle(v: number): void {
    if (v > 0 && v < 1) return; // peeking: the context stays while the cursor is there
    this.#showStatic(v);
    this.#cancelGrace();
    this.#grace = setTimeout(() => {
      this.#grace = null;
      this.#dropLive();
    }, RELEASE_GRACE_MS);
  }

  #jump(target: number): void {
    this.#gap.stop();
    this.#cx.stop();
    this.#gap.value = target;
    this.#cancelGrace();
    this.#dropLive();
    this.#showStatic(target);
  }

  #showLive(): void {
    this.#o.layer.style.visibility = '';
    if (this.#host) this.#host.style.visibility = '';
    this.#o.baked.style.visibility = 'hidden';
    this.#o.el.removeAttribute('data-vitrine-open');
  }

  #showStatic(v: number): void {
    this.#o.layer.style.visibility = v >= 1 ? 'hidden' : '';
    this.#o.baked.style.visibility = v >= 1 ? 'hidden' : '';
    if (this.#host) this.#host.style.visibility = 'hidden';
    this.#o.el.toggleAttribute('data-vitrine-open', v >= 1);
  }

  #dropLive(): void {
    const had = this.#mount !== null;
    disposeMount(this.#mount);
    this.#mount = null;
    this.#painted = false;
    this.#host?.remove();
    this.#host = null;
    interactionPool.release(this);
    if (had) this.#o.onLive?.(false);
  }

  #cancelGrace(): void {
    if (this.#grace) clearTimeout(this.#grace);
    this.#grace = null;
  }
}

/** Box of an image fitted with `cover` into w×h CSS px (same formula as the Paper vertex shader). */
export function coverBox(w: number, h: number, aspect: number): { x: number; y: number } {
  const bx = Math.max(w / aspect, h) * aspect;
  return { x: bx, y: bx / aspect };
}

/**
 * Sizing props that make a square L×L lens canvas centred on (cx, cy) show the element's cover-fitted photo
 * magnified `zoom`× (R0 `loupeProps`, derived from vertex-shader.js; checked against the R0 loupe clip).
 */
export function loupeSizing(o: {
  cellW: number;
  cellH: number;
  aspect: number;
  L: number;
  cx: number;
  cy: number;
  zoom: number;
}): { scale: number; offsetX: number; offsetY: number } {
  const cell = coverBox(o.cellW, o.cellH, o.aspect);
  const lens = coverBox(o.L, o.L, o.aspect);
  const scale = (o.zoom * cell.x) / lens.x;
  return {
    scale,
    offsetX: (-scale * (o.cx - o.cellW / 2)) / cell.x,
    offsetY: (-scale * (o.cy - o.cellH / 2)) / cell.y,
  };
}

export interface LoupeOptions extends LiveSpec {
  el: HTMLElement;
  layer: HTMLElement;
  /** Natural aspect of the texture. */
  aspect: number;
  /** Loupe diameter as a fraction of the element width (R0: 0.5). */
  size: number;
  zoom: number;
  lensBulge: number;
  reducedMotion: () => boolean;
  onLive?: (live: boolean) => void;
}

const HOLD_MS = 350;
const HOLD_SLOP_PX = 10;

/**
 * Lens on a product page: nothing at rest (the plain photo, no context). Mouse or pen over the photo, or a touch
 * held still for 350 ms, grows a round loupe (350 ms) that follows the pointer; leaving shrinks it (250 ms) and
 * drops the context. Decoration only: aria-hidden, never focusable, the <img> keeps its alt.
 */
export class Loupe {
  #o: LoupeOptions;
  #mount: ShaderMount | null = null;
  #host: HTMLDivElement | null = null;
  #painted = false;
  #grow: Tween;
  #x = 0;
  #y = 0;
  #raf = 0;
  #grace: ReturnType<typeof setTimeout> | null = null;
  #holdTimer: ReturnType<typeof setTimeout> | null = null;
  #holdStart: { x: number; y: number; id: number } | null = null;
  #touchId: number | null = null;
  #active = false;
  #detach: () => void;

  constructor(o: LoupeOptions) {
    this.#o = o;
    this.#grow = new Tween(
      0,
      () => this.#place(),
      (v) => {
        if (v === 0) this.#scheduleDrop();
      }
    );
    this.#detach = this.#listen();
  }

  get live(): boolean {
    return this.#mount !== null;
  }

  dispose(): void {
    this.#detach();
    this.#grow.stop();
    this.#cancelHold();
    if (this.#raf) cancelAnimationFrame(this.#raf);
    this.#raf = 0;
    this.#drop();
  }

  #listen(): () => void {
    const el = this.#o.el;
    // Themes put things on top of the product photo (Horizon: a transparent zoom button over the image), so the
    // pointer never reaches the element. An explicit [data-vitrine-card] ancestor is the surface, as for the glass;
    // coordinates stay relative to the element, and clicks still reach whatever the theme put on top.
    const surface = (el.closest('[data-vitrine-card]') as HTMLElement | null) ?? el;
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const p = local(e);
      this.#start(p.x, p.y);
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      if (e.pointerType === 'touch') {
        if (this.#holdStart && e.pointerId === this.#holdStart.id) {
          if (Math.hypot(p.x - this.#holdStart.x, p.y - this.#holdStart.y) > HOLD_SLOP_PX) this.#cancelHold();
        }
        if (this.#touchId !== e.pointerId) return;
      } else if (!this.#active) {
        this.#start(p.x, p.y);
        return;
      }
      this.#moveTo(p.x, p.y);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      this.#stop();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      const p = local(e);
      this.#cancelHold();
      this.#holdStart = { ...p, id: e.pointerId };
      this.#holdTimer = setTimeout(() => {
        this.#holdTimer = null;
        if (!this.#holdStart) return;
        this.#touchId = this.#holdStart.id;
        this.#start(this.#holdStart.x, this.#holdStart.y);
      }, HOLD_MS);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      this.#cancelHold();
      if (this.#touchId === e.pointerId) {
        this.#touchId = null;
        this.#stop();
      }
    };
    // While the loupe follows a finger the page must not scroll: the hold already waited 350 ms without movement, so
    // the first touchmove after it is still cancellable.
    const onTouchMove = (e: TouchEvent) => {
      if (this.#touchId !== null) e.preventDefault();
    };
    const onContext = (e: Event) => {
      if (this.#touchId !== null || this.#holdStart) e.preventDefault();
    };
    surface.addEventListener('pointerenter', onEnter);
    surface.addEventListener('pointermove', onMove);
    surface.addEventListener('pointerleave', onLeave);
    surface.addEventListener('pointerdown', onDown);
    surface.addEventListener('pointerup', onUp);
    surface.addEventListener('pointercancel', onUp);
    surface.addEventListener('touchmove', onTouchMove, { passive: false });
    surface.addEventListener('contextmenu', onContext);
    return () => {
      surface.removeEventListener('pointerenter', onEnter);
      surface.removeEventListener('pointermove', onMove);
      surface.removeEventListener('pointerleave', onLeave);
      surface.removeEventListener('pointerdown', onDown);
      surface.removeEventListener('pointerup', onUp);
      surface.removeEventListener('pointercancel', onUp);
      surface.removeEventListener('touchmove', onTouchMove);
      surface.removeEventListener('contextmenu', onContext);
    };
  }

  #cancelHold(): void {
    if (this.#holdTimer) clearTimeout(this.#holdTimer);
    this.#holdTimer = null;
    this.#holdStart = null;
  }

  #start(x: number, y: number): void {
    this.#x = x;
    this.#y = y;
    this.#active = true;
    if (this.#grace) clearTimeout(this.#grace);
    this.#grace = null;
    interactionPool.acquire(this, { onEvict: () => this.#evicted() });
    if (!this.#mount) this.#create();
    else if (this.#painted) this.#grow.to(1, this.#o.reducedMotion() ? 0 : LOUPE_GROW_MS);
  }

  #stop(): void {
    this.#active = false;
    if (!this.#mount) return;
    if (!this.#painted) {
      this.#drop();
      return;
    }
    this.#grow.to(0, this.#o.reducedMotion() ? 0 : LOUPE_SHRINK_MS);
  }

  #moveTo(x: number, y: number): void {
    this.#x = x;
    this.#y = y;
    if (!this.#raf) {
      this.#raf = requestAnimationFrame(() => {
        this.#raf = 0;
        this.#place();
      });
    }
  }

  #create(): void {
    const host = this.#o.el.ownerDocument.createElement('div');
    host.className = 'vitrine-loupe';
    host.style.visibility = 'hidden';
    this.#o.layer.appendChild(host);
    this.#host = host;
    const L = this.#diameter();
    host.style.width = `${L}px`;
    host.style.height = `${L}px`;
    let mount: ShaderMount;
    try {
      mount = createMount(host, this.#o, this.#uniformsAt(1e-3));
    } catch {
      this.#drop();
      return;
    }
    this.#mount = mount;
    this.#painted = false;
    this.#o.onLive?.(true);
    mount.canvasElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      if (this.#mount === mount) this.#drop();
    });
    void twoFrames().then(() => {
      if (this.#mount !== mount) return;
      this.#painted = true;
      host.style.visibility = '';
      this.#place();
      if (this.#active) this.#grow.to(1, this.#o.reducedMotion() ? 0 : LOUPE_GROW_MS);
      else this.#grow.to(0, 0);
    });
  }

  #diameter(): number {
    return Math.max(24, Math.round(this.#o.el.getBoundingClientRect().width * this.#o.size));
  }

  /**
   * The canvas stays L×L (no resize while it grows); the grow is a CSS scale. At grow g the R0 loupe was a g·L circle
   * at zoom 1 + (zoom − 1)·g with bulge·g; an L canvas at zoom (1 + (zoom − 1)·g)/g scaled by g shows the same.
   */
  #uniformsAt(g: number): ShaderMountUniforms {
    const r = this.#o.el.getBoundingClientRect();
    const L = this.#diameter();
    const zoomEff = 1 + (this.#o.zoom - 1) * g;
    const s = loupeSizing({
      cellW: r.width,
      cellH: r.height,
      aspect: this.#o.aspect,
      L,
      cx: this.#x,
      cy: this.#y,
      zoom: zoomEff / Math.max(g, 1e-3),
    });
    return {
      u_fit: 2, // cover
      u_scale: s.scale,
      u_offsetX: s.offsetX,
      u_offsetY: s.offsetY,
      u_lensBulge: this.#o.lensBulge * g,
    };
  }

  #place(): void {
    const host = this.#host;
    if (!host || !this.#mount || !this.#painted) return;
    const g = Math.max(this.#grow.value, 1e-3);
    const L = this.#diameter();
    host.style.transform = `translate(${(this.#x - L / 2).toFixed(2)}px, ${(this.#y - L / 2).toFixed(2)}px) scale(${g.toFixed(4)})`;
    host.style.opacity = this.#grow.value < 0.02 ? '0' : '1';
    this.#mount.setUniforms(this.#uniformsAt(g));
  }

  #scheduleDrop(): void {
    if (this.#active) return;
    if (this.#grace) clearTimeout(this.#grace);
    this.#grace = setTimeout(() => {
      this.#grace = null;
      if (!this.#active) this.#drop();
    }, RELEASE_GRACE_MS);
  }

  #evicted(): void {
    this.#grow.stop();
    this.#grow.value = 0;
    this.#active = false;
    this.#drop();
  }

  #drop(): void {
    const had = this.#mount !== null;
    disposeMount(this.#mount);
    this.#mount = null;
    this.#painted = false;
    this.#host?.remove();
    this.#host = null;
    interactionPool.release(this);
    if (had) this.#o.onLive?.(false);
  }
}
