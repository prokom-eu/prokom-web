import type { Metadata } from 'next'

import { OfferPage } from '@/sites/prokom/linie/OfferPage'

import { requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Spec §4: title of `/linie`; the full SEO (description, canonical, JSON-LD) comes in H6-2. */
export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  await requireLine(params, 'prokom')
  return { title: { absolute: 'Linie PRO-KOM — co gdzie załatwisz' } }
}

/** `/linie?q=&dla=&linia=&u=` of pro-kom.eu (spec §6.2): the catalog state comes from the address. */
export default async function HubOfferRoute({ params, searchParams }: Props) {
  const tenant = await requireLine(params, 'prokom')
  return <OfferPage tenant={tenant} params={await searchParams} />
}
