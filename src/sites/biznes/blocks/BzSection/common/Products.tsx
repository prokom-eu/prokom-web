import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'

import { ProductCard } from '../../../components/catalog/ProductCard'

/** Products of the index by slug, in the given order; unknown or hidden slugs drop out. */
export function productsBySlug(index: CatalogIndex, slugs: readonly string[]): IndexProduct[] {
  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  return slugs.flatMap((slug) => {
    const product = bySlug.get(slug)
    return product ? [product] : []
  })
}

/**
 * Catalog cards in a grid (3 in a row, so 6 or 9 cards leave no orphan); the cards after
 * `visible` wait under „Pokaż wszystkie” (`<details>` — works without JavaScript).
 */
export function ProductGrid({
  index,
  products,
  visible = 0,
  moreLabel = 'Pokaż wszystkie',
}: {
  index: CatalogIndex
  products: readonly IndexProduct[]
  visible?: number
  moreLabel?: string
}) {
  const shown = visible > 0 ? products.slice(0, visible) : products
  const rest = visible > 0 ? products.slice(visible) : []
  const grid = 'grid gap-4 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4'
  return (
    <>
      <ul className={grid}>
        {shown.map((product, i) => (
          <li key={product.slug} className="flex">
            <ProductCard product={product} index={index} position={i} variant="home" />
          </li>
        ))}
      </ul>
      {rest.length > 0 && (
        <details className="group mt-5">
          <summary className="inline-flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-2xl px-5 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">
              {moreLabel} ({products.length})
            </span>
            <span className="hidden group-open:inline">Zwiń</span>
          </summary>
          <ul className={`mt-5 ${grid}`}>
            {rest.map((product, i) => (
              <li key={product.slug} className="flex">
                <ProductCard
                  product={product}
                  index={index}
                  position={shown.length + i}
                  variant="home"
                />
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  )
}
