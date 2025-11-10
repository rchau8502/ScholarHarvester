import { Campus, CampusProfile, Metric, Citation } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`)
  }
  return res.json() as Promise<T>
}

export async function getCampuses() {
  return fetchJSON<Campus[]>('/v1/campuses')
}

export async function getMetrics(params: { campus?: string; metric_key?: string }) {
  const search = new URLSearchParams()
  if (params.campus) search.set('campus', params.campus)
  if (params.metric_key) search.set('metric_key', params.metric_key)
  const query = search.toString()
  return fetchJSON<Metric[]>(`/v1/metrics${query ? `?${query}` : ''}`)
}

export async function getCampusProfile(slug: string) {
  return fetchJSON<CampusProfile>(`/v1/profile/${slug}`)
}

export async function getProvenance() {
  return fetchJSON<Citation[]>('/v1/provenance')
}
