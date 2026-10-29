import { emptyPixel } from '#paper/empty-pixel.js';

/** Same as shaders-react/src/set-min-image-size.tsx (0.0.82): rasterise vectors at ≥1024px. Only ever applied to our own off-DOM copy. */
export function setMinImageSize(img: HTMLImageElement): void {
  if (img.naturalWidth < 1024 && img.naturalHeight < 1024) {
    if (img.naturalWidth < 1 || img.naturalHeight < 1) return;
    const aspect = img.naturalWidth / img.naturalHeight;
    img.width = Math.round(aspect > 1 ? 1024 * aspect : 1024);
    img.height = Math.round(aspect > 1 ? 1024 : 1024 / aspect);
  }
}

export class TextureError extends Error {
  constructor(
    public readonly kind: 'cors' | 'error',
    message: string
  ) {
    super(message);
  }
}

const cache = new Map<string, Promise<HTMLImageElement>>();

function isCrossOrigin(url: string): boolean {
  try {
    return new URL(url, location.href).origin !== location.origin;
  } catch {
    return false;
  }
}

/**
 * Texture copy of the content image. Always a separate `Image()` so the content `<img>` is never mutated;
 * `crossOrigin="anonymous"` is set before `src` (PLAN D5). If the content image itself carries
 * `crossorigin="anonymous"`, this hits the memory cache instead of refetching.
 */
export function loadTexture(src: string, contentLoadedOk: boolean): Promise<HTMLImageElement> {
  const key = src;
  let p = cache.get(key);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      if (isCrossOrigin(src)) img.crossOrigin = 'anonymous';
      img.onload = () => {
        img
          .decode()
          .catch(() => undefined)
          .then(() => {
            setMinImageSize(img);
            resolve(img);
          });
      };
      img.onerror = () => {
        cache.delete(key);
        // The plain <img> loaded but the anonymous copy did not → the CDN did not send CORS headers.
        reject(
          new TextureError(
            contentLoadedOk && isCrossOrigin(src) ? 'cors' : 'error',
            `texture failed to load: ${src.slice(0, 200)}`
          )
        );
      };
      img.src = src;
    });
    cache.set(key, p);
  }
  return p;
}

let emptyPromise: Promise<HTMLImageElement> | null = null;
/** Transparent pixel used when an optional image is absent (what shaders-react does for `image=''`). */
export function loadEmptyPixel(): Promise<HTMLImageElement> {
  if (!emptyPromise) emptyPromise = loadTexture(emptyPixel, true);
  return emptyPromise;
}

/** Wait until the content image has a decoded bitmap (its src/currentSrc is only reliable after `load`). */
export function whenContentImageLoaded(img: HTMLImageElement): Promise<boolean> {
  if (img.complete) return Promise.resolve(img.naturalWidth > 0);
  return new Promise((resolve) => {
    const done = (ok: boolean) => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
      resolve(ok);
    };
    const onLoad = () => done(true);
    const onError = () => done(false);
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
  });
}

export function supportsWebGL2(): boolean {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) return false;
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return true;
}

export function twoFrames(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}
