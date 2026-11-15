import { describe, expect, it } from 'vitest'

import { noBreakParts } from './noBreak'

describe('noBreakParts', () => {
  it('keeps short hyphenated words together', () => {
    expect(noBreakParts('P-4 albo P-5 — dobrane do dokumentów.')).toEqual([
      { text: 'P-4', nowrap: true },
      { text: ' albo ', nowrap: false },
      { text: 'P-5', nowrap: true },
      { text: ' — dobrane do dokumentów.', nowrap: false },
    ])
    expect(noBreakParts('Wi-Fi dla gości')).toEqual([
      { text: 'Wi-Fi', nowrap: true },
      { text: ' dla gości', nowrap: false },
    ])
  })

  it('lets longer compounds, dashes and plain text break as usual', () => {
    expect(noBreakParts('Rabka-Zdrój')).toEqual([{ text: 'Rabka-Zdrój', nowrap: false }])
    expect(noBreakParts('TS-873AeU-4G')).toEqual([{ text: 'TS-873AeU-4G', nowrap: false }])
    expect(noBreakParts('pn–pt 9–17')).toEqual([{ text: 'pn–pt 9–17', nowrap: false }])
    expect(noBreakParts('')).toEqual([])
  })
})
