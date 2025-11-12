'use client'

import React, { useState } from 'react'
import { searchSourceSchools } from '@/lib/api'
import type { SourceSchool } from '@/lib/types'

const schoolTypes = ['HighSchool', 'CommunityCollege']

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState(schoolTypes[0])
  const [results, setResults] = useState<SourceSchool[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Source School Search</h1>
        <p className="text-sm text-slate-400">Find HS/CCC partners and pull campus medians.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search a school"
          className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-white"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
        >
          {schoolTypes.map((option) => (
            <option key={option} value={option}>
              {option.replace(/([A-Z])/g, ' $1').trim()}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-2xl bg-amber-400 px-4 py-2 font-semibold text-slate-900">
          Search
        </button>
      </form>

      {loading && <p className="text-sm text-slate-400">Searching…</p>}
      {!loading && !results.length && <p className="text-sm text-slate-400">Use the search bar to look up a secondary school.</p>}

      <div className="space-y-4">
        {results.map((school) => (
          <div key={school.name} className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-white">{school.name}</p>
                <p className="text-sm text-slate-400">{school.city}, {school.state}</p>
              </div>
              <button className="rounded-2xl bg-amber-400 px-3 py-1 text-sm font-semibold text-slate-900">
                Add to planner
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Type: {school.school_type}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
