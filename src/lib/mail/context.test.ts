import { describe, expect, it } from 'vitest'

import type { SharedData } from '../shared/project'
import { toMailContext } from './context'

const shared = {
  company: {
    name: 'Firma',
    nip: '9999999999',
    address: { street: 'ul. Testowa 1', postalCode: '00-001', city: 'Testowo' },
    hours: [{ days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' }],
    legal: { privacy: '/prywatnosc' },
  },
  line: { phone: '111 222 333', phone2: null, email: 'kontakt@linia.test', hours: null },
} as unknown as SharedData

describe('toMailContext (D1-2, from getSharedData)', () => {
  it('takes the line contact, the company and the privacy page of the site', () => {
    expect(toMailContext(shared, 'https://linia.test', 'Linia')).toEqual({
      siteName: 'linia.test',
      origin: 'https://linia.test',
      phone: '111 222 333',
      phone2: null,
      email: 'kontakt@linia.test',
      company: {
        name: 'Firma',
        nip: '9999999999',
        address: 'ul. Testowa 1, 00-001 Testowo',
        hours: 'pn–pt 9:00–17:00',
      },
      privacyUrl: 'https://linia.test/prywatnosc',
    })
  })

  it('prefers the line hours and works without a known host', () => {
    const withHours = { ...shared, line: { ...shared.line, hours: 'pn–sob 8–16' } } as SharedData
    const ctx = toMailContext(withHours, null, 'Linia')
    expect(ctx?.company.hours).toBe('pn–sob 8–16')
    expect(ctx?.siteName).toBe('Linia')
    expect(ctx?.privacyUrl).toBeNull()
  })

  it('is null without shared data', () => {
    expect(toMailContext(null, 'https://linia.test', 'Linia')).toBeNull()
  })
})
