'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import EvidenceDrawer from '@/components/EvidenceDrawer'
import { getAdvisor, getMetrics } from '@/lib/api'
import type { AdvisorResponse, Metric } from '@/lib/types'
import {
  COMMUNITY_COLLEGES,
  FRESHMAN_DISCIPLINES,
  HIGH_SCHOOLS,
  TARGET_CAMPUSES,
  TRANSFER_MAJORS
} from '@/lib/catalog'

const cohortOptions = [
  { label: 'Transfer', value: 'transfer' },
  { label: 'Freshman', value: 'freshman' }
] as const

const campuses: string[] = TARGET_CAMPUSES.map((campus) => campus.name)
const campusGroups = Object.entries(
  TARGET_CAMPUSES.reduce<Record<string, string[]>>((groups, campus) => {
    if (!groups[campus.segment]) {
      groups[campus.segment] = []
    }
    groups[campus.segment].push(campus.name)
    return groups
  }, {})
)
const transferMajors: string[] = [...TRANSFER_MAJORS]
const freshmanDisciplines: string[] = [...FRESHMAN_DISCIPLINES]
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

function AdviceList({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <ul className="mt-2 space-y-2 text-sm text-slate-300">
      {items.map((item) => (
        <li key={item} className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2">
          {item}
        </li>
      ))}
    </ul>
  )
}

const extracurricularOptions = [
  { label: 'Developing', value: 'developing' },
  { label: 'Solid', value: 'solid' },
  { label: 'Strong', value: 'strong' },
  { label: 'Exceptional', value: 'exceptional' }
] as const

const progressOptions = [
  { label: 'Early', value: 'early' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Mostly Complete', value: 'mostly_complete' },
  { label: 'Complete', value: 'complete' }
] as const

const freshmanRigorExamples = [
  'AP Calculus AB/BC',
  'AP Computer Science A',
  'AP Biology or AP Chemistry',
  'AP Statistics',
  'dual-enrollment core courses'
]

const transferPrepExamples = [
  'major prerequisites',
  'general education pattern',
  'course articulation checks',
  'writing and math sequence',
  'application essays and PIQs'
]

function PlannerPageContent() {
  const searchParams = useSearchParams()
  const [campus, setCampus] = useState(campuses[0])
  const initialCohort =
    searchParams.get('cohort') === 'freshman' || searchParams.get('cohort') === 'transfer'
      ? (searchParams.get('cohort') as 'transfer' | 'freshman')
      : 'transfer'
  const [cohort, setCohort] = useState<'transfer' | 'freshman'>(initialCohort)
  const [focus, setFocus] = useState<string>(transferMajors[0])
  const [selectedYears, setSelectedYears] = useState<number[]>([years[0]])
  const [sourceSchool, setSourceSchool] = useState(searchParams.get('sourceSchool') ?? '')
  const [schoolType, setSchoolType] = useState(searchParams.get('schoolType') ?? '')
  const [currentGpa, setCurrentGpa] = useState('3.7')
  const [targetGpa, setTargetGpa] = useState('')
  const [apCount, setApCount] = useState('6')
  const [extracurricularStrength, setExtracurricularStrength] =
    useState<'developing' | 'solid' | 'strong' | 'exceptional'>('solid')
  const [transferRequirementProgress, setTransferRequirementProgress] =
    useState<'early' | 'in_progress' | 'mostly_complete' | 'complete'>('in_progress')
  const [majorPreparationProgress, setMajorPreparationProgress] =
    useState<'early' | 'in_progress' | 'mostly_complete' | 'complete'>('in_progress')
  const [plannedCourses, setPlannedCourses] = useState('')
  const [targetActivities, setTargetActivities] = useState('')
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [advisor, setAdvisor] = useState<AdvisorResponse | null>(null)
  const [advisorLoading, setAdvisorLoading] = useState(false)
  const [advisorError, setAdvisorError] = useState<string | null>(null)

  useEffect(() => {
    const campusParam = searchParams.get('campus')
    const sourceSchoolParam = searchParams.get('sourceSchool')
    const schoolTypeParam = searchParams.get('schoolType')
    const focusParam = searchParams.get('focus')

    if (campusParam && campuses.includes(campusParam)) {
      setCampus(campusParam)
    }
    if (sourceSchoolParam) {
      setSourceSchool(sourceSchoolParam)
    }
    if (schoolTypeParam) {
      setSchoolType(schoolTypeParam)
    }
    if (focusParam) {
      setFocus(focusParam)
    }
  }, [searchParams])

  useEffect(() => {
    setFocus((prev) => {
      if (cohort === 'freshman') {
        return freshmanDisciplines.includes(prev) ? prev : freshmanDisciplines[0]
      }
      return transferMajors.includes(prev) ? prev : transferMajors[0]
    })
  }, [cohort])

  useEffect(() => {
    if (!sourceSchool) {
      return
    }

    const validSchools = cohort === 'transfer' ? [...COMMUNITY_COLLEGES] : [...HIGH_SCHOOLS]
    if (!validSchools.some((school) => school === sourceSchool)) {
      setSourceSchool('')
      setSchoolType('')
    }
  }, [cohort, sourceSchool])

  useEffect(() => {
    const abort = new AbortController()
    async function fetch() {
      setLoading(true)
      setAdvisor(null)
      setAdvisorError(null)
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
        if (sourceSchool) {
          params.source_school = sourceSchool
        }
        if (schoolType) {
          params.school_type = schoolType
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
  }, [campus, cohort, focus, selectedYears, sourceSchool, schoolType])

  const kpis = useMemo(
    () => [
      { label: 'GPA p25', stat: 'gpa_p25', suffix: '' },
      { label: 'GPA p50', stat: 'gpa_p50', suffix: '' },
      { label: 'GPA p75', stat: 'gpa_p75', suffix: '' },
      { label: 'Admit rate', stat: 'admit_rate', suffix: '%' }
    ],
    []
  )

  async function handleAdvisor() {
    setAdvisorLoading(true)
    setAdvisorError(null)
    try {
      const advice = await getAdvisor({
        campus,
        cohort,
        focus,
        sourceSchool: sourceSchool || null,
        schoolType: schoolType || null,
        years: selectedYears,
        metrics,
        currentGpa: currentGpa ? Number(currentGpa) : null,
        targetGpa: targetGpa ? Number(targetGpa) : null,
        apCount: apCount ? Number(apCount) : null,
        extracurricularStrength,
        transferRequirementProgress,
        majorPreparationProgress,
        plannedCourses: plannedCourses
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        targetActivities: targetActivities
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      })
      setAdvisor(advice)
    } catch (error) {
      console.error(error)
      setAdvisorError(error instanceof Error ? error.message : 'Unable to load AI guidance right now')
    } finally {
      setAdvisorLoading(false)
    }
  }

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
            {campusGroups.map(([segment, items]) => (
              <optgroup key={segment} label={segment}>
                {items.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </optgroup>
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
            onChange={(e) => setCohort(e.target.value as 'transfer' | 'freshman')}
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
        <div className="grid gap-3 sm:grid-cols-2">
          <label htmlFor="source-school-select" className="text-sm text-slate-400">
            Source school
          </label>
          <select
            value={sourceSchool}
            id="source-school-select"
            onChange={(e) => {
              const nextSchool = e.target.value
              setSourceSchool(nextSchool)
              setSchoolType(
                HIGH_SCHOOLS.includes(nextSchool as (typeof HIGH_SCHOOLS)[number])
                  ? 'HighSchool'
                  : COMMUNITY_COLLEGES.includes(nextSchool as (typeof COMMUNITY_COLLEGES)[number])
                    ? 'CommunityCollege'
                    : ''
              )
              if (nextSchool && HIGH_SCHOOLS.includes(nextSchool as (typeof HIGH_SCHOOLS)[number])) {
                setCohort('freshman')
              }
              if (nextSchool && COMMUNITY_COLLEGES.includes(nextSchool as (typeof COMMUNITY_COLLEGES)[number])) {
                setCohort('transfer')
              }
            }}
            className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
          >
            <option value="">All schools</option>
            {(cohort === 'transfer' ? COMMUNITY_COLLEGES : HIGH_SCHOOLS).map((item) => (
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
        <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-200">Student profile</p>
            <p className="mt-1 text-sm text-slate-400">
              {cohort === 'transfer'
                ? 'Include GPA, prerequisite progress, and coursework so the AI can judge transfer readiness instead of only citing admit-rate metrics.'
                : 'Include GPA, AP or advanced rigor, and activities so the AI can compare your freshman profile against stronger applicants.'}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-3">
              <label htmlFor="current-gpa" className="text-sm text-slate-400">
                Current GPA
              </label>
              <input
                id="current-gpa"
                value={currentGpa}
                onChange={(e) => setCurrentGpa(e.target.value)}
                placeholder={cohort === 'transfer' ? '3.65' : '3.92 unweighted'}
                className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
              />
            </div>
            <div className="grid gap-3">
              <label htmlFor="target-gpa" className="text-sm text-slate-400">
                Goal GPA
              </label>
              <input
                id="target-gpa"
                value={targetGpa}
                onChange={(e) => setTargetGpa(e.target.value)}
                placeholder={cohort === 'transfer' ? '3.8' : '4.2 weighted'}
                className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
              />
            </div>
            <div className="grid gap-3">
              <label htmlFor="ap-count" className="text-sm text-slate-400">
                {cohort === 'freshman' ? 'AP / advanced courses completed or planned' : 'AP / advanced courses (optional)'}
              </label>
              <input
                id="ap-count"
                value={apCount}
                onChange={(e) => setApCount(e.target.value)}
                placeholder={cohort === 'freshman' ? '6' : 'leave blank if not relevant'}
                className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
              />
            </div>
            <div className="grid gap-3">
              <label htmlFor="extra-strength" className="text-sm text-slate-400">
                Extracurricular profile
              </label>
              <select
                id="extra-strength"
                value={extracurricularStrength}
                onChange={(e) =>
                  setExtracurricularStrength(e.target.value as 'developing' | 'solid' | 'strong' | 'exceptional')
                }
                className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
              >
                {extracurricularOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {cohort === 'transfer' && (
              <>
                <div className="grid gap-3">
                  <label htmlFor="transfer-progress" className="text-sm text-slate-400">
                    Transfer requirement progress
                  </label>
                  <select
                    id="transfer-progress"
                    value={transferRequirementProgress}
                    onChange={(e) =>
                      setTransferRequirementProgress(
                        e.target.value as 'early' | 'in_progress' | 'mostly_complete' | 'complete'
                      )
                    }
                    className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
                  >
                    {progressOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3">
                  <label htmlFor="major-progress" className="text-sm text-slate-400">
                    Major prerequisite progress
                  </label>
                  <select
                    id="major-progress"
                    value={majorPreparationProgress}
                    onChange={(e) =>
                      setMajorPreparationProgress(
                        e.target.value as 'early' | 'in_progress' | 'mostly_complete' | 'complete'
                      )
                    }
                    className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
                  >
                    {progressOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="grid gap-3">
            <label htmlFor="planned-courses" className="text-sm text-slate-400">
              Planned or current courses
            </label>
            <input
              id="planned-courses"
              value={plannedCourses}
              onChange={(e) => setPlannedCourses(e.target.value)}
              placeholder={
                cohort === 'transfer'
                  ? 'Calculus II, Linear Algebra, Java, Physics, Organic Chemistry...'
                  : 'AP Calculus BC, AP Physics C, AP Statistics, dual-enrollment English...'
              }
              className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
            />
            <p className="text-xs text-slate-500">
              {cohort === 'transfer'
                ? `Good transfer plans usually clarify ${transferPrepExamples.join(', ')}.`
                : `Stronger freshman applicants usually show rigor like ${freshmanRigorExamples.join(', ')}.`}
            </p>
          </div>
          <div className="grid gap-3">
            <label htmlFor="target-activities" className="text-sm text-slate-400">
              Activities, leadership, work, or projects
            </label>
            <input
              id="target-activities"
              value={targetActivities}
              onChange={(e) => setTargetActivities(e.target.value)}
              placeholder="Research, tutoring, robotics, debate, hospital volunteering, internships..."
              className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
            />
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
            {sourceSchool && <p className="mt-1 text-sm text-amber-300">Filtered by {sourceSchool}</p>}
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

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">AI Help</p>
            <h2 className="text-2xl font-semibold">Planner readout</h2>
            <p className="mt-1 text-sm text-slate-400">
              Uses the visible metrics only. It does not replace official admissions guidance.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdvisor}
            disabled={advisorLoading || loading || metrics.length === 0}
            className="rounded-2xl border border-amber-400 px-4 py-2 font-semibold text-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {advisorLoading ? 'Analyzing…' : 'Ask AI'}
          </button>
        </div>

        {advisorError && <p className="mt-4 text-sm text-rose-400">{advisorError}</p>}

        {!advisor && !advisorLoading && !advisorError && (
          <p className="mt-4 text-sm text-slate-400">
            Generate a grounded summary for this campus, program, and source-school combination.
          </p>
        )}

        {advisor && (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Summary</p>
              <p className="mt-2 text-base text-white">{advisor.summary}</p>
              <p className="mt-4 text-sm font-semibold text-fuchsia-300">Competitiveness</p>
              <p className="mt-2 text-sm text-slate-200">{advisor.competitiveness}</p>
              <p className="mt-3 text-xs text-slate-500">{advisor.disclaimer}</p>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-emerald-300">Strengths</p>
                <AdviceList items={advisor.strengths} />
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-amber-300">Cautions</p>
                <AdviceList items={advisor.cautions} />
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-sky-300">Next steps</p>
                <AdviceList items={advisor.next_steps} />
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-cyan-300">Coursework plan</p>
                <AdviceList items={advisor.coursework_plan} />
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-violet-300">Extracurricular plan</p>
                <AdviceList items={advisor.extracurricular_plan} />
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-orange-300">How you compare</p>
                <AdviceList items={advisor.profile_comparison} />
              </div>
            </div>
          </div>
        )}
      </section>

      <EvidenceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        campus={campus}
        cohort={cohort}
        focus={focus}
        years={selectedYears}
        sourceSchool={sourceSchool || null}
        schoolType={schoolType || null}
      />
    </div>
  )
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-6xl px-4 py-10 text-sm text-slate-400">Loading planner…</div>}>
      <PlannerPageContent />
    </Suspense>
  )
}
