import type { CatalogIndex, IndexImage } from './catalogIndex'
import type { IconName } from './options'

export type GroupSummary = {
  slug: string
  name: string
  icon: IconName
  gradient: [string, string]
  description?: string
  /** Products whose main category is in the group. */
  count: number
  topCategories: { slug: string; name: string; count: number }[]
  /** Products with a public image: featured first (their order), then the most popular. */
  thumbs: { slug: string; name: string; image: IndexImage }[]
}

type Options = { topCategories?: number; thumbs?: number }

/**
 * The five departments of the home page (hero wheel, offer cards): counts and pictures from
 * the catalog index, so nothing is typed in twice.
 */
export function groupSummaries(
  index: Pick<CatalogIndex, 'groups' | 'categories' | 'products'>,
  { topCategories = 3, thumbs = 3 }: Options = {},
): GroupSummary[] {
  return index.groups.map((group) => {
    const products = index.products.filter((product) => product.group === group.slug)
    const pictured = products
      .filter((product) => product.image)
      .sort(
        (a, b) =>
          (a.featuredOrder ?? Infinity) - (b.featuredOrder ?? Infinity) ||
          b.popularity - a.popularity ||
          a.name.localeCompare(b.name, 'pl'),
      )
    return {
      slug: group.slug,
      name: group.name,
      icon: group.icon,
      gradient: group.gradient,
      ...(group.description ? { description: group.description } : {}),
      count: products.length,
      topCategories: index.categories
        .filter((category) => category.group === group.slug)
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pl'))
        .slice(0, topCategories)
        .map(({ slug, name, count }) => ({ slug, name, count })),
      thumbs: pictured.slice(0, thumbs).map(({ slug, name, image }) => ({
        slug,
        name,
        image: image as IndexImage,
      })),
    }
  })
}
