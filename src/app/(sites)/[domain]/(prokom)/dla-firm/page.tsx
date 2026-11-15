import type { Metadata } from 'next'

import { hubOgImage } from '@/lib/prokom/data'
import { hubPageMetadata } from '@/lib/prokom/seo'

import { BusinessPage } from '@/sites/prokom/firmy/BusinessPage'
import { HubBreadcrumbJsonLd } from '@/sites/prokom/HubBreadcrumbs'

import { requestOrigin, requireLine } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

/** Spec §4: title, description (140–160 characters), canonical and Open Graph (H8). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'prokom')
  return hubPageMetadata(
    '/dla-firm',
    'Dla firm: kasy, IT, sieć, kamery, strona | PRO-KOM',
    await hubOgImage(tenant.id),
  )
}

/** `/dla-firm` of pro-kom.eu (spec §6.3). */
export default async function HubBusinessRoute({ params }: Props) {
  const tenant = await requireLine(params, 'prokom')
  return (
    <>
      <HubBreadcrumbJsonLd name="Dla firm" path="/dla-firm" origin={await requestOrigin()} />
      <BusinessPage tenant={tenant} />
    </>
  )
}
