export class TtlCache<V> {
  private readonly map = new Map<string, { value: V; expiresAt: number }>();

  constructor(private readonly defaultTtlMs: number) {}

  get(key: string): V | undefined {
    const v = this.map.get(key);
    if (!v) return undefined;
    if (Date.now() >= v.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    return v.value;
  }

  set(key: string, value: V, ttlMs?: number) {
    const ttl = ttlMs ?? this.defaultTtlMs;
    this.map.set(key, { value, expiresAt: Date.now() + ttl });
  }
}

