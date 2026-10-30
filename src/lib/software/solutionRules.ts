import type { Where } from 'payload'

/**
 * Rules of `Solutions` v22 (ADR-014 „Rozstrzygnięcia v21/v22” pkt 1–4): one „od” price, levels
 * only for care and audit, the „W cenie” list for every priced solution. Pure functions — the
 * collection wires them as a hook and field validations.
 */

const isPrice = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

/** Lowest price of the levels: the „od” price of care / audit (one source, pkt 2). */
export function lowestLevelPrice(
  levels: readonly { price?: number | null }[] | null | undefined,
): number | null {
  const prices = (levels ?? []).map((level) => level.price).filter(isPrice)
  return prices.length > 0 ? Math.min(...prices) : null
}

/**
 * A priced solution without levels must say what the „od” price buys (decision SWD2 3). Without
 * a price („Zapytaj o wycenę”) or with levels (care, audit) the list is optional.
 */
export function includedError(
  included: readonly string[] | null | undefined,
  solution: { priceFrom?: number | null; levels?: readonly unknown[] | null },
): string | null {
  if (!isPrice(solution.priceFrom) || (solution.levels?.length ?? 0) > 0) return null
  return (included ?? []).some((item) => item.trim())
    ? null
    : 'Rozwiązanie z ceną potrzebuje listy „W cenie” (co jest w cenie „od”).'
}

/** The comparison table has one cell per level, in the levels' order. */
export function levelCellsError(
  cells: readonly string[] | null | undefined,
  levels: number,
): string | null {
  if (levels === 0) return 'Porównanie jest tylko przy poziomach — dodaj poziomy albo usuń wiersze.'
  if (cells?.length === levels) return null
  return `Wpisz po jednej komórce na każdy poziom (${levels}).`
}

/** Thumbnails are files of the repo (pkt 3), never uploads: `/software/rozwiazania/<slug>.svg`. */
export const THUMBNAIL_PATH = /^\/software\/rozwiazania\/[a-z0-9]+(?:-[a-z0-9]+)*\.svg$/

export function thumbnailError(path: string | null | undefined): string | null {
  if (!path) return null
  return THUMBNAIL_PATH.test(path)
    ? null
    : 'Ścieżka w postaci /software/rozwiazania/<adres>.svg (plik z repozytorium).'
}

/**
 * `filterOptions` of „Dobrze łączy się z”: any solution but this one. The multi-tenant plugin
 * narrows relationship fields to the tenant; rendering reads only published solutions of it.
 */
export function relatedFilter({ id }: { id?: number | string }): Where | true {
  return id === undefined ? true : { id: { not_equals: id } }
}
