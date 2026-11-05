import { describe, expect, it } from 'vitest'

import type { CompanyDatum, SiteSetting } from '@/payload-types'

import { toSharedData } from './project'

const company: CompanyDatum = {
  id: 1,
  name: 'Firma Testowa',
  nip: '1234563218',
  email: 'biuro@firma.test',
  phones: [{ id: 'p', number: '100 200 300' }],
  mapsUrl: 'https://maps.test/trasa',
  ceidgUrl: 'https://ceidg.test/1234563218',
  legal: { privacy: '/prywatnosc' },
  consent: { mode: 'info', version: 'v2', clause: 'Klauzula.' },
  locations: [
    {
      id: 'a',
      key: 'glowny',
      name: 'Salon główny',
      street: 'ul. Testowa 1',
      postalCode: '00-001',
      city: 'Testowo',
      published: true,
      geo: { lat: 49.6, lng: 19.9 },
      parkingNote: 'Parking za budynkiem.',
      hours: [{ id: 'h', days: ['mon', 'fri'], opens: '09:00', closes: '17:00' }],
    },
    {
      id: 'b',
      key: 'drugi',
      name: 'Drugi salon',
      street: '[SZEF: adres]',
      postalCode: '00-002',
      city: 'Gdzieś',
      published: false,
    },
  ],
  holidays: [{ id: 'x', date: '2026-12-25T00:00:00.000Z', label: 'Boże Narodzenie' }],
  lines: [
    { id: '3', key: 'software', name: 'Software', kind: 'linia', order: 3, published: true },
    { id: '1', key: 'biznes', name: 'Biznes', kind: 'linia', order: 1, published: true },
    { id: '9', key: 'gaming', name: 'Gaming', kind: 'marka', order: 9, published: false },
  ],
  serviceZones: [{ id: 'z', name: 'Podhale', towns: ['Nowy Targ', 'Szaflary'] }],
}

const settings = (
  shared: SiteSetting['shared'],
  extra: Partial<SiteSetting> = {},
): SiteSetting => ({
  id: 7,
  tenant: 2,
  phone: '111 222 333',
  phone2: '444 555 666',
  email: 'linia@firma.test',
  footer: { text: 'Opis linii.' },
  shared,
  updatedAt: '',
  createdAt: '',
  ...extra,
})

describe('toSharedData', () => {
  it('returns null until the company data is saved', () => {
    expect(toSharedData({ ...company, name: '' }, settings({}))).toBeNull()
  })

  it('takes the address and hours of the first published location', () => {
    const data = toSharedData(company, settings({}))
    expect(data?.company).toMatchObject({
      name: 'Firma Testowa',
      nip: '1234563218',
      address: { street: 'ul. Testowa 1', postalCode: '00-001', city: 'Testowo' },
      geo: { lat: 49.6, lng: 19.9 },
      hours: [{ days: ['mon', 'fri'], opens: '09:00', closes: '17:00' }],
      holidays: ['2026-12-25'],
      mapsUrl: 'https://maps.test/trasa',
    })
  })

  it('fills missing legal paths and keeps the consent mode', () => {
    const data = toSharedData(company, settings({}))
    expect(data?.company.legal).toEqual({
      privacy: '/prywatnosc',
      cookies: '/cookies',
      accessibility: '/dostepnosc',
      sitemap: '/mapa-strony',
    })
    expect(data?.company.consent).toEqual({ mode: 'info', version: 'v2', clause: 'Klauzula.' })
  })

  it('shows only published lines, by order, and only published salons', () => {
    const data = toSharedData(company, settings({}))
    expect(data?.lines.map((line) => line.key)).toEqual(['biznes', 'software'])
    expect(data?.salons.map((salon) => salon.key)).toEqual(['glowny'])
  })

  it('joins the line contact fields with its shared group', () => {
    const data = toSharedData(
      company,
      settings({ phoneLabel: 'Linia:', responsePromise: 'Szybko' }),
    )
    expect(data?.line).toMatchObject({
      phone: '111 222 333',
      phone2: '444 555 666',
      email: 'linia@firma.test',
      footerDescription: 'Opis linii.',
      phoneLabel: 'Linia:',
      responsePromise: 'Szybko',
    })
  })

  it('falls back to the company e-mail when the line has none', () => {
    expect(toSharedData(company, settings({}, { email: null }))?.line.email).toBe(
      'biuro@firma.test',
    )
  })

  it('hides texts and rows waiting for the boss or Krystian', () => {
    const data = toSharedData(
      company,
      settings({
        about: {
          h1: '[SZEF] Nagłówek',
          auth: ['[SZEF: Satel]', 'Elzab'],
          verify: [
            { title: 'CEIDG', text: 'Po NIP.' },
            { title: 'Posnet', text: '[Krystian: link]' },
          ],
        },
      }),
    )
    expect(data?.line.about?.h1).toBeNull()
    expect(data?.line.about?.auth).toEqual(['Elzab'])
    expect(data?.line.about?.verify?.map((row) => row.title)).toEqual(['CEIDG'])
  })

  it('has no line data without the settings of the tenant', () => {
    const data = toSharedData(company, null)
    expect(data?.line).toMatchObject({ phone: null, email: 'biuro@firma.test', rail: null })
  })
})
