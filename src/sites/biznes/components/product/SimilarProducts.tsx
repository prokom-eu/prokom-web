import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'
import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'

import { ProductCard } from '../catalog/ProductCard'

type Props = {
  products: IndexProduct[]
  index: CatalogIndex
  /** Main category: „Wszystkie: <name> (<count>)” to the filtered catalog. */
  category: { name: string; count: number; href: string } | null
}

/** „Podobne” (spec. §6.2): 4 products of the same main category, as catalog cards. */
export function SimilarProducts({ products, index, category }: Props) {
  return (
    <section aria-labelledby="podobne" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="podobne"
          className="font-display text-[clamp(1.5rem,2.6vw,2.25rem)] font-extrabold leading-tight text-ink font-stretch-110%"
        >
          Podobne
        </h2>
        {category && (
          <Link
            href={category.href}
            className="inline-flex min-h-11 items-center gap-1.5 font-extrabold text-ink hover:text-accent-text"
          >
            Wszystkie: {category.name} ({category.count})
            <Icon name="arrow" className="size-4" strokeWidth={2.4} />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {products.map((product, position) => (
          <ProductCard key={product.slug} product={product} index={index} position={position} />
        ))}
      </div>
    </section>
  )
}
