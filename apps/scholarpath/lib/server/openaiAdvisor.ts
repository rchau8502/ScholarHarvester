import type { AdvisorRequest, AdvisorResponse } from '@/lib/types'

const advisorSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    cautions: { type: 'array', items: { type: 'string' } },
    next_steps: { type: 'array', items: { type: 'string' } },
    disclaimer: { type: 'string' }
  },
  required: ['summary', 'strengths', 'cautions', 'next_steps', 'disclaimer'],
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

export async function generateAdvisorResponse(request: AdvisorRequest): Promise<AdvisorResponse> {
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
            'You are a college planning analyst. Use only the supplied metrics. Do not invent odds, rankings, or unstated facts. Keep the advice practical and brief.'
        },
        {
          role: 'user',
          content: [
            `Campus: ${request.campus}`,
            `Cohort: ${request.cohort}`,
            `Focus: ${request.focus}`,
            `Source school: ${request.sourceSchool ?? 'n/a'}`,
            `School type: ${request.schoolType ?? 'n/a'}`,
            `Years: ${request.years.join(', ')}`,
            'Available metrics JSON:',
            JSON.stringify(
              request.metrics.map((metric) => ({
                stat_name: metric.stat_name,
                value: metric.stat_value_numeric ?? metric.stat_value_text ?? null,
                unit: metric.unit,
                year: metric.year,
                term: metric.term
              }))
            ),
            'Return a concise applicant-facing interpretation with strengths, cautions, and next steps. Mention uncertainty if the evidence is thin or synthetic.'
          ].join('\n')
        }
      ],
      reasoning: { effort: 'medium' },
      text: {
        format: {
          type: 'json_schema',
          name: 'scholar_advisor',
          strict: true,
          schema: advisorSchema
        }
      }
    })
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`OpenAI API error ${response.status}: ${detail}`)
  }

  const payload = await response.json()
  return JSON.parse(extractTextOutput(payload)) as AdvisorResponse
}
