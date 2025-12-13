/**
 * Statistics cache utility
 * Caches statistics responses for 5 minutes
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class StatisticsCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }

  clearKey(key: string): void {
    this.cache.delete(key)
  }
}

export const statisticsCache = new StatisticsCache()
