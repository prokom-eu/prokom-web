import { describe, expect, it, vi } from 'vitest'

vi.mock('@payload-config', () => ({ default: {} }))

import type { HubHelp, HubPlan, HubService, HubTool } from '@/payload-types'

import { extraEmailsToShow, hubWhere, toHubData, toHubSettings } from './data'

describe('hubWhere — every hub query is tenant-scoped (isolation)', () => {
  it('filters by tenant and the published version', () => {
    expect(hubWhere(7)).toEqual({
      and: [{ tenant: { equals: 7 } }, { _status: { equals: 'published' } }],
    })
  })

  it('keeps both filters next to an extra condition', () => {
    const where = hubWhere(7, { slug: { equals: 'kasa' } })
    expect(where.and).toHaveLength(3)
    expect(where.and?.[0]).toEqual({ tenant: { equals: 7 } })
  })
})

const base = { tenant: 1, updatedAt: '', createdAt: '', order: 0, _status: 'published' as const }

describe('toHubData', () => {
  const services = [
    {
      ...base,
      id: 1,
      key: 'b1',
      line: 'biznes',
      title: 'Kasy',
      short: 'K',
      audience: 'firma',
      related: [2],
    },
    { ...base, id: 2, key: 'i4', line: 'instalacje', title: 'Sieci', short: 'S', audience: 'oba' },
    {
      ...base,
      id: 3,
      key: 'x',
      line: 'tech',
      title: 'Ukryta',
      short: 'U',
      audience: 'dom',
      visible: false,
    },
  ] as HubService[]
  const tools = [
    {
      ...base,
      id: 5,
      key: 'tech-status',
      line: 'tech',
      action: 'sprawdz',
      title: 'Status',
      desc: 'D',
    },
  ] as HubTool[]
  const help = [
    {
      ...base,
      id: 9,
      slug: 'ekran',
      group: 'Sprzęt',
      line: 'tech',
      title: 'Ekran',
      relatedTool: 5,
    },
  ] as HubHelp[]
  const plans = [
    {
      ...base,
      id: 4,
      key: 'gastro',
      type: 'branza',
      name: 'Gastronomia',
      groups: [{ line: 'biznes', points: ['GoPOS'] }],
    },
  ] as HubPlan[]

  const data = toHubData({ services, tools, help, plans })

  it('never relates to a hidden service', () => {
    const hiddenRelated = toHubData({
      services: [{ ...services[0], related: [3] } as HubService, services[2] as HubService],
      tools: [],
      help: [],
      plans: [],
    })
    expect(hiddenRelated.services[0]?.related).toEqual([])
  })

  it('drops hidden services and turns relations into keys', () => {
    expect(data.services.map((s) => s.key)).toEqual(['b1', 'i4'])
    expect(data.services[0]?.related).toEqual(['i4'])
    expect(data.help[0]?.relatedTool).toBe('tech-status')
  })

  it('gives empty lists instead of null', () => {
    expect(data.tools[0]).toMatchObject({ inputs: [], featuredOnHome: false, url: null })
    expect(data.plans[0]).toMatchObject({
      start: [],
      groups: [{ line: 'biznes', points: ['GoPOS'] }],
    })
  })
})

describe('toHubSettings', () => {
  const doc = {
    pages: { help: true },
    trust: [
      { value: 'Od 2004', label: 'firma z Rabki-Zdroju', approved: true },
      { value: '30 lat', label: 'na rynku', approved: false },
    ],
  }

  it('without a document: v1.1 pages off and no facts', () => {
    const view = toHubSettings(null, 'local')
    expect(Object.values(view.pages).every((on) => !on)).toBe(true)
    expect(view.trust).toEqual([])
  })

  it('switches on only the pages marked in the panel', () => {
    const { pages } = toHubSettings(doc, 'local')
    expect(pages.help).toBe(true)
    expect(pages.forHome).toBe(false)
  })

  it('reads the page texts through their schema; a value that no longer fits gives null', () => {
    const view = toHubSettings({ ...doc, deliveries: { segments: [] }, cooperation: null }, 'local')
    expect(view.deliveries).toBeNull()
    expect(view.cooperation).toBeNull()
  })

  it('gives the extra phones and a published branch with an address (decision 15.11)', () => {
    const branch = {
      published: true,
      name: 'Zakopane',
      street: 'ul. Stanisława Staszica 8',
      postalCode: '34-500',
      city: 'Zakopane',
      phone: '18 541 20 15',
      note: 'Tylko serwis PRO-KOM Tech.',
    }
    const view = toHubSettings(
      { ...doc, extraPhones: [{ label: 'Biuro', number: '18 267 65 11', id: 'a' }], branch },
      'production',
    )
    expect(view.extraPhones).toEqual([{ label: 'Biuro', number: '18 267 65 11', techPoint: null }])
    expect(view.branch).toEqual({
      name: 'Zakopane',
      street: 'ul. Stanisława Staszica 8',
      postalCode: '34-500',
      city: 'Zakopane',
      phone: '18 541 20 15',
      note: 'Tylko serwis PRO-KOM Tech.',
    })
  })

  it('hides the branch when it is off or has no street and city', () => {
    const base = { name: 'Zakopane', street: 'ul. Staszica 8', city: 'Zakopane' }
    expect(
      toHubSettings({ ...doc, branch: { ...base, published: false } }, 'local').branch,
    ).toBeNull()
    expect(
      toHubSettings({ ...doc, branch: { ...base, street: '', published: true } }, 'local').branch,
    ).toBeNull()
    expect(toHubSettings(null, 'local')).toMatchObject({ extraPhones: [], branch: null })
  })

  it('shows unapproved facts outside production only (spec §3)', () => {
    expect(toHubSettings(doc, 'staging').trust).toHaveLength(2)
    expect(toHubSettings(doc, 'production').trust).toEqual([
      { value: 'Od 2004', label: 'firma z Rabki-Zdroju' },
    ])
  })
})

describe('toHubSettings — extra e-mails (runda 1811 D15)', () => {
  it('gives only the addresses switched on in the panel', () => {
    const view = toHubSettings(
      {
        extraEmails: [
          { label: 'Biuro (ogólny)', email: 'biuro@pro-kom.eu', published: true, id: 'a' },
          { label: 'Zamówienia', email: 'sklep@pro-kom.pl', published: false, id: 'b' },
        ],
      },
      'production',
    )
    expect(view.extraEmails).toEqual([{ label: 'Biuro (ogólny)', email: 'biuro@pro-kom.eu' }])
  })
})

describe('extraEmailsToShow (runda 1811 D15)', () => {
  const rows = [
    { label: 'Biuro (ogólny)', email: 'Biuro@Pro-Kom.eu' },
    { label: 'Zamówienia', email: 'sklep@pro-kom.pl' },
  ]

  it('leaves out the main address, whatever its case', () => {
    expect(extraEmailsToShow(rows, 'biuro@pro-kom.eu')).toEqual([rows[1]])
  })

  it('keeps every address when the main one is another or missing', () => {
    expect(extraEmailsToShow(rows, 'kontakt@pro-kom.eu')).toEqual(rows)
    expect(extraEmailsToShow(rows, null)).toEqual(rows)
  })
})
