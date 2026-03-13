import { NextRequest, NextResponse } from 'next/server'
import { generateAdvisorResponse } from '@/lib/server/openaiAdvisor'
import type { AdvisorRequest } from '@/lib/types'

function isAdvisorRequest(payload: any): payload is AdvisorRequest {
  return (
    payload &&
    typeof payload.campus === 'string' &&
    (payload.cohort === 'transfer' || payload.cohort === 'freshman') &&
    typeof payload.focus === 'string' &&
    Array.isArray(payload.years) &&
    Array.isArray(payload.metrics)
  )
}

export async function POST(request: NextRequest) {
  const payload = await request.json()

  if (!isAdvisorRequest(payload)) {
    return NextResponse.json({ error: 'Invalid advisor payload' }, { status: 400 })
  }

  try {
    const advice = await generateAdvisorResponse(payload)
    return NextResponse.json(advice)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown advisor error' },
      { status: 500 }
    )
  }
}
