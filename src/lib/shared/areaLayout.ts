import type { ServiceZone } from './zones'

export type PlacedTown = { town: string; zone: string; x: number; y: number }

const clamp = (value: number) => Math.min(92, Math.max(8, value))

/**
 * Where the towns of the service zones sit on the area map (spec §5 `ServiceAreaMap`): the salon in
 * the middle, zone n on the n-th ring around it, its towns spread evenly with a turn per zone (so
 * rings do not line up). The panel has names only, no coordinates: the drawing shows distance by
 * zone, not true geography, and a town added in the panel shows up without code. Percent of the box.
 */
export function layoutTowns(zones: readonly ServiceZone[]): PlacedTown[] {
  const rings = Math.max(1, zones.length)
  return zones.flatMap((zone, z) => {
    const radius = 14 + ((z + 1) / rings) * 30
    const turn = z * 0.9 - Math.PI / 2
    return zone.towns.map((town, i) => {
      const angle = turn + (i / Math.max(1, zone.towns.length)) * Math.PI * 2
      return {
        town,
        zone: zone.name,
        // Wider than tall: the map box is a landscape card.
        x: Math.round(clamp(50 + Math.cos(angle) * radius * 1.25) * 10) / 10,
        y: Math.round(clamp(50 + Math.sin(angle) * radius) * 10) / 10,
      }
    })
  })
}
