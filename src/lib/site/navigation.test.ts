import { describe, expect, it } from 'vitest'

import type { CatalogGroup, Industry, Partner, SiteSetting } from '@/payload-types'

import { menuItemHrefError, toPublicNavigation } from './navigation'

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
