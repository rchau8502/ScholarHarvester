import { NextRequest, NextResponse } from 'next/server'
import { supaAnon } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const search = url.searchParams.get('search')
  const type = url.searchParams.get('type')

  const client = supaAnon()
  let query = client.from('source_school').select('name,school_type,city,state').limit(25)
  if (type) {
    query = query.eq('school_type', type)
  }
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json(data ?? [])
}
