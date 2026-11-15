import { normalizeText } from './search/normalize'
import { townGeo } from './townGeo'
import type { ServiceZone } from './zones'

type Geo = { lat: number; lng: number }

export type Box = { x: number; y: number; width: number; height: number }

/** The rings of the Kontakt map (runda 1411, Obszar), km in a straight line from the salon. */
export const AREA_RINGS = [15, 35, 55] as const

/** The drawing's box in its own units (the board's 760 × 640); the salon sits at `CENTER`. */
export const AREA_BOX = { width: 760, height: 640 } as const
const CENTER = { x: 380, y: 330 }
/** Px of the box per km: the outer ring (55 km) has a radius of 300. */
export const AREA_SCALE = 300 / AREA_RINGS[AREA_RINGS.length - 1]

const EARTH_KM = 6371
const rad = (deg: number) => (deg * Math.PI) / 180

/** Distance in a straight line (haversine), km. */
export function distanceKm(a: Geo, b: Geo): number {
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h))
}

/** A point on the box: an equirectangular projection around the salon (true within ~60 km). */
export function project(point: Geo, center: Geo): { x: number; y: number } {
  const x = rad(point.lng - center.lng) * Math.cos(rad(center.lat)) * EARTH_KM
  const y = rad(point.lat - center.lat) * EARTH_KM
  return { x: CENTER.x + x * AREA_SCALE, y: CENTER.y - y * AREA_SCALE }
}

export type RingTown = {
  town: string
  km: number
  /** Index in `AREA_RINGS`; `AREA_RINGS.length` = farther than the outer ring. */
  ring: number
  x: number
  y: number
}

export type AreaRings = {
  center: { x: number; y: number }
  towns: RingTown[]
  /** Towns of the panel with no known coordinates: listed, not drawn. */
  unplaced: string[]
}

/**
 * Towns of the service zones on the rings map: each with its distance from the salon, ring and
 * point on the box, nearest first. The salon's own town and repeats are left out.
 */
export function areaRings(zones: readonly ServiceZone[], salon: Geo, salonTown = ''): AreaRings {
  const seen = new Set([normalizeText(salonTown)])
  const towns: RingTown[] = []
  const unplaced: string[] = []
  for (const town of zones.flatMap((zone) => zone.towns)) {
    const key = normalizeText(town)
    if (!key || seen.has(key)) continue
    seen.add(key)
    const geo = townGeo(town)
    if (!geo) {
      unplaced.push(town)
      continue
    }
    const km = distanceKm(salon, geo)
    const ring = AREA_RINGS.findIndex((limit) => km <= limit)
    towns.push({ town, km, ring: ring === -1 ? AREA_RINGS.length : ring, ...project(geo, salon) })
  }
  towns.sort((a, b) => a.km - b.km)
  return { center: { ...CENTER }, towns, unplaced }
}

export type PlacedLabel = RingTown & {
  /** Top-left corner of the label in box units. */
  label: Box
  side: 'left' | 'right'
}

/**
 * Labels are HTML of a fixed 12 px, shown from a drawing 680 px wide (`ServiceAreaRings`): in box
 * units they are up to 760 / 680 larger than in pixels, so the layout counts them that big.
 */
const LABEL_SCALE = AREA_BOX.width / 680
const LABEL_HEIGHT = 22 * LABEL_SCALE

/** The salon's card on the drawing: left of and above the centre, kept free of labels. */
export const AREA_CARD: Box = { x: 80, y: 150, width: 160, height: 92 }
/** Width of a 12 px bold label: ~6.7 px a letter plus the pill's padding. */
export const labelWidth = (text: string) => Math.ceil((text.length * 6.7 + 18) * LABEL_SCALE)

const overlaps = (a: Box, b: Box, gap = 3) =>
  a.x < b.x + b.width + gap &&
  b.x < a.x + a.width + gap &&
  a.y < b.y + b.height + gap &&
  b.y < a.y + a.height + gap

const inside = (box: Box) =>
  box.x >= 0 &&
  box.y >= 0 &&
  box.x + box.width <= AREA_BOX.width &&
  box.y + box.height <= AREA_BOX.height

/** Vertical shifts tried for a label, nearest first. */
const SHIFTS = [0, -14, 14, -28, 28, -42, 42, -56, 56, -70, 70]

/**
 * Labels without overlaps (runda 1411 „etykiety bez nakładania”): each town, nearest first, tries
 * the side away from the salon, then the other, each with growing vertical shifts, and takes the
 * first place that hits no label, no point and no `obstacles` (the salon's card) and stays in the
 * box. A town with no free place keeps its point without a label (the list beside names it).
 */
export function placeLabels(
  towns: readonly RingTown[],
  obstacles: readonly Box[] = [],
): PlacedLabel[] {
  const taken: Box[] = [
    ...obstacles,
    ...towns.map((t) => ({ x: t.x - 5, y: t.y - 5, width: 10, height: 10 })),
  ]
  const placed: PlacedLabel[] = []
  for (const town of towns) {
    const width = labelWidth(town.town)
    const outward: PlacedLabel['side'] = town.x >= CENTER.x ? 'right' : 'left'
    const sides: PlacedLabel['side'][] = outward === 'right' ? ['right', 'left'] : ['left', 'right']
    let chosen: PlacedLabel | null = null
    for (const shift of SHIFTS) {
      for (const side of sides) {
        const label: Box = {
          x: side === 'right' ? town.x + 10 : town.x - 10 - width,
          y: town.y - LABEL_HEIGHT / 2 + shift,
          width,
          height: LABEL_HEIGHT,
        }
        if (inside(label) && !taken.some((box) => overlaps(box, label))) {
          chosen = { ...town, label, side }
          break
        }
      }
      if (chosen) break
    }
    if (chosen) {
      placed.push(chosen)
      taken.push(chosen.label)
    }
  }
  return placed
}
