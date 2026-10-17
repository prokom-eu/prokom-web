import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE } from './consent'
import { inquiryFieldErrors, parseInquiryInput } from './schema'

const valid = {
  name: 'Jan Kowalski',
  email: 'jan@example.test',
  message: 'Proszę o ofertę na kasę fiskalną.',
  source: { url: 'https://prokombiznes.pl/kasy?utm_source=google' },
  consent: { accepted: true, clauseVersion: CONSENT_CLAUSE.version },
}

function errorsOf(input: unknown): string[] {
  const result = parseInquiryInput(input)
  return result.success ? [] : inquiryFieldErrors(result.error)
}

describe('parseInquiryInput (ADR-003)', () => {
  it('accepts a minimal inquiry and defaults the marketing consent to false', () => {
    const result = parseInquiryInput(valid)
    expect(result.success).toBe(true)
    expect(result.data).toMatchObject({ ...valid, marketingConsent: false })
  })

  it('accepts all optional fields and trims text', () => {
    const result = parseInquiryInput({
      ...valid,
      name: '  Jan Kowalski ',
      category: 'Kasy fiskalne',
      company: 'Sklep Jan',
      nip: 'PL 526-000-12-46',
      phone: '+48 600 100 200',
      source: {
        url: 'https://prokombiznes.pl/',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'jesien',
      },
      marketingConsent: true,
    })
    expect(result.success).toBe(true)
    expect(result.data).toMatchObject({ name: 'Jan Kowalski', nip: '5260001246' })
  })

  it('treats empty optional fields as missing', () => {
    const result = parseInquiryInput({ ...valid, company: '', nip: ' ', phone: '', category: '' })
    expect(result.success).toBe(true)
    expect(result.data?.company).toBeUndefined()
    expect(result.data?.nip).toBeUndefined()
    expect(result.data?.phone).toBeUndefined()
  })

  it('requires an e-mail or a phone', () => {
    expect(errorsOf({ ...valid, email: undefined })).toEqual(['email'])
    expect(parseInquiryInput({ ...valid, email: undefined, phone: '600100200' }).success).toBe(true)
  })

  it.each([
    ['name', { name: '' }],
    ['email', { email: 'jan@' }],
    ['phone', { phone: '12' }],
    ['phone', { phone: '600 100 200 <script>' }],
    ['message', { message: ' ' }],
    ['message', { message: 'x'.repeat(5001) }],
    ['nip', { nip: '1234567890' }],
    ['source.url', { source: { url: 'javascript:alert(1)' } }],
    ['source.url', { source: { url: 'ftp://prokombiznes.pl/' } }],
  ])('rejects an invalid %s', (field, patch) => {
    expect(errorsOf({ ...valid, ...patch })).toContain(field)
  })

  it('requires the accepted consent with the current clause version', () => {
    expect(
      errorsOf({ ...valid, consent: { accepted: false, clauseVersion: CONSENT_CLAUSE.version } }),
    ).toContain('consent.accepted')
    expect(
      errorsOf({ ...valid, consent: { accepted: true, clauseVersion: '2020-01-01' } }),
    ).toContain('consent.clauseVersion')
    expect(errorsOf({ ...valid, consent: undefined })).toContain('consent')
  })

  it('ignores fields the client must not set (tenant, line, status)', () => {
    const result = parseInquiryInput({ ...valid, tenant: 2, line: 'software', status: 'closed' })
    expect(result.success).toBe(true)
    expect(result.data).not.toHaveProperty('tenant')
    expect(result.data).not.toHaveProperty('line')
    expect(result.data).not.toHaveProperty('status')
  })

  it('lists field paths only, never the submitted values', () => {
    const result = parseInquiryInput({ ...valid, email: 'secret-person@' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(JSON.stringify(inquiryFieldErrors(result.error))).not.toContain('secret-person')
    }
  })
})
