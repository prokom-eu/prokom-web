import { describe, expect, it } from 'vitest'

import type { OfferView } from './offer'
import { neighbourOf } from './offerCompare'

const offer = (slug: string, category: string, items: string[] | null): OfferView =>
  ({
    slug,
    category,
    price: items
      ? { kind: 'included', head: { before: 'od', amount: '1', after: 'zł' }, items, more: null }
      : { kind: 'ask', title: 'Zapytaj o wycenę', text: null, note: null },
  }) as unknown as OfferView

const views = {
  a: offer('a', 'strony', ['A1']),
  b: offer('b', 'strony', ['B1']),
  c: offer('c', 'strony', ['C1']),
  x: offer('x', 'systemy', ['X1']),
  app: offer('app', 'aplikacje', null),
  app2: offer('app2', 'aplikacje', null),
}

describe('neighbourOf (OKNO-OFERTY-PREMIUM §2.3 P2)', () => {
  it('takes the next offer of the category in the window’s list, wrapping', () => {
    expect(neighbourOf(views.a, views, ['a', 'x', 'b', 'c'])?.slug).toBe('b')
    expect(neighbourOf(views.c, views, ['a', 'x', 'b', 'c'])?.slug).toBe('a')
  })

  it('outside the list it walks all offers; alone in the category — nothing', () => {
    expect(neighbourOf(views.b, views, ['x'])?.slug).toBe('c')
    expect(neighbourOf(views.x, views, ['a', 'x'])).toBeNull()
    // Alone in a narrowed list, but the category has more offers.
    expect(neighbourOf(views.a, views, ['a', 'x'])?.slug).toBe('b')
  })

  it('offers without „W cenie” points are not compared', () => {
    expect(neighbourOf(views.app, views, ['app', 'app2'])).toBeNull()
  })
})
