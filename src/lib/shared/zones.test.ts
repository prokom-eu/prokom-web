import { describe, expect, it } from 'vitest'

import { COMPANY_ZONES } from '../../seed/shared/company'
import { findZone, zoneLabel, type ServiceZone } from './zones'

// Spec §5 `ServiceAreaMap` / `ContactForm`, plan F3 pkt 3: one list of zones in the panel
// (`CompanyData.serviceZones`), one matcher for the map, the forms and the FAQ.
const zones: ServiceZone[] = COMPANY_ZONES.map(({ name, towns, note }) => ({
  name,
  towns: towns ?? [],
  note: note ?? null,
}))

describe('findZone (seed zones)', () => {
  it('Szaflary → Podhale, Raba Wyżna → Podhale, Limanowa → as the data says', () => {
    expect(findZone(zones, 'Szaflary')?.zone.name).toBe('Podhale')
    expect(findZone(zones, 'Raba Wyżna')?.zone.name).toBe('Podhale')
    expect(findZone(zones, 'Limanowa')?.zone.name).toBe('Małopolska')
  })

  it('ignores case, Polish letters, hyphens and spaces around', () => {
    expect(findZone(zones, '  rabka zdroj ')?.town).toBe('Rabka-Zdrój')
    expect(findZone(zones, 'BIAŁKA TATRZAŃSKA')?.zone.name).toBe('Zakopane i Tatry')
  })

  it('from 3 letters a town is found by its beginning, when only one fits', () => {
    expect(findZone(zones, 'szaf')?.town).toBe('Szaflary')
    expect(findZone(zones, 'sz')).toBeNull()
    // Several towns begin so (Nowy Targ, Nowy Sącz): no guess.
    expect(findZone(zones, 'nowy')).toBeNull()
  })

  it('a town outside every zone gives nothing (the form promises no zone)', () => {
    expect(findZone(zones, 'Gdańsk')).toBeNull()
    expect(findZone(zones, '')).toBeNull()
  })

  it('reads as „Szaflary · strefa Podhale”', () => {
    expect(zoneLabel(findZone(zones, 'szaflary')!)).toBe('Szaflary · strefa Podhale')
  })
})
