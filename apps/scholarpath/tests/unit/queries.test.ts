import { describe, expect, test } from 'vitest'
import { TARGET_CAMPUSES, TRANSFER_MAJORS } from '@/lib/catalog'
import { LOCAL_SCHOLAR_DATA } from '@/lib/server/localData'
import { queryMetrics, queryProfile, querySourceSchools } from '@/lib/server/queries'

describe('server queries', () => {
  test('returns seeded transfer metrics for the planner filters', () => {
    const page = queryMetrics(LOCAL_SCHOLAR_DATA, {
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
    const profile = queryProfile(LOCAL_SCHOLAR_DATA, {
      campus: 'UCLA',
      cohort: 'freshman',
      discipline: 'Engineering',
      years: [2024, 2023]
    })

    expect(profile.metrics.length).toBeGreaterThan(0)
    expect(profile.years).toEqual([2023, 2024])
  })

  test('searches source schools without a database', () => {
    const schools = querySourceSchools(LOCAL_SCHOLAR_DATA, {
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
