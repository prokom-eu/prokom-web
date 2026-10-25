import { headers } from 'next/headers'

import { productHref } from '@/lib/catalog/card'
import { categoryHref } from '@/lib/catalog/category'
import { getCatalogIndex, getPublishedProductList } from '@/lib/catalog/data'
import { industryHref } from '@/lib/catalog/industry'
import { CATALOG_PATH } from '@/lib/catalog/filters'
import { getEnv } from '@/lib/env'
import { getPublishedPageList } from '@/lib/pages/data'
import { getPostList } from '@/lib/posts/data'
import { hasNews, NEWS_PATH, postHref } from '@/lib/posts/list'
import { siteOrigin } from '@/lib/seo/origin'
import { sitemapXml } from '@/lib/seo/sitemap'

import { findTenant } from '../tenant'

type Context = { params: Promise<{ domain: string }> }

/**
 * `sitemap.xml` of one domain: only its tenant's published pages, on Biznes the catalog with its
 * listed categories, active industries and published products, and on lines with news the list
 * and its public posts (filtered views are not listed — `noindex`). Empty on staging.
 */
export async function GET(_request: Request, { params }: Context) {
  const siteEnv = getEnv().SITE_ENV
  const [tenant, requestHeaders] = await Promise.all([findTenant(params), headers()])
  const origin = siteOrigin(requestHeaders.get('host'), siteEnv)
  if (!tenant || !origin) return new Response('Not Found', { status: 404 })
  if (siteEnv === 'staging') return xmlResponse(sitemapXml(origin, []))
  const catalog = tenant.line === 'biznes'
  const news = hasNews(tenant.line)
  const [pages, products, index, posts] = await Promise.all([
    getPublishedPageList(tenant.id),
    catalog ? getPublishedProductList(tenant.id) : [],
    catalog ? getCatalogIndex(tenant.id) : null,
    news ? getPostList(tenant.id) : [],
  ])
  // News of the lines that have them: the list (not its category views) and every public post.
  const newsPaths = news
    ? [
        { path: NEWS_PATH },
        ...posts.map(({ slug, updatedAt }) => ({ path: postHref(slug), updatedAt })),
      ]
    : []
  const catalogPaths = catalog
    ? [
        { path: CATALOG_PATH },
        // Only categories with published products (rozstrzygnięcie 7): the index lists those.
        ...(index?.categories ?? []).map(({ slug }) => ({ path: categoryHref(slug) })),
        // Active industries only: „Wkrótce” has no page (ADR-012 rozstrz. 7).
        ...(index?.industries ?? [])
          .filter(({ active }) => active)
          .map(({ slug }) => ({ path: industryHref(slug) })),
        ...products.map(({ slug, updatedAt }) => ({ path: productHref(slug), updatedAt })),
      ]
    : []
  return xmlResponse(sitemapXml(origin, pages, [...catalogPaths, ...newsPaths]))
}

function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
