type Entry<T> = { value: T | null; expiresAt: number }

type Options = {
  ttlMs: number
  /** Upper bound so random `Host` headers cannot grow memory without limit. */
  maxEntries?: number
  now?: () => number
}

/**
 * In-process cache for host → tenant lookups. Unknown hosts are cached as `null` too,
 * so repeated requests for a foreign domain do not hit the database.
 */
export function createTenantCache<T>(
  lookup: (host: string) => Promise<T | null>,
  { ttlMs, maxEntries = 500, now = Date.now }: Options,
) {
  const entries = new Map<string, Entry<T>>()

  return {
    async get(host: string): Promise<T | null> {
      const cached = entries.get(host)
      if (cached && cached.expiresAt > now()) return cached.value

      const value = await lookup(host)
      if (entries.size >= maxEntries) entries.clear()
      entries.set(host, { value, expiresAt: now() + ttlMs })
      return value
    },
    clear(): void {
      entries.clear()
    },
    size(): number {
      return entries.size
    },
  }
}
