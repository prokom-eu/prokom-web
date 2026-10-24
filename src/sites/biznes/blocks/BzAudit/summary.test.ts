import { describe, expect, it } from 'vitest'

import { auditSummary } from './summary'

describe('auditSummary', () => {
  it('counts the board report as 3 urgent, 4 to improve, 1 fine', () => {
    const states = ['watch', 'urgent', 'urgent', 'fix', 'term', 'fix', 'ok', 'urgent'] as const
    expect(auditSummary(states.map((state) => ({ state })))).toEqual({ urgent: 3, fix: 4, ok: 1 })
  })

  it('gives zeros for no rows', () => {
    expect(auditSummary([])).toEqual({ urgent: 0, fix: 0, ok: 0 })
  })
})
