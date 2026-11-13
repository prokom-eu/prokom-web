import type { Metadata } from 'next'

import { AREA_PATH } from '@/lib/instalacje/area'
import { ogImages } from '@/lib/pages/metadata'
import { getSiteSettings } from '@/lib/site/data'
import { townPage } from '@/sites/instalacje/dane/miejscowosci'
import { AreaList } from '@/sites/instalacje/obszar/AreaList'

import { requestOrigin, requireLine } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'instalacje')
  const settings = await getSiteSettings(tenant.id)
  const { seoTitle: title, description } = townPage.list
  return {
    title,
    description,
    alternates: { canonical: AREA_PATH },
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: AREA_PATH,
      title,
      description,
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/** The towns of Instalacje (`/obszar`, ADR-I006): the hub of the town pages. */
export default async function AreaRoute({ params }: Props) {
  const tenant = await requireLine(params, 'instalacje')
  const origin = await requestOrigin()
  return <AreaList tenantId={tenant.id} origin={origin} />
}
