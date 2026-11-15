import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getInstalacjeObject } from '@/lib/instalacje/data'
import { objectHref } from '@/lib/instalacje/menu'
import { ogImages } from '@/lib/pages/metadata'
import { getSiteSettings } from '@/lib/site/data'
import { type BuiltObjectKey, OBJECT_SCENES } from '@/sites/instalacje/dane/obiekty'
import { ObjectPage } from '@/sites/instalacje/obiekty/ObjectPage'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; obiekt: string }> }

const isBuilt = (key: string): key is BuiltObjectKey => key in OBJECT_SCENES

async function load(params: Props['params']) {
  const tenant = await requireLine(params, 'instalacje')
  const { obiekt } = await params
  const object = await getInstalacjeObject(tenant.id, obiekt)
  // An object without its drawing in code (a key added later) is a 404 too.
  return { tenant, object: object && isBuilt(object.key) ? object : null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, object } = await load(params)
  if (!object) return {}
  const settings = await getSiteSettings(tenant.id)
  const path = objectHref(object.slug)
  const title = object.seo?.title?.trim() || object.name
  const description = object.seo?.description || object.hero?.lead || undefined
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: path,
      title,
      description,
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * Object page „Dla kogo” (`/dla-kogo/<slug>`, ADR-I002 §0): a published object of this tenant
 * with its cross-section, otherwise 404. Dynamic like the other pages of the site (the domain is
 * a segment, so there is nothing to pre-render per object).
 */
export default async function ObjectRoute({ params }: Props) {
  const { tenant, object } = await load(params)
  if (!object || !isBuilt(object.key)) notFound()
  const origin = await requestOrigin()
  return <ObjectPage tenantId={tenant.id} object={object} sceneKey={object.key} origin={origin} />
}
