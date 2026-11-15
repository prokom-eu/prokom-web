/**
 * Panel texts waiting for a decision carry a marker: `[SZEF…]` (the boss) or `[Krystian…]`
 * (spec §2 pkt 4, §4.2). Shared data has no drafts (decision 05.11): such a text may be saved,
 * but it never leaves `getSharedData`. A marked text becomes `null`; a row of a list disappears
 * only when the marker is in one of its main texts (`ROW_KEYS`) — a marked parking note keeps the
 * salon, a marked link description hides the whole „Sprawdź nas” card.
 */
const MARKER = /\[\s*(SZEF|Krystian)/i

/** Texts a row cannot be shown without: a marker here hides the whole row. */
const ROW_KEYS = new Set([
  'name',
  'street',
  'postalCode',
  'city',
  'title',
  'text',
  'value',
  'label',
  'heading',
  'question',
  'answer',
  'anchorId',
  'icon',
  'href',
])

export function hasMarker(text: string): boolean {
  return MARKER.test(text)
}

function containsMarker(value: unknown): boolean {
  if (typeof value === 'string') return hasMarker(value)
  if (Array.isArray(value)) return value.some(containsMarker)
  if (value && typeof value === 'object') return Object.values(value).some(containsMarker)
  return false
}

/** Whether a list item must go: a marked text, or a marker in a main text of a row (any depth). */
function hidesRow(item: unknown): boolean {
  if (typeof item === 'string') return hasMarker(item)
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false
  return Object.entries(item).some(([key, value]) =>
    typeof value === 'string'
      ? ROW_KEYS.has(key) && hasMarker(value)
      : value && typeof value === 'object' && !Array.isArray(value)
        ? hidesRow(value)
        : false,
  )
}

/** A copy of `value` without marked texts: marked text → `null`, row with a marked main text → dropped. */
export function stripMarked<T>(value: T): T {
  if (typeof value === 'string') return (hasMarker(value) ? null : value) as T
  if (Array.isArray(value)) {
    return value.filter((item) => !hidesRow(item)).map((item) => stripMarked(item)) as T
  }
  if (value && typeof value === 'object') {
    if (!containsMarker(value)) return value
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, stripMarked(item)]),
    ) as T
  }
  return value
}
