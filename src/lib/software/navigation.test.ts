import { describe, expect, it } from 'vitest'

import nawigacja from '../../../seed/prokomsoftware/nawigacja.json'
import { navigationSchema, validateNavigation } from './navigation'

const clone = () => structuredClone(nawigacja) as Record<string, unknown> & typeof nawigacja

describe('Software navigation schema', () => {
  it('accepts the seed package (v21)', () => {
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

  it('maps the package „zielen” line colour to the main line', () => {
    const value = clone()
    value.footer.lines[0] = { ...value.footer.lines[0], color: 'zielen' }
    const parsed = navigationSchema.parse(value)
    expect(parsed.footer.lines[0]?.color).toBe('prokom')
  })

  it('rejects a colour that is not a PRO-KOM line', () => {
    const value = clone()
    value.footer.lines[0] = { ...value.footer.lines[0], color: '#ff0000' }
    expect(validateNavigation(value)).toMatch(/footer\.lines\.0\.color/)
  })

  it('needs exactly 3 guarantees and 3 footer columns', () => {
    const value = clone()
    value.footer.guarantees = value.footer.guarantees.slice(0, 2)
    expect(validateNavigation(value)).toMatch(/footer\.guarantees/)
    const columns = clone()
    columns.footer.columns = columns.footer.columns.slice(0, 2)
    expect(validateNavigation(columns)).toMatch(/footer\.columns/)
  })

  it('rejects the v20 footer (cross link to Biznes is a line card now)', () => {
    const value = clone()
    value.footer = { ...value.footer, crossLink: ['Biznes', 'https://prokombiznes.pl'] } as never
    expect(validateNavigation(value)).toMatch(/^Nawigacja: footer/)
  })

  it('needs exactly 5 tab bar items', () => {
    const value = clone()
    value.tabBar.items = value.tabBar.items.slice(0, 4)
    expect(validateNavigation(value)).toMatch(/tabBar\.items/)
  })
})
