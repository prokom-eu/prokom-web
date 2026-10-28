/**
 * Names of a product card with many models (K31-ZMIANY §13.5): the H1, the model key used by
 * `?wersja=` and the `<title>`.
 */

/** Above this length the H1 is the short name (K31-ZMIANY §13.5). */
export const LONG_NAME = 62

/** Text without its bracketed parts, nested ones too: „QNAP TS-464U(-RP) (4 dyski)” → „QNAP TS-464U”. */
export function withoutBrackets(text: string): string {
  let depth = 0
  let out = ''
  for (const char of text) {
    if (char === '(') depth += 1
    else if (char === ')') depth = Math.max(0, depth - 1)
    else if (depth === 0) out += char
  }
  return out.replace(/\s{2,}/g, ' ').trim()
}

/**
 * H1 of the card: the short name from the panel when the full one is longer than 62
 * characters, else the full name; without a short name a long name loses its brackets.
 */
export function displayName(name: string, shortName: string | null): string {
  if (name.length <= LONG_NAME) return name
  const short = shortName?.trim()
  if (short) return short
  return withoutBrackets(name) || name
}

/** Model key of a version: „G8 IRL (Intel)” → „G8 IRL”. */
export function variantKey(name: string): string {
  return withoutBrackets(name) || name.trim()
}

const POLISH: Record<string, string> = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ź: 'z',
  ż: 'z',
}

/** Value of `?wersja=` for a version: „G8 IRL (Intel)” → „g8-irl”. */
export function variantSlug(name: string): string {
  return variantKey(name)
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (char) => POLISH[char] ?? char)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Versions of a card with one entry per `?wersja=`: „G8 IRL (Intel)” and „G8 IRL (AMD)” share a
 * slug — the first one stays, so chips and `hasVariant` never repeat.
 */
export function uniqueVersions(names: readonly string[]): string[] {
  const seen = new Set<string>()
  return names.filter((name) => {
    const slug = variantSlug(name)
    if (!slug || seen.has(slug)) return false
    seen.add(slug)
    return true
  })
}

/**
 * `<title>` of the page: the H1, plus 2–3 models for a card with many of them
 * („Lenovo ThinkBook 14 G8 / G9 — G8 IRL, G8 IAL, G9 IRL”).
 */
export function productTitle(heading: string, variants: readonly string[]): string {
  if (variants.length < 2) return heading
  const models = variants.slice(0, 3).map(variantKey)
  const fresh = models.filter((model) => !heading.includes(model))
  return fresh.length > 0 ? `${heading} — ${fresh.join(', ')}` : heading
}
