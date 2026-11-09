import Image from 'next/image'
import Link from 'next/link'

import { cx } from '@/components/ui/cx'
import {
  cardIcon,
  productBadges,
  productHref,
  productImageAlt,
  type BadgeTone,
} from '@/lib/catalog/card'
import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'
import { serviceTile } from '@/lib/catalog/purchase'

import { AddToCartButton } from '../AddToCartButtonLazy'
import { ProductStage, STAGE_SHADOW, StageFallback } from '../ProductStage'

const BADGE: Record<BadgeTone, string> = {
  service: 'bg-ink text-surface',
  new: 'bg-ok-text text-surface',
  promo: 'bg-promo text-promo-ink',
  authorized: 'bg-accent-text text-accent-ink',
}

const CHIP = 'rounded-lg bg-card/95 shadow-[inset_0_0_0_1px_var(--border)]'

type Props = {
  product: IndexProduct
  index: CatalogIndex
  /** Position in the list: „Pokaż kolejne” moves focus to the first new card. */
  position: number
  /** `list` (`?widok=lista`): picture on the left from 640 px up, as in the board's list view. */
  layout?: 'grid' | 'list'
  /** `home` („Najczęściej wybierane”, spec. §4 pkt 5): one badge, no category and no tags. */
  variant?: 'catalog' | 'home'
  /** Right of the brand: the main category, or the series (showroom, category with series). */
  meta?: 'category' | 'series'
  /** „Podgląd” on the picture: opens the quick preview of the list (catalog grid only). */
  onPreview?: () => void
  /** First row of a list at the top of the page: its picture is the largest paint (LCP), so it
   *  loads at once and with high priority instead of lazily. */
  eager?: boolean
}

/** Cards of the first row (3 from 1101 px, 2 on a phone) whose pictures load at once. */
export const FIRST_ROW = 3

/**
 * Card of the catalog as on the board `Web-oferta` (`.pc`, prompt 2 W1): a square studio
 * picture with the brand logo, up to 2 badges, „Podgląd” and „+ Do zapytania” in its corner,
 * then „MARKA · KATEGORIA”, the short name, the benefit and 3 features. No frame around the
 * card, no prices — there are none.
 */
export function ProductCard({
  product,
  index,
  position,
  layout = 'grid',
  variant = 'catalog',
  meta = 'category',
  onPreview,
  eager = false,
}: Props) {
  const list = layout === 'list'
  const home = variant === 'home'
  const href = productHref(product.slug)
  const brand = index.brands.find((item) => item.slug === product.brand)
  const category = index.categories.find((item) => item.slug === product.categories[0])
  const badges = productBadges(product, index.brands).slice(0, home ? 1 : 2)
  const film = Boolean(product.video) && !home
  const label = meta === 'series' && product.series ? product.series : category?.name
  const eyebrow = [brand?.name, home ? null : label].filter(Boolean).join(' · ')

  return (
    <article
      // `data-card`: the motion hook (lift on hover); the index for focus is its own attribute.
      data-card=""
      data-card-index={position}
      className={cx(
        'group/card relative flex w-full flex-col gap-2.5',
        list && 'sm:flex-row sm:items-start sm:gap-5',
      )}
    >
      <ProductStage
        className={cx(
          // Home strip on a phone: the board's fixed 180 px picture (cards are 78% wide there).
          home ? 'max-sm:h-[180px] sm:aspect-square' : 'aspect-square',
          'w-full rounded-[18px] transition-[box-shadow] duration-300 group-hover/card:shadow-[inset_0_0_0_1.5px_var(--accent-text),0_26px_40px_-30px_var(--glow)] motion-reduce:transition-none sm:rounded-3xl',
          list && 'sm:w-60 sm:shrink-0',
        )}
      >
        {/* The picture links to the card too; the name below is the link for keyboards. */}
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          {product.image ? (
            <Image
              src={product.image.url}
              // „Marka Model” (audit 0611 P0.5): the link is hidden from screen readers (the name
              // below is the link), but search engines and a failed load read the picture's text.
              alt={productImageAlt(brand?.name, product.name)}
              width={product.image.width}
              height={product.image.height}
              unoptimized
              {...(eager ? { loading: 'eager' as const, fetchPriority: 'high' as const } : {})}
              className={cx(
                'relative h-[78%] w-[78%] object-contain transition-transform duration-300 group-hover/card:scale-[1.03] motion-reduce:transition-none',
                STAGE_SHADOW,
              )}
            />
          ) : (
            <StageFallback icon={cardIcon(product, index)} service={serviceTile(product)} />
          )}
        </Link>
        {brand?.logo && (
          <span
            className={cx(
              CHIP,
              // The brand is in the line below on a phone; a long badge would cover the logo (B6).
              'pointer-events-none absolute top-3 left-3 hidden h-7 items-center bg-white px-2 sm:inline-flex',
            )}
          >
            <Image
              src={brand.logo.url}
              alt=""
              width={brand.logo.width}
              height={brand.logo.height}
              unoptimized
              className="h-auto max-h-4 w-auto max-w-[72px] object-contain"
            />
          </span>
        )}
        {(badges.length > 0 || film) && (
          <ul className="pointer-events-none absolute top-2.5 right-2.5 flex max-w-[48%] flex-col items-end gap-1.5 text-right sm:top-3 sm:right-3">
            {badges.map((badge, i) => (
              <li
                key={badge.label}
                className={cx(
                  // One badge on a phone, as in `KatalogM`: two would cover the picture.
                  i > 0 && 'max-sm:hidden',
                  // At most 48% of the picture, wrapping: the brand logo keeps the left corner.
                  'rounded-lg px-2 py-1 text-[0.68rem] leading-[1.15] font-extrabold tracking-[0.04em] uppercase sm:text-[0.72rem]',
                  BADGE[badge.tone],
                )}
              >
                {badge.label}
              </li>
            ))}
            {film && (
              <li
                className={cx(
                  CHIP,
                  'inline-flex items-center gap-1 px-2 py-1 text-[0.68rem] leading-none font-extrabold text-ink-2',
                )}
              >
                <svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true">
                  <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
                </svg>
                film
              </li>
            )}
          </ul>
        )}
        {onPreview && (
          <button
            type="button"
            onClick={onPreview}
            aria-label={`Podgląd: ${product.name}`}
            className={cx(
              CHIP,
              'absolute bottom-2.5 left-2.5 hidden min-h-11 items-center gap-1.5 px-3 text-sm font-extrabold text-ink transition-opacity [@media(hover:hover)]:opacity-0 group-focus-within/card:opacity-100 group-hover/card:opacity-100 hover:text-accent-text focus-visible:opacity-100 motion-reduce:transition-none sm:bottom-3 sm:left-3 sm:inline-flex',
            )}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 15a3 3 0 100-6 3 3 0 000 6z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Podgląd
          </button>
        )}
        <AddToCartButton
          slug={product.slug}
          name={product.name}
          variant="card"
          fly={home}
          className="absolute right-2.5 bottom-2.5 z-[2] max-sm:size-11 max-sm:px-0 sm:right-3 sm:bottom-3"
        />
      </ProductStage>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {eyebrow && (
          // A series keeps its own spelling („ThinkPad T i X13”, audit 0611 P3), a category is caps.
          <p
            className={cx(
              'text-xs font-extrabold text-ink-2',
              meta === 'series' && product.series
                ? 'tracking-[0.02em]'
                : 'tracking-[0.07em] uppercase',
            )}
          >
            {eyebrow}
          </p>
        )}
        <h3 className="text-[15px] leading-[1.25] font-extrabold sm:text-[17px]">
          <Link
            href={href}
            className="inline-flex min-h-6 items-center text-ink hover:text-accent-text"
          >
            {product.name}
          </Link>
        </h3>
        {product.benefit && (
          <p
            className={cx(
              'line-clamp-2 text-[14.5px] leading-normal text-ink-2',
              !home && 'max-sm:hidden',
            )}
          >
            {product.benefit}
          </p>
        )}
        {!home && product.features.length > 0 && (
          <ul className="hidden flex-wrap gap-1.5 sm:flex">
            {product.features.slice(0, 3).map((feature) => (
              <li
                key={feature}
                className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-extrabold text-ink-2"
              >
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
