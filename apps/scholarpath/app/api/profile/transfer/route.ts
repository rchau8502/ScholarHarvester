import { NextRequest, NextResponse } from 'next/server'
import { getScholarData } from '@/lib/server/dataSource'
import { queryProfile } from '@/lib/server/queries'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const campus = url.searchParams.get('campus')
  const major = url.searchParams.get('major')
  const sourceSchool = url.searchParams.get('source_school')
  const schoolType = url.searchParams.get('school_type')
  const years = url.searchParams
    .getAll('years')
    .map(Number)
    .filter((value) => !Number.isNaN(value))

  if (!campus || !major) {
    return NextResponse.json({ error: 'campus and major are required' }, { status: 400 })
  }

  const data = await getScholarData()
  const profile = queryProfile(data, {
    campus,
    cohort: 'transfer',
    major,
    source_school: sourceSchool,
    school_type: schoolType,
    years
  })

  if (!profile.metrics.length) {
    return NextResponse.json({ error: 'No profile data found' }, { status: 404 })
  }

  return NextResponse.json(profile)
}
