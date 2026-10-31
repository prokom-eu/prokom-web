import { CONSENT_CLAUSE } from './consent'
import { FIELD_MESSAGES, sourceFromHref, splitEmailOrPhone } from './form'
import { HONEYPOT_FIELD } from './honeypot'
import type { SoftwareTopic } from './types'

// Browser side of the Software contact form (start page `#kontakt` and `/kontakt`; spec. §7,
// §6.10): what it sends to `POST /api/inquiry`. The server validates (ADR-003).

/** „Jak wolisz rozmawiać?” on `/kontakt` (spec. §7.1: `meeting` = salon, `online`). */
export type SoftwareTalkWay = 'phone' | 'email' | 'meeting' | 'online'

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
  /** `/kontakt` only: slugs of „Twój projekt”; a non-empty list sends a `list` inquiry. */
  items?: readonly string[]
  /** `/kontakt` only: the way to talk; „E-mail” needs an e-mail address. */
  preferredContact?: SoftwareTalkWay | null
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

/**
 * „Jak wolisz rozmawiać?” as sent: the customer's pick, else what the contact field holds — an
 * e-mail address means e-mail, anything else the phone (board default). So a record with only an
 * e-mail never says „woli telefon”.
 */
export function talkWayFor(picked: SoftwareTalkWay | null, contact: string): SoftwareTalkWay {
  if (picked) return picked
  const recognised = splitEmailOrPhone(contact)
  return recognised && 'email' in recognised ? 'email' : 'phone'
}

const hasProject = (values: SoftwareContactValues) => (values.items?.length ?? 0) > 0

/**
 * Required: description (not with „Twój projekt”, spec. §6.10), name, a usable contact (an
 * e-mail when „E-mail” is the way to talk), consent — in the order of the fields.
 */
export function checkSoftwareContactRequired(
  values: SoftwareContactValues,
): Partial<Record<SoftwareContactField, true>> {
  const errors: Partial<Record<SoftwareContactField, true>> = {}
  if (!values.message.trim() && !hasProject(values)) errors.message = true
  if (!values.name.trim()) errors.name = true
  const contact = splitEmailOrPhone(values.contact)
  if (!contact || (values.preferredContact === 'email' && !('email' in contact)))
    errors.contact = true
  if (!values.consent) errors.consent = true
  return errors
}

export function buildSoftwareContactBody(
  values: SoftwareContactValues,
  { href, formToken }: { href: string; formToken: string },
) {
  const items = values.items ?? []
  return {
    type: items.length > 0 ? 'list' : 'contact',
    source: sourceFromHref(href),
    topics: values.topic ? [values.topic] : [],
    message: values.message,
    name: values.name,
    ...splitEmailOrPhone(values.contact),
    ...(items.length > 0 && { items: items.map((slug) => ({ slug, quantity: 1 })) }),
    ...(values.preferredContact && { preferredContact: values.preferredContact }),
    consent: { accepted: values.consent, clauseVersion: CONSENT_CLAUSE.version },
    [HONEYPOT_FIELD]: values.website,
    formToken,
  }
}
