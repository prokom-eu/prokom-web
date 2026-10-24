import { CONSENT_CLAUSE } from './consent'
import { HONEYPOT_FIELD } from './honeypot'
import type { InquiryType } from './types'

// Browser side of the inquiry form: what the form sends to `POST /api/inquiry` and how it reads
// the answer. No Zod here — the server validates (ADR-003) and the form shows its verdict.

export type FormValues = {
  name: string
  company: string
  nip: string
  email: string
  phone: string
  message: string
  consent: boolean
  marketingConsent: boolean
  /** Honeypot: hidden from people, filled in by bots. */
  website: string
}

export type FieldName = 'name' | 'company' | 'nip' | 'email' | 'phone' | 'message' | 'consent'

export type FieldMessages = Record<FieldName, string>

type Source = { url: string; utmSource?: string; utmMedium?: string; utmCampaign?: string }

/**
 * Splits a text around the words that become a link. `null` when the words are missing,
 * so a reworded clause falls back to a separate link instead of losing it.
 */
export function linkInText(
  text: string,
  linkText: string,
): { before: string; link: string; after: string } | null {
  const at = text.indexOf(linkText)
  if (at < 0) return null
  return { before: text.slice(0, at), link: linkText, after: text.slice(at + linkText.length) }
}

const UTM = { utmSource: 'utm_source', utmMedium: 'utm_medium', utmCampaign: 'utm_campaign' }

// Server limit per UTM value (`schema.ts`).
const UTM_MAX = 200

/**
 * Page address and its UTM parameters, so the office knows where the inquiry came from. Only
 * the path: other parameters (`gclid`, `fbclid`…) are tracking ids we do not need to keep,
 * and they could push the address past the server's 2000-character limit.
 */
export function sourceFromHref(href: string): Source {
  const url = new URL(href)
  const source: Source = { url: `${url.origin}${url.pathname}` }
  for (const [key, param] of Object.entries(UTM) as [keyof typeof UTM, string][]) {
    const value = url.searchParams.get(param)?.trim()
    if (value) source[key] = value.slice(0, UTM_MAX)
  }
  return source
}

export function buildInquiryBody(
  values: FormValues,
  {
    href,
    formToken,
    category,
    type,
  }: { href: string; formToken: string; category?: string | null; type?: InquiryType },
) {
  return {
    // Without a type the server takes `contact` (the generic form of every line).
    ...(type ? { type } : {}),
    ...(category ? { category } : {}),
    source: sourceFromHref(href),
    name: values.name,
    company: values.company,
    nip: values.nip,
    email: values.email,
    phone: values.phone,
    message: values.message,
    consent: { accepted: values.consent, clauseVersion: CONSENT_CLAUSE.version },
    marketingConsent: values.marketingConsent,
    [HONEYPOT_FIELD]: values.website,
    formToken,
  }
}

export const FIELD_MESSAGES: FieldMessages = {
  name: 'Podaj imię i nazwisko.',
  company: 'Nazwa firmy jest za długa.',
  nip: 'Sprawdź NIP — powinien mieć 10 cyfr.',
  // The server reports "neither e-mail nor phone" on `email` too.
  email: 'Podaj poprawny e-mail albo telefon.',
  phone: 'Podaj poprawny numer telefonu.',
  message: 'Napisz, w czym możemy pomóc (do 5000 znaków).',
  consent: 'Zaznacz zgodę, abyśmy mogli odpowiedzieć.',
}

/** Biznes forms ask for a phone and an optional e-mail (ZMIANY-v20 §2.9, plansza Zapytanie). */
export const BIZNES_FIELD_MESSAGES: FieldMessages = {
  ...FIELD_MESSAGES,
  name: 'Podaj imię.',
  email: 'Sprawdź adres e-mail albo zostaw to pole puste.',
  phone: 'Podaj numer telefonu, np. 600 100 200.',
}

/** Rules of one form: the Biznes line requires a phone (the server checks the same). */
export type FormRules = { phoneRequired?: boolean; messages?: FieldMessages }

/**
 * Required fields only — the browser's quick check before a request. Formats (e-mail, NIP,
 * phone) stay with the server, so there is one set of rules.
 */
export function checkRequired(
  values: FormValues,
  { phoneRequired = false, messages = FIELD_MESSAGES }: FormRules = {},
): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {}
  if (!values.name.trim()) errors.name = messages.name
  if (phoneRequired) {
    if (!values.phone.trim()) errors.phone = messages.phone
  } else if (!values.email.trim() && !values.phone.trim()) {
    errors.email = messages.email
  }
  if (!values.message.trim()) errors.message = messages.message
  if (!values.consent) errors.consent = messages.consent
  return errors
}

const RELOAD = 'Formularz jest nieaktualny. Odśwież stronę i wyślij go ponownie.'
const FALLBACK =
  'Nie udało się wysłać zapytania. Spróbuj za chwilę albo zadzwoń do nas — numer jest w stopce.'

export type Outcome<F extends string = FieldName> =
  | { kind: 'sent'; number: string | null }
  | { kind: 'invalid'; fields: Partial<Record<F, string>>; formError?: string }
  | { kind: 'error'; message: string }

/**
 * Turns the endpoint's answer into what the form shows. `messages` names the fields of the
 * form; a field the server reports but the form does not know becomes a general error.
 */
export function readOutcome<F extends string = FieldName>(
  status: number,
  json: unknown,
  messages: Record<F, string> = FIELD_MESSAGES as Record<F, string>,
): Outcome<F> {
  const body = (typeof json === 'object' && json !== null ? json : {}) as {
    error?: unknown
    fields?: unknown
    number?: unknown
  }
  if (status === 201) {
    return { kind: 'sent', number: typeof body.number === 'string' ? body.number : null }
  }
  if (status === 429) {
    return { kind: 'error', message: 'Wysłano już kilka zapytań. Spróbuj za kilka minut.' }
  }
  if (status === 400 && body.error === 'rejected') return { kind: 'error', message: RELOAD }
  if (status === 400 && body.error === 'invalid' && Array.isArray(body.fields)) {
    const fields: Partial<Record<F, string>> = {}
    let formError: string | undefined
    for (const path of body.fields as string[]) {
      if (path === 'consent.clauseVersion') formError = RELOAD
      const field = path.split('.')[0] as F
      if (Object.hasOwn(messages, field) && path !== 'consent.clauseVersion') {
        fields[field] = messages[field]
      } else if (!formError) {
        formError = FALLBACK
      }
    }
    // No field named (e.g. a malformed request): the form must still say something.
    if (Object.keys(fields).length === 0) formError ??= FALLBACK
    return { kind: 'invalid', fields, ...(formError ? { formError } : {}) }
  }
  return { kind: 'error', message: FALLBACK }
}
