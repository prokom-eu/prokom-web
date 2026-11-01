import { describe, expect, it } from 'vitest'

import { missingSampleBlocks, SAMPLE_COMPANY } from './sample'

describe('SAMPLE_COMPANY', () => {
  it('has only the Rabka office — no salon in Zakopane (01.11.2026)', () => {
    expect(SAMPLE_COMPANY.locations?.map((l) => l.city)).toEqual(['Rabka-Zdrój'])
    expect(JSON.stringify(SAMPLE_COMPANY)).not.toMatch(/Zakopan/i)
  })
})

describe('missingSampleBlocks', () => {
  const sample = [{ blockType: 'contact' }, { blockType: 'inquiryForm', heading: 'Napisz' }]

  it('returns the sample blocks a page does not have yet', () => {
    expect(missingSampleBlocks([{ blockType: 'contact' }], sample)).toEqual([
      { blockType: 'inquiryForm', heading: 'Napisz' },
    ])
  })

  it('adds nothing to a page that has every block type', () => {
    expect(
      missingSampleBlocks([{ blockType: 'inquiryForm' }, { blockType: 'contact' }], sample),
    ).toEqual([])
  })

  it('treats an empty page as missing everything', () => {
    expect(missingSampleBlocks(null, sample)).toEqual(sample)
  })
})
