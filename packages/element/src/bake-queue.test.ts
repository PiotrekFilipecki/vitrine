/**
 * Bake queue (Q0, B4): every bake's synchronous part gets its own task, near-viewport elements first.
 * Node environment: no rAF / rIC, so the queue falls back to timeouts; fake timers drive it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { acquireBakeSlot, bakeQueueLength } from './bake-queue.js';

function fakeEl(top: number): Element {
  return {
    getBoundingClientRect: () => ({ top, bottom: top + 200, left: 0, right: 200 }),
  } as unknown as Element;
}

describe('acquireBakeSlot', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('window', { innerHeight: 800, innerWidth: 400 });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('should hand out one slot at a time and the next only after release', async () => {
    // Arrange
    const order: string[] = [];
    const a = acquireBakeSlot(fakeEl(0)).then((release) => {
      order.push('a');
      return release;
    });
    const b = acquireBakeSlot(fakeEl(100)).then((release) => {
      order.push('b');
      return release;
    });
    // Act
    await vi.advanceTimersByTimeAsync(100);
    // Assert
    expect(order).toEqual(['a']);
    (await a)();
    await vi.advanceTimersByTimeAsync(100);
    expect(order).toEqual(['a', 'b']);
    (await b)();
    expect(bakeQueueLength()).toBe(0);
  });

  it('should serve near-viewport elements before far ones that asked earlier', async () => {
    // Arrange: the first slot is taken, then a far card and a visible card wait.
    const order: string[] = [];
    const first = await (async () => {
      const p = acquireBakeSlot(fakeEl(0));
      await vi.advanceTimersByTimeAsync(10);
      return p;
    })();
    const far = acquireBakeSlot(fakeEl(5000)).then((r) => (order.push('far'), r));
    const near = acquireBakeSlot(fakeEl(300)).then((r) => (order.push('near'), r));
    // Act
    first();
    await vi.advanceTimersByTimeAsync(10);
    (await near)();
    await vi.advanceTimersByTimeAsync(100); // far cards wait for an idle period (50 ms fallback without rIC)
    (await far)();
    // Assert
    expect(order).toEqual(['near', 'far']);
  });

  it('should never grant synchronously: the bake starts in a later task', async () => {
    // Arrange
    let granted = false;
    const p = acquireBakeSlot(fakeEl(0)).then((r) => {
      granted = true;
      return r;
    });
    // Act: flush microtasks only.
    await Promise.resolve();
    await Promise.resolve();
    // Assert
    expect(granted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(granted).toBe(true);
    (await p)();
  });
});
