import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import {
  type PublicCompanyData,
  type PublicSiteSettings,
  toPublicCompanyData,
  toPublicSiteSettings,
} from './public'

/** Shared company data (all domains). Deduplicated per request by React `cache`. */
export const getCompanyData = cache(async (): Promise<PublicCompanyData | null> => {
  const payload = await getPayload({ config })
  const doc = await payload.findGlobal({
    slug: 'company-data',
    depth: 0,
    // Server-side read of public company data; nothing beyond `PublicCompanyData` leaves here.
    overrideAccess: true,
  })
  return toPublicCompanyData(doc, new Date())
})

/**
 * Settings of exactly one tenant — the tenant filter is mandatory, so one line's settings
 * can never render on another line's domain. `null` until the settings are created.
 */
export const getSiteSettings = cache(
  async (tenantId: number): Promise<PublicSiteSettings | null> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'site-settings',
      where: { tenant: { equals: tenantId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const [doc] = docs
    return doc ? toPublicSiteSettings(doc) : null
  },
)
