import {
  COMMUNITY_COLLEGES,
  FRESHMAN_DISCIPLINES,
  HIGH_SCHOOLS,
  SOURCE_SCHOOLS,
  TARGET_CAMPUSES,
  TRANSFER_MAJORS
} from '@/lib/catalog'
import type { Citation, DatasetEntry, Metric, ScholarDataBundle, SourceSchool } from '@/lib/types'

const years = [2024, 2023, 2022] as const

function buildCitation(campus: string, year: number, statName: string): Citation {
  const target = TARGET_CAMPUSES.find((entry) => entry.name === campus)
  const publisher =
    target?.segment === 'UC'
      ? 'UC Info Center'
      : target?.segment === 'CSU'
        ? 'CSU System Dashboards'
        : target?.segment === 'CommunityCollege'
          ? 'Community College Facts'
          : 'Institutional Research Office'

  return {
    title: `${campus} ${statName}`,
    publisher,
    year,
    source_url: target?.sourceBase ?? 'https://scholarstack.org',
    interpretation_note: 'Modeled demo data for the website; replace with official harvested values before publishing decisions.'
  }
}

function pushMetric(
  metrics: Metric[],
  nextMetricId: () => number,
  input: {
    datasetId: number
    campus: string
    cohort: 'transfer' | 'freshman'
    year: number
    term: string
    major?: string | null
    discipline?: string | null
    sourceSchool: string
    schoolType: 'HighSchool' | 'CommunityCollege'
    statName: string
    value: number
    unit: string
  }
) {
  metrics.push({
    id: nextMetricId(),
    dataset_id: input.datasetId,
    campus: input.campus,
    major: input.major ?? null,
    discipline: input.discipline ?? null,
    source_school: input.sourceSchool,
    school_type: input.schoolType,
    cohort: input.cohort,
    stat_name: input.statName,
    stat_value_numeric: Number(input.value.toFixed(input.unit === 'headcount' ? 0 : 2)),
    stat_value_text: null,
    unit: input.unit,
    percentile: input.statName.startsWith('gpa_p') ? input.statName.split('_').at(-1) ?? null : null,
    year: input.year,
    term: input.term,
    notes: null,
    citations: [buildCitation(input.campus, input.year, input.statName)]
  })
}

function buildSegmentWeight(segment: string) {
  switch (segment) {
    case 'UC':
      return 1.2
    case 'CSU':
      return 1
    case 'Private':
      return 0.92
    case 'CommunityCollege':
      return 1.08
    default:
      return 1
  }
}

function generateLocalData(): ScholarDataBundle {
  const datasets: DatasetEntry[] = []
  const metrics: Metric[] = []
  const sourceSchools: SourceSchool[] = SOURCE_SCHOOLS.map((school) => ({ ...school }))

  let datasetId = 1
  let metricId = 1
  const nextMetricId = () => metricId++

  TARGET_CAMPUSES.forEach((campus, campusIndex) => {
    const segmentWeight = buildSegmentWeight(campus.segment)

    TRANSFER_MAJORS.forEach((major, majorIndex) => {
      years.forEach((year, yearIndex) => {
        COMMUNITY_COLLEGES.forEach((sourceSchool, schoolIndex) => {
          const currentDatasetId = datasetId++
          datasets.push({
            id: currentDatasetId,
            title: `${campus.name} transfer ${major} outlook from ${sourceSchool}`,
            year,
            term: 'Fall',
            cohort: 'transfer',
            notes: `Bundled site seed for ${campus.name} ${major} from ${sourceSchool}.`
          })

          const applicants = (1800 + campusIndex * 52 + majorIndex * 130 + yearIndex * 80 + schoolIndex * 26) * segmentWeight
          const admitRate = Math.max(18, 58 - campusIndex * 0.45 + majorIndex * 1.1 - yearIndex * 1.2 - schoolIndex * 0.35)
          const admits = applicants * (admitRate / 100)
          const enrolled = admits * (0.34 + majorIndex * 0.01)
          const gpaP25 = 2.95 + campusIndex * 0.01 + majorIndex * 0.03 - yearIndex * 0.02 - schoolIndex * 0.01
          const gpaP50 = gpaP25 + 0.31
          const gpaP75 = gpaP50 + 0.24

          ;[
            ['applicants', applicants, 'headcount'],
            ['admits', admits, 'headcount'],
            ['enrolled', enrolled, 'headcount'],
            ['gpa_p25', gpaP25, 'GPA'],
            ['gpa_p50', gpaP50, 'GPA'],
            ['gpa_p75', gpaP75, 'GPA'],
            ['admit_rate', admitRate, 'percent']
          ].forEach(([statName, value, unit]) =>
            pushMetric(metrics, nextMetricId, {
              datasetId: currentDatasetId,
              campus: campus.name,
              cohort: 'transfer',
              year,
              term: 'Fall',
              major,
              sourceSchool,
              schoolType: 'CommunityCollege',
              statName: statName as string,
              value: Number(value),
              unit: unit as string
            })
          )
        })
      })
    })

    FRESHMAN_DISCIPLINES.forEach((discipline, disciplineIndex) => {
      years.forEach((year, yearIndex) => {
        HIGH_SCHOOLS.forEach((sourceSchool, schoolIndex) => {
          const currentDatasetId = datasetId++
          datasets.push({
            id: currentDatasetId,
            title: `${campus.name} freshman ${discipline} outlook from ${sourceSchool}`,
            year,
            term: 'Fall',
            cohort: 'freshman',
            notes: `Bundled site seed for ${campus.name} ${discipline} from ${sourceSchool}.`
          })

          const applicants = (3200 + campusIndex * 64 + disciplineIndex * 145 + yearIndex * 96 + schoolIndex * 28) * segmentWeight
          const admitRate = Math.max(14, 49 - campusIndex * 0.42 - disciplineIndex * 1.2 - yearIndex * 0.9 - schoolIndex * 0.25)
          const admits = applicants * (admitRate / 100)
          const enrolled = admits * (0.29 + disciplineIndex * 0.012)
          const gpaP25 = 3.18 + campusIndex * 0.008 + disciplineIndex * 0.025 - yearIndex * 0.02 - schoolIndex * 0.01
          const gpaP50 = gpaP25 + 0.27
          const gpaP75 = gpaP50 + 0.22

          ;[
            ['applicants', applicants, 'headcount'],
            ['admits', admits, 'headcount'],
            ['enrolled', enrolled, 'headcount'],
            ['gpa_p25', gpaP25, 'GPA'],
            ['gpa_p50', gpaP50, 'GPA'],
            ['gpa_p75', gpaP75, 'GPA'],
            ['admit_rate', admitRate, 'percent']
          ].forEach(([statName, value, unit]) =>
            pushMetric(metrics, nextMetricId, {
              datasetId: currentDatasetId,
              campus: campus.name,
              cohort: 'freshman',
              year,
              term: 'Fall',
              discipline,
              sourceSchool,
              schoolType: 'HighSchool',
              statName: statName as string,
              value: Number(value),
              unit: unit as string
            })
          )
        })
      })
    })
  })

  return { datasets, metrics, sourceSchools }
}

export const LOCAL_SCHOLAR_DATA = generateLocalData()
