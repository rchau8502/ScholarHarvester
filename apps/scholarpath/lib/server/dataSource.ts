import type { Citation, DatasetEntry, Metric, ScholarDataBundle, SourceSchool } from '@/lib/types'
import { getSupabaseReadClient } from '@/lib/server/supabaseServer'

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

type DatasetRow = {
  id: number
  title: string
  year: number
  term: string | null
  cohort: string
  notes: string | null
}

type MetricRow = {
  id: number
  dataset_id: number | null
  campus: string
  major: string | null
  discipline: string | null
  source_school: string | null
  school_type: string | null
  cohort: string
  stat_name: string
  stat_value_numeric: number | null
  stat_value_text: string | null
  unit: string | null
  percentile: string | null
  year: number
  term: string | null
  notes: string | null
}

type CitationRow = {
  metric_id: number
  title: string
  publisher: string
  year: number
  source_url: string
  interpretation_note: string | null
}

type SourceSchoolRow = {
  name: string
  school_type: string
  city: string | null
  state: string | null
}

async function fetchAllRows<T extends Record<string, unknown>>(
  table: string,
  select: string,
  orderBy: string
): Promise<T[]> {
  const supabase = getSupabaseReadClient()
  const pageSize = 1000
  const rows: T[] = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order(orderBy, { ascending: true })
      .range(offset, offset + pageSize - 1)

    if (error) {
      throw new Error(`Failed loading ${table}: ${error.message}`)
    }

    const batch = ((data ?? []) as unknown[]) as T[]
    rows.push(...batch)
    if (batch.length < pageSize) {
      return rows
    }
    offset += pageSize
  }
}

async function fetchLiveBundleFromSupabase(): Promise<ScholarDataBundle> {
  const [datasets, metrics, citations, sourceSchools] = await Promise.all([
    fetchAllRows<DatasetRow>('dataset', 'id,title,year,term,cohort,notes', 'id'),
    fetchAllRows<MetricRow>(
      'metric',
      'id,dataset_id,campus,major,discipline,source_school,school_type,cohort,stat_name,stat_value_numeric,stat_value_text,unit,percentile,year,term,notes',
      'id'
    ),
    fetchAllRows<CitationRow>('citation', 'metric_id,title,publisher,year,source_url,interpretation_note', 'metric_id'),
    fetchAllRows<SourceSchoolRow>('source_school', 'name,school_type,city,state', 'name')
  ])

  if (!metrics.length) {
    throw new Error('No live metrics found in Supabase. Run ScholarHarvester before launching ScholarStack.')
  }

  const citationsByMetric = new Map<number, Citation[]>()
  citations.forEach((citation) => {
    const metricCitations = citationsByMetric.get(citation.metric_id) ?? []
    metricCitations.push({
      title: citation.title,
      publisher: citation.publisher,
      year: citation.year,
      source_url: citation.source_url,
      interpretation_note: citation.interpretation_note
    })
    citationsByMetric.set(citation.metric_id, metricCitations)
  })

  const mappedSourceSchools = sourceSchools.map((school) => ({
    name: school.name,
    school_type: school.school_type,
    city: school.city,
    state: school.state
  }))

  const derivedSourceSchools = metrics
    .filter((metric) => metric.source_school && metric.school_type)
    .map((metric) => ({
      name: metric.source_school as string,
      school_type: metric.school_type as string,
      city: null,
      state: null
    }))

  const uniqueSourceSchools = new Map<string, SourceSchool>()
  ;[...mappedSourceSchools, ...derivedSourceSchools].forEach((school) => {
    const key = `${school.name}::${school.school_type}`
    if (!uniqueSourceSchools.has(key)) {
      uniqueSourceSchools.set(key, school)
    }
  })

  return {
    datasets: datasets.map((dataset) => ({
      id: dataset.id,
      title: dataset.title,
      year: dataset.year,
      term: dataset.term ?? 'Fall',
      cohort: dataset.cohort,
      notes: dataset.notes
    })),
    metrics: metrics.map((metric) => ({
      id: metric.id,
      dataset_id: metric.dataset_id ?? undefined,
      campus: metric.campus,
      major: metric.major,
      discipline: metric.discipline,
      source_school: metric.source_school,
      school_type: metric.school_type,
      cohort: metric.cohort,
      stat_name: metric.stat_name,
      stat_value_numeric: metric.stat_value_numeric,
      stat_value_text: metric.stat_value_text,
      unit: metric.unit,
      percentile: metric.percentile,
      year: metric.year,
      term: metric.term ?? 'Fall',
      notes: metric.notes,
      citations: citationsByMetric.get(metric.id) ?? []
    })),
    sourceSchools: Array.from(uniqueSourceSchools.values())
  }
}

export async function getScholarData(): Promise<ScholarDataBundle> {
  const remoteUrl = process.env.SCHOLARSTACK_DATA_URL ?? process.env.SCHOLARPATH_DATA_URL
  if (remoteUrl) {
    const response = await fetch(remoteUrl, {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    })
    if (!response.ok) {
      throw new Error(`Unable to load configured data source (${response.status})`)
    }
    return normalizeBundle(await response.json())
  }

  return fetchLiveBundleFromSupabase()
}
