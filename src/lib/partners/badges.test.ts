import { describe, expect, it } from 'vitest'

import { partnerBadges } from './badges'

describe('partnerBadges', () => {
  it('names each authorized partner and joins the authorized services', () => {
    expect(
      partnerBadges([
        { name: 'GoPOS', status: 'authorized-partner' },
        { name: 'Posnet', status: 'authorized-service' },
        { name: 'InsERT', status: 'authorized-partner' },
        { name: 'Elzab', status: 'authorized-service' },
        { name: 'Comarch', status: 'none' },
      ]),
    ).toEqual([
      { label: 'Autoryzowany partner GoPOS', kind: 'partner' },
      { label: 'Autoryzowany partner InsERT', kind: 'partner' },
      { label: 'Serwis Posnet i Elzab', kind: 'service' },
    ])
  })

  it('lists three or more services with commas', () => {
    expect(
      partnerBadges([
        { name: 'Posnet', status: 'authorized-service' },
        { name: 'Elzab', status: 'authorized-service' },
        { name: 'Fawag', status: 'authorized-service' },
      ]),
    ).toEqual([{ label: 'Serwis Posnet, Elzab i Fawag', kind: 'service' }])
  })

  // Statuses are [SZEF] facts set in the panel; the seed sets none.
  it('shows nothing without confirmed statuses', () => {
    expect(partnerBadges([{ name: 'Posnet', status: 'none' }])).toEqual([])
  })
})
