/**
 * Search form of a text (spec. §8.2): lower case, `ł → l` (NFD does not split it), no
 * diacritics, single spaces. The catalog index stores product text in this form (`hay`) and
 * the search (B4) normalizes the query the same way.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}
