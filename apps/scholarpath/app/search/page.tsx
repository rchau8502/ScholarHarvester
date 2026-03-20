'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { searchSourceSchools } from '@/lib/api'
import type { SourceSchool, SourceSchoolFacet } from '@/lib/types'

const schoolTypes = ['HighSchool', 'CommunityCollege']
const shortlistStorageKey = 'scholarstack-source-school-shortlist'

function schoolKey(school: Pick<SourceSchool, 'name' | 'school_type'>) {
  return `${school.name}::${school.school_type}`
}

function cohortLabel(cohort: string) {
  return cohort === 'freshman' ? 'Freshman' : 'Transfer'
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState(schoolTypes[0])
  const [stateFilter, setStateFilter] = useState('')
  const [results, setResults] = useState<SourceSchool[]>([])
  const [availableStates, setAvailableStates] = useState<SourceSchoolFacet[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [shortlist, setShortlist] = useState<SourceSchool[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(shortlistStorageKey)
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setShortlist(parsed as SourceSchool[])
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(shortlistStorageKey, JSON.stringify(shortlist))
  }, [shortlist])

  useEffect(() => {
    let cancelled = false
    async function loadDefaults() {
      setLoading(true)
      try {
        const data = await searchSourceSchools('', type, stateFilter || undefined)
        if (!cancelled) {
          setResults(data.items)
          setAvailableStates(data.states)
          setTotalCount(data.total)
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
  }, [type, stateFilter])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchSourceSchools(query, type, stateFilter || undefined)
      setResults(data.items)
      setAvailableStates(data.states)
      setTotalCount(data.total)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleShortlist = (school: SourceSchool) => {
    setShortlist((current) => {
      const key = schoolKey(school)
      if (current.some((entry) => schoolKey(entry) === key)) {
        return current.filter((entry) => schoolKey(entry) !== key)
      }
      return [...current, school].slice(0, 6)
    })
  }

  const activeFilterLabel = type === 'HighSchool' ? 'Freshman feeder schools' : 'Transfer feeder colleges'

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="glass-panel rounded-[1.75rem] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">ScholarStack Search</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Source school explorer</h1>
        <p className="mt-2 text-sm text-slate-300">
          Find feeder schools, review their campus coverage, save a shortlist, then load the planner with one click.
        </p>
      </header>

      <section className="glass-panel rounded-3xl p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Current search view</p>
            <p className="mt-2 text-lg font-semibold text-white">{activeFilterLabel}</p>
            <p className="mt-1 text-sm text-slate-300">
              {loading ? 'Refreshing results…' : `${results.length} of ${totalCount} schools shown`}{' '}
              {query ? `for “${query}”` : 'for all schools in this filter'}
              {stateFilter ? ` in ${stateFilter}` : ''}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Sorted by campus coverage</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Shortlist up to 6 schools</span>
          </div>
        </div>
      </section>

      {!!shortlist.length && (
        <section className="glass-panel rounded-3xl p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Saved shortlist</p>
              <p className="mt-1 text-sm text-slate-300">Keep a few candidate feeder schools in view while you evaluate planner fit.</p>
            </div>
            <p className="text-xs text-slate-500">{shortlist.length}/6 saved</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {shortlist.map((school) => (
              <div key={schoolKey(school)} className="rounded-2xl border border-white/10 bg-[var(--panel-strong)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{school.name}</p>
                    <p className="text-sm text-slate-400">
                      {school.city}, {school.state}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleShortlist(school)}
                    className="rounded-xl border border-white/10 px-3 py-1 text-xs text-slate-300 hover:text-white"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    {school.campus_count ?? 0} campuses
                  </span>
                  {school.cohorts?.map((cohort) => (
                    <span key={cohort} className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      {cohortLabel(cohort)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
        <select
          value={stateFilter}
          onChange={(event) => setStateFilter(event.target.value)}
          className="rounded-2xl border border-white/10 bg-[var(--panel-strong)] px-4 py-2 text-slate-100"
        >
          <option value="">All states</option>
          {availableStates.map((option) => (
            <option key={option.value} value={option.value}>
              {option.value} ({option.count})
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
          <div key={schoolKey(school)} className="glass-panel rounded-3xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">{school.name}</p>
                <p className="text-sm text-slate-400">
                  {school.city}, {school.state}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    {school.school_type === 'HighSchool' ? 'High school' : 'Community college'}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    {school.campus_count ?? 0} campus matches
                  </span>
                  {!!school.latest_year && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      Latest data {school.latest_year}
                    </span>
                  )}
                  {school.cohorts?.map((cohort) => (
                    <span key={cohort} className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      {cohortLabel(cohort)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleShortlist(school)}
                  className="rounded-2xl border border-white/10 px-3 py-1 text-sm text-slate-200 hover:text-white"
                >
                  {shortlist.some((entry) => schoolKey(entry) === schoolKey(school)) ? 'Saved' : 'Save shortlist'}
                </button>
                <Link
                  href={`/planner?cohort=${school.school_type === 'HighSchool' ? 'freshman' : 'transfer'}&sourceSchool=${encodeURIComponent(
                    school.name
                  )}&schoolType=${school.school_type}`}
                  className="rounded-2xl bg-[var(--accent)] px-3 py-1 text-sm font-semibold text-slate-950"
                >
                  Add to planner
                </Link>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {school.metric_count ?? 0} supporting metric rows available for this feeder school across the current ScholarStack dataset.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
