import type { Cart } from '../cart/cart'
import { CONSENT_CLAUSE } from './consent'
import type { ContactField } from '../software/wizard'
import type { WizardAnswers as SoftwareAnswers } from '../software/wizardFlow'
import { BIZNES_FIELD_MESSAGES, sourceFromHref, splitEmailOrPhone } from './form'
import { HONEYPOT_FIELD } from './honeypot'

// Browser side of Konfigurator 3.0 (`/konfigurator`, K35 §1, K4-FINAL §5): the form on the
// result sends the `?kr=` link and the items the customer chose; the server names the profile.

export type WizardContact = {
  name: string
  phone: string
  email: string
  /** „Dodatkowe informacje” (board: e.g. opening date, number of rooms). */
  message: string
  consent: boolean
  /** Honeypot: hidden from people, filled in by bots. */
  website: string
}

export type WizardFieldName =
  'name' | 'phone' | 'email' | 'message' | 'consent' | 'wizard' | 'items'

export const WIZARD_FIELD_MESSAGES: Record<WizardFieldName, string> = {
  name: BIZNES_FIELD_MESSAGES.name,
  phone: BIZNES_FIELD_MESSAGES.phone,
  email: 'Podaj poprawny adres e-mail.',
  message: 'Wiadomość jest za długa.',
  consent: BIZNES_FIELD_MESSAGES.consent,
  // The rules changed in the panel while the page was open.
  wizard: 'Konfigurator się zmienił — odśwież stronę i wybierz jeszcze raz.',
  items: 'Lista się zmieniła — odśwież stronę i sprawdź pozycje.',
}

/** Required: the name, a phone or an e-mail (K4-FINAL §5), the consent. */
export function checkWizardRequired(
  values: WizardContact,
): Partial<Record<WizardFieldName, string>> {
  const errors: Partial<Record<WizardFieldName, string>> = {}
  if (!values.name.trim()) errors.name = WIZARD_FIELD_MESSAGES.name
  if (!values.phone.trim() && !values.email.trim()) errors.phone = WIZARD_FIELD_MESSAGES.phone
  if (!values.consent) errors.consent = WIZARD_FIELD_MESSAGES.consent
  return errors
}

export function buildWizardInquiryBody(
  values: WizardContact,
  { href, formToken, kr, cart }: { href: string; formToken: string; kr: string; cart: Cart },
) {
  return {
    type: 'wizard',
    source: sourceFromHref(href),
    name: values.name,
    phone: values.phone,
    email: values.email,
    // An e-mail only: the answer goes by e-mail (like the drawer, K4-FINAL §5).
    preferredContact: values.phone.trim() ? 'phone' : 'email',
    message: values.message,
    wizard: { kr },
    // Only the slug, quantity and note: the server takes the name from the catalog.
    items: cart.map((item) => ({
      slug: item.id,
      quantity: item.q,
      ...(item.uwaga ? { note: item.uwaga } : {}),
    })),
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
