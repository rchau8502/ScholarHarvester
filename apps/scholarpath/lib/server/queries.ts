import type { Citation, DatasetEntry, Metric, ProvenanceEntry, ScholarDataBundle, SourceSchool } from '@/lib/types'

function sortMetrics(metrics: Metric[]) {
  return [...metrics].sort((left, right) => left.id - right.id)
}

function normalizeMetric(metric: Metric): Metric {
  return {
    ...metric,
    dataset_id: metric.dataset_id ?? undefined,
    stat_value_numeric: metric.stat_value_numeric == null ? null : Number(metric.stat_value_numeric),
    citations: metric.citations ?? []
  }
}

function filterYears(metrics: Metric[], years: number[]) {
  if (!years.length) return metrics
  const yearSet = new Set(years)
  return metrics.filter((metric) => yearSet.has(metric.year))
}

export function queryMetrics(
  data: ScholarDataBundle,
  params: {
    campus?: string | null
    major?: string | null
    discipline?: string | null
    cohort?: string | null
    stat_name?: string | null
    source_school?: string | null
    school_type?: string | null
    year?: number | null
    year_min?: number | null
    year_max?: number | null
    years?: number[]
    cursor?: number | null
    limit: number
  }
) {
  let metrics = sortMetrics(data.metrics)

  metrics = metrics.filter((metric) => {
    if (params.campus && metric.campus !== params.campus) return false
    if (params.major && metric.major !== params.major) return false
    if (params.discipline && metric.discipline !== params.discipline) return false
    if (params.cohort && metric.cohort !== params.cohort) return false
    if (params.stat_name && metric.stat_name !== params.stat_name) return false
    if (params.source_school && metric.source_school !== params.source_school) return false
    if (params.school_type && metric.school_type !== params.school_type) return false
    if (params.year != null && metric.year !== params.year) return false
    if (params.year_min != null && metric.year < params.year_min) return false
    if (params.year_max != null && metric.year > params.year_max) return false
    if (params.cursor != null && metric.id <= params.cursor) return false
    return true
  })

  metrics = filterYears(metrics, params.years ?? [])

  const rows = metrics.slice(0, params.limit + 1).map(normalizeMetric)
  const nextCursor = rows.length > params.limit ? String(rows[params.limit].id) : null

  return {
    items: rows.slice(0, params.limit),
    page_info: { next_cursor: nextCursor }
  }
}

export function queryProfile(
  data: ScholarDataBundle,
  params: {
    campus: string
    cohort: 'transfer' | 'freshman'
    major?: string | null
    discipline?: string | null
    source_school?: string | null
    school_type?: string | null
    years?: number[]
  }
) {
  let metrics = data.metrics.filter((metric) => metric.campus === params.campus && metric.cohort === params.cohort)

  if (params.cohort === 'transfer') {
    metrics = metrics.filter((metric) => metric.major === params.major)
  } else {
    metrics = metrics.filter((metric) => metric.discipline === params.discipline)
  }

  if (params.source_school) {
    metrics = metrics.filter((metric) => metric.source_school === params.source_school)
  }

  if (params.school_type) {
    metrics = metrics.filter((metric) => metric.school_type === params.school_type)
  }

  metrics = filterYears(metrics, params.years ?? []).map(normalizeMetric)
  const yearList = Array.from(new Set(metrics.map((metric) => metric.year))).sort((left, right) => left - right)

  return {
    campus: params.campus,
    cohort: params.cohort,
    major: params.cohort === 'transfer' ? params.major ?? null : null,
    discipline: params.cohort === 'freshman' ? params.discipline ?? null : null,
    years: yearList,
    metrics
  }
}

function dedupeCitations(citations: Citation[]) {
  const seen = new Set<string>()
  const unique: Citation[] = []
  citations.forEach((citation) => {
    const key = `${citation.source_url}::${citation.title}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(citation)
    }
  })
  return unique
}

export function queryProvenance(
  data: ScholarDataBundle,
  params: {
    campus?: string | null
    year?: number | null
    source_school?: string | null
  }
): ProvenanceEntry[] {
  const datasetMap = new Map<number, DatasetEntry>(data.datasets.map((dataset) => [dataset.id, dataset]))
  const grouped = new Map<number, { dataset: DatasetEntry; campus: string; citations: Citation[] }>()

  data.metrics.forEach((metric) => {
    if (params.campus && metric.campus !== params.campus) return
    if (params.year != null && metric.year !== params.year) return
    if (params.source_school && metric.source_school !== params.source_school) return
    if (metric.dataset_id == null) return

    const dataset = datasetMap.get(metric.dataset_id)
    if (!dataset) return

    if (!grouped.has(dataset.id)) {
      grouped.set(dataset.id, {
        dataset,
        campus: metric.campus,
        citations: []
      })
    }

    const entry = grouped.get(dataset.id)
    metric.citations.forEach((citation) => entry?.citations.push(citation))
  })

  return Array.from(grouped.values())
    .map((entry) => ({
      ...entry,
      citations: dedupeCitations(entry.citations)
    }))
    .sort((left, right) => right.dataset.year - left.dataset.year)
    .slice(0, 25)
}

export function querySourceSchools(
  data: ScholarDataBundle,
  params: { search?: string | null; type?: string | null }
): SourceSchool[] {
  const search = params.search?.trim().toLowerCase()

  return data.sourceSchools
    .filter((school) => {
      if (params.type && school.school_type !== params.type) return false
      if (search && !school.name.toLowerCase().includes(search)) return false
      return true
    })
    .slice(0, 25)
}
