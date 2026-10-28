import { CONSENT_CLAUSE } from './consent'
import { FIELD_MESSAGES, sourceFromHref, splitEmailOrPhone } from './form'
import { HONEYPOT_FIELD } from './honeypot'
import type { SoftwareTopic } from './types'

// Browser side of the Software contact form (start page `#kontakt`, later `/kontakt`; spec. §7):
// what it sends to `POST /api/inquiry`. The server validates (ADR-003).

export type SoftwareContactValues = {
  /** Picked topic; `null` = none (the server takes an empty list). */
  topic: SoftwareTopic | null
  message: string
  /** „Imię i firma” — one field, stored as the name. */
  name: string
  /** „E-mail albo telefon”. */
  contact: string
  consent: boolean
  /** Honeypot: hidden from people, filled in by bots. */
  website: string
}

export type SoftwareContactField = 'message' | 'name' | 'contact' | 'consent'

/**
 * Error texts of the fields the wizard has no text for; `contact` and `consent` come from
 * `SoftwareSettings.wizard.send.errors` (spec. §7.2: „pozostałe formularze — te same teksty”).
 */
export const SOFTWARE_CONTACT_MESSAGES = {
  message: FIELD_MESSAGES.message,
  name: 'Podaj imię, żebyśmy wiedzieli, jak się zwracać.',
} as const

/** Required: description, name, a usable contact, consent — in the order of the fields. */
export function checkSoftwareContactRequired(
  values: SoftwareContactValues,
): Partial<Record<SoftwareContactField, true>> {
  const errors: Partial<Record<SoftwareContactField, true>> = {}
  if (!values.message.trim()) errors.message = true
  if (!values.name.trim()) errors.name = true
  if (!splitEmailOrPhone(values.contact)) errors.contact = true
  if (!values.consent) errors.consent = true
  return errors
}

export function buildSoftwareContactBody(
  values: SoftwareContactValues,
  { href, formToken }: { href: string; formToken: string },
) {
  return {
    type: 'contact',
    source: sourceFromHref(href),
    topics: values.topic ? [values.topic] : [],
    message: values.message,
    name: values.name,
    ...splitEmailOrPhone(values.contact),
    consent: { accepted: values.consent, clauseVersion: CONSENT_CLAUSE.version },
    [HONEYPOT_FIELD]: values.website,
    formToken,
  }
}
