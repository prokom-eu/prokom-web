/**
 * Geometry of the hero wheel (runda 1411, board `Main.dc.html`), in design units: the wheel is
 * 680 wide, its centre is (0, 0). The departments share one inner circle evenly (the first at
 * the top); each department's products fan out on the outer ring, `spread` degrees apart around
 * its own angle — so every product sits right behind its department.
 */
export const WHEEL = {
  size: 680,
  /** Product bubbles. */
  orbit: 290,
  /** Department icons. */
  node: 165,
  /** Degrees between the products of one department. */
  spread: 20,
  /** The highlight arc reaches this far past the first and last bubble of a run. */
  arcPad: 7,
  /**
   * The label hangs under each icon; it moves sideways by this many units — the side departments
   * outwards (off the core), the lower ones inwards (off their outer products).
   */
  labelShift: { side: 14, lower: 20 },
  /** Bubble diameters: the active department's products and the others (scaled down). */
  bubble: { on: 76, off: 54 },
  /** Department icon and the core in the middle. */
  dot: 56,
  core: 184,
} as const

export type WheelPoint = { angle: number; x: number; y: number }

export type WheelGroupLayout = WheelPoint & {
  /** Half the length of the highlight arc, in degrees. */
  arcHalf: number
  /** Sideways move of the label under the icon, in units (+ = right). */
  labelShift: number
  items: WheelPoint[]
}

export type WheelLayout = { groups: WheelGroupLayout[] }

// Rounded: the server and the browser print long floats differently (hydration mismatch).
const round = (value: number) => Number(value.toFixed(2))

function point(angle: number, radius: number): WheelPoint {
  const rad = (angle * Math.PI) / 180
  return { angle, x: round(radius * Math.cos(rad)), y: round(radius * Math.sin(rad)) }
}

/**
 * The departments evenly on the inner circle (the first at −90°), each with its `n` products on
 * the outer ring at its angle −spread … +spread (centred for any count).
 */
export function wheelLayout(counts: readonly number[]): WheelLayout {
  const share = counts.length > 0 ? 360 / counts.length : 0
  return {
    groups: counts.map((n, i) => {
      const angle = -90 + i * share
      const centre = point(angle, WHEEL.node)
      const items = Array.from({ length: n }, (_, k) =>
        point(angle + (k - (n - 1) / 2) * WHEEL.spread, WHEEL.orbit),
      )
      const side = Math.sign(Math.round(centre.x))
      return {
        ...centre,
        arcHalf: n > 0 ? ((n - 1) / 2) * WHEEL.spread + WHEEL.arcPad : 0,
        labelShift:
          side === 0
            ? 0
            : centre.y > 0
              ? -side * WHEEL.labelShift.lower
              : side * WHEEL.labelShift.side,
        items,
      }
    }),
  }
}

/**
 * Size of the department name in the core, in design units: its longest word (× ~0.6 em) must
 * fit the 124-unit text column, at most 15 — „Bezpieczeństwo, sieć i podpis” never breaks a word.
 */
export function nameSize(name: string): number {
  const longest = Math.max(0, ...name.split(/\s+/).map((word) => word.length))
  if (longest === 0) return 15
  return Math.min(15, Number((124 / (0.6 * longest)).toFixed(1)))
}
