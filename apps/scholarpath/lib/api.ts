import { buildQuery } from './buildQuery'
import type {
  AdvisorRequest,
  AdvisorResponse,
  CloudPlanRecord,
  Institution,
  InstitutionSearchResponse,
  MetricPage,
  ProfileResponse,
  ProvenanceEntry,
  SourceSchoolSearchResponse
} from './types'

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

export function searchSourceSchools(query: string, type?: string, state?: string): Promise<SourceSchoolSearchResponse> {
  const params: Record<string, string> = { search: query }
  if (type) {
    params.type = type
  }
  if (state) {
    params.state = state
  }
  const q = buildQuery(params)
  return fetchJSON(`/api/source-schools${q}`)
}

export function searchInstitutions(params: Record<string, string | number | undefined>): Promise<InstitutionSearchResponse> {
  const q = buildQuery(params as Record<string, string | number | readonly string[] | undefined>)
  return fetchJSON(`/api/institutions${q}`)
}

export function getInstitution(externalId: string): Promise<{ institution: Institution | null }> {
  return fetchJSON(`/api/institutions/${encodeURIComponent(externalId)}`)
}

export function getAdvisor(input: AdvisorRequest): Promise<AdvisorResponse> {
  return fetchJSON('/api/advisor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  })
}

export async function getCloudPlan(planKey: string): Promise<CloudPlanRecord | null> {
  const query = buildQuery({ plan_key: planKey })
  const payload = await fetchJSON<{ plan: CloudPlanRecord | null }>(`/api/plans${query}`)
  return payload.plan
}

export async function saveCloudPlan(plan: CloudPlanRecord): Promise<void> {
  await fetchJSON('/api/plans', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(plan)
  })
}
