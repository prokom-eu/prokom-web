import { z } from 'zod'

import { ICON_NAMES } from '../catalog/options'

import { firstIssue, href, label, obj, text } from './schema'

/**
 * Texts of two system pages of the Software line (ADR-014 rozstrz. v20 11; v24: ZMIANY-v24 §9.7,
 * boards `AU-dziekujemy`, `AU-404`). Phone comes from the site settings; facts such as
 * `[CZAS ODPOWIEDZI]` and prices `{cena:<slug>}` are filled on render.
 */

const icon = z.enum(ICON_NAMES)
const link = obj({ label, href })

/** `/dziekujemy` (`SoftwareSettings.thanks`): number pill, H1, lead, three steps, buttons. */
export const thanksSchema = obj({
  /** Pill above the H1, the number from `?nr=` follows („Zgłoszenie przyjęte · nr”). */
  numberLabel: label,
  title: label,
  /** Second part of the H1 in the hero gradient („Odezwiemy się w ciągu …”). */
  titleAccent: label.optional(),
  lead: text,
  steps: z
    .array(obj({ title: label, text }))
    .min(1)
    .max(3),
  /** One or two buttons; the line's phone is the last button, always. */
  actions: z.array(link).min(1).max(2),
})

/** 404 of the Software line (`SoftwareSettings.notFound`): eyebrow, H1, search, six tiles. */
export const notFoundSchema = obj({
  eyebrow: label,
  title: label,
  /** Second part of the H1 in the hero gradient („tu nie ma.”). */
  titleAccent: label.optional(),
  lead: text,
  /** Text of the field that opens the search window. */
  search: label,
  tiles: z
    .array(obj({ title: label, note: label, href, icon: icon.optional() }))
    .min(1)
    .max(6),
  /** Button back to the start page; the phone button follows with `call` before the number. */
  home: label,
  call: label,
})

export type SoftwareThanks = z.infer<typeof thanksSchema>
export type SoftwareNotFound = z.infer<typeof notFoundSchema>

export function validateThanks(value: unknown): true | string {
  return firstIssue(thanksSchema, value, 'Strona „Dziękujemy”')
}

export function validateNotFound(value: unknown): true | string {
  return firstIssue(notFoundSchema, value, 'Strona 404')
}

/**
 * Inquiry number from `?nr=`: `PKS-<year>-<id, at least 4 digits>` (`lib/inquiry/number`).
 * Anything else is ignored, so the page never echoes the address.
 */
export function inquiryNumberParam(value: string | string[] | undefined): string | null {
  const nr = Array.isArray(value) ? value[0] : value
  return nr && /^PKS-\d{4}-\d{4,9}$/.test(nr) ? nr : null
}
