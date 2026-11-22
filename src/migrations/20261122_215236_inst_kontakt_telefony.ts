import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { instContactUpdate } from './data/inst_kontakt_telefony'

/**
 * Contact of Instalacje (Krystian 22.11.2026) — data only, for databases the seeds do not write
 * (production): the main number without „+48”, the second number 501 046 249 and no „Zgłoś
 * awarię” link in the brand bar. Through the Local API, changing only a field that still holds
 * the old value — a second run (or a panel edit) changes nothing. `down` keeps the data.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // `seed`: no revalidation outside a Next.js request.
  const local = { req, overrideAccess: true, depth: 0, context: { seed: true } } as const
  const {
    docs: [tenant],
  } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: 'instalacje' } },
    limit: 1,
    ...local,
  })
  if (!tenant) return
  const {
    docs: [site],
  } = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenant.id } },
    limit: 1,
    ...local,
  })
  if (!site) return
  const update = instContactUpdate(site)
  if (update) {
    await payload.update({ collection: 'site-settings', id: site.id, data: update, ...local })
  }
  payload.logger.info(
    `Instalacje kontakt: ${update ? Object.keys(update).join(', ') : 'bez zmian'}`,
  )
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Data stays: the numbers are valid without this migration and the panel may have edited them.
}
