import { describe, expect, test } from 'vitest'
import { TARGET_CAMPUSES, TRANSFER_MAJORS } from '@/lib/catalog'
import { queryMetrics, queryProfile, querySourceSchools } from '@/lib/server/queries'
import type { ScholarDataBundle } from '@/lib/types'

const TEST_DATA: ScholarDataBundle = {
  datasets: [
    { id: 1, title: 'UC Transfer 2024', year: 2024, term: 'Fall', cohort: 'transfer' },
    { id: 2, title: 'UC Freshman 2024', year: 2024, term: 'Fall', cohort: 'freshman' }
  ],
  metrics: [
    {
      id: 1,
      dataset_id: 1,
      campus: 'UC Irvine',
      major: 'Mathematics',
      discipline: null,
      cohort: 'transfer',
      stat_name: 'gpa_p50',
      stat_value_numeric: 3.5,
      stat_value_text: null,
      unit: null,
      percentile: '50',
      year: 2024,
      term: 'Fall',
      citations: [{ title: 'UC Info', publisher: 'UC', year: 2024, source_url: 'https://example.com/1' }]
    },
    {
      id: 2,
      dataset_id: 2,
      campus: 'UCLA',
      major: null,
      discipline: 'Engineering',
      cohort: 'freshman',
      stat_name: 'gpa_p50',
      stat_value_numeric: 4.2,
      stat_value_text: null,
      unit: null,
      percentile: '50',
      year: 2023,
      term: 'Fall',
      citations: [{ title: 'UC Info', publisher: 'UC', year: 2023, source_url: 'https://example.com/2' }]
    },
    {
      id: 3,
      dataset_id: 2,
      campus: 'UCLA',
      major: null,
      discipline: 'Engineering',
      cohort: 'freshman',
      stat_name: 'admit_rate',
      stat_value_numeric: 9.1,
      stat_value_text: null,
      unit: '%',
      percentile: null,
      year: 2024,
      term: 'Fall',
      citations: [{ title: 'UC Info', publisher: 'UC', year: 2024, source_url: 'https://example.com/3' }]
    }
  ],
  sourceSchools: [
    { name: 'Irvine Valley College', school_type: 'CommunityCollege', city: 'Irvine', state: 'CA' },
    { name: 'Mission High School', school_type: 'HighSchool', city: 'San Francisco', state: 'CA' }
  ]
}

describe('server queries', () => {
  test('returns seeded transfer metrics for the planner filters', () => {
    const page = queryMetrics(TEST_DATA, {
      campus: 'UC Irvine',
      cohort: 'transfer',
      major: 'Mathematics',
      limit: 25,
      years: [2024, 2023]
    })

    expect(page.items.length).toBeGreaterThan(0)
    expect(page.items.some((metric) => metric.stat_name === 'gpa_p50')).toBe(true)
  })

  test('builds a freshman profile with sorted years', () => {
    const profile = queryProfile(TEST_DATA, {
      campus: 'UCLA',
      cohort: 'freshman',
      discipline: 'Engineering',
      years: [2024, 2023]
    })

    expect(profile.metrics.length).toBeGreaterThan(0)
    expect(profile.years).toEqual([2023, 2024])
  })

  test('searches source schools without a database', () => {
    const schools = querySourceSchools(TEST_DATA, {
      search: 'college',
      type: 'CommunityCollege'
    })

    expect(schools.length).toBeGreaterThan(0)
    expect(schools.every((school) => school.school_type === 'CommunityCollege')).toBe(true)
  })

  test('ships a broader target campus and major catalog', () => {
    expect(TARGET_CAMPUSES.length).toBeGreaterThan(25)
    expect(TRANSFER_MAJORS.length).toBeGreaterThan(6)
  })
})
