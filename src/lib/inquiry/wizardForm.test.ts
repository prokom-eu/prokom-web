import { describe, expect, it } from 'vitest'

import type { WizardAnswers } from '../catalog/wizardKit'
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
  city: 'Rabka-Zdrój',
  message: '',
  consent: true,
  website: '',
}

const answers: WizardAnswers = {
  businessType: 'gastro',
  salesPoints: '2',
  computers: '1–3',
  premises: 'nowy',
  needs: ['pos', 'kasa'],
  when: 'Przed sezonem',
}

describe('checkWizardRequired', () => {
  it('asks for the name, the phone and the consent', () => {
    expect(checkWizardRequired(contact)).toEqual({})
    expect(
      Object.keys(checkWizardRequired({ ...contact, name: ' ', phone: '', consent: false })),
    ).toEqual(['name', 'phone', 'consent'])
  })
})

describe('buildWizardInquiryBody', () => {
  it('sends the answers and the contact — a body the server schema accepts on Biznes', () => {
    const body = buildWizardInquiryBody(contact, {
      href: 'https://prokombiznes.pl/kreator?firma=gastro&utm_source=fb',
      formToken: 't',
      answers,
    })
    expect(body).toMatchObject({
      type: 'wizard',
      wizard: answers,
      source: { url: 'https://prokombiznes.pl/kreator', utmSource: 'fb' },
      consent: { accepted: true, clauseVersion: CONSENT_CLAUSE.version },
    })
    expect(body).not.toHaveProperty('items')
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
