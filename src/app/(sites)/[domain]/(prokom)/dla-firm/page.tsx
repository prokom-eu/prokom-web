import type { Metadata } from 'next'

import { BusinessPage } from '@/sites/prokom/firmy/BusinessPage'

import { requireLine } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

/** Spec §4: title of `/dla-firm`; the full SEO (description, canonical, JSON-LD) comes in H6-2. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await requireLine(params, 'prokom')
  return {
    title: { absolute: 'Dla firm: kasy, IT, sieć, kamery, strona | PRO-KOM' },
    alternates: { canonical: '/dla-firm' },
  }
}

/** `/dla-firm` of pro-kom.eu (spec §6.3). */
export default async function HubBusinessRoute({ params }: Props) {
  const tenant = await requireLine(params, 'prokom')
  return <BusinessPage tenant={tenant} />
}
