import { buildQuery } from './buildQuery'
import type { MetricPage, ProfileResponse, ProvenanceEntry, SourceSchool } from './types'

const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''

async function fetchJSON<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`)
  if (!response.ok) {
    throw new Error(`API error ${response.status}`)
  }
  return response.json()
}

export function getMetrics(params: Record<string, unknown>): Promise<MetricPage> {
  const query = buildQuery(params as Record<string, string | number | readonly string[] | undefined>)
  return fetchJSON(`/v1/metrics${query}`)
}

export function getProfile(cohort: 'transfer' | 'freshman', params: Record<string, unknown>): Promise<ProfileResponse> {
  const query = buildQuery(params as Record<string, string | number | readonly string[] | undefined>)
  return fetchJSON(`/v1/profile/${cohort}${query}`)
}

export function getProvenance(params: Record<string, unknown>): Promise<ProvenanceEntry[]> {
  const query = buildQuery(params as Record<string, string | number | readonly string[] | undefined>)
  return fetchJSON(`/v1/provenance${query}`)
}

export function searchSourceSchools(query: string, type?: string): Promise<SourceSchool[]> {
  const params: Record<string, string> = { search: query }
  if (type) {
    params.type = type
  }
  const q = buildQuery(params)
  return fetchJSON(`/v1/source-schools${q}`)
}
