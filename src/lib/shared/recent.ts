/**
 * „Ostatnio oglądane” of the search (spec §5.1 dodatek 6): up to 5 pages of this line kept in this
 * browser only (`localStorage`, key `pk-recent-<line>`), no server, no cookies. Off unless
 * `CompanyData.recentlyViewed` is on (a lawyer decides whether it needs consent).
 */
export type RecentItem = {
  title: string
  href: string
  /** Kind: „Produkt”, „Rozwiązanie”, „Usługa”, „Obiekt”, „Strona”. */
  kind: string
  /** When it was opened, ms since epoch. */
  at: number
}

export const RECENT_LIMIT = 5

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export const recentKey = (line: string) => `pk-recent-${line}`

const isItem = (value: unknown): value is RecentItem => {
  const item = value as RecentItem
  return (
    typeof item?.title === 'string' &&
    typeof item.href === 'string' &&
    item.href.startsWith('/') &&
    typeof item.kind === 'string' &&
    typeof item.at === 'number'
  )
}

/** The line's list, newest first; anything unreadable counts as empty. */
export function readRecent(line: string, store: Store | null = safeStorage()): RecentItem[] {
  try {
    const parsed: unknown = JSON.parse(store?.getItem(recentKey(line)) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isItem).slice(0, RECENT_LIMIT) : []
  } catch {
    return []
  }
}

/** Puts a page on top (once — an earlier visit of the same address moves up). */
export function pushRecent(
  line: string,
  item: RecentItem,
  store: Store | null = safeStorage(),
): RecentItem[] {
  const next = [item, ...readRecent(line, store).filter((old) => old.href !== item.href)].slice(
    0,
    RECENT_LIMIT,
  )
  try {
    store?.setItem(recentKey(line), JSON.stringify(next))
  } catch {
    // Storage full or blocked: the list just is not kept.
  }
  return next
}

export function clearRecent(line: string, store: Store | null = safeStorage()): void {
  try {
    store?.removeItem(recentKey(line))
  } catch {
    // Blocked storage has nothing to clear.
  }
}

function safeStorage(): Store | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}
