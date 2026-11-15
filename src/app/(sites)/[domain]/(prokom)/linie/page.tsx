import type { Metadata } from 'next'

import { hubOgImage } from '@/lib/prokom/data'
import { hubPageMetadata } from '@/lib/prokom/seo'

import { OfferPage } from '@/sites/prokom/linie/OfferPage'

import { requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Spec §4: title, description (140–160 characters), canonical and Open Graph (H8). */
export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const tenant = await requireLine(params, 'prokom')
  return hubPageMetadata(
    '/linie',
    'Linie PRO-KOM — co gdzie załatwisz',
    await hubOgImage(tenant.id),
  )
}

/** `/linie?q=&dla=&linia=&u=` of pro-kom.eu (spec §6.2): the catalog state comes from the address. */
export default async function HubOfferRoute({ params, searchParams }: Props) {
  const tenant = await requireLine(params, 'prokom')
  return <OfferPage tenant={tenant} params={await searchParams} />
}
