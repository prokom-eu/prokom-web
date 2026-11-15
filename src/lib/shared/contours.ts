/**
 * Contour lines of the dark heroes and cards (spec §5 `Contours`): a fixed drawing, no
 * randomness — the same rings on every render, so the server and the browser agree and the SVG
 * stays small. Ring k (1…13): r = 40 + k·64, a point r·(1 + 0.075·sin(3θ + 0.7k) + 0.045·sin(5θ −
 * 1.1k)), stretched 1.3 × 0.82 around (1090, 330) in a 1440 × 760 box.
 */
export const CONTOURS_VIEWBOX = { width: 1440, height: 760 } as const

export type ContourOptions = {
  rings?: number
  base?: number
  step?: number
  cx?: number
  cy?: number
  sx?: number
  sy?: number
  /** Points per ring: enough for a smooth line at hero size. */
  points?: number
}

export function contourPath({
  rings = 13,
  base = 40,
  step = 64,
  cx = 1090,
  cy = 330,
  sx = 1.3,
  sy = 0.82,
  points = 72,
}: ContourOptions = {}): string {
  let d = ''
  for (let k = 1; k <= rings; k++) {
    const r = base + k * step
    for (let i = 0; i < points; i++) {
      const theta = (i / points) * Math.PI * 2
      const rr =
        r * (1 + 0.075 * Math.sin(3 * theta + k * 0.7) + 0.045 * Math.sin(5 * theta - k * 1.1))
      const x = Math.round(cx + rr * Math.cos(theta) * sx)
      const y = Math.round(cy + rr * Math.sin(theta) * sy)
      d += `${i === 0 ? 'M' : 'L'}${x} ${y}`
    }
    d += 'Z'
  }
  return d
}
