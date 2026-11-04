/**
 * Geometry of the hero wheel (KOLO-HERO.md, wersja 3), in design units: the wheel is 640 wide,
 * its centre is (0, 0). Computed from the department sizes, so a list changed in the panel
 * (3 → 4 products) keeps the ring even and each department pointing at its own run.
 */
export const WHEEL = {
  size: 640,
  /** Product bubbles. */
  orbit: 282,
  /** Department icons. */
  node: 168,
  /** The highlight arc reaches this far past the first and last bubble of a run. */
  arcPad: 7,
  /** Departments whose icon is lower than this put the label above it, away from the ring. */
  labelLine: 100,
} as const

export type WheelPoint = { angle: number; x: number; y: number }

export type WheelGroupLayout = WheelPoint & {
  /** Half the length of the highlight arc, in degrees. */
  arcHalf: number
  labelAbove: boolean
  items: WheelPoint[]
}

export type WheelLayout = { step: number; groups: WheelGroupLayout[] }

// Rounded: the server and the browser print long floats differently (hydration mismatch).
const round = (value: number) => Number(value.toFixed(2))

function point(angle: number, radius: number): WheelPoint {
  const rad = (angle * Math.PI) / 180
  return { angle, x: round(radius * Math.cos(rad)), y: round(radius * Math.sin(rad)) }
}

/**
 * All products on one even ring (360 / total apart), departments in a row; the first department
 * centred at the top. A department's icon points at the middle of its products.
 */
export function wheelLayout(counts: readonly number[]): WheelLayout {
  const total = counts.reduce((sum, n) => sum + n, 0)
  if (total === 0) {
    // Nothing to point at: the departments simply share the circle.
    const share = counts.length > 0 ? 360 / counts.length : 0
    return {
      step: 0,
      groups: counts.map((_, i) => {
        const centre = point(-90 + i * share, WHEEL.node)
        return { ...centre, arcHalf: 0, labelAbove: centre.y > WHEEL.labelLine, items: [] }
      }),
    }
  }
  const step = 360 / total
  const offset = -90 - (((counts[0] ?? 1) - 1) / 2) * step
  let first = 0
  const groups = counts.map((n) => {
    const centre = point(offset + (first + (n - 1) / 2) * step, WHEEL.node)
    const items = Array.from({ length: n }, (_, k) =>
      point(offset + (first + k) * step, WHEEL.orbit),
    )
    first += n
    return {
      ...centre,
      arcHalf: n > 0 ? ((n - 1) / 2) * step + WHEEL.arcPad : 0,
      labelAbove: centre.y > WHEEL.labelLine,
      items,
    }
  })
  return { step, groups }
}

/**
 * Size of the department name in the core, in design units: its longest word (× ~0.6 em) must
 * fit the 124-unit text column, at most 16 — „Bezpieczeństwo, sieć i podpis” never breaks a word.
 */
export function nameSize(name: string): number {
  const longest = Math.max(0, ...name.split(/\s+/).map((word) => word.length))
  if (longest === 0) return 16
  return Math.min(16, Number((124 / (0.6 * longest)).toFixed(1)))
}
