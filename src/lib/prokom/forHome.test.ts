import { describe, expect, it } from 'vitest'

import data from '../../../seed/prokomeu/model/DlaDomu.json'
import { forHomeSchema } from './forHome'

describe('forHome texts', () => {
  it('the package passes the schema and carries no contact data or hours', () => {
    const { _zrodlo: _source, ...rest } = data
    const result = forHomeSchema.safeParse(rest)
    expect(result.success ? 'ok' : JSON.stringify(result.error.issues.slice(0, 3))).toBe('ok')
    expect(JSON.stringify(rest)).not.toMatch(/\d{1,2}:\d{2}–\d{1,2}:\d{2}|widzisz cenę/)
  })
})
