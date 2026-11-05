type ConsentState = { _status?: 'draft' | 'published' | null; clientConsent?: boolean | null }

/**
 * A realization names a real client, so it goes public only with the client's consent
 * (ADR-I002 §2). True = the save would publish (or keep published) a realization without it.
 * A save that does not send the status or the consent keeps the stored one (a partial REST or
 * Local API update has no `_status`).
 */
export function publishWithoutConsent(data: ConsentState, stored?: ConsentState): boolean {
  if ((data._status ?? stored?._status) !== 'published') return false
  const consent = data.clientConsent ?? stored?.clientConsent
  return consent !== true
}

// Words that say what kind of place it is, not which one — never enough for a match.
const GENERIC = new Set([
  'parafia',
  'restauracja',
  'weselny',
  'szkola',
  'podstawowa',
  'salon',
  'sklep',
  'kaplica',
  'kosciol',
  'zakopane',
  'zakopanem',
  'krakow',
  'rabka',
  'zdroj',
])

function words(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !GENERIC.has(w))
}

/**
 * The realization named on an object or service page (round v5: its photos there too). Those
 * pages name the client in their own words („Restauracja i dom weselny „Aleksandra””), so the one
 * sharing the most distinctive words wins; generic words („parafia”, „salon”) never match.
 */
export function matchRealization<T extends { title: string }>(
  name: string,
  realizations: readonly T[],
): T | undefined {
  const own = new Set(words(name))
  let best: { item: T; score: number } | undefined
  for (const item of realizations) {
    const score = words(item.title).filter((w) => own.has(w)).length
    if (score > 0 && (!best || score > best.score)) best = { item, score }
  }
  return best?.item
}

/**
 * Two Polish forms of one word: one starts with the other („chór” – „chóru”) or they share the
 * first 6 letters („stanowiska” – „stanowisku”).
 */
function sameWord(a: string, b: string): boolean {
  if (a.startsWith(b) || b.startsWith(a)) return true
  let i = 0
  while (i < a.length && a[i] === b[i]) i++
  return i >= 6
}

/**
 * The photos with the one that fits the card first (round v5): an object page may show the same
 * client three times (Blachotrapez: conference room, training room, office desks), so each card
 * opens on the photo whose description shares the most words with its place. Same order when
 * nothing fits.
 */
export function leadPhoto<T extends { alt: string }>(text: string, photos: readonly T[]): T[] {
  const own = words(text)
  let best = -1
  let top = 0
  photos.forEach((photo, i) => {
    const score = words(photo.alt).filter((w) => own.some((o) => sameWord(o, w))).length
    if (score > top) {
      top = score
      best = i
    }
  })
  if (best <= 0) return [...photos]
  return [photos[best] as T, ...photos.filter((_, i) => i !== best)]
}

type Ordered = { year?: number | null; legacyId?: number | null }

/**
 * Order of the realizations: the newest year first, without a year at the end, then the package
 * order (`legacyId`). In JS because PostgreSQL puts an empty year first in a descending sort
 * (the Payload adapter adds no `NULLS LAST`).
 */
export function byNewest(a: Ordered, b: Ordered): number {
  const ya = a.year ?? -Infinity
  const yb = b.year ?? -Infinity
  if (ya !== yb) return yb - ya
  return (a.legacyId ?? Infinity) - (b.legacyId ?? Infinity)
}
