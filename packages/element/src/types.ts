/** Effects shipped in v1 (PLAN D2). Names map to Paper Shaders: dither=image-dithering, halftone=halftone-cmyk, mesh=mesh-gradient, paper=paper-texture. */
export type VitrineEffect = 'dither' | 'halftone' | 'mesh' | 'paper';

export type VitrineReveal = 'hover' | 'none';

export type VitrineMode = 'baked' | 'live';

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
}
