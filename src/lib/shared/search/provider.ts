/**
 * What the shared search dialog shows (spec §5.1 „Wyszukiwarka”): groups of results from the line's
 * provider. The provider knows the line's index (built on the server in D3, < 50 KB gzip) and uses
 * the shared engine (`engine.ts`); the dialog only draws, moves focus and opens.
 */
export type SearchResult = {
  id: string
  title: string
  /** Second line: kind, area, short description. */
  hint?: string | null
  href: string
  /** Icon name from the line set (`lib/shared/icons.ts`). */
  icon?: string | null
}

export type SearchGroup = { key: string; title: string; results: SearchResult[] }

export type SearchProvider = {
  /** Empty field: „Na skróty” and the like (the dialog adds actions and recently viewed). */
  empty(): SearchGroup[]
  /** Groups for a query; an empty list means nothing found. */
  query(q: string): SearchGroup[]
  /** „Najczęściej szukane” — chips that fill the field. */
  popular?: readonly string[]
}

/**
 * The contact page with what the visitor looked for (spec §5.1: „Zapytaj o …” → the contact form
 * with the phrase typed in). One parameter for every line — Biznes already reads `?fraza=`; the
 * shared `ContactForm` (D2-3) fills its message from it.
 */
export const PHRASE_PARAM = 'fraza'

export function contactWithPhrase(contactHref: string, phrase: string): string {
  return `${contactHref}?${PHRASE_PARAM}=${encodeURIComponent(phrase)}`
}
