import { describe, expect, it } from 'vitest'

import {
  SISTER_LEAD_MAX,
  sisterPostLinks,
  sisterTenants,
  teaser,
  tenantOrigin,
  type SitePlace,
} from './sister'

const domains = (name: string) => [
  { host: `${name}.localhost`, environment: 'local' },
  { host: `staging.prokom${name}.pl`, environment: 'staging' },
  { host: `prokom${name}.pl`, environment: 'production' },
]
const BIZNES = { id: 1, line: 'biznes', domains: domains('biznes') }
const INSTALACJE = { id: 2, line: 'instalacje', domains: domains('instalacje') }
const SOFTWARE = { id: 3, line: 'software', domains: domains('software') }
const PROD: SitePlace = { siteEnv: 'production' }

// Rows as a careless query might return them: body and cover must never come out, the lead only
// as a short teaser.
const row = (slug: string, publishedAt: string) => ({
  slug,
  title: `Wpis ${slug}`,
  publishedAt,
  lead: 'Lead, który zostaje na swojej domenie.',
  content: { root: { children: [] } },
  cover: { id: 9, url: '/media/okladka.jpg' },
})

describe('sisterTenants — tenant isolation', () => {
  it('only Instalacje and Software, never the own tenant', () => {
    const tenants = [BIZNES, INSTALACJE, SOFTWARE, { id: 4, line: 'prokom' }, { id: 5, line: null }]
    expect(sisterTenants(tenants, BIZNES.id).map((tenant) => tenant.id)).toEqual([2, 3])
    expect(sisterTenants(tenants, INSTALACJE.id).map((tenant) => tenant.id)).toEqual([3])
  })
})

describe('sisterPostLinks — title and link only (SEO: no copied text)', () => {
  const groups = [
    { tenant: BIZNES, posts: [row('ksef-biznes', '2026-11-07T10:00:00.000Z')] },
    { tenant: INSTALACJE, posts: [row('pompa', '2026-11-05T10:00:00.000Z')] },
    {
      tenant: SOFTWARE,
      posts: [row('strona', '2026-11-06T10:00:00.000Z'), row('stary', '2026-01-01T10:00:00.000Z')],
    },
  ]

  it('newest first, absolute links on the line’s own site, at most `limit`', () => {
    expect(sisterPostLinks(groups, BIZNES.id, 2, PROD)).toEqual([
      {
        title: 'Wpis strona',
        lead: 'Lead, który zostaje na swojej domenie.',
        href: 'https://prokomsoftware.pl/aktualnosci/strona',
        publishedAt: '2026-11-06T10:00:00.000Z',
        line: 'software',
      },
      {
        title: 'Wpis pompa',
        lead: 'Lead, który zostaje na swojej domenie.',
        href: 'https://prokominstalacje.pl/poradnik/pompa',
        publishedAt: '2026-11-05T10:00:00.000Z',
        line: 'instalacje',
      },
    ])
  })

  it('never returns body or cover — exactly five fields, the lead as a teaser', () => {
    for (const link of sisterPostLinks(groups, BIZNES.id, 10, PROD)) {
      expect(Object.keys(link).sort()).toEqual(['href', 'lead', 'line', 'publishedAt', 'title'])
    }
  })

  it('teaser: at most 140 characters, cut at a word with „…”; no lead = null', () => {
    const long = `${'Pompa ciepła w domu z lat 90. '.repeat(10)}koniec`
    const cut = teaser(long)!
    expect(cut.length).toBeLessThanOrEqual(SISTER_LEAD_MAX)
    expect(cut.endsWith('…')).toBe(true)
    expect(cut).not.toMatch(/\s…$/)
    expect(teaser('  Krótki   wstęp. ')).toBe('Krótki wstęp.')
    expect(teaser('')).toBeNull()
    expect(teaser(null)).toBeNull()
  })

  it('never returns the own (Biznes) posts, even when they are passed in', () => {
    const links = sisterPostLinks(groups, BIZNES.id, 10, PROD)
    expect(links.map((link) => link.href)).not.toContain(expect.stringContaining('prokombiznes.pl'))
    expect(links.some((link) => link.title === 'Wpis ksef-biznes')).toBe(false)
    expect(links).toHaveLength(3)
  })

  it('drops rows without a date or title; nothing for limit 0', () => {
    const odd = [{ tenant: SOFTWARE, posts: [{ slug: 'a', title: ' ', publishedAt: null }] }]
    expect(sisterPostLinks(odd, BIZNES.id, 3, PROD)).toEqual([])
    expect(sisterPostLinks(groups, BIZNES.id, 0, PROD)).toEqual([])
  })
})

describe('tenantOrigin — the line’s site in this environment (tenant domains in the database)', () => {
  it('takes the domain of the current environment: staging links stay on staging', () => {
    expect(tenantOrigin(INSTALACJE.domains, { siteEnv: 'staging' })).toBe(
      'https://staging.prokominstalacje.pl',
    )
    expect(tenantOrigin(INSTALACJE.domains, PROD)).toBe('https://prokominstalacje.pl')
  })

  it('locally: http and the port of this app (one app serves every domain)', () => {
    expect(tenantOrigin(SOFTWARE.domains, { siteEnv: 'local', port: '3001' })).toBe(
      'http://software.localhost:3001',
    )
    expect(tenantOrigin(SOFTWARE.domains, { siteEnv: 'local' })).toBe('http://software.localhost')
  })

  it('no domain for this environment → no link (a line not live yet gets no card)', () => {
    const notLive = [{ host: 'instalacje.localhost', environment: 'local' }]
    expect(tenantOrigin(notLive, PROD)).toBeNull()
    expect(tenantOrigin(null, PROD)).toBeNull()
    const groups = [
      {
        tenant: { id: 2, line: 'instalacje', domains: notLive },
        posts: [row('pompa', '2026-11-05T10:00:00.000Z')],
      },
    ]
    expect(sisterPostLinks(groups, BIZNES.id, 3, PROD)).toEqual([])
  })
})
