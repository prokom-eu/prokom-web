import { getCatalogIndex, getPublishedProductList } from '../catalog/data'
import { getPublishedPageList } from '../pages/data'
import { getPostList } from '../posts/data'
import { hasNews } from '../posts/list'
import type { Line } from '../tenant/lines'
import { buildSiteMap, type SiteMapSection } from './siteLinks'

/**
 * The site map of one tenant from the cached loaders (each filters by the tenant): pages, on
 * Biznes the catalog, on lines with news the posts. Shared by `sitemap.xml` and `/mapa-strony`.
 */
export async function loadSiteMap(tenant: { id: number; line: Line }): Promise<SiteMapSection[]> {
  const catalog = tenant.line === 'biznes'
  const [pages, index, products, posts] = await Promise.all([
    getPublishedPageList(tenant.id),
    catalog ? getCatalogIndex(tenant.id) : null,
    catalog ? getPublishedProductList(tenant.id) : [],
    hasNews(tenant.line) ? getPostList(tenant.id) : null,
  ])
  // Every published product is listed (as `sitemap.xml` always did); the index adds the
  // categories, the product list the dates for `<lastmod>`.
  const indexed = new Map((index?.products ?? []).map((product) => [product.slug, product]))
  return buildSiteMap({
    pages,
    catalog: index && {
      categories: index.categories,
      industries: index.industries,
      products: products.map(({ slug, name, updatedAt }) => ({
        slug,
        name: indexed.get(slug)?.name ?? name,
        categories: indexed.get(slug)?.categories ?? [],
        updatedAt,
      })),
    },
    news: posts && { posts },
  })
}
