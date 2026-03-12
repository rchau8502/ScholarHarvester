export interface Citation {
  title: string
  publisher: string
  year: number
  source_url: string
  interpretation_note?: string | null
}

export interface Metric {
  id: number
  dataset_id?: number
  campus: string
  major?: string | null
  discipline?: string | null
  source_school?: string | null
  school_type?: string | null
  cohort: string
  stat_name: string
  stat_value_numeric?: number | null
  stat_value_text?: string | null
  unit?: string | null
  percentile?: string | null
  year: number
  term: string
  notes?: string | null
  citations: Citation[]
}

export interface PageInfo {
  next_cursor: string | null
}

export interface MetricPage {
  items: Metric[]
  page_info: PageInfo
}

export interface ProfileResponse {
  campus: string
  cohort: string
  major?: string | null
  discipline?: string | null
  years: number[]
  metrics: Metric[]
}

export interface DatasetEntry {
  id: number
  title: string
  year: number
  term: string
  cohort: string
  notes?: string | null
}

export interface ProvenanceEntry {
  dataset: DatasetEntry
  campus: string
  citations: Citation[]
}

export interface SourceSchool {
  name: string
  school_type: string
  city?: string | null
  state?: string | null
}

export interface ScholarDataBundle {
  datasets: DatasetEntry[]
  metrics: Metric[]
  sourceSchools: SourceSchool[]
}

export interface IngestRequest {
  title: string
  publisher: string
  source_url: string
  campus: string
  cohort: 'transfer' | 'freshman'
  year: number
  term: string
  focus?: string | null
  raw_text: string
}

export interface IngestMetricDraft {
  stat_name: string
  stat_value_numeric?: number | null
  stat_value_text?: string | null
  unit?: string | null
  notes?: string | null
}

export interface IngestDraft {
  dataset: DatasetEntry
  metrics: Metric[]
  warnings: string[]
}

export interface PersistenceResult {
  mode: 'none' | 'webhook'
  status: 'not_configured' | 'skipped' | 'persisted' | 'failed'
  detail: string
}

export interface IngestResponse {
  extraction: IngestDraft
  persistence: PersistenceResult
}
