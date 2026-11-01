import { listBundles } from '../catalog/bundle'
import {
  getBundles,
  getCatalogIndex,
  getFloorPlans,
  getPublishedProductList,
} from '../catalog/data'
import { buildPlanScenes } from '../catalog/floorPlan'
import { getInstalacjeObjectList } from '../instalacje/data'
import { getPublishedPageList } from '../pages/data'
import { getPostList } from '../posts/data'
import { getCityList, getIndustryPageList, getSolutionsIndex } from '../software/data'
import { hasNews } from '../posts/list'
import type { Line } from '../tenant/lines'
import { brandLinks, buildSiteMap, type SiteMapSection } from './siteLinks'

/**
 * The site map of one tenant from the cached loaders (each filters by the tenant): pages, on
 * Biznes the catalog, on Software the catalog of solutions, on Instalacje the object pages, on
 * lines with news the posts. Shared by `sitemap.xml` and `/mapa-strony`.
 */
export async function loadSiteMap(tenant: { id: number; line: Line }): Promise<SiteMapSection[]> {
  const catalog = tenant.line === 'biznes'
  const software = tenant.line === 'software'
  const instalacje = tenant.line === 'instalacje'
  const [
    pages,
    index,
    products,
    posts,
    allBundles,
    solutions,
    industryPages,
    objectPages,
    cities,
    plans,
  ] = await Promise.all([
    getPublishedPageList(tenant.id),
    catalog ? getCatalogIndex(tenant.id) : null,
    catalog ? getPublishedProductList(tenant.id) : [],
    hasNews(tenant.line) ? getPostList(tenant.id) : null,
    catalog ? getBundles(tenant.id) : [],
    software ? getSolutionsIndex(tenant.id) : null,
    software ? getIndustryPageList(tenant.id) : null,
    instalacje ? getInstalacjeObjectList(tenant.id) : null,
    software ? getCityList(tenant.id) : null,
    catalog ? getFloorPlans(tenant.id) : null,
  ])
  // Every published product is listed (as `sitemap.xml` always did); the index adds the
  // categories, the product list the dates for `<lastmod>`.
  const indexed = new Map((index?.products ?? []).map((product) => [product.slug, product]))
  // Bundles shown on the site (`listBundle`); in the maps only those „Gotowe” (K3c).
  const bundles = listBundles(allBundles, new Set(indexed.keys()))
  return buildSiteMap({
    pages,
    catalog: index && {
      categories: index.categories,
      brands: brandLinks(index.brands),
      industries: index.industries,
      bundles: bundles.length
        ? bundles.filter((bundle) => bundle.indexable).map(({ slug, name }) => ({ slug, name }))
        : null,
      plan: Boolean(plans && buildPlanScenes(plans.records, new Set(indexed.keys())).length),
      products: products.map(({ slug, name, updatedAt }) => ({
        slug,
        name: indexed.get(slug)?.name ?? name,
        categories: indexed.get(slug)?.categories ?? [],
        updatedAt,
      })),
    },
    news: posts && { posts },
    solutions: solutions && {
      items: solutions.solutions.map(({ slug, name }) => ({ slug, name })),
    },
    industryPages,
    cities,
    objectPages,
  })
}
