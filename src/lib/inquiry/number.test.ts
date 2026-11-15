import { describe, expect, it } from 'vitest'

import { inquiryNumber } from './number'

describe('inquiryNumber', () => {
  it('builds PREFIX-YEAR-NNNN from the line, the year of creation and the id', () => {
    expect(inquiryNumber({ id: 1, line: 'biznes', createdAt: '2026-10-18T09:00:00Z' })).toBe(
      'PKB-2026-0001',
    )
    expect(inquiryNumber({ id: 42, line: 'instalacje', createdAt: '2026-12-31T10:00:00Z' })).toBe(
      'PKI-2026-0042',
    )
    expect(inquiryNumber({ id: 7, line: 'software', createdAt: '2027-01-02T10:00:00Z' })).toBe(
      'PKS-2027-0007',
    )
    expect(inquiryNumber({ id: 3, line: 'prokom', createdAt: '2026-11-01T10:00:00Z' })).toBe(
      'PK-2026-0003',
    )
  })

  // No yearly reset: the id keeps growing, so a number is never issued twice.
  it('keeps growing past 4 digits instead of wrapping', () => {
    expect(inquiryNumber({ id: 12345, line: 'biznes', createdAt: '2028-03-01T10:00:00Z' })).toBe(
      'PKB-2028-12345',
    )
  })

  // The year is Polish time: 23:30 UTC on 31 December is already 1 January in Poland.
  it('takes the year in Polish time', () => {
    expect(inquiryNumber({ id: 9, line: 'biznes', createdAt: '2026-12-31T23:30:00Z' })).toBe(
      'PKB-2027-0009',
    )
  })
})
