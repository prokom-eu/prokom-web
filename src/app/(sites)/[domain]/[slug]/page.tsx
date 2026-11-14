import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/RenderBlocks'
import { pageCrumbs } from '@/lib/biznes/pages/crumbs'
import { getPublishedPage } from '@/lib/pages/data'
import { pageMetadata } from '@/lib/pages/metadata'
import { BIZNES_SERVICE_PAGES, biznesDescription, localPageMeta } from '@/lib/biznes/seo'
import { biznesServiceJsonLd, breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
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
  const metadata = pageMetadata(page, {
    name: tenant.name,
    ogImage: settings?.seo.ogImage ?? null,
    ...(tenant.line === 'biznes' && { line: tenant.line }),
  })
  // A Biznes page that sells (services, procurement) names the region (SEO lokalne 14.11).
  return localPageMeta(tenant.line, page, metadata)
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
  const isService = tenant.line === 'biznes' && BIZNES_SERVICE_PAGES.has(page.slug)
  const origin = crumbs.length > 0 || isService ? await requestOrigin() : ''
  // A Biznes service page also says what is offered and where (SEO lokalne 13.11).
  const settings = isService ? await getSiteSettings(tenant.id) : null
  const service =
    isService &&
    biznesServiceJsonLd({
      // The SEO title says the service („GoPOS dla gastronomii — wdrożenie w Rabce”), the page
      // title only the product („GoPOS”).
      name: page.seo?.title?.trim() || page.title,
      description: page.seo?.description ? biznesDescription(page.seo.description) : undefined,
      url: origin + pagePath(page.slug),
      origin,
      areaServed: settings?.biznes?.serviceAreas ?? [],
    })
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
      {service && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(service) }}
        />
      )}
      <RenderBlocks page={page} tenant={tenant} />
    </>
  )
}
