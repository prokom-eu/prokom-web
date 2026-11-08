import { describe, expect, it } from 'vitest'

import { pageCrumbs } from './crumbs'

const page = (layout: unknown[]) => ({ slug: 'ksef', title: 'KSeF', layout })

describe('pageCrumbs (BIZ-3 §10.2: BreadcrumbList like the visible crumbs)', () => {
  it('is Strona główna / page without a trail', () => {
    expect(pageCrumbs(page([{ blockType: 'bzContactPage' }]))).toEqual([
      { name: 'Strona główna', href: '/' },
      { name: 'KSeF', href: '/ksef' },
    ])
  })

  it('puts the middle items of the hero (first block) before the page', () => {
    const layout = [
      { blockType: 'bzSection', data: { trail: [{ name: 'Oferta', href: '/oferta' }] } },
      { blockType: 'bzSection', data: { trail: [{ name: 'Inne', href: '/inne' }] } },
    ]
    const later = [{ blockType: 'bzSection', data: {} }, ...layout]
    expect(pageCrumbs(page(later))).toHaveLength(2)
    expect(pageCrumbs(page(layout)).map((crumb) => crumb.name)).toEqual([
      'Strona główna',
      'Oferta',
      'KSeF',
    ])
  })

  it('skips a malformed trail and has no crumbs on the home page', () => {
    const layout = [{ blockType: 'bzSection', data: { trail: [{ name: 1 }, 'x'] } }]
    expect(pageCrumbs(page(layout))).toHaveLength(2)
    expect(pageCrumbs({ ...page([]), slug: 'home' })).toEqual([])
    expect(pageCrumbs(page([{ blockType: 'bzProcurementPage' }]))).toEqual([])
  })
})
