import { describe, expect, it, vi } from 'vitest';
import { LivePool } from './pool.js';

describe('LivePool', () => {
  it('should never hold more than max entries and evict the least recently acquired', () => {
    // Arrange
    const pool = new LivePool<string>(() => 2);
    const evicted: string[] = [];
    const entry = (k: string) => ({ onEvict: () => evicted.push(k) });
    // Act
    pool.acquire('a', entry('a'));
    pool.acquire('b', entry('b'));
    pool.acquire('a', entry('a')); // touch: a is now the most recent
    const out = pool.acquire('c', entry('c'));
    // Assert
    expect(out).toEqual(['b']);
    expect(evicted).toEqual(['b']);
    expect(pool.keys().sort()).toEqual(['a', 'c']);
    expect(pool.size).toBe(2);
  });

  it('should treat a changed max at the next acquire', () => {
    let max = 3;
    const pool = new LivePool<number>(() => max);
    const onEvict = vi.fn();
    for (const k of [1, 2, 3]) pool.acquire(k, { onEvict });
    max = 1;
    pool.acquire(4, { onEvict });
    expect(onEvict).toHaveBeenCalledTimes(3);
    expect(pool.keys()).toEqual([4]);
  });

  it('should release without calling onEvict and report whether the key existed', () => {
    const pool = new LivePool<string>(() => 6);
    const onEvict = vi.fn();
    pool.acquire('x', { onEvict });
    expect(pool.release('x')).toBe(true);
    expect(pool.release('x')).toBe(false);
    expect(onEvict).not.toHaveBeenCalled();
  });
});
