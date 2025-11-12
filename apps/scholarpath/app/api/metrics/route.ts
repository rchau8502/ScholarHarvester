import { NextRequest, NextResponse } from 'next/server'
import { supaAnon } from '@/lib/supabase'

const MAX_LIMIT = 50

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const params = url.searchParams
  const client = supaAnon()

  const rawLimit = Number(params.get('limit')) || MAX_LIMIT
  const limit = Math.min(Math.max(rawLimit, 1), MAX_LIMIT)
  const cursor = params.get('cursor')

  let query = client
    .from('metric')
    .select(
      `
      id,dataset_id,campus,major,discipline,source_school,school_type,cohort,year,term,stat_name,
      stat_value_numeric,stat_value_text,unit,percentile,notes,
      citations:citation (
        id,title,publisher,year,source_url,interpretation_note
      )
    `
    )

  const eqKeys = ['campus', 'major', 'discipline', 'cohort', 'stat_name', 'source_school', 'school_type', 'year'] as const
  eqKeys.forEach((key) => {
    const value = params.get(key as string)
    if (value) {
      query = query.eq(key as string, key === 'year' ? Number(value) : value)
    }
  })

  const yearMin = params.get('year_min')
  if (yearMin) {
    query = query.gte('year', Number(yearMin))
  }
  const yearMax = params.get('year_max')
  if (yearMax) {
    query = query.lte('year', Number(yearMax))
  }

  const years = params.getAll('years').map((yr) => Number(yr)).filter((yr) => !Number.isNaN(yr))
  if (years.length) {
    query = query.in('year', years)
  }

  if (cursor) {
    query = query.gt('id', Number(cursor))
  }

  query = query.order('id', { ascending: true }).limit(limit + 1)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const rows = data ?? []
  const items = rows.slice(0, limit).map((row) => ({
    ...row,
    stat_value_numeric: row.stat_value_numeric == null ? null : Number(row.stat_value_numeric),
    citations: row.citations ?? [],
  }))
  const nextCursor = rows.length > limit ? String(rows[limit].id) : null

  return NextResponse.json({ items, page_info: { next_cursor: nextCursor } })
}
