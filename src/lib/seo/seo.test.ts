import { describe, expect, it } from 'vitest'

import {
  articleJsonLd,
  breadcrumbJsonLd,
  serviceJsonLd,
  serviceListJsonLd,
  faqJsonLd,
  organizationJsonLd,
  productJsonLd,
  videoJsonLd,
  serializeJsonLd,
  SOFTWARE_AREA_SERVED,
} from './jsonLd'
import { pageRobots, robotsMeta, robotsTxt } from './robots'
import { siteOrigin } from './origin'
import { sitemapXml } from './sitemap'

describe('siteOrigin', () => {
  it('uses http with the port locally and https without a port elsewhere', () => {
    expect(siteOrigin('Biznes.localhost:3000', 'local')).toBe('http://biznes.localhost:3000')
    expect(siteOrigin('prokombiznes.pl:443', 'production')).toBe('https://prokombiznes.pl')
    expect(siteOrigin('staging.prokombiznes.pl', 'staging')).toBe('https://staging.prokombiznes.pl')
  })

  it('returns null for a Host that is not a hostname', () => {
    expect(siteOrigin('evil.pl/x', 'production')).toBeNull()
    expect(siteOrigin(null, 'local')).toBeNull()
  })
})

describe('robots', () => {
  it('lets crawlers in and points at the sitemap outside staging', () => {
    expect(robotsTxt('production', 'https://prokombiznes.pl')).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://prokombiznes.pl/sitemap.xml\n',
    )
    expect(robotsMeta('production')).toBeUndefined()
  })

  it('shuts everything on staging', () => {
    expect(robotsTxt('staging', 'https://staging.prokombiznes.pl')).toBe(
      'User-agent: *\nDisallow: /\n',
    )
    expect(robotsMeta('staging')).toEqual({ index: false, follow: false })
  })

  it('keeps a page out of the index but lets links be followed, staging still shut', () => {
    expect(pageRobots('production', true)).toBeUndefined()
    expect(pageRobots('production', false)).toEqual({ index: false, follow: true })
    expect(pageRobots('staging', true)).toEqual({ index: false, follow: false })
    expect(pageRobots('staging', false)).toEqual({ index: false, follow: false })
  })
})

describe('sitemapXml', () => {
  it('lists pages at their public paths, home at /', () => {
    const xml = sitemapXml('https://prokombiznes.pl', [
      { slug: 'home', updatedAt: '2026-10-17T10:00:00.000Z' },
      { slug: 'kontakt', updatedAt: '2026-10-16T08:30:00.000Z' },
    ])
    expect(xml).toContain('<loc>https://prokombiznes.pl/</loc>')
    expect(xml).toContain('<loc>https://prokombiznes.pl/kontakt</loc>')
    expect(xml).toContain('<lastmod>2026-10-17T10:00:00.000Z</lastmod>')
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
  })

  it('lists extra paths (catalog, products) after the pages', () => {
    const xml = sitemapXml(
      'https://prokombiznes.pl',
      [{ slug: 'home', updatedAt: null }],
      [
        { path: '/oferta', updatedAt: null },
        { path: '/produkt/posnet-ergo-online', updatedAt: '2026-10-22T09:00:00.000Z' },
      ],
    )
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
    expect(locs).toEqual([
      'https://prokombiznes.pl/',
      'https://prokombiznes.pl/oferta',
      'https://prokombiznes.pl/produkt/posnet-ergo-online',
    ])
    expect(xml).toContain('<lastmod>2026-10-22T09:00:00.000Z</lastmod>')
  })

  it('escapes XML special characters', () => {
    expect(sitemapXml('https://a.pl/?x=1&y=<2>', [{ slug: 'home', updatedAt: null }])).toContain(
      '<loc>https://a.pl/?x=1&amp;y=&lt;2&gt;/</loc>',
    )
  })
})

const company = {
  name: 'PRO-KOM',
  nip: '1234563218',
  email: 'biuro@example.test',
  phones: [{ label: 'Biuro', number: '+48 000 000 001' }],
  locations: [
    {
      name: 'Rabka-Zdrój',
      street: 'ul. Przykładowa 1',
      postalCode: '00-000',
      city: 'Rabka-Zdrój',
      hours: [{ days: ['mon', 'fri'], opens: '08:00', closes: '16:00' }],
    },
  ],
  promo: null,
}

describe('organizationJsonLd', () => {
  const data = organizationJsonLd({
    company,
    tenant: { name: 'PRO-KOM Biznes', line: 'biznes' },
    contact: { phone: '+48 000 000 101', email: null },
    origin: 'https://prokombiznes.pl',
  })

  it('describes the company with the line contact first', () => {
    const [org] = data['@graph']
    expect(org).toMatchObject({
      '@type': 'Organization',
      '@id': 'https://prokombiznes.pl/#organization',
      name: 'PRO-KOM Biznes',
      legalName: 'PRO-KOM',
      url: 'https://prokombiznes.pl/',
      telephone: '+48000000101', // E.164 (audyt 01.11 P2)
      email: 'biuro@example.test',
      taxID: '1234563218',
      logo: 'https://prokombiznes.pl/brand/prokom-biznes_poziome_kolor.svg',
    })
  })

  it('adds each branch as a LocalBusiness with opening hours', () => {
    const [, branch] = data['@graph']
    expect(branch).toMatchObject({
      '@type': 'LocalBusiness',
      '@id': 'https://prokombiznes.pl/#oddzial-1',
      name: 'PRO-KOM — Rabka-Zdrój',
      parentOrganization: { '@id': 'https://prokombiznes.pl/#organization' },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'ul. Przykładowa 1',
        postalCode: '00-000',
        addressLocality: 'Rabka-Zdrój',
        addressCountry: 'PL',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['https://schema.org/Monday', 'https://schema.org/Friday'],
          opens: '08:00',
          closes: '16:00',
        },
      ],
    })
  })
})

describe('organizationJsonLd on Software (SWV2: only Rabka)', () => {
  it('lists only the main office, never the other salons of the company', () => {
    const zakopane = { ...company.locations[0]!, name: 'Zakopane', city: 'Zakopane' }
    const data = organizationJsonLd({
      company: { ...company, locations: [...company.locations, zakopane] },
      tenant: { name: 'PRO-KOM Software', line: 'software' },
      contact: { phone: '883 200 151', email: null },
      origin: 'https://prokomsoftware.pl',
    })
    const branches = data['@graph'].filter((node) => node['@type'] === 'LocalBusiness')
    expect(branches).toHaveLength(1)
    expect(JSON.stringify(data)).not.toContain('Zakopane')
  })

  it('gives the office an E.164 phone, e-mail, geo, image and the area it serves (audyt P2)', () => {
    const data = organizationJsonLd({
      company,
      tenant: { name: 'PRO-KOM Software', line: 'software' },
      contact: { phone: '883 200 151', email: 'kontakt@prokomsoftware.pl' },
      origin: 'https://prokomsoftware.pl',
    })
    const branch = data['@graph'].find((node) => node['@type'] === 'LocalBusiness')
    expect(branch).toMatchObject({
      telephone: '+48883200151',
      email: 'kontakt@prokomsoftware.pl',
      geo: { '@type': 'GeoCoordinates', latitude: 49.60994, longitude: 19.95339 },
      image: 'https://prokomsoftware.pl/brand/prokom-software_og.png',
      areaServed: SOFTWARE_AREA_SERVED,
    })
  })
})

describe('serviceJsonLd area (audyt P2)', () => {
  it('names the area served when given', () => {
    const data = serviceJsonLd({
      name: 'Strona wizytówka',
      description: undefined,
      url: 'https://prokomsoftware.pl/rozwiazania/strona-wizytowka',
      provider: 'PRO-KOM Software',
      priceFrom: 999,
      areaServed: SOFTWARE_AREA_SERVED,
    })
    expect(data).toMatchObject({ areaServed: SOFTWARE_AREA_SERVED })
  })
})

describe('faqJsonLd', () => {
  it('maps questions and answers', () => {
    expect(faqJsonLd([{ question: 'Czy?', answer: 'Tak.' }])).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Czy?', acceptedAnswer: { '@type': 'Answer', text: 'Tak.' } },
      ],
    })
  })
})

describe('videoJsonLd', () => {
  it('points at the youtube-nocookie player and the ytimg poster (ADR-016)', () => {
    expect(videoJsonLd({ id: 'UFXLZ4kSjD0', title: 'Mobilna kasa K10', channel: 'ELZAB' })).toEqual(
      {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: 'Mobilna kasa K10',
        description: 'Mobilna kasa K10 — film producenta (ELZAB).',
        thumbnailUrl: ['https://i.ytimg.com/vi/UFXLZ4kSjD0/hqdefault.jpg'],
        embedUrl: 'https://www.youtube-nocookie.com/embed/UFXLZ4kSjD0',
      },
    )
  })
})

describe('productJsonLd', () => {
  const input = {
    name: 'Posnet Ergo Online',
    description: 'Mała kasa, która jeździ z Tobą.',
    url: 'https://prokombiznes.pl/produkt/posnet-ergo-online',
    brand: 'Posnet',
    category: 'Kasy fiskalne',
    images: ['https://prokombiznes.pl/api/media/file/ergo-01.webp'],
  }

  it('describes the product with brand and images', () => {
    expect(productJsonLd(input)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Posnet Ergo Online',
      description: 'Mała kasa, która jeździ z Tobą.',
      url: 'https://prokombiznes.pl/produkt/posnet-ergo-online',
      brand: { '@type': 'Brand', name: 'Posnet' },
      category: 'Kasy fiskalne',
      image: ['https://prokombiznes.pl/api/media/file/ergo-01.webp'],
    })
  })

  it('never has offers — there are no prices (spec. §6.2)', () => {
    expect(JSON.stringify(productJsonLd(input))).not.toMatch(/offers|price/i)
  })

  it('is a ProductGroup with ?wersja= variants for a card with ≥ 2 versions (K31-ZMIANY §13.5)', () => {
    const variants = [
      { name: 'Posnet Ergo Online BT', sku: 'BT', url: `${input.url}?wersja=bt` },
      { name: 'Posnet Ergo Online LAN', sku: 'LAN', url: `${input.url}?wersja=lan` },
    ]
    const group = productJsonLd({ ...input, groupId: 'posnet-ergo-online', variants })
    expect(group).toMatchObject({
      '@type': 'ProductGroup',
      productGroupID: 'posnet-ergo-online',
      url: input.url,
      variesBy: ['https://schema.org/model'],
      hasVariant: [
        {
          '@type': 'Product',
          name: 'Posnet Ergo Online BT',
          sku: 'BT',
          url: `${input.url}?wersja=bt`,
        },
        {
          '@type': 'Product',
          name: 'Posnet Ergo Online LAN',
          sku: 'LAN',
          url: `${input.url}?wersja=lan`,
        },
      ],
    })
    expect(JSON.stringify(group)).not.toMatch(/offers|price/i)
    expect(productJsonLd({ ...input, variants: variants.slice(0, 1) })['@type']).toBe('Product')
  })

  it('leaves out what is missing', () => {
    expect(
      productJsonLd({ ...input, description: null, brand: null, category: null, images: [] }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Posnet Ergo Online',
      url: 'https://prokombiznes.pl/produkt/posnet-ergo-online',
    })
  })
})

describe('breadcrumbJsonLd', () => {
  it('numbers the items from 1', () => {
    expect(
      breadcrumbJsonLd([
        { name: 'Strona główna', url: 'https://prokombiznes.pl/' },
        { name: 'Oferta', url: 'https://prokombiznes.pl/oferta' },
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Strona główna',
          item: 'https://prokombiznes.pl/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Oferta',
          item: 'https://prokombiznes.pl/oferta',
        },
      ],
    })
  })

  it('leaves out the address of an item that has no indexable page', () => {
    expect(breadcrumbJsonLd([{ name: 'Kasy fiskalne', url: null }]).itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Kasy fiskalne' },
    ])
  })
})

describe('serializeJsonLd', () => {
  it('cannot close the script tag', () => {
    expect(serializeJsonLd({ text: '</script><script>alert(1)</script>' })).not.toContain('<')
  })
})

describe('articleJsonLd', () => {
  it('describes the post with the line as author and publisher', () => {
    expect(
      articleJsonLd({
        headline: 'KSeF od 1 stycznia 2027',
        description: 'Checklista',
        url: 'https://prokombiznes.pl/aktualnosci/ksef',
        origin: 'https://prokombiznes.pl',
        datePublished: '2026-10-14T00:00:00.000Z',
        dateModified: '2026-10-20T00:00:00.000Z',
        images: ['https://prokombiznes.pl/api/media/file/ksef.webp'],
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'KSeF od 1 stycznia 2027',
      description: 'Checklista',
      url: 'https://prokombiznes.pl/aktualnosci/ksef',
      mainEntityOfPage: 'https://prokombiznes.pl/aktualnosci/ksef',
      inLanguage: 'pl-PL',
      datePublished: '2026-10-14T00:00:00.000Z',
      dateModified: '2026-10-20T00:00:00.000Z',
      author: { '@id': 'https://prokombiznes.pl/#organization' },
      publisher: { '@id': 'https://prokombiznes.pl/#organization' },
      image: ['https://prokombiznes.pl/api/media/file/ksef.webp'],
    })
  })

  it('leaves out what the post does not have', () => {
    const data = articleJsonLd({
      headline: 'A',
      description: null,
      url: 'https://x.pl/aktualnosci/a',
      origin: 'https://x.pl',
      datePublished: null,
      dateModified: null,
      images: [],
    })
    expect(data).not.toHaveProperty('description')
    expect(data).not.toHaveProperty('datePublished')
    expect(data).not.toHaveProperty('image')
  })
})

describe('serviceListJsonLd', () => {
  it('lists the services in order with their pages (spec. §5: ItemList of Service)', () => {
    expect(
      serviceListJsonLd({
        name: 'Pełna oferta',
        provider: 'PRO-KOM Software',
        items: [
          { name: 'Strona wizytówka', description: 'Jedna strona.', url: 'https://x.pl/a' },
          { name: 'CRM', description: undefined, url: 'https://x.pl/b' },
        ],
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Pełna oferta',
      numberOfItems: 2,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Service',
            name: 'Strona wizytówka',
            description: 'Jedna strona.',
            url: 'https://x.pl/a',
            provider: { '@type': 'Organization', name: 'PRO-KOM Software' },
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Service',
            name: 'CRM',
            url: 'https://x.pl/b',
            provider: { '@type': 'Organization', name: 'PRO-KOM Software' },
          },
        },
      ],
    })
  })
})

describe('serviceJsonLd (solution page, SW10)', () => {
  const base = {
    name: 'Strona wizytówka',
    description: 'Jedna strona z kontaktem.',
    url: 'https://prokomsoftware.pl/rozwiazania/strona-wizytowka',
    provider: 'PRO-KOM Software',
  }

  it('describes the service with its „od” price', () => {
    expect(serviceJsonLd({ ...base, priceFrom: 999 })).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Strona wizytówka',
      description: 'Jedna strona z kontaktem.',
      url: 'https://prokomsoftware.pl/rozwiazania/strona-wizytowka',
      provider: { '@type': 'Organization', name: 'PRO-KOM Software' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'PLN',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: 999,
          priceCurrency: 'PLN',
          valueAddedTaxIncluded: false,
        },
      },
    })
  })

  it('has no offers without a price, and keeps 0 as a price', () => {
    expect(serviceJsonLd({ ...base, priceFrom: null })).not.toHaveProperty('offers')
    expect(serviceJsonLd({ ...base, priceFrom: 0 }).offers?.priceSpecification.minPrice).toBe(0)
  })

  it('leaves out an empty description', () => {
    expect(serviceJsonLd({ ...base, description: undefined, priceFrom: null })).not.toHaveProperty(
      'description',
    )
  })
})
