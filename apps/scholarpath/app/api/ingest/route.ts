import { NextRequest, NextResponse } from 'next/server'
import { extractStructuredMetrics } from '@/lib/server/openaiExtract'
import { checkRateLimit } from '@/lib/server/rateLimiter'
import { requireAdminToken, getRequestIp } from '@/lib/server/security'
import { getSupabaseAdminClient } from '@/lib/server/supabaseServer'
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

async function persistToSupabase(extraction: IngestResponse['extraction']): Promise<PersistenceResult> {
  const supabase = getSupabaseAdminClient()
  const { data: dataset, error: datasetError } = await supabase
    .from('dataset')
    .upsert(
      {
        title: extraction.dataset.title,
        year: extraction.dataset.year,
        cohort: extraction.dataset.cohort,
        term: extraction.dataset.term,
        source: 'AI ingest',
        notes: extraction.dataset.notes ?? null
      },
      { onConflict: 'title,year,cohort,term' }
    )
    .select('id')
    .single()

  if (datasetError || !dataset) {
    throw new Error(`Unable to persist dataset: ${datasetError?.message ?? 'dataset insert failed'}`)
  }

  let persistedMetrics = 0
  let persistedCitations = 0

  for (const metric of extraction.metrics) {
    const { data: metricRow, error: metricError } = await supabase
      .from('metric')
      .upsert(
        {
          dataset_id: dataset.id,
          campus: metric.campus,
          major: metric.major ?? null,
          discipline: metric.discipline ?? null,
          source_school: metric.source_school ?? null,
          school_type: metric.school_type ?? null,
          cohort: metric.cohort,
          year: metric.year,
          term: metric.term,
          stat_name: metric.stat_name,
          stat_value_numeric: metric.stat_value_numeric ?? null,
          stat_value_text: metric.stat_value_text ?? null,
          unit: metric.unit ?? null,
          percentile: metric.percentile ?? null,
          notes: metric.notes ?? null
        },
        { onConflict: 'dataset_id,campus,major,discipline,stat_name,year,term' }
      )
      .select('id')
      .single()

    if (metricError || !metricRow) {
      throw new Error(`Unable to persist metric "${metric.stat_name}": ${metricError?.message ?? 'insert failed'}`)
    }

    persistedMetrics += 1
    if (!metric.citations.length) {
      continue
    }

    const { error: citationsError } = await supabase.from('citation').upsert(
      metric.citations.map((citation) => ({
        metric_id: metricRow.id,
        title: citation.title,
        publisher: citation.publisher,
        year: citation.year,
        source_url: citation.source_url,
        interpretation_note: citation.interpretation_note ?? null
      })),
      { onConflict: 'metric_id,source_url' }
    )

    if (citationsError) {
      throw new Error(`Unable to persist citations for "${metric.stat_name}": ${citationsError.message}`)
    }

    persistedCitations += metric.citations.length
  }

  return {
    mode: 'supabase',
    status: 'persisted',
    detail: `Persisted ${persistedMetrics} metrics and ${persistedCitations} citations to Supabase.`
  }
}

export async function POST(request: NextRequest) {
  const adminResponse = requireAdminToken(request)
  if (adminResponse) {
    return adminResponse
  }

  const rateLimit = checkRateLimit({
    key: `ingest:${getRequestIp(request)}`,
    max: 8,
    windowMs: 5 * 60 * 1000
  })
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

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
        detail: 'Persistence has not run yet.'
      }
    }
    const persistence = await persistToSupabase(provisional.extraction)
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
