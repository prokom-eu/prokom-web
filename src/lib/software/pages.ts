import { z } from 'zod'

import { ICON_NAMES } from '../catalog/options'

import { firstIssue, href, label, obj, text } from './schema'

/**
 * Texts of two system pages of the Software line (ADR-014 rozstrz. v20 11, spec. §6.11). The
 * package has no JSON for them — the shapes follow the boards `Dziekujemy` and `NieZnaleziono`.
 * Phone and e-mail come from the site settings, hours from the fact `[GODZINY]`.
 */

const icon = z.enum(ICON_NAMES)
const card = obj({ title: label, text, cta: label, href, icon: icon.optional() })

/** `/dziekujemy` (`SoftwareSettings.thanks`). `**bold**` works in the steps. */
export const thanksSchema = obj({
  title: label,
  /** Second part of the H1 in the accent gradient („mamy to.”, board `Dziekujemy`). */
  titleAccent: label.optional(),
  lead: text,
  /** Caption of the inquiry number from `?nr=` (shown only with a number). */
  numberLabel: label,
  stepsTitle: label,
  steps: z.array(text).min(1).max(5),
  /** „Pilna sprawa? Zadzwoń:” — the line's phone and `hours` follow. */
  urgent: label,
  hours: label.optional(),
  more: obj({ eyebrow: label, title: label, cards: z.array(card).max(3) }),
})

/**
 * 404 of the Software line (`SoftwareSettings.notFound`). Tile notes take facts and
 * `{cena:<slug>}`, so a price changed in the panel changes the tile too (decyzja 10).
 */
export const notFoundSchema = obj({
  title: label,
  /** Second line of the H1 in the accent gradient („Reszta jest.”, board `NieZnaleziono`). */
  titleAccent: label.optional(),
  lead: text,
  search: obj({
    label,
    button: label,
    /** Caption before the popular searches (`SoftwareSettings.search.popular`). */
    popularLabel: label,
  }),
  wizard: card,
  places: obj({
    eyebrow: label,
    title: label,
    tiles: z
      .array(obj({ title: label, note: label, href, icon: icon.optional() }))
      .min(1)
      .max(6),
  }),
  brokenLink: obj({ text: label, cta: label, href }),
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
