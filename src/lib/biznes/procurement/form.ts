import { CONSENT_CLAUSE } from '../../inquiry/consent'
import { BIZNES_FIELD_MESSAGES, sourceFromHref, type FieldName } from '../../inquiry/form'
import { HONEYPOT_FIELD } from '../../inquiry/honeypot'
import { isValidNip, normalizeNip } from '../../site/company'

/**
 * Browser side of the procurement form (ZAOPATRZENIE §7): a `contact` inquiry of the existing
 * contract (ADR-003) — the company is also the name, „Kiedy?” the deadline, the topic from the
 * page data; „Kim jesteś” and the count go into the message. The server validates the same.
 */
export type ProcurementFormValues = {
  company: string
  nip: string
  who: readonly string[]
  count: string
  city: string
  phone: string
  email: string
  when: string
  message: string
  consent: boolean
  /** Honeypot: hidden from people, filled in by bots. */
  website: string
}

export type ProcurementField = 'company' | 'nip' | 'phone' | 'email' | 'message' | 'consent'

export const PROCUREMENT_MESSAGES: Record<ProcurementField, string> = {
  company: 'Podaj nazwę firmy.',
  nip: 'Sprawdź NIP — suma kontrolna się nie zgadza.',
  phone: BIZNES_FIELD_MESSAGES.phone,
  email: BIZNES_FIELD_MESSAGES.email,
  message: BIZNES_FIELD_MESSAGES.message,
  consent: BIZNES_FIELD_MESSAGES.consent,
}

/** Required here: the company, a valid NIP (FAQ „W zapytaniu prosimy o NIP”), a contact, consent. */
export function checkProcurementForm(
  values: ProcurementFormValues,
): Partial<Record<ProcurementField, string>> {
  const errors: Partial<Record<ProcurementField, string>> = {}
  if (!values.company.trim()) errors.company = PROCUREMENT_MESSAGES.company
  if (!isValidNip(values.nip)) errors.nip = PROCUREMENT_MESSAGES.nip
  if (!values.phone.trim() && !values.email.trim()) errors.phone = PROCUREMENT_MESSAGES.phone
  if (!values.consent) errors.consent = PROCUREMENT_MESSAGES.consent
  return errors
}

/** The live hint under the NIP field. */
export function nipHint(value: string): { text: string; tone: 'plain' | 'ok' | 'bad' } {
  const digits = normalizeNip(value).replace(/\D/g, '')
  if (digits.length === 0) return { text: '10 cyfr, bez kresek', tone: 'plain' }
  if (digits.length < 10) return { text: `${digits.length} z 10 cyfr`, tone: 'plain' }
  return isValidNip(value)
    ? { text: '✓ NIP poprawny', tone: 'ok' }
    : { text: PROCUREMENT_MESSAGES.nip, tone: 'bad' }
}

export function buildProcurementBody(
  values: ProcurementFormValues,
  options: {
    href: string
    formToken: string
    topic: string
    whoLabel: string
    countLabel: string
  },
) {
  const extras = [
    values.who.length > 0 ? `${options.whoLabel}: ${values.who.join(', ')}` : '',
    values.count.trim() ? `${options.countLabel}: ${values.count.trim()}` : '',
  ].filter(Boolean)
  const message = [extras.join('\n'), values.message.trim()].filter(Boolean).join('\n\n')
  return {
    type: 'contact',
    source: sourceFromHref(options.href),
    name: values.company,
    company: values.company,
    nip: values.nip,
    phone: values.phone,
    email: values.email,
    city: values.city,
    ...(values.when.trim() && { deadline: values.when.trim() }),
    message,
    topics: [options.topic],
    consent: { accepted: values.consent, clauseVersion: CONSENT_CLAUSE.version },
    [HONEYPOT_FIELD]: values.website,
    formToken: options.formToken,
  }
}

/** The server's field verdict on the fields of this form: its `name` is the company here. */
export function procurementErrors(
  fields: Partial<Record<FieldName, string>>,
): Partial<Record<ProcurementField, string>> {
  const errors: Partial<Record<ProcurementField, string>> = {}
  for (const key of Object.keys(fields) as FieldName[]) {
    const field: ProcurementField = key === 'name' ? 'company' : key
    errors[field] = PROCUREMENT_MESSAGES[field]
  }
  return errors
}
