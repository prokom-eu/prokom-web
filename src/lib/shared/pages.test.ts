import { describe, expect, it } from 'vitest'

import { aboutStats, lineSalons, pageBreadcrumbsJsonLd } from './pages'
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

describe('pageBreadcrumbsJsonLd (spec §6.1, §6.2)', () => {
  it('lists the crumbs with absolute addresses, nothing else (the layout has the company)', () => {
    const data = pageBreadcrumbsJsonLd('https://prokombiznes.pl', [
      { name: 'Strona główna', path: '/' },
      { name: 'Kontakt', path: '/kontakt' },
    ])
    expect(data).toEqual({
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
          name: 'Kontakt',
          item: 'https://prokombiznes.pl/kontakt',
        },
      ],
    })
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
