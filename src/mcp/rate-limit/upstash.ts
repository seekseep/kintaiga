import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { RateLimiter, RateLimitResult } from './types'

export class UpstashRateLimiter implements RateLimiter {
  private ratelimit: Ratelimit

  constructor() {
    this.ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      prefix: 'kintaiga:mcp:ratelimit',
    })
  }

  async check(tokenId: string): Promise<RateLimitResult> {
    const result = await this.ratelimit.limit(tokenId)
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetAt: new Date(result.reset),
    }
  }
}
