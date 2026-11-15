import { describe, expect, it } from 'vitest'

import { railAway } from './railAway'

describe('railAway (AUDYT po SWA7 #4)', () => {
  it('steps aside once the footer or the band reaches the rail', () => {
    expect(railAway({ railBottom: 700, targetTops: [690], scrolled: true })).toBe(true)
    expect(railAway({ railBottom: 700, targetTops: [1400, 650], scrolled: true })).toBe(true)
  })

  it('stays while the footer is still below the rail (with a small gap)', () => {
    expect(railAway({ railBottom: 700, targetTops: [740], scrolled: true })).toBe(false)
    expect(railAway({ railBottom: 700, targetTops: [710], scrolled: true })).toBe(true)
  })

  it('stays on a short page that has not been scrolled — the rail is its navigation', () => {
    expect(railAway({ railBottom: 700, targetTops: [500], scrolled: false })).toBe(false)
  })

  it('stays without a footer or band on the page', () => {
    expect(railAway({ railBottom: 700, targetTops: [], scrolled: true })).toBe(false)
  })
})
