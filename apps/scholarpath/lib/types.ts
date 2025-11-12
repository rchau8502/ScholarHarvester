export interface Citation {
  title: string
  publisher: string
  year: number
  source_url: string
  interpretation_note?: string | null
}

export interface Metric {
  id: number
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
