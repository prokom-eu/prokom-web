import type { Metadata } from 'next'

import { notFound } from 'next/navigation'

import { getHubSettings, hubOgImage } from '@/lib/prokom/data'
import { isHubLinkLive } from '@/lib/prokom/pages'
import { hubPageMetadata } from '@/lib/prokom/seo'
import { HomeOfferPage } from '@/sites/prokom/dom/HomeOfferPage'
import { HubBreadcrumbJsonLd } from '@/sites/prokom/HubBreadcrumbs'

import { requestOrigin, requireLine } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

/** Spec §4: title, description (140–160 characters), canonical and Open Graph (H8). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'prokom')
  // Off: the 404 must not carry the page's title.
  if (!isHubLinkLive('/dla-domu', (await getHubSettings(tenant.id)).pages)) notFound()
  return hubPageMetadata(
    '/dla-domu',
    'Dla domu: smart home, alarm, serwis, gaming | PRO-KOM',
    await hubOgImage(tenant.id),
  )
}

/** `/dla-domu` of pro-kom.eu (spec §6.4) — a v1.1 page: 404 until `HubSettings.pages.forHome`. */
export default async function HubHomeOfferRoute({ params }: Props) {
  const tenant = await requireLine(params, 'prokom')
  const settings = await getHubSettings(tenant.id)
  if (!isHubLinkLive('/dla-domu', settings.pages)) notFound()
  return (
    <>
      <HubBreadcrumbJsonLd name="Dla domu" path="/dla-domu" origin={await requestOrigin()} />
      <HomeOfferPage tenant={tenant} />
    </>
  )
}
