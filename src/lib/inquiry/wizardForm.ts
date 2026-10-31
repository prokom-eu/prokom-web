import type { WizardAnswers } from '../catalog/wizardKit'
import { CONSENT_CLAUSE } from './consent'
import type { ContactField } from '../software/wizard'
import type { WizardAnswers as SoftwareAnswers } from '../software/wizardFlow'
import { BIZNES_FIELD_MESSAGES, sourceFromHref, splitEmailOrPhone } from './form'
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
  // The wizard still requires the phone (B10c) until Konfigurator 3.0 (K4g).
  phone: 'Podaj numer telefonu, np. 600 100 200.',
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

/** Last step of the Software wizard (`/dobierz`, spec. §6.3): name, one contact field, consent. */
export type SoftwareWizardContact = {
  name: string
  /** „Telefon albo e-mail”. */
  contact: string
  consent: boolean
  website: string
}

/**
 * Errors of the board: no contact of the kind the preference asks for (`send.contact.<field>`:
 * a phone of at least 9 digits, an e-mail, or either), no consent.
 */
export function checkSoftwareWizardRequired(
  values: SoftwareWizardContact,
  field: ContactField = 'any',
): Partial<Record<'contact' | 'consent', true>> {
  const errors: Partial<Record<'contact' | 'consent', true>> = {}
  const contact = splitEmailOrPhone(values.contact)
  const fits =
    field === 'email'
      ? !!contact && 'email' in contact
      : field === 'phone'
        ? !!contact && 'phone' in contact && contact.phone.replace(/\D/g, '').length >= 9
        : !!contact
  if (!fits) errors.contact = true
  if (!values.consent) errors.consent = true
  return errors
}

/**
 * Body of `POST /api/inquiry`: the answers only — the server checks them against its rules,
 * writes the message and maps the contact preference. Without a name the office reads
 * „Klient kreatora” (the board's name field is optional; the schema needs one).
 */
export function buildSoftwareWizardBody(
  values: SoftwareWizardContact,
  { href, formToken, answers }: { href: string; formToken: string; answers: SoftwareAnswers },
) {
  return {
    type: 'wizard',
    source: sourceFromHref(href),
    name: values.name.trim() || ANONYMOUS_WIZARD_NAME,
    ...splitEmailOrPhone(values.contact),
    wizard: answers,
    consent: { accepted: values.consent, clauseVersion: CONSENT_CLAUSE.version },
    [HONEYPOT_FIELD]: values.website,
    formToken,
  }
}

export const ANONYMOUS_WIZARD_NAME = 'Klient kreatora'
