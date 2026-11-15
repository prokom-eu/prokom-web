import { describe, expect, it } from 'vitest'

import {
  hasPageGroup,
  PAGE_GROUP_MIN,
  presentSections,
  railHref,
  railIcon,
  sectionsCount,
} from './rail'

// Spec §5.1 (SiteRail): home page sections on every page, „Na tej stronie” from 3 sections.
const sections = [
  { anchorId: 'start', label: 'Start', icon: 'rocket' },
  { anchorId: 'oferta', label: 'Oferta', icon: 'store' },
  { anchorId: 'faq', label: 'Pytania', icon: 'q' },
]

describe('rail helpers', () => {
  it('links a section as an anchor on the home page and as /#id elsewhere', () => {
    expect(railHref('oferta', true)).toBe('#oferta')
    expect(railHref('oferta', false)).toBe('/#oferta')
  })

  it('shows only sections present on the page; all of them before the page is read', () => {
    expect(presentSections(sections, new Set(['start', 'faq'])).map((s) => s.anchorId)).toEqual([
      'start',
      'faq',
    ])
    expect(presentSections(sections, null)).toHaveLength(3)
  })

  it('gives a subpage its own group from 3 marked sections', () => {
    const page = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ id: `s${i}`, label: `S${i}`, icon: null }))
    expect(PAGE_GROUP_MIN).toBe(3)
    expect(hasPageGroup(page(2))).toBe(false)
    expect(hasPageGroup(page(3))).toBe(true)
  })

  it('falls back to a plain icon for an unknown name from the panel', () => {
    expect(railIcon('rocket')).toBe('rocket')
    expect(railIcon('rakieta')).toBe('doc')
    expect(railIcon(null)).toBe('doc')
  })

  it('counts sections in Polish', () => {
    expect([1, 3, 5, 10, 12, 22, 24].map(sectionsCount)).toEqual([
      '1 sekcja',
      '3 sekcje',
      '5 sekcji',
      '10 sekcji',
      '12 sekcji',
      '22 sekcje',
      '24 sekcje',
    ])
  })
})
