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
  promoBar: { text: 'Promocja', href: '/promocja', endsAt: '2026-11-30T23:00:00Z' },
}

describe('toPublicCompanyData', () => {
  it('maps the global without internal ids', () => {
    const result = toPublicCompanyData(company, new Date('2026-11-01T00:00:00Z'))
    expect(result?.phones).toEqual([{ label: null, number: '+48 18 000 00 00' }])
    expect(result?.locations[0]?.hours).toEqual([
      { days: ['mon', 'fri'], opens: '08:00', closes: '16:00' },
    ])
    expect(result?.promo).toEqual({ text: 'Promocja', href: '/promocja' })
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
    expect(toPublicSiteSettings(doc)).toEqual({
      phone: '+48 18 111 11 11',
      email: null,
      navigation: [{ label: 'Kontakt', href: '/kontakt' }],
      footer: { text: null, links: [] },
      seo: { titleTemplate: null, description: null },
    })
  })
})
