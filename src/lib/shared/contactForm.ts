import type { FormValues } from '../inquiry/form'
import { readContact } from './contact'

/**
 * Logic of the shared contact form (spec §5 `ContactForm`, ADR-003): what the visitor typed, the
 * browser's quick check, and the body for `POST /api/inquiry` (`buildInquiryBody`). The server
 * validates again with the line's rules (`lib/inquiry/schema.ts`).
 */
export type SharedFormValues = {
  /** The chip picked (`shared.contact.topics`), sent as the inquiry's subject (`category`). */
  topic: string | null
  /** „Imię i firma”. */
  name: string
  /** „Telefon lub e-mail”. */
  contact: string
  city: string
  message: string
  consent: boolean
  /** Honeypot. */
  website: string
}

export type SharedField = 'name' | 'contact' | 'message' | 'consent'

export type SharedRules = {
  /** Instalacje call back to arrange a visit: a phone, always (ADR-I002 §4). */
  phoneRequired?: boolean
  /** Biznes: „Wiadomość (opcjonalnie)” (K4-FINAL §5). */
  messageOptional?: boolean
  consentMode: 'checkbox' | 'info'
}

export const SHARED_MESSAGES = {
  name: 'Podaj imię albo nazwę firmy.',
  contactEmpty: 'Podaj telefon albo e-mail — wystarczy jedno.',
  phoneInvalid: 'Sprawdź numer — 9 cyfr, np. 600 100 200.',
  emailInvalid: 'Sprawdź adres e-mail, np. jan@firma.pl.',
  phoneRequired: 'Podaj numer telefonu, żebyśmy mogli oddzwonić, np. 600 100 200.',
  message: 'Napisz, w czym możemy pomóc (do 5000 znaków).',
  consent: 'Zaznacz zgodę, abyśmy mogli odpowiedzieć.',
} as const

/** The browser's check before sending: required fields and the contact's form. */
export function checkContactForm(
  values: SharedFormValues,
  rules: SharedRules,
): Partial<Record<SharedField, string>> {
  const errors: Partial<Record<SharedField, string>> = {}
  if (!values.name.trim()) errors.name = SHARED_MESSAGES.name
  const contact = readContact(values.contact)
  if (contact.kind === 'empty') {
    errors.contact = rules.phoneRequired
      ? SHARED_MESSAGES.phoneRequired
      : SHARED_MESSAGES.contactEmpty
  } else if (contact.kind === 'invalid') {
    errors.contact =
      contact.looksLike === 'phone' ? SHARED_MESSAGES.phoneInvalid : SHARED_MESSAGES.emailInvalid
  } else if (rules.phoneRequired && contact.kind === 'email') {
    errors.contact = SHARED_MESSAGES.phoneRequired
  }
  if (!rules.messageOptional && !values.message.trim()) errors.message = SHARED_MESSAGES.message
  if (rules.consentMode === 'checkbox' && !values.consent) errors.consent = SHARED_MESSAGES.consent
  return errors
}

/**
 * The values `buildInquiryBody` sends: the contact split into `phone` or `email`. With an
 * information clause (`info`) sending the form accepts it.
 */
export function toInquiryValues(values: SharedFormValues, rules: SharedRules): FormValues {
  const contact = readContact(values.contact)
  return {
    name: values.name,
    company: '',
    nip: '',
    email: contact.kind === 'email' ? contact.email : '',
    phone: contact.kind === 'phone' ? contact.phone : '',
    message: values.message,
    city: values.city,
    consent: rules.consentMode === 'info' ? true : values.consent,
    marketingConsent: false,
    website: values.website,
  }
}

/**
 * Messages by the server's field names (`readOutcome`): a missing or wrong `email` / `phone`
 * lands on the one contact field.
 */
export function serverMessages(rules: SharedRules) {
  const contact = rules.phoneRequired ? SHARED_MESSAGES.phoneRequired : SHARED_MESSAGES.contactEmpty
  return {
    name: SHARED_MESSAGES.name,
    email: contact,
    phone: rules.phoneRequired ? SHARED_MESSAGES.phoneRequired : SHARED_MESSAGES.phoneInvalid,
    message: SHARED_MESSAGES.message,
    consent: SHARED_MESSAGES.consent,
  }
}

/** Server fields → form fields. */
export function toFormFields(
  fields: Partial<Record<'name' | 'email' | 'phone' | 'message' | 'consent', string>>,
): Partial<Record<SharedField, string>> {
  const result: Partial<Record<SharedField, string>> = {}
  if (fields.name) result.name = fields.name
  if (fields.phone || fields.email) result.contact = fields.phone ?? fields.email
  if (fields.message) result.message = fields.message
  if (fields.consent) result.consent = fields.consent
  return result
}
