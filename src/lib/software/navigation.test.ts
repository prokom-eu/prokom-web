import { describe, expect, it } from 'vitest'

import nawigacja from '../../../seed/prokomsoftware/nawigacja.json'
import { navigationSchema, validateNavigation } from './navigation'

const clone = () => structuredClone(nawigacja) as Record<string, unknown> & typeof nawigacja

describe('Software navigation schema', () => {
  it('accepts the seed package (v20)', () => {
    expect(navigationSchema.safeParse(nawigacja).error?.issues).toBeUndefined()
    expect(validateNavigation(nawigacja)).toBe(true)
  })

  it('accepts an empty field', () => {
    expect(validateNavigation(null)).toBe(true)
  })

  it('rejects a mistyped key instead of dropping it', () => {
    const value = clone()
    value.headerRight = { ...value.headerRight, ctaa: value.headerRight.cta } as never
    expect(validateNavigation(value)).toMatch(/^Nawigacja: headerRight/)
  })

  it('rejects a link that is not a path, anchor, https, mailto or tel', () => {
    const value = clone()
    value.tabBar.items[0] = ['Start', 'javascript:alert(1)']
    expect(validateNavigation(value)).toMatch(/tabBar\.items\.0\.1/)
  })

  it('keeps the phone out of the navigation', () => {
    const value = clone()
    value.mobileMenuFooter = { ...value.mobileMenuFooter, phone: '+48 600 000 000' as never }
    expect(validateNavigation(value)).toMatch(/mobileMenuFooter\.phone/)
  })

  it('needs exactly 5 tab bar items', () => {
    const value = clone()
    value.tabBar.items = value.tabBar.items.slice(0, 4)
    expect(validateNavigation(value)).toMatch(/tabBar\.items/)
  })
})
