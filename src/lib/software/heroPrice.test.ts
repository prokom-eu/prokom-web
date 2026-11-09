import { describe, expect, it } from 'vitest'

import { heroHead } from './heroPrice'

describe('heroHead (OKNO-OFERTY-PREMIUM §2.1)', () => {
  it('moves „zł” into the big number, „netto” stays small', () => {
    expect(heroHead({ before: 'od', amount: '999', after: 'zł netto' })).toEqual({
      before: 'od',
      amount: '999 zł',
      after: 'netto',
    })
  })

  it('handles „zł” alone and leaves other heads as they are', () => {
    expect(heroHead({ before: '', amount: '0', after: 'zł' })).toEqual({
      before: '',
      amount: '0 zł',
      after: '',
    })
    const ask = { before: '', amount: 'Zapytaj o wycenę', after: '' }
    expect(heroHead(ask)).toBe(ask)
    const done = { before: 'od', amount: '999 zł', after: 'netto' }
    expect(heroHead(done)).toBe(done)
  })
})
