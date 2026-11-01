import { describe, expect, it } from 'vitest'

import type { Industry, Media } from '@/payload-types'

import type { CatalogIndex, IndexProduct } from './catalogIndex'
import { buildIndustryView, industryProducts, otherIndustries, wizardHref } from './industry'

const product = (slug: string, fields: Partial<IndexProduct> = {}): IndexProduct => ({
  slug,
  name: slug.toUpperCase(),
  brand: null,
  kind: 'device',
  categories: ['kasy-fiskalne'],
  group: 'sprzedaz',
  industries: [],
  features: [],
  isNew: false,
  authorized: false,
  popularity: 50,
  registerTypes: [],
  hay: slug,
  ...fields,
})

const index = (fields: Partial<CatalogIndex> = {}): CatalogIndex => ({
  products: [],
  brands: [],
  categories: [],
  groups: [],
  industries: [],
  pages: [],
  search: { synonyms: {}, stopWords: [], popular: [] },
  ...fields,
})

const industry = (fields: Partial<Industry> = {}): Industry => ({
  id: 1,
  tenant: 1,
  name: 'Gastronomia',
  slug: 'gastronomia',
  active: true,
  wizardBusinessType: 'gastro',
  updatedAt: '',
  createdAt: '',
  ...fields,
})

describe('wizardHref', () => {
  it('opens the wizard with the business type of the industry (ADR-012 rozstrz. 8)', () => {
    expect(wizardHref('gastro')).toBe('/konfigurator?firma=gastro')
    expect(wizardHref(null)).toBe('/konfigurator')
  })
})

describe('industryProducts', () => {
  const catalog = index({
    products: [
      product('gopos', { industries: ['gastronomia'] }),
      product('hx', { industries: ['gastronomia', 'handel'] }),
      product('neo', { industries: ['handel'] }),
      product('d3'),
    ],
  })

  it('keeps the panel order of the featured products, listed ones only, without repeats', () => {
    expect(
      industryProducts(catalog, 'gastronomia', ['d3', 'szkic', 'gopos', 'd3']).featured.map(
        (item) => item.slug,
      ),
    ).toEqual(['d3', 'gopos'])
  })

  it('counts the catalog positions marked for the industry', () => {
    expect(industryProducts(catalog, 'gastronomia', []).total).toBe(2)
  })
})

describe('otherIndustries', () => {
  const catalog = index({
    industries: [
      { slug: 'gastronomia', name: 'Gastronomia', active: true },
      { slug: 'handel', name: 'Handel i sklepy', active: true },
      { slug: 'noclegi', name: 'Hotele i pensjonaty', active: true },
      { slug: 'biura-uslugi', name: 'Biura i usługi', active: false },
      { slug: 'beauty', name: 'Beauty i usługi', active: false },
    ],
  })

  it('links the active industries (marking this one) and names the rest as „Wkrótce”', () => {
    expect(otherIndustries(catalog, 'handel')).toEqual({
      active: [
        { slug: 'gastronomia', name: 'Gastronomia', href: '/branze/gastronomia', current: false },
        { slug: 'handel', name: 'Handel i sklepy', href: '/branze/handel', current: true },
        { slug: 'noclegi', name: 'Hotele i pensjonaty', href: '/branze/noclegi', current: false },
      ],
      soon: ['Biura i usługi', 'Beauty i usługi'],
    })
  })
})

describe('buildIndustryView', () => {
  it('falls back to the name, a general call to action and hides empty sections', () => {
    const view = buildIndustryView(industry(), 1)
    expect(view.title).toBe('Gastronomia')
    expect(view.cta).toEqual({ label: 'Przygotuj zapytanie', href: '/konfigurator?firma=gastro' })
    expect(view.day).toBeNull()
    expect(view.flow).toBeNull()
    expect(view.faq.title).toBe('Zanim zdecydujesz')
    expect(view.contact.heading).toBeTruthy()
  })

  it('builds the day line from 2+ steps with a heading, and the flow from its heading', () => {
    const view = buildIndustryView(
      industry({
        hero: { ctaLabel: 'Przygotuj zapytanie dla lokalu', chips: ['KSeF z systemu', ' '] },
        day: {
          eyebrow: 'Dzień w lokalu',
          heading: 'Od otwarcia do raportu dobowego.',
          steps: [
            { label: '11:00', title: 'Otwarcie' },
            { label: '23:00', title: 'Zamknięcie' },
          ],
        },
        flow: { heading: 'Restauracja, która nie gubi zamówień.', steps: [] },
      }),
      1,
    )
    expect(view.cta.label).toBe('Przygotuj zapytanie dla lokalu')
    expect(view.chips).toEqual(['KSeF z systemu'])
    expect(view.day).toMatchObject({
      blockType: 'bzTimeline',
      heading: 'Od otwarcia do raportu dobowego.',
    })
    expect(view.day?.steps).toHaveLength(2)
    expect(view.flow).toMatchObject({ blockType: 'bzOrderFlow' })
    expect(
      buildIndustryView(industry({ day: { heading: 'X', steps: [{ title: 'Jeden' }] } }), 1).day,
    ).toBeNull()
  })

  it('keeps only a public picture of this tenant and products of this tenant', () => {
    const image: Partial<Media> = {
      alt: 'Zestaw',
      url: '/media/zestaw.webp',
      width: 1200,
      height: 800,
      tenant: 1,
      requiresConsent: false,
    }
    const doc = industry({
      hero: { image: image as Media },
      featuredProducts: [
        4,
        { id: 5, slug: 'gopos', tenant: 1 } as never,
        { id: 6, slug: 'obcy', tenant: 2 } as never,
      ],
    })
    expect(buildIndustryView(doc, 1).image?.alt).toBe('Zestaw')
    expect(buildIndustryView(doc, 1).featured).toEqual(['gopos'])
    expect(buildIndustryView(doc, 2).image).toBeNull()
  })
})
