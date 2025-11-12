import { buildQuery } from './buildQuery'
import type { MetricPage, ProfileResponse, ProvenanceEntry, SourceSchool } from './types'

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  if (!response.ok) {
    throw new Error(`API error ${response.status}`)
  }
  return response.json()
}

export function getMetrics(params: Record<string, unknown>): Promise<MetricPage> {
  const query = buildQuery(params as Record<string, string | number | readonly string[] | undefined>)
  return fetchJSON(`/api/metrics${query}`)
}

export function getProfile(cohort: 'transfer' | 'freshman', params: Record<string, unknown>): Promise<ProfileResponse> {
  const query = buildQuery(params as Record<string, string | number | readonly string[] | undefined>)
  return fetchJSON(`/api/profile/${cohort}${query}`)
}

export function getProvenance(params: Record<string, unknown>): Promise<ProvenanceEntry[]> {
  const query = buildQuery(params as Record<string, string | number | readonly string[] | undefined>)
  return fetchJSON(`/api/provenance${query}`)
}

export function searchSourceSchools(query: string, type?: string): Promise<SourceSchool[]> {
  const params: Record<string, string> = { search: query }
  if (type) {
    params.type = type
  }
  const q = buildQuery(params)
  return fetchJSON(`/api/source-schools${q}`)
}
