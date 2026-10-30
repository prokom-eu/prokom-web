import Image from 'next/image'

import { cx } from '@/components/ui/cx'
import type { AreaKey } from '@/lib/software/options'

type Props = {
  /** `/software/rozwiazania/<slug>.svg`; absent → the badge gradient of the category. */
  src?: string
  tone: AreaKey
  /** First row of the catalog: no lazy loading (above the fold). */
  eager?: boolean
  className?: string
}

/**
 * Thumbnail of a solution (spec. §5.2): a flat 280×170 scene with its own background. Decorative
 * (`alt=""`) — its badges are not repeated in HTML. Dimmed a little in the dark theme
 * (`thumb-dim`, ADR-015 v22 pkt 4). Next serves SVG unoptimized on its own.
 */
export function OfferThumb({ src, tone, eager = false, className }: Props) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={cx('aspect-[280/170] w-full rounded-2xl opacity-80', className)}
        style={{ backgroundImage: `var(--grad-area-${tone})` }}
      />
    )
  }
  return (
    <Image
      src={src}
      alt=""
      width={280}
      height={170}
      loading={eager ? 'eager' : 'lazy'}
      className={cx('thumb-dim aspect-[280/170] h-auto w-full rounded-2xl', className)}
    />
  )
}
