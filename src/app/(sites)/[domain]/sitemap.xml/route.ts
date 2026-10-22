import { headers } from 'next/headers'

import { productHref } from '@/lib/catalog/card'
import { getPublishedProductList } from '@/lib/catalog/data'
import { CATALOG_PATH } from '@/lib/catalog/filters'
import { getEnv } from '@/lib/env'
import { getPublishedPageList } from '@/lib/pages/data'
import { siteOrigin } from '@/lib/seo/origin'
import { sitemapXml } from '@/lib/seo/sitemap'

import { findTenant } from '../tenant'

type Context = { params: Promise<{ domain: string }> }

/**
 * `sitemap.xml` of one domain: only its tenant's published pages, and on Biznes the catalog
 * with its published products (filtered views are not listed — `noindex`). Empty on staging.
 */
export async function GET(_request: Request, { params }: Context) {
  const siteEnv = getEnv().SITE_ENV
  const [tenant, requestHeaders] = await Promise.all([findTenant(params), headers()])
  const origin = siteOrigin(requestHeaders.get('host'), siteEnv)
  if (!tenant || !origin) return new Response('Not Found', { status: 404 })
  if (siteEnv === 'staging') return xmlResponse(sitemapXml(origin, []))
  const catalog = tenant.line === 'biznes'
  const [pages, products] = await Promise.all([
    getPublishedPageList(tenant.id),
    catalog ? getPublishedProductList(tenant.id) : [],
  ])
  const paths = catalog
    ? [
        { path: CATALOG_PATH },
        ...products.map(({ slug, updatedAt }) => ({ path: productHref(slug), updatedAt })),
      ]
    : []
  return xmlResponse(sitemapXml(origin, pages, paths))
}

function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
