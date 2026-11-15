// Lowercase letters and digits, single hyphens inside. The slug ends up in cache tags
// and identifiers (S5), so it stays URL- and tag-safe.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidTenantSlug(slug: string): boolean {
  return SLUG.test(slug)
}
