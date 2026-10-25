import { z } from 'zod'

import { firstIssue, href, label, link, linkWithNote, obj, text } from './schema'

/**
 * Navigation of the Software site (`SiteSettings.software.navigation`, ADR-014 rozstrz. v20 4,
 * spec. §3) — the shape of `seed/prokomsoftware/nawigacja.json`. Phone and e-mail are never here:
 * they come from `SiteSettings.phone` / `email` (rozstrz. SW0 4).
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
  footer: obj({
    about: text,
    columns: z.array(z.union([linkColumn, obj({ title: label, lines: z.array(label).min(1) })])),
    crossLink: link,
    legal: z.array(link),
  }),
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
