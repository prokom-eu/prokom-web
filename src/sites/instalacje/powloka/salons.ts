type Location = { city: string; street: string }

/** „Salon” for one location, „Salony” for more (the company has one salon since 01.11). */
export const salonLabel = (count: number) => (count === 1 ? 'Salon' : 'Salony')

/** „Rabka-Zdrój, ul. Orkana 16B” — every location of the company data, for the top bar. */
export const salonsList = (locations: readonly Location[]) =>
  locations.map((l) => `${l.city}, ${l.street}`).join(' · ')

/** „Salon: Rabka-Zdrój, ul. Orkana 16B” under the CTA band; empty without locations. */
export const salonsNote = (locations: readonly Location[]) =>
  locations.length ? `${salonLabel(locations.length)}: ${salonsList(locations)}` : ''
