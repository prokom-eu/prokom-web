import type { WizardAnswers } from '../catalog/wizardKit'
import { CONSENT_CLAUSE } from './consent'
import { BIZNES_FIELD_MESSAGES, sourceFromHref } from './form'
import { HONEYPOT_FIELD } from './honeypot'

// Browser side of the wizard's last step (`/kreator`, spec. §6.8, plansza Kreator): what it
// sends to `POST /api/inquiry`. Only the answers — the server computes the kit (B10c).

export type WizardContact = {
  name: string
  phone: string
  city: string
  /** Optional words about the firm („Inna firma — opiszesz ją na końcu”). */
  message: string
  consent: boolean
  /** Honeypot: hidden from people, filled in by bots. */
  website: string
}

export type WizardFieldName = 'name' | 'phone' | 'city' | 'message' | 'consent' | 'wizard'

export const WIZARD_FIELD_MESSAGES: Record<WizardFieldName, string> = {
  name: BIZNES_FIELD_MESSAGES.name,
  phone: BIZNES_FIELD_MESSAGES.phone,
  city: 'Nazwa miejscowości jest za długa.',
  message: 'Wiadomość jest za długa.',
  consent: BIZNES_FIELD_MESSAGES.consent,
  // The rules changed in the panel while the page was open.
  wizard: 'Kreator się zmienił — odśwież stronę i wybierz jeszcze raz.',
}

/** Required fields of the board: name, phone and the consent (decision 24.10, B10c). */
export function checkWizardRequired(
  values: WizardContact,
): Partial<Record<WizardFieldName, string>> {
  const errors: Partial<Record<WizardFieldName, string>> = {}
  if (!values.name.trim()) errors.name = WIZARD_FIELD_MESSAGES.name
  if (!values.phone.trim()) errors.phone = WIZARD_FIELD_MESSAGES.phone
  if (!values.consent) errors.consent = WIZARD_FIELD_MESSAGES.consent
  return errors
}

export function buildWizardInquiryBody(
  values: WizardContact,
  { href, formToken, answers }: { href: string; formToken: string; answers: WizardAnswers },
) {
  return {
    type: 'wizard',
    source: sourceFromHref(href),
    name: values.name,
    phone: values.phone,
    city: values.city,
    message: values.message,
    wizard: answers,
    consent: { accepted: values.consent, clauseVersion: CONSENT_CLAUSE.version },
    [HONEYPOT_FIELD]: values.website,
    formToken,
  }
}
