/** Inquiry types (ADR-012 §3): contact form, inquiry list, wizard, „Zapytaj o X”. */
export const INQUIRY_TYPES = ['contact', 'list', 'wizard', 'search'] as const
export type InquiryType = (typeof INQUIRY_TYPES)[number]

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  contact: 'Kontakt',
  list: 'Lista zapytania',
  wizard: 'Kreator',
  search: 'Zapytaj o frazę',
}

/** How the customer wants to be contacted (plansza `Zapytanie`). */
export const PREFERRED_CONTACTS = ['phone', 'whatsapp', 'email'] as const
export type PreferredContact = (typeof PREFERRED_CONTACTS)[number]

export const PREFERRED_CONTACT_LABELS: Record<PreferredContact, string> = {
  phone: 'Telefon',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
}

/** Options of a Payload `select` field built from one of the lists above. */
export function selectOptions<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({ label: labels[value], value }))
}
