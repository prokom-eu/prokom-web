import { describe, expect, it } from 'vitest'

import { handoffHref, parseHandoff } from './handoff'

const TYPES = [{ slug: 'kawalerka' }, { slug: 'mieszkanie' }, { slug: 'pokoj' }]

describe('parseHandoff (?typ=&n=, ZAOPATRZENIE §3)', () => {
  it('reads a known type and a count', () => {
    expect(parseHandoff(new URLSearchParams('typ=pokoj&n=30'), TYPES)).toEqual({
      type: 2,
      count: 30,
    })
  })

  it('returns null without either parameter (no scroll, defaults stay)', () => {
    expect(parseHandoff(new URLSearchParams(''), TYPES)).toBeNull()
    expect(parseHandoff(new URLSearchParams('utm_source=x'), TYPES)).toBeNull()
  })

  it('keeps defaults for an unknown type or a count that is not a whole number', () => {
    expect(parseHandoff(new URLSearchParams('typ=willa&n=abc'), TYPES)).toEqual({
      type: null,
      count: null,
    })
    expect(parseHandoff(new URLSearchParams('n=2.5'), TYPES)).toEqual({ type: null, count: null })
  })

  it('keeps the default count for an empty n or a number written otherwise than in digits', () => {
    expect(parseHandoff(new URLSearchParams('typ=pokoj&n='), TYPES)).toEqual({
      type: 2,
      count: null,
    })
    expect(parseHandoff(new URLSearchParams('n=1e2'), TYPES)?.count).toBeNull()
    expect(parseHandoff(new URLSearchParams('n=0x10'), TYPES)?.count).toBeNull()
  })

  it('clamps the count to 1–500', () => {
    expect(parseHandoff(new URLSearchParams('n=0'), TYPES)?.count).toBe(1)
    expect(parseHandoff(new URLSearchParams('n=9999'), TYPES)?.count).toBe(500)
  })

  it('ignores case and spaces of the type', () => {
    expect(parseHandoff(new URLSearchParams('typ=%20Mieszkanie%20'), TYPES)?.type).toBe(1)
  })
})

describe('handoffHref', () => {
  it('builds the link of the home page card', () => {
    expect(handoffHref('agd-rtv-dla-firm', 'kawalerka', 12)).toBe(
      '/agd-rtv-dla-firm?typ=kawalerka&n=12#zestaw',
    )
  })
})
