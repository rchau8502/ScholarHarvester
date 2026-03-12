import { NextRequest, NextResponse } from 'next/server'
import { getScholarData } from '@/lib/server/dataSource'
import { queryProvenance } from '@/lib/server/queries'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const campus = url.searchParams.get('campus')
  const year = url.searchParams.get('year')
  const data = await getScholarData()
  return NextResponse.json(queryProvenance(data, { campus, year: year ? Number(year) : null }))
}
