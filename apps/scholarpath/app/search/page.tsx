'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { getCampuses, getMetrics } from '../../lib/api'
import { Campus, Metric } from '../../lib/types'

export default function SearchPage() {
  const { data: campuses } = useSWR<Campus[]>('campuses', () => getCampuses())
  const [query, setQuery] = useState('')
  const [selectedCampus, setSelectedCampus] = useState<string | undefined>()
  const { data: metrics } = useSWR(
    selectedCampus ? ['metrics', selectedCampus] : null,
    () => getMetrics({ campus: selectedCampus }),
  )

  const filteredCampuses = useMemo(() => {
    if (!campuses) return []
    return campuses.filter((campus) => campus.name.toLowerCase().includes(query.toLowerCase()))
  }, [campuses, query])

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-primary">Search Source Schools</h1>
      <input
        className="w-full rounded border border-slate-300 px-4 py-2"
        placeholder="Search community colleges or high schools"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {filteredCampuses.map((campus) => (
          <button
            key={campus.slug}
            className={`rounded border px-4 py-3 text-left ${selectedCampus === campus.slug ? 'border-primary' : 'border-slate-200'}`}
            onClick={() => setSelectedCampus(campus.slug)}
          >
            <div className="text-lg font-semibold text-slate-700">{campus.name}</div>
            <div className="text-xs uppercase text-slate-500">{campus.system}</div>
            <div className="mt-2 text-sm text-primary underline">Add to planner</div>
          </button>
        ))}
      </div>
      {metrics && (
        <div className="rounded border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-700">Campus medians</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {metrics
              .filter((metric: Metric) => metric.metric_key.startsWith('gpa_'))
              .map((metric: Metric) => (
                <li key={`${metric.metric_key}-${metric.metric_year}`}>
                  {metric.metric_key.toUpperCase()} {metric.metric_year}: {metric.value_float?.toFixed(2)}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
