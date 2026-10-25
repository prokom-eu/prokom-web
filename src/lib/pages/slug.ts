import { isValidSlug } from '../tenant/uniqueSlug'

/** Slug of the start page; it is served at `/`, never at `/home`. */
export const HOME_SLUG = 'home'

/**
 * Paths taken by routes of the `[domain]` segment: live preview, the Biznes catalog (ADR-012,
 * rozstrzygnięcie 5), the news and the HTML site map. A static route wins over `[slug]` on every
 * domain — on other lines it answers 404 — so a page with such a slug could never be shown.
 */
export const RESERVED_PAGE_SLUGS: readonly string[] = [
  'podglad',
  'oferta',
  'produkt',
  'branze',
  'aktualnosci',
  'kreator',
  'zapytanie',
  'mapa-strony',
]

export function isValidPageSlug(slug: string): boolean {
  return isValidSlug(slug) && !RESERVED_PAGE_SLUGS.includes(slug)
}

/** Public path of a page (flat addresses, decision for S5). */
export function pagePath(slug: string): string {
  return slug === HOME_SLUG ? '/' : `/${slug}`
}

/** Page slug for a URL segment of `/[slug]`, or `null` (→ 404). */
export function slugFromSegment(segment: string): string | null {
  return segment !== HOME_SLUG && isValidPageSlug(segment) ? segment : null
}
