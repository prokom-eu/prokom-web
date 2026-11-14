import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/catalog/options'
import type { FallbackTile } from '@/lib/catalog/purchase'

/** Studio gradient (K31-ZMIANY §3) — also for a stage that is not a single photo. */
export const STAGE_BG =
  'bg-[radial-gradient(120%_90%_at_50%_18%,var(--st1)_0%,var(--st2)_50%,var(--st3)_100%)]'

/**
 * White plate the photo stands on (NAPRAWA-0911 §3): many packshots have a white background,
 * which on the studio gradient showed as a white rectangle. White in both themes (`--plate`).
 */
export const STAGE_PLATE =
  'rounded-[clamp(8px,9%,20px)] bg-plate shadow-[0_10px_24px_-14px_var(--plate-shadow),inset_0_0_0_1px_var(--plate-shadow)]'

/**
 * „Studio” under every product photo (K31-ZMIANY §3, spec. §3.8): a soft radial gradient, the
 * „desk” from 70% of the height and a shadow under the product, and on top of them the white
 * plate (`STAGE_PLATE`, 6% in from the edge) the photo stands on — the desk and shadow then show
 * only without a photo (`StageFallback`, where the plate is hidden). Size, corners and padding come
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
        // Without a photo (StageFallback) no plate: its text is theme-coloured, and the studio
        // with its desk and shadow is the background it was designed on.
        '[&:has([data-stage-fallback])>[data-stage-plate]]:hidden',
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
      <span
        aria-hidden="true"
        data-stage-plate=""
        className={cx('pointer-events-none absolute inset-[6%] -z-10', STAGE_PLATE)}
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

/** Notes under the tile of a product without a photo: cards (`md`) and the gallery (`lg`). */
const FALLBACK_NOTE = {
  product: {
    md: 'Bez zdjęcia producenta',
    lg: 'Zdjęcia producenta jeszcze nie ma. Pełna specyfikacja jest poniżej.',
  },
  licence: {
    md: 'Licencja elektroniczna',
    lg: 'Licencja elektroniczna — bez pudełka i płyty. Zakres jest w specyfikacji poniżej.',
  },
} as const

/**
 * A product without a photo (K31-ZMIANY §4.10): the category icon in a tile on the studio —
 * never an empty `<img>`. `sm` (thumbnails) is the icon only, `md` (cards) adds a short note,
 * `lg` (gallery) adds the name and that the specification follows. Software says it is an
 * electronic licence instead of „no photo” (audit 14.11 P1-1).
 */
export function StageFallback({
  icon,
  size = 'md',
  name,
  tile = null,
}: {
  icon: IconName
  size?: FallbackSize
  /** Gallery only: the product name above the note. */
  name?: string
  /**
   * `service`: the navy tile „Usługa PRO-KOM” over the whole stage (K36 §5, §10); `licence`: the
   * light tile with „Licencja elektroniczna” (`fallbackTile`).
   */
  tile?: FallbackTile
}) {
  if (tile === 'service') return <ServiceTile icon={icon} size={size} name={name} />
  const badge = (
    <span
      aria-hidden="true"
      data-stage-fallback={size === 'sm' ? '' : undefined}
      className={cx(
        'flex shrink-0 items-center justify-center bg-card text-accent-text shadow-[0_14px_30px_-18px_var(--glow),inset_0_0_0_1px_var(--border)]',
        TILE[size],
      )}
    >
      <Icon name={icon} className={ICON[size]} strokeWidth={2} />
    </span>
  )
  if (size === 'sm') return badge
  return (
    // `lg` sits above the desk line (70% of the height), as on the board.
    <span
      data-stage-fallback=""
      className={cx(
        'relative flex flex-col items-center gap-3 px-4 text-center',
        size === 'lg' && 'mb-20 sm:mb-24',
      )}
    >
      {badge}
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
        {FALLBACK_NOTE[tile === 'licence' ? 'licence' : 'product'][size]}
      </span>
    </span>
  )
}

/**
 * A service without a photo (K4-FINAL §4.3 pkt 6, K36 §5): a navy tile with the icon and
 * „Usługa PRO-KOM” — the gallery adds where the service is done. Never an empty picture.
 */
function ServiceTile({ icon, size, name }: { icon: IconName; size: FallbackSize; name?: string }) {
  return (
    <span
      data-surface="dark"
      data-stage-fallback=""
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-dark bg-[radial-gradient(ellipse_at_85%_0%,var(--glow),transparent_60%)] px-4 text-center text-white"
    >
      <span
        aria-hidden="true"
        className={cx(
          'flex shrink-0 items-center justify-center bg-white/10 text-white',
          TILE[size],
        )}
      >
        <Icon name={icon} className={ICON[size]} strokeWidth={2} />
      </span>
      {size === 'lg' && name && (
        <span className="max-w-[420px] font-display text-xl font-extrabold leading-tight sm:text-2xl">
          {name}
        </span>
      )}
      {size !== 'sm' && (
        <span
          className={cx(
            'font-extrabold text-white/85',
            size === 'lg'
              ? 'max-w-[340px] text-sm leading-normal'
              : 'text-xs uppercase tracking-[0.08em]',
          )}
        >
          {size === 'lg'
            ? 'Usługa PRO-KOM · u Ciebie w firmie albo w serwisie w Rabce-Zdroju'
            : 'Usługa PRO-KOM'}
        </span>
      )}
    </span>
  )
}
