import type { Payload, Where } from 'payload'

import type { SiteSetting } from '../../payload-types'
import { hasSameValues } from '../compare'
import { SEED_CONTEXT } from '../config'
import { PROKOM_SITE } from '../shared/prokom'
import { seedSharedData } from '../shared/run'
import { hubHelp, hubPlans, hubServices, hubTools, hubTrust, mergeTrust } from './map'

export const PROKOM_TENANT_SLUG = 'prokom'

type Result = 'created' | 'updated' | 'skipped'
type Counter = Record<Result, number>

/** Only over the sample of `pnpm seed` or an empty field — a value typed in the panel stays. */
export function siteContactUpdate(
  settings: Pick<SiteSetting, 'phone' | 'email' | 'footer'>,
): Partial<SiteSetting> | null {
  const update: Partial<SiteSetting> = {}
  if (!settings.phone || settings.phone.startsWith('+48 000 000')) update.phone = PROKOM_SITE.phone
  if (!settings.email || settings.email.endsWith('@example.test')) update.email = PROKOM_SITE.email
  const text = settings.footer?.text
  if (!text || text.endsWith('dane przykładowe.')) {
    update.footer = { ...settings.footer, text: PROKOM_SITE.footer.text }
  }
  return Object.keys(update).length > 0 ? update : null
}

/**
 * Imports the hub package (`seed/prokomeu/strony/*.json`) into the local database (H1, local only,
 * like `seed:biznes`). Idempotent: a record is found by its key in the tenant (`key` of a service,
 * tool or plan + its type, `slug` of a help situation) and written only when the package differs,
 * so a re-run makes no new versions. Fields of the package win over an edit in the panel; fields it
 * does not set (addresses of the lines' subpages, deep links of tools) stay as edited. Local only:
 * a record that differs is written as published, so a draft left in the panel gets published too.
 */
export async function seedProkom(payload: Payload): Promise<void> {
  const log = (message: string) => payload.logger.info(`Seed (pro-kom.eu): ${message}`)
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const

  const {
    docs: [tenant],
  } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: PROKOM_TENANT_SLUG } },
    limit: 1,
    ...local,
  })
  if (!tenant) throw new Error('Seed (pro-kom.eu): tenant "prokom" missing — run `pnpm seed`.')
  const tenantId = tenant.id
  const inTenant = (where: Where): Where => ({ and: [{ tenant: { equals: tenantId } }, where] })

  const counters: Record<string, Counter> = {}
  const count = (name: string, result: Result) => {
    const counter = (counters[name] ??= { created: 0, updated: 0, skipped: 0 })
    counter[result] += 1
  }

  // --- the hub's contact in its `SiteSettings` (ADR-H002 §1) ---
  const {
    docs: [siteSettings],
  } = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    ...local,
  })
  const siteUpdate = siteSettings ? siteContactUpdate(siteSettings) : null
  if (siteSettings && siteUpdate) {
    await payload.update({
      collection: 'site-settings',
      id: siteSettings.id,
      data: siteUpdate,
      ...local,
    })
  }
  count('site-settings contact', siteUpdate ? 'updated' : 'skipped')

  // --- HubSettings: created with the v1.1 pages off; facts merged by value (panel ones stay) ---
  const {
    docs: [hubSettings],
  } = await payload.find({
    collection: 'hub-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    ...local,
  })
  const trust = mergeTrust(hubSettings?.trust, hubTrust())
  if (!hubSettings) {
    await payload.create({
      collection: 'hub-settings',
      data: { tenant: tenantId, trust },
      ...local,
    })
    count('hub-settings', 'created')
  } else if (hasSameValues(hubSettings.trust, trust)) {
    count('hub-settings', 'skipped')
  } else {
    await payload.update({
      collection: 'hub-settings',
      id: hubSettings.id,
      data: { trust },
      ...local,
    })
    count('hub-settings', 'updated')
  }

  // --- services: first without relations, then the relations by key ---
  const serviceIds = new Map<string, number>()
  for (const { relatedKeys: _relatedKeys, ...data } of hubServices()) {
    const {
      docs: [stored],
    } = await payload.find({
      collection: 'hub-services',
      where: inTenant({ key: { equals: data.key } }),
      limit: 1,
      draft: true,
      ...local,
    })
    if (!stored) {
      const created = await payload.create({
        collection: 'hub-services',
        data: { ...data, tenant: tenantId },
        ...local,
      })
      serviceIds.set(data.key, created.id)
      count('hub-services', 'created')
    } else if (hasSameValues(stored, data)) {
      serviceIds.set(data.key, stored.id)
      count('hub-services', 'skipped')
    } else {
      await payload.update({ collection: 'hub-services', id: stored.id, data, ...local })
      serviceIds.set(data.key, stored.id)
      count('hub-services', 'updated')
    }
  }
  for (const { key, relatedKeys } of hubServices()) {
    const id = serviceIds.get(key)
    const related = relatedKeys.flatMap((other) => serviceIds.get(other) ?? [])
    if (id === undefined) continue
    const stored = await payload.findByID({ collection: 'hub-services', id, draft: true, ...local })
    if (hasSameValues(stored.related, related)) {
      count('hub-services related', 'skipped')
      continue
    }
    await payload.update({
      collection: 'hub-services',
      id,
      data: { related, _status: 'published' },
      ...local,
    })
    count('hub-services related', 'updated')
  }

  // --- tools, help, plans: found by key / slug ---
  for (const data of hubTools()) {
    await upsert('hub-tools', inTenant({ key: { equals: data.key } }), data)
  }
  for (const data of hubHelp()) {
    await upsert('hub-help', inTenant({ slug: { equals: data.slug } }), data)
  }
  for (const data of hubPlans()) {
    await upsert(
      'hub-plans',
      inTenant({ and: [{ type: { equals: data.type } }, { key: { equals: data.key } }] }),
      data,
    )
  }

  await seedSharedData(payload, 'prokom', tenantId, (name, result) =>
    count(name, result === 'updated' ? 'updated' : 'skipped'),
  )

  for (const [name, { created, updated, skipped }] of Object.entries(counters)) {
    log(`${name}: ${created} created, ${updated} updated, ${skipped} unchanged`)
  }

  async function upsert<S extends 'hub-tools' | 'hub-help' | 'hub-plans'>(
    collection: S,
    where: Where,
    data: object,
  ): Promise<void> {
    const {
      docs: [stored],
    } = await payload.find({ collection, where, limit: 1, draft: true, ...local })
    if (!stored) {
      await payload.create({ collection, data: { ...data, tenant: tenantId } as never, ...local })
      count(collection, 'created')
    } else if (hasSameValues(stored, data)) {
      count(collection, 'skipped')
    } else {
      await payload.update({ collection, id: stored.id, data: data as never, ...local })
      count(collection, 'updated')
    }
  }
}
