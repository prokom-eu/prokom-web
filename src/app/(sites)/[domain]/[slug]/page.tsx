import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/RenderBlocks'
import { getPublishedPage } from '@/lib/pages/data'
import { pageMetadata } from '@/lib/pages/metadata'
import { getSiteSettings } from '@/lib/site/data'
import { slugFromSegment } from '@/lib/pages/slug'

import { requireTenant } from '../tenant'

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

/** Subpage of a tenant (flat addresses: `/kontakt`). Unknown or unpublished → 404. */
export default async function TenantPage({ params }: Props) {
  const { tenant, page } = await load(params)
  if (!page) notFound()
  return <RenderBlocks page={page} tenant={tenant} />
}
