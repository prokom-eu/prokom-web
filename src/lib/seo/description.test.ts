import { describe, expect, it } from 'vitest'

import { META_DESCRIPTION_MAX, metaDescription } from './description'

describe('metaDescription', () => {
  it('keeps a text that fits, with single spaces', () => {
    expect(metaDescription('  Strona   firmowa z panelem. ')).toBe('Strona firmowa z panelem.')
  })

  it('cuts a long text at a word, without trailing punctuation, within the limit', () => {
    const lead =
      'Zlecenia idą SMS-em, godziny są na kartkach, protokoły giną w aucie, a wieczorem wszystko trzeba przepisać. Znamy to z własnych ekip instalacyjnych PRO-KOM.'
    const result = metaDescription(lead)
    expect(result.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
    expect(result).toBe(
      'Zlecenia idą SMS-em, godziny są na kartkach, protokoły giną w aucie, a wieczorem wszystko trzeba przepisać. Znamy to z własnych ekip instalacyjnych…',
    )
    expect(metaDescription('ab, cd ef', 7)).toBe('ab, cd…')
    expect(metaDescription('abcdefghij', 5)).toBe('abcd…')
  })
})
