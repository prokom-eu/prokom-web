import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE } from './consent'
import { readOutcome } from './form'
import {
  buildListInquiryBody,
  checkListRequired,
  itemsSummary,
  LIST_DEADLINES,
  LIST_FIELD_MESSAGES,
  listInquiryType,
  type ListFormValues,
} from './listForm'
import { parseInquiryInput } from './schema'

const values: ListFormValues = {
  name: 'Anna',
  phone: '600 100 200',
  company: 'Kawiarnia pod Turbaczem',
  city: 'Nowy Targ',
  email: '',
  preferredContact: 'whatsapp',
  deadline: 'Przed sezonem',
  message: '',
  consent: true,
  website: '',
}
const cart = [
  { id: 'posnet-ergo-online', q: 2, uwaga: 'Czarna' },
  { id: 'szuflada-posnet-skl', q: 1 },
]
const href = 'https://prokombiznes.pl/zapytanie?fraza=drukarka&utm_source=google'

describe('listInquiryType (plansza Zapytanie)', () => {
  it('is a list with items, a phrase without items, otherwise a plain contact', () => {
    expect(listInquiryType(2, 'drukarka')).toBe('list')
    expect(listInquiryType(0, 'drukarka')).toBe('search')
    expect(listInquiryType(0, '  ')).toBe('contact')
    expect(listInquiryType(0, null)).toBe('contact')
  })
})

describe('buildListInquiryBody — contact by e-mail only (K4-FINAL §5)', () => {
  it('answers by e-mail when a phone contact is chosen but only an e-mail is given', () => {
    for (const preferredContact of ['phone', 'whatsapp'] as const) {
      const emailOnly = { ...values, phone: ' ', email: 'anna@firma.pl', preferredContact }
      const body = buildListInquiryBody(emailOnly, { href, formToken: 't', cart, phrase: null })
      expect(body.preferredContact).toBe('email')
    }
  })

  it('keeps the chosen contact when the phone is there', () => {
    const body = buildListInquiryBody(values, { href, formToken: 't', cart, phrase: null })
    expect(body.preferredContact).toBe('whatsapp')
  })
})

describe('buildListInquiryBody', () => {
  it('sends the list as items and the phrase as a topic — accepted by the server', () => {
    const body = buildListInquiryBody(values, { href, formToken: 't', cart, phrase: 'drukarka' })
    expect(body).toMatchObject({
      type: 'list',
      items: [
        { slug: 'posnet-ergo-online', quantity: 2, note: 'Czarna' },
        { slug: 'szuflada-posnet-skl', quantity: 1 },
      ],
      topics: ['drukarka'],
      city: 'Nowy Targ',
      preferredContact: 'whatsapp',
      deadline: 'Przed sezonem',
      consent: { accepted: true, clauseVersion: CONSENT_CLAUSE.version },
      source: { url: 'https://prokombiznes.pl/zapytanie', utmSource: 'google' },
      formToken: 't',
    })
    expect(parseInquiryInput(body, 'biznes').success).toBe(true)
  })

  it('without items sends „Zapytaj o X” or a contact the server accepts', () => {
    const search = buildListInquiryBody(values, { href, formToken: 't', cart: [], phrase: 'wifi' })
    expect(search).toMatchObject({ type: 'search', topics: ['wifi'] })
    expect(search).not.toHaveProperty('items')
    expect(parseInquiryInput(search, 'biznes').success).toBe(true)

    const contact = buildListInquiryBody(
      { ...values, message: 'Potrzebuję kasy.' },
      { href, formToken: 't', cart: [], phrase: null },
    )
    expect(contact).toMatchObject({ type: 'contact', topics: [] })
    expect(parseInquiryInput(contact, 'biznes').success).toBe(true)
  })

  it('offers the deadlines of the board', () => {
    expect(LIST_DEADLINES).toEqual(['Pilne', 'W tym miesiącu', 'Przed sezonem', 'Bez pośpiechu'])
  })
})

describe('checkListRequired', () => {
  it('requires name, a phone or an e-mail, and consent; notes only without items and phrase', () => {
    expect(checkListRequired(values, 'list')).toEqual({})
    expect(checkListRequired(values, 'search')).toEqual({})
    expect(checkListRequired(values, 'contact')).toEqual({ message: LIST_FIELD_MESSAGES.message })
    expect(checkListRequired({ ...values, name: ' ', phone: '', consent: false }, 'list')).toEqual({
      name: LIST_FIELD_MESSAGES.name,
      phone: LIST_FIELD_MESSAGES.phone,
      consent: LIST_FIELD_MESSAGES.consent,
    })
  })

  it('accepts an e-mail instead of a phone (K4-FINAL §5)', () => {
    const emailOnly = {
      ...values,
      phone: ' ',
      email: 'anna@firma.pl',
      preferredContact: 'email' as const,
    }
    expect(checkListRequired(emailOnly, 'list')).toEqual({})
    expect(LIST_FIELD_MESSAGES.phone).toMatch(/telefon albo e-mail/)
  })

  it('requires the e-mail when „E-mail” is the chosen contact', () => {
    expect(checkListRequired({ ...values, preferredContact: 'email' }, 'list')).toEqual({
      email: LIST_FIELD_MESSAGES.email,
    })
    expect(
      checkListRequired({ ...values, preferredContact: 'email', email: 'a@b.pl' }, 'list'),
    ).toEqual({})
  })

  it('turns a field the form has no input for into a general error', () => {
    expect(
      readOutcome(400, { error: 'invalid', fields: ['deadline'] }, LIST_FIELD_MESSAGES),
    ).toMatchObject({ kind: 'invalid', fields: {}, formError: expect.stringMatching(/Nie udało/) })
  })

  it('shares the messages with the server verdict, also for a stale list', () => {
    expect(
      readOutcome(400, { error: 'invalid', fields: ['city', 'items'] }, LIST_FIELD_MESSAGES),
    ).toEqual({
      kind: 'invalid',
      fields: { city: LIST_FIELD_MESSAGES.city, items: LIST_FIELD_MESSAGES.items },
    })
  })
})

describe('itemsSummary (success screen)', () => {
  it('names the items with quantities above one', () => {
    expect(
      itemsSummary([
        { name: 'Posnet Ergo Online', quantity: 2 },
        { name: 'Szuflada Posnet SKL', quantity: 1 },
      ]),
    ).toBe('Posnet Ergo Online ×2, Szuflada Posnet SKL')
    expect(itemsSummary([])).toBe('zapytanie ogólne')
  })
})
