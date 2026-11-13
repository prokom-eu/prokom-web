import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/RenderBlocks'
import { pageCrumbs } from '@/lib/biznes/pages/crumbs'
import { getPublishedPage } from '@/lib/pages/data'
import { pageMetadata } from '@/lib/pages/metadata'
import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { heroCrumb } from '@/lib/software/pageCrumbs'
import { getSiteSettings } from '@/lib/site/data'
import { pagePath, slugFromSegment } from '@/lib/pages/slug'

import { requestOrigin, requireTenant } from '../tenant'

type Props = { params: Promise<{ domain: string; slug: string }> }

/** The visible breadcrumbs of a Software page, for `BreadcrumbList` too (SEO etap 1). */
function softwareCrumbs(page: { slug: string; title: string; layout?: unknown }) {
  const first = Array.isArray(page.layout) ? (page.layout[0] as { blockType?: unknown }) : null
  const crumb = heroCrumb(first?.blockType)
  if (crumb === undefined) return []
  return [
    { name: 'Strona główna', href: '/' },
    { name: crumb ?? page.title, href: pagePath(page.slug) },
  ]
}

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
 * Subpage of a tenant (flat addresses: `/kontakt`). Unknown or unpublished → 404. Pages that show
 * breadcrumbs also carry `BreadcrumbList` with the same path: Biznes (BIZ-3 §10.2), Software's
 * price list, audit and legal pages (SEO etap 1; contact and about have their own).
 */
export default async function TenantPage({ params }: Props) {
  const { tenant, page } = await load(params)
  if (!page) notFound()
  const crumbs =
    tenant.line === 'biznes'
      ? pageCrumbs(page)
      : tenant.line === 'software'
        ? softwareCrumbs(page)
        : []
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
