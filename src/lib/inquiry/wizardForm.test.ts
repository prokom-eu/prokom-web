import { describe, expect, it } from 'vitest'

import { CONSENT_CLAUSE } from './consent'
import { parseInquiryInput } from './schema'
import { EMPTY_ANSWERS, type WizardAnswers as SoftwareAnswers } from '../software/wizardFlow'
import {
  ANONYMOUS_WIZARD_NAME,
  buildSoftwareWizardBody,
  buildWizardInquiryBody,
  checkSoftwareWizardRequired,
  checkWizardRequired,
  type SoftwareWizardContact,
  type WizardContact,
} from './wizardForm'

const contact: WizardContact = {
  name: 'Jan',
  phone: '600 100 200',
  email: '',
  message: '',
  consent: true,
  website: '',
}

describe('checkWizardRequired (Konfigurator 3.0)', () => {
  it('asks for the name, a phone or an e-mail, and the consent', () => {
    expect(checkWizardRequired(contact)).toEqual({})
    expect(checkWizardRequired({ ...contact, phone: '', email: 'jan@firma.pl' })).toEqual({})
    expect(
      Object.keys(checkWizardRequired({ ...contact, name: ' ', phone: '', consent: false })),
    ).toEqual(['name', 'phone', 'consent'])
  })
})

describe('buildWizardInquiryBody (Konfigurator 3.0)', () => {
  const href = 'https://prokombiznes.pl/konfigurator?kr=gastro%7Cnowa%7C2%7C%7C&utm_source=fb'

  it('sends the result link, the chosen items and the contact — a body the server accepts', () => {
    const body = buildWizardInquiryBody(contact, {
      href,
      formToken: 't',
      kr: 'gastro|nowa|2||dowozy:1',
      cart: [
        { id: 'posnet-ergo-online', q: 1, uwaga: 'Konfigurator: Kasa fiskalna' },
        { id: 'gopos', q: 2 },
      ],
    })
    expect(body).toMatchObject({
      type: 'wizard',
      wizard: { kr: 'gastro|nowa|2||dowozy:1' },
      items: [
        { slug: 'posnet-ergo-online', quantity: 1, note: 'Konfigurator: Kasa fiskalna' },
        { slug: 'gopos', quantity: 2 },
      ],
      source: { url: 'https://prokombiznes.pl/konfigurator', utmSource: 'fb' },
      consent: { accepted: true, clauseVersion: CONSENT_CLAUSE.version },
    })
    expect(parseInquiryInput(body, 'biznes').error?.issues).toBeUndefined()
  })

  it('sends nothing chosen as no items, and an e-mail only as contact by e-mail', () => {
    const body = buildWizardInquiryBody(
      { ...contact, phone: '', email: 'jan@firma.pl' },
      { href, formToken: 't', kr: 'gastro|nowa|2||', cart: [] },
    )
    expect(body).toMatchObject({ items: [], preferredContact: 'email' })
    expect(parseInquiryInput(body, 'biznes').error?.issues).toBeUndefined()
  })
})

describe('Software wizard form (SW7)', () => {
  const values: SoftwareWizardContact = {
    name: 'Anna',
    contact: 'anna@firma.pl',
    consent: true,
    website: '',
  }
  const softwareAnswers: SoftwareAnswers = { ...EMPTY_ANSWERS, need: 'firm', options: ['bud'] }

  it('asks for a usable contact and the consent (send.errors)', () => {
    expect(checkSoftwareWizardRequired(values)).toEqual({})
    expect(checkSoftwareWizardRequired({ ...values, contact: 'abc', consent: false })).toEqual({
      contact: true,
      consent: true,
    })
  })

  it('asks for the kind of contact the preference names (board: 9 digits of a phone)', () => {
    expect(checkSoftwareWizardRequired(values, 'email')).toEqual({})
    expect(checkSoftwareWizardRequired(values, 'phone')).toEqual({ contact: true })
    expect(checkSoftwareWizardRequired({ ...values, contact: '600 100 200' }, 'phone')).toEqual({})
    expect(checkSoftwareWizardRequired({ ...values, contact: '600 100' }, 'phone')).toEqual({
      contact: true,
    })
    expect(checkSoftwareWizardRequired({ ...values, contact: '600 100 200' }, 'email')).toEqual({
      contact: true,
    })
    expect(checkSoftwareWizardRequired({ ...values, contact: '600 100 200' }, 'any')).toEqual({})
  })

  it('sends the contact as an e-mail or a phone, the answers and a valid body', () => {
    const href = 'https://software.localhost:3000/dobierz?potrzeba=firm'
    const email = buildSoftwareWizardBody(values, {
      href,
      formToken: 't',
      answers: softwareAnswers,
    })
    expect(email).toMatchObject({ type: 'wizard', email: 'anna@firma.pl', wizard: softwareAnswers })
    expect(email).not.toHaveProperty('phone')
    expect(parseInquiryInput(email, 'software').success).toBe(true)

    const phone = buildSoftwareWizardBody(
      { ...values, name: ' ', contact: '+48 600 100 200' },
      { href, formToken: 't', answers: softwareAnswers },
    )
    expect(phone).toMatchObject({ phone: '+48 600 100 200', name: ANONYMOUS_WIZARD_NAME })
    expect(parseInquiryInput(phone, 'software').success).toBe(true)
  })
})
