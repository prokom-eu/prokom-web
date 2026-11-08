import { describe, expect, it } from 'vitest'

import { byNewest, publishWithoutConsent, withPhotos } from './realizations'

describe('publishWithoutConsent', () => {
  it('refuses publishing without the client consent', () => {
    expect(publishWithoutConsent({ _status: 'published', clientConsent: false })).toBe(true)
    expect(publishWithoutConsent({ _status: 'published' })).toBe(true)
  })

  it('allows publishing with the consent', () => {
    expect(publishWithoutConsent({ _status: 'published', clientConsent: true })).toBe(false)
  })

  it('allows drafts without the consent', () => {
    expect(publishWithoutConsent({ _status: 'draft', clientConsent: false })).toBe(false)
    expect(publishWithoutConsent({ clientConsent: false })).toBe(false)
  })

  it('takes the consent of the stored document when the save does not send it', () => {
    expect(publishWithoutConsent({ _status: 'published' }, { clientConsent: true })).toBe(false)
  })

  it('refuses unticking the consent of a published realization', () => {
    expect(
      publishWithoutConsent(
        { _status: 'published', clientConsent: false },
        { _status: 'published', clientConsent: true },
      ),
    ).toBe(true)
  })

  it('takes the status of the stored document when the save does not send it', () => {
    expect(
      publishWithoutConsent(
        { clientConsent: false },
        { _status: 'published', clientConsent: true },
      ),
    ).toBe(true)
    expect(
      publishWithoutConsent({ clientConsent: false }, { _status: 'draft', clientConsent: true }),
    ).toBe(false)
  })
})

describe('byNewest (review of PR 4: PostgreSQL puts an empty year first in a descending sort)', () => {
  it('newest year first, no year last, then the package order', () => {
    const items = [
      { legacyId: 3, year: null },
      { legacyId: 1, year: 2016 },
      { legacyId: 4, year: 2017 },
      { legacyId: 2, year: 2016 },
      { legacyId: 5, year: null },
    ]
    expect([...items].sort(byNewest).map((r) => r.legacyId)).toEqual([4, 1, 2, 3, 5])
  })
})

describe('withPhotos (runda v6 D2: a realization without a photo is not shown anywhere)', () => {
  it('keeps the cards with at least one photo, in their order', () => {
    const cards = [
      { id: 1, photos: [{ alt: 'a' }] },
      { id: 2, photos: [] },
      { id: 3, photos: [{ alt: 'b' }, { alt: 'c' }] },
    ]
    expect(withPhotos(cards).map((c) => c.id)).toEqual([1, 3])
  })

  it('an empty list stays empty', () => {
    expect(withPhotos([])).toEqual([])
  })
})
