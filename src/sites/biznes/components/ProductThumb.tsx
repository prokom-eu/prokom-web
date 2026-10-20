import Image from 'next/image'

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
export function ProductThumb({ product, index }: { product: IndexProduct; index: CatalogIndex }) {
  const category = index.categories.find((c) => c.slug === product.categories[0])
  const group = index.groups.find((g) => g.slug === product.group)
  return (
    <span
      className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2"
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
          className="flex size-9 items-center justify-center rounded-lg text-white"
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
            className="size-[18px]"
            strokeWidth={2}
          />
        </span>
      )}
    </span>
  )
}
