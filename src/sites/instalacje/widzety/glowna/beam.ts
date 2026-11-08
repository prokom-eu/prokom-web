/**
 * Where a camera beam starts inside its own box (RUNDA-V5 §1.5): the first point of the cone
 * polygon is the camera, the reveal (`clip-path: circle(… at x y)`) grows from there. Coordinates
 * are relative to the polygon's bounding box, which the clip-path of an SVG element uses.
 */
export function beamOrigin(points: string): { x: number; y: number } {
  const pairs = points
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(',').map(Number) as [number, number])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
  if (!pairs.length) return { x: 0, y: 0 }
  const xs = pairs.map(([x]) => x)
  const ys = pairs.map(([, y]) => y)
  const [x0, y0] = pairs[0] ?? [0, 0]
  const round = (n: number) => Math.round(n * 10) / 10
  return { x: round(x0 - Math.min(...xs)), y: round(y0 - Math.min(...ys)) }
}
