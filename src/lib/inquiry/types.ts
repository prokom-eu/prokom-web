/**
 * Inquiry types (ADR-012 §3, ADR-014 §3): contact form, inquiry list (Biznes) or „Twój projekt”
 * (Software), wizard, „Zapytaj o X”, the audit form of Software.
 */
export const INQUIRY_TYPES = ['contact', 'list', 'wizard', 'search', 'audit'] as const
export type InquiryType = (typeof INQUIRY_TYPES)[number]

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  contact: 'Kontakt',
  list: 'Lista zapytania',
  wizard: 'Kreator',
  search: 'Zapytaj o frazę',
  audit: 'Audyt',
}

/**
 * How the customer wants to be contacted (plansza `Zapytanie`; Software wizard: `kreator.json` →
 * `contactPrefs[].inquiryValue`). A meeting and an online call are Software only.
 */
export const PREFERRED_CONTACTS = ['phone', 'whatsapp', 'email', 'meeting', 'online'] as const
export type PreferredContact = (typeof PREFERRED_CONTACTS)[number]

export const PREFERRED_CONTACT_LABELS: Record<PreferredContact, string> = {
  phone: 'Telefon',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  meeting: 'Spotkanie w salonie',
  online: 'Online',
}

export const SOFTWARE_ONLY_CONTACTS: readonly PreferredContact[] = ['meeting', 'online']

/** Topics of the Software contact form (ADR-014 §3.1); stored as values, e-mailed as labels. */
export const SOFTWARE_TOPIC_LABELS = {
  strona: 'Strona',
  system: 'System',
  mobile: 'Aplikacja mobilna',
  laczenie: 'Łączenie programów',
  opieka: 'Opieka',
  audyt: 'Audyt',
} as const

export type SoftwareTopic = keyof typeof SOFTWARE_TOPIC_LABELS

export function isSoftwareTopic(value: string): value is SoftwareTopic {
  return Object.hasOwn(SOFTWARE_TOPIC_LABELS, value)
}

/** Options of a Payload `select` field built from one of the lists above. */
export function selectOptions<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({ label: labels[value], value }))
}
