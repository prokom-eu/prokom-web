/**
 * Panel texts waiting for a decision carry a marker: `[SZEF…]` (the boss) or `[Krystian…]`
 * (spec §2 pkt 4, §4.2). Shared data has no drafts (decision 05.11): such a text may be saved,
 * but it never leaves `getSharedData` — a marked text becomes `null` and a marked row of a list
 * disappears, so a half-written fact or link cannot reach a page or an e-mail.
 */
const MARKER = /\[\s*(SZEF|Krystian)/i

export function hasMarker(text: string): boolean {
  return MARKER.test(text)
}

function containsMarker(value: unknown): boolean {
  if (typeof value === 'string') return hasMarker(value)
  if (Array.isArray(value)) return value.some(containsMarker)
  if (value && typeof value === 'object') return Object.values(value).some(containsMarker)
  return false
}

/** A copy of `value` without marked texts: marked text → `null`, marked list item → dropped. */
export function stripMarked<T>(value: T): T {
  if (typeof value === 'string') return (hasMarker(value) ? null : value) as T
  if (Array.isArray(value)) {
    return value.filter((item) => !containsMarker(item)).map((item) => stripMarked(item)) as T
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, stripMarked(item)]),
    ) as T
  }
  return value
}
