/**
 * Contact of pro-kom.eu (Krystian 22.11.2026), frozen for the data migration `hub_kontakt`: the
 * second number at Biznes and Instalacje on the home page (Instalacje's own second number goes into
 * its panel), and on `/kontakt` the H1 without „one number” plus the hub's e-mail in the hero bar
 * (the two company numbers are tiles of their own).
 */

export const BOTH_PHONES_2211 = ['biznes', 'instalacje'] as const
/** Instalacje's second number (Krystian 22.11). */
export const INSTALACJE_PHONE2 = '+48 501 046 249'
export const CONTACT_H1_OLD = 'Jeden numer. Pokierujemy, gdzie trzeba.'
export const CONTACT_H1_2211 = 'Zadzwoń albo napisz. Pokierujemy, gdzie trzeba.'
export const EMAIL_FACT = { kind: 'email', label: 'E-mail', icon: 'mail' } as const

type JsonObject = Record<string, unknown>
const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** `home` with `contact.bothPhones` (only while not set); `null` = no change. */
export function homeWithBothPhones(home: unknown): JsonObject | null {
  if (!isObject(home) || !isObject(home.contact) || home.contact.bothPhones != null) return null
  return { ...home, contact: { ...home.contact, bothPhones: [...BOTH_PHONES_2211] } }
}

/**
 * The `/kontakt` texts of the hub: the new H1 only where the old one still stands (a panel edit
 * wins), the e-mail fact only where the hero has no facts yet; `null` = no change.
 */
export function contactWith2211<T extends { h1?: string | null; facts?: unknown[] | null }>(
  contact: T | null | undefined,
): T | null {
  if (!contact) return null
  const h1 = contact.h1 === CONTACT_H1_OLD
  const facts = !contact.facts?.length
  if (!h1 && !facts) return null
  return {
    ...contact,
    ...(h1 && { h1: CONTACT_H1_2211 }),
    ...(facts && { facts: [{ ...EMAIL_FACT }] }),
  }
}

/** Instalacje's second number while its panel has none; `null` = no change (an edit wins). */
export function instalacjePhone2(current: string | null | undefined): string | null {
  return current?.trim() ? null : INSTALACJE_PHONE2
}
