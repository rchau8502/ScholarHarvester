'use client'

import { useState } from 'react'
import type { IngestRequest, IngestResponse } from '@/lib/types'

const initialForm: IngestRequest = {
  title: 'UC Irvine transfer admissions excerpt',
  publisher: 'UC Info Center',
  source_url: 'https://www.universityofcalifornia.edu/infocenter',
  campus: 'UC Irvine',
  cohort: 'transfer',
  year: 2024,
  term: 'Fall',
  focus: 'Mathematics',
  raw_text:
    'UC Irvine transfer Mathematics applicants: 3200. Admits: 1650. Enrolled: 840. GPA 25th percentile: 3.10. GPA median: 3.52. GPA 75th percentile: 3.85.'
}

export default function IngestPage() {
  const [form, setForm] = useState<IngestRequest>(initialForm)
  const [adminToken, setAdminToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IngestResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify(form)
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error ?? `API error ${response.status}`)
      }
      setResult(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown ingest error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="glass-panel rounded-[1.75rem] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-300">ScholarStack Admin Workflow</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">AI ingest pipeline</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Paste source text from an official report, then let the model structure it into planner metrics.
          This route can also forward the extracted JSON to an external webhook, such as a Google Apps Script
          endpoint that appends rows to a Google Sheet.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 glass-panel rounded-3xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Admin API token
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-2 text-white"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
            />
          </label>
          <label className="text-sm text-slate-300">
            Title
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-2 text-white"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
          </label>
          <label className="text-sm text-slate-300">
            Publisher
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-2 text-white"
              value={form.publisher}
              onChange={(event) => setForm((current) => ({ ...current, publisher: event.target.value }))}
            />
          </label>
          <label className="text-sm text-slate-300">
            Source URL
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-2 text-white"
              value={form.source_url}
              onChange={(event) => setForm((current) => ({ ...current, source_url: event.target.value }))}
            />
          </label>
          <label className="text-sm text-slate-300">
            Campus
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-2 text-white"
              value={form.campus}
              onChange={(event) => setForm((current) => ({ ...current, campus: event.target.value }))}
            />
          </label>
          <label className="text-sm text-slate-300">
            Cohort
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-2 text-white"
              value={form.cohort}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  cohort: event.target.value as 'transfer' | 'freshman'
                }))
              }
            >
              <option value="transfer">transfer</option>
              <option value="freshman">freshman</option>
            </select>
          </label>
          <label className="text-sm text-slate-300">
            Focus
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-2 text-white"
              value={form.focus ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, focus: event.target.value }))}
            />
          </label>
          <label className="text-sm text-slate-300">
            Year
            <input
              type="number"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-2 text-white"
              value={form.year}
              onChange={(event) => setForm((current) => ({ ...current, year: Number(event.target.value) }))}
            />
          </label>
          <label className="text-sm text-slate-300">
            Term
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-2 text-white"
              value={form.term}
              onChange={(event) => setForm((current) => ({ ...current, term: event.target.value }))}
            />
          </label>
        </div>

        <label className="text-sm text-slate-300">
          Raw source text
          <textarea
            className="mt-2 min-h-64 w-full rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-3 text-white"
            value={form.raw_text}
            onChange={(event) => setForm((current) => ({ ...current, raw_text: event.target.value }))}
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-[var(--accent)] px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading ? 'Extracting…' : 'Run AI Extract'}
          </button>
          <p className="text-sm text-slate-400">
            Requires `OPENAI_API_KEY` and a valid `SCHOLARSTACK_ADMIN_TOKEN`.
          </p>
        </div>
      </form>

      {error && <div className="rounded-3xl border border-rose-500/50 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}

      {result && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-panel rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white">Extracted Metrics</h2>
            <p className="mt-1 text-sm text-slate-400">{result.extraction.dataset.title}</p>
            <div className="mt-4 space-y-3">
              {result.extraction.metrics.map((metric) => (
                <div key={`${metric.stat_name}-${metric.id}`} className="rounded-2xl border border-white/10 bg-[var(--panel-strong)] p-4">
                  <p className="text-sm uppercase tracking-wide text-slate-500">{metric.stat_name}</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {metric.stat_value_numeric ?? metric.stat_value_text ?? 'n/a'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Unit: {metric.unit ?? 'n/a'}</p>
                  {metric.notes && <p className="mt-2 text-sm text-slate-300">{metric.notes}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white">Status</h2>
            <p className="mt-3 text-sm text-slate-300">
              Persistence: <span className="font-semibold">{result.persistence.status}</span>
            </p>
            <p className="mt-1 text-sm text-slate-400">{result.persistence.detail}</p>
            {result.extraction.warnings.length > 0 && (
              <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
                <p className="text-sm font-semibold text-amber-100">Warnings</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-200">
                  {result.extraction.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 rounded-2xl border border-white/10 bg-[var(--panel-strong)] p-4">
              <p className="text-sm font-semibold text-slate-200">JSON Preview</p>
              <pre className="mt-3 overflow-x-auto text-xs text-slate-400">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
