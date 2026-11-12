/**
 * SEO descriptions of seeded pages: written on create, later only while the page has none or
 * still an earlier seed wording — a description written in the panel stays.
 */

/** The description to write into a stored page, or `null` when it should stay as it is. */
export function nextDescription(
  stored: string | null | undefined,
  description: string | undefined,
  replaces: readonly string[] = [],
): string | null {
  if (!description || stored === description) return null
  return !stored || replaces.includes(stored) ? description : null
}
