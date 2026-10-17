import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { imageSources } from '../media/sizes'
import type { PublicImage } from '../media/public'

export type PublicPartner = { id: number; name: string; url: string | null; logo: PublicImage }

/**
 * Partners shown on one tenant, in their order. The tenant filter is mandatory, like for pages.
 * Deduplicated per request only (React `cache`), as the other site data (`lib/site/data`).
 */
export const getPartners = cache(async (tenantId: number): Promise<PublicPartner[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'partners',
    where: { tenants: { in: [tenantId] } },
    sort: 'order',
    limit: 100,
    depth: 0,
    // Server-side read; only the fields below leave here.
    overrideAccess: true,
  })
  const partners: PublicPartner[] = []
  for (const doc of docs) {
    const sources = imageSources(doc)
    if (!doc.width || !doc.height || sources.length === 0) continue
    partners.push({
      id: doc.id,
      name: doc.name,
      url: doc.website ?? null,
      logo: { alt: `Logo ${doc.name}`, width: doc.width, height: doc.height, sources },
    })
  }
  return partners
})
