import { describe, expect, it } from 'vitest'

import { heroCrumb } from './pageCrumbs'

describe('heroCrumb — the visible crumb, for BreadcrumbList too (SEO etap 1)', () => {
  it('names the blocks with a PageHero; legal pages take their title', () => {
    expect(heroCrumb('swPricing')).toBe('Cennik')
    expect(heroCrumb('swAuditForm')).toBe('Darmowy audyt')
    expect(heroCrumb('swLegal')).toBeNull()
  })

  it('has no crumb for other blocks', () => {
    expect(heroCrumb('swHomeSection')).toBeUndefined()
    expect(heroCrumb(undefined)).toBeUndefined()
  })
})
