import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function resolveRequestIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const [first] = forwarded.split(',')
    if (first) {
      return first.trim()
    }
  }
  return headers.get('x-real-ip') ?? 'unknown'
}

export function getRequestIp(request: NextRequest): string {
  return resolveRequestIp(request.headers)
}

export function extractBearerTokenFromHeaders(headers: Headers): string | null {
  const authHeader = headers.get('authorization')
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim()
  }
  const fallback = headers.get('x-admin-token')
  return fallback ? fallback.trim() : null
}

export function extractBearerToken(request: NextRequest): string | null {
  return extractBearerTokenFromHeaders(request.headers)
}

export function requireAdminToken(request: NextRequest): NextResponse | null {
  const expectedToken = process.env.SCHOLARSTACK_ADMIN_TOKEN
  if (!expectedToken) {
    return NextResponse.json(
      { error: 'SCHOLARSTACK_ADMIN_TOKEN is not configured on the server' },
      { status: 503 }
    )
  }

  const provided = extractBearerToken(request)
  if (!provided || provided !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
