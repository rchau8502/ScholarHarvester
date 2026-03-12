import { NextRequest, NextResponse } from 'next/server'
import { getScholarData } from '@/lib/server/dataSource'
import { queryMetrics } from '@/lib/server/queries'

const MAX_LIMIT = 50

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const params = url.searchParams
  const data = await getScholarData()

  const rawLimit = Number(params.get('limit')) || MAX_LIMIT
  const limit = Math.min(Math.max(rawLimit, 1), MAX_LIMIT)

  return NextResponse.json(
    queryMetrics(data, {
      campus: params.get('campus'),
      major: params.get('major'),
      discipline: params.get('discipline'),
      cohort: params.get('cohort'),
      stat_name: params.get('stat_name'),
      source_school: params.get('source_school'),
      school_type: params.get('school_type'),
      year: params.get('year') ? Number(params.get('year')) : null,
      year_min: params.get('year_min') ? Number(params.get('year_min')) : null,
      year_max: params.get('year_max') ? Number(params.get('year_max')) : null,
      years: params
        .getAll('years')
        .map((year) => Number(year))
        .filter((year) => !Number.isNaN(year)),
      cursor: params.get('cursor') ? Number(params.get('cursor')) : null,
      limit
    })
  )
}
