import { NextRequest, NextResponse } from 'next/server'
import { supaAnon } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const campus = url.searchParams.get('campus')
  const major = url.searchParams.get('major')
  const years = url.searchParams
    .getAll('years')
    .map(Number)
    .filter((value) => !Number.isNaN(value))

  if (!campus || !major) {
    return NextResponse.json({ error: 'campus and major are required' }, { status: 400 })
  }

  const client = supaAnon()
  let query = client
    .from('metric')
    .select(
      `
      id,campus,major,discipline,source_school,school_type,cohort,year,term,stat_name,
      stat_value_numeric,stat_value_text,unit,percentile,notes,
      citations:citation (id,title,publisher,year,source_url,interpretation_note)
    `
    )
    .eq('campus', campus)
    .eq('cohort', 'transfer')
    .eq('major', major)
    .order('year', { ascending: true })

  if (years.length) {
    query = query.in('year', years)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  if (!data || !data.length) {
    return NextResponse.json({ error: 'No profile data found' }, { status: 404 })
  }

  const metrics = data.map((row) => ({
    ...row,
    stat_value_numeric: row.stat_value_numeric == null ? null : Number(row.stat_value_numeric),
    citations: row.citations ?? [],
  }))
  const yearList = Array.from(new Set(metrics.map((row) => row.year))).sort((a, b) => a - b)

  return NextResponse.json({
    campus,
    cohort: 'transfer',
    major,
    discipline: null,
    years: yearList,
    metrics,
  })
}
