import type { Metadata } from 'next'

import { notFound } from 'next/navigation'

import { getHubSettings, hubOgImage } from '@/lib/prokom/data'
import { isHubLinkLive } from '@/lib/prokom/pages'
import { hubPageMetadata } from '@/lib/prokom/seo'
import { CooperationPage } from '@/sites/prokom/wspolpraca/CooperationPage'
import { HubBreadcrumbJsonLd } from '@/sites/prokom/HubBreadcrumbs'

import { requestOrigin, requireLine } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

async function liveTenant(params: Props['params']) {
  const tenant = await requireLine(params, 'prokom')
  if (!isHubLinkLive('/wspolpraca', (await getHubSettings(tenant.id)).pages)) notFound()
  return tenant
}

/** Spec §4: title, description (140–160 characters), canonical and Open Graph (H8). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await liveTenant(params)
  return hubPageMetadata(
    '/wspolpraca',
    'Współpraca: architekci, deweloperzy, instytucje | PRO-KOM',
    await hubOgImage(tenant.id),
  )
}

/** `/wspolpraca` of pro-kom.eu (spec §6.6) — a v1.1 page: 404 until `HubSettings.pages.cooperation`. */
export default async function HubCooperationRoute({ params }: Props) {
  const tenant = await liveTenant(params)
  return (
    <>
      <HubBreadcrumbJsonLd name="Współpraca" path="/wspolpraca" origin={await requestOrigin()} />
      <CooperationPage tenant={tenant} />
    </>
  )
}
