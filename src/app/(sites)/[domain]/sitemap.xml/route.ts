import { headers } from 'next/headers'

import { getEnv } from '@/lib/env'
import { siteOrigin } from '@/lib/seo/origin'
import { siteMapPaths } from '@/lib/seo/siteLinks'
import { loadSiteMap } from '@/lib/seo/siteLinksData'
import { sitemapXml } from '@/lib/seo/sitemap'

import { findTenant } from '../tenant'

type Context = { params: Promise<{ domain: string }> }

/**
 * `sitemap.xml` of one domain: the addresses of its `/mapa-strony` (`lib/seo/siteLinks`) — the
 * tenant's published pages, on Biznes the catalog with its listed categories, active industries
 * and published products, on lines with news the list and its public posts (filtered views are
 * not listed — `noindex`). Empty on staging.
 */
export async function GET(_request: Request, { params }: Context) {
  const siteEnv = getEnv().SITE_ENV
  const [tenant, requestHeaders] = await Promise.all([findTenant(params), headers()])
  const origin = siteOrigin(requestHeaders.get('host'), siteEnv)
  if (!tenant || !origin) return new Response('Not Found', { status: 404 })
  if (siteEnv === 'staging') return xmlResponse(sitemapXml(origin, []))
  const paths = siteMapPaths(await loadSiteMap(tenant))
  return xmlResponse(sitemapXml(origin, [], paths))
}

function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
