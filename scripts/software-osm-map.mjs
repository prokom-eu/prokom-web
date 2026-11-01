// Map of the Software contact page from OpenStreetMap (SWV4, docs/design/prokomsoftware/ZMIANY-v23.md §6):
//   node scripts/software-osm-map.mjs                  downloads the area from the OSM API
//   node scripts/software-osm-map.mjs --from <file>    uses a saved API answer (`map.json`)
// Writes src/sites/software/blocks/SwContactPage/osmMap.generated.ts: SVG paths per layer
// (classes, no colours — the colours are `--map-*` tokens), the highlighted building, the pin,
// street labels and the station. Run by hand when the area changes; the result is committed, so
// the page never calls OSM. Data © OpenStreetMap contributors, ODbL (the page shows the credit).
// The pure functions are also used by a test (Vitest).
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

/** Area of the map: west, south, east, north (degrees). */
export const BBOX = Object.freeze([19.9468, 49.6068, 19.96, 49.6131])
/** PRO-KOM, ul. Orkana 16B — the OSM address node; the map is centred on it. */
export const TARGET = Object.freeze({ lat: 49.60994, lon: 19.95339 })
export const WIDTH = 800
export const HEIGHT = 560

/** Street labels: OSM name → text on the map. */
export const STREETS = Object.freeze({
  'Władysława Orkana': 'ul. Orkana',
  Zakopiańska: 'ul. Zakopiańska',
  'Marszałka Józefa Piłsudskiego': 'ul. Piłsudskiego',
})
const STATION_NAME = 'Plac Świętego Mikołaja'
const STATION_TEXT = 'Dworzec · pl. św. Mikołaja'

/** Pixels per degree of latitude: the area's height fills the map. */
const SCALE = HEIGHT / (BBOX[3] - BBOX[1])
const COS = Math.cos((TARGET.lat * Math.PI) / 180)

/**
 * Lat/lon → map pixels (equirectangular around the target, north up).
 * @param {number} lat @param {number} lon
 * @returns {[number, number]}
 */
export function project(lat, lon) {
  return [
    round(WIDTH / 2 + (lon - TARGET.lon) * COS * SCALE),
    round(HEIGHT / 2 - (lat - TARGET.lat) * SCALE),
  ]
}

/**
 * Layer of an OSM element by its tags, or null when the map does not draw it.
 * r1 main roads, r2 streets, r3 service roads, r4 paths; ww waterways (lines), water areas,
 * green, wood, park(ing) areas, b buildings, rail.
 * @param {Record<string, string> | undefined} tags
 * @returns {string | null}
 */
export function classify(tags) {
  if (!tags) return null
  const { highway, railway, waterway, natural, landuse, leisure, amenity, building } = tags
  if (building) return 'b'
  if (highway) {
    if (['motorway', 'trunk', 'primary', 'secondary', 'tertiary'].includes(highway)) return 'r1'
    if (['residential', 'unclassified', 'living_street', 'pedestrian'].includes(highway))
      return 'r2'
    if (highway === 'service') return 'r3'
    if (['footway', 'path', 'steps', 'cycleway', 'track'].includes(highway)) return 'r4'
    return null
  }
  if (railway === 'rail') return 'rail'
  if (waterway === 'river' || waterway === 'stream') return 'ww'
  if (natural === 'water') return 'water'
  if (natural === 'wood') return 'wood'
  if (amenity === 'parking') return 'park'
  if (
    ['grass', 'meadow', 'recreation_ground', 'cemetery'].includes(landuse ?? '') ||
    ['garden', 'park', 'playground', 'pitch'].includes(leisure ?? '') ||
    natural === 'scrub'
  )
    return 'green'
  return null
}

/** Layers drawn as areas (closed rings); the rest are lines. */
const AREAS = new Set(['b', 'water', 'wood', 'park', 'green'])

/**
 * Angle of a label along a segment, kept readable (between -90° and 90°).
 * @param {[number, number]} a @param {[number, number]} b
 * @returns {number}
 */
export function labelAngle(a, b) {
  let angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI
  if (angle > 90) angle -= 180
  if (angle < -90) angle += 180
  return round(angle)
}

/**
 * Is the point inside the ring (ray casting)?
 * @param {[number, number]} point @param {[number, number][]} ring
 */
export function insideRing(point, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi
    )
      inside = !inside
  }
  return inside
}

/**
 * Points closer than `min` px to the previous one dropped (keeps the last point).
 * @param {[number, number][]} points @param {number} [min]
 * @returns {[number, number][]}
 */
export function thin(points, min = 1) {
  const out = points.slice(0, 1)
  for (let i = 1; i < points.length; i++) {
    const [px, py] = out[out.length - 1]
    const [x, y] = points[i]
    if (i === points.length - 1 || Math.hypot(x - px, y - py) >= min) out.push(points[i])
  }
  return out
}

/**
 * Runs of a line inside the map (plus `margin` px), each with one point beyond the edge on both
 * sides so the stroke still reaches the edge; long roads and rivers outside the frame are dropped.
 * @param {[number, number][]} line @param {number} margin
 * @returns {[number, number][][]}
 */
export function clipLine(line, margin) {
  /** @param {[number, number]} p */
  const inside = ([x, y]) => x > -margin && x < WIDTH + margin && y > -margin && y < HEIGHT + margin
  /** @type {[number, number][][]} */
  const runs = []
  /** @type {[number, number][]} */
  let run = []
  line.forEach((point, i) => {
    const keep =
      inside(point) || (line[i - 1] && inside(line[i - 1])) || (line[i + 1] && inside(line[i + 1]))
    if (keep) run.push(point)
    else if (run.length > 0) {
      runs.push(run)
      run = []
    }
  })
  if (run.length > 0) runs.push(run)
  return runs
}

/**
 * SVG path data of point lists (`M…L…`, `Z` for areas).
 * @param {[number, number][][]} lines @param {boolean} closed
 */
export function pathData(lines, closed) {
  return lines
    .map((line) => 'M' + line.map(([x, y]) => `${x} ${y}`).join('L') + (closed ? 'Z' : ''))
    .join('')
}

/**
 * Joins open member ways of a multipolygon into rings (end to start, either direction).
 * @param {[number, number][][]} parts
 * @returns {[number, number][][]}
 */
export function joinRings(parts) {
  const open = parts.map((part) => part.slice())
  const rings = []
  while (open.length > 0) {
    let ring = open.shift() ?? []
    let grown = true
    while (grown && !same(ring[0], ring[ring.length - 1])) {
      grown = false
      for (let i = 0; i < open.length; i++) {
        const part = open[i]
        const end = ring[ring.length - 1]
        if (same(part[0], end)) ring = ring.concat(part.slice(1))
        else if (same(part[part.length - 1], end)) ring = ring.concat(part.slice(0, -1).reverse())
        else continue
        open.splice(i, 1)
        grown = true
        break
      }
    }
    rings.push(ring)
  }
  return rings
}

/**
 * The map data from an OSM API answer (`map.json`).
 * @param {{ elements: Array<{ type: string, id: number, lat?: number, lon?: number, tags?: Record<string, string>, nodes?: number[], members?: Array<{ type: string, ref: number, role: string }> }> }} osm
 */
export function buildMap(osm) {
  /** @type {Map<number, [number, number]>} */
  const nodes = new Map()
  /** @type {Map<number, number[]>} */
  const wayNodes = new Map()
  for (const el of osm.elements) {
    if (el.type === 'node' && el.lat != null && el.lon != null)
      nodes.set(el.id, project(el.lat, el.lon))
    if (el.type === 'way' && el.nodes) wayNodes.set(el.id, el.nodes)
  }
  /** @param {number[]} ids */
  const points = (ids) =>
    /** @type {[number, number][]} */ (ids.map((id) => nodes.get(id)).filter(Boolean))
  const margin = 40
  /** @param {[number, number][]} line */
  const visible = (line) =>
    line.some(([x, y]) => x > -margin && x < WIDTH + margin && y > -margin && y < HEIGHT + margin)

  /** @type {Record<string, [number, number][][]>} */
  const layers = {}
  /** @param {string} layer @param {[number, number][]} line */
  const add = (layer, line) => {
    if (line.length < 2 || !visible(line)) return
    const parts = AREAS.has(layer) ? [line] : clipLine(line, margin)
    for (const part of parts) if (part.length > 1) (layers[layer] ??= []).push(thin(part, 1.5))
  }
  /** @type {[number, number][][]} */
  const buildings = []
  /** @type {Record<string, Array<[[number, number], [number, number]]>>} */
  const segments = {}
  /** @type {[number, number] | null} */
  let station = null

  for (const el of osm.elements) {
    if (el.type === 'way' && el.nodes) {
      const line = points(el.nodes)
      const layer = classify(el.tags)
      if (layer) add(layer, line)
      if (layer === 'b') buildings.push(line)
      const name = el.tags?.name
      if (name && el.tags?.highway && name in STREETS)
        for (let i = 1; i < line.length; i++) (segments[name] ??= []).push([line[i - 1], line[i]])
      if (name === STATION_NAME && line.length > 0) station = centre(line)
    }
    if (el.type === 'relation' && el.tags?.type === 'multipolygon' && el.members) {
      const layer = classify(el.tags)
      if (!layer || !AREAS.has(layer)) continue
      const outer = el.members
        .filter((m) => m.type === 'way' && m.role === 'outer')
        .map((m) => points(wayNodes.get(m.ref) ?? []))
        .filter((part) => part.length > 1)
      for (const ring of joinRings(outer)) add(layer, ring)
    }
  }

  const pin = project(TARGET.lat, TARGET.lon)
  const target = buildings.find((ring) => insideRing(pin, ring))
  const labels = Object.entries(STREETS).flatMap(([name, text]) => {
    const best = longestInside(segments[name] ?? [], 60)
    if (!best) return []
    const [a, b] = best
    return [
      { text, x: round((a[0] + b[0]) / 2), y: round((a[1] + b[1]) / 2), angle: labelAngle(a, b) },
    ]
  })

  return {
    width: WIDTH,
    height: HEIGHT,
    layers: Object.fromEntries(
      Object.entries(layers).map(([layer, lines]) => [layer, pathData(lines, AREAS.has(layer))]),
    ),
    target: target ? pathData([target], true) : '',
    pin,
    labels,
    station: station ? { x: station[0], y: station[1], text: STATION_TEXT } : null,
    osmHref: `https://www.openstreetmap.org/?mlat=${TARGET.lat}&mlon=${TARGET.lon}#map=18/${TARGET.lat}/${TARGET.lon}`,
  }
}

/**
 * Longest segment with both ends at least `inset` px inside the map.
 * @param {Array<[[number, number], [number, number]]>} segments @param {number} inset
 */
function longestInside(segments, inset) {
  /** @param {[number, number]} p */
  const ok = ([x, y]) => x > inset && x < WIDTH - inset && y > inset && y < HEIGHT - inset
  let best = null
  let length = 0
  for (const [a, b] of segments) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (ok(a) && ok(b) && len > length) {
      best = /** @type {[[number, number], [number, number]]} */ ([a, b])
      length = len
    }
  }
  return best
}

/** @param {[number, number][]} line @returns {[number, number]} */
function centre(line) {
  const xs = line.map((p) => p[0])
  const ys = line.map((p) => p[1])
  return [
    round((Math.min(...xs) + Math.max(...xs)) / 2),
    round((Math.min(...ys) + Math.max(...ys)) / 2),
  ]
}

/** @param {[number, number] | undefined} a @param {[number, number] | undefined} b */
function same(a, b) {
  return !!a && !!b && a[0] === b[0] && a[1] === b[1]
}

/** @param {number} value */
function round(value) {
  return Math.round(value * 10) / 10
}

async function main() {
  const fromIndex = process.argv.indexOf('--from')
  let osm
  if (fromIndex > 0) {
    osm = JSON.parse(readFileSync(process.argv[fromIndex + 1] ?? '', 'utf8'))
  } else {
    const url = `https://api.openstreetmap.org/api/0.6/map.json?bbox=${BBOX.join(',')}`
    const res = await fetch(url, { headers: { 'User-Agent': 'prokom-web map script' } })
    if (!res.ok) throw new Error(`OSM API: ${res.status}`)
    osm = await res.json()
  }
  const map = buildMap(osm)
  if (!map.target) console.warn('No building contains the target point — the map has no highlight.')
  const out = fileURLToPath(
    new URL('../src/sites/software/blocks/SwContactPage/osmMap.generated.ts', import.meta.url),
  )
  writeFileSync(
    out,
    `// Generated by scripts/software-osm-map.mjs — do not edit by hand.\n` +
      `// Data © OpenStreetMap contributors, ODbL (https://www.openstreetmap.org/copyright).\n` +
      `export const OSM_MAP = ${JSON.stringify(map)} as const\n`,
  )
  const size = Math.round(readFileSync(out).length / 1024)
  console.log(
    `${out}: ${size} KB, ${map.labels.length} labels, target ${map.target ? 'found' : 'missing'}`,
  )
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main()
