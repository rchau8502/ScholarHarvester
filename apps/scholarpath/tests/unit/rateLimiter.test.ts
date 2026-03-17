import { describe, expect, test, vi } from 'vitest'
import { checkRateLimit } from '@/lib/server/rateLimiter'

describe('rate limiter', () => {
  test('blocks after max requests in the window', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

    const key = `test:${Math.random().toString(36).slice(2)}`
    const first = checkRateLimit({ key, max: 2, windowMs: 60_000 })
    const second = checkRateLimit({ key, max: 2, windowMs: 60_000 })
    const third = checkRateLimit({ key, max: 2, windowMs: 60_000 })

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    expect(third.ok).toBe(false)
    expect(third.retryAfterSeconds).toBeGreaterThan(0)

    vi.useRealTimers()
  })
})
