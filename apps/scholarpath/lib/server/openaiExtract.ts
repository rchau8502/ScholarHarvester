import type { IngestDraft, IngestRequest, Metric } from '@/lib/types'

const extractionSchema = {
  type: 'object',
  properties: {
    warnings: {
      type: 'array',
      items: { type: 'string' }
    },
    metrics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stat_name: { type: 'string' },
          stat_value_numeric: { type: ['number', 'null'] },
          stat_value_text: { type: ['string', 'null'] },
          unit: { type: ['string', 'null'] },
          notes: { type: ['string', 'null'] }
        },
        required: ['stat_name', 'stat_value_numeric', 'stat_value_text', 'unit', 'notes'],
        additionalProperties: false
      }
    }
  },
  required: ['warnings', 'metrics'],
  additionalProperties: false
} as const

function extractTextOutput(payload: any): string {
  if (typeof payload.output_text === 'string' && payload.output_text.length > 0) {
    return payload.output_text
  }

  const maybeText = payload.output
    ?.flatMap((item: any) => item.content ?? [])
    ?.find((content: any) => typeof content.text === 'string')

  if (typeof maybeText?.text === 'string') {
    return maybeText.text
  }

  throw new Error('OpenAI response did not include text output')
}

export async function extractStructuredMetrics(request: IngestRequest): Promise<IngestDraft> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const model = process.env.OPENAI_MODEL || 'gpt-5'
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content:
            'You extract structured admissions and transfer evidence from official California higher-education source text. Return only values explicitly supported by the text. If a value is missing, set stat_value_numeric and stat_value_text to null and explain in notes.'
        },
        {
          role: 'user',
          content: [
            `Title: ${request.title}`,
            `Publisher: ${request.publisher}`,
            `Source URL: ${request.source_url}`,
            `Campus: ${request.campus}`,
            `Cohort: ${request.cohort}`,
            `Year: ${request.year}`,
            `Term: ${request.term}`,
            `Focus: ${request.focus ?? 'n/a'}`,
            'Extract useful planner metrics such as applicants, admits, enrolled, admit_rate, gpa_p25, gpa_p50, gpa_p75, yield_rate, or acceptance notes when present.',
            'Raw source text follows:',
            request.raw_text
          ].join('\n')
        }
      ],
      reasoning: { effort: 'medium' },
      text: {
        format: {
          type: 'json_schema',
          name: 'scholar_ingest',
          strict: true,
          schema: extractionSchema
        }
      }
    })
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`OpenAI API error ${response.status}: ${detail}`)
  }

  const payload = await response.json()
  const parsed = JSON.parse(extractTextOutput(payload)) as {
    warnings: string[]
    metrics: Array<{
      stat_name: string
      stat_value_numeric: number | null
      stat_value_text: string | null
      unit: string | null
      notes: string | null
    }>
  }

  const datasetId = Date.now()
  const metrics: Metric[] = parsed.metrics.map((metric, index) => ({
    id: index + 1,
    dataset_id: datasetId,
    campus: request.campus,
    major: request.cohort === 'transfer' ? request.focus ?? null : null,
    discipline: request.cohort === 'freshman' ? request.focus ?? null : null,
    cohort: request.cohort,
    stat_name: metric.stat_name,
    stat_value_numeric: metric.stat_value_numeric,
    stat_value_text: metric.stat_value_text,
    unit: metric.unit,
    percentile: metric.stat_name.startsWith('gpa_p') ? metric.stat_name.split('_').at(-1) ?? null : null,
    year: request.year,
    term: request.term,
    notes: metric.notes,
    citations: [
      {
        title: request.title,
        publisher: request.publisher,
        year: request.year,
        source_url: request.source_url,
        interpretation_note: 'AI-assisted extraction from supplied source text. Verify against the official source before publishing.'
      }
    ]
  }))

  return {
    dataset: {
      id: datasetId,
      title: request.title,
      year: request.year,
      term: request.term,
      cohort: request.cohort,
      notes: `AI-assisted extraction for ${request.campus}.`
    },
    metrics,
    warnings: parsed.warnings
  }
}
