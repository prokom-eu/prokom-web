import { describe, expect, it } from 'vitest'

import type { CatalogGroup, Industry, Partner, SiteSetting } from '@/payload-types'

import {
  duplicateDropdownError,
  menuItemHrefError,
  type PublicBiznesNavigation,
  toPublicNavigation,
  withoutEmptyDropdowns,
} from './navigation'

describe('menuItemHrefError', () => {
  it('requires a valid link for a plain menu item', () => {
    expect(menuItemHrefError('link', '/opieka-it')).toBeNull()
    expect(menuItemHrefError('link', undefined)).not.toBeNull()
    expect(menuItemHrefError('link', 'javascript:alert(1)')).not.toBeNull()
  })

  it('needs no link for the dropdowns, but rejects an invalid one', () => {
    expect(menuItemHrefError('offer', undefined)).toBeNull()
    expect(menuItemHrefError('industries', '')).toBeNull()
    expect(menuItemHrefError('offer', '/oferta')).toBeNull()
    expect(menuItemHrefError('industries', '//evil.test')).not.toBeNull()
  })
})

type Navigation = NonNullable<NonNullable<SiteSetting['biznes']>['navigation']>

const OWN = 1
const OTHER = 2
const group = (slug: string, tenant: number) => ({ id: tenant * 10, slug, tenant }) as CatalogGroup
const industry = (slug: string, tenant: number, active = true) =>
  ({ id: tenant * 100, slug, name: slug, tenant, active }) as Industry
const partner = (tenants: number[]) =>
  ({
    id: 5,
    name: 'GoPOS',
    tenants,
    url: '/api/partners/file/gopos.webp',
    width: 200,
    height: 60,
  }) as Partner

describe('toPublicNavigation', () => {
  it('fills defaults without data', () => {
    expect(toPublicNavigation(undefined, OWN)).toEqual({
      menu: [],
      shortcuts: [],
      columnLimit: 6,
      highlights: [],
      cards: [],
      industries: [],
    })
  })

  it('keeps the menu order and drops items with an invalid link', () => {
    const navigation: Navigation = {
      menu: [
        { type: 'offer', label: 'Oferta' },
        { type: 'link', label: 'Opieka IT', href: '/opieka-it' },
        { type: 'link', label: 'Zły', href: 'javascript:alert(1)' },
        { type: 'link', label: 'GoPOS', href: '/gopos', partner: true },
      ],
    }
    expect(toPublicNavigation(navigation, OWN).menu).toEqual([
      { type: 'offer', label: 'Oferta', href: null, partner: false },
      { type: 'link', label: 'Opieka IT', href: '/opieka-it', partner: false },
      { type: 'link', label: 'GoPOS', href: '/gopos', partner: true },
    ])
  })

  // Read with `overrideAccess`: a record of another site must never reach this header.
  it('drops groups, industries and partner logos of another tenant', () => {
    const navigation: Navigation = {
      highlights: [
        { group: group('oprogramowanie', OWN), label: 'GoPOS', href: '/gopos', badge: 'partner' },
        { group: group('obca', OTHER), label: 'Obca', href: '/obca' },
        { group: 7, label: 'Bez populacji', href: '/x' },
      ],
      industries: [
        { industry: industry('gastronomia', OWN), description: 'restauracje' },
        { industry: industry('obca', OTHER) },
      ],
      cards: [
        { title: 'GoPOS', href: '/gopos', partner: partner([OWN]) },
        { title: 'Obcy', href: '/x', partner: partner([OTHER]) },
      ],
    }
    const result = toPublicNavigation(navigation, OWN)
    expect(result.highlights).toEqual([
      { group: 'oprogramowanie', label: 'GoPOS', href: '/gopos', badge: 'partner' },
    ])
    expect(result.industries).toEqual([
      { slug: 'gastronomia', name: 'gastronomia', description: 'restauracje', image: null },
    ])
    expect(result.cards[0]?.logo?.alt).toBe('Logo GoPOS')
    expect(result.cards[1]?.logo).toBeNull()
  })

  it('leaves inactive industries out of the cards (they show as "Wkrótce")', () => {
    const navigation: Navigation = { industries: [{ industry: industry('beauty', OWN, false) }] }
    expect(toPublicNavigation(navigation, OWN).industries).toEqual([])
  })
})

describe('duplicateDropdownError', () => {
  it('allows each dropdown once and any number of links', () => {
    expect(duplicateDropdownError(['offer', 'link', 'industries', 'link'])).toBeNull()
  })

  it('rejects a second Oferta ▾ or Branże ▾', () => {
    expect(duplicateDropdownError(['offer', 'link', 'offer'])).not.toBeNull()
    expect(duplicateDropdownError(['industries', 'industries'])).not.toBeNull()
  })
})

describe('toPublicNavigation — duplicates', () => {
  // Read with `overrideAccess`: data saved past the validation must not render twice.
  it('keeps only the first dropdown of each kind', () => {
    const navigation: Navigation = {
      menu: [
        { type: 'offer', label: 'Oferta' },
        { type: 'offer', label: 'Oferta 2' },
        { type: 'industries', label: 'Branże' },
        { type: 'industries', label: 'Branże 2' },
      ],
    }
    expect(toPublicNavigation(navigation, OWN).menu.map((item) => item.label)).toEqual([
      'Oferta',
      'Branże',
    ])
  })
})

describe('withoutEmptyDropdowns', () => {
  const menu: PublicBiznesNavigation['menu'] = [
    { type: 'offer', label: 'Oferta', href: null, partner: false },
    { type: 'industries', label: 'Branże', href: null, partner: false },
    { type: 'link', label: 'Kontakt', href: '/kontakt', partner: false },
  ]

  it('keeps dropdowns that have content', () => {
    expect(withoutEmptyDropdowns(menu, { offer: true, industries: true })).toEqual(menu)
  })

  // Empty catalog or no industries yet (e.g. staging before the import).
  it('turns an empty Oferta ▾ into a link and drops an empty Branże ▾', () => {
    expect(withoutEmptyDropdowns(menu, { offer: false, industries: false })).toEqual([
      { type: 'link', label: 'Oferta', href: '/oferta', partner: false },
      { type: 'link', label: 'Kontakt', href: '/kontakt', partner: false },
    ])
  })
})
