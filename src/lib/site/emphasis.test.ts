import { describe, expect, it } from 'vitest'

import { splitBold } from './emphasis'

describe('splitBold', () => {
  it('returns plain text as one part', () => {
    expect(splitBold('Ty decydujesz.')).toEqual([{ text: 'Ty decydujesz.', bold: false }])
  })

  it('marks the text between ** as bold', () => {
    expect(splitBold('Jak przegląd auta. **Raport na piśmie.** Ty decydujesz.')).toEqual([
      { text: 'Jak przegląd auta. ', bold: false },
      { text: 'Raport na piśmie.', bold: true },
      { text: ' Ty decydujesz.', bold: false },
    ])
  })

  it('handles several bold parts and bold at the edges', () => {
    expect(splitBold('**A** i **B**')).toEqual([
      { text: 'A', bold: true },
      { text: ' i ', bold: false },
      { text: 'B', bold: true },
    ])
  })

  it('leaves an unclosed ** as text', () => {
    expect(splitBold('5 ** 3 i dalej')).toEqual([{ text: '5 ** 3 i dalej', bold: false }])
  })
})
