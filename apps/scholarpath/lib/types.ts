export type Campus = {
  slug: string
  name: string
  system: string
}

export type Metric = {
  metric_key: string
  metric_year: number
  value_float: number | null
  value_text: string | null
  campus_slug: string
  citation_title: string
  citation_publisher: string
  citation_year: number
  citation_url: string
  interpretation_note: string
}

export type CampusProfile = {
  campus: Campus
  metrics: Metric[]
}

export type Citation = {
  metric_key: string
  citation_title: string
  publisher: string
  publication_year: number
  url: string
  interpretation_note: string
}
