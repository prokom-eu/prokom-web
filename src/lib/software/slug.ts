/**
 * A solution's slug (`Solutions.slug`) without `zod` (AUDYT-WYDAJNOSC-1111 #6): the catalog reads
 * it from the URL in the browser; `schema.ts` builds its `slug` validator from the same pattern.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isSlug(value: string | null | undefined): value is string {
  return typeof value === 'string' && SLUG_PATTERN.test(value)
}
