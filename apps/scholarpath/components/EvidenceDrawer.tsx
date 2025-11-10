'use client'

import { useMemo } from 'react'
import { Metric, Citation } from '../lib/types'

export function EvidenceDrawer({
  open,
  onClose,
  metrics,
  provenance,
}: {
  open: boolean
  onClose: () => void
  metrics: Metric[]
  provenance: Citation[]
}) {
  const oldestYear = useMemo(() => {
    if (metrics.length === 0) return null
    return metrics.reduce((acc, metric) => Math.min(acc, metric.metric_year), metrics[0].metric_year)
  }, [metrics])

  const isStale = oldestYear !== null && oldestYear < new Date().getFullYear() - 3

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-xl transform bg-white p-6 shadow-xl transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">Evidence Drawer</h2>
          <button onClick={onClose} className="rounded border border-slate-300 px-3 py-1 text-sm">
            Close
          </button>
        </div>
        {isStale && (
          <div className="mt-4 rounded bg-yellow-100 p-3 text-sm text-yellow-900">
            Some evidence is older than three years. Verify with the campus before relying on it.
          </div>
        )}
        <div className="mt-4 space-y-3 overflow-y-auto text-sm">
          {metrics.map((metric) => (
            <div key={`${metric.metric_key}-${metric.metric_year}`} className="rounded border border-slate-200 p-3">
              <div className="font-semibold text-slate-700">
                {metric.metric_key} · {metric.metric_year}
              </div>
              <div className="text-slate-600">
                Value: {metric.value_float ?? metric.value_text ?? 'N/A'}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Source: <a className="text-primary underline" href={metric.citation_url} target="_blank" rel="noreferrer">{metric.citation_title}</a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-500">Citations</h3>
          <ul className="mt-2 space-y-2 text-xs text-slate-500">
            {provenance.map((citation) => (
              <li key={`${citation.metric_key}-${citation.publication_year}`}>
                <span className="font-semibold text-slate-600">{citation.metric_key}</span> — {citation.citation_title} ({citation.publication_year}) ·{' '}
                <a className="text-primary underline" href={citation.url} target="_blank" rel="noreferrer">
                  {citation.publisher}
                </a>{' '}
                – {citation.interpretation_note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
