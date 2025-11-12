import { NextRequest, NextResponse } from 'next/server'
import { supaAnon } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const campus = url.searchParams.get('campus')
  const year = url.searchParams.get('year')

  const client = supaAnon()
  let query = client
    .from('metric')
    .select(
      `
      id,campus,
      dataset:dataset(id,title,year,term,cohort,notes),
      citations:citation(id,title,publisher,year,source_url,interpretation_note)
    `
    )
    .limit(25)

  if (campus) {
    query = query.eq('campus', campus)
  }
  if (year) {
    query = query.eq('year', Number(year))
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const grouped = new Map<
    number,
    {
      dataset: {
        id: number
        title: string
        year: number
        term: string
        cohort: string
        notes: string | null
      }
      campus: string
      citations: {
        title: string
        publisher: string
        year: number
        source_url: string
        interpretation_note?: string | null
      }[]
    }
  >()

  for (const row of data ?? []) {
    const dataset = row.dataset
    if (!dataset) {
      // skip rows missing dataset linkage
      continue
    }
    if (!grouped.has(dataset.id)) {
      grouped.set(dataset.id, {
        dataset: {
          id: dataset.id,
          title: dataset.title,
          year: dataset.year,
          term: dataset.term ?? 'N/A',
          cohort: dataset.cohort,
          notes: dataset.notes ?? null,
        },
        campus: row.campus,
        citations: [],
      })
    }
    const citations = row.citations ?? []
    const entry = grouped.get(dataset.id)
    citations.forEach((cite: any) => {
      entry?.citations.push({
        title: cite.title,
        publisher: cite.publisher,
        year: cite.year,
        source_url: cite.source_url,
        interpretation_note: cite.interpretation_note ?? null,
      })
    })
  }

  return NextResponse.json(Array.from(grouped.values()))
}
