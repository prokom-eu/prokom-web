import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import { log } from '@/lib/log'
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
