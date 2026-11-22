/**
 * A simplified outline of Poland for the ALSEN section (Krystian 22.11: „mega premium”): the
 * network as a field of points in the country's shape, our salon lit in the south. An image of
 * the idea, not a map — the outline is rough (about 40 border points), the stores are not drawn.
 */

/** Border points as [longitude, latitude], clockwise from Świnoujście. */
const BORDER: readonly (readonly [number, number])[] = [
  [14.2, 53.9],
  [15.0, 54.1],
  [16.5, 54.55],
  [17.9, 54.83],
  [18.6, 54.75],
  [18.9, 54.35],
  [19.6, 54.45],
  [20.5, 54.4],
  [22.0, 54.33],
  [22.8, 54.36],
  [23.5, 54.15],
  [23.9, 53.9],
  [23.9, 53.2],
  [23.6, 52.9],
  [23.2, 52.3],
  [23.6, 52.1],
  [23.2, 51.6],
  [23.7, 51.3],
  [24.1, 50.85],
  [23.9, 50.4],
  [23.4, 50.3],
  [22.6, 49.5],
  [22.7, 49.1],
  [22.0, 49.2],
  [21.0, 49.4],
  [20.3, 49.3],
  [19.8, 49.2],
  [19.4, 49.6],
  [18.85, 49.5],
  [18.5, 49.9],
  [17.6, 50.2],
  [17.0, 50.4],
  [16.2, 50.65],
  [16.4, 50.15],
  [15.9, 50.65],
  [15.0, 51.0],
  [14.85, 51.4],
  [14.6, 51.8],
  [14.75, 52.1],
  [14.55, 52.6],
  [14.15, 52.95],
  [14.4, 53.3],
]

/** Rabka-Zdrój, the salon at ul. Orkana 16B. */
const RABKA: readonly [number, number] = [19.96, 49.61]

const WEST = 14
const NORTH = 54.95
/** Pixels per degree of latitude; longitude shrinks by cos(52°) so the shape is not stretched. */
const SCALE = 60
const LON = SCALE * Math.cos((52 * Math.PI) / 180)

function project([lon, lat]: readonly [number, number]): [number, number] {
  return [Math.round((lon - WEST) * LON * 10) / 10, Math.round((NORTH - lat) * SCALE * 10) / 10]
}

/** The SVG box of the outline. */
export const POLAND_VIEWBOX = '0 0 380 360'

/** The outline as an SVG path (`M … L … Z`). */
export const POLAND_PATH = `M${BORDER.map((point) => project(point).join(' ')).join('L')}Z`

/** Where Rabka-Zdrój falls in the box. */
export const RABKA_POINT = project(RABKA)
