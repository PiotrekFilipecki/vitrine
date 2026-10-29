import { describe, expect, it, vi } from 'vitest';
import { LruMap } from './lru-map.js';

describe('LruMap', () => {
  it('should evict the least recently read entry and notify', () => {
    const onEvict = vi.fn();
    const m = new LruMap<string, number>(2, onEvict);
    m.set('a', 1);
    m.set('b', 2);
    expect(m.get('a')).toBe(1); // a becomes most recent
    m.set('c', 3);
    expect(onEvict).toHaveBeenCalledWith(2, 'b');
    expect(m.get('b')).toBeUndefined();
    expect(m.size).toBe(2);
  });

  it('should notify on explicit delete and clear', () => {
    const onEvict = vi.fn();
    const m = new LruMap<string, number>(5, onEvict);
    m.set('a', 1);
    m.set('b', 2);
    m.delete('a');
    m.clear();
    expect(onEvict.mock.calls.map((c) => c[1])).toEqual(['a', 'b']);
  });
});
