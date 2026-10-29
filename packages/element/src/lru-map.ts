/** Tiny LRU map for baked results (object URLs). Evicted URLs are revoked by the owner through onEvict. */
export class LruMap<K, V> {
  #map = new Map<K, V>();
  #max: number;
  #onEvict: ((value: V, key: K) => void) | undefined;

  constructor(max: number, onEvict?: (value: V, key: K) => void) {
    this.#max = Math.max(1, max);
    this.#onEvict = onEvict;
  }

  get size(): number {
    return this.#map.size;
  }

  get(key: K): V | undefined {
    const v = this.#map.get(key);
    if (v !== undefined) {
      this.#map.delete(key);
      this.#map.set(key, v);
    }
    return v;
  }

  set(key: K, value: V): void {
    if (this.#map.has(key)) this.#map.delete(key);
    this.#map.set(key, value);
    while (this.#map.size > this.#max) {
      const oldest = this.#map.keys().next().value as K;
      const v = this.#map.get(oldest)!;
      this.#map.delete(oldest);
      this.#onEvict?.(v, oldest);
    }
  }

  delete(key: K): void {
    const v = this.#map.get(key);
    if (v !== undefined) {
      this.#map.delete(key);
      this.#onEvict?.(v, key);
    }
  }

  clear(): void {
    for (const [k, v] of this.#map) this.#onEvict?.(v, k);
    this.#map.clear();
  }
}
