import config from '@payload-config'
import { getPayload } from 'payload'

import { cacheQuery } from '../../cache'
import type { IndexImage } from '../../catalog/catalogIndex'
import { publicImage } from '../../media/public'
import { pickSource } from '../../media/sizes'
import { PAGE_CACHE_SECONDS } from '../../pages/data'
import { pagesTag } from '../../pages/tags'

/** The stage and the venue scene are at most ~600 px wide: × 2 for sharp screens. */
const SECTION_IMAGE_WIDTH = 1200

/**
 * Pictures a K4 section names by Media id (POPRAWKI-0311: the GoPOS photos with the screen on),
 * by id. Only this tenant's images that the public site may show (`publicImage`); an unknown or
 * foreign id is simply missing. Cached with the pages, like the section data that names them.
 */
export function getSectionImages(
  tenantId: number,
  ids: readonly number[],
): Promise<Record<number, IndexImage>> {
  const wanted = [...new Set(ids)].sort((a, b) => a - b)
  if (wanted.length === 0) return Promise.resolve({})
  return cacheQuery(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'media',
        where: { and: [{ tenant: { equals: tenantId } }, { id: { in: wanted } }] },
        limit: wanted.length,
        depth: 0,
        overrideAccess: true,
      })
      const images: Record<number, IndexImage> = {}
      for (const doc of docs) {
        const image = publicImage(doc, tenantId)
        if (image) {
          const { alt, width, height, sources } = image
          images[doc.id] = { url: pickSource(sources, SECTION_IMAGE_WIDTH), alt, width, height }
        }
      }
      return images
    },
    ['section-images', String(tenantId), wanted.join(',')],
    { tags: [pagesTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()
}
