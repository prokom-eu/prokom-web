import Image from 'next/image'

import { cx } from '@/components/ui/cx'

type Props = {
  /** `/software/rozwiazania/<slug>.svg`; absent → a plain papier tile (ADR-015 v23 pkt 6). */
  src?: string
  /** First row of the catalog: no lazy loading (above the fold). */
  eager?: boolean
  className?: string
}

/**
 * Thumbnail of a solution (spec. §5.2): a flat 280×170 scene with its own background. Decorative
 * (`alt=""`) — its badges are not repeated in HTML. Dimmed a little in the dark theme
 * (`thumb-dim`, ADR-015 v22 pkt 4). Next serves SVG unoptimized on its own.
 */
export function OfferThumb({ src, eager = false, className }: Props) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={cx('aspect-[280/170] w-full rounded-2xl bg-surface-3', className)}
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
