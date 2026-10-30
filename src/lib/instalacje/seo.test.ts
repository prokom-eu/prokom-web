import { describe, expect, it } from 'vitest'

import { AREA_SERVED, serviceJsonLd, websiteJsonLd } from './seo'

const base = {
  origin: 'https://prokominstalacje.pl',
  path: '/anteny',
  name: 'Anteny RTV/SAT',
  description: 'Montaż anten satelitarnych i DVB-T2.',
  serviceType: 'Montaż anten',
}

describe('serviceJsonLd', () => {
  it('describes the service with an absolute address and the site as provider', () => {
    const data = serviceJsonLd(base)
    expect(data['@type']).toBe('Service')
    expect(data.url).toBe('https://prokominstalacje.pl/anteny')
    expect(data.provider).toEqual({ '@id': 'https://prokominstalacje.pl/#organization' })
    expect(data.areaServed).toHaveLength(AREA_SERVED.length)
  })

  it('offers the service without a price (spec §2)', () => {
    const json = JSON.stringify(serviceJsonLd(base).offers)
    expect(json).not.toMatch(/price/i)
  })

  it('leaves out an empty description', () => {
    expect(serviceJsonLd({ ...base, description: '' })).not.toHaveProperty('description')
  })
})

describe('websiteJsonLd', () => {
  it('names the site and points to the Organization of the layout', () => {
    expect(
      websiteJsonLd({ origin: 'https://prokominstalacje.pl', name: 'PRO-KOM Instalacje' }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://prokominstalacje.pl/#website',
      name: 'PRO-KOM Instalacje',
      url: 'https://prokominstalacje.pl/',
      inLanguage: 'pl-PL',
      publisher: { '@id': 'https://prokominstalacje.pl/#organization' },
    })
  })
})
