// Shared helpers for the P0 spikes. Plain ESM served by scripts/serve.mjs; imports the pinned
// @paper-design/shaders build straight from node_modules (pnpm symlink is followed by the server).
import {
  ShaderMount,
  imageDitheringFragmentShader,
  meshGradientFragmentShader,
  getShaderColorFromString,
  ShaderFitOptions,
  DitheringTypes,
  defaultObjectSizing,
} from '/node_modules/@paper-design/shaders/dist/index.js';

export { ShaderMount, imageDitheringFragmentShader, meshGradientFragmentShader };

export function loadImage(src, crossOrigin = false) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image failed to load: ${src}`));
    img.src = src;
  });
}

/** 1:1 port of the "Default" preset mapping in shaders-react/src/shaders/image-dithering.tsx (0.0.82). */
export function ditherUniforms(image, overrides = {}) {
  const p = {
    ...defaultObjectSizing,
    fit: 'cover',
    colorFront: '#94ffaf',
    colorBack: '#000c38',
    colorHighlight: '#eaff94',
    type: '8x8',
    size: 2,
    colorSteps: 2,
    originalColors: false,
    inverted: false,
    ...overrides,
  };
  return {
    u_image: image,
    u_colorFront: getShaderColorFromString(p.colorFront),
    u_colorBack: getShaderColorFromString(p.colorBack),
    u_colorHighlight: getShaderColorFromString(p.colorHighlight),
    u_type: DitheringTypes[p.type],
    u_pxSize: p.size,
    u_colorSteps: p.colorSteps,
    u_originalColors: p.originalColors,
    u_inverted: p.inverted,
    u_fit: ShaderFitOptions[p.fit],
    u_rotation: p.rotation,
    u_scale: p.scale,
    u_offsetX: p.offsetX,
    u_offsetY: p.offsetY,
    u_originX: p.originX,
    u_originY: p.originY,
    u_worldWidth: p.worldWidth,
    u_worldHeight: p.worldHeight,
  };
}

/** 1:1 port of the "Default" preset mapping in shaders-react/src/shaders/mesh-gradient.tsx (0.0.82). */
export function meshUniforms(overrides = {}) {
  const p = {
    ...defaultObjectSizing,
    colors: ['#e0eaff', '#241d9a', '#f75092', '#9f50d3'],
    distortion: 0.8,
    swirl: 0.1,
    grainMixer: 0,
    grainOverlay: 0,
    ...overrides,
  };
  return {
    u_colors: p.colors.map(getShaderColorFromString),
    u_colorsCount: p.colors.length,
    u_distortion: p.distortion,
    u_swirl: p.swirl,
    u_grainMixer: p.grainMixer,
    u_grainOverlay: p.grainOverlay,
    u_fit: ShaderFitOptions[p.fit],
    u_rotation: p.rotation,
    u_scale: p.scale,
    u_offsetX: p.offsetX,
    u_offsetY: p.offsetY,
    u_originX: p.originX,
    u_originY: p.originY,
    u_worldWidth: p.worldWidth,
    u_worldHeight: p.worldHeight,
  };
}

/**
 * When is the first frame rendered? From shader-mount.ts (0.0.82): the constructor never renders.
 * The first render() happens inside the ResizeObserver callback (handleResize -> render) that fires
 * after the constructor returns, in the "update the rendering" step that follows the rAF callbacks of
 * that frame. Two rAFs therefore guarantee the first ResizeObserver notification has run.
 * We then call setFrame(0), which synchronously renders when no rAF loop is running (speed 0),
 * so the drawing buffer is deterministic at the moment we read it.
 */
export function afterFirstFrame(mount) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mount.setFrame(0);
        resolve();
      });
    });
  });
}

/** Attach a webglcontextlost counter to a canvas. */
export function watchContextLost(canvas, counter) {
  canvas.addEventListener('webglcontextlost', () => {
    counter.count += 1;
  });
}

/**
 * Bake: render once with preserveDrawingBuffer, copy the canvas to an <img> (toBlob), dispose.
 * Returns timings plus whether the context reports lost right after dispose.
 */
export async function bake(parent, fragmentShader, uniforms, { minPixelRatio = 2, maxPixelCount } = {}) {
  const t0 = performance.now();
  const mount = new ShaderMount(
    parent,
    fragmentShader,
    uniforms,
    { preserveDrawingBuffer: true },
    0,
    0,
    minPixelRatio,
    maxPixelCount
  );
  const canvas = mount.canvasElement;
  const gl = canvas.getContext('webgl2'); // same context object the mount created
  const lost = { count: 0 };
  watchContextLost(canvas, lost);
  await afterFirstFrame(mount);
  const tRendered = performance.now();
  const width = canvas.width;
  const height = canvas.height;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const tBlob = performance.now();
  const img = await loadImage(URL.createObjectURL(blob));
  const tImg = performance.now();
  mount.dispose();
  const tDispose = performance.now();
  const contextLostAfterDispose = gl ? gl.isContextLost() : null;
  return {
    img,
    width,
    height,
    blobBytes: blob ? blob.size : 0,
    ms: {
      toFirstFrame: +(tRendered - t0).toFixed(2),
      toBlob: +(tBlob - tRendered).toFixed(2),
      toImg: +(tImg - tBlob).toFixed(2),
      dispose: +(tDispose - tImg).toFixed(2),
      total: +(tDispose - t0).toFixed(2),
    },
    contextLostAfterDispose,
    lostEventsOnThisCanvas: lost,
    // Weak on purpose: a strong reference to the context would keep it alive and (in WebKit) counted.
    glRef: typeof WeakRef === 'function' ? new WeakRef(gl) : { deref: () => gl },
  };
}

/** Read the live drawing buffer right after a synchronous render (works without preserveDrawingBuffer). */
export function readPixelsFlipped(gl, canvas) {
  const w = canvas.width;
  const h = canvas.height;
  const buf = new Uint8Array(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) out.set(buf.subarray(y * w * 4, (y + 1) * w * 4), (h - 1 - y) * w * 4);
  return out;
}

export function imageToPixels(img, w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h).data;
}

/** Pixel diff: count pixels whose max channel delta exceeds the threshold; returns a diff image too. */
export function diffPixels(a, b, w, h, threshold = 8) {
  const diff = new Uint8ClampedArray(w * h * 4);
  let different = 0;
  let sumDelta = 0;
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    const d = Math.max(Math.abs(a[o] - b[o]), Math.abs(a[o + 1] - b[o + 1]), Math.abs(a[o + 2] - b[o + 2]));
    sumDelta += d;
    const bad = d > threshold;
    if (bad) different += 1;
    diff[o] = bad ? 255 : a[o] >> 2;
    diff[o + 1] = bad ? 0 : a[o + 1] >> 2;
    diff[o + 2] = bad ? 0 : a[o + 2] >> 2;
    diff[o + 3] = 255;
  }
  return {
    different,
    pct: +((100 * different) / (w * h)).toFixed(4),
    meanDelta: +(sumDelta / (w * h)).toFixed(3),
    diff,
  };
}

export function pixelsToCanvas(pixels, w, h, target) {
  target.width = w;
  target.height = h;
  target.getContext('2d').putImageData(new ImageData(pixels, w, h), 0, 0);
  return target;
}

/** Simple stats to prove a buffer is not empty/uniform. */
export function pixelStats(px) {
  let min = 255;
  let max = 0;
  let sum = 0;
  let opaque = 0;
  const n = px.length / 4;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const l = (px[o] * 299 + px[o + 1] * 587 + px[o + 2] * 114) / 1000;
    if (l < min) min = l;
    if (l > max) max = l;
    sum += l;
    if (px[o + 3] === 255) opaque += 1;
  }
  return {
    minLuma: +min.toFixed(1),
    maxLuma: +max.toFixed(1),
    meanLuma: +(sum / n).toFixed(1),
    opaquePct: +((100 * opaque) / n).toFixed(2),
  };
}

/**
 * Probe free context slots: create k plain WebGL2 contexts and count webglcontextlost events
 * fired anywhere in the document during the probe. If earlier contexts were really released,
 * the browser does not need to evict anything and the count stays 0.
 */
export async function probeContextSlots(k = 16) {
  const canvases = [];
  const lost = { count: 0 };
  let nullContexts = 0;
  for (let i = 0; i < k; i++) {
    const c = document.createElement('canvas');
    c.width = 8;
    c.height = 8;
    watchContextLost(c, lost);
    const gl = c.getContext('webgl2');
    if (!gl) nullContexts += 1;
    canvases.push({ c, gl });
  }
  await new Promise((r) => setTimeout(r, 300)); // contextlost events are dispatched async
  const stillAlive = canvases.filter(({ gl }) => gl && !gl.isContextLost()).length;
  const lostEventsDuringProbe = lost.count; // snapshot BEFORE we release the probes ourselves
  for (const { gl } of canvases) gl?.getExtension('WEBGL_lose_context')?.loseContext();
  await new Promise((r) => setTimeout(r, 100));
  return { requested: k, nullContexts, lostEventsDuringProbe, aliveAfterProbe: stillAlive };
}

export function uaInfo() {
  return {
    ua: navigator.userAgent,
    dpr: window.devicePixelRatio,
    hwc: navigator.hardwareConcurrency ?? null,
  };
}
