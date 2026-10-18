import { describe, expect, it } from 'vitest'

import type { CompanyDatum, SiteSetting } from '@/payload-types'

import { toPublicCompanyData, toPublicSiteSettings } from './public'

const company: CompanyDatum = {
  id: 1,
  name: 'PRO-KOM',
  nip: '1234563218',
  email: 'biuro@example.test',
  phones: [{ id: 'a', number: '+48 18 000 00 00' }],
  locations: [
    {
      id: 'b',
      name: 'Rabka-Zdrój',
      street: 'ul. Przykładowa 1',
      postalCode: '34-700',
      city: 'Rabka-Zdrój',
      hours: [{ id: 'c', days: ['mon', 'fri'], opens: '08:00', closes: '16:00' }],
    },
  ],
  promoBar: {
    text: 'Promocja',
    href: '/promocja',
    endsAt: '2026-11-30T23:00:00Z',
    campaignId: 'kasy-2026',
    lines: ['biznes'],
  },
}

describe('toPublicCompanyData', () => {
  it('maps the global without internal ids', () => {
    const result = toPublicCompanyData(company, new Date('2026-11-01T00:00:00Z'))
    expect(result?.phones).toEqual([{ label: null, number: '+48 18 000 00 00' }])
    expect(result?.locations[0]?.hours).toEqual([
      { days: ['mon', 'fri'], opens: '08:00', closes: '16:00' },
    ])
    expect(result?.promo).toEqual({
      text: 'Promocja',
      href: '/promocja',
      campaignId: 'kasy-2026',
      lines: ['biznes'],
    })
  })

  it('fills a promo bar without campaign or lines (all lines)', () => {
    const plain = { ...company, promoBar: { text: 'Promocja' } }
    expect(toPublicCompanyData(plain, new Date())?.promo).toEqual({
      text: 'Promocja',
      href: null,
      campaignId: null,
      lines: [],
    })
  })

  it('hides an expired promo bar', () => {
    expect(toPublicCompanyData(company, new Date('2026-12-01T00:00:00Z'))?.promo).toBeNull()
  })

  it('returns null for a global that was never saved', () => {
    const empty = { id: 1, phones: [], locations: [] } as unknown as CompanyDatum
    expect(toPublicCompanyData(empty, new Date())).toBeNull()
  })
})

describe('toPublicSiteSettings', () => {
  it('drops the tenant and ids, fills missing parts', () => {
    const doc: SiteSetting = {
      id: 7,
      tenant: 3,
      phone: '+48 18 111 11 11',
      navigation: [{ id: 'x', label: 'Kontakt', href: '/kontakt' }],
      updatedAt: '',
      createdAt: '',
    }
    expect(toPublicSiteSettings(doc, 'instalacje')).toEqual({
      phone: '+48 18 111 11 11',
      email: null,
      navigation: [{ label: 'Kontakt', href: '/kontakt' }],
      footer: { text: null, links: [] },
      seo: { titleTemplate: null, description: null, ogImage: null },
      biznes: null,
    })
  })

  const biznes: SiteSetting['biznes'] = {
    contactChannels: [
      { id: 'k', department: 'fiscal', phone: '+48 18 222 22 22', showInFooter: true },
    ],
    whatsapp: '+48 889 003 889',
    serviceAreas: ['Rabka-Zdrój', 'Nowy Targ'],
    promises: { callbackTime: 'Oddzwonimy w 60 minut' },
    showReviews: true,
  }
  const base = { id: 8, tenant: 1, updatedAt: '', createdAt: '' }

  it('maps the Biznes data on the Biznes line', () => {
    expect(toPublicSiteSettings({ ...base, line: 'biznes', biznes }, 'biznes').biznes).toEqual({
      contactChannels: [
        {
          department: 'fiscal',
          phone: '+48 18 222 22 22',
          email: null,
          hours: null,
          showInFooter: true,
        },
      ],
      whatsapp: '+48 889 003 889',
      trustLine: null,
      serviceAreas: ['Rabka-Zdrój', 'Nowy Targ'],
      promises: {
        callbackTime: 'Oddzwonimy w 60 minut',
        itReview: null,
        includedWithRegister: null,
        serviceTakeover: null,
      },
      showReviews: true,
      showClientLogos: false,
      navigation: {
        menu: [],
        shortcuts: [],
        columnLimit: 6,
        highlights: [],
        cards: [],
        industries: [],
      },
    })
  })

  // ADR-012, rozstrzygnięcie 2: the Biznes fields never leave the Biznes line, even when
  // someone stored them on another line's settings through the API.
  it.each(['instalacje', 'software', 'prokom', null] as const)(
    'drops the Biznes data on line %s',
    (line) => {
      expect(toPublicSiteSettings({ ...base, line: 'biznes', biznes }, line).biznes).toBeNull()
    },
  )

  // The tenant's own line decides, never the copy in the document (panel only): it may be
  // stale after the tenant's line was changed.
  it('ignores a stale copy of the line in the document', () => {
    expect(
      toPublicSiteSettings({ ...base, line: 'software', biznes }, 'biznes').biznes,
    ).not.toBeNull()
    expect(toPublicSiteSettings({ ...base, line: 'biznes', biznes }, 'software').biznes).toBeNull()
  })
})
