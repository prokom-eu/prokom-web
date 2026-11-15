import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getHubSettings } from '@/lib/prokom/data'
import { isHubLinkLive } from '@/lib/prokom/pages'
import { HomeOfferPage } from '@/sites/prokom/dom/HomeOfferPage'

import { requireLine } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

/** Spec §4: title of `/dla-domu`; the full SEO comes in H6-2. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'prokom')
  // Off: the 404 must not carry the page's title.
  if (!isHubLinkLive('/dla-domu', (await getHubSettings(tenant.id)).pages)) notFound()
  return { title: { absolute: 'Dla domu: smart home, alarm, serwis, gaming | PRO-KOM' } }
}

/** `/dla-domu` of pro-kom.eu (spec §6.4) — a v1.1 page: 404 until `HubSettings.pages.forHome`. */
export default async function HubHomeOfferRoute({ params }: Props) {
  const tenant = await requireLine(params, 'prokom')
  const settings = await getHubSettings(tenant.id)
  if (!isHubLinkLive('/dla-domu', settings.pages)) notFound()
  return <HomeOfferPage tenant={tenant} />
}
