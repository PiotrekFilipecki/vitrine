import { getShaderNoiseTexture } from '#paper/get-shader-noise-texture.js';
import { setMinImageSize } from '../texture.js';

let promise: Promise<HTMLImageElement> | null = null;

/** shaders-react passes `getShaderNoiseTexture()` and awaits `decode()` + setMinImageSize before mounting; same here, once per page. */
export function loadNoiseTexture(): Promise<HTMLImageElement> {
  if (!promise) {
    const img = getShaderNoiseTexture();
    if (!img) return Promise.reject(new Error('noise texture needs a window'));
    promise = img
      .decode()
      .then(() => {
        setMinImageSize(img);
        return img;
      })
      .catch((err: unknown) => {
        // A transient decode failure must not poison every halftone/paper on the page until reload.
        promise = null;
        throw err;
      });
  }
  return promise;
}
