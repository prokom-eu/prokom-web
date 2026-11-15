import type { Partner } from '@/payload-types'

import { imageSources } from '../media/sizes'
import type { PublicImage } from '../media/public'

export type HomeBrand = {
  id: number
  name: string
  slug: string | null
  logo: PublicImage | null
  /** „Opis krótki” of the brand page — one line under the name. */
  description: string | null
  status: Partner['partnerStatus']
}

type PartnerDoc = Pick<Partner, 'id' | 'name' | 'slug' | 'partnerStatus' | 'width' | 'height'> & {
  brandPage?: { shortDescription?: string | null } | null
} & Parameters<typeof imageSources>[0]

/**
 * Brands of the home page (K35 7a, `BiznesSettings.brands.home`) in the panel's order; ids
 * without a readable record of this tenant are left out.
 */
export function orderHomeBrands(ids: readonly number[], docs: readonly PartnerDoc[]): HomeBrand[] {
  const byId = new Map(docs.map((doc) => [doc.id, doc]))
  return ids.flatMap((id) => {
    const doc = byId.get(id)
    if (!doc) return []
    const sources = imageSources(doc)
    const logo =
      doc.width && doc.height && sources.length > 0
        ? { alt: `Logo ${doc.name}`, width: doc.width, height: doc.height, sources }
        : null
    return [
      {
        id: doc.id,
        name: doc.name,
        slug: doc.slug ?? null,
        logo,
        description: doc.brandPage?.shortDescription?.trim() || null,
        status: doc.partnerStatus,
      },
    ]
  })
}
