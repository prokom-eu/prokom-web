import { z } from 'zod'

import { firstIssue, href, label, link, obj, text } from './schema'

/**
 * Navigation of the Software site (`SiteSettings.software.navigation`, ADR-014, ZMIANY-v24 §3):
 * the menu of the header capsule, the „Oferta ▾” mega menu and the „Twój projekt” drawer. The
 * rest of the frame — brand bar, footer, tab bar, menu sheet, CTA — comes from the shared fields
 * (`SiteSettings.shared`, SWA5). Phone and e-mail are never here (rozstrz. SW0 4).
 */

const headerItem = z.union([
  obj({ label, mega: z.literal(true) }),
  obj({
    label,
    href,
    /** Same target as a section of the start page (`#dobierz`) — used on `/`. */
    homeHref: href.optional(),
    /** Small plate next to the label („60 s”). */
    badge: label.optional(),
    /** The line's accent pill (Kreator, ZMIANY-v24 §3.2). */
    pill: z.boolean().optional(),
  }),
])

/**
 * A mega menu column: a group of the offer (Strony / Przebudowa i opieka / Systemy /
 * Automatyzacje). Links to `/rozwiazania/<slug>` show the solution's „od” price and open its offer
 * window; other links stay plain.
 */
const megaColumn = obj({ title: label, links: z.array(link).min(1) })

const schema = obj({
  header: z
    .array(headerItem)
    .min(1)
    .max(8)
    // One „Oferta ▾”: the panel has one id (`#oferta-mega`).
    .refine((items) => items.filter((item) => 'mega' in item).length <= 1, {
      message: 'Najwyżej jedna pozycja z mega menu.',
    }),
  headerRight: obj({
    themeToggle: z.boolean(),
    projectDrawer: z.boolean(),
    /** On the start page the CTA leads to its section (`#kontakt`). */
    ctaHomeHref: href.optional(),
  }),
  mega: obj({
    columns: z.array(megaColumn).min(1).max(6),
    /** „Nie wiesz, od czego zacząć?” — the promo card next to the columns. */
    card: obj({ eyebrow: label, title: label, text, cta: link, links: z.array(link) }),
  }),
  projectDrawer: obj({ title: label, empty: text, send: label, clear: label }),
  /**
   * „Zacznij od podglądu, nie od faktury.” above the footer (ZMIANY-v24 §3.5); the title's `em`
   * part in the accent. Left out on pages that end with their own CTA (`data-final-cta`).
   */
  startBand: obj({ eyebrow: label, title: label, em: label.optional(), cta: link }).optional(),
})

/** Keys of the v23 frame (own footer, tab bar, phone sheets) now taken by the shared elements. */
const V23_KEYS = [
  'footer',
  'tabBar',
  'headerMobile',
  'mobileMenu',
  'mobileMenuFooter',
  'projectPill',
] as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

/** A navigation saved before SWA5 (it has keys of the v23 frame). */
export function isV23Navigation(value: unknown): boolean {
  return isRecord(value) && V23_KEYS.some((key) => key in value)
}

/**
 * A navigation saved before SWA5 keeps working until the v24 one is pasted: only the known keys
 * of the v23 frame are dropped — `headerRight.cta` (its start-page target moves to `ctaHomeHref`)
 * and `mega.branze`; everything else passes on to the strict schema, so any other unknown key is
 * still an error.
 */
function fromV23(value: unknown): unknown {
  if (!isV23Navigation(value) || !isRecord(value)) return value
  const rest = Object.fromEntries(
    Object.entries(value).filter(([key]) => !(V23_KEYS as readonly string[]).includes(key)),
  )
  if (isRecord(rest.headerRight) && 'cta' in rest.headerRight) {
    const { cta, ...right } = rest.headerRight
    const homeHref = isRecord(cta) ? cta.homeHref : undefined
    rest.headerRight = {
      ...(homeHref !== undefined && { ctaHomeHref: homeHref }),
      ...right,
    }
  }
  if (isRecord(rest.mega) && 'branze' in rest.mega) {
    const { branze: _branze, ...mega } = rest.mega
    rest.mega = mega
  }
  return rest
}

export const navigationSchema = z.preprocess(fromV23, schema)

export type SoftwareNavigation = z.infer<typeof schema>

export function validateNavigation(value: unknown): true | string {
  return firstIssue(navigationSchema, value, 'Nawigacja')
}
