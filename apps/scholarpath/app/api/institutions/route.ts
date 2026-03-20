import { NextRequest, NextResponse } from 'next/server'
import { searchInstitutionsInSupabase } from '@/lib/server/institutions'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const search = url.searchParams.get('search')
  const state = url.searchParams.get('state')
  const control = url.searchParams.get('control')
  const page = Number(url.searchParams.get('page') ?? '1')
  const perPage = Number(url.searchParams.get('per_page') ?? '24')

  const payload = await searchInstitutionsInSupabase({
    search,
    state,
    control,
    page: Number.isFinite(page) ? page : 1,
    perPage: Number.isFinite(perPage) ? perPage : 24
  })

  return NextResponse.json(payload)
}
