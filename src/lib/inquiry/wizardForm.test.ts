import { describe, expect, it } from 'vitest'

import type { WizardAnswers } from '../catalog/wizardKit'
import { CONSENT_CLAUSE } from './consent'
import { parseInquiryInput } from './schema'
import { buildWizardInquiryBody, checkWizardRequired, type WizardContact } from './wizardForm'

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
