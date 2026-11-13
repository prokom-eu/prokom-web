import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AREA_TOWNS, areaHref } from '@/lib/instalacje/area'
import { townTitle } from '@/lib/instalacje/townPage'
import { ogImages } from '@/lib/pages/metadata'
import { getSiteSettings } from '@/lib/site/data'
import { townText } from '@/sites/instalacje/dane/miejscowosci'
import { TownPage } from '@/sites/instalacje/obszar/TownPage'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; miasto: string }> }

async function load(params: Props['params']) {
  const tenant = await requireLine(params, 'instalacje')
  const { miasto } = await params
  // Only towns with their own text (ADR-I006) — anything else is a 404, never a template page.
  const town = townText(miasto)
  const name = AREA_TOWNS.find((t) => t.slug === miasto)?.name
  return { tenant, town: town && name ? { town, name } : null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, town } = await load(params)
  if (!town) return {}
  const settings = await getSiteSettings(tenant.id)
  const path = areaHref(town.town.slug)
  const title = townTitle(town.name)
  return {
    title,
    description: town.town.description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: path,
      title,
      description: town.town.description,
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/** A town page of Instalacje (`/obszar/<slug>`, ADR-I006). */
export default async function TownRoute({ params }: Props) {
  const { tenant, town } = await load(params)
  if (!town) notFound()
  const origin = await requestOrigin()
  return <TownPage tenantId={tenant.id} town={town.town} name={town.name} origin={origin} />
}
