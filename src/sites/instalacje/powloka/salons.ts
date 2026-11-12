type Location = { city: string; street: string }

/** „Salon” for one location, „Salony” for more (the company has one salon since 01.11). */
export const salonLabel = (count: number) => (count === 1 ? 'Salon' : 'Salony')

/** „Rabka-Zdrój, ul. Orkana 16B” — every location of the company data, for the top bar. */
export const salonsList = (locations: readonly Location[]) =>
  locations.map((l) => `${l.city}, ${l.street}`).join(' · ')

/** „Salon: Rabka-Zdrój, ul. Orkana 16B” under the CTA band; empty without locations. */
export const salonsNote = (locations: readonly Location[]) =>
  locations.length ? `${salonLabel(locations.length)}: ${salonsList(locations)}` : ''

/**
 * Published salons the shared Kontakt card does not show (`lineSalons`: the `salonKeys` of the
 * line, without keys the first salon) — the second salon of the line (Zakopane) in the slots.
 * The shared data already drops unpublished locations, so today this is empty.
 */
export function otherSalons<T extends { key: string | null }>(
  salons: readonly T[],
  keys: readonly string[] | null | undefined,
): T[] {
  if (!keys?.length) return salons.slice(1)
  return salons.filter((salon) => salon.key === null || !keys.includes(salon.key))
}
