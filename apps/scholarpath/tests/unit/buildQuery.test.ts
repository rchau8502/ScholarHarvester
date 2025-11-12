import { describe, expect, test } from 'vitest'
import { buildQuery } from '@/lib/buildQuery'

describe('buildQuery', () => {
  test('renders arrays without duplicates', () => {
    const query = buildQuery({ years: [2023, 2024], campus: 'UC Irvine' })
    expect(query).toContain('years=2023')
    expect(query).toContain('years=2024')
    expect(query).toContain('campus=UC%20Irvine')
  })

  test('returns empty string for empty params', () => {
    expect(buildQuery({})).toBe('')
  })
})
