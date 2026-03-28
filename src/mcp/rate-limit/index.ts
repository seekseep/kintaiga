import type { RateLimiter } from './types'

export type { RateLimiter, RateLimitResult } from './types'

let instance: RateLimiter | null = null

export function getRateLimiter(): RateLimiter {
  if (instance) return instance

  if (process.env.UPSTASH_REDIS_REST_URL) {
    const { UpstashRateLimiter } = require('./upstash') as typeof import('./upstash')
    instance = new UpstashRateLimiter()
  } else {
    const { InMemoryRateLimiter } = require('./in-memory') as typeof import('./in-memory')
    instance = new InMemoryRateLimiter()
  }

  return instance
}
