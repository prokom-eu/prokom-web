/** Longest meta description that search results show in full (spec. Software §9). */
export const META_DESCRIPTION_MAX = 155

/**
 * A meta description from a longer text (a lead from the panel): whole, or cut at the last word
 * that fits, with „…” (no dangling punctuation or opening quote). Spaces are collapsed first.
 */
export function metaDescription(text: string, max = META_DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  // A space right after the cut means it already ends on a whole word.
  const space = clean[max - 1] === ' ' ? cut.length : cut.lastIndexOf(' ')
  return `${(space > 0 ? cut.slice(0, space) : cut).replace(/[\s,;:.–—\-„“"(]+$/, '')}…`
}
