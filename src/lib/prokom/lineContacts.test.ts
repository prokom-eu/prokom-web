import { describe, expect, it, vi } from 'vitest'

// Only the pure projections are tested; the loaders need a database.
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('../shared/getSharedData', () => ({ getSharedData: vi.fn() }))
vi.mock('../posts/data', () => ({ getTenantPostRows: vi.fn(), getLineTenantRows: vi.fn() }))

import type { SharedLine } from '../shared/project'
import { toHubLineContacts } from './lineContacts'
import { linePostLinks } from '../posts/sister'
import { TENANT_LINES } from './lineContacts'

const line = (key: SharedLine['key'], extra: Partial<SharedLine> = {}): SharedLine => ({
  key,
  name: key.toUpperCase(),
  kind: 'linia',
  order: 0,
  domain: `${key}.test`,
  url: `https://${key}.test`,
  logoLabel: null,
  color: null,
  colorOnDark: null,
  description: null,
  descriptionLong: null,
  phone: null,
  email: null,
  hours: null,
  promise: null,
  ...extra,
})

describe('toHubLineContacts', () => {
  const lines = [
    line('gaming', { phone: 'G-PHONE', promise: null }),
    line('prokom'),
    line('tech', { phone: 'T-PHONE', hours: 'T-HOURS', promise: 'T-PROMISE' }),
    line('biznes', { phone: 'COMPANY-B' }),
    line('software'),
  ]

  it('lists the hub lines in hub order, without the company and unpublished lines', () => {
    expect(toHubLineContacts(lines, {}).map((row) => row.key)).toEqual([
      'biznes',
      'software',
      'tech',
      'gaming',
    ])
  })

  it('takes a line site from its own SiteSettings, CompanyData filling the gaps', () => {
    const [biznes, software] = toHubLineContacts(lines, {
      biznes: { phone: 'B-PHONE', email: 'B-MAIL', hours: null, responsePromise: 'B-PROMISE' },
      software: null,
    })
    expect(biznes).toMatchObject({ phone: 'B-PHONE', email: 'B-MAIL', promise: 'B-PROMISE' })
    expect(software).toMatchObject({ phone: null, promise: null, domain: 'software.test' })
  })

  it('reads Tech and Gaming from CompanyData.lines only', () => {
    const rows = toHubLineContacts(lines, {})
    expect(rows.find((row) => row.key === 'tech')).toMatchObject({
      phone: 'T-PHONE',
      hours: 'T-HOURS',
      promise: 'T-PROMISE',
    })
    expect(rows.find((row) => row.key === 'gaming')?.promise).toBeNull()
  })
})

describe('hub news (linePostLinks of the three line sites)', () => {
  const news = (
    groups: Parameters<typeof linePostLinks>[0],
    limit: number,
    place: { siteEnv: 'production' },
  ) => linePostLinks(groups, TENANT_LINES, limit, place)
  const place = { siteEnv: 'production' as const }
  const tenant = (id: number, l: 'biznes' | 'instalacje' | 'software', host: string | null) => ({
    id,
    line: l,
    domains: host ? [{ host, environment: 'production' }] : [],
  })
  const post = (slug: string, publishedAt: string) => ({
    slug,
    title: `T ${slug}`,
    publishedAt,
    lead: null,
  })

  it('links the newest posts of the three lines at their source, newest first', () => {
    const links = news(
      [
        { tenant: tenant(1, 'biznes', 'prokombiznes.pl'), posts: [post('a', '2026-11-01')] },
        {
          tenant: tenant(2, 'instalacje', 'prokominstalacje.pl'),
          posts: [post('b', '2026-11-10')],
        },
        { tenant: tenant(3, 'software', 'prokomsoftware.pl'), posts: [post('c', '2026-11-05')] },
      ],
      2,
      place,
    )
    expect(links.map((link) => link.line)).toEqual(['instalacje', 'software'])
    expect(links[0]?.href.startsWith('https://prokominstalacje.pl/')).toBe(true)
  })

  it('gives no card for a line without a domain here, and nothing for no posts', () => {
    expect(
      news([{ tenant: tenant(1, 'biznes', null), posts: [post('a', '2026-11-01')] }], 3, place),
    ).toEqual([])
    expect(news([{ tenant: tenant(1, 'biznes', 'x.pl'), posts: [] }], 3, place)).toEqual([])
  })
})
