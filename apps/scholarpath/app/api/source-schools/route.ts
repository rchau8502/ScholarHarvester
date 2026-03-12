import { NextRequest, NextResponse } from 'next/server'
import { getScholarData } from '@/lib/server/dataSource'
import { querySourceSchools } from '@/lib/server/queries'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const search = url.searchParams.get('search')
  const type = url.searchParams.get('type')
  const data = await getScholarData()
  return NextResponse.json(querySourceSchools(data, { search, type }))
}
