import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/server/rateLimiter'
import { getRequestIp } from '@/lib/server/security'
import { getSupabaseAdminClient } from '@/lib/server/supabaseServer'
import type { CloudPlanRecord } from '@/lib/types'

function isCloudPlanPayload(value: unknown): value is CloudPlanRecord {
  if (!value || typeof value !== 'object') {
    return false
  }
  const payload = value as Record<string, unknown>
  return (
    typeof payload.plan_key === 'string' &&
    typeof payload.campus === 'string' &&
    (payload.cohort === 'transfer' || payload.cohort === 'freshman') &&
    typeof payload.focus === 'string' &&
    Array.isArray(payload.tasks) &&
    Array.isArray(payload.schedule)
  )
}

export async function GET(request: NextRequest) {
  const planKey = new URL(request.url).searchParams.get('plan_key')
  if (!planKey) {
    return NextResponse.json({ error: 'plan_key is required' }, { status: 400 })
  }

  const rateLimit = checkRateLimit({
    key: `plans:read:${getRequestIp(request)}`,
    max: 120,
    windowMs: 5 * 60 * 1000
  })
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  let data: (CloudPlanRecord & { updated_at?: string }) | null = null
  let error: { message: string } | null = null
  try {
    const response = await getSupabaseAdminClient()
      .from('user_plan')
      .select('plan_key,campus,cohort,focus,source_school,school_type,tasks,schedule,updated_at')
      .eq('plan_key', planKey)
      .maybeSingle()
    data = response.data
    error = response.error
  } catch (caughtError) {
    return NextResponse.json(
      { error: caughtError instanceof Error ? caughtError.message : 'Unable to load plan storage' },
      { status: 503 }
    )
  }

  if (error) {
    return NextResponse.json({ error: `Unable to load plan: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ plan: data ?? null })
}

export async function PUT(request: NextRequest) {
  const rateLimit = checkRateLimit({
    key: `plans:write:${getRequestIp(request)}`,
    max: 60,
    windowMs: 5 * 60 * 1000
  })
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  const payload = await request.json()
  if (!isCloudPlanPayload(payload)) {
    return NextResponse.json({ error: 'Invalid plan payload' }, { status: 400 })
  }

  let error: { message: string } | null = null
  try {
    const response = await getSupabaseAdminClient().from('user_plan').upsert(
      {
        plan_key: payload.plan_key,
        campus: payload.campus,
        cohort: payload.cohort,
        focus: payload.focus,
        source_school: payload.source_school ?? null,
        school_type: payload.school_type ?? null,
        tasks: payload.tasks,
        schedule: payload.schedule,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'plan_key' }
    )
    error = response.error
  } catch (caughtError) {
    return NextResponse.json(
      { error: caughtError instanceof Error ? caughtError.message : 'Unable to save plan storage' },
      { status: 503 }
    )
  }

  if (error) {
    return NextResponse.json({ error: `Unable to save plan: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
