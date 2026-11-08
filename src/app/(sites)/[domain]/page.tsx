import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { renderableBlocks } from '@/blocks/registry'
import { RenderBlocks } from '@/components/RenderBlocks'
import { type RailItem, SectionRail } from '@/components/SectionRail'
import { getPublishedPage } from '@/lib/pages/data'
import { pageMetadata } from '@/lib/pages/metadata'
import { getSiteSettings } from '@/lib/site/data'
import { HOME_SLUG } from '@/lib/pages/slug'
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
  // The floating section rail of the Software home page (spec. §3.3) above 1400 px. Biznes and
  // Instalacje use the shared side rail of their frame (D3-B, L1-I).
  const blocks = renderableBlocks(tenant.line, page.layout)
  const rail: RailItem[] = tenant.line === 'software' ? softwareRailItems(blocks) : []
  return (
    <>
      {rail.length > 0 && (
        <SectionRail
          items={rail}
          from={1401}
          // Software: glide to the section, a sliding marker.
          glide
        />
      )}
      <RenderBlocks page={page} tenant={tenant} />
    </>
  )
}
