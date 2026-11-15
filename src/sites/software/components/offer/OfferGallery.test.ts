import { describe, expect, it } from 'vitest'

import { galleryShots } from './OfferGallery'

describe('galleryShots (offer window gallery, ZMIANY-v24 §6.1)', () => {
  it('a page shows the computer and the phone version of the same variant', () => {
    expect(galleryShots({ kind: 'site', variant: 'pensjonat' })).toEqual([
      { kind: 'site', variant: 'pensjonat', label: 'Komputer' },
      { kind: 'phone', variant: 'pensjonat', label: 'Telefon' },
    ])
  })

  it('a panel, a flow and care are one picture', () => {
    expect(galleryShots({ kind: 'dash', variant: 'crm' })).toHaveLength(1)
    expect(galleryShots({ kind: 'flow', variant: 'ai' })).toHaveLength(1)
    expect(galleryShots({ kind: 'care', variant: null })).toHaveLength(1)
  })
})
