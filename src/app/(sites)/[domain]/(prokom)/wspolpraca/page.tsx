import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getHubSettings } from '@/lib/prokom/data'
import { isHubLinkLive } from '@/lib/prokom/pages'
import { CooperationPage } from '@/sites/prokom/wspolpraca/CooperationPage'

import { requireLine } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

async function liveTenant(params: Props['params']) {
  const tenant = await requireLine(params, 'prokom')
  if (!isHubLinkLive('/wspolpraca', (await getHubSettings(tenant.id)).pages)) notFound()
  return tenant
}

/** Spec §4: title of `/wspolpraca`; the full SEO comes in H6-2. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await liveTenant(params)
  return { title: { absolute: 'Współpraca: architekci, deweloperzy, instytucje | PRO-KOM' } }
}

/** `/wspolpraca` of pro-kom.eu (spec §6.6) — a v1.1 page: 404 until `HubSettings.pages.cooperation`. */
export default async function HubCooperationRoute({ params }: Props) {
  return <CooperationPage tenant={await liveTenant(params)} />
}
