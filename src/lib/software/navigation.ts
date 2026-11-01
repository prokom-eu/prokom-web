import { z } from 'zod'

import { firstIssue, href, label, link, linkWithNote, obj, text } from './schema'

/**
 * Navigation of the Software site (`SiteSettings.software.navigation`, ADR-014 rozstrz. v20 4 and
 * v22 pkt 9, spec. §3) — the shape of `seed/prokomsoftware/nawigacja.json`. Phone and e-mail are
 * never here: they come from `SiteSettings.phone` / `email` (rozstrz. SW0 4).
 */

const headerItem = z.union([
  obj({ label, mega: z.literal(true) }),
  obj({
    label,
    href,
    /** Same target as a section of the start page (`#dobierz`) — used on `/`. */
    homeHref: href.optional(),
    badge: label.optional(),
    pill: z.boolean().optional(),
  }),
])

const linkColumn = obj({ title: label, links: z.array(link).min(1) })

/** PRO-KOM lines of „Jedna firma, pięć linii” — the keys of `--c-<line>-on-dark`. Without
 * Zakopane: Software works only in Rabka (ZMIANY-v23 §1). */
export const FOOTER_LINE_COLORS = ['prokom', 'biznes', 'instalacje', 'software', 'tech'] as const

/** The design package calls the main line „zielen”; in code it is `prokom` (ADR-014 v22 pkt 9). */
const lineColor = z.preprocess(
  (value) => (value === 'zielen' ? 'prokom' : value),
  z.enum(FOOTER_LINE_COLORS),
)

const ctaLink = obj({ label, href })

/**
 * Dark footer v21 (spec. §3.4, ADR-014 v22 pkt 9). The contact column has only its texts: phone
 * and e-mail come from `SiteSettings`, addresses and hours from `CompanyData`.
 */
const footerSchema = obj({
  cta: obj({ eyebrow: label, title: label, text, primary: ctaLink, secondary: ctaLink }),
  about: text,
  guarantees: z.array(label).length(3),
  columns: z
    .array(
      z.union([
        obj({ title: label, links: z.array(linkWithNote).min(1) }),
        obj({ title: label, response: label, reach: label }),
      ]),
    )
    .length(3),
  linesTitle: label,
  lines: z
    .array(
      obj({
        name: label,
        label,
        text: label,
        href,
        color: lineColor,
        current: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(6),
  /** Short notes of the bottom bar („Bez ciasteczek śledzących”). */
  bottom: z.array(label),
  legal: z.array(link),
})

export const navigationSchema = obj({
  header: z.array(headerItem).min(1).max(8),
  headerRight: obj({
    themeToggle: z.boolean(),
    projectDrawer: z.boolean(),
    cta: obj({ label, href, homeHref: href.optional() }),
  }),
  mega: obj({
    columns: z.array(linkColumn).min(1).max(6),
    card: obj({
      eyebrow: label,
      title: label,
      text,
      cta: link,
      links: z.array(link),
    }),
    branze: obj({ label, links: z.array(link).min(1) }),
  }),
  footer: footerSchema,
  headerMobile: obj({ cta: link }),
  tabBar: obj({ items: z.array(link).length(5) }),
  mobileMenu: obj({
    search: label,
    /** [title, caption, href] of the wizard card. */
    kreator: z.tuple([label, label, href]),
    /** [name, price text, href] — the price text follows `SolutionAreas`. */
    tiles: z.array(z.tuple([label, label, href])).max(6),
    offer: z.array(linkWithNote),
    company: z.array(link),
  }),
  mobileMenuFooter: obj({
    cta: link,
    /** Always the line's phone from the site settings — the package leaves `null` here. */
    phone: z.null().optional(),
  }),
  /** `{n}` = number of solutions in the list. */
  projectPill: label,
  projectDrawer: obj({ title: label, empty: text, send: label, clear: label }),
})

export type SoftwareNavigation = z.infer<typeof navigationSchema>

export function validateNavigation(value: unknown): true | string {
  return firstIssue(navigationSchema, value, 'Nawigacja')
}
