import { describe, expect, test } from 'vitest'
import { extractBearerTokenFromHeaders, resolveRequestIp } from '@/lib/server/security'

describe('security helpers', () => {
  test('extracts bearer token from authorization header', () => {
    const headers = new Headers({ authorization: 'Bearer secret-token' })
    expect(extractBearerTokenFromHeaders(headers)).toBe('secret-token')
  })

  test('falls back to x-admin-token header', () => {
    const headers = new Headers({ 'x-admin-token': 'backup-token' })
    expect(extractBearerTokenFromHeaders(headers)).toBe('backup-token')
  })

  test('resolves ip from x-forwarded-for first hop', () => {
    const headers = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })
    expect(resolveRequestIp(headers)).toBe('1.2.3.4')
  })
})
