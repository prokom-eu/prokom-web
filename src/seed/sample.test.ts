import { describe, expect, it } from 'vitest'

import { missingSampleBlocks } from './sample'

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
