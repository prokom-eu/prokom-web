import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import { log } from '@/lib/log'
import type { InstService as InstServiceDoc } from '@/payload-types'
import { navigation } from '@/sites/instalacje/dane/nawigacja'

import { buildMenu, type InstMenu, type MenuDoc } from './menu'

/** Far above the 10 services, 12 objects and 76 solutions of the package. */
const LIMIT = 500

/**
 * Menus of one Instalacje tenant (header, mega menu, sheet, footer). The line's collections are
 * readable for the panel only, so this reads on the server — published entries of this tenant
 * only, public fields only. Call it only for a tenant of the Instalacje line. Deduplicated per
 * request.
 */
export const getInstalacjeMenu = cache(async (tenantId: number): Promise<InstMenu> => {
  const payload = await getPayload({ config })
  const where: Where = {
    and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }],
  }
  const published = { where, draft: false, depth: 0, limit: LIMIT, overrideAccess: true } as const
  const fields = {
    key: true,
    slug: true,
    name: true,
    icon: true,
    color: true,
    menuCaption: true,
  } as const
  const [services, objects, solutions] = await Promise.all([
    payload.find({ collection: 'inst-services', ...published, select: fields }),
    payload.find({ collection: 'inst-objects', ...published, select: fields }),
    payload.find({ collection: 'inst-solutions', ...published, select: { service: true } }),
  ])
  const areas = new Set(
    solutions.docs.map(({ service }) => (typeof service === 'object' ? service?.id : service)),
  )
  const toDoc = (doc: MenuDoc): MenuDoc => ({
    key: doc.key,
    slug: doc.slug ?? null,
    name: doc.name,
    icon: doc.icon ?? null,
    color: doc.color ?? null,
    menuCaption: doc.menuCaption ?? null,
  })
  const { menu, missing } = buildMenu(
    navigation,
    services.docs.map(toDoc),
    objects.docs.map(toDoc),
    { areas: areas.size, solutions: solutions.docs.length },
  )
  if (missing.length > 0) {
    log.warn({ tenant: tenantId, missing }, 'Instalacje menu keys without a published entry')
  }
  return menu
})

/**
 * One published service of this tenant for its page (`instService` block), relations to other
 * services and objects populated with their public fields. `null` → the block renders nothing.
 * Deduplicated per request; fresh on every request like the menu.
 */
export const getInstalacjeService = cache(
  async (tenantId: number, serviceId: number): Promise<InstServiceDoc | null> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'inst-services',
      where: {
        and: [
          { id: { equals: serviceId } },
          { tenant: { equals: tenantId } },
          { _status: { equals: 'published' } },
        ],
      },
      draft: false,
      depth: 1,
      limit: 1,
      populate: {
        // `_status`: a related entry still in draft is dropped by the page.
        'inst-services': {
          key: true,
          slug: true,
          name: true,
          icon: true,
          color: true,
          menuCaption: true,
          _status: true,
        },
        'inst-objects': {
          key: true,
          slug: true,
          name: true,
          icon: true,
          color: true,
          _status: true,
        },
      },
      overrideAccess: true,
    })
    return docs[0] ?? null
  },
)
