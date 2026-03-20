'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { searchInstitutions } from '@/lib/api'
import type { Institution } from '@/lib/types'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY',
  'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH',
  'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'
]

const CONTROL_OPTIONS = ['Public', 'Private nonprofit', 'Private for-profit']

function formatInteger(value?: number | null) {
  return value == null ? 'N/A' : new Intl.NumberFormat('en-US').format(value)
}

function formatPercent(value?: number | null) {
  return value == null ? 'N/A' : `${Math.round(value * 100)}%`
}

function formatCurrency(value?: number | null) {
  return value == null ? 'N/A' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export default function CollegesPage() {
  const [query, setQuery] = useState('')
  const [state, setState] = useState('')
  const [control, setControl] = useState('')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState<Institution[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const payload = await searchInstitutions({
          search: query || undefined,
          state: state || undefined,
          control: control || undefined,
          page,
          per_page: 24
        })
        if (!cancelled) {
          setResults(payload.items)
          setTotal(payload.total)
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setResults([])
          setTotal(0)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [control, page, query, state])

  const totalPages = Math.max(1, Math.ceil(total / 24))

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="glass-panel rounded-[1.75rem] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">National Directory</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">College explorer</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Browse a national institution layer backed by official College Scorecard fields. This sits alongside
          ScholarStack&apos;s California admissions metrics instead of replacing them.
        </p>
      </header>

      <section className="glass-panel rounded-3xl p-4 md:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[220px] flex-1 flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Search</span>
            <input
              value={query}
              onChange={(event) => {
                setPage(1)
                setQuery(event.target.value)
              }}
              placeholder="Search college name"
              className="rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-3 text-white"
            />
          </label>
          <label className="flex min-w-[160px] flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">State</span>
            <select
              value={state}
              onChange={(event) => {
                setPage(1)
                setState(event.target.value)
              }}
              className="rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-3 text-slate-100"
            >
              <option value="">All states</option>
              {US_STATES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[220px] flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Control</span>
            <select
              value={control}
              onChange={(event) => {
                setPage(1)
                setControl(event.target.value)
              }}
              className="rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-3 text-slate-100"
            >
              <option value="">All institution types</option>
              {CONTROL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            {loading ? 'Loading…' : `${total} colleges matched`}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Source: College Scorecard</span>
        </div>
      </section>

      {!loading && !results.length && (
        <section className="glass-panel rounded-3xl p-6 text-sm text-slate-300">
          No colleges are available yet for this filter. Run the Scorecard sync first if the directory has not been populated.
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.map((institution) => (
          <article key={institution.external_id} className="glass-panel rounded-3xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{institution.name}</p>
                <p className="text-sm text-slate-400">
                  {institution.city}, {institution.state}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
                {institution.control ?? 'Unknown'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-[var(--panel-strong)] p-3">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Students</div>
                <div className="mt-2 text-base font-semibold text-white">{formatInteger(institution.student_size)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[var(--panel-strong)] p-3">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Admit rate</div>
                <div className="mt-2 text-base font-semibold text-white">{formatPercent(institution.admission_rate)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[var(--panel-strong)] p-3">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Net price</div>
                <div className="mt-2 text-base font-semibold text-white">{formatCurrency(institution.avg_net_price)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[var(--panel-strong)] p-3">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Completion</div>
                <div className="mt-2 text-base font-semibold text-white">{formatPercent(institution.completion_rate)}</div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {institution.highest_degree ?? 'Degree profile unavailable'}{institution.locale ? ` • ${institution.locale}` : ''}
              {institution.carnegie_basic ? ` • ${institution.carnegie_basic}` : ''}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/colleges/${encodeURIComponent(institution.external_id)}`}
                className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-slate-950"
              >
                View profile
              </Link>
              {institution.website && (
                <a
                  href={institution.website}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:text-white"
                >
                  Official site
                </a>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1 || loading}
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 disabled:opacity-50"
        >
          Previous
        </button>
        <p className="text-sm text-slate-400">
          Page {page} of {totalPages}
        </p>
        <button
          type="button"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={page >= totalPages || loading}
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
