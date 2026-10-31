import { describe, expect, it } from 'vitest'

import {
  AUDIT_URL_MESSAGE,
  buildAuditBody,
  checkAuditRequired,
  normalizeAuditUrl,
  type AuditValues,
} from './auditForm'
import { CONSENT_CLAUSE } from './consent'
import { parseInquiryInput } from './schema'

const values: AuditValues = {
  url: 'twojafirma.pl',
  name: 'Anna',
  contact: 'anna@example.com',
  consent: true,
  website: '',
}
const href = 'https://software.localhost/audyt?utm_source=google'

describe('audit form of /audyt (SW11a, spec. §6.5)', () => {
  it('takes the address as people type it: https:// added, spaces and a trailing dot dropped', () => {
    expect(normalizeAuditUrl('twojafirma.pl')).toBe('https://twojafirma.pl')
    expect(normalizeAuditUrl('  http://firma.pl/oferta ')).toBe('http://firma.pl/oferta')
    expect(normalizeAuditUrl('WWW.Firma.pl.')).toBe('https://www.firma.pl')
  })

  it('refuses what is not a site address', () => {
    for (const bad of ['', 'firma', 'ftp://firma.pl', 'jan@firma.pl', 'http://', 'a b.pl']) {
      expect(normalizeAuditUrl(bad)).toBeNull()
    }
  })

  it('asks for the address, the name, a usable contact and the consent, in that order', () => {
    expect(checkAuditRequired(values)).toEqual({})
    expect(
      Object.keys(
        checkAuditRequired({ url: 'firma', name: ' ', contact: '12', consent: false, website: '' }),
      ),
    ).toEqual(['url', 'name', 'contact', 'consent'])
    expect(AUDIT_URL_MESSAGE).toBe('Wpisz adres strony, np. twojafirma.pl.')
  })

  it('sends an `audit` with the address; the message is the server’s', () => {
    const body = buildAuditBody(values, { href, formToken: 't' })
    expect(body).toMatchObject({
      type: 'audit',
      auditUrl: 'https://twojafirma.pl',
      name: 'Anna',
      email: 'anna@example.com',
      source: { url: 'https://software.localhost/audyt', utmSource: 'google' },
      consent: { accepted: true, clauseVersion: CONSENT_CLAUSE.version },
    })
    expect(body).not.toHaveProperty('message')
    expect(parseInquiryInput(body, 'software').success).toBe(true)
    expect(parseInquiryInput(body, 'biznes').success).toBe(false)
  })

  it('stores a phone number as the phone', () => {
    const body = buildAuditBody({ ...values, contact: '600 100 200' }, { href, formToken: 't' })
    expect(body).toMatchObject({ phone: '600 100 200' })
    expect(parseInquiryInput(body, 'software').success).toBe(true)
  })
})
