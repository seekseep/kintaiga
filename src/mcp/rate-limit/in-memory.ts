import type { RateLimiter, RateLimitResult } from './types'

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 60

export class InMemoryRateLimiter implements RateLimiter {
  private windows = new Map<string, { timestamps: number[] }>()

  async check(tokenId: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - WINDOW_MS

    let entry = this.windows.get(tokenId)
    if (!entry) {
      entry = { timestamps: [] }
      this.windows.set(tokenId, entry)
    }

    // Remove expired timestamps
    entry.timestamps = entry.timestamps.filter(t => t > windowStart)

    if (entry.timestamps.length >= MAX_REQUESTS) {
      const oldest = entry.timestamps[0]
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(oldest + WINDOW_MS),
      }
    }

    entry.timestamps.push(now)
    return {
      allowed: true,
      remaining: MAX_REQUESTS - entry.timestamps.length,
      resetAt: new Date(now + WINDOW_MS),
    }
  }
}
