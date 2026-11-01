import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { renderableBlocks } from '@/blocks/registry'
import { RenderBlocks } from '@/components/RenderBlocks'
import { type RailItem, SectionRail } from '@/components/SectionRail'
import { getPublishedPage } from '@/lib/pages/data'
import { pageMetadata } from '@/lib/pages/metadata'
import { getSiteSettings } from '@/lib/site/data'
import { HOME_SLUG } from '@/lib/pages/slug'
import { railItems } from '@/sites/biznes/components/home/rail'
import { softwareRailItems } from '@/sites/software/components/home/rail'

import { requireTenant } from './tenant'

type Props = { params: Promise<{ domain: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireTenant(params)
  const [page, settings] = await Promise.all([
    getPublishedPage(tenant.id, HOME_SLUG),
    getSiteSettings(tenant.id),
  ])
  return page
    ? pageMetadata(page, { name: tenant.name, ogImage: settings?.seo.ogImage ?? null })
    : {}
}

/** Start page of a tenant: its published page with the `home` slug. */
export default async function TenantHomePage({ params }: Props) {
  const tenant = await requireTenant(params)
  const [page, settings] = await Promise.all([
    getPublishedPage(tenant.id, HOME_SLUG),
    getSiteSettings(tenant.id),
  ])
  if (!page) notFound()
  // The floating section rail of the home page, from the blocks on it: Biznes (spec. §3.7)
  // from 1400 px, Software (spec. §3.3) above 1400 px.
  const blocks = renderableBlocks(tenant.line, page.layout)
  const rail: RailItem[] =
    tenant.line === 'biznes'
      ? railItems(blocks, {
          reviews: Boolean(settings?.biznes?.showReviews),
          placeholders: process.env.NODE_ENV !== 'production',
        })
      : tenant.line === 'software'
        ? softwareRailItems(blocks)
        : []
  return (
    <>
      {rail.length > 0 && (
        <SectionRail
          items={rail}
          from={tenant.line === 'software' ? 1401 : 1400}
          // Biznes: „Szukaj” on top of the rail (K33 §2.4).
          search={tenant.line === 'biznes'}
          glide={tenant.line === 'software'}
        />
      )}
      <RenderBlocks page={page} tenant={tenant} />
    </>
  )
}
