import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'

import { log } from '../log'
import { PAGE_CACHE_SECONDS } from '../pages/data'
import { isIconName } from '../catalog/options'
import { factsMap } from './facts'
import type { MenuArea } from './mobileNav'
import { thanksSchema, type SoftwareThanks } from './pages'
import { buildSolutionsIndex, type SolutionsIndex } from './solutionsIndex'
import { solutionsTag } from './tags'

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

/**
 * Areas of one Software tenant for the menu sheet's tiles (name, key, icon, price) — public
 * fields only, read on the server (`SolutionAreas` is readable for the panel only). Call it only
 * for a tenant of the Software line. Deduplicated per request.
 */
export const getMenuAreas = cache(async (tenantId: number): Promise<MenuArea[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'solution-areas',
    where: { tenant: { equals: tenantId } },
    limit: 20,
    depth: 0,
    select: { name: true, key: true, icon: true, priceFrom: true, priceLabel: true },
    overrideAccess: true,
  })
  return docs.map(({ name, key, icon, priceFrom, priceLabel }) => ({
    name,
    key,
    icon: isIconName(icon) ? icon : null,
    priceFrom: priceFrom ?? null,
    priceLabel: priceLabel ?? null,
  }))
})

/** Far above the 29 solutions of the package; the catalog is one page without paging. */
const MAX_SOLUTIONS = 200

/**
 * Solutions index of one Software tenant (ADR-014 §4), cached under `tenant:<id>:solutions`
 * (hooks of `Solutions` and `SoftwareSettings`) with the pages' TTL as a safety net. Only
 * published solutions of this tenant; drafts never leave here. Call it only for a tenant of the
 * Software line (the route checks the line).
 */
export const getSolutionsIndex = (tenantId: number): Promise<SolutionsIndex> =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const read = { overrideAccess: true, depth: 0 } as const
      const inTenant = { tenant: { equals: tenantId } }
      const [solutions, settings] = await Promise.all([
        payload.find({
          collection: 'solutions',
          where: { and: [inTenant, { _status: { equals: 'published' } }] },
          draft: false,
          limit: MAX_SOLUTIONS,
          // The order of the package (the seed creates them in it); later ones at the end. The
          // serial id, not `createdAt`: two records of one seed run may share a millisecond.
          sort: 'id',
          select: {
            slug: true,
            name: true,
            category: true,
            label: true,
            tag: true,
            lead: true,
            features: true,
            forWhom: true,
            situations: true,
            industryGroups: true,
            keywords: true,
            hasLivePreview: true,
            toast: true,
            cardGradient: true,
            prices: true,
            leadTimes: true,
            priceNote: true,
            priceMonthly: true,
            sizeNames: true,
          },
          ...read,
        }),
        payload.find({
          collection: 'software-settings',
          where: inTenant,
          limit: 1,
          // `wizard` is one JSON field: the price templates come with it.
          select: { search: true, wizard: true },
          ...read,
        }),
      ])
      if (solutions.totalDocs > MAX_SOLUTIONS) {
        log.warn(
          { tenant: tenantId, total: solutions.totalDocs, limit: MAX_SOLUTIONS },
          'Solutions index cut at its limit',
        )
      }
      return buildSolutionsIndex({
        solutions: solutions.docs,
        search: settings.docs[0]?.search,
        priceDisplay: (settings.docs[0]?.wizard as { priceDisplay?: unknown } | null | undefined)
          ?.priceDisplay,
      })
    },
    ['solutions-index', String(tenantId)],
    { tags: [solutionsTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()
