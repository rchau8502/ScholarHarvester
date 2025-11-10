'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCampuses, getCampusProfile, getProvenance } from '../lib/api'
import type { Campus, Metric, Citation } from '../lib/types'
import { useAsyncData } from '../lib/useAsyncData'
import { EvidenceDrawer } from './EvidenceDrawer'

const GPA_KEYS = ['gpa_p25', 'gpa_p50', 'gpa_p75']

export function PlannerView() {
  const { data: campuses } = useAsyncData<Campus[]>('campuses', () => getCampuses())
  const [selectedCampus, setSelectedCampus] = useState<string | undefined>()
  const [selectedYear, setSelectedYear] = useState<number | undefined>()
  const { data: profile } = useAsyncData(
    selectedCampus ? `profile:${selectedCampus}` : null,
    () => getCampusProfile(selectedCampus as string),
    [selectedCampus],
  )
  const { data: provenance } = useAsyncData<Citation[]>('provenance', () => getProvenance())
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!selectedCampus && campuses && campuses.length > 0) {
      setSelectedCampus(campuses[0].slug)
    }
  }, [campuses, selectedCampus])

  const metrics = profile?.metrics ?? []
  const years = useMemo(() => Array.from(new Set(metrics.map((m: Metric) => m.metric_year))).sort((a, b) => b - a), [metrics])

  useEffect(() => {
    if (!selectedYear && years.length > 0) {
      setSelectedYear(years[0])
    }
  }, [years, selectedYear])

  const filteredMetrics = metrics.filter((m: Metric) => !selectedYear || m.metric_year === selectedYear)
  const gpaMetrics = GPA_KEYS.map((key) => filteredMetrics.find((m) => m.metric_key === key))
  const admitRate = filteredMetrics.find((m) => m.metric_key === 'admit_rate')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-sm font-medium">Campus</label>
          <select
            className="rounded border border-slate-300 px-3 py-2"
            value={selectedCampus}
            onChange={(event) => setSelectedCampus(event.target.value)}
          >
            {campuses?.map((campus) => (
              <option key={campus.slug} value={campus.slug}>
                {campus.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">Year</span>
          <div className="flex gap-2">
            {years.map((year) => (
              <button
                key={year}
                className={`rounded-full border px-3 py-1 text-sm ${
                  selectedYear === year ? 'bg-primary text-white' : 'border-slate-300 text-slate-600'
                }`}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        <button className="ml-auto rounded bg-accent px-4 py-2 text-white" onClick={() => setDrawerOpen(true)}>
          Open Evidence
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard title="Admit Rate" value={admitRate?.value_float ? `${Math.round(admitRate.value_float * 100)}%` : 'N/A'} />
        {gpaMetrics.map((metric, index) => (
          <KpiCard key={GPA_KEYS[index]} title={GPA_KEYS[index].toUpperCase()} value={metric?.value_float?.toFixed(2) ?? 'N/A'} />
        ))}
      </div>

      <EvidenceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        metrics={filteredMetrics}
        provenance={provenance ?? []}
      />
    </div>
  )
}

function KpiCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-semibold text-primary">{value}</p>
    </div>
  )
}
