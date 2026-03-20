import type { Institution, InstitutionSearchResponse } from '@/lib/types'
import { getSupabaseReadClient } from '@/lib/server/supabaseServer'

type InstitutionRow = {
  external_id: string
  source: string
  name: string
  city: string | null
  state: string | null
  zip: string | null
  control: string | null
  locale: string | null
  locale_code: number | null
  carnegie_basic: string | null
  highest_degree: string | null
  website: string | null
  price_calculator_url: string | null
  student_size: number | null
  admission_rate: number | null
  sat_average: number | null
  act_midpoint: number | null
  avg_net_price: number | null
  tuition_in_state: number | null
  tuition_out_of_state: number | null
  federal_aid_rate: number | null
  completion_rate: number | null
  retention_rate: number | null
  median_earnings_10yr: number | null
  latitude: number | null
  longitude: number | null
  updated_at: string | null
}

const INSTITUTION_SELECT =
  'external_id,source,name,city,state,zip,control,locale,locale_code,carnegie_basic,highest_degree,website,price_calculator_url,student_size,admission_rate,sat_average,act_midpoint,avg_net_price,tuition_in_state,tuition_out_of_state,federal_aid_rate,completion_rate,retention_rate,median_earnings_10yr,latitude,longitude,updated_at'

function mapInstitution(row: InstitutionRow): Institution {
  return {
    external_id: row.external_id,
    source: row.source,
    name: row.name,
    city: row.city,
    state: row.state,
    zip: row.zip,
    control: row.control,
    locale: row.locale,
    locale_code: row.locale_code,
    carnegie_basic: row.carnegie_basic,
    highest_degree: row.highest_degree,
    website: row.website,
    price_calculator_url: row.price_calculator_url,
    student_size: row.student_size,
    admission_rate: row.admission_rate,
    sat_average: row.sat_average,
    act_midpoint: row.act_midpoint,
    avg_net_price: row.avg_net_price,
    tuition_in_state: row.tuition_in_state,
    tuition_out_of_state: row.tuition_out_of_state,
    federal_aid_rate: row.federal_aid_rate,
    completion_rate: row.completion_rate,
    retention_rate: row.retention_rate,
    median_earnings_10yr: row.median_earnings_10yr,
    latitude: row.latitude,
    longitude: row.longitude,
    updated_at: row.updated_at ?? undefined
  }
}

function isMissingInstitutionTable(message: string | undefined) {
  return !!message && (message.includes('institution') && (message.includes('does not exist') || message.includes('schema cache')))
}

export async function searchInstitutionsInSupabase(params: {
  search?: string | null
  state?: string | null
  control?: string | null
  page?: number | null
  perPage?: number | null
}): Promise<InstitutionSearchResponse> {
  const supabase = getSupabaseReadClient()
  const page = Math.max(1, params.page ?? 1)
  const perPage = Math.min(50, Math.max(1, params.perPage ?? 24))
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase.from('institution').select(INSTITUTION_SELECT, { count: 'exact' }).order('name', { ascending: true }).range(from, to)

  if (params.search?.trim()) {
    query = query.ilike('name', `%${params.search.trim()}%`)
  }
  if (params.state?.trim()) {
    query = query.eq('state', params.state.trim().toUpperCase())
  }
  if (params.control?.trim()) {
    query = query.eq('control', params.control.trim())
  }

  const { data, error, count } = await query
  if (error) {
    if (isMissingInstitutionTable(error.message)) {
      return { items: [], total: 0, page, per_page: perPage }
    }
    throw new Error(`Failed loading institutions: ${error.message}`)
  }

  return {
    items: ((data ?? []) as InstitutionRow[]).map(mapInstitution),
    total: count ?? 0,
    page,
    per_page: perPage
  }
}

export async function getInstitutionFromSupabase(externalId: string): Promise<Institution | null> {
  const supabase = getSupabaseReadClient()
  const { data, error } = await supabase.from('institution').select(INSTITUTION_SELECT).eq('external_id', externalId).maybeSingle()

  if (error) {
    if (isMissingInstitutionTable(error.message)) {
      return null
    }
    throw new Error(`Failed loading institution ${externalId}: ${error.message}`)
  }

  return data ? mapInstitution(data as InstitutionRow) : null
}
