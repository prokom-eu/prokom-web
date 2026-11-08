import { describe, expect, it } from 'vitest'

import nawigacja from '../../../seed/prokomsoftware/nawigacja.json'
import { isV23Navigation, navigationSchema, validateNavigation } from './navigation'

const clone = () => structuredClone(nawigacja) as Record<string, unknown> & typeof nawigacja

/** A navigation saved before SWA5: the v23 frame's keys around the v24 menu. */
const v23 = () => ({
  ...clone(),
  headerRight: {
    themeToggle: true,
    projectDrawer: true,
    cta: { label: 'Bezpłatna wycena', href: '/kontakt', homeHref: '#kontakt' },
  },
  mega: { ...clone().mega, branze: { label: 'Dla branż', links: [] } },
  footer: { about: 'Stopka v23' },
  tabBar: { items: [] },
  headerMobile: { cta: ['Wycena', '/kontakt'] },
  mobileMenu: {},
  mobileMenuFooter: {},
  projectPill: 'Projekt ({n})',
})

describe('Software navigation schema (v24, SWA5)', () => {
  it('accepts the seed package', () => {
    expect(navigationSchema.safeParse(nawigacja).error?.issues).toBeUndefined()
    expect(validateNavigation(nawigacja)).toBe(true)
  })

  it('accepts an empty field', () => {
    expect(validateNavigation(null)).toBe(true)
  })

  it('rejects a mistyped key instead of dropping it', () => {
    const value = clone()
    value.headerRight = { ...value.headerRight, themeToogle: true } as never
    expect(validateNavigation(value)).toMatch(/^Nawigacja: headerRight/)
  })

  it('rejects a link that is not a path, anchor, https, mailto or tel', () => {
    const value = clone()
    value.mega.card.links[0] = ['Kreator', 'javascript:alert(1)']
    expect(validateNavigation(value)).toMatch(/mega\.card\.links\.0\.1/)
  })

  it('a navigation saved before SWA5 still works: the v23 frame’s keys are dropped', () => {
    expect(isV23Navigation(v23())).toBe(true)
    expect(isV23Navigation(nawigacja)).toBe(false)
    const parsed = navigationSchema.parse(v23())
    expect(parsed).not.toHaveProperty('footer')
    expect(parsed.mega).not.toHaveProperty('branze')
    expect(parsed.headerRight).toEqual({
      themeToggle: true,
      projectDrawer: true,
      ctaHomeHref: '#kontakt',
    })
  })

  it('…but an unknown key next to them is still an error', () => {
    expect(validateNavigation({ ...v23(), stopka: {} })).toMatch(/^Nawigacja/)
  })

  it('the start band is optional', () => {
    const value: Record<string, unknown> = clone()
    delete value.startBand
    expect(validateNavigation(value)).toBe(true)
  })
})
