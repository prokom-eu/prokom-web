import type { CatalogIndex, IndexProduct } from './catalogIndex'

/**
 * Products shown under the product page (spec. §6.2, B6b). Every one comes from the catalog
 * index, which holds only this site's published products — so a draft or another site's
 * product never shows up, whatever the relation in the panel points at.
 */

/** „Podobne”: 4 products of the same main category. */
export const SIMILAR_LIMIT = 4

/** „Skompletuj stanowisko”: 4–5 accessories (spec. §6.2). */
export const KIT_LIMIT = 5

/** Listed products for slugs, in their order: no repeats, none missing, not the product itself. */
function listed(index: CatalogIndex, self: string, slugs: readonly string[]): IndexProduct[] {
  const bySlug = new Map(index.products.map((product) => [product.slug, product]))
  const seen = new Set([self])
  const products: IndexProduct[] = []
  for (const slug of slugs) {
    const product = bySlug.get(slug)
    if (!product || seen.has(slug)) continue
    seen.add(slug)
    products.push(product)
  }
  return products
}

/** Most popular products of the product's main category (the index is sorted by popularity). */
export function similarProducts(index: CatalogIndex, slug: string): IndexProduct[] {
  const main = index.products.find((product) => product.slug === slug)?.categories[0]
  if (!main) return []
  return index.products
    .filter((product) => product.slug !== slug && product.categories.includes(main))
    .slice(0, SIMILAR_LIMIT)
}

/** „Skompletuj stanowisko” from the product's `fitsWith`, in the order set in the panel. */
export function kitProducts(index: CatalogIndex, slug: string): IndexProduct[] {
  const fits = index.products.find((product) => product.slug === slug)?.fits ?? []
  return listed(index, slug, fits).slice(0, KIT_LIMIT)
}

/** „Kiedy wybrać coś innego?” from the product's `alternatives`. */
export function alternativeProducts(
  index: CatalogIndex,
  slug: string,
  alternatives: readonly string[],
): IndexProduct[] {
  return listed(index, slug, alternatives)
}
