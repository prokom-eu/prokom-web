import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'

import { log } from '../log'
import { PAGE_CACHE_SECONDS } from '../pages/data'
import { isIconName } from '../catalog/options'
import { factsMap } from './facts'
import { homeSchema, type SoftwareHome } from './home'
import { type HomeArea, homeAreas } from './homeAreas'
import type { MenuArea } from './mobileNav'
import { thanksSchema, type SoftwareThanks } from './pages'
import { buildSolutionsIndex, type SolutionsIndex } from './solutionsIndex'
import { solutionsTag } from './tags'
import type { SoftwareWizard } from './wizard'
import { readSoftwareWizard } from './wizardRules'

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
            priceFrom: true,
            leadTime: true,
            priceNote: true,
            priceMonthly: true,
            thumbnail: true,
            levels: true,
            featured: true,
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

/**
 * Valid wizard rules of one Software tenant (`SoftwareSettings.wizard`), or `null`; cached under
 * `tenant:<id>:solutions` — the hooks of `SoftwareSettings` revalidate it with the index.
 */
export const getSoftwareWizard = (tenantId: number): Promise<SoftwareWizard | null> =>
  unstable_cache(
    async () => readSoftwareWizard(await getPayload({ config }), tenantId),
    // The shape of the rules is part of the key: a schema change never serves a cached old shape.
    ['software-wizard', 'sw7', String(tenantId)],
    { tags: [solutionsTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/**
 * Texts of the start page sections of one Software tenant (`SoftwareSettings.home`) — `null`
 * until saved or when they no longer match the schema (the sections that need them are skipped).
 * Cached under `tenant:<id>:solutions`: the hooks of `SoftwareSettings` revalidate it.
 */
export const getSoftwareHome = (tenantId: number): Promise<SoftwareHome | null> =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'software-settings',
        where: { tenant: { equals: tenantId } },
        limit: 1,
        depth: 0,
        select: { home: true },
        overrideAccess: true,
      })
      const parsed = homeSchema.safeParse(docs[0]?.home)
      if (!parsed.success && docs[0]?.home) {
        log.warn({ tenant: tenantId }, 'Software home texts do not match the schema')
      }
      return parsed.success ? parsed.data : null
    },
    // The shape of the texts is part of the key: a schema change never serves a cached old shape.
    ['software-home', 'sw5', String(tenantId)],
    { tags: [solutionsTag(tenantId)], revalidate: PAGE_CACHE_SECONDS },
  )()

/**
 * The areas of the start page section „Oferta” of one Software tenant, in panel order; chips link
 * only to solutions published in this tenant. Read on the server (`SolutionAreas` is readable
 * for the panel only). Deduplicated per request.
 */
export const getHomeAreas = cache(async (tenantId: number): Promise<HomeArea[]> => {
  const payload = await getPayload({ config })
  const inTenant = { tenant: { equals: tenantId } }
  const [areas, solutions] = await Promise.all([
    payload.find({
      collection: 'solution-areas',
      where: inTenant,
      limit: 20,
      depth: 0,
      sort: 'order',
      select: {
        key: true,
        name: true,
        icon: true,
        short: true,
        description: true,
        gain: true,
        countLabel: true,
        priceFrom: true,
        priceLabel: true,
        chips: true,
        cta: true,
      },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'solutions',
      where: { and: [inTenant, { _status: { equals: 'published' } }] },
      draft: false,
      limit: MAX_SOLUTIONS,
      depth: 0,
      select: { slug: true },
      overrideAccess: true,
    }),
  ])
  const slugs = new Map(solutions.docs.map((doc) => [doc.id, doc.slug]))
  return homeAreas(areas.docs, slugs)
})
