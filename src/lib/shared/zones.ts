import { normalizeText } from './search/normalize'

/** A service zone from the panel (`CompanyData.serviceZones`, spec §4.1). */
export type ServiceZone = { name: string; towns: string[]; note: string | null }

export type ZoneMatch = { town: string; zone: ServiceZone }

/** Below this many letters a beginning of a name matches too many towns. */
export const ZONE_MIN_LETTERS = 3

/** Compared without case, Polish letters, hyphens and extra spaces („rabka zdroj” = „Rabka-Zdrój”). */
const key = (text: string) => normalizeText(text).replace(/[-\s]+/g, ' ')

/**
 * The zone of a town the visitor typed (spec §5 `ServiceAreaMap`, `ContactForm`): the whole name
 * first, then — from 3 letters — the one town that begins with it (none when several do). Only the
 * panel's lists count: a town outside them has no zone (the office agrees the trip).
 */
export function findZone(zones: readonly ServiceZone[], input: string): ZoneMatch | null {
  const q = key(input)
  if (q.length < ZONE_MIN_LETTERS) return null
  for (const zone of zones) {
    const town = zone.towns.find((name) => key(name) === q)
    if (town) return { town, zone }
  }
  // A beginning counts only when it points to one town („nowy” could be Nowy Targ or Nowy Sącz).
  const candidates = zones.flatMap((zone) =>
    zone.towns.filter((name) => key(name).startsWith(q)).map((town) => ({ town, zone })),
  )
  return candidates.length === 1 ? candidates[0]! : null
}

/** „Szaflary · strefa Podhale”. */
export function zoneLabel({ town, zone }: ZoneMatch): string {
  return `${town} · strefa ${zone.name}`
}
