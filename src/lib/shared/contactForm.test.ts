import { describe, expect, it } from 'vitest'

import {
  checkContactForm,
  serverMessages,
  sharedRulesFor,
  SHARED_MESSAGES,
  toFormFields,
  toInquiryValues,
  type SharedFormValues,
} from './contactForm'

const filled: SharedFormValues = {
  topic: 'Kasy fiskalne',
  name: 'Jan, Kawiarnia Pod Lasem',
  contact: '600 100 200',
  city: 'Szaflary',
  message: 'Potrzebujemy kasy.',
  consent: true,
  website: '',
}

describe('checkContactForm (spec §5 ContactForm)', () => {
  it('a filled form passes', () => {
    expect(checkContactForm(filled, { consentMode: 'checkbox' })).toEqual({})
  })

  it('explains each missing field, the contact by what was typed', () => {
    const empty = { ...filled, name: ' ', contact: '', message: '', consent: false }
    expect(checkContactForm(empty, { consentMode: 'checkbox' })).toEqual({
      name: SHARED_MESSAGES.name,
      contact: SHARED_MESSAGES.contactEmpty,
      message: SHARED_MESSAGES.message,
      consent: SHARED_MESSAGES.consent,
    })
    expect(
      checkContactForm({ ...filled, contact: '600 100' }, { consentMode: 'checkbox' }),
    ).toEqual({
      contact: SHARED_MESSAGES.phoneInvalid,
    })
    expect(checkContactForm({ ...filled, contact: 'jan@' }, { consentMode: 'checkbox' })).toEqual({
      contact: SHARED_MESSAGES.emailInvalid,
    })
  })

  it('line rules: Instalacje want a phone, Biznes takes no message, a clause needs no tick', () => {
    expect(
      checkContactForm(
        { ...filled, contact: 'jan@firma.pl' },
        { consentMode: 'checkbox', phoneRequired: true },
      ),
    ).toEqual({ contact: SHARED_MESSAGES.phoneRequired })
    expect(
      checkContactForm(
        { ...filled, message: '' },
        { consentMode: 'checkbox', messageOptional: true },
      ),
    ).toEqual({})
    expect(checkContactForm({ ...filled, consent: false }, { consentMode: 'info' })).toEqual({})
  })
})

describe('toInquiryValues', () => {
  it('sends the contact as phone or e-mail, the honeypot as typed', () => {
    expect(toInquiryValues(filled)).toMatchObject({
      phone: '600 100 200',
      email: '',
      city: 'Szaflary',
      consent: true,
      website: '',
    })
    expect(toInquiryValues({ ...filled, contact: 'jan@firma.pl' })).toMatchObject({
      phone: '',
      email: 'jan@firma.pl',
    })
  })

  it('sends the consent as ticked — never made up (ADR-022 D2-3a)', () => {
    expect(toInquiryValues({ ...filled, consent: false }).consent).toBe(false)
  })
})

describe('toFormFields', () => {
  it('puts the server’s e-mail or phone error on the one contact field', () => {
    expect(toFormFields({ email: 'x' })).toEqual({ contact: 'x' })
    expect(toFormFields({ phone: 'y', name: 'z' })).toEqual({ contact: 'y', name: 'z' })
  })
})

describe('sharedRulesFor — the rules the server applies', () => {
  it('Instalacje want a phone, Biznes no message, Software both required', () => {
    expect(sharedRulesFor('instalacje')).toEqual({ phoneRequired: true, messageOptional: false })
    expect(sharedRulesFor('biznes')).toEqual({ phoneRequired: false, messageOptional: true })
    expect(sharedRulesFor('software')).toEqual({ phoneRequired: false, messageOptional: false })
  })

  it('a wrong e-mail from the server reads as a wrong e-mail', () => {
    expect(serverMessages({ consentMode: 'checkbox' }).email).toBe(SHARED_MESSAGES.emailInvalid)
  })
})
