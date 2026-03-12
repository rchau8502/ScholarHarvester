import type { Citation, DatasetEntry, Metric, ScholarDataBundle, SourceSchool } from '@/lib/types'
import { LOCAL_SCHOLAR_DATA } from '@/lib/server/localData'

function isCitation(value: unknown): value is Citation {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.title === 'string' && typeof candidate.publisher === 'string' && typeof candidate.source_url === 'string'
}

function isDataset(value: unknown): value is DatasetEntry {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.id === 'number' && typeof candidate.title === 'string' && typeof candidate.year === 'number' && typeof candidate.cohort === 'string'
}

function isSourceSchool(value: unknown): value is SourceSchool {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.name === 'string' && typeof candidate.school_type === 'string'
}

function isMetric(value: unknown): value is Metric {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.campus === 'string' &&
    typeof candidate.cohort === 'string' &&
    typeof candidate.stat_name === 'string' &&
    typeof candidate.year === 'number' &&
    typeof candidate.term === 'string' &&
    Array.isArray(candidate.citations) &&
    candidate.citations.every(isCitation)
  )
}

function normalizeBundle(payload: unknown): ScholarDataBundle {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Data source returned an invalid payload')
  }
  const candidate = payload as Record<string, unknown>
  const datasets = Array.isArray(candidate.datasets) ? candidate.datasets : []
  const metrics = Array.isArray(candidate.metrics) ? candidate.metrics : []
  const sourceSchools = Array.isArray(candidate.sourceSchools) ? candidate.sourceSchools : []

  if (!datasets.every(isDataset) || !metrics.every(isMetric) || !sourceSchools.every(isSourceSchool)) {
    throw new Error('Data source payload did not match the expected schema')
  }

  return {
    datasets,
    metrics,
    sourceSchools
  }
}

export async function getScholarData(): Promise<ScholarDataBundle> {
  const remoteUrl = process.env.SCHOLARPATH_DATA_URL
  if (!remoteUrl) {
    return LOCAL_SCHOLAR_DATA
  }

  const response = await fetch(remoteUrl, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 }
  })

  if (!response.ok) {
    throw new Error(`Unable to load remote data source (${response.status})`)
  }

  return normalizeBundle(await response.json())
}
