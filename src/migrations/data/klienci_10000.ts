/**
 * The client count (boss via Krystian, 23.11.2026): „10 000+ klientów” everywhere instead of
 * „100+ klientów firmowych” — frozen for the data migration `klienci_10000`. Whole strings only
 * (values, labels, fact keys of the hub), the wording of Biznes (`src/seed/biznes/textFixes.ts`,
 * 14.11). A string an editor changed is not in the map, so it stays.
 */

const NBSP = ' '

/** The hub (`HubSettings`: its JSON texts and the `trust` facts). */
export const HUB_CLIENT_COUNT: ReadonlyMap<string, string> = new Map([
  ['100+', `10${NBSP}000+`],
  ['klientów firmowych', 'klientów'],
  [
    'Ponad 100 klientów firmowych z Podhala i Małopolski',
    `Ponad 10${NBSP}000 klientów z${NBSP}Podhala i${NBSP}Małopolski`,
  ],
])

/** Software „O firmie” (`SiteSettings.shared.about.stats`). */
export const SOFTWARE_CLIENT_COUNT: ReadonlyMap<string, string> = new Map([
  ['100+', `10${NBSP}000+`],
  [
    'firm z Podhala i Małopolski, które z nami pracują',
    'klientów z Podhala i Małopolski, którzy z nami pracują',
  ],
])

/**
 * `value` with every string found in `map` replaced; `null` when nothing changed (so the
 * migration writes only what still holds the old wording).
 */
export function replaceStrings<T>(value: T, map: ReadonlyMap<string, string>): T | null {
  let changed = false
  const walk = (node: unknown): unknown => {
    if (typeof node === 'string') {
      const next = map.get(node)
      if (next === undefined) return node
      changed = true
      return next
    }
    if (Array.isArray(node)) return node.map(walk)
    if (node && typeof node === 'object') {
      return Object.fromEntries(Object.entries(node).map(([key, item]) => [key, walk(item)]))
    }
    return node
  }
  const result = walk(value) as T
  return changed ? result : null
}
