import { type HubDeliveries, MAX_QTY } from '@/lib/prokom/deliveries'

/** Quantities of the request list by item key (spec §6.5 pkt 3); an item at 0 is not kept. */
export type RequestList = Record<string, number>

/** Where the list waits while the visitor moves around the page (one tab, `sessionStorage`). */
export const LIST_STORAGE_KEY = 'pk-hub-request-list'

const clamp = (value: number) => Math.max(0, Math.min(MAX_QTY, Math.round(value)))

/** The list with one item moved by `delta` (−1, +1, +10), within 0…999. */
export function changeQty(list: RequestList, item: string, delta: number): RequestList {
  const qty = clamp((list[item] ?? 0) + delta)
  const next = { ...list }
  if (qty === 0) delete next[item]
  else next[item] = qty
  return next
}

/** „Wczytaj przykład do listy”: the object's preset replaces the whole list. */
export function fromPreset(preset: readonly { item: string; qty: number }[]): RequestList {
  return Object.fromEntries(preset.map((row) => [row.item, clamp(row.qty)]).filter(([, q]) => q))
}

type Groups = HubDeliveries['listGroups']

/** Pieces, positions and the groups (lines) on the list. */
export function listTotals(list: RequestList, groups: Groups) {
  const positions = groups.flatMap((group) =>
    group.items.filter((item) => (list[item.key] ?? 0) > 0).map((item) => ({ group, item })),
  )
  return {
    pieces: positions.reduce((sum, row) => sum + (list[row.item.key] ?? 0), 0),
    positions: positions.length,
    groups: groups.filter((group) => positions.some((row) => row.group.key === group.key)),
    rows: positions.map((row) => ({
      key: row.item.key,
      title: row.item.title,
      group: row.group.key,
      qty: list[row.item.key] ?? 0,
    })),
  }
}

/** Only known items with a valid quantity — a stored list from an older page is filtered. */
export function sanitizeList(value: unknown, groups: Groups): RequestList {
  if (!value || typeof value !== 'object') return {}
  const known = new Set(groups.flatMap((group) => group.items.map((item) => item.key)))
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).flatMap(([item, qty]) =>
      known.has(item) && typeof qty === 'number' && clamp(qty) > 0 ? [[item, clamp(qty)]] : [],
    ),
  )
}

export function loadList(groups: Groups): RequestList {
  try {
    const raw = window.sessionStorage.getItem(LIST_STORAGE_KEY)
    return raw ? sanitizeList(JSON.parse(raw), groups) : {}
  } catch {
    return {}
  }
}

export function saveList(list: RequestList): void {
  try {
    if (Object.keys(list).length) {
      window.sessionStorage.setItem(LIST_STORAGE_KEY, JSON.stringify(list))
    } else window.sessionStorage.removeItem(LIST_STORAGE_KEY)
  } catch {
    // Private window or blocked storage: the list lives in the page only.
  }
}

/** The list as plain text for the clipboard and the inquiry (spec §6.5 pkt 3). */
export function listText(
  list: RequestList,
  groups: Groups,
  extra: { services: string[]; term: string | null; pcs: string },
): string {
  const { rows } = listTotals(list, groups)
  const lines = groups.flatMap((group) => {
    const own = rows.filter((row) => row.group === group.key)
    return own.length
      ? [group.title, ...own.map((row) => `  ${row.title} — ${row.qty} ${extra.pcs}`)]
      : []
  })
  if (extra.services.length) lines.push('', ...extra.services.map((service) => `+ ${service}`))
  if (extra.term) lines.push('', extra.term)
  return lines.join('\n')
}
