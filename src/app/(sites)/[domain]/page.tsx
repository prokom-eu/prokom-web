import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/RenderBlocks'
import { getPublishedPage } from '@/lib/pages/data'
import { pageMetadata } from '@/lib/pages/metadata'
import { getSiteSettings } from '@/lib/site/data'
import { HOME_SLUG } from '@/lib/pages/slug'

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
  return <RenderBlocks page={page} tenant={tenant} />
}
