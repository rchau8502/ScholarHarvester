import { NextRequest, NextResponse } from 'next/server'
import { extractStructuredMetrics } from '@/lib/server/openaiExtract'
import type { IngestRequest, IngestResponse, PersistenceResult } from '@/lib/types'

function validateRequest(payload: any): payload is IngestRequest {
  return (
    payload &&
    typeof payload.title === 'string' &&
    typeof payload.publisher === 'string' &&
    typeof payload.source_url === 'string' &&
    typeof payload.campus === 'string' &&
    (payload.cohort === 'transfer' || payload.cohort === 'freshman') &&
    typeof payload.year === 'number' &&
    typeof payload.term === 'string' &&
    typeof payload.raw_text === 'string'
  )
}

async function persistIfConfigured(payload: IngestResponse): Promise<PersistenceResult> {
  const webhookUrl =
    process.env.SCHOLARSTACK_INGEST_WEBHOOK_URL ?? process.env.SCHOLARPATH_INGEST_WEBHOOK_URL
  if (!webhookUrl) {
    return {
      mode: 'none',
      status: 'not_configured',
      detail: 'No persistence webhook configured. Extraction returned only in the API response.'
    }
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const detail = await response.text()
    return {
      mode: 'webhook',
      status: 'failed',
      detail: `Webhook responded with ${response.status}: ${detail}`
    }
  }

  return {
    mode: 'webhook',
    status: 'persisted',
    detail: 'Extraction forwarded to the configured persistence webhook.'
  }
}

export async function POST(request: NextRequest) {
  const payload = await request.json()
  if (!validateRequest(payload)) {
    return NextResponse.json({ error: 'Invalid ingest payload' }, { status: 400 })
  }

  try {
    const extraction = await extractStructuredMetrics(payload)
    const provisional: IngestResponse = {
      extraction,
      persistence: {
        mode: 'none',
        status: 'skipped',
        detail: 'Persistence has not been attempted yet.'
      }
    }
    const persistence = await persistIfConfigured(provisional)
    return NextResponse.json({
      extraction,
      persistence
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown ingest error' },
      { status: 500 }
    )
  }
}
