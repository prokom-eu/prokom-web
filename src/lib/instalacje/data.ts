import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import { log } from '@/lib/log'
import type { InstService as InstServiceDoc } from '@/payload-types'
import { navigation } from '@/sites/instalacje/dane/nawigacja'

import { buildMenu, type InstMenu, type MenuDoc } from './menu'
import { SETTINGS_DEFAULTS } from './options'

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
        // `_status`, `tenant`: a related entry in draft or of another tenant is dropped by the page.
        'inst-services': {
          key: true,
          slug: true,
          name: true,
          icon: true,
          color: true,
          menuCaption: true,
          tenant: true,
          _status: true,
        },
        'inst-objects': {
          key: true,
          slug: true,
          name: true,
          icon: true,
          color: true,
          menuCaption: true,
          tenant: true,
          _status: true,
        },
      },
      overrideAccess: true,
    })
    return docs[0] ?? null
  },
)

export type InstalacjeSiteSettings = {
  showPrices: boolean
  noPriceText: string
  warrantyMonths: number
  responseText: string
  /** WhatsApp number of the line (the panel validates it), `null` when not set. */
  whatsapp: string | null
}

/**
 * Switches and promises of the line (`InstalacjeSettings`, one per tenant). No document yet →
 * the boss's decisions as defaults: no prices, 24 months, 24 h answer (spec §2).
 */
export const getInstalacjeSettings = cache(
  async (tenantId: number): Promise<InstalacjeSiteSettings> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'instalacje-settings',
      where: { tenant: { equals: tenantId } },
      depth: 0,
      limit: 1,
      select: {
        showPrices: true,
        noPriceText: true,
        warrantyMonths: true,
        responseText: true,
        whatsapp: true,
      },
      overrideAccess: true,
    })
    const doc = docs[0]
    return {
      showPrices: doc?.showPrices ?? false,
      noPriceText: doc?.noPriceText || SETTINGS_DEFAULTS.noPriceText,
      warrantyMonths: doc?.warrantyMonths ?? SETTINGS_DEFAULTS.warrantyMonths,
      responseText: doc?.responseText || SETTINGS_DEFAULTS.responseText,
      whatsapp: doc?.whatsapp || null,
    }
  },
)

export type HomeRealization = {
  id: number
  title: string
  category: string | null
  place: string | null
  scope: string | null
}

/**
 * What the home sections need beyond the menu (I6): the number of brands of the published offer
 * (`InstServices.offer.brands`, counted once each) and up to 4 published, featured realizations
 * (published = with the client's consent, I2). This tenant only, public fields only.
 */
export const getInstalacjeHome = cache(
  async (tenantId: number): Promise<{ brands: number; realizations: HomeRealization[] }> => {
    const payload = await getPayload({ config })
    const where: Where = {
      and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }],
    }
    const [services, realizations] = await Promise.all([
      payload.find({
        collection: 'inst-services',
        where,
        draft: false,
        depth: 0,
        limit: LIMIT,
        select: { offer: true },
        overrideAccess: true,
      }),
      payload.find({
        collection: 'realizations',
        where: { and: [...(where.and ?? []), { featured: { equals: true } }] },
        draft: false,
        depth: 0,
        limit: 4,
        sort: '-year',
        select: { title: true, category: true, place: true, scope: true },
        overrideAccess: true,
      }),
    ])
    const brands = new Set(
      services.docs.flatMap((doc) => (doc.offer?.brands ?? []).map((b) => b.trim().toLowerCase())),
    )
    brands.delete('')
    return {
      brands: brands.size,
      realizations: realizations.docs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        category: doc.category ?? null,
        place: doc.place ?? null,
        scope: doc.scope ?? null,
      })),
    }
  },
)
