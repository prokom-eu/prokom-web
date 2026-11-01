import { describe, expect, it } from 'vitest'

import { megaIndustries } from './megaIndustries'

type Link = [string, string]
const card: Link[] = [['Dobierz rozwiązanie', '/dobierz']]
const industry = (n: number): Link[] =>
  Array.from({ length: n }, (_, i) => [`Branża ${i + 1}`, `/dla-branz/b${i + 1}`] as Link)

describe('megaIndustries (SWV8 P1 #11)', () => {
  it('fewer than three industries: no group, each one a link in the offer card', () => {
    expect(megaIndustries(industry(1), card)).toEqual({
      group: [],
      cardLinks: [...card, ['Dla branży: Branża 1', '/dla-branz/b1']],
    })
  })

  it('three or more: the „Dla branż” group as it is, the card unchanged', () => {
    expect(megaIndustries(industry(3), card)).toEqual({ group: industry(3), cardLinks: card })
  })

  it('no industries: nothing added', () => {
    expect(megaIndustries([], card)).toEqual({ group: [], cardLinks: card })
  })
})
