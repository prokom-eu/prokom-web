import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/RenderBlocks'
import { CATALOG_PATH, CATALOG_QUERY_PARAM } from '@/lib/catalog/filters'
import {
  CATALOG_PATH as SOFTWARE_CATALOG_PATH,
  CATALOG_QUERY_PARAM as SOFTWARE_QUERY_PARAM,
} from '@/lib/software/catalogPath'
import { getPublishedPage } from '@/lib/pages/data'
import { pageMetadata } from '@/lib/pages/metadata'
import { getSiteSettings } from '@/lib/site/data'
import { HOME_SLUG } from '@/lib/pages/slug'
import { serializeJsonLd, websiteSearchJsonLd } from '@/lib/seo/jsonLd'

import { requestOrigin, requireTenant } from './tenant'

type Props = { params: Promise<{ domain: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireTenant(params)
  const [page, settings] = await Promise.all([
    getPublishedPage(tenant.id, HOME_SLUG),
    getSiteSettings(tenant.id),
  ])
  return page
    ? pageMetadata(page, {
        name: tenant.name,
        ogImage: settings?.seo.ogImage ?? null,
        ...(tenant.line === 'biznes' && { line: tenant.line }),
      })
    : {}
}

/** Start page of a tenant: its published page with the `home` slug. */
export default async function TenantHomePage({ params }: Props) {
  const tenant = await requireTenant(params)
  const page = await getPublishedPage(tenant.id, HOME_SLUG)
  if (!page) notFound()
  if (tenant.line !== 'biznes' && tenant.line !== 'software') {
    return <RenderBlocks page={page} tenant={tenant} />
  }
  // The site search for search engines, once, on the home only: Biznes (audit 0611 P0.3b) its
  // catalog, Software (SEO etap 1) its offer — `/rozwiazania?q=`.
  const website = websiteSearchJsonLd({
    origin: await requestOrigin(),
    name: tenant.name,
    ...(tenant.line === 'software'
      ? { searchPath: SOFTWARE_CATALOG_PATH, queryParam: SOFTWARE_QUERY_PARAM }
      : { searchPath: CATALOG_PATH, queryParam: CATALOG_QUERY_PARAM }),
  })
  return (
    <>
      <script
        type="application/ld+json"
        // Tenant name and the request's origin, serialized with `<` escaped (`serializeJsonLd`).
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(website) }}
      />
      <RenderBlocks page={page} tenant={tenant} />
    </>
  )
}
