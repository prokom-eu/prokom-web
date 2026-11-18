import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { catalogTag } from '../catalog/tags'
import { cacheQuery } from '../cache'
import { PAGE_CACHE_SECONDS } from '../pages/data'

/** Slugs of `InstalacjeSettings.homeFeatured`, cached under the catalog tag (settings refresh it). */
export const getHomeFeaturedSlugs = cache((tenantId: number): Promise<string[]> =>
  cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'instalacje-settings',
        where: { tenant: { equals: tenantId } },
        limit: 1,
        depth: 1,
        select: { homeFeatured: true },
        overrideAccess: true,
      })
      return (docs[0]?.homeFeatured ?? []).flatMap((item) =>
        typeof item === 'object' && item?.slug ? [item.slug] : [],
      )
    },
    ['inst-home-featured', String(tenantId)],
    { tags: [catalogTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )(),
)
