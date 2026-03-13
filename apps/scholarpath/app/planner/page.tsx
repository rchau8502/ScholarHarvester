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

type PlannerTask = {
  id: string
  title: string
  lane: 'coursework' | 'application' | 'extracurricular'
  done: boolean
}

type TermPlan = {
  id: string
  name: string
  courses: string[]
}

type RequirementItem = {
  title: string
  status: 'done' | 'in_progress' | 'needs_attention'
  detail: string
}

type PlannerReadout = {
  goal: string
  readinessLabel: string
  readinessTone: string
  readinessSummary: string
  competitivenessSummary: string
  requirementItems: RequirementItem[]
  acceptedProfile: string[]
  nextTermPlan: string[]
  applicationStrategy: string[]
}

const focusCourseTemplates: Record<string, string[]> = {
  'Computer Science': ['Calculus I', 'Calculus II', 'Data Structures', 'Discrete Math', 'Programming sequence'],
  Engineering: ['Calculus I', 'Calculus II', 'Physics', 'Chemistry', 'Intro Engineering'],
  'Mechanical Engineering': ['Calculus I', 'Calculus II', 'Physics Mechanics', 'Statics', 'CAD'],
  'Electrical Engineering': ['Calculus I', 'Calculus II', 'Physics E&M', 'Circuits', 'Programming'],
  'Civil Engineering': ['Calculus I', 'Calculus II', 'Physics Mechanics', 'Statics', 'CAD or Surveying'],
  Mathematics: ['Calculus I', 'Calculus II', 'Calculus III', 'Linear Algebra', 'Differential Equations'],
  Biology: ['General Biology', 'General Chemistry', 'Organic Chemistry', 'Statistics', 'Lab sequence'],
  Chemistry: ['General Chemistry', 'Organic Chemistry', 'Calculus', 'Physics', 'Analytical Chemistry'],
  Nursing: ['Anatomy', 'Physiology', 'Microbiology', 'Statistics', 'Communication'],
  'Business Administration': ['Microeconomics', 'Macroeconomics', 'Statistics', 'Financial Accounting', 'Managerial Accounting'],
  Economics: ['Microeconomics', 'Macroeconomics', 'Calculus', 'Statistics', 'Intro Econometrics'],
  Psychology: ['Intro Psychology', 'Statistics', 'Research Methods', 'Biology', 'Writing seminar'],
  Sociology: ['Intro Sociology', 'Statistics', 'Research Methods', 'Writing-intensive GE', 'Social theory'],
  'Political Science': ['Government', 'Comparative Politics', 'Statistics', 'Economics', 'Writing seminar'],
  History: ['US History', 'World History', 'Writing seminar', 'Research methods', 'Humanities elective'],
  English: ['Composition', 'Literature survey', 'Critical writing', 'Public speaking', 'Humanities elective'],
  Communications: ['Public speaking', 'Media studies', 'Writing', 'Statistics', 'Digital media'],
  'Public Health': ['Biology', 'Statistics', 'Chemistry', 'Psychology', 'Health policy'],
  'Data Science': ['Programming', 'Statistics', 'Linear Algebra', 'Calculus', 'Data structures'],
  Humanities: ['Writing seminar', 'History or philosophy', 'Foreign language', 'Research seminar', 'Humanities elective'],
  'Arts and Media': ['Studio or production', 'Media analysis', 'Design tools', 'Writing', 'Portfolio course'],
  Business: ['Microeconomics', 'Statistics', 'Accounting', 'Business writing', 'Leadership elective'],
  'Biological Sciences': ['Biology', 'Chemistry', 'Statistics', 'Lab science', 'Research elective'],
  'Physical Sciences': ['Chemistry', 'Physics', 'Calculus', 'Lab science', 'Statistics'],
  'Social Sciences': ['Statistics', 'Writing seminar', 'Research methods', 'Government', 'Social science elective'],
  Education: ['Composition', 'Psychology', 'Child Development', 'Public speaking', 'Statistics'],
  Architecture: ['Design studio', 'Drawing', 'Physics', 'Calculus', 'Portfolio development'],
  Kinesiology: ['Biology', 'Anatomy', 'Physiology', 'Statistics', 'Psychology']
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function buildDefaultTasks(input: {
  cohort: 'transfer' | 'freshman'
  campus: string
  focus: string
  sourceSchool: string
}): PlannerTask[] {
  const transferTasks = [
    `Verify ${input.campus} transfer admission pattern and articulation for ${input.focus}`,
    `Finish major prerequisites for ${input.focus}`,
    'Complete the transfer GE pattern you are targeting',
    'Meet a counselor or advisor to confirm sequencing',
    'Draft transfer essays, PIQs, and activity list',
    'Strengthen one field-relevant activity, project, internship, or leadership role'
  ]

  const freshmanTasks = [
    `Build a rigorous course load that fits ${input.focus}`,
    'Keep GPA on track and review grade trends each term',
    'Plan AP, IB, honors, or dual-enrollment rigor',
    'Build one strong leadership or impact story outside class',
    'Draft essays, activity descriptions, and resume early',
    `Attend admissions events or info sessions for ${input.campus}`
  ]

  const titles = input.cohort === 'transfer' ? transferTasks : freshmanTasks
  return titles.map((title, index) => ({
    id: `task-${index}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title: input.sourceSchool ? `${title}${index === 0 ? ` from ${input.sourceSchool}` : ''}` : title,
    lane:
      index < 2 ? 'coursework' : index < 4 ? 'application' : 'extracurricular',
    done: false
  }))
}

function buildDefaultSchedule(input: {
  cohort: 'transfer' | 'freshman'
  focus: string
  plannedCourses: string
}): TermPlan[] {
  const termNames =
    input.cohort === 'transfer'
      ? ['Current term', 'Next term', 'Summer', 'Application term']
      : ['Current term', 'Next term', 'Summer', 'Application season']

  const template = focusCourseTemplates[input.focus] ?? [
    'Core prerequisite 1',
    'Core prerequisite 2',
    'Writing requirement',
    'Quantitative course',
    'Field-relevant elective'
  ]

  const customCourses = input.plannedCourses
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const combined = [...customCourses, ...template].filter(
    (course, index, items) => items.findIndex((item) => item.toLowerCase() === course.toLowerCase()) === index
  )

  return termNames.map((name, index) => ({
    id: `term-${index}`,
    name,
    courses: combined.filter((_, courseIndex) => courseIndex % termNames.length === index).slice(0, 4)
  }))
}

function statNumber(metrics: Metric[], name: string) {
  const match = metrics.find((metric) => metric.stat_name === name)
  return typeof match?.stat_value_numeric === 'number' ? match.stat_value_numeric : null
}

function progressScore(value: 'early' | 'in_progress' | 'mostly_complete' | 'complete') {
  switch (value) {
    case 'complete':
      return 3
    case 'mostly_complete':
      return 2
    case 'in_progress':
      return 1
    default:
      return 0
  }
}

function buildPlannerReadout(input: {
  cohort: 'transfer' | 'freshman'
  campus: string
  focus: string
  sourceSchool: string
  currentGpa: string
  targetGpa: string
  apCount: string
  extracurricularStrength: 'developing' | 'solid' | 'strong' | 'exceptional'
  transferRequirementProgress: 'early' | 'in_progress' | 'mostly_complete' | 'complete'
  majorPreparationProgress: 'early' | 'in_progress' | 'mostly_complete' | 'complete'
  metrics: Metric[]
  scheduleTerms: TermPlan[]
  plannedCourses: string
}): PlannerReadout {
  const gpaP25 = statNumber(input.metrics, 'gpa_p25')
  const gpaP50 = statNumber(input.metrics, 'gpa_p50')
  const gpaP75 = statNumber(input.metrics, 'gpa_p75')
  const admitRate = statNumber(input.metrics, 'admit_rate')
  const currentGpaValue = input.currentGpa ? Number(input.currentGpa) : null
  const targetGpaValue = input.targetGpa ? Number(input.targetGpa) : null
  const apCountValue = input.apCount ? Number(input.apCount) : null
  const extracurricularScore =
    input.extracurricularStrength === 'exceptional'
      ? 3
      : input.extracurricularStrength === 'strong'
        ? 2
        : input.extracurricularStrength === 'solid'
          ? 1
          : 0

  let readinessPoints = 0
  if (currentGpaValue != null && gpaP50 != null) {
    if (currentGpaValue >= (gpaP75 ?? gpaP50 + 0.2)) readinessPoints += 3
    else if (currentGpaValue >= gpaP50) readinessPoints += 2
    else if (gpaP25 != null && currentGpaValue >= gpaP25) readinessPoints += 1
  }
  readinessPoints += extracurricularScore
  if (input.cohort === 'transfer') {
    readinessPoints += progressScore(input.transferRequirementProgress)
    readinessPoints += progressScore(input.majorPreparationProgress)
  } else if (apCountValue != null) {
    readinessPoints += apCountValue >= 8 ? 3 : apCountValue >= 5 ? 2 : apCountValue >= 3 ? 1 : 0
  }

  const readiness =
    readinessPoints >= 9
      ? {
          label: 'Strong position',
          tone: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
        }
      : readinessPoints >= 6
        ? {
            label: 'On track, but still needs tightening',
            tone: 'border-sky-500/40 bg-sky-500/10 text-sky-200'
          }
        : readinessPoints >= 3
          ? {
              label: 'Possible, but gaps are still visible',
              tone: 'border-amber-500/40 bg-amber-500/10 text-amber-200'
            }
          : {
              label: 'Not yet competitive enough',
              tone: 'border-rose-500/40 bg-rose-500/10 text-rose-200'
            }

  const requirementItems: RequirementItem[] =
    input.cohort === 'transfer'
      ? [
          {
            title: 'Transfer admission requirements',
            status:
              input.transferRequirementProgress === 'complete'
                ? 'done'
                : input.transferRequirementProgress === 'mostly_complete' || input.transferRequirementProgress === 'in_progress'
                  ? 'in_progress'
                  : 'needs_attention',
            detail: `Current status: ${input.transferRequirementProgress.replaceAll('_', ' ')}. Finish the transfer pattern and verify articulation before applying.`
          },
          {
            title: `${input.focus} prerequisites`,
            status:
              input.majorPreparationProgress === 'complete'
                ? 'done'
                : input.majorPreparationProgress === 'mostly_complete' || input.majorPreparationProgress === 'in_progress'
                  ? 'in_progress'
                  : 'needs_attention',
            detail: `Current status: ${input.majorPreparationProgress.replaceAll('_', ' ')}. Missing major prep is usually the biggest reason a transfer file falls behind.`
          },
          {
            title: 'GPA against past admits',
            status:
              currentGpaValue != null && gpaP50 != null && currentGpaValue >= gpaP50
                ? 'done'
                : currentGpaValue != null && gpaP25 != null && currentGpaValue >= gpaP25
                  ? 'in_progress'
                  : 'needs_attention',
            detail:
              currentGpaValue != null && gpaP50 != null
                ? `Your GPA is ${currentGpaValue.toFixed(2)}. Past admits here were around ${gpaP25?.toFixed(2) ?? '--'} to ${gpaP75?.toFixed(2) ?? '--'}, with a middle point near ${gpaP50.toFixed(2)}.`
                : 'Add your GPA to compare yourself against the past cohort.'
          },
          {
            title: 'Field-relevant activity and application story',
            status:
              input.extracurricularStrength === 'strong' || input.extracurricularStrength === 'exceptional'
                ? 'done'
                : input.extracurricularStrength === 'solid'
                  ? 'in_progress'
                  : 'needs_attention',
            detail: 'Competitive transfer applicants usually pair completed coursework with a clear reason for the major, projects, leadership, work, research, or service.'
          }
        ]
      : [
          {
            title: 'GPA and grade trend',
            status:
              currentGpaValue != null && gpaP50 != null && currentGpaValue >= gpaP50
                ? 'done'
                : currentGpaValue != null && gpaP25 != null && currentGpaValue >= gpaP25
                  ? 'in_progress'
                  : 'needs_attention',
            detail:
              currentGpaValue != null && gpaP50 != null
                ? `Your GPA is ${currentGpaValue.toFixed(2)}. Past admits here clustered around ${gpaP25?.toFixed(2) ?? '--'} to ${gpaP75?.toFixed(2) ?? '--'}, with a midpoint near ${gpaP50.toFixed(2)}.`
                : 'Add your GPA so the planner can compare you to past admits.'
          },
          {
            title: 'AP, IB, honors, or dual-enrollment rigor',
            status:
              apCountValue != null && apCountValue >= 6 ? 'done' : apCountValue != null && apCountValue >= 3 ? 'in_progress' : 'needs_attention',
            detail:
              apCountValue != null
                ? `You listed ${apCountValue} advanced courses. Stronger freshman files usually show sustained rigor, not just one or two advanced classes.`
                : 'Add the number of advanced courses you have completed or planned.'
          },
          {
            title: `${input.focus} preparation`,
            status: input.plannedCourses.trim() ? 'in_progress' : 'needs_attention',
            detail: `Your course list should clearly support ${input.focus}, especially if you are aiming for a selective destination.`
          },
          {
            title: 'Extracurricular impact and story',
            status:
              input.extracurricularStrength === 'strong' || input.extracurricularStrength === 'exceptional'
                ? 'done'
                : input.extracurricularStrength === 'solid'
                  ? 'in_progress'
                  : 'needs_attention',
            detail: 'Competitive freshman applicants usually show depth, leadership, initiative, or impact, not just club membership.'
          }
        ]

  const acceptedProfile = [
    gpaP50 != null
      ? `Past admits in this view were roughly around a ${gpaP25?.toFixed(2) ?? '--'} to ${gpaP75?.toFixed(2) ?? '--'} GPA band, with the middle of the cohort near ${gpaP50.toFixed(2)}.`
      : 'There is not enough GPA data loaded yet to benchmark this path.',
    admitRate != null
      ? `The visible admit rate is ${admitRate.toFixed(1)}%, so this path should be treated as ${admitRate < 25 ? 'highly selective' : admitRate < 45 ? 'competitive' : 'more attainable but still not automatic'}.`
      : 'Admit rate is not available for this combination yet.',
    input.cohort === 'transfer'
      ? 'The strongest transfer applicants usually complete both transfer patterns and major prerequisites before filing the application.'
      : 'The strongest freshman applicants usually combine grades, rigor, and a credible story about why they fit the intended field.',
    input.sourceSchool
      ? `Because you selected ${input.sourceSchool}, the readout is grounded in that source-school pathway instead of a statewide average.`
      : 'Because you did not select a source school, this readout reflects the broader bundled cohort rather than your exact pipeline.'
  ]

  const nextTermPlan =
    input.scheduleTerms.slice(0, 2).flatMap((term) =>
      term.courses.length
        ? [`${term.name}: ${term.courses.join(', ')}`]
        : [`${term.name}: add the most important missing prerequisites and one writing or quantitative support course.`]
    )

  const applicationStrategy = [
    input.cohort === 'transfer'
      ? `Your goal is to transfer from ${input.sourceSchool || 'your current college'} to ${input.campus} for ${input.focus}. Treat prerequisite completion as non-negotiable.`
      : `Your goal is to apply from ${input.sourceSchool || 'your current high school'} to ${input.campus} for ${input.focus}. Treat GPA trend, rigor, and activities as one combined story.`,
    readiness.label === 'Strong position'
      ? 'You can keep this destination as a serious target, but you should still apply broadly because even good-looking files are not automatic admits.'
      : readiness.label === 'On track, but still needs tightening'
        ? 'Keep this destination in play, but tighten your next two terms and build a wider school list.'
        : 'Treat this destination as a reach until the missing pieces are improved, and build a stronger backup list now.',
    targetGpaValue != null
      ? `Use your goal GPA of ${targetGpaValue.toFixed(2)} as a planning floor, not just a wish.`
      : 'Set a target GPA so the planner can show whether your current path is enough or still short.',
    input.cohort === 'transfer'
      ? 'Before applying, verify official articulation and major prep with the destination school and the appropriate transfer planning tools.'
      : 'Before applying, verify the destination school’s freshman review factors, especially course rigor expectations and testing or portfolio rules if relevant.'
  ]

  return {
    goal:
      input.cohort === 'transfer'
        ? `Transfer from ${input.sourceSchool || 'your current college'} to ${input.campus} for ${input.focus}`
        : `Apply from ${input.sourceSchool || 'your current high school'} to ${input.campus} for ${input.focus}`,
    readinessLabel: readiness.label,
    readinessTone: readiness.tone,
    readinessSummary:
      input.cohort === 'transfer'
        ? 'This readout is prioritizing your GPA, transfer completion, major prep, and activity story rather than just showing a raw admit rate.'
        : 'This readout is prioritizing GPA, academic rigor, and extracurricular depth rather than only showing historical metrics.',
    competitivenessSummary:
      currentGpaValue != null && gpaP50 != null
        ? currentGpaValue >= (gpaP75 ?? gpaP50 + 0.2)
          ? 'Right now your GPA looks closer to the upper end of the past cohort. If the rest of your file is complete, you look more competitive than the median applicant in this view.'
          : currentGpaValue >= gpaP50
            ? 'Right now your GPA looks around or above the middle of the past cohort. You still need the rest of the file to be clean and complete.'
            : gpaP25 != null && currentGpaValue >= gpaP25
              ? 'Right now your GPA looks closer to the lower end of the visible admit band. This is still possible, but you need stronger execution elsewhere.'
              : 'Right now your GPA sits below the visible admit band, so this path looks weak unless you improve the academics or broaden your school list.'
        : 'Add your GPA to compare your current position against the past admit band.',
    requirementItems,
    acceptedProfile,
    nextTermPlan,
    applicationStrategy
  }
}

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
  const [planTasks, setPlanTasks] = useState<PlannerTask[]>([])
  const [scheduleTerms, setScheduleTerms] = useState<TermPlan[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [courseDrafts, setCourseDrafts] = useState<Record<string, string>>({})

  const planStorageKey = useMemo(
    () =>
      `scholarpath-plan:${campus}:${cohort}:${focus}:${sourceSchool || 'all-schools'}:${schoolType || 'any-school-type'}`,
    [campus, cohort, focus, sourceSchool, schoolType]
  )

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
    const fallbackTasks = buildDefaultTasks({ cohort, campus, focus, sourceSchool })
    const fallbackSchedule = buildDefaultSchedule({ cohort, focus, plannedCourses })

    try {
      const raw = window.localStorage.getItem(planStorageKey)
      if (!raw) {
        setPlanTasks(fallbackTasks)
        setScheduleTerms(fallbackSchedule)
        return
      }

      const parsed = JSON.parse(raw) as {
        tasks?: PlannerTask[]
        schedule?: TermPlan[]
      }
      setPlanTasks(parsed.tasks?.length ? parsed.tasks : fallbackTasks)
      setScheduleTerms(parsed.schedule?.length ? parsed.schedule : fallbackSchedule)
    } catch (error) {
      console.error(error)
      setPlanTasks(fallbackTasks)
      setScheduleTerms(fallbackSchedule)
    }
  }, [planStorageKey, cohort, campus, focus, sourceSchool, plannedCourses])

  useEffect(() => {
    if (!planTasks.length && !scheduleTerms.length) {
      return
    }

    window.localStorage.setItem(
      planStorageKey,
      JSON.stringify({
        tasks: planTasks,
        schedule: scheduleTerms
      })
    )
  }, [planStorageKey, planTasks, scheduleTerms])

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

  function toggleTask(taskId: string) {
    setPlanTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task))
    )
  }

  function addTask() {
    const title = newTaskTitle.trim()
    if (!title) return

    setPlanTasks((prev) => [
      ...prev,
      {
        id: makeId('custom-task'),
        title,
        lane: 'application',
        done: false
      }
    ])
    setNewTaskTitle('')
  }

  function removeTask(taskId: string) {
    setPlanTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  function addCourse(termId: string) {
    const title = (courseDrafts[termId] ?? '').trim()
    if (!title) return

    setScheduleTerms((prev) =>
      prev.map((term) =>
        term.id === termId &&
        !term.courses.some((course) => course.toLowerCase() === title.toLowerCase())
          ? { ...term, courses: [...term.courses, title] }
          : term
      )
    )
    setCourseDrafts((prev) => ({ ...prev, [termId]: '' }))
  }

  function removeCourse(termId: string, courseTitle: string) {
    setScheduleTerms((prev) =>
      prev.map((term) =>
        term.id === termId
          ? { ...term, courses: term.courses.filter((course) => course !== courseTitle) }
          : term
      )
    )
  }

  function resetPlan() {
    setPlanTasks(buildDefaultTasks({ cohort, campus, focus, sourceSchool }))
    setScheduleTerms(buildDefaultSchedule({ cohort, focus, plannedCourses }))
  }

  function applyAdvisorToPlan() {
    if (!advisor) return

    const suggestedTasks = [...advisor.next_steps, ...advisor.extracurricular_plan]
    setPlanTasks((prev) => {
      const existing = new Set(prev.map((task) => task.title.toLowerCase()))
      const additions = suggestedTasks
        .filter((item) => !existing.has(item.toLowerCase()))
        .map((title, index) => ({
          id: `advisor-task-${index}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          title,
          lane: index < advisor.next_steps.length ? 'application' : 'extracurricular',
          done: false
        }) satisfies PlannerTask)
      return [...prev, ...additions]
    })

    setScheduleTerms((prev) => {
      if (!prev.length) {
        return buildDefaultSchedule({ cohort, focus, plannedCourses })
      }

      const next = prev.map((term) => ({ ...term, courses: [...term.courses] }))
      advisor.coursework_plan.forEach((course, index) => {
        const targetTerm = next[index % next.length]
        if (!targetTerm.courses.some((item) => item.toLowerCase() === course.toLowerCase())) {
          targetTerm.courses.push(course)
        }
      })
      return next
    })
  }

  const completedTaskCount = planTasks.filter((task) => task.done).length
  const plannerReadout = useMemo(
    () =>
      buildPlannerReadout({
        cohort,
        campus,
        focus,
        sourceSchool,
        currentGpa,
        targetGpa,
        apCount,
        extracurricularStrength,
        transferRequirementProgress,
        majorPreparationProgress,
        metrics,
        scheduleTerms,
        plannedCourses
      }),
    [
      cohort,
      campus,
      focus,
      sourceSchool,
      currentGpa,
      targetGpa,
      apCount,
      extracurricularStrength,
      transferRequirementProgress,
      majorPreparationProgress,
      metrics,
      scheduleTerms,
      plannedCourses
    ]
  )
  const destinationLabel = cohort === 'transfer' ? 'Transfer to' : 'Apply to'
  const applicantTypeLabel = cohort === 'transfer' ? 'Plan type' : 'Applicant type'
  const focusLabel = cohort === 'transfer' ? 'Transfer major' : 'Intended area of study'
  const sourceSchoolLabel = cohort === 'transfer' ? 'Transfer from' : 'Current high school'
  const sourceSchoolPlaceholder = cohort === 'transfer' ? 'All community colleges' : 'All high schools'

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="space-y-3">
        <p className="text-lg text-slate-400">College plan + evidence-backed guidance</p>
        <h1 className="text-3xl font-bold">ScholarPath</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Build a clearer step-by-step plan for where you want to go, where you are coming from, and what to do next.
        </p>
      </header>

      <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-900/40">
        <div className="grid gap-3 sm:grid-cols-2">
          <label htmlFor="campus-select" className="text-sm text-slate-400">
            {destinationLabel}
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
            {applicantTypeLabel}
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
            {focusLabel}
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
            {sourceSchoolLabel}
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
            <option value="">{sourceSchoolPlaceholder}</option>
            {(cohort === 'transfer' ? COMMUNITY_COLLEGES : HIGH_SCHOOLS).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-sm text-slate-400">Data year</p>
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Decision readout</p>
            <h2 className="text-2xl font-semibold">{plannerReadout.goal}</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">{plannerReadout.readinessSummary}</p>
          </div>
          <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${plannerReadout.readinessTone}`}>
            {plannerReadout.readinessLabel}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-fuchsia-300">How competitive you are</p>
            <p className="mt-2 text-sm text-slate-200">{plannerReadout.competitivenessSummary}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-cyan-300">What accepted applicants usually look like</p>
            <AdviceList items={plannerReadout.acceptedProfile} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr,1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-amber-300">What you still need</p>
            <div className="mt-3 space-y-3">
              {plannerReadout.requirementItems.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-800 px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        item.status === 'done'
                          ? 'bg-emerald-500/15 text-emerald-200'
                          : item.status === 'in_progress'
                            ? 'bg-amber-500/15 text-amber-200'
                            : 'bg-rose-500/15 text-rose-200'
                      }`}
                    >
                      {item.status === 'done'
                        ? 'Done or strong'
                        : item.status === 'in_progress'
                          ? 'In progress'
                          : 'Needs attention'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm font-semibold text-sky-300">Your next 2 terms</p>
              <AdviceList items={plannerReadout.nextTermPlan} />
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm font-semibold text-emerald-300">Application strategy</p>
              <AdviceList items={plannerReadout.applicationStrategy} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr,1.4fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">Execution plan</p>
              <h2 className="text-2xl font-semibold">Checklist</h2>
              <p className="mt-1 text-sm text-slate-400">
                {completedTaskCount} of {planTasks.length} tasks complete
              </p>
            </div>
            <button
              type="button"
              onClick={resetPlan}
              className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"
            >
              Reset plan
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTask()
                }
              }}
              placeholder="Add a task, deadline, or reminder"
              className="flex-1 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
            />
            <button
              type="button"
              onClick={addTask}
              className="rounded-2xl bg-amber-400 px-4 py-2 font-semibold text-slate-900"
            >
              Add
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {planTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3"
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-400"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${task.done ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{task.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{task.lane}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="rounded-xl border border-slate-800 px-2 py-1 text-xs text-slate-400"
                >
                  Remove
                </button>
              </div>
            ))}
            {planTasks.length === 0 && <p className="text-sm text-slate-500">No tasks yet.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">Degree plan</p>
              <h2 className="text-2xl font-semibold">Course schedule</h2>
              <p className="mt-1 text-sm text-slate-400">
                Use this like a lightweight DegreeWorks board and update it as requirements become clearer.
              </p>
            </div>
            {advisor && (
              <button
                type="button"
                onClick={applyAdvisorToPlan}
                className="rounded-2xl border border-cyan-400 px-4 py-2 text-sm font-semibold text-cyan-200"
              >
                Use AI in plan
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {scheduleTerms.map((term) => (
              <div key={term.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-slate-200">{term.name}</p>
                <div className="mt-3 space-y-2">
                  {term.courses.map((course) => (
                    <div
                      key={`${term.id}-${course}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 px-3 py-2"
                    >
                      <span className="text-sm text-slate-100">{course}</span>
                      <button
                        type="button"
                        onClick={() => removeCourse(term.id, course)}
                        className="rounded-xl border border-slate-800 px-2 py-1 text-xs text-slate-400"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {term.courses.length === 0 && <p className="text-sm text-slate-500">No courses added yet.</p>}
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    value={courseDrafts[term.id] ?? ''}
                    onChange={(e) => setCourseDrafts((prev) => ({ ...prev, [term.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCourse(term.id)
                      }
                    }}
                    placeholder="Add course or requirement"
                    className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => addCourse(term.id)}
                    className="rounded-2xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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
            <p className="text-sm text-slate-400">AI coach</p>
            <h2 className="text-2xl font-semibold">Deeper explanation</h2>
            <p className="mt-1 text-sm text-slate-400">
              Use this after the decision readout if you want more narrative guidance. It still does not replace official admissions guidance.
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
            Generate a grounded explanation for this destination, major, and current-school path.
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
