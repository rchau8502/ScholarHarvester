import type { Citation, DatasetEntry, Metric, ScholarDataBundle, SourceSchool } from '@/lib/types'

const transferMajors = ['Mathematics', 'Computer Science'] as const
const freshmanDisciplines = ['Physical Sciences', 'Engineering', 'Social Sciences'] as const
const years = [2024, 2023, 2022] as const

const campuses = [
  { name: 'UC Irvine', sourceBase: 'https://www.universityofcalifornia.edu/infocenter', offset: 0 },
  { name: 'UCLA', sourceBase: 'https://www.universityofcalifornia.edu/infocenter', offset: 1 },
  { name: 'UC San Diego', sourceBase: 'https://www.universityofcalifornia.edu/infocenter', offset: 2 },
  { name: 'CSU Long Beach', sourceBase: 'https://www.calstate.edu/data', offset: 3 },
  { name: 'CSU Fullerton', sourceBase: 'https://www.calstate.edu/data', offset: 4 }
] as const

function buildCitation(campus: string, cohort: 'transfer' | 'freshman', focus: string, year: number, statName: string): Citation {
  const isUc = campus.startsWith('UC')
  return {
    title: `${campus} ${cohort} ${focus} ${statName}`,
    publisher: isUc ? 'UC Info Center' : 'CSU System Dashboards',
    year,
    source_url: isUc
      ? `https://www.universityofcalifornia.edu/infocenter/admissions-residency-and-ethnicity`
      : `https://www.calstate.edu/data-center`,
    interpretation_note: 'Modeled demo data for the website; replace with official harvested values before publishing decisions.'
  }
}

function pushMetric(
  metrics: Metric[],
  datasetId: number,
  nextMetricId: () => number,
  input: {
    campus: string
    cohort: 'transfer' | 'freshman'
    year: number
    term: string
    major?: string | null
    discipline?: string | null
    statName: string
    value: number
    unit: string
    focusLabel: string
  }
) {
  metrics.push({
    id: nextMetricId(),
    dataset_id: datasetId,
    campus: input.campus,
    major: input.major ?? null,
    discipline: input.discipline ?? null,
    cohort: input.cohort,
    stat_name: input.statName,
    stat_value_numeric: Number(input.value.toFixed(input.unit === 'headcount' ? 0 : 2)),
    stat_value_text: null,
    unit: input.unit,
    percentile: input.statName.startsWith('gpa_p') ? input.statName.split('_').at(-1) ?? null : null,
    year: input.year,
    term: input.term,
    notes: null,
    citations: [buildCitation(input.campus, input.cohort, input.focusLabel, input.year, input.statName)]
  })
}

function generateLocalData(): ScholarDataBundle {
  const datasets: DatasetEntry[] = []
  const metrics: Metric[] = []
  const sourceSchools: SourceSchool[] = [
    { name: 'Walnut High School', school_type: 'HighSchool', city: 'Walnut', state: 'CA' },
    { name: 'Arcadia High School', school_type: 'HighSchool', city: 'Arcadia', state: 'CA' },
    { name: 'Irvine High School', school_type: 'HighSchool', city: 'Irvine', state: 'CA' },
    { name: 'Mt. San Antonio College', school_type: 'CommunityCollege', city: 'Walnut', state: 'CA' },
    { name: 'Santa Monica College', school_type: 'CommunityCollege', city: 'Santa Monica', state: 'CA' },
    { name: 'Orange Coast College', school_type: 'CommunityCollege', city: 'Costa Mesa', state: 'CA' },
    { name: 'Pasadena City College', school_type: 'CommunityCollege', city: 'Pasadena', state: 'CA' },
    { name: 'De Anza College', school_type: 'CommunityCollege', city: 'Cupertino', state: 'CA' }
  ]

  let datasetId = 1
  let metricId = 1
  const nextMetricId = () => metricId++

  campuses.forEach((campus, campusIndex) => {
    transferMajors.forEach((major, majorIndex) => {
      years.forEach((year, yearIndex) => {
        const currentDatasetId = datasetId++
        datasets.push({
          id: currentDatasetId,
          title: `${campus.name} transfer ${major} outlook`,
          year,
          term: 'Fall',
          cohort: 'transfer',
          notes: `Bundled site seed for ${campus.name} ${major}.`
        })

        const applicants = 2100 + campus.offset * 180 + majorIndex * 240 + yearIndex * 110
        const admitRate = 54 - campusIndex * 1.7 + majorIndex * 2.2 - yearIndex * 0.9
        const admits = applicants * (admitRate / 100)
        const enrolled = admits * (0.42 + majorIndex * 0.03)
        const gpaP25 = 3.08 + campus.offset * 0.03 + majorIndex * 0.04 - yearIndex * 0.02
        const gpaP50 = gpaP25 + 0.35
        const gpaP75 = gpaP50 + 0.28

        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'transfer',
          year,
          term: 'Fall',
          major,
          statName: 'applicants',
          value: applicants,
          unit: 'headcount',
          focusLabel: major
        })
        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'transfer',
          year,
          term: 'Fall',
          major,
          statName: 'admits',
          value: admits,
          unit: 'headcount',
          focusLabel: major
        })
        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'transfer',
          year,
          term: 'Fall',
          major,
          statName: 'enrolled',
          value: enrolled,
          unit: 'headcount',
          focusLabel: major
        })
        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'transfer',
          year,
          term: 'Fall',
          major,
          statName: 'gpa_p25',
          value: gpaP25,
          unit: 'GPA',
          focusLabel: major
        })
        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'transfer',
          year,
          term: 'Fall',
          major,
          statName: 'gpa_p50',
          value: gpaP50,
          unit: 'GPA',
          focusLabel: major
        })
        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'transfer',
          year,
          term: 'Fall',
          major,
          statName: 'gpa_p75',
          value: gpaP75,
          unit: 'GPA',
          focusLabel: major
        })
        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'transfer',
          year,
          term: 'Fall',
          major,
          statName: 'admit_rate',
          value: admitRate,
          unit: 'percent',
          focusLabel: major
        })
      })
    })

    freshmanDisciplines.forEach((discipline, disciplineIndex) => {
      years.forEach((year, yearIndex) => {
        const currentDatasetId = datasetId++
        datasets.push({
          id: currentDatasetId,
          title: `${campus.name} freshman ${discipline} outlook`,
          year,
          term: 'Fall',
          cohort: 'freshman',
          notes: `Bundled site seed for ${campus.name} ${discipline}.`
        })

        const applicants = 3900 + campus.offset * 240 + disciplineIndex * 320 + yearIndex * 150
        const admitRate = 42 - campusIndex * 1.3 - disciplineIndex * 1.8 - yearIndex * 0.8
        const admits = applicants * (admitRate / 100)
        const enrolled = admits * (0.38 + disciplineIndex * 0.02)
        const gpaP25 = 3.26 + campus.offset * 0.02 + disciplineIndex * 0.03 - yearIndex * 0.02
        const gpaP50 = gpaP25 + 0.31
        const gpaP75 = gpaP50 + 0.24

        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'freshman',
          year,
          term: 'Fall',
          discipline,
          statName: 'applicants',
          value: applicants,
          unit: 'headcount',
          focusLabel: discipline
        })
        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'freshman',
          year,
          term: 'Fall',
          discipline,
          statName: 'admits',
          value: admits,
          unit: 'headcount',
          focusLabel: discipline
        })
        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'freshman',
          year,
          term: 'Fall',
          discipline,
          statName: 'enrolled',
          value: enrolled,
          unit: 'headcount',
          focusLabel: discipline
        })
        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'freshman',
          year,
          term: 'Fall',
          discipline,
          statName: 'gpa_p25',
          value: gpaP25,
          unit: 'GPA',
          focusLabel: discipline
        })
        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'freshman',
          year,
          term: 'Fall',
          discipline,
          statName: 'gpa_p50',
          value: gpaP50,
          unit: 'GPA',
          focusLabel: discipline
        })
        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'freshman',
          year,
          term: 'Fall',
          discipline,
          statName: 'gpa_p75',
          value: gpaP75,
          unit: 'GPA',
          focusLabel: discipline
        })
        pushMetric(metrics, currentDatasetId, nextMetricId, {
          campus: campus.name,
          cohort: 'freshman',
          year,
          term: 'Fall',
          discipline,
          statName: 'admit_rate',
          value: admitRate,
          unit: 'percent',
          focusLabel: discipline
        })
      })
    })
  })

  return { datasets, metrics, sourceSchools }
}

export const LOCAL_SCHOLAR_DATA = generateLocalData()
