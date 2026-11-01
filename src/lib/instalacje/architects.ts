/*
 * Inquiry categories of the page for architects (ADR-I005 §3): saved in `Inquiries.category`
 * like the other forms of the line. The checklist PDF and the news by e-mail ask for an e-mail
 * instead of the phone (decided 01.11.2026); „Wyślij rzuty” keeps the phone of the line.
 */
export const ARCH_INQUIRY = {
  project: 'Architekci · projekt',
  checklist: 'Architekci · checklista PDF',
  news: 'Architekci · nowości',
} as const

const EMAIL_ONLY: readonly string[] = [ARCH_INQUIRY.checklist, ARCH_INQUIRY.news]

/** A category of an Instalacje form that needs an e-mail, not a phone. */
export const isEmailOnlyCategory = (category: string | undefined) =>
  category !== undefined && EMAIL_ONLY.includes(category)
