import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'

/** Studio gradient (K31-ZMIANY §3) — also for a stage that is not a single photo. */
export const STAGE_BG =
  'bg-[radial-gradient(120%_90%_at_50%_18%,var(--st1)_0%,var(--st2)_50%,var(--st3)_100%)]'

/**
 * „Studio” under every product photo (K31-ZMIANY §3, spec. §3.8): a soft radial gradient, the
 * „desk” from 70% of the height and a shadow under the product. Size, corners and padding come
 * from `className`; the photo (or `StageFallback`) is the child. No hooks — works in server and
 * client components alike.
 */
export function ProductStage({
  className,
  children,
  as: Tag = 'div',
}: {
  className?: string
  children: ReactNode
  /** `span` inside phrasing content (links, buttons, thumbnails). */
  as?: 'div' | 'span'
}) {
  return (
    <Tag
      className={cx(
        'relative isolate flex items-center justify-center overflow-hidden',
        STAGE_BG,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[70%] bottom-0 -z-10 bg-[linear-gradient(180deg,var(--sth),transparent_80%)] shadow-[inset_0_1px_0_var(--sth)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[20%] bottom-[11%] -z-10 h-[7%] rounded-[50%] bg-[radial-gradient(closest-side,var(--shd),transparent)] opacity-75"
      />
      {children}
    </Tag>
  )
}

/** Light drop shadow of a photo on the studio. */
export const STAGE_SHADOW = 'drop-shadow-[0_12px_14px_var(--shd)]'

type FallbackSize = 'sm' | 'md' | 'lg'

const TILE: Record<FallbackSize, string> = {
  sm: 'size-9 rounded-xl',
  md: 'size-14 rounded-2xl sm:size-16 sm:rounded-[20px]',
  lg: 'size-[88px] rounded-[26px] sm:size-[104px] sm:rounded-[30px]',
}

const ICON: Record<FallbackSize, string> = {
  sm: 'size-[18px]',
  md: 'size-6 sm:size-[26px]',
  lg: 'size-10 sm:size-12',
}

/**
 * A product without a photo (K31-ZMIANY §4.10): the category icon in a tile on the studio —
 * never an empty `<img>`. `sm` (thumbnails) is the icon only, `md` (cards) adds „Zdjęcie
 * producenta wkrótce”, `lg` (gallery) adds the name and that the specification follows.
 */
export function StageFallback({
  icon,
  size = 'md',
  name,
}: {
  icon: IconName
  size?: FallbackSize
  /** Gallery only: the product name above the note. */
  name?: string
}) {
  const tile = (
    <span
      aria-hidden="true"
      className={cx(
        'flex shrink-0 items-center justify-center bg-card text-accent-text shadow-[0_14px_30px_-18px_var(--glow),inset_0_0_0_1px_var(--border)]',
        TILE[size],
      )}
    >
      <Icon name={icon} className={ICON[size]} strokeWidth={2} />
    </span>
  )
  if (size === 'sm') return tile
  return (
    // `lg` sits above the desk line (70% of the height), as on the board.
    <span
      className={cx(
        'relative flex flex-col items-center gap-3 px-4 text-center',
        size === 'lg' && 'mb-20 sm:mb-24',
      )}
    >
      {tile}
      {size === 'lg' && name && (
        <span className="max-w-[420px] font-display text-xl font-extrabold leading-tight text-ink sm:text-2xl">
          {name}
        </span>
      )}
      <span
        className={cx(
          'font-bold text-ink-2',
          // `md` on a phone: a 128 px card has room for the tile only (text stays for readers).
          size === 'lg' ? 'max-w-[340px] text-sm leading-normal' : 'text-xs max-sm:sr-only',
        )}
      >
        {size === 'lg'
          ? 'Zdjęcie producenta pojawi się wkrótce. Pełna specyfikacja — poniżej.'
          : 'Zdjęcie producenta wkrótce'}
      </span>
    </span>
  )
}
