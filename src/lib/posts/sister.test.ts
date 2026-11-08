import { describe, expect, it } from 'vitest'

import { sisterPostLinks, sisterTenants } from './sister'

const BIZNES = { id: 1, line: 'biznes' }
const INSTALACJE = { id: 2, line: 'instalacje' }
const SOFTWARE = { id: 3, line: 'software' }

// Rows as a careless query might return them: lead, body and cover must never come out.
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
    expect(sisterPostLinks(groups, BIZNES.id, 2)).toEqual([
      {
        title: 'Wpis strona',
        href: 'https://prokomsoftware.pl/aktualnosci/strona',
        publishedAt: '2026-11-06T10:00:00.000Z',
        line: 'software',
      },
      {
        title: 'Wpis pompa',
        href: 'https://prokominstalacje.pl/poradnik/pompa',
        publishedAt: '2026-11-05T10:00:00.000Z',
        line: 'instalacje',
      },
    ])
  })

  it('never returns lead, body or cover — exactly four fields', () => {
    for (const link of sisterPostLinks(groups, BIZNES.id, 10)) {
      expect(Object.keys(link).sort()).toEqual(['href', 'line', 'publishedAt', 'title'])
    }
  })

  it('never returns the own (Biznes) posts, even when they are passed in', () => {
    const links = sisterPostLinks(groups, BIZNES.id, 10)
    expect(links.map((link) => link.href)).not.toContain(expect.stringContaining('prokombiznes.pl'))
    expect(links.some((link) => link.title === 'Wpis ksef-biznes')).toBe(false)
    expect(links).toHaveLength(3)
  })

  it('drops rows without a date or title; nothing for limit 0', () => {
    const odd = [{ tenant: SOFTWARE, posts: [{ slug: 'a', title: ' ', publishedAt: null }] }]
    expect(sisterPostLinks(odd, BIZNES.id, 3)).toEqual([])
    expect(sisterPostLinks(groups, BIZNES.id, 0)).toEqual([])
  })
})
