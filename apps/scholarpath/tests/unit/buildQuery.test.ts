import { describe, expect, it } from 'vitest'
import { buildQuery } from '../../lib/buildQuery'

describe('buildQuery', () => {
  it('omits empty params', () => {
    const result = buildQuery({ campus: 'uc-davis', metric_key: '' })
    expect(result).toBe('?campus=uc-davis')
  })
})
