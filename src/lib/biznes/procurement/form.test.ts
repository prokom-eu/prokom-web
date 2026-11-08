import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE } from '../../inquiry/consent'
import { parseInquiryInput } from '../../inquiry/schema'
import {
  buildProcurementBody,
  checkProcurementForm,
  nipHint,
  PROCUREMENT_MESSAGES,
  procurementErrors,
  type ProcurementFormValues,
} from './form'

const VALUES: ProcurementFormValues = {
  company: 'Apartamenty Pod Giewontem',
  nip: '526-000-12-46',
  who: ['Deweloper'],
  count: '12',
  city: 'Zakopane',
  phone: '600 100 200',
  email: '',
  when: 'W ciągu miesiąca',
  message: 'Kawalerka × 12 lokali:\n– Lodówka × 12',
  consent: true,
  website: '',
}

const LABELS = {
  topic: 'Większa dostawa sprzętu',
  whoLabel: 'Kim jesteś',
  countLabel: 'Liczba lokali',
}

describe('procurement form (ZAOPATRZENIE §7, ADR-003)', () => {
  it('asks for the company, a valid NIP, a phone or an e-mail and the consent', () => {
    expect(checkProcurementForm(VALUES)).toEqual({})
    const empty = { ...VALUES, company: ' ', nip: '', phone: '', consent: false }
    expect(Object.keys(checkProcurementForm(empty))).toEqual(['company', 'nip', 'phone', 'consent'])
    expect(checkProcurementForm({ ...VALUES, nip: '5260001247' }).nip).toBe(
      PROCUREMENT_MESSAGES.nip,
    )
    expect(checkProcurementForm({ ...VALUES, phone: '', email: 'a@b.pl' })).toEqual({})
  })

  it('hints the NIP while typing: digits so far, then the checksum verdict', () => {
    expect(nipHint('')).toEqual({ text: '10 cyfr, bez kresek', tone: 'plain' })
    expect(nipHint('526-00')).toEqual({ text: '5 z 10 cyfr', tone: 'plain' })
    expect(nipHint('526-000-12-46').tone).toBe('ok')
    expect(nipHint('5260001247').tone).toBe('bad')
  })

  it('sends a contact inquiry the server accepts, with the topic and the extras in the message', () => {
    const body = buildProcurementBody(VALUES, {
      href: 'http://biznes.localhost:3000/agd-rtv-dla-firm?typ=pokoj&n=30#zestaw',
      formToken: 'token',
      ...LABELS,
    })
    expect(body).toMatchObject({
      type: 'contact',
      source: { url: 'http://biznes.localhost:3000/agd-rtv-dla-firm' },
      name: VALUES.company,
      company: VALUES.company,
      nip: VALUES.nip,
      city: 'Zakopane',
      deadline: 'W ciągu miesiąca',
      topics: ['Większa dostawa sprzętu'],
      consent: { accepted: true, clauseVersion: CONSENT_CLAUSE.version },
      formToken: 'token',
    })
    expect(body.message).toBe(
      'Kim jesteś: Deweloper\nLiczba lokali: 12\n\nKawalerka × 12 lokali:\n– Lodówka × 12',
    )
    const parsed = parseInquiryInput(body, 'biznes')
    expect(parsed.success).toBe(true)
    expect(parsed.data?.nip).toBe('5260001246')
  })

  it('leaves out the empty extras', () => {
    const body = buildProcurementBody(
      { ...VALUES, who: [], count: ' ', when: '', city: '', message: '' },
      { href: 'http://biznes.localhost/agd-rtv-dla-firm', formToken: 't', ...LABELS },
    )
    expect(body.message).toBe('')
    expect(body).not.toHaveProperty('deadline')
  })

  it('shows the server verdict on the fields of this form (the name is the company)', () => {
    expect(procurementErrors({ name: 'x', nip: 'y', email: 'z' })).toEqual({
      company: PROCUREMENT_MESSAGES.company,
      nip: PROCUREMENT_MESSAGES.nip,
      email: PROCUREMENT_MESSAGES.email,
    })
  })
})
