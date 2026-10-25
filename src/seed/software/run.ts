import type { Payload, Where } from 'payload'

import miejscowosci from '../../../seed/prokomsoftware/miejscowosci.json'
import obszary from '../../../seed/prokomsoftware/obszary.json'
import { hasSameValues } from '../compare'
import { SEED_CONTEXT } from '../config'
import {
  areaData,
  cityData,
  factsData,
  missingFacts,
  removedSolutions,
  softwareSettingsData,
  solutionData,
  solutionsToImport,
} from './map'

const SOFTWARE_TENANT_SLUG = 'software'

type Counter = { created: number; updated: number; skipped: number }

/**
 * Imports the Software package (`seed/prokomsoftware/`, v20) into the local database (SW3,
 * local only, like `seed:biznes`). Idempotent: a record is found by its key in the tenant
 * (`legacyId` of a solution, `key` of an area, `slug` of a city) and written only when it
 * differs from the package, so a re-run makes no new versions.
 * - Solutions, areas, cities: every field the package provides wins over an edit in the panel.
 * - Settings (navigation, `SoftwareSettings`): written only while empty — then they belong to
 *   the panel. Facts: only the keys missing there are added.
 * - Solutions removed from the offer are never imported; one left in the database from an
 *   earlier run is only reported (removed by hand in the panel, ADR-014 v20 pkt 2).
 */
export async function seedSoftware(payload: Payload): Promise<void> {
  const log = (message: string) => payload.logger.info(`Seed (Software): ${message}`)
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const

  const {
    docs: [tenant],
  } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: SOFTWARE_TENANT_SLUG } },
    limit: 1,
    ...local,
  })
  if (!tenant) throw new Error('Seed (Software): tenant "software" missing — run `pnpm seed`.')
  const inTenant = (where: Where): Where => ({ and: [{ tenant: { equals: tenant.id } }, where] })

  const counters: Record<string, Counter> = {}
  const count = (name: string, result: boolean | 'updated') => {
    const counter = (counters[name] ??= { created: 0, updated: 0, skipped: 0 })
    counter[result === 'updated' ? 'updated' : result ? 'created' : 'skipped'] += 1
  }

  // --- solutions (drafts: the import publishes) ---
  const solutionIds = new Map<string, number>()
  for (const item of solutionsToImport()) {
    const data = solutionData(item)
    const { docs: found } = await payload.find({
      collection: 'solutions',
      where: inTenant({
        or: [{ legacyId: { equals: item.legacyId } }, { slug: { equals: item.slug } }],
      }),
      limit: 2,
      ...local,
    })
    if (found.length > 1) {
      throw new Error(`Seed (Software): solution "${item.slug}" matches ${found.length} records.`)
    }
    const [existing] = found
    if (!existing) {
      const created = await payload.create({
        collection: 'solutions',
        data: { ...data, tenant: tenant.id, _status: 'published' },
        ...local,
      })
      solutionIds.set(item.slug, created.id)
      count('solutions', true)
      continue
    }
    solutionIds.set(item.slug, existing.id)
    const same = existing._status === 'published' && hasSameValues(existing, data)
    if (!same) {
      await payload.update({
        collection: 'solutions',
        id: existing.id,
        data: { ...data, _status: 'published' },
        ...local,
      })
    }
    count('solutions', same ? false : 'updated')
  }

  for (const removed of removedSolutions()) {
    const { totalDocs } = await payload.count({
      collection: 'solutions',
      where: inTenant({
        or: [{ legacyId: { equals: removed.legacyId } }, { slug: { equals: removed.slug } }],
      }),
      overrideAccess: true,
    })
    if (totalDocs > 0) {
      payload.logger.warn(
        `Seed (Software): "${removed.name}" is removed from the offer — delete it in the panel.`,
      )
    }
  }

  const solutionRef = (slug: string) => solutionIds.get(slug)

  // --- areas and cities: plain collections, found by their key ---
  /** The stored record with this key, and whether it already has the package values. */
  async function stored(collection: 'solution-areas' | 'cities', where: Where, data: object) {
    const {
      docs: [existing],
    } = await payload.find({ collection, where: inTenant(where), limit: 1, ...local })
    return { id: existing?.id, same: Boolean(existing) && hasSameValues(existing, data) }
  }

  for (const item of obszary.items) {
    const data = areaData(item, solutionRef)
    const { id, same } = await stored('solution-areas', { key: { equals: data.key } }, data)
    if (id === undefined) {
      await payload.create({
        collection: 'solution-areas',
        data: { ...data, tenant: tenant.id },
        ...local,
      })
    } else if (!same) {
      await payload.update({ collection: 'solution-areas', id, data, ...local })
    }
    count('solution-areas', id === undefined || (same ? false : 'updated'))
  }
  for (const item of miejscowosci.items) {
    const data = cityData(item, solutionRef)
    const { id, same } = await stored('cities', { slug: { equals: data.slug } }, data)
    if (id === undefined) {
      await payload.create({ collection: 'cities', data: { ...data, tenant: tenant.id }, ...local })
    } else if (!same) {
      await payload.update({ collection: 'cities', id, data, ...local })
    }
    count('cities', id === undefined || (same ? false : 'updated'))
  }

  // --- settings ---
  const settings = softwareSettingsData()

  // Site settings are created by `pnpm seed`; navigation only while empty, facts only missing.
  const {
    docs: [siteSettings],
  } = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenant.id } },
    limit: 1,
    ...local,
  })
  if (!siteSettings) {
    log('site-settings: skipped — no settings of the tenant yet, run `pnpm seed`.')
  } else {
    const navigationMissing = !siteSettings.software?.navigation
    const facts = missingFacts(siteSettings.software?.facts, factsData())
    count('site-settings navigation', navigationMissing)
    count('site-settings facts', facts.length > 0 ? 'updated' : false)
    if (navigationMissing || facts.length > 0) {
      await payload.update({
        collection: 'site-settings',
        id: siteSettings.id,
        data: {
          software: {
            ...siteSettings.software,
            navigation: siteSettings.software?.navigation ?? settings.navigation,
            facts: [...(siteSettings.software?.facts ?? []), ...facts],
          },
        },
        ...local,
      })
    }
  }

  // One `SoftwareSettings` per tenant; every field filled only while empty. The wizard and
  // home save checks that their solutions exist in the tenant — imported above.
  const {
    docs: [softwareSettings],
  } = await payload.find({
    collection: 'software-settings',
    where: { tenant: { equals: tenant.id } },
    limit: 1,
    ...local,
  })
  const fields = {
    search: settings.search,
    wizard: settings.wizard,
    home: settings.home,
    thanks: settings.thanks,
    notFound: settings.notFound,
  }
  if (!softwareSettings) {
    await payload.create({
      collection: 'software-settings',
      data: { tenant: tenant.id, ...fields },
      ...local,
    })
    count('software-settings', true)
  } else {
    const { search, ...jsonFields } = fields
    const missing: Partial<typeof fields> = Object.fromEntries(
      Object.entries(jsonFields).filter(([key]) => {
        const value = softwareSettings[key as keyof typeof jsonFields]
        return value === null || value === undefined
      }),
    )
    // The search group always exists (`{ synonyms: [], stopWords: null, popular: null }`):
    // each of its lists is filled only while empty, so a list saved in the panel stays.
    const stored = softwareSettings.search
    const searchMissing = {
      synonyms: stored?.synonyms?.length ? stored.synonyms : search.synonyms,
      stopWords: stored?.stopWords?.length ? stored.stopWords : search.stopWords,
      popular: stored?.popular?.length ? stored.popular : search.popular,
    }
    if (!hasSameValues(stored, searchMissing)) missing.search = searchMissing
    const changed = Object.keys(missing).length > 0
    if (changed) {
      await payload.update({
        collection: 'software-settings',
        id: softwareSettings.id,
        data: missing,
        ...local,
      })
    }
    count('software-settings', changed ? 'updated' : false)
  }

  for (const [collection, { created, updated, skipped }] of Object.entries(counters)) {
    log(`${collection}: ${created} created, ${updated} updated, ${skipped} unchanged.`)
  }
}
