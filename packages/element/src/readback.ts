/**
 * Q0 · B4: asynchronous readback of a rendered frame (WebGL2 pixel-pack buffer + fence).
 *
 * `gl.readPixels` into client memory blocks the main thread until the GPU has finished everything queued before it:
 * texture uploads, mipmaps, the draw. Measured on the demo page with software GL (Lighthouse's Chromium): 97 ms for the
 * first dither bake, 271 ms for paper-texture, all of it inside `readPixels` while `setUniforms` returned in 0–5 ms.
 * Here the copy goes into a PIXEL_PACK_BUFFER, a fence is inserted, and the main thread polls the fence from timers
 * (WebGL only updates sync status between tasks); `getBufferSubData` then copies finished pixels. The GPU runs the
 * queue in order, so the copy sees exactly the frame drawn before it. Any failure returns null: the caller falls back
 * to the synchronous path of v0.1.
 */

export interface PendingRead {
  gl: WebGL2RenderingContext;
  pbo: WebGLBuffer;
  sync: WebGLSync;
  bytes: number;
}

export function startRead(gl: WebGL2RenderingContext, w: number, h: number): PendingRead | null {
  let pbo: WebGLBuffer | null = null;
  try {
    const bytes = w * h * 4;
    pbo = gl.createBuffer();
    if (!pbo) return null;
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, bytes, gl.STREAM_READ);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, 0);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!sync || gl.getError() !== gl.NO_ERROR) {
      if (sync) gl.deleteSync(sync);
      gl.deleteBuffer(pbo);
      return null;
    }
    gl.flush();
    return { gl, pbo, sync, bytes };
  } catch {
    try {
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
      if (pbo) gl.deleteBuffer(pbo);
    } catch {
      /* context gone */
    }
    return null;
  }
}

const POLL_MS = 4;
const GIVE_UP_MS = 5000;

/** Waits for the fence without blocking, then copies the pixels into `out`. Throws if the context was lost. */
export async function finishRead(read: PendingRead, out: Uint8ClampedArray): Promise<void> {
  const { gl, pbo, sync } = read;
  const started = performance.now();
  try {
    for (;;) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      if (gl.isContextLost()) throw new Error('baker context lost during readback');
      const status = gl.clientWaitSync(sync, 0, 0);
      if (status === gl.ALREADY_SIGNALED || status === gl.CONDITION_SATISFIED) break;
      if (status === gl.WAIT_FAILED) throw new Error('fence wait failed');
      // Driver never signals: read anyway (blocks once, like the synchronous path) instead of hanging the card.
      if (performance.now() - started > GIVE_UP_MS) break;
    }
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
    gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, out, 0, read.bytes);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
  } finally {
    if (!gl.isContextLost()) {
      gl.deleteSync(sync);
      gl.deleteBuffer(pbo);
    }
  }
}
