import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { HUB_CLIENT_COUNT, replaceStrings, SOFTWARE_CLIENT_COUNT } from './data/klienci_10000'

/** The JSON texts of `HubSettings` the client count can be in. */
const HUB_FIELDS = [
  'home',
  'brands',
  'deliveries',
  'cooperation',
  'offer',
  'forBusiness',
  'forHome',
] as const

/**
 * „10 000+ klientów” instead of „100+ klientów firmowych” (boss via Krystian, 23.11.2026) — data
 * only, for databases the seeds do not write (production): the hub's JSON texts and its `trust`
 * fact (the key the counters are gated by), and the figure of Software „O firmie”. Whole strings
 * that still hold the old wording; an edit in the panel stays. Biznes changed on 14.11, the
 * Instalacje figure is in code. `down` keeps the data (the old count is no longer true).
 */

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // `seed`: no revalidation outside a Next.js request.
  const local = { req, overrideAccess: true, depth: 0, context: { seed: true } } as const
  const tenantId = async (slug: string) => {
    const { docs } = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: slug } },
      limit: 1,
      ...local,
    })
    return docs[0]?.id ?? null
  }

  const prokom = await tenantId('prokom')
  if (prokom) {
    const {
      docs: [settings],
    } = await payload.find({
      collection: 'hub-settings',
      where: { tenant: { equals: prokom } },
      limit: 1,
      ...local,
    })
    if (settings) {
      const data: Record<string, unknown> = {}
      for (const field of HUB_FIELDS) {
        const next = replaceStrings(settings[field], HUB_CLIENT_COUNT)
        if (next) data[field] = next
      }
      const trust = replaceStrings(settings.trust, HUB_CLIENT_COUNT)
      if (trust) data.trust = trust
      if (Object.keys(data).length) {
        await payload.update({ collection: 'hub-settings', id: settings.id, data, ...local })
      }
      payload.logger.info(`KLIENCI 10 000+: hub — ${Object.keys(data).join(', ') || 'bez zmian'}`)
    }
  }

  const software = await tenantId('software')
  if (software) {
    const {
      docs: [site],
    } = await payload.find({
      collection: 'site-settings',
      where: { tenant: { equals: software } },
      limit: 1,
      ...local,
    })
    const about = replaceStrings(site?.shared?.about, SOFTWARE_CLIENT_COUNT)
    if (site?.shared && about) {
      await payload.update({
        collection: 'site-settings',
        id: site.id,
        data: { shared: { ...site.shared, about } },
        ...local,
      })
    }
    payload.logger.info(
      `KLIENCI 10 000+: Software „O firmie” — ${about ? 'zmienione' : 'bez zmian'}`,
    )
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Data stays: see above.
}
