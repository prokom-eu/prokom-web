import { headers } from 'next/headers'

import { getEnv } from '@/lib/env'
import { getPublishedPageList } from '@/lib/pages/data'
import { siteOrigin } from '@/lib/seo/origin'
import { sitemapXml } from '@/lib/seo/sitemap'

import { findTenant } from '../tenant'

type Context = { params: Promise<{ domain: string }> }

/** `sitemap.xml` of one domain: only its tenant's published pages. Empty on staging. */
export async function GET(_request: Request, { params }: Context) {
  const siteEnv = getEnv().SITE_ENV
  const [tenant, requestHeaders] = await Promise.all([findTenant(params), headers()])
  const origin = siteOrigin(requestHeaders.get('host'), siteEnv)
  if (!tenant || !origin) return new Response('Not Found', { status: 404 })
  const pages = siteEnv === 'staging' ? [] : await getPublishedPageList(tenant.id)
  return new Response(sitemapXml(origin, pages), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
