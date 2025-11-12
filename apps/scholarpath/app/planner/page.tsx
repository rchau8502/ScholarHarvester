'use client'

import { useEffect, useMemo, useState } from 'react'
import EvidenceDrawer from '@/components/EvidenceDrawer'
import { getMetrics } from '@/lib/api'
import type { Metric } from '@/lib/types'

const cohortOptions = [
  { label: 'Transfer', value: 'transfer' },
  { label: 'Freshman', value: 'freshman' }
]

const campuses = ['UC Irvine', 'UCLA', 'UC San Diego', 'CSU Long Beach', 'CSU Fullerton']
const transferMajors = ['Mathematics', 'Computer Science']
const freshmanDisciplines = ['Physical Sciences', 'Engineering', 'Social Sciences']
const years = [2024, 2023, 2022]

function KPI({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex-1 rounded-3xl border border-slate-800 bg-slate-900 p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-white">
        {value}
        {suffix && <span className="text-base font-medium text-slate-500">{suffix}</span>}
      </div>
    </div>
  )
}

function statValue(metrics: Metric[], name: string) {
  const match = metrics.find((metric) => metric.stat_name === name)
  if (!match) return '--'
  if (match.stat_value_numeric != null) {
    return match.stat_value_numeric.toFixed(2)
  }
  return match.stat_value_text ?? '--'
}

export default function PlannerPage() {
  const [campus, setCampus] = useState(campuses[0])
  const [cohort, setCohort] = useState(cohortOptions[0].value)
  const [focus, setFocus] = useState(transferMajors[0])
  const [selectedYears, setSelectedYears] = useState<number[]>([years[0]])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setFocus((prev) => {
      if (cohort === 'freshman') {
        return freshmanDisciplines.includes(prev) ? prev : freshmanDisciplines[0]
      }
      return transferMajors.includes(prev) ? prev : transferMajors[0]
    })
  }, [cohort])

  useEffect(() => {
    const abort = new AbortController()
    async function fetch() {
      setLoading(true)
      try {
        const params: Record<string, unknown> = {
          campus,
          cohort,
          limit: 25
        }
        if (cohort === 'transfer') {
          params.major = focus
        } else {
          params.discipline = focus
        }
        if (selectedYears.length) {
          params.years = selectedYears
        }
        const { items } = await getMetrics(params)
        if (!abort.signal.aborted) {
          setMetrics(items)
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (!abort.signal.aborted) {
          setLoading(false)
        }
      }
    }
    fetch()
    return () => abort.abort()
  }, [campus, cohort, focus, selectedYears])

  const kpis = useMemo(
    () => [
      { label: 'GPA p25', stat: 'gpa_p25', suffix: '' },
      { label: 'GPA p50', stat: 'gpa_p50', suffix: '' },
      { label: 'GPA p75', stat: 'gpa_p75', suffix: '' },
      { label: 'Admit rate', stat: 'admit_rate', suffix: '%' }
    ],
    []
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="space-y-3">
        <p className="text-lg text-slate-400">Evidence Drawer + Dashboards</p>
        <h1 className="text-3xl font-bold">ScholarPath</h1>
      </header>

      <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-900/40">
        <div className="grid gap-3 sm:grid-cols-2">
          <label htmlFor="campus-select" className="text-sm text-slate-400">
            Campus
          </label>
          <select
            value={campus}
            id="campus-select"
            onChange={(e) => setCampus(e.target.value)}
            className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
          >
            {campuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label htmlFor="cohort-select" className="text-sm text-slate-400">
            Cohort
          </label>
          <select
            value={cohort}
            id="cohort-select"
            onChange={(e) => setCohort(e.target.value)}
            className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
          >
            {cohortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label htmlFor="focus-select" className="text-sm text-slate-400">
            {cohort === 'transfer' ? 'Major' : 'Discipline'}
          </label>
          <select
            value={focus}
            id="focus-select"
            onChange={(e) => setFocus(e.target.value)}
            className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
          >
            {(cohort === 'transfer' ? transferMajors : freshmanDisciplines).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-sm text-slate-400">Year</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {years.map((yr) => {
              const active = selectedYears.includes(yr)
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setSelectedYears((prev) =>
                      prev.includes(yr) ? prev.filter((item) => item !== yr) : [...prev, yr]
                    )
                  }}
                  className={`rounded-2xl border px-3 py-1 text-sm ${
                    active ? 'border-amber-400 bg-amber-400/20 text-amber-200' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  {yr}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {kpis.map((card) => (
          <KPI key={card.stat} label={card.label} value={statValue(metrics, card.stat)} suffix={card.suffix} />
        ))}
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">Metrics</p>
            <h2 className="text-2xl font-semibold">Latest upload</h2>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-2xl bg-amber-400 px-4 py-2 font-semibold text-slate-900"
          >
            Open Evidence
          </button>
        </div>
        <div className="mt-4 text-sm text-slate-400">
          {loading && 'Loading metrics…'}
          {!loading && metrics.length === 0 && 'No metrics found for that combination yet.'}
        </div>
      </section>

      <EvidenceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        campus={campus}
        cohort={cohort}
        focus={focus}
        years={selectedYears}
      />
    </div>
  )
}
