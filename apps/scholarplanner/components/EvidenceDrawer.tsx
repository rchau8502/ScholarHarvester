'use client'

import { useEffect, useMemo, useState } from 'react'
import { getProfile, getProvenance } from '@/lib/api'
import type { ProvenanceEntry, ProfileResponse } from '@/lib/types'

interface EvidenceDrawerProps {
  open: boolean
  onClose: () => void
  campus: string
  cohort: 'transfer' | 'freshman'
  focus: string
  years: number[]
}

export default function EvidenceDrawer({ open, onClose, campus, cohort, focus, years }: EvidenceDrawerProps) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [provenance, setProvenance] = useState<ProvenanceEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError(null)

    const targetYear = years.length ? years[0] : undefined
    Promise.all([
      getProfile(cohort, { campus, ...(cohort === 'transfer' ? { major: focus } : { discipline: focus }), years }),
      getProvenance({ campus, year: targetYear })
    ])
      .then(([profileData, provenanceData]) => {
        if (!cancelled) {
          setProfile(profileData)
          setProvenance(provenanceData)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err)
          setError('Unable to load evidence right now')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [open, campus, cohort, focus, years])

  const outdatedWarning = useMemo(() => {
    if (!profile) return null
    const cutoff = new Date().getFullYear() - 3
    return profile.metrics.some((metric) => metric.year <= cutoff)
      ? 'Warning: Some evidence is older than three years.'
      : null
  }, [profile])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-slate-950 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">Evidence Drawer</h3>
            <p className="text-sm text-slate-400">{campus} · {cohort}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            Close
          </button>
        </div>
        {loading && <p className="mt-4 text-sm text-slate-400">Loading evidence…</p>}
        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        {outdatedWarning && <p className="mt-3 rounded-2xl border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{outdatedWarning}</p>}
        {profile && (
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-slate-400">Profile years</p>
              <p className="text-lg font-semibold text-white">{profile.years.join(', ') || 'n/a'}</p>
            </div>
            <div className="space-y-3">
              {profile.metrics.map((metric) => (
                <div key={metric.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
                  <p className="text-sm text-slate-500">{metric.stat_name}</p>
                  <p className="text-xl font-medium text-white">
                    {metric.stat_value_numeric ?? metric.stat_value_text ?? '—'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                    <span>{metric.year} · {metric.term}</span>
                    <span>Unit: {metric.unit ?? 'n/a'}</span>
                  </div>
                  <div className="mt-3 text-xs text-slate-400">
                    {metric.citations.map((cite) => (
                      <p key={cite.source_url}>
                        <a href={cite.source_url} target="_blank" rel="noreferrer" className="text-amber-300 underline">
                          {cite.title}
                        </a>{' '}
                        · {cite.publisher}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {provenance.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">Provenance</h4>
            {provenance.map((entry) => (
              <div key={entry.dataset.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-3 text-sm text-slate-400">
                <p className="font-semibold text-white">{entry.dataset.title}</p>
                <p>Year {entry.dataset.year} · {entry.dataset.term}</p>
                {entry.citations.map((cite) => (
                  <p key={cite.source_url} className="mt-1 text-xs text-slate-400">
                    {cite.title} (<a className="text-amber-300 underline" href={cite.source_url} target="_blank" rel="noreferrer">
                      source
                    </a>)
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
