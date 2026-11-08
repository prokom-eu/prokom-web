import { describe, expect, it } from 'vitest'

import { PROCUREMENT_LINKS, procurementLinksUpdate } from './procurementLinks'

describe('procurementLinksUpdate (plan 0611 §6.4)', () => {
  it('fills an empty group with the texts of the plan', () => {
    expect(procurementLinksUpdate(undefined)).toEqual(PROCUREMENT_LINKS)
    expect(PROCUREMENT_LINKS.itCategories).toEqual([
      'laptopy',
      'komputery',
      'monitory',
      'stacje-dokujace',
    ])
    expect(PROCUREMENT_LINKS.searchAgd).toContain('lodówka')
    expect(PROCUREMENT_LINKS.searchIt).toContain('dostawa laptopów')
  })

  it('keeps every field edited in the panel and fills only the empty ones', () => {
    const update = procurementLinksUpdate({
      categoryBand: 'Własny tekst',
      itCategories: [],
      industryTiles: [{ industry: 'noclegi', page: 'agd', title: 'Mój kafel' }],
      searchAgd: ['agd'],
    })
    expect(update?.categoryBand).toBe('Własny tekst')
    expect(update?.itCategories).toEqual(PROCUREMENT_LINKS.itCategories)
    expect(update?.industryTiles).toEqual([
      { industry: 'noclegi', page: 'agd', title: 'Mój kafel' },
    ])
    expect(update?.searchAgd).toEqual(['agd'])
    expect(update?.productLink).toBe(PROCUREMENT_LINKS.productLink)
  })

  it('a filled group → nothing to write (second run unchanged)', () => {
    expect(procurementLinksUpdate(PROCUREMENT_LINKS)).toBeNull()
  })
})
