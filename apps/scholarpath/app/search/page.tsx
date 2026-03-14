'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { searchSourceSchools } from '@/lib/api'
import type { SourceSchool } from '@/lib/types'

const schoolTypes = ['HighSchool', 'CommunityCollege']

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState(schoolTypes[0])
  const [results, setResults] = useState<SourceSchool[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadDefaults() {
      setLoading(true)
      try {
        const data = await searchSourceSchools('', type)
        if (!cancelled) {
          setResults(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    loadDefaults()
    return () => {
      cancelled = true
    }
  }, [type])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchSourceSchools(query, type)
      setResults(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="glass-panel rounded-[1.75rem] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">ScholarStack Search</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Source school explorer</h1>
        <p className="mt-2 text-sm text-slate-300">Find high schools and community colleges, then load the planner with one click.</p>
      </header>

      <form onSubmit={handleSubmit} className="glass-panel flex flex-wrap gap-3 rounded-3xl p-4">
        <input
          type="text"
          placeholder="Search a school"
          className="flex-1 rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-2 text-white"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-2 text-slate-100"
        >
          {schoolTypes.map((option) => (
            <option key={option} value={option}>
              {option.replace(/([A-Z])/g, ' $1').trim()}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-2xl bg-[var(--accent)] px-4 py-2 font-semibold text-slate-950">
          Search
        </button>
      </form>

      {loading && <p className="text-sm text-slate-400">Searching…</p>}
      {!loading && !results.length && (
        <p className="text-sm text-slate-400">
          {searched ? 'No schools matched that search.' : 'No schools available for that filter.'}
        </p>
      )}

      <div className="space-y-4">
        {results.map((school) => (
          <div key={school.name} className="glass-panel rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-white">{school.name}</p>
                <p className="text-sm text-slate-400">{school.city}, {school.state}</p>
              </div>
              <Link
                href={`/planner?cohort=${school.school_type === 'HighSchool' ? 'freshman' : 'transfer'}&sourceSchool=${encodeURIComponent(
                  school.name
                )}&schoolType=${school.school_type}`}
                className="rounded-2xl bg-[var(--accent)] px-3 py-1 text-sm font-semibold text-slate-950"
              >
                Add to planner
              </Link>
            </div>
            <p className="mt-2 text-xs text-slate-500">Type: {school.school_type}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
