/**
 * LRU pool of live (animated) mounts, PLAN D3. Pure: no DOM, so Vitest covers it.
 * "Recently used" = last acquire; the element acquires on viewport entry and releases on exit.
 */
export interface PoolEntry {
  onEvict: () => void;
}

export class LivePool<K> {
  #entries = new Map<K, PoolEntry & { t: number }>();
  #clock = 0;
  #getMax: () => number;

  constructor(getMax: () => number) {
    this.#getMax = getMax;
  }

  get size(): number {
    return this.#entries.size;
  }

  has(key: K): boolean {
    return this.#entries.has(key);
  }

  /** Returns the keys evicted to make room (already notified through onEvict). */
  acquire(key: K, entry: PoolEntry): K[] {
    const existing = this.#entries.get(key);
    if (existing) {
      existing.t = ++this.#clock;
      return [];
    }
    const evicted: K[] = [];
    const max = Math.max(1, this.#getMax());
    while (this.#entries.size >= max) {
      let oldestKey: K | undefined;
      let oldestT = Infinity;
      for (const [k, v] of this.#entries) {
        if (v.t < oldestT) {
          oldestT = v.t;
          oldestKey = k;
        }
      }
      if (oldestKey === undefined) break;
      const victim = this.#entries.get(oldestKey)!;
      this.#entries.delete(oldestKey);
      victim.onEvict();
      evicted.push(oldestKey);
    }
    this.#entries.set(key, { ...entry, t: ++this.#clock });
    return evicted;
  }

  release(key: K): boolean {
    return this.#entries.delete(key);
  }

  keys(): K[] {
    return [...this.#entries.keys()];
  }
}
