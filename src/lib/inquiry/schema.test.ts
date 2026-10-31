import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE } from './consent'
import type { Line } from '../tenant/lines'
import { inquiryFieldErrors, parseInquiryInput } from './schema'

const valid = {
  name: 'Jan Kowalski',
  email: 'jan@example.test',
  message: 'Proszę o ofertę na kasę fiskalną.',
  source: { url: 'https://prokombiznes.pl/kasy?utm_source=google' },
  consent: { accepted: true, clauseVersion: CONSENT_CLAUSE.version },
}

function errorsOf(input: unknown, line?: Line): string[] {
  const result = parseInquiryInput(input, line)
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

describe('parseInquiryInput — types of the Biznes forms (B8)', () => {
  const item = { slug: 'posnet-ergo-online', quantity: 2, note: 'Czarna' }
  const list = { ...valid, type: 'list', phone: '600100200', message: '', items: [item] }

  it('defaults the type to contact, so the forms of other lines keep working', () => {
    expect(parseInquiryInput(valid).data?.type).toBe('contact')
  })

  it('accepts a list with items, deadline, preferred contact and city; message optional', () => {
    const result = parseInquiryInput(
      { ...list, deadline: 'Przed sezonem', preferredContact: 'whatsapp', city: 'Nowy Targ' },
      'biznes',
    )
    expect(result.success).toBe(true)
    expect(result.data).toMatchObject({
      type: 'list',
      items: [item],
      deadline: 'Przed sezonem',
      preferredContact: 'whatsapp',
      city: 'Nowy Targ',
    })
    expect(result.data?.message).toBeUndefined()
  })

  it('requires at least one item on a list, and unique ones', () => {
    expect(errorsOf({ ...list, items: [] })).toContain('items')
    expect(errorsOf({ ...list, items: [item, item] })).toContain('items')
  })

  it('repeats the limits of the inquiry list (lib/cart)', () => {
    const many = Array.from({ length: 51 }, (_, i) => ({ slug: `p-${i}`, quantity: 1 }))
    expect(errorsOf({ ...list, items: many })).toContain('items')
    expect(errorsOf({ ...list, items: [{ ...item, quantity: 1000 }] })).toContain(
      'items.0.quantity',
    )
    expect(errorsOf({ ...list, items: [{ ...item, quantity: 0 }] })).toContain('items.0.quantity')
    expect(errorsOf({ ...list, items: [{ ...item, note: 'x'.repeat(501) }] })).toContain(
      'items.0.note',
    )
    expect(errorsOf({ ...list, items: [{ ...item, slug: '../admin' }] })).toContain('items.0.slug')
  })

  it.each([
    ['deadline', { deadline: 'x'.repeat(101) }],
    ['city', { city: 'x'.repeat(101) }],
    ['preferredContact', { preferredContact: 'fax' }],
    ['topics', { topics: Array.from({ length: 11 }, (_, i) => `t${i}`) }],
    ['topics.0', { topics: ['x'.repeat(101)] }],
    ['type', { type: 'order' }],
  ])('rejects an invalid %s', (field, patch) => {
    expect(errorsOf({ ...list, ...patch })).toContain(field)
  })

  it('requires the message for a contact only (the phrase or the list says the rest)', () => {
    expect(errorsOf({ ...valid, message: '' })).toContain('message')
    expect(errorsOf({ ...valid, type: 'search', topics: ['wifi'], message: '' })).toEqual([])
    expect(errorsOf({ ...list, message: '' })).toEqual([])
  })

  it('requires the phrase of „Zapytaj o X” on a search inquiry', () => {
    expect(errorsOf({ ...valid, type: 'search' })).toContain('topics')
    expect(parseInquiryInput({ ...valid, type: 'search', topics: ['wifi'] }).success).toBe(true)
  })

  it('requires the wizard answers on a wizard inquiry, up to 8 KB', () => {
    expect(errorsOf({ ...valid, type: 'wizard' })).toContain('wizard')
    expect(
      parseInquiryInput({ ...valid, type: 'wizard', wizard: { firma: 'gastro' } }).success,
    ).toBe(true)
    expect(
      errorsOf({ ...valid, type: 'wizard', wizard: { note: 'x'.repeat(8 * 1024) } }),
    ).toContain('wizard')
  })

  it('requires the e-mail when the customer chooses to be contacted by e-mail', () => {
    expect(errorsOf({ ...list, email: undefined, preferredContact: 'email' }, 'biznes')).toEqual([
      'email',
    ])
    expect(errorsOf({ ...list, preferredContact: 'email' }, 'biznes')).toEqual([])
  })

  it('accepts wizard answers in the wizard only (B10c)', () => {
    expect(errorsOf({ ...valid, wizard: { firma: 'gastro' } })).toContain('wizard')
  })

  it('accepts items on a list only', () => {
    expect(errorsOf({ ...valid, items: [item] })).toContain('items')
  })

  it('requires a phone or an e-mail on the Biznes forms, reported on the phone (K4-FINAL §5)', () => {
    const noContact = { phone: undefined, email: undefined }
    expect(errorsOf({ ...list, phone: undefined, email: 'jan@example.test' }, 'biznes')).toEqual([])
    expect(errorsOf({ ...list, ...noContact }, 'biznes')).toEqual(['phone'])
    expect(errorsOf({ ...valid, phone: undefined }, 'biznes')).toEqual([])
    expect(errorsOf({ ...valid, ...noContact }, 'biznes')).toEqual(['phone'])
    expect(
      errorsOf({ ...valid, type: 'search', topics: ['wifi'], ...noContact }, 'biznes'),
    ).toEqual(['phone'])
    // Other lines keep „e-mail or phone”, reported on the e-mail.
    expect(errorsOf({ ...valid, phone: undefined }, 'software')).toEqual([])
    expect(errorsOf({ ...valid, ...noContact }, 'software')).toEqual(['email'])
  })

  it('still requires the phone in the Biznes wizard until Konfigurator 3.0 (B10c, K4g)', () => {
    expect(
      errorsOf(
        { ...valid, type: 'wizard', wizard: { firma: 'gastro' }, phone: undefined },
        'biznes',
      ),
    ).toEqual(['phone'])
  })
})

describe('parseInquiryInput — Software forms (SW2b, ADR-014 §3)', () => {
  const audit = { ...valid, type: 'audit', message: undefined, auditUrl: 'https://firma.pl' }
  const project = {
    ...valid,
    type: 'list',
    items: [{ slug: 'strona-firmowa-z-panelem', quantity: 1 }],
  }

  it('accepts an audit with the address of the site, without a message', () => {
    expect(errorsOf(audit, 'software')).toEqual([])
    expect(parseInquiryInput(audit, 'software').data?.auditUrl).toBe('https://firma.pl')
  })

  it('requires an http(s) address on an audit, and the audit on Software only', () => {
    expect(errorsOf({ ...audit, auditUrl: undefined }, 'software')).toContain('auditUrl')
    expect(errorsOf({ ...audit, auditUrl: 'ftp://firma.pl' }, 'software')).toContain('auditUrl')
    expect(errorsOf({ ...audit, auditUrl: 'firma.pl' }, 'software')).toContain('auditUrl')
    expect(errorsOf({ ...audit, phone: '+48 600 100 200' }, 'biznes')).toContain('type')
  })

  it('accepts the address only on an audit or in the wizard („mam już stronę”)', () => {
    expect(errorsOf({ ...valid, auditUrl: 'https://firma.pl' }, 'software')).toContain('auditUrl')
    expect(
      errorsOf(
        { ...valid, type: 'wizard', wizard: { need: 'www' }, auditUrl: 'https://firma.pl' },
        'software',
      ),
    ).toEqual([]) // Biznes forms never take it, the wizard neither.
    expect(
      errorsOf(
        {
          ...valid,
          type: 'wizard',
          wizard: { firma: 'gastro' },
          phone: '+48 600 100 200',
          auditUrl: 'https://firma.pl',
        },
        'biznes',
      ),
    ).toContain('auditUrl')
  })

  it('accepts a meeting or an online call as the contact on Software only', () => {
    for (const preferredContact of ['meeting', 'online']) {
      expect(errorsOf({ ...valid, preferredContact }, 'software')).toEqual([])
      expect(
        errorsOf({ ...valid, preferredContact, phone: '+48 600 100 200' }, 'biznes'),
      ).toContain('preferredContact')
    }
  })

  it('accepts only the Software topics on a Software form', () => {
    expect(errorsOf({ ...valid, topics: ['strona', 'laczenie'] }, 'software')).toEqual([])
    expect(errorsOf({ ...valid, topics: ['kasy'] }, 'software')).toContain('topics')
  })

  it('takes one of each solution in „Twój projekt” (quantity 1)', () => {
    expect(errorsOf(project, 'software')).toEqual([])
    expect(
      errorsOf(
        { ...project, items: [{ slug: 'strona-firmowa-z-panelem', quantity: 2 }] },
        'software',
      ),
    ).toContain('items')
  })
})

describe('parseInquiryInput — Instalacje (ADR-I002 §4, decyzja Krystiana 31.10)', () => {
  const inst = {
    ...valid,
    email: undefined,
    phone: '600 100 200',
    source: { url: 'https://prokominstalacje.pl/kontakt' },
  }

  it('requires a phone of at least 9 digits, the e-mail stays optional', () => {
    expect(errorsOf(inst, 'instalacje')).toEqual([])
    expect(
      errorsOf({ ...inst, phone: undefined, email: 'jan@example.test' }, 'instalacje'),
    ).toEqual(['phone'])
    expect(errorsOf({ ...inst, phone: '600 100' }, 'instalacje')).toEqual(['phone'])
    expect(errorsOf({ ...inst, phone: '+48 600 100 200' }, 'instalacje')).toEqual([])
  })

  it('takes service keys as topics, nothing else', () => {
    expect(errorsOf({ ...inst, topics: ['kam', 'ev'] }, 'instalacje')).toEqual([])
    expect(errorsOf({ ...inst, topics: ['Monitoring'] }, 'instalacje')).toEqual(['topics'])
    expect(errorsOf({ ...inst, topics: ['kam', 'kam'] }, 'instalacje')).toEqual(['topics'])
  })

  it('keeps the other lines as they were', () => {
    expect(errorsOf({ ...inst, phone: undefined, email: 'jan@example.test' }, 'software')).toEqual(
      [],
    )
    expect(errorsOf({ ...inst, topics: ['Monitoring'] }, 'biznes')).toEqual([])
  })
})
