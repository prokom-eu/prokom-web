import { describe, expect, it } from 'vitest'

import { isLiveHref, pruneDeadLinks } from './deadLinks'
import type { ProcurementPageData } from './schema'

const site = {
  categories: new Set(['kasy-fiskalne', 'siec-wifi']),
  industries: new Set(['noclegi']),
}

describe('isLiveHref (QA BIZ-3: 7 links of the procurement pages answered 404)', () => {
  it('checks categories and active industries; anchors, other pages and outside links live', () => {
    expect(isLiveHref('/oferta/siec', site)).toBe(false)
    expect(isLiveHref('/oferta/kasy-fiskalne', site)).toBe(true)
    expect(isLiveHref('/oferta/kasy-fiskalne/mobilne?marka=x', site)).toBe(true)
    expect(isLiveHref('/branze/biura-uslugi', site)).toBe(false)
    expect(isLiveHref('/branze/noclegi#zestaw', site)).toBe(true)
    for (const href of ['/kontakt', '#zestaw', 'https://gopos.pl', '/oferta?marka=hp', '/oferta']) {
      expect(isLiveHref(href, site), href).toBe(true)
    }
  })
})

describe('pruneDeadLinks', () => {
  const data = {
    categories: {
      list: [
        { name: 'MFP', category: 'mfp' },
        { name: 'Sieć', category: 'siec-wifi' },
      ],
    },
    industries: {
      list: [
        { name: 'Biura', href: '/branze/biura-uslugi' },
        { name: 'Hotele', href: '/branze/noclegi' },
      ],
    },
    combo: {
      list: [{ title: 'Wi-Fi', href: '/oferta/siec' }],
      // A required link stays even when its target is gone: it never renders without an address.
      link: { label: 'Zobacz branżę', href: '/branze/nieaktywna' },
    },
    hero: { action: { label: 'Zapytaj', href: '/oferta/nie-ma' } },
  } as unknown as ProcurementPageData

  it('drops optional tile links to missing targets, never a required one', () => {
    const pruned = pruneDeadLinks(data, site) as unknown as typeof data & {
      categories: { list: { category?: string }[] }
      industries: { list: { href?: string }[] }
      combo: { list: { href?: string }[]; link: { href: string } }
      hero: { action: { href: string } }
    }
    expect(pruned.categories.list.map((item) => item.category)).toEqual([undefined, 'siec-wifi'])
    expect(pruned.industries.list.map((item) => item.href)).toEqual([undefined, '/branze/noclegi'])
    expect(pruned.combo.list[0]!.href).toBeUndefined()
    expect(pruned.combo.link.href).toBe('/branze/nieaktywna')
    expect(pruned.hero.action.href).toBe('/oferta/nie-ma')
  })
})
