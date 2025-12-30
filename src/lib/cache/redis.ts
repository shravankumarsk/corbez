import Redis from 'ioredis'

// Redis connection with fallback for development
const getRedisUrl = () => {
  if (process.env.REDIS_URL) return process.env.REDIS_URL
  // Fallback: in-memory mock for development without Redis
  return null
}

// Create Redis client or mock
const createClient = () => {
  const url = getRedisUrl()

  if (!url) {
    console.warn('[Cache] REDIS_URL not set - using in-memory cache')
    return null
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  })

  client.on('error', (err) => {
    console.error('[Cache] Redis error:', err.message)
  })

  client.on('connect', () => {
    console.log('[Cache] Redis connected')
  })

  return client
}

const redis = createClient()

// In-memory fallback cache
const memoryCache = new Map<string, { value: string; expiry: number }>()

const cleanExpiredMemoryCache = () => {
  const now = Date.now()
  for (const [key, item] of memoryCache) {
    if (item.expiry < now) memoryCache.delete(key)
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanExpiredMemoryCache, 60000)
}

export const cache = {
  /**
   * Get a cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (redis) {
        const data = await redis.get(key)
        return data ? JSON.parse(data) : null
      }

      // Memory fallback
      const item = memoryCache.get(key)
      if (!item) return null
      if (item.expiry < Date.now()) {
        memoryCache.delete(key)
        return null
      }
      return JSON.parse(item.value)
    } catch (error) {
      console.error('[Cache] Get error:', error)
      return null
    }
  },

  /**
   * Set a cached value with TTL
   */
  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    try {
      const serialized = JSON.stringify(value)

      if (redis) {
        await redis.setex(key, ttlSeconds, serialized)
        return
      }

      // Memory fallback
      memoryCache.set(key, {
        value: serialized,
        expiry: Date.now() + ttlSeconds * 1000,
      })
    } catch (error) {
      console.error('[Cache] Set error:', error)
    }
  },

  /**
   * Delete a specific key
   */
  async del(key: string): Promise<void> {
    try {
      if (redis) {
        await redis.del(key)
        return
      }
      memoryCache.delete(key)
    } catch (error) {
      console.error('[Cache] Del error:', error)
    }
  },

  /**
   * Invalidate all keys matching a pattern
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      if (redis) {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
        return
      }

      // Memory fallback - simple prefix matching
      const prefix = pattern.replace('*', '')
      for (const key of memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          memoryCache.delete(key)
        }
      }
    } catch (error) {
      console.error('[Cache] Invalidate error:', error)
    }
  },

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 300
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const value = await fetcher()
    await this.set(key, value, ttlSeconds)
    return value
  },

  /**
   * Increment a counter (for rate limiting)
   */
  async incr(key: string, ttlSeconds = 60): Promise<number> {
    try {
      if (redis) {
        const pipeline = redis.pipeline()
        pipeline.incr(key)
        pipeline.expire(key, ttlSeconds)
        const results = await pipeline.exec()
        return results?.[0]?.[1] as number || 1
      }

      // Memory fallback
      const item = memoryCache.get(key)
      const count = item ? parseInt(item.value) + 1 : 1
      memoryCache.set(key, {
        value: String(count),
        expiry: Date.now() + ttlSeconds * 1000,
      })
      return count
    } catch (error) {
      console.error('[Cache] Incr error:', error)
      return 1
    }
  },

  /**
   * Check if Redis is connected
   */
  isConnected(): boolean {
    return redis?.status === 'ready'
  },

  /**
   * Get raw Redis client for advanced operations
   */
  getClient() {
    return redis
  },
}

// Cache key generators for consistency
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:${id}:profile`,
  company: (id: string) => `company:${id}`,
  companyEmployees: (id: string) => `company:${id}:employees`,
  companyStats: (id: string) => `company:${id}:stats`,
  merchant: (id: string) => `merchant:${id}`,
  merchantDiscounts: (id: string) => `merchant:${id}:discounts`,
  discounts: (merchantId: string) => `discounts:${merchantId}`,
  session: (id: string) => `session:${id}`,
  rateLimit: (ip: string, route: string) => `rate:${ip}:${route}`,
  referral: (code: string) => `referral:${code}`,
}

export default cache
