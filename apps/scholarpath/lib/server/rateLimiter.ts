type Bucket = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  ok: boolean
  retryAfterSeconds: number
}

class MemoryRateLimiter {
  private buckets = new Map<string, Bucket>()

  check(key: string, max: number, windowMs: number): RateLimitResult {
    const now = Date.now()
    const existing = this.buckets.get(key)

    if (!existing || existing.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs })
      return { ok: true, retryAfterSeconds: 0 }
    }

    if (existing.count >= max) {
      return {
        ok: false,
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
      }
    }

    existing.count += 1
    this.buckets.set(key, existing)
    return { ok: true, retryAfterSeconds: 0 }
  }
}

const limiter = new MemoryRateLimiter()

export function checkRateLimit(input: {
  key: string
  max: number
  windowMs: number
}): RateLimitResult {
  return limiter.check(input.key, input.max, input.windowMs)
}
