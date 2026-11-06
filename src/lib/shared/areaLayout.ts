import { normalizeText } from './search/normalize'
import type { ServiceZone } from './zones'

export type PlacedTown = {
  town: string
  zone: string
  x: number
  y: number
  /** Which side of the label touches the point: near the edges it grows inwards, never cut off. */
  align: 'start' | 'center' | 'end'
}

const clamp = (value: number) => Math.min(92, Math.max(8, value))
const alignFor = (x: number): PlacedTown['align'] => (x < 25 ? 'start' : x > 75 ? 'end' : 'center')

/**
 * Where the towns of the service zones sit on the area map (spec §5 `ServiceAreaMap`): the salon in
 * the middle, zone n on the n-th ring around it, its towns spread evenly with a turn per zone (so
 * rings do not line up). The panel has names only, no coordinates: the drawing shows distance by
 * zone, not true geography, and a town added in the panel shows up without code. Percent of the box.
 * The `center` town (the salon's) is left out — it is the middle already — and so is a repeat.
 */
export function layoutTowns(zones: readonly ServiceZone[], center = ''): PlacedTown[] {
  const seen = new Set([normalizeText(center)])
  const rings = zones
    .map((zone) => ({
      name: zone.name,
      towns: zone.towns.filter((town) => {
        const key = normalizeText(town)
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      }),
    }))
    .filter((zone) => zone.towns.length > 0)
  const count = Math.max(1, rings.length)
  return rings.flatMap((zone, z) => {
    const radius = 14 + ((z + 1) / count) * 30
    const turn = z * 0.9 - Math.PI / 2
    return zone.towns.map((town, i) => {
      const angle = turn + (i / zone.towns.length) * Math.PI * 2
      // Wider than tall: the map box is a landscape card.
      const x = Math.round(clamp(50 + Math.cos(angle) * radius * 1.25) * 10) / 10
      const y = Math.round(clamp(50 + Math.sin(angle) * radius) * 10) / 10
      return { town, zone: zone.name, x, y, align: alignFor(x) }
    })
  })
}
