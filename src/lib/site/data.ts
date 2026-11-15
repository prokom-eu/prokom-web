import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { CompanyDatum, SiteSetting } from '@/payload-types'

import {
  type PublicCompanyData,
  type PublicSiteSettings,
  toPublicCompanyData,
  toPublicSiteSettings,
} from './public'
import { isLine, type Line } from '../tenant/lines'

/**
 * The stored `CompanyData` document. Deduplicated per request by React `cache`, so
 * `getCompanyData` and `getSharedData` share one query. Server-side only — callers project it.
 */
export const getCompanyDoc = cache(async (): Promise<CompanyDatum> => {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'company-data',
    depth: 0,
    // Server-side read of public company data; callers keep only their public projection.
    overrideAccess: true,
  })
})

/** Shared company data (all domains). */
export const getCompanyData = cache(async (): Promise<PublicCompanyData | null> =>
  toPublicCompanyData(await getCompanyDoc(), new Date()),
)

/**
 * The stored settings of exactly one tenant and that tenant's line — the tenant filter is
 * mandatory, so one line's settings can never render on another line's domain. `null` until the
 * settings are created.
 */
export const getSiteSettingsDoc = cache(
  async (tenantId: number): Promise<{ doc: SiteSetting; line: Line | null } | null> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'site-settings',
      where: { tenant: { equals: tenantId } },
      limit: 1,
      // 1: the OG image comes populated (`toPublicSiteSettings` keeps only a public one),
      // and so does the tenant, whose line decides what the site may show.
      depth: 1,
      overrideAccess: true,
    })
    const [doc] = docs
    if (!doc) return null
    const line = typeof doc.tenant === 'object' && isLine(doc.tenant?.line) ? doc.tenant.line : null
    return { doc, line }
  },
)

/** Settings of one tenant, as the public site shows them. */
export const getSiteSettings = cache(
  async (tenantId: number): Promise<PublicSiteSettings | null> => {
    const found = await getSiteSettingsDoc(tenantId)
    return found ? toPublicSiteSettings(found.doc, found.line) : null
  },
)
