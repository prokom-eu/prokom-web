import { describe, expect, it } from 'vitest'

import {
  ARCHITECTS_CONTACT,
  INSTALACJE_CONTACT,
  lineSettingsUpdate,
  siteContactUpdate,
} from './contact'

describe('siteContactUpdate', () => {
  it('replaces the sample phone and e-mail of `pnpm seed`', () => {
    expect(
      siteContactUpdate({ phone: '+48 000 000 102', email: 'instalacje@example.test' }),
    ).toEqual({ phone: INSTALACJE_CONTACT.phone, email: INSTALACJE_CONTACT.email })
  })

  it('keeps what an editor typed in the panel', () => {
    expect(siteContactUpdate({ phone: '18 123 45 67', email: 'biuro@firma.pl' })).toBeNull()
    expect(siteContactUpdate({ phone: '18 123 45 67', email: null })).toEqual({
      email: INSTALACJE_CONTACT.email,
    })
  })
})

describe('lineSettingsUpdate', () => {
  it('fills WhatsApp and the architects’ contact person while empty', () => {
    expect(lineSettingsUpdate({ whatsapp: null, architects: { name: '', role: null } })).toEqual({
      whatsapp: INSTALACJE_CONTACT.whatsapp,
      architects: { name: ARCHITECTS_CONTACT.name, role: ARCHITECTS_CONTACT.role },
    })
  })

  it('keeps a name, role and number set in the panel', () => {
    expect(
      lineSettingsUpdate({ whatsapp: '+48 600 000 000', architects: { name: 'Anna Nowak' } }),
    ).toBeNull()
    expect(
      lineSettingsUpdate({ whatsapp: '+48 600 100 200', architects: { role: 'Projekty' } }),
    ).toEqual({ architects: { name: ARCHITECTS_CONTACT.name, role: 'Projekty' } })
  })
})
