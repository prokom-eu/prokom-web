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

/**
 * Runda v6 D2: a realization without a photo is not shown anywhere (home, `/realizacje`, search)
 * until it gets one — an icon in place of a photo lowers the whole section.
 */
export function withPhotos<T extends { photos: readonly unknown[] }>(cards: readonly T[]): T[] {
  return cards.filter((card) => card.photos.length > 0)
}
