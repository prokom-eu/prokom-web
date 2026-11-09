import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/RenderBlocks'
import { pageCrumbs } from '@/lib/biznes/pages/crumbs'
import { getPublishedPage } from '@/lib/pages/data'
import { pageMetadata } from '@/lib/pages/metadata'
import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { getSiteSettings } from '@/lib/site/data'
import { slugFromSegment } from '@/lib/pages/slug'

import { requestOrigin, requireTenant } from '../tenant'

type Props = { params: Promise<{ domain: string; slug: string }> }

async function load(params: Props['params']) {
  const tenant = await requireTenant(params)
  const slug = slugFromSegment((await params).slug)
  const page = slug ? await getPublishedPage(tenant.id, slug) : null
  return { tenant, page }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, page } = await load(params)
  if (!page) return {}
  const settings = await getSiteSettings(tenant.id)
  return pageMetadata(page, {
    name: tenant.name,
    ogImage: settings?.seo.ogImage ?? null,
    ...(tenant.line === 'biznes' && { line: tenant.line }),
  })
}

/**
 * Subpage of a tenant (flat addresses: `/kontakt`). Unknown or unpublished → 404. Biznes pages
 * show breadcrumbs, so they also carry `BreadcrumbList` with the same path (BIZ-3 §10.2).
 */
export default async function TenantPage({ params }: Props) {
  const { tenant, page } = await load(params)
  if (!page) notFound()
  const crumbs = tenant.line === 'biznes' ? pageCrumbs(page) : []
  const origin = crumbs.length > 0 ? await requestOrigin() : ''
  return (
    <>
      {crumbs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              breadcrumbJsonLd(crumbs.map(({ name, href }) => ({ name, url: origin + href }))),
            ),
          }}
        />
      )}
      <RenderBlocks page={page} tenant={tenant} />
    </>
  )
}
