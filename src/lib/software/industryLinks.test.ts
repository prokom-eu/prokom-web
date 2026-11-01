import { describe, expect, it } from 'vitest'

import nawigacja from '../../../seed/prokomsoftware/nawigacja.json'
import { isDeadIndustryHref, withoutIndustryLinks } from './industryLinks'

// SWV6 A1: no menu or footer link may lead to a 404 industry page.

const ACTIVE = new Set(['budownictwo-i-wykonczenia'])

/** Every href in the navigation JSON. */
function hrefs(value: unknown): string[] {
  if (Array.isArray(value)) {
    const own = typeof value[1] === 'string' && value[1].startsWith('/') ? [value[1]] : []
    return [...own, ...value.flatMap(hrefs)]
  }
  if (value && typeof value === 'object') return Object.values(value).flatMap(hrefs)
  return []
}

describe('isDeadIndustryHref', () => {
  it('marks the index and inactive industries, keeps active ones and other pages', () => {
    expect(isDeadIndustryHref('/dla-branz', ACTIVE)).toBe(true)
    expect(isDeadIndustryHref('/dla-branz/gastronomia', ACTIVE)).toBe(true)
    expect(isDeadIndustryHref('/dla-branz/budownictwo-i-wykonczenia', ACTIVE)).toBe(false)
    expect(isDeadIndustryHref('/dla-branz/budownictwo-i-wykonczenia#faq', ACTIVE)).toBe(false)
    expect(isDeadIndustryHref('/dla-branzy', ACTIVE)).toBe(false)
    expect(isDeadIndustryHref('/cennik', ACTIVE)).toBe(false)
  })
})

describe('withoutIndustryLinks', () => {
  const navigation = withoutIndustryLinks(structuredClone(nawigacja), ACTIVE)

  it('leaves no link to the index or an inactive industry anywhere', () => {
    const left = hrefs(navigation).filter((href) => href.startsWith('/dla-branz'))
    expect(left).toEqual(['/dla-branz/budownictwo-i-wykonczenia'])
  })

  it('keeps the mega menu chips of active industries and every other link', () => {
    expect(navigation.mega.branze.links).toEqual([
      ['Budowlanka i ekipy', '/dla-branz/budownictwo-i-wykonczenia'],
    ])
    const before = hrefs(nawigacja).filter((href) => !href.startsWith('/dla-branz'))
    const after = hrefs(navigation).filter((href) => !href.startsWith('/dla-branz'))
    expect(after).toEqual(before)
  })
})
