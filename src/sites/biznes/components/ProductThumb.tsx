import Image from 'next/image'

import { cx } from '@/components/ui/cx'
import { cardIcon } from '@/lib/catalog/card'
import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'

import { ProductStage, STAGE_SHADOW, StageFallback } from './ProductStage'

/** "Kasy fiskalne · Posnet": main category and brand of a product, from the catalog index. */
export function productSubtitle(product: IndexProduct, index: CatalogIndex): string {
  const category = index.categories.find((c) => c.slug === product.categories[0])
  const brand = index.brands.find((b) => b.slug === product.brand)
  return [category?.name, brand?.name].filter(Boolean).join(' · ')
}

/**
 * Small product picture of the search, the inquiry drawer and `/zapytanie`: the card image on
 * the studio, or without one the category icon (K31-ZMIANY §3, §4.10). Decorative — the name
 * is next to it.
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
  return (
    <span aria-hidden="true" className="shrink-0">
      <ProductStage
        as="span"
        className={
          large ? 'h-[76px] w-[88px] rounded-2xl sm:h-[92px] sm:w-[110px]' : 'h-14 w-16 rounded-xl'
        }
      >
        {product.image ? (
          <Image
            src={product.image.url}
            alt=""
            width={product.image.width}
            height={product.image.height}
            unoptimized
            className={cx('relative max-h-[78%] w-auto max-w-[80%] object-contain', STAGE_SHADOW)}
          />
        ) : (
          <StageFallback icon={cardIcon(product, index)} size="sm" />
        )}
      </ProductStage>
    </span>
  )
}
