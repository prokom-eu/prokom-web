import Image from 'next/image'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'

/** "Kasy fiskalne · Posnet": main category and brand of a product, from the catalog index. */
export function productSubtitle(product: IndexProduct, index: CatalogIndex): string {
  const category = index.categories.find((c) => c.slug === product.categories[0])
  const brand = index.brands.find((b) => b.slug === product.brand)
  return [category?.name, brand?.name].filter(Boolean).join(' · ')
}

/**
 * Small product picture of the search and the inquiry drawer: the card image, or without one
 * the category icon on the group's gradient (spec. §5.3). Decorative — the name is next to it.
 */
export function ProductThumb({
  product,
  index,
  large = false,
}: {
  product: IndexProduct
  index: CatalogIndex
  /** The rows of `/zapytanie` (plansza Zapytanie): 110 × 92. */
  large?: boolean
}) {
  const category = index.categories.find((c) => c.slug === product.categories[0])
  const group = index.groups.find((g) => g.slug === product.group)
  return (
    <span
      className={cx(
        'flex shrink-0 items-center justify-center overflow-hidden bg-surface-2',
        large ? 'h-[76px] w-[88px] rounded-2xl sm:h-[92px] sm:w-[110px]' : 'h-14 w-16 rounded-xl',
      )}
      aria-hidden="true"
    >
      {product.image ? (
        <Image
          src={product.image.url}
          alt=""
          width={product.image.width}
          height={product.image.height}
          unoptimized
          className="max-h-full w-auto object-contain"
        />
      ) : (
        <span
          className={cx(
            'flex items-center justify-center text-white',
            large ? 'size-[50px] rounded-[15px]' : 'size-9 rounded-lg',
          )}
          style={
            group
              ? {
                  backgroundImage: `linear-gradient(145deg, ${group.gradient[0]}, ${group.gradient[1]})`,
                }
              : undefined
          }
        >
          <Icon
            name={category?.icon ?? group?.icon ?? 'store'}
            className={large ? 'size-6' : 'size-[18px]'}
            strokeWidth={2}
          />
        </span>
      )}
    </span>
  )
}
