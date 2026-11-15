import type { Metadata } from 'next'

import { DeliveriesPage } from '@/sites/prokom/dostawy/DeliveriesPage'

import { requireLine } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

/** Spec §4: title of `/inwestycje-i-dostawy`; the full SEO comes in H6-2. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await requireLine(params, 'prokom')
  return {
    title: { absolute: 'Większe dostawy IT, RTV i AGD dla firm i instytucji | PRO-KOM' },
    alternates: { canonical: '/inwestycje-i-dostawy' },
  }
}

/** `/inwestycje-i-dostawy` of pro-kom.eu (spec §6.5). */
export default async function HubDeliveriesRoute({ params }: Props) {
  const tenant = await requireLine(params, 'prokom')
  return <DeliveriesPage tenant={tenant} />
}
