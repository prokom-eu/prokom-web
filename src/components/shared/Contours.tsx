import { cx } from '@/components/ui/cx'
import { contourPath, CONTOURS_VIEWBOX } from '@/lib/shared/contours'

/** Drawn once per server process — the same rings for every hero and card. */
const PATH = contourPath()

/**
 * Contour lines behind dark heroes and cards (spec §5 `Contours`): a fixed SVG in the line's
 * on-dark colour at low opacity, decorative only (`aria-hidden`). Fills its positioned parent.
 */
export function Contours({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${CONTOURS_VIEWBOX.width} ${CONTOURS_VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid slice"
      className={cx('pointer-events-none absolute inset-0 size-full', className)}
      data-contours
    >
      <path d={PATH} fill="none" stroke="var(--on-dark)" strokeWidth={1.2} opacity={0.13} />
    </svg>
  )
}
