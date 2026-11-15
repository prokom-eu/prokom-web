/** Salon address on one line: „ul. …, 34-700 Rabka-Zdrój”. */
export function salonAddress(
  salon: { street: string; postalCode: string; city: string } | null | undefined,
): string | null {
  return salon ? `${salon.street}, ${salon.postalCode} ${salon.city}` : null
}

/**
 * „Wyznacz trasę” of the home contact (plan 0611 §7.1 pkt 14): the panel's route link
 * (`CompanyData.mapsUrl`), else a route URL built from the address — a plain link opened on click,
 * no embedded map and no API key.
 */
export function routeUrl(
  mapsUrl: string | null | undefined,
  address: string | null,
): string | null {
  const panel = mapsUrl?.trim()
  if (panel) return panel
  const destination = address?.trim()
  return destination
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
    : null
}
