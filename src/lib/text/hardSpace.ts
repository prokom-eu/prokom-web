const NBSP = String.fromCharCode(0xa0)

// A one-letter word (a, i, o, u, w, z) — or a short number — glued to the next word.
const SHORT_WORD = /(^|[\s(„])([aiouwzAIOUWZ]|\d{1,3}) (?=\S)/g

/**
 * Hard space after one-letter words and short numbers (K4-FINAL §1, Polish typography): „w lokalu”,
 * „z Rabki”, „1 InsPunkt” never break at the end of a line. Run twice so „i w domu” gets both.
 */
export function hardSpaces(text: string): string {
  const once = (s: string) => s.replace(SHORT_WORD, `$1$2${NBSP}`)
  return once(once(text))
}

/** `hardSpaces` on every string of a value (plain data: objects, arrays). */
export function hardSpacesDeep<T>(value: T): T {
  if (typeof value === 'string') return hardSpaces(value) as T
  if (Array.isArray(value)) return value.map(hardSpacesDeep) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, hardSpacesDeep(item)]),
    ) as T
  }
  return value
}
