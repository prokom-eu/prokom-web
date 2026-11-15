import type { Metadata } from 'next'

import { hubOgImage } from '@/lib/prokom/data'
import { hubPageMetadata } from '@/lib/prokom/seo'

import { DeliveriesPage } from '@/sites/prokom/dostawy/DeliveriesPage'
import { HubBreadcrumbJsonLd } from '@/sites/prokom/HubBreadcrumbs'

import { requestOrigin, requireLine } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

/** Spec §4: title, description (140–160 characters), canonical and Open Graph (H8). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'prokom')
  return hubPageMetadata(
    '/inwestycje-i-dostawy',
    'Większe dostawy IT, RTV i AGD dla firm i instytucji | PRO-KOM',
    await hubOgImage(tenant.id),
  )
}

/** `/inwestycje-i-dostawy` of pro-kom.eu (spec §6.5). */
export default async function HubDeliveriesRoute({ params }: Props) {
  const tenant = await requireLine(params, 'prokom')
  return (
    <>
      <HubBreadcrumbJsonLd
        name="Inwestycje i dostawy"
        path="/inwestycje-i-dostawy"
        origin={await requestOrigin()}
      />
      <DeliveriesPage tenant={tenant} />
    </>
  )
}
