import Image from 'next/image'
import Link from 'next/link'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { cardFallback, productBadges, productHref, type BadgeTone } from '@/lib/catalog/card'
import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'

import { AddToCartButton } from '../AddToCartButton'

const BADGE: Record<BadgeTone, string> = {
  service: 'bg-ink text-surface',
  new: 'bg-ok-text text-surface',
  promo: 'bg-promo text-promo-ink',
  authorized: 'bg-accent-text text-accent-ink',
}

type Props = {
  product: IndexProduct
  index: CatalogIndex
  /** Position in the list: „Pokaż kolejne” moves focus to the first new card. */
  position: number
  /** `list` (`?widok=lista`): picture on the left from 640 px up, as in the board's list view. */
  layout?: 'grid' | 'list'
}

/**
 * Card of the catalog (spec. §5.3): picture, up to 2 badges, brand, main category, name,
 * benefit, 3 features, „Szczegóły →” and „+ Do zapytania”. No prices — there are none.
 */
export function ProductCard({ product, index, position, layout = 'grid' }: Props) {
  const list = layout === 'list'
  const href = productHref(product.slug)
  const brand = index.brands.find((item) => item.slug === product.brand)
  const category = index.categories.find((item) => item.slug === product.categories[0])
  const fallback = cardFallback(product, index)
  const badges = productBadges(product, index.brands)

  return (
    <article
      data-card={position}
      className={cx(
        list && 'sm:flex-row',
        'group/card relative flex w-full flex-col overflow-hidden rounded-[18px] bg-card shadow-[inset_0_0_0_1px_var(--border)] transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_var(--glow),inset_0_0_0_1px_var(--border)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:rounded-3xl',
      )}
    >
      <div
        className={cx(
          'relative flex h-32 items-center justify-center overflow-hidden bg-surface-2 bg-[radial-gradient(ellipse_at_50%_92%,var(--glow),transparent_68%)]',
          // `cx` only joins classes: each size is set once, never overridden.
          list ? 'sm:h-auto sm:min-h-[180px] sm:w-60 sm:shrink-0' : 'sm:h-[196px]',
        )}
      >
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            width={product.image.width}
            height={product.image.height}
            unoptimized
            className="max-h-[104px] w-auto max-w-[76%] object-contain drop-shadow-[0_24px_30px_var(--glow)] sm:max-h-[156px]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-[62px] items-center justify-center rounded-[20px] text-white sm:size-[92px] sm:rounded-[28px]"
            style={
              fallback.gradient
                ? {
                    backgroundImage: `linear-gradient(145deg, ${fallback.gradient[0]}, ${fallback.gradient[1]})`,
                  }
                : undefined
            }
          >
            <Icon name={fallback.icon} className="size-7 sm:size-10" />
          </span>
        )}
        {badges.length > 0 && (
          <ul className="absolute inset-x-2 top-2 flex flex-wrap gap-1.5 sm:inset-x-3 sm:top-3">
            {badges.map((badge, position) => (
              <li
                key={badge.label}
                className={cx(
                  // One badge on a phone, as in `KatalogM`: two would cover the picture.
                  position > 0 && 'max-sm:hidden',
                  'rounded-full px-2 py-1 text-[0.68rem] font-extrabold leading-none sm:px-2.5 sm:text-[0.72rem]',
                  BADGE[badge.tone],
                )}
              >
                {badge.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className={cx(
          'flex min-w-0 flex-1 flex-col gap-2 p-3',
          list ? 'sm:px-[22px] sm:py-[18px]' : 'sm:px-[18px] sm:pb-[18px] sm:pt-4',
        )}
      >
        <div className="flex min-h-6 items-center justify-between gap-2 text-xs font-extrabold text-ink-3">
          {brand?.logo ? (
            <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-white px-1.5 shadow-[inset_0_0_0_1px_var(--border)]">
              <Image
                src={brand.logo.url}
                alt={brand.name}
                width={brand.logo.width}
                height={brand.logo.height}
                unoptimized
                className="h-auto max-h-[15px] w-auto max-w-[76px] object-contain"
              />
            </span>
          ) : brand ? (
            <span className="text-[0.72rem] font-black uppercase tracking-wider text-ink-2">
              {brand.name}
            </span>
          ) : (
            <span />
          )}
          {category && <span className="hidden text-right sm:inline">{category.name}</span>}
        </div>
        <h3 className="font-display text-[0.95rem] font-extrabold leading-tight tracking-[-0.01em] font-stretch-106% sm:text-lg">
          <Link href={href} className="text-ink hover:text-accent-text">
            {product.name}
          </Link>
        </h3>
        {product.benefit && (
          <p className="hidden max-w-[70ch] text-sm leading-normal text-ink-2 sm:block">
            {product.benefit}
          </p>
        )}
        {product.features.length > 0 && (
          <ul className="hidden flex-wrap gap-1.5 sm:flex">
            {product.features.slice(0, 3).map((feature) => (
              <li
                key={feature}
                className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-bold text-ink-2"
              >
                {feature}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <Link
            href={href}
            aria-label={`Szczegóły: ${product.name}`}
            className="hidden min-h-11 items-center gap-1.5 text-sm font-extrabold text-accent-text hover:underline sm:inline-flex"
          >
            Szczegóły
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <AddToCartButton
            slug={product.slug}
            name={product.name}
            variant="label"
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    </article>
  )
}
