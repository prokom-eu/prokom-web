import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { imageSources } from '../media/sizes'
import type { PublicImage } from '../media/public'
import { orderHomeBrands, type HomeBrand } from './homeBrands'

export type PublicPartner = {
  id: number
  name: string
  /** Address of the brand in the Biznes catalog; the brand page decides if it is a link. */
  slug: string | null
  url: string | null
  logo: PublicImage
}

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
      slug: doc.slug ?? null,
      url: doc.website ?? null,
      logo: { alt: `Logo ${doc.name}`, width: doc.width, height: doc.height, sources },
    })
  }
  return partners
})

/**
 * Partners of one tenant with a confirmed status ([SZEF]), logo or not — for the footer badges
 * (`partnerBadges`). Tenant filter mandatory, as above.
 */
export const getPartnerStatuses = cache(async (tenantId: number) => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'partners',
    where: {
      and: [{ tenants: { in: [tenantId] } }, { partnerStatus: { not_equals: 'none' } }],
    },
    sort: 'order',
    limit: 100,
    depth: 0,
    select: { name: true, partnerStatus: true },
    // Server-side read; only the name and the status leave here.
    overrideAccess: true,
  })
  return docs.map((doc) => ({ name: doc.name, status: doc.partnerStatus }))
})

/**
 * Brands of the home page strips (ZAOPATRZENIE §9): every partner of the tenant (logo or not) in
 * the panel's order with its status and short description, and the ids of
 * `BiznesSettings.brands.home` (the brands that lead). Tenant filter on both reads.
 */
export const getBrandStripData = cache(
  async (tenantId: number): Promise<{ brands: HomeBrand[]; homeIds: number[] }> => {
    const payload = await getPayload({ config })
    const [{ docs: settings }, { docs }] = await Promise.all([
      payload.find({
        collection: 'biznes-settings',
        where: { tenant: { equals: tenantId } },
        limit: 1,
        depth: 0,
        select: { brands: true },
        overrideAccess: true,
      }),
      payload.find({
        collection: 'partners',
        where: { tenants: { in: [tenantId] } },
        sort: 'order',
        limit: 200,
        depth: 0,
        // What a tile reads (`orderHomeBrands`); `filename` builds the file URLs of the logo.
        select: {
          name: true,
          slug: true,
          partnerStatus: true,
          filename: true,
          url: true,
          width: true,
          height: true,
          sizes: true,
          brandPage: { shortDescription: true },
        },
        // Server-side read; only the fields of `HomeBrand` leave here.
        overrideAccess: true,
      }),
    ])
    const homeIds = (settings[0]?.brands?.home ?? []).flatMap((value) =>
      typeof value === 'number' ? [value] : value ? [value.id] : [],
    )
    return {
      brands: orderHomeBrands(
        docs.map((doc) => doc.id),
        docs,
      ),
      homeIds,
    }
  },
)
