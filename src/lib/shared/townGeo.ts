import { normalizeText } from './search/normalize'

/**
 * Where the towns of the service zones are (runda 1411, Obszar): latitude and longitude of the town
 * centres, for the rings map of the Kontakt page. The panel keeps names only (`serviceZones`), so a
 * town added there without an entry here is listed under the map, just not drawn on it.
 */
export const TOWN_GEO: Readonly<Record<string, { lat: number; lng: number }>> = {
  'Rabka-Zdrój': { lat: 49.6094, lng: 19.9626 },
  Chabówka: { lat: 49.5856, lng: 19.932 },
  'Raba Wyżna': { lat: 49.5642, lng: 19.8916 },
  Jordanów: { lat: 49.6497, lng: 19.8311 },
  'Mszana Dolna': { lat: 49.6753, lng: 20.079 },
  'Nowy Targ': { lat: 49.4775, lng: 20.0326 },
  'Czarny Dunajec': { lat: 49.4387, lng: 19.8546 },
  Szaflary: { lat: 49.4252, lng: 20.0234 },
  'Maków Podhalański': { lat: 49.7299, lng: 19.6776 },
  Myślenice: { lat: 49.8337, lng: 19.9389 },
  'Białka Tatrzańska': { lat: 49.392, lng: 20.105 },
  Poronin: { lat: 49.3415, lng: 20.005 },
  'Bukowina Tatrzańska': { lat: 49.3428, lng: 20.1093 },
  Zakopane: { lat: 49.2992, lng: 19.9496 },
  Limanowa: { lat: 49.7059, lng: 20.4224 },
  Kościelisko: { lat: 49.29, lng: 19.885 },
  Krościenko: { lat: 49.4396, lng: 20.4256 },
  'Krościenko nad Dunajcem': { lat: 49.4396, lng: 20.4256 },
  Szczawnica: { lat: 49.4256, lng: 20.489 },
  Kraków: { lat: 50.0614, lng: 19.9366 },
  'Nowy Sącz': { lat: 49.6218, lng: 20.697 },
}

const BY_KEY = new Map(Object.entries(TOWN_GEO).map(([name, geo]) => [normalizeText(name), geo]))

/** Coordinates of a town by its name as typed in the panel (case and Polish letters ignored). */
export function townGeo(name: string): { lat: number; lng: number } | null {
  return BY_KEY.get(normalizeText(name)) ?? null
}
