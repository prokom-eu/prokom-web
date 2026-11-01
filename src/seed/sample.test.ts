import { describe, expect, it } from 'vitest'

import { SAMPLE_COMPANY } from './sample'

describe('SAMPLE_COMPANY', () => {
  it('has only the Rabka office — no salon in Zakopane (01.11.2026)', () => {
    expect(SAMPLE_COMPANY.locations?.map((l) => l.city)).toEqual(['Rabka-Zdrój'])
    expect(JSON.stringify(SAMPLE_COMPANY)).not.toMatch(/Zakopan/i)
  })
})
