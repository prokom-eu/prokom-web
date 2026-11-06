import { describe, expect, it } from 'vitest'

import { aboutPageJsonLd, aboutStats, contactPageJsonLd, lineSalons } from './pages'
import type { SharedSalon } from './project'

const salon = (key: string | null, city: string): SharedSalon => ({
  key,
  name: `Salon ${city}`,
  street: 'ul. Orkana 16B',
  postalCode: '34-700',
  city,
  geo: { lat: 49.6, lng: 19.95 },
  parkingNote: null,
  hours: [{ days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' }],
})

const SALONS = [salon('rabka', 'Rabka-Zdrój'), salon('zakopane', 'Zakopane')]
const BASE = {
  company: { name: 'PRO-KOM Tadeusz Wójciak', nip: '7352511447' },
  lineName: 'PRO-KOM Biznes',
  phone: '889 003 889',
  email: 'kontakt@prokombiznes.pl',
  origin: 'https://prokombiznes.pl',
}

type Node = Record<string, unknown> & { '@type': string }
const graph = (data: { '@graph': unknown[] }) => data['@graph'] as Node[]

describe('lineSalons (contact.salonKeys)', () => {
  it('keeps the salons named by key, in the company order', () => {
    expect(lineSalons(SALONS, ['zakopane', 'rabka']).map((s) => s.key)).toEqual([
      'rabka',
      'zakopane',
    ])
  })

  it('without keys takes the first salon — the office', () => {
    expect(lineSalons(SALONS, null).map((s) => s.key)).toEqual(['rabka'])
    expect(lineSalons(SALONS, []).map((s) => s.key)).toEqual(['rabka'])
  })

  it('an unknown key gives no salon (an unpublished one never reaches here)', () => {
    expect(lineSalons(SALONS, ['nowy-sacz'])).toEqual([])
  })
})

describe('contactPageJsonLd (spec §6.1, §8)', () => {
  const data = contactPageJsonLd({
    ...BASE,
    salons: SALONS.slice(0, 1),
    breadcrumbs: [
      { name: 'Strona główna', path: '/' },
      { name: 'Kontakt', path: '/kontakt' },
    ],
  })

  it('has one LocalBusiness per salon of the line, with hours and E.164 phone', () => {
    const branches = graph(data).filter((node) => node['@type'] === 'LocalBusiness')
    expect(branches).toHaveLength(1)
    expect(branches[0]).toMatchObject({
      telephone: '+48889003889',
      address: { streetAddress: 'ul. Orkana 16B', addressLocality: 'Rabka-Zdrój' },
      openingHours: ['Mo-Fr 09:00-17:00'],
      parentOrganization: { '@id': 'https://prokombiznes.pl/#organization' },
    })
  })

  it('ends with the breadcrumbs as absolute addresses', () => {
    const list = graph(data).find((node) => node['@type'] === 'BreadcrumbList')
    expect(list?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://prokombiznes.pl/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Kontakt',
        item: 'https://prokombiznes.pl/kontakt',
      },
    ])
  })
})

describe('aboutPageJsonLd (spec §6.2)', () => {
  it('is the Organization and the breadcrumbs, no phone when the line has none', () => {
    const data = aboutPageJsonLd({
      ...BASE,
      phone: null,
      breadcrumbs: [{ name: 'O firmie', path: '/o-firmie' }],
    })
    expect(graph(data).map((node) => node['@type'])).toEqual(['Organization', 'BreadcrumbList'])
    expect(graph(data)[0]).not.toHaveProperty('telephone')
    expect(graph(data)[0]).toMatchObject({ taxID: '7352511447', name: 'PRO-KOM Biznes' })
  })
})

describe('aboutStats (spec §6.2 pkt 2)', () => {
  it('starts with the founding year, ends with the published lines, declined', () => {
    const stats = aboutStats(
      [{ value: '100+', label: 'klientów firmowych', flag: 'do potwierdzenia przez szefa' }],
      [
        { kind: 'linia' },
        { kind: 'linia' },
        { kind: 'linia' },
        { kind: 'linia' },
        { kind: 'marka' },
      ],
    )
    expect(stats.map((s) => `${s.value} ${s.label}`)).toEqual([
      '2004 na Podhalu, w Rabce-Zdroju',
      '100+ klientów firmowych',
      '4 linie w jednej firmie',
    ])
    expect(stats[1]?.flag).toBe('do potwierdzenia przez szefa')
  })

  it('five lines read „5 linii”', () => {
    const five = Array.from({ length: 5 }, () => ({ kind: 'linia' as const }))
    expect(aboutStats(null, five).at(-1)?.label).toBe('linii w jednej firmie')
  })
})
