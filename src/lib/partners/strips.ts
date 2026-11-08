/**
 * Lead of the brand strips (ZAOPATRZENIE §9: shortened) — the fallback of the home block and
 * the text the seed writes (`K4_BRANDS.lead`).
 */
export const BRANDS_LEAD =
  'Autoryzowany serwis Posnet i Elzab, autoryzowany partner GoPOS i InsERT oraz salony producentów — każdy z doborem modelu i serwisem.'

/**
 * Brands of the home page in two moving strips (ZAOPATRZENIE §9, D5 06.11): all partners of the
 * tenant — first the panel's home order (`BiznesSettings.brands.home`), then the rest by item
 * count (ties keep the panel order) — split alternately, so both strips start with the brands
 * chosen first (the authorized ones).
 */
export function brandStrips<T extends { id: number; slug: string | null }>(
  brands: readonly T[],
  homeIds: readonly number[],
  counts: ReadonlyMap<string, number>,
): [T[], T[]] {
  const byId = new Map(brands.map((brand) => [brand.id, brand]))
  const chosen = [...new Set(homeIds)].flatMap((id) => byId.get(id) ?? [])
  const taken = new Set(chosen.map((brand) => brand.id))
  const count = (brand: T) => (brand.slug ? (counts.get(brand.slug) ?? 0) : 0)
  // `sort` is stable: equal counts stay in the panel order.
  const rest = brands.filter((brand) => !taken.has(brand.id)).sort((a, b) => count(b) - count(a))
  const ordered = [...chosen, ...rest]
  return [ordered.filter((_, i) => i % 2 === 0), ordered.filter((_, i) => i % 2 === 1)]
}
