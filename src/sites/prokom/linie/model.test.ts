import { describe, expect, it } from 'vitest'

import type { HubServiceView } from '@/lib/prokom/data'
import type { HubLineContact } from '@/lib/prokom/lineContacts'
import { NO_OPTIONAL_PAGES } from '@/lib/prokom/pages'

import { hubHome } from '../../../seed/prokom/map'
import { homeLines } from '../home/model'
import { filterServices, offerData, offerQuery, parseOfferParams, serviceCta } from './model'

const contact = (key: HubLineContact['key']): HubLineContact => ({
  key,
  name: key,
  domain: `${key}.test`,
  url: `https://${key}.test`,
  phone: '111 222 333',
  phone2: null,
  email: null,
  hours: null,
  promise: 'Szybko',
})

const service = (
  key: string,
  line: HubServiceView['line'],
  extra: Partial<HubServiceView> = {},
): HubServiceView => ({
  key,
  line,
  title: `Usługa ${key}`,
  short: 'krótko',
  long: null,
  audience: 'oba',
  includes: [],
  related: [],
  keywords: null,
  url: null,
  ctaLabel: null,
  ...extra,
})

describe('serviceCta', () => {
  const line = { url: 'https://line.test', cta: 'Zobacz linię' }

  it('keeps the own address of a live page and falls back for a page that is off', () => {
    expect(
      serviceCta({ url: '/inwestycje-i-dostawy', ctaLabel: 'Lista' }, line, NO_OPTIONAL_PAGES),
    ).toEqual({ label: 'Lista', href: '/inwestycje-i-dostawy' })
    expect(
      serviceCta({ url: '/wspolpraca', ctaLabel: 'Współpraca' }, line, NO_OPTIONAL_PAGES),
    ).toEqual({ label: 'Zobacz linię', href: 'https://line.test' })
    expect(
      serviceCta({ url: '/wspolpraca', ctaLabel: 'Współpraca' }, line, {
        ...NO_OPTIONAL_PAGES,
        cooperation: true,
      }),
    ).toEqual({ label: 'Współpraca', href: '/wspolpraca' })
  })
})

describe('offerData and filterServices', () => {
  const lines = homeLines([contact('biznes'), contact('tech')], hubHome(), [], [])
  const { lines: offerLines, services } = offerData(
    lines,
    [
      service('b1', 'biznes', {
        audience: 'firma',
        keywords: 'kasa fiskalna posnet',
        related: ['t1', 'g1'],
      }),
      service('t1', 'tech', { audience: 'dom', title: 'Pęknięty ekran' }),
      service('g1', 'gaming'),
    ],
    NO_OPTIONAL_PAGES,
  )

  it('leaves out services of lines that are not on the page, also among related', () => {
    expect(services.map((s) => s.key)).toEqual(['b1', 't1'])
    expect(services[0]?.related).toEqual(['t1'])
    expect(offerLines.map((line) => [line.key, line.count])).toEqual([
      ['biznes', 1],
      ['tech', 1],
    ])
  })

  it('matches every word without Polish marks, the audience and the line', () => {
    expect(filterServices(services, { q: 'pekniety', audience: null, line: null })).toHaveLength(1)
    expect(filterServices(services, { q: 'kasa posnet', audience: null, line: null })).toHaveLength(
      1,
    )
    expect(filterServices(services, { q: 'kasa ekran', audience: null, line: null })).toHaveLength(
      0,
    )
    expect(
      filterServices(services, { q: '', audience: 'dom', line: null }).map((s) => s.key),
    ).toEqual(['t1'])
    expect(filterServices(services, { q: '', audience: null, line: 'biznes' })).toHaveLength(1)
  })
})

describe('parseOfferParams and offerQuery', () => {
  it('ignores unknown values and writes back only the set ones', () => {
    const state = parseOfferParams(
      { q: ' kasa ', dla: 'firma', linia: 'xyz', u: ['b1', 'b2'] },
      ['biznes'],
      ['b1'],
    )
    expect(state).toEqual({ q: 'kasa', audience: 'firma', line: null, selected: 'b1' })
    expect(offerQuery(state, state.selected)).toBe('?q=kasa&dla=firma&u=b1')
    expect(offerQuery({ q: '', audience: null, line: null }, null)).toBe('')
    expect(offerQuery({ q: '', audience: null, line: 'tech' }, null, '?utm_source=x&u=b1')).toBe(
      '?utm_source=x&linia=tech',
    )
  })
})
