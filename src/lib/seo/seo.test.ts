import { describe, expect, it } from 'vitest'

import { faqJsonLd, organizationJsonLd, serializeJsonLd } from './jsonLd'
import { robotsMeta, robotsTxt } from './robots'
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
      telephone: '+48 000 000 101',
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

describe('serializeJsonLd', () => {
  it('cannot close the script tag', () => {
    expect(serializeJsonLd({ text: '</script><script>alert(1)</script>' })).not.toContain('<')
  })
})
