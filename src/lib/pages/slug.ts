/** Slug of the start page; it is served at `/`, never at `/home`. */
export const HOME_SLUG = 'home'

// Paths taken by routes of the `[domain]` segment (live preview).
const RESERVED = new Set(['podglad'])

// Same shape as tenant slugs: URL- and cache-tag-safe, one path segment.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidPageSlug(slug: string): boolean {
  return SLUG.test(slug) && !RESERVED.has(slug)
}

/** Public path of a page (flat addresses, decision for S5). */
export function pagePath(slug: string): string {
  return slug === HOME_SLUG ? '/' : `/${slug}`
}

/** Page slug for a URL segment of `/[slug]`, or `null` (→ 404). */
export function slugFromSegment(segment: string): string | null {
  return segment !== HOME_SLUG && isValidPageSlug(segment) ? segment : null
}
