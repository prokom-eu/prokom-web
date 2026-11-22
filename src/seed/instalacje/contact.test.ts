import { describe, expect, it } from 'vitest'

import {
  ARCHITECTS_CONTACT,
  footerText,
  INSTALACJE_CONTACT,
  INSTALACJE_FOOTER_TEXT,
  lineSettingsUpdate,
  siteContactUpdate,
} from './contact'

describe('siteContactUpdate', () => {
  it('replaces the sample phone and e-mail of `pnpm seed` and fills the second number', () => {
    expect(
      siteContactUpdate({ phone: '+48 000 000 102', email: 'instalacje@example.test' }),
    ).toEqual({
      phone: INSTALACJE_CONTACT.phone,
      phone2: INSTALACJE_CONTACT.phone2,
      email: INSTALACJE_CONTACT.email,
    })
  })

  it('keeps what an editor typed in the panel', () => {
    const typed = { phone: '18 123 45 67', phone2: '600 100 200', email: 'biuro@firma.pl' }
    expect(siteContactUpdate(typed)).toBeNull()
    expect(siteContactUpdate({ ...typed, email: null })).toEqual({
      email: INSTALACJE_CONTACT.email,
    })
  })
})

describe('lineSettingsUpdate', () => {
  it('fills the architects’ contact person while empty', () => {
    expect(lineSettingsUpdate({ architects: { name: '', role: null } })).toEqual({
      architects: { name: ARCHITECTS_CONTACT.name, role: ARCHITECTS_CONTACT.role },
    })
  })

  it('keeps a name and role set in the panel', () => {
    expect(lineSettingsUpdate({ architects: { name: 'Anna Nowak' } })).toBeNull()
    expect(lineSettingsUpdate({ architects: { role: 'Projekty' } })).toEqual({
      architects: { name: ARCHITECTS_CONTACT.name, role: 'Projekty' },
    })
  })
})

describe('footerText', () => {
  it('writes the line description over the sample or an empty footer text (L1-I)', () => {
    expect(footerText('PRO-KOM Instalacje — dane przykładowe.')).toBe(INSTALACJE_FOOTER_TEXT)
    expect(footerText('  ')).toBe(INSTALACJE_FOOTER_TEXT)
    expect(footerText(null)).toBe(INSTALACJE_FOOTER_TEXT)
  })

  it('keeps a text typed in the panel', () => {
    expect(footerText('Monitoring i sieci na Podhalu.')).toBeNull()
  })
})
