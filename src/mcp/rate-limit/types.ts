export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

export interface RateLimiter {
  check(tokenId: string): Promise<RateLimitResult>
}
