/**
 * Effects. v0.1 (PLAN D2): dither=image-dithering, halftone=halftone-cmyk, mesh=mesh-gradient, paper=paper-texture.
 * v0.2 (ADR-0003): glass=fluted-glass (card glass, pre-order glass), lens=lens-distortion (product page loupe).
 */
export type VitrineEffect = 'dither' | 'halftone' | 'mesh' | 'paper' | 'glass' | 'lens';

/** `tap` is new in v0.2: click or tap toggles, hover and focus do nothing. */
export type VitrineReveal = 'hover' | 'tap' | 'none';

/**
 * `clear` (v0.2): a date-bound glass on or after its release date, the plain photo, no layer.
 * `interactive` (v0.2): a pointer-bound lens at rest, the plain photo until a pointer arrives.
 */
export type VitrineMode = 'baked' | 'live' | 'clear' | 'interactive';

export type VitrineFallbackReason = 'no-webgl2' | 'cors' | 'error';

export type ParamValue = string | number | boolean | string[];

/** Parameters in the vocabulary of `@paper-design/shaders-react` (never `image`). */
export type VitrineParams = Record<string, ParamValue>;

export interface PresetDef {
  name: string;
  source?: string;
  params: VitrineParams;
}

export interface PresetFile {
  effect: VitrineEffect;
  shader: string;
  paperShaders: string;
  presets: Record<string, PresetDef>;
}

export interface VitrineReadyDetail {
  effect: VitrineEffect;
  preset: string;
  mode: VitrineMode;
  /** Baked result came from the in-memory cache. */
  cached: boolean;
  /** Milliseconds from connectedCallback to ready. */
  ms: number;
  /** Baked only: baker breakdown (ms) of the bake this element waited for, undefined on a cache hit. */
  bake?: {
    total: number;
    wait: number;
    render: number;
    blob: number;
    /** Main-thread milliseconds of this bake (Q0): render + readback, plus the encode if it ran there. */
    main: number;
    /** Split of `render`: texture upload + draw, then the readback (Q0). */
    upload: number;
    read: number;
    /** Waiting for the GPU fence off the main thread, and which readback path ran (Q0). */
    gpu: number;
    readback: 'async' | 'sync';
    /** Where the PNG was encoded (Q0): off-thread worker or the main-thread fallback. */
    encode: 'worker' | 'main';
    pixels: string;
  };
}

export interface VitrineFallbackDetail {
  reason: VitrineFallbackReason;
  message: string;
}

export interface VitrineConfig {
  /** Max simultaneously mounted animated shaders (PLAN D3). */
  maxLive: number;
  /** Warn in the console on fallbacks. Per-element `debug` attribute does the same. */
  debug: boolean;
  /** Dispose an idle baker context after this many ms. */
  bakeIdleMs: number;
  /** Passed to ShaderMount (upstream default 2). */
  minPixelRatio: number;
  /** Passed to ShaderMount (upstream default 1920*1080*4). */
  maxPixelCount: number | undefined;
}

export interface VitrineStats {
  liveMounts: number;
  bakerContexts: number;
  bakedCached: number;
  /** v0.2: live contexts held by an interaction (glass transition or loupe), at most 1. */
  interactionMounts: number;
}
