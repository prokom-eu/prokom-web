import { describe, expect, it } from 'vitest'

import { nextStatusChangedAt } from './status'

const now = new Date('2026-10-17T12:00:00.000Z')
const before = '2026-01-01T00:00:00.000Z'

describe('nextStatusChangedAt', () => {
  it('starts on create', () => {
    expect(
      nextStatusChangedAt({
        operation: 'create',
        status: 'new',
        previousStatus: undefined,
        previousChangedAt: undefined,
        now,
      }),
    ).toBe(now.toISOString())
  })

  it('moves when the status changes', () => {
    expect(
      nextStatusChangedAt({
        operation: 'update',
        status: 'closed',
        previousStatus: 'in_progress',
        previousChangedAt: before,
        now,
      }),
    ).toBe(now.toISOString())
  })

  it('stays when the status is unchanged or not sent', () => {
    for (const status of ['closed', undefined]) {
      expect(
        nextStatusChangedAt({
          operation: 'update',
          status,
          previousStatus: 'closed',
          previousChangedAt: before,
          now,
        }),
      ).toBe(before)
    }
  })
})
