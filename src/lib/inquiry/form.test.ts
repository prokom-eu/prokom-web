import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE, PRIVACY_POLICY_LINK_TEXT } from './consent'
import {
  BIZNES_FIELD_MESSAGES,
  buildInquiryBody,
  checkRequired,
  linkInText,
  readOutcome,
  sourceFromHref,
  type FormValues,
} from './form'
import { parseInquiryInput } from './schema'

const values: FormValues = {
  name: ' Jan Kowalski ',
  company: '',
  nip: '',
  email: 'jan@example.test',
  phone: '',
  message: 'Proszę o ofertę.',
  consent: true,
  marketingConsent: false,
  website: '',
}

describe('sourceFromHref', () => {
  it('keeps the page address without parameters or fragment, and reads the UTM parameters', () => {
    expect(
      sourceFromHref(
        'https://prokombiznes.pl/kontakt?utm_source=google&utm_medium=cpc&utm_campaign=jesien&gclid=abc#formularz',
      ),
    ).toEqual({
      url: 'https://prokombiznes.pl/kontakt',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'jesien',
    })
  })

  it('fits the server limits however long the address is', () => {
    const source = sourceFromHref(
      `https://prokombiznes.pl/kontakt?fbclid=${'x'.repeat(3000)}&utm_source=${'g'.repeat(500)}`,
    )
    expect(source.url).toBe('https://prokombiznes.pl/kontakt')
    expect(source.utmSource).toHaveLength(200)
  })

  it('leaves out missing UTM parameters', () => {
    expect(sourceFromHref('https://prokombiznes.pl/')).toEqual({ url: 'https://prokombiznes.pl/' })
  })
})

describe('buildInquiryBody', () => {
  const body = buildInquiryBody(values, {
    href: 'https://prokombiznes.pl/kontakt',
    formToken: 't',
    category: 'Kasy fiskalne',
  })

  it('is accepted by the server schema (one contract, ADR-003)', () => {
    expect(parseInquiryInput(body).success).toBe(true)
  })

  it('sends the current clause version, the token, the honeypot and the category', () => {
    expect(body).toMatchObject({
      consent: { accepted: true, clauseVersion: CONSENT_CLAUSE.version },
      formToken: 't',
      website: '',
      category: 'Kasy fiskalne',
    })
  })

  it('sends an unchecked consent as not accepted (the server rejects it)', () => {
    const rejected = buildInquiryBody(
      { ...values, consent: false },
      { href: 'https://a.pl/', formToken: 't' },
    )
    expect(rejected.consent.accepted).toBe(false)
  })
})

describe('readOutcome', () => {
  it('reads a saved inquiry', () => {
    expect(readOutcome(201, { ok: true, number: 'PKB-2026-0042' })).toEqual({
      kind: 'sent',
      number: 'PKB-2026-0042',
    })
    expect(readOutcome(201, { ok: true })).toEqual({ kind: 'sent', number: null })
  })

  it('uses the messages of the form when given', () => {
    expect(
      readOutcome(400, { error: 'invalid', fields: ['phone'] }, BIZNES_FIELD_MESSAGES),
    ).toEqual({ kind: 'invalid', fields: { phone: BIZNES_FIELD_MESSAGES.phone } })
  })

  it('maps invalid fields to messages next to the fields', () => {
    const outcome = readOutcome(400, {
      error: 'invalid',
      fields: ['name', 'email', 'consent.accepted', 'nip'],
    })
    expect(outcome.kind).toBe('invalid')
    if (outcome.kind !== 'invalid') return
    expect(Object.keys(outcome.fields)).toEqual(['name', 'email', 'consent', 'nip'])
    expect(outcome.fields.email).toMatch(/e-mail albo telefon/)
    expect(outcome.formError).toBeUndefined()
  })

  it('shows a general error when the server names no field', () => {
    expect(readOutcome(400, { error: 'invalid', fields: [] })).toMatchObject({
      kind: 'invalid',
      fields: {},
      formError: expect.stringMatching(/Nie udało się/),
    })
  })

  it('asks to reload when the clause version or the form is outdated', () => {
    const outdated = readOutcome(400, { error: 'invalid', fields: ['consent.clauseVersion'] })
    expect(outdated).toMatchObject({ kind: 'invalid', formError: expect.stringMatching(/Odśwież/) })
    expect(readOutcome(400, { error: 'rejected' })).toMatchObject({
      kind: 'error',
      message: expect.stringMatching(/Odśwież/),
    })
  })

  it.each([
    [429, { error: 'rate_limited' }, /kilka minut/],
    [503, { error: 'unavailable' }, /zadzwoń/],
    [500, null, /zadzwoń/],
  ])('explains status %i', (status, json, message) => {
    expect(readOutcome(status, json)).toMatchObject({
      kind: 'error',
      message: expect.stringMatching(message),
    })
  })
})

describe('linkInText', () => {
  it('splits the clause around the policy words', () => {
    expect(linkInText('Szczegóły w polityce prywatności.', 'polityce prywatności')).toEqual({
      before: 'Szczegóły w ',
      link: 'polityce prywatności',
      after: '.',
    })
  })

  it('returns null when the words are not in the text', () => {
    expect(linkInText('Inna treść.', 'polityce prywatności')).toBeNull()
  })

  it('finds the words in the current clause', () => {
    expect(linkInText(CONSENT_CLAUSE.text, PRIVACY_POLICY_LINK_TEXT)).not.toBeNull()
  })
})

describe('checkRequired (instant feedback before sending)', () => {
  it('passes a complete form', () => {
    expect(checkRequired(values)).toEqual({})
  })

  it('reports the empty required fields with the server messages', () => {
    const errors = checkRequired({ ...values, name: ' ', email: '', message: '', consent: false })
    expect(Object.keys(errors)).toEqual(['name', 'email', 'message', 'consent'])
    expect(readOutcome(400, { error: 'invalid', fields: ['email'] })).toMatchObject({
      fields: { email: errors.email },
    })
  })

  it('accepts a phone instead of an e-mail', () => {
    expect(checkRequired({ ...values, email: '', phone: '600100200' })).toEqual({})
  })
})

describe('Biznes contact form v20 (ZMIANY-v20 §2.9)', () => {
  const biznes = { ...values, email: '', phone: '600 100 200' }
  const rules = { phoneRequired: true, messages: BIZNES_FIELD_MESSAGES }

  it('requires name, phone, message and consent; the e-mail is optional', () => {
    expect(checkRequired(biznes, rules)).toEqual({})
    const errors = checkRequired(
      { ...biznes, name: '', phone: ' ', message: '', consent: false, email: 'jan@example.test' },
      rules,
    )
    expect(errors).toEqual({
      name: BIZNES_FIELD_MESSAGES.name,
      phone: BIZNES_FIELD_MESSAGES.phone,
      message: BIZNES_FIELD_MESSAGES.message,
      consent: BIZNES_FIELD_MESSAGES.consent,
    })
  })

  it('sends a contact inquiry the server accepts on the Biznes line', () => {
    const body = buildInquiryBody(biznes, {
      href: 'https://prokombiznes.pl/#kontakt',
      formToken: 't',
      type: 'contact',
    })
    expect(body.type).toBe('contact')
    expect(parseInquiryInput(body, 'biznes').success).toBe(true)
  })
})
