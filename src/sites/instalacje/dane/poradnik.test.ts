import { describe, expect, it } from 'vitest'

import { GUIDE_ANSWERS, GUIDE_CATEGORIES, GUIDE_EXTRAS, minutesWord } from './poradnik'
import { solutionsWord } from './oferta'

describe('Polish plurals', () => {
  it('reading minutes', () => {
    expect([1, 2, 4, 5, 7, 12, 22, 25].map(minutesWord)).toEqual([
      'minuta',
      'minuty',
      'minuty',
      'minut',
      'minut',
      'minut',
      'minuty',
      'minut',
    ])
  })

  it('offer solutions', () => {
    expect([1, 3, 76, 112].map(solutionsWord)).toEqual([
      'rozwiązanie',
      'rozwiązania',
      'rozwiązań',
      'rozwiązań',
    ])
  })
})

describe('guide data', () => {
  it('cards use the categories of the chips and lead to a page of the line', () => {
    const keys = new Set(GUIDE_CATEGORIES.map((c) => c.key))
    for (const a of GUIDE_ANSWERS) {
      expect(keys.has(a.category)).toBe(true)
      expect(a.href).toMatch(/^\/[a-z-]+#[a-z-]+$/)
    }
  })

  it('the RODO post has its widgets and no boss markers', () => {
    const rodo = GUIDE_EXTRAS['monitoring-a-rodo']
    expect(rodo?.quiz?.items).toHaveLength(7)
    expect(JSON.stringify(GUIDE_EXTRAS)).not.toMatch(/\[SZEF|\[CENA/)
  })
})
