import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE } from './consent'
import {
  buildInquiryBody,
  checkRequired,
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
  it('keeps the page address without the fragment and reads the UTM parameters', () => {
    expect(
      sourceFromHref(
        'https://prokombiznes.pl/kontakt?utm_source=google&utm_medium=cpc&utm_campaign=jesien&x=1#formularz',
      ),
    ).toEqual({
      url: 'https://prokombiznes.pl/kontakt?utm_source=google&utm_medium=cpc&utm_campaign=jesien&x=1',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'jesien',
    })
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
    expect(readOutcome(201, { ok: true })).toEqual({ kind: 'sent' })
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
