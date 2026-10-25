import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { factsMap } from './facts'
import { thanksSchema, type SoftwareThanks } from './pages'

/**
 * Facts [SZEF] of one Software tenant (`SiteSettings.software.facts`) — the tenant filter is
 * mandatory, so facts of one site never fill texts of another. Deduplicated per request.
 * Call it only for a tenant of the Software line (after `requireLine(…, 'software')`): the group
 * is not validated on other lines (its `admin.condition` is false there), so their data is not
 * to be trusted.
 */
export const getSoftwareFacts = cache(async (tenantId: number): Promise<Record<string, string>> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    depth: 0,
    select: { software: { facts: true } },
    overrideAccess: true,
  })
  return factsMap(docs[0]?.software?.facts)
})

/**
 * Texts of `/dziekujemy` of one tenant (`SoftwareSettings.thanks`) — `null` until saved, or when
 * they no longer match the schema (the page then answers 404 instead of rendering half of it).
 */
export async function getSoftwareThanks(tenantId: number): Promise<SoftwareThanks | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'software-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    depth: 0,
    select: { thanks: true },
    overrideAccess: true,
  })
  const parsed = thanksSchema.safeParse(docs[0]?.thanks)
  return parsed.success ? parsed.data : null
}
