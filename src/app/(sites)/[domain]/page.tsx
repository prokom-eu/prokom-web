import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { renderableBlocks } from '@/blocks/registry'
import { RenderBlocks } from '@/components/RenderBlocks'
import { getPublishedPage } from '@/lib/pages/data'
import { pageMetadata } from '@/lib/pages/metadata'
import { getSiteSettings } from '@/lib/site/data'
import { HOME_SLUG } from '@/lib/pages/slug'
import { railItems } from '@/sites/biznes/components/home/rail'
import { SectionRail } from '@/sites/biznes/components/home/SectionRail'

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
  const page = await getPublishedPage(tenant.id, HOME_SLUG)
  if (!page) notFound()
  // Biznes: the floating section rail of the home page (spec. §3.7), from the blocks on it.
  const rail =
    tenant.line === 'biznes'
      ? railItems(renderableBlocks(tenant.line, page.layout).map((block) => block.blockType))
      : []
  return (
    <>
      {rail.length > 0 && <SectionRail items={rail} />}
      <RenderBlocks page={page} tenant={tenant} />
    </>
  )
}
